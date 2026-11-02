"""Gerçek kullanıcı taklidi yapmaz. Yalnız sentetik smoke-test verisi üretir."""
import csv
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIELDS = ['oturum_id', 'kaynak', 'seviye', 'karar_suresi_sn',
          'onceki_yanlis_sayisi', 'ipucu_sayisi', 'sahne_no', 'ipucu_gerekli']

def generate():
    rng = random.Random(42)
    rows = []
    for session in range(240):
        level = rng.randint(0, 1)
        previous_wrong = hints = 0
        for scene in range(1, 4):
            seconds = round(rng.uniform(4, 95), 2)
            score = (seconds / 22 + previous_wrong * 1.3 + hints * .7
                     - level * 1.8 + scene * .15 - 2.6)
            label = int(score >= 0)
            # Belgelendirilmiş %3 etiket gürültüsü; insan verisi değildir.
            if rng.random() < .03:
                label = 1 - label
            rows.append([f'sentetik-{session:04}', 'sentetik', level, seconds,
                         previous_wrong, hints, scene, label])
            previous_wrong += int(rng.random() < .3)
            hints += int(rng.random() < .3)
    with (ROOT / 'data/sentetik.csv').open('w', newline='', encoding='utf-8') as stream:
        writer = csv.writer(stream)
        writer.writerow(FIELDS)
        writer.writerows(rows)
    print(f'{len(rows)} SENTETIK karar, 240 oturum; gercek veri degildir.')

if __name__ == '__main__':
    generate()
