"""Sözleşme -> veri doğrulama -> oturum bazlı holdout -> eval kapısı -> ONNX."""
import argparse
import csv
import hashlib
import importlib.metadata
import json
from pathlib import Path

import numpy as np
import onnxruntime as ort
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

ROOT = Path(__file__).resolve().parent
CONTRACT = json.loads((ROOT / 'model/contract.json').read_text(encoding='utf-8'))
REFERENCES = [[0, 55, 1, 0, 2], [1, 12, 0, 0, 1], [0, 40, 0, 2, 2],
              [1, 80, 2, 1, 3], [0, 5, 0, 0, 1]]

def load_data(path, demo):
    with path.open(encoding='utf-8-sig', newline='') as stream:
        rows = list(csv.DictReader(stream))
    if not rows:
        raise ValueError('Gercek veri yok. Veri toplama modunu kullanin; demo icin --demo.')
    sessions = {}
    matrix, labels, groups = [], [], []
    for row in rows:
        if row['kaynak'] != ('sentetik' if demo else 'gercek'):
            raise ValueError('Veri kaynagi modla uyusmuyor; gercek/sentetik karistirilmaz.')
        session_id = row['oturum_id'].strip()
        if not session_id:
            raise ValueError('Bos oturum kimligi.')
        values = [float(row[name]) for name in CONTRACT['features']]
        for index, (value, limits) in enumerate(zip(values, CONTRACT['ranges'])):
            if not np.isfinite(value) or not limits[0] <= value <= limits[1]:
                raise ValueError(f'Gecersiz ozellik: {CONTRACT["features"][index]}')
            if index in CONTRACT['integer_features'] and not value.is_integer():
                raise ValueError('Tamsayi ozellik kesirli olamaz.')
        scene = int(values[4])
        scenes = sessions.setdefault(session_id, set())
        if scene in scenes:
            raise ValueError('Ayni oturum/sahne birden fazla kaydedilmis.')
        scenes.add(scene)
        if row['ipucu_gerekli'] not in ('0', '1'):
            raise ValueError('Etiket 0 veya 1 olmali.')
        matrix.append(values)
        labels.append(int(row['ipucu_gerekli']))
        groups.append(session_id)
    if len(sessions) < 15 or any(scenes != {1, 2, 3} for scenes in sessions.values()):
        raise ValueError('En az 15 tamamlanmis oturum gerekli; her oturum 3 farkli sahne icermeli.')
    return np.array(matrix, dtype=np.float32), np.array(labels), np.array(groups)

def train(data=None, demo=False, output=None):
    path = Path(data) if data else ROOT / ('data/sentetik.csv' if demo else 'data/oturumlar.csv')
    x, y, groups = load_data(path, demo)
    split = GroupShuffleSplit(n_splits=1, test_size=.25, random_state=CONTRACT['seed'])
    train_idx, test_idx = next(split.split(x, y, groups))
    if set(y[train_idx]) != {0, 1} or set(y[test_idx]) != {0, 1}:
        raise ValueError('Egitim ve testte iki sinif da bulunmali; daha cesitli veri toplayin.')
    model = make_pipeline(StandardScaler(), LogisticRegression(
        random_state=CONTRACT['seed'], solver='liblinear', max_iter=1000))
    model.fit(x[train_idx], y[train_idx])
    p = model.predict_proba(x[test_idx])[:, 1]
    accuracy = float(accuracy_score(y[test_idx], p >= CONTRACT['decision_threshold']))
    print(f'Accuracy (p >= 0.60): {accuracy:.6f}; hedef >= {CONTRACT["acceptance_accuracy"]}')
    if accuracy < CONTRACT['acceptance_accuracy']:
        raise ValueError('EVAL KAPISI REDDETTI: yeni model/artefakt yazilmadi.')
    classifier = model.steps[-1][1]
    onnx_model = convert_sklearn(model, name='PrimerKrizFreniV2', initial_types=[('features', FloatTensorType([None, 5]))],
        options={id(classifier): {'zipmap': False}}, target_opset=17)
    blob = onnx_model.SerializeToString()
    runtime = ort.InferenceSession(blob, providers=['CPUExecutionProvider'])
    # Eğitim + holdout + kabul örnekleri: dönüştürme kaybı her noktada kontrol edilir.
    check = np.concatenate([x, np.array(REFERENCES, dtype=np.float32)])
    output_name = runtime.get_outputs()[1].name
    actual = runtime.run([output_name], {'features': check})[0][:, 1]
    error = float(np.max(np.abs(actual - model.predict_proba(check)[:, 1])))
    if error >= CONTRACT['tolerance']:
        raise ValueError(f'ONNX parite kapisi reddetti: {error}')
    # Spec'te tanımlanan ilk 3 kabul örneği de yayın kapısıdır.
    expected = [1, 0, 1]
    accepted = list((actual[-5:-2] >= CONTRACT['decision_threshold']).astype(int))
    if accepted != expected:
        raise ValueError(f'Spec kabul ornekleri basarisiz: {accepted}')
    config = {**CONTRACT, 'model_version': '2.0.0',
        'status': 'synthetic-demo' if demo else 'real-data-candidate',
        'input': {'name': 'features', 'dtype': 'float32', 'shape': [None, 5]},
        'output': {'name': output_name, 'positive_class_index': 1},
        'model_sha256': hashlib.sha256(blob).hexdigest(),
        'data_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'metrics': {'accuracy': accuracy, 'onnx_max_abs_error': error,
            'confusion_matrix': confusion_matrix(y[test_idx], p >= CONTRACT['decision_threshold']).tolist(),
            'train_sessions': len(set(groups[train_idx])), 'test_sessions': len(set(groups[test_idx])),
            'train_rows': len(train_idx), 'test_rows': len(test_idx),
            'real_sessions': 0 if demo else len(set(groups))},
        'split': 'GroupShuffleSplit: oturum_id, holdout=0.25; test oturumlari egitimde yok',
        'dependencies': {name: importlib.metadata.version(name) for name in
            ['numpy', 'scikit-learn', 'skl2onnx', 'onnx', 'onnxruntime']}}
    # Bütün kapılar geçmeden diske hiçbir aday artefakt yazılmaz.
    destination = Path(output) if output else ROOT / 'model'
    destination.mkdir(parents=True, exist_ok=True)
    (destination / 'model.onnx').write_bytes(blob)
    (destination / 'config.json').write_text(json.dumps(config, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps(config['metrics'], indent=2))
    print(f'ONNX yazildi: {destination}; durum={config["status"]}')
    return config

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--demo', action='store_true', help='Yalniz acikca sentetik demo egitir.')
    parser.add_argument('--data')
    parser.add_argument('--output')
    args = parser.parse_args()
    try:
        train(args.data, args.demo, args.output)
    except (ValueError, FileNotFoundError, KeyError) as exc:
        parser.exit(1, f'{exc}\n')
