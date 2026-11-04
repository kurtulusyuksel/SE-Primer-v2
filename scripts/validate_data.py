"""Gerçek oturum CSV'sini eğitim ve yayın kapılarına göre doğrular.

Eğitim başlatmaz, model yazmaz; yalnız veri sözleşmesini denetler.
Kullanım:
  python scripts/validate_data.py
  python scripts/validate_data.py --data data/oturumlar.csv --allow-incomplete
  python scripts/validate_data.py --json
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import uuid
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = json.loads((ROOT / 'model/contract.json').read_text(encoding='utf-8'))
FEATURES = CONTRACT['features']
RANGES = CONTRACT['ranges']
INTEGER_INDEXES = set(CONTRACT['integer_features'])
COLUMNS = ['oturum_id', 'kaynak', *FEATURES, 'ipucu_gerekli']
SCENES = {1, 2, 3}
MIN_SESSIONS = 15


def read_rows(path: Path):
    """CSV'yi BOM toleranslı okur; başlık ve satırları döndürür."""
    with path.open(encoding='utf-8-sig', newline='') as stream:
        reader = csv.DictReader(stream)
        header = list(reader.fieldnames or [])
        rows = [{str(key).strip(): (value or '').strip()
                 for key, value in row.items() if key is not None}
                for row in reader]
    return header, rows


def validate(rows, header=None, allow_incomplete=False):
    """Satırları doğrular; yapısal hatalar ile kapı eksiklerini ayırır."""
    errors, warnings = [], []
    scenes_by_session = defaultdict(set)
    labels_by_session = defaultdict(list)
    labels_by_scene = defaultdict(list)
    label_counts = Counter()
    scene_counts = Counter()
    seen = set()
    feature_rows = []
    feature_labels = []

    if header is not None:
        missing = [column for column in COLUMNS if column not in header]
        extra = [column for column in header if column not in COLUMNS]
        if missing:
            errors.append(f"Eksik sütun: {', '.join(missing)}")
        if extra:
            warnings.append(f"Beklenmeyen sütun yok sayıldı: {', '.join(extra)}")
        if not missing and header != COLUMNS:
            warnings.append('Sütun sırası sözlükten farklı; eğitim adlarla okuduğu için kabul edildi.')

    for index, row in enumerate(rows, start=2):
        session_id = row.get('oturum_id', '')
        if not session_id:
            errors.append(f'Satır {index}: oturum_id boş.')
            continue
        try:
            uuid.UUID(session_id)
        except ValueError:
            warnings.append(f'Satır {index}: oturum_id UUID biçiminde değil ({session_id[:12]}...).')
        if row.get('kaynak') != 'gercek':
            errors.append(f"Satır {index}: kaynak 'gercek' olmalı, bulunan '{row.get('kaynak', '')}'.")

        values, valid = [], True
        for position, name in enumerate(FEATURES):
            try:
                value = float(row[name])
            except (KeyError, TypeError, ValueError):
                errors.append(f'Satır {index}: {name} sayısal değil.')
                valid, values = False, []
                break
            low, high = RANGES[position]
            if not math.isfinite(value) or not low <= value <= high:
                errors.append(f'Satır {index}: {name}={row[name]} aralık dışında [{low}, {high}].')
                valid = False
            if position in INTEGER_INDEXES and not value.is_integer():
                errors.append(f'Satır {index}: {name} tam sayı olmalı.')
                valid = False
            values.append(value)
        if not valid:
            continue

        scene = int(values[4])
        if scene not in SCENES:
            errors.append(f'Satır {index}: sahne_no 1, 2 veya 3 olmalı.')
            continue
        key = (session_id, scene)
        if key in seen:
            errors.append(f'Satır {index}: aynı oturum/sahne tekrar ediyor ({session_id[:8]}, sahne {scene}).')
            continue
        seen.add(key)

        if row.get('ipucu_gerekli') not in ('0', '1'):
            errors.append(f'Satır {index}: ipucu_gerekli 0 veya 1 olmalı.')
            continue
        label = int(row['ipucu_gerekli'])
        scenes_by_session[session_id].add(scene)
        labels_by_session[session_id].append(label)
        labels_by_scene[scene].append(label)
        label_counts[label] += 1
        scene_counts[scene] += 1
        feature_rows.append(values)
        feature_labels.append((tuple(values), label))

    sessions = list(scenes_by_session)
    complete = [session for session in sessions if scenes_by_session[session] == SCENES]
    incomplete = [session for session in sessions if scenes_by_session[session] != SCENES]

    if not rows:
        message = 'Veri satırı yok; dosya yalnız başlık içeriyor.'
        (warnings if allow_incomplete else errors).append(message)
    if incomplete:
        message = (f'{len(incomplete)} oturum eksik sahne içeriyor; '
                   'eğitime yalnız üç sahnesi de tamamlanmış oturumlar girer.')
        (warnings if allow_incomplete else errors).append(message)
    if len(complete) < MIN_SESSIONS:
        message = f'Tamamlanmış oturum {len(complete)}; eğitim kapısı en az {MIN_SESSIONS}.'
        (warnings if allow_incomplete else errors).append(message)
    if set(label_counts) != {0, 1}:
        message = 'Her iki sınıf da bulunmuyor; eğitim reddedilir.'
        (warnings if allow_incomplete else errors).append(message)
    for scene in sorted(SCENES):
        labels = set(labels_by_scene[scene])
        if not labels:
            warnings.append(f'Sahne {scene} için veri yok.')
        elif labels != {0, 1}:
            warnings.append(f'Sahne {scene} tek sınıf içeriyor; genelleme zayıf kalabilir.')
    for index, name in enumerate(FEATURES):
        column = [values[index] for values in feature_rows]
        if len(column) > 1 and len(set(column)) == 1:
            warnings.append(f'{name} tüm satırlarda sabit; ayırt edici bilgi taşımıyor.')

    vectors = defaultdict(list)
    for vector, label in feature_labels:
        vectors[vector].append(label)
    repeated_rows = len(feature_labels) - len(vectors)
    conflicts = sum(1 for labels in vectors.values() if len(set(labels)) > 1)
    if repeated_rows:
        warnings.append(f'{repeated_rows} satır birebir aynı özellik vektörünü tekrar ediyor; '
                        'oturum bazlı holdout özellik düzeyinde sızabilir.')
    if conflicts:
        warnings.append(f'{conflicts} özellik vektörü aynı girdiyle hem 0 hem 1 etiketli; '
                        'bu satırların tamamı hiçbir modelle ayrılamaz.')

    summary = {
        'file_rows': len(rows),
        'sessions': len(sessions),
        'complete_sessions': len(complete),
        'incomplete_sessions': len(incomplete),
        'required_sessions': MIN_SESSIONS,
        'missing_sessions': max(0, MIN_SESSIONS - len(complete)),
        'labels': {str(label): label_counts[label] for label in sorted(label_counts)},
        'scenes': {str(scene): scene_counts[scene] for scene in sorted(SCENES)},
        'sessions_per_label': {
            '0': sum(1 for values in labels_by_session.values() if values and all(value == 0 for value in values)),
            '1': sum(1 for values in labels_by_session.values() if values and all(value == 1 for value in values)),
            'mixed': sum(1 for values in labels_by_session.values() if 0 in values and 1 in values),
        },
        'unique_feature_vectors': len(vectors),
        'repeated_feature_rows': repeated_rows,
        'conflicting_feature_vectors': conflicts,
    }
    return {'ok': not errors, 'errors': errors, 'warnings': warnings, 'summary': summary}


def render(result, path: Path):
    summary = result['summary']
    print(f'Veri dosyası : {path}')
    print(f'Satır        : {summary["file_rows"]}')
    print(f'Oturum       : {summary["sessions"]} '
          f'(tamamlanmış {summary["complete_sessions"]}, eksik {summary["incomplete_sessions"]})')
    print(f'Eksik oturum : {summary["missing_sessions"]} / gerekli {summary["required_sessions"]}')
    print(f'Etiket       : 0={summary["labels"].get("0", 0)}, 1={summary["labels"].get("1", 0)}')
    print(f'Sahne        : 1={summary["scenes"]["1"]}, 2={summary["scenes"]["2"]}, 3={summary["scenes"]["3"]}')
    for warning in result['warnings']:
        print(f'[UYARI] {warning}')
    for error in result['errors']:
        print(f'[HATA]  {error}')
    if not result['ok']:
        print('SONUÇ: EKSİK — yukarıdaki hatalar giderilmeden eğitim/yayın yapılmamalı.')
    elif (summary['missing_sessions'] == 0 and summary['incomplete_sessions'] == 0
          and set(summary['labels']) == {'0', '1'}):
        if summary['conflicting_feature_vectors'] or summary['repeated_feature_rows']:
            print('SONUÇ: KAPILAR GEÇTİ, ANCAK AYIRT EDİCİLİK ZAYIF — aynı özellik '
                  'vektörleri tekrar/çelişki içeriyor; eval kapısı ayrıca denenmeli.')
        else:
            print('SONUÇ: HAZIR — veri eğitim ve yayın kapılarını karşılıyor.')
    else:
        print('SONUÇ: TOPLAMA SÜRÜYOR — yapısal hata yok, ancak kapılar henüz karşılanmadı.')


def main(argv=None):
    parser = argparse.ArgumentParser(description='Gerçek oturum CSV kapı denetimi.')
    parser.add_argument('--data', default=str(ROOT / 'data/oturumlar.csv'))
    parser.add_argument('--allow-incomplete', action='store_true',
                        help='Toplama sürerken eksikleri uyarı say; yalnız yapısal hatalarda düş.')
    parser.add_argument('--json', action='store_true', help='Makine okunur çıktı ver.')
    args = parser.parse_args(argv)

    path = Path(args.data)
    if not path.exists():
        print(f'[HATA]  Dosya bulunamadı: {path}')
        return 1
    header, rows = read_rows(path)
    result = validate(rows, header, allow_incomplete=args.allow_incomplete)
    if args.json:
        print(json.dumps({'path': str(path), **result}, indent=2, ensure_ascii=False))
    else:
        render(result, path)
    return 0 if result['ok'] else 1


if __name__ == '__main__':
    sys.exit(main())
