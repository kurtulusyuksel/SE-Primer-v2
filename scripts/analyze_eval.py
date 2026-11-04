"""Gercek veri eval denemesinin neden basarisiz oldugunu kanitlayan analiz.

Model yazmaz, artefakt degistirmez; yalniz okur ve raporlar. Kullanim:
  python scripts/analyze_eval.py
  python scripts/analyze_eval.py --data data/oturumlar.csv
"""
from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = json.loads((ROOT / 'model/contract.json').read_text(encoding='utf-8'))
FEATURES = CONTRACT['features']
REFERENCES = [[0, 55, 1, 0, 2], [1, 12, 0, 0, 1], [0, 40, 0, 2, 2]]
GOLDEN_EXPECTED = [1, 0, 1]


def load(path):
    with path.open(encoding='utf-8-sig', newline='') as stream:
        rows = list(csv.DictReader(stream))
    x = np.array([[float(row[name]) for name in FEATURES] for row in rows], dtype=np.float32)
    y = np.array([int(row['ipucu_gerekli']) for row in rows])
    groups = np.array([row['oturum_id'].strip() for row in rows])
    return rows, x, y, groups


def main(argv=None):
    parser = argparse.ArgumentParser(description='Gercek veri eval kok neden analizi.')
    parser.add_argument('--data', default=str(ROOT / 'data/oturumlar.csv'))
    args = parser.parse_args(argv)
    path = Path(args.data)
    rows, x, y, groups = load(path)

    print('Veri dosyasi :', path)
    print(f'Satir        : {len(rows)}')
    print(f'Oturum       : {len(set(groups))}')
    print('Etiket       :', dict(sorted(Counter(y.tolist()).items())))

    print('\n-- Ozellik araliklari --')
    for index, name in enumerate(FEATURES):
        column = x[:, index]
        print(f'{name:22s} min={column.min():6.1f} max={column.max():6.1f} '
              f'farkli_deger={len(set(column.tolist()))}')
    print('Sinif ortalamalari (0 / 1):')
    for index, name in enumerate(FEATURES):
        means = [float(x[y == label, index].mean()) if (y == label).any() else float('nan')
                 for label in (0, 1)]
        print(f'  {name:22s} {means[0]:.2f} / {means[1]:.2f}')

    print('\n-- Ayni ozellik vektoru --')
    buckets = defaultdict(list)
    for index, vector in enumerate(x):
        buckets[tuple(vector.tolist())].append(int(y[index]))
    duplicates = len(rows) - len(buckets)
    contradictory = {key: labels for key, labels in buckets.items()
                     if len(set(labels)) > 1}
    ceiling = sum(max(labels.count(0), labels.count(1)) for labels in buckets.values())
    print(f'Benzersiz vektor : {len(buckets)} / {len(rows)} satir')
    print(f'Tekrarli satir   : {duplicates}')
    print(f'Celiskili vektor : {len(contradictory)} '
          '(ayni girdi, farkli etiket)')
    print(f'Cogunluk tavani  : {ceiling}/{len(rows)} = {ceiling / len(rows):.4f} '
          '(ayni girdilere en iyi sabit tahmin)')
    print('En kalabalik vektorler:')
    for key, labels in sorted(buckets.items(), key=lambda item: -len(item[1]))[:8]:
        if len(labels) < 2:
            continue
        print(f'  n={len(labels):2d} etiket={"".join(map(str, labels))} '
              f'ozellik={tuple(round(value, 1) for value in key)}')

    split = GroupShuffleSplit(n_splits=1, test_size=.25, random_state=CONTRACT['seed'])
    train_index, test_index = next(split.split(x, y, groups))
    train_vectors = {tuple(vector.tolist()) for vector in x[train_index]}
    overlap = [index for index in test_index if tuple(x[index].tolist()) in train_vectors]
    print('\n-- Oturum bazli holdout --')
    print(f'Egitim/test satiri : {len(train_index)} / {len(test_index)}')
    print(f'Egitim/test oturumu: {len(set(groups[train_index]))} / '
          f'{len(set(groups[test_index]))}')
    print(f'Test satirinda ayni ozellik vektoru egitimde de var: '
          f'{len(overlap)}/{len(test_index)}')
    print('  Test etiketleri:', [int(y[index]) for index in overlap])

    model = make_pipeline(StandardScaler(), LogisticRegression(
        random_state=CONTRACT['seed'], solver='liblinear', max_iter=1000))
    model.fit(x[train_index], y[train_index])
    probabilities = model.predict_proba(x[test_index])[:, 1]
    predicted = probabilities >= CONTRACT['decision_threshold']
    accuracy = float(accuracy_score(y[test_index], predicted))
    matrix = confusion_matrix(y[test_index], predicted, labels=[0, 1])
    coefficients = model.steps[-1][1].coef_[0]
    print('\n-- Model --')
    print(f'Accuracy (p >= {CONTRACT["decision_threshold"]}): {accuracy:.6f} '
          f'(esik {CONTRACT["acceptance_accuracy"]})')
    print(f'Karmasiklik matrisi [[TN,FP],[FN,TP]]: {matrix.tolist()}')
    print(f'Tahmin edilen pozitif: {int(predicted.sum())}/{len(test_index)}; '
          f'maksimum p: {float(probabilities.max()):.3f}')
    print('Olcekli katsayilar:', {name: round(float(value), 3)
                                  for name, value in zip(FEATURES, coefficients)})

    reference_probabilities = model.predict_proba(np.array(
        REFERENCES, dtype=np.float32))[:, 1]
    reference_predicted = [int(value) for value in (reference_probabilities >=
                                                    CONTRACT['decision_threshold'])]
    print('\n-- Spec altin ornekleri --')
    for reference, expected, probability, got in zip(
            REFERENCES, GOLDEN_EXPECTED, reference_probabilities, reference_predicted):
        print(f'  {reference} beklenen={expected} p={probability:.3f} uretilen={got}')
    print(f'Beklenen {GOLDEN_EXPECTED}, uretilen {reference_predicted}')

    print('\n-- Yorum --')
    print('1. Altin orneklerdeki sure (55 ve 40 sn) gercek veride gorulmeyen '
          f'bir bolge; gozlenen maksimum {float(x[:, 1].max()):.0f} sn.')
    print('2. Ayni ozellik vektoru farkli etiketlerle goruldugu icin hicbir '
          'model bu satirlarin hepsini bilemez.')
    print('3. Iki sinifin ozellik ortalamalari neredeyse ayni; ayirt edici '
          'sinyal zayif.')
    print('4. Yuksek accuracy cogunluk sinifini (0) tahmin etmekten geliyor; '
          'eval kapisi dogru sekilde reddetti.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
