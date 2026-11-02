import React, { useState } from 'react';
import { Features, infer, Prediction } from '../utils/modelInference';
export function ModelLab() {
  const [values, setValues] = useState('0,55,1,0,2');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState('');
  return <main className="min-h-screen bg-slate-950 text-white p-8 space-y-4">
    <h1>Model parite laboratuvarı</h1><p>Aynı ONNX, aynı sözleşme, Python oracle ile karşılaştırma.</p>
    <label>Özellik sırası: seviye, süre, önceki yanlış, ipucu, sahne
      <input data-cy="features" className="block bg-slate-800 p-3 w-full" value={values} onChange={event => setValues(event.target.value)} />
    </label>
    <button data-cy="infer" className="bg-indigo-600 p-3" onClick={async () => {
      setPrediction(null); setError('');
      try {
        const input = values.split(',').map(Number);
        if (input.length !== 5) throw new Error('5 ozellik gerekli.');
        setPrediction(await infer(input as Features));
      } catch (reason) { setError(String(reason)); }
    }}>ONNX çalıştır</button>
    {prediction && <div><output data-cy="p">{prediction.p.toPrecision(12)}</output>
      <p data-cy="decision">{prediction.needed ? '1' : '0'}</p><p data-cy="model-sha">{prediction.sha}</p></div>}
    {error && <p role="alert" data-cy="model-error">{error}</p>}
  </main>;
}
