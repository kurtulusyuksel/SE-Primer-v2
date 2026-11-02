import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
mkdirSync('public/ort', { recursive: true });
for (const name of readdirSync('node_modules/onnxruntime-web/dist')) {
  if (['ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm'].includes(name)) {
    copyFileSync(`node_modules/onnxruntime-web/dist/${name}`, `public/ort/${name}`);
  }
}
mkdirSync('public/model', { recursive: true });
for (const name of ['config.json', 'model.onnx']) {
  if (existsSync(`model/${name}`)) copyFileSync(`model/${name}`, `public/model/${name}`);
}
console.log('Yerel WASM ve mevcut model public/ altina eslendi.');
