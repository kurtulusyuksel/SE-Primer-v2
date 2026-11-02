import * as ort from 'onnxruntime-web/wasm';

export const FEATURE_NAMES = ['seviye', 'karar_suresi_sn', 'onceki_yanlis_sayisi', 'ipucu_sayisi', 'sahne_no'] as const;
export type Features = [number, number, number, number, number];
export interface Prediction { p: number; needed: boolean; threshold: number; status: string; sha: string; }
interface Config {
  schema_version: number; features: string[]; ranges: number[][]; integer_features: number[];
  decision_threshold: number; status: string; model_sha256: string;
  input: { name: string; dtype: string; shape: (number | null)[] };
  output: { name: string; positive_class_index: number };
}
export interface Release { source: 'local' | 'huggingface'; mode: 'off' | 'shadow' | 'canary' | 'active'; percentage: number; repo_id: string | null; revision: string | null; }
const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = asset('ort/');
let loaded: Promise<{ config: Config; session: ort.InferenceSession; release: Release }> | undefined;
async function getResource(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Model kaynagi yuklenemedi: ${response.status}`);
  return response;
}
async function load() {
  const release: Release = await (await getResource(asset('model-release.json'))).json();
  if (!['off', 'shadow', 'canary', 'active'].includes(release.mode) ||
      !Number.isFinite(release.percentage) || release.percentage < 0 || release.percentage > 100) {
    throw new Error('Gecersiz yayin sozlesmesi.');
  }
  let base = asset('model');
  if (release.source === 'huggingface') {
    if (!release.repo_id || !/^[\w.-]+\/[\w.-]+$/.test(release.repo_id) || !/^[a-f0-9]{40}$/.test(release.revision ?? '')) {
      throw new Error('Hugging Face modeli 40 karakter commit SHA ile sabitlenmeli.');
    }
    base = `https://huggingface.co/${release.repo_id}/resolve/${release.revision}`;
  } else if (release.source !== 'local') throw new Error('Gecersiz model kaynagi.');
  const config: Config = await (await getResource(`${base}/config.json`)).json();
  if (config.schema_version !== 1 || JSON.stringify(config.features) !== JSON.stringify(FEATURE_NAMES) ||
      config.input?.dtype !== 'float32' || JSON.stringify(config.input.shape) !== '[null,5]' ||
      config.output?.positive_class_index !== 1 || !(config.decision_threshold > 0 && config.decision_threshold < 1) ||
      config.ranges?.length !== 5 || !Array.isArray(config.integer_features)) {
    throw new Error('Model ozellik sirasi veya tensor sozlesmesi uyusmuyor.');
  }
  const bytes = await (await getResource(`${base}/model.onnx`)).arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  const sha = Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('');
  if (sha !== config.model_sha256) throw new Error('Model SHA256 sozlesmeyle uyusmuyor.');
  const session = await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] });
  return { config, session, release };
}
export function interventionAllowed(release: Release, sessionId: string): boolean {
  if (release.mode === 'off' || release.mode === 'shadow') return false;
  if (release.mode === 'active') return true;
  let hash = 2166136261;
  for (const char of sessionId) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0) % 100 < release.percentage;
}
export async function infer(features: Features): Promise<Prediction & { release: Release }> {
  loaded ??= load().catch(error => { loaded = undefined; throw error; });
  const { config, session, release } = await loaded;
  features.forEach((value, index) => {
    const [min, max] = config.ranges[index];
    if (!Number.isFinite(value) || value < min || value > max ||
        (config.integer_features.includes(index) && !Number.isInteger(value))) throw new Error('Gecersiz model girdisi.');
  });
  const result = await session.run({ [config.input.name]: new ort.Tensor('float32', Float32Array.from(features), [1, 5]) });
  const p = Number(result[config.output.name]?.data[config.output.positive_class_index]);
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new Error('Gecersiz model olasiligi.');
  return { p, needed: p >= config.decision_threshold, threshold: config.decision_threshold,
    status: config.status, sha: config.model_sha256, release };
}
