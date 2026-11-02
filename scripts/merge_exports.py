"""Farklı cihazlardan indirilen oturum CSV'lerini tek dosyada birleştirir.

Aynı oturum_id + sahne_no çifti iki kez yazılmaz. Çelişen kopya varsa
hiçbir dosya yazılmadan hata verir. Varsayılan çıktı: data/oturumlar.csv
Kullanım:
  python scripts/merge_exports.py indirilen1.csv indirilen2.csv
  python scripts/merge_exports.py *.csv --complete-only --output data/oturumlar.csv
"""
from __future__ import annotations

import argparse
import csv
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = json.loads((ROOT / 'model/contract.json').read_text(encoding='utf-8'))
FEATURES = CONTRACT['features']
COLUMNS = ['oturum_id', 'kaynak', *FEATURES, 'ipucu_gerekli']
SCENES = {1, 2, 3}


def load(path: Path):
    with path.open(encoding='utf-8-sig', newline='') as stream:
        reader = csv.DictReader(stream)
        if list(reader.fieldnames or []) != COLUMNS:
            raise ValueError(f'{path.name}: başlık sözlükle uyuşmuyor. Beklenen: {",".join(COLUMNS)}')
        rows = [{key: (value or '').strip() for key, value in row.items() if key is not None}
                for row in reader]
    return rows


def scene_of(row):
    try:
        return int(float(row['sahne_no']))
    except (KeyError, ValueError):
        return None


def write_csv(path: Path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.stat().st_size:
        backup = path.with_suffix(path.suffix + '.bak')
        shutil.copy2(path, backup)
        print(f'Önceki dosya yedeklendi: {backup}')
    with path.open('w', encoding='utf-8', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=COLUMNS, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)


def merge(paths, output, complete_only=False):
    merged, origins, order = {}, {}, []
    duplicates, conflicts, skipped = 0, [], 0
    for path in paths:
        for row in load(path):
            scene = scene_of(row)
            if not row.get('oturum_id') or scene not in SCENES:
                skipped += 1
                continue
            key = (row['oturum_id'], scene)
            if key in merged:
                if merged[key] == row:
                    duplicates += 1
                else:
                    conflicts.append(f'{path.name}: {key[0][:8]}/sahne {scene}')
                continue
            merged[key] = row
            origins[key] = path.name
            if row['oturum_id'] not in order:
                order.append(row['oturum_id'])

    if conflicts:
        raise ValueError('Aynı oturum/sahne farklı değerlerle gelmiş:\n  ' + '\n  '.join(conflicts))

    rows = [merged[key] for key in merged]
    if complete_only:
        scenes = {}
        for row in rows:
            scenes.setdefault(row['oturum_id'], set()).add(scene_of(row))
        complete = {session for session, found in scenes.items() if found == SCENES}
        rows = [row for row in rows if row['oturum_id'] in complete]

    position = {session: index for index, session in enumerate(order)}
    rows.sort(key=lambda row: (position[row['oturum_id']], scene_of(row)))
    write_csv(output, rows)

    sessions = {row['oturum_id'] for row in rows}
    print(f'Birleştirilen dosya : {len(paths)}')
    print(f'Yazılan satır       : {len(rows)}')
    print(f'Oturum              : {len(sessions)}')
    print(f'Yinelenen (atlandı) : {duplicates}')
    print(f'Geçersiz (atlandı)  : {skipped}')
    print(f'Çıktı               : {output}')
    print('Sonraki adım        : python scripts/validate_data.py')


def main(argv=None):
    parser = argparse.ArgumentParser(description='Oturum CSV birleştirici.')
    parser.add_argument('inputs', nargs='+', help='Birleştirilecek CSV dosyaları.')
    parser.add_argument('--output', default=str(ROOT / 'data/oturumlar.csv'))
    parser.add_argument('--complete-only', action='store_true',
                        help='Üç sahnesi de tamamlanmış oturumları yaz.')
    args = parser.parse_args(argv)
    paths = [Path(item) for item in args.inputs]
    missing = [str(path) for path in paths if not path.exists()]
    if missing:
        print('[HATA] Dosya bulunamadı: ' + ', '.join(missing))
        return 1
    try:
        merge(paths, Path(args.output), args.complete_only)
    except ValueError as error:
        print(f'[HATA] {error}')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
