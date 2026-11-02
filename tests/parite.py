"""Python ONNX oracle. --check mevcut referansların değişmediğini doğrular."""
import argparse
import hashlib
import json
from pathlib import Path
import numpy as np
import onnxruntime as ort

ROOT = Path(__file__).resolve().parents[1]

def references():
    config = json.loads((ROOT / 'model/config.json').read_text(encoding='utf-8'))
    blob = (ROOT / 'model/model.onnx').read_bytes()
    if hashlib.sha256(blob).hexdigest() != config['model_sha256']:
        raise ValueError('Model/config SHA256 uyusmuyor.')
    inputs = [[0,55,1,0,2], [1,12,0,0,1], [0,40,0,2,2], [1,80,2,1,3], [0,5,0,0,1]]
    session = ort.InferenceSession(blob, providers=['CPUExecutionProvider'])
    probabilities = session.run([config['output']['name']],
        {'features': np.array(inputs, dtype=np.float32)})[0][:,1]
    return {'model_sha256': config['model_sha256'], 'tolerance': config['tolerance'],
        'cases': [{'features': values, 'p': float(p), 'ipucu_gerekli': int(p >= config['decision_threshold'])}
                  for values, p in zip(inputs, probabilities)]}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = references()
    path = ROOT / 'tests/parite.json'
    if args.check:
        previous = json.loads(path.read_text(encoding='utf-8'))
        assert previous['model_sha256'] == result['model_sha256']
        for old, new in zip(previous['cases'], result['cases'], strict=True):
            assert old['features'] == new['features']
            assert abs(old['p'] - new['p']) < result['tolerance']
        print('5 Python ONNX oracle referansi dogrulandi.')
    else:
        path.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
        print('tests/parite.json uretildi.')
