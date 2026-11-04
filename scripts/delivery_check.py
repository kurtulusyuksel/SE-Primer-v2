"""Teslim öncesi kapıları tek komutta denetler.

Veri, model, HF yayın manifesti, Git durumu, demo video ve beyan alanlarını
kontrol eder. Ağ isteği yapmaz; canlı bağlantıyı yalnız "elle doğrula" olarak işaretler.
Kullanım:
  python scripts/delivery_check.py
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_data import read_rows, validate  # noqa: E402

PASS, FAIL, WARN, MANUAL = 'GEÇTİ', 'KALDI', 'UYARI', 'ELLE'
results = []
ONLINE = False


def add(status, name, detail):
    results.append((status, name, detail))


def sha256(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git(*args):
    completed = subprocess.run(['git', *args], cwd=ROOT, capture_output=True,
                               text=True, encoding='utf-8', errors='replace')
    return completed.returncode, completed.stdout.strip(), completed.stderr.strip()


def check_data():
    path = ROOT / 'data/oturumlar.csv'
    if not path.exists():
        add(FAIL, 'Gerçek veri', 'data/oturumlar.csv bulunamadı.')
        return None
    header, rows = read_rows(path)
    result = validate(rows, header)
    summary = result['summary']
    if result['ok']:
        detail = (f'{summary["complete_sessions"]} tamamlanmış oturum, '
                  f'{summary["file_rows"]} satır.')
        if summary.get('conflicting_feature_vectors') or summary.get('repeated_feature_rows'):
            detail += (f' {summary["repeated_feature_rows"]} tekrar, '
                       f'{summary["conflicting_feature_vectors"]} çelişkili vektör; '
                       'ayırt edicilik zayıf.')
        add(PASS, 'Gerçek veri', detail)
    else:
        add(FAIL, 'Gerçek veri', f'{summary["complete_sessions"]}/{summary["required_sessions"]} oturum; '
                                 f'ilk hata: {result["errors"][0]}')
    return result


def check_model(data_result):
    config_path = ROOT / 'model/config.json'
    model_path = ROOT / 'model/model.onnx'
    if not config_path.exists() or not model_path.exists():
        add(FAIL, 'Model artefaktı', 'model/config.json veya model/model.onnx yok.')
        return None
    config = json.loads(config_path.read_text(encoding='utf-8'))
    metrics = config.get('metrics', {})
    problems = []
    if config.get('status') != 'real-data-candidate':
        problems.append(f'status={config.get("status")}')
    if metrics.get('real_sessions', 0) < 15:
        problems.append(f'real_sessions={metrics.get("real_sessions", 0)}')
    if metrics.get('accuracy', 0) < config.get('acceptance_accuracy', .75):
        problems.append(f'accuracy={metrics.get("accuracy")}')
    if sha256(model_path) != config.get('model_sha256'):
        problems.append('model SHA256 uyuşmuyor')
    data_path = ROOT / 'data/oturumlar.csv'
    if data_path.exists() and sha256(data_path) != config.get('data_sha256'):
        problems.append('veri SHA256 uyuşmuyor')
    if metrics.get('onnx_max_abs_error', 1) >= config.get('tolerance', 1e-4):
        problems.append('ONNX farkı toleransı aşıyor')
    if problems:
        add(FAIL, 'Model kapıları', '; '.join(problems))
    else:
        add(PASS, 'Model kapıları', f'accuracy={metrics["accuracy"]:.4f}, '
                                    f'real_sessions={metrics["real_sessions"]}.')
    return config


def check_release():
    path = ROOT / 'public/model-release.json'
    if not path.exists():
        add(FAIL, 'HF yayını', 'public/model-release.json yok.')
        return
    release = json.loads(path.read_text(encoding='utf-8'))
    repo = release.get('repo_id') or ''
    revision = release.get('revision') or ''
    if release.get('source') != 'huggingface':
        add(FAIL, 'HF yayını', f'source={release.get("source")}; public HF modeli bağlı değil.')
    elif not re.fullmatch(r'[\w.-]+/[\w.-]+', repo):
        add(FAIL, 'HF yayını', f'repo_id geçersiz: {repo!r}')
    elif not re.fullmatch(r'[a-f0-9]{40}', revision):
        add(FAIL, 'HF yayını', 'revision 40 karakter commit SHA değil.')
    else:
        demo = repo.rsplit('/', 1)[-1].endswith('-demo')
        suffix = ' (sentetik demo; gerçek veri modeli değil)' if demo else ''
        add(PASS, 'HF yayını', f'{repo}@{revision[:12]}…{suffix}')


def check_git():
    code, dirty, _ = git('status', '--porcelain')
    if code != 0:
        add(WARN, 'Git deposu', 'git durumu okunamadı.')
    elif dirty:
        count = len(dirty.splitlines())
        add(FAIL, 'Git deposu', f'{count} dosya commit edilmemiş.')
    else:
        add(PASS, 'Git deposu', 'Çalışma ağacı temiz.')
    code, upstream, _ = git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}')
    if code != 0 or not upstream:
        add(WARN, 'Git uzak dal', 'Takip edilen uzak dal yok; push doğrulanamadı.')
    else:
        code, ahead, _ = git('rev-list', '--count', f'{upstream}..HEAD')
        if code == 0 and ahead.isdigit():
            if int(ahead) == 0:
                add(PASS, 'Git push', f'{upstream} güncel.')
            else:
                add(FAIL, 'Git push', f'{ahead} commit {upstream} dalına gönderilmemiş.')


def video_duration(path: Path):
    try:
        completed = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
             '-of', 'default=noprint_wrappers=1:nokey=1', str(path)],
            capture_output=True, text=True, encoding='utf-8', errors='replace')
        return float(completed.stdout.strip()) if completed.returncode == 0 else None
    except (OSError, ValueError):
        return None


def check_video_and_links():
    readme = (ROOT / 'README.md').read_text(encoding='utf-8')
    links = re.findall(r'\]\(<?([^)>]+\.mp4)>?\)', readme)
    linked = next(((ROOT / link).resolve() for link in links if (ROOT / link).exists()), None)
    if linked is None:
        videos = [path for path in ROOT.rglob('*.mp4')
                  if 'node_modules' not in path.parts and '.git' not in path.parts]
        if not videos:
            add(FAIL, 'Demo videosu', 'Depoda .mp4 yok; 60–90 sn video teslim edilmedi.')
        else:
            add(WARN, 'Demo videosu', f'{videos[0].name} var ama README bağlantısı yok.')
    else:
        duration = video_duration(linked)
        model = ROOT / 'model/model.onnx'
        too_old = model.exists() and linked.stat().st_mtime < model.stat().st_mtime
        if duration is None:
            add(WARN, 'Demo videosu', f'{linked.name} süresi okunamadı; 60–90 sn elle doğrula.')
        elif not 60 <= duration <= 90:
            add(FAIL, 'Demo videosu', f'{linked.name} {duration:.1f} sn; istenen 60–90 sn.')
        elif too_old:
            add(FAIL, 'Demo videosu', f'{linked.name} v2 modelinden önce kaydedilmiş; yeniden çek.')
        else:
            add(PASS, 'Demo videosu', f'{linked.name}, {duration:.0f} sn ve README bağlantısı var.')
    live = re.search(r'https://[^\s)">]+(?:ai\.studio|github\.io)[^\s)">]*', readme)
    if not live:
        add(FAIL, 'Canlı uygulama', 'README içinde canlı uygulama bağlantısı yok.')
    elif not ONLINE:
        add(MANUAL, 'Canlı uygulama', 'README bağlantısı var; --online ile HTTP kontrolü yapılabilir.')
    else:
        base = live.group(0).rstrip('/')
        try:
            with urllib.request.urlopen(base + '/model-release.json', timeout=15) as response:
                manifest = json.loads(response.read().decode('utf-8'))
            if manifest.get('mode') not in ('off', 'shadow', 'canary', 'active'):
                raise ValueError(f'geçersiz mod: {manifest.get("mode")}')
            add(PASS, 'Canlı uygulama', f'{base} HTTP 200, model modu={manifest["mode"]}.')
        except Exception as error:  # noqa: BLE001 - rapora taşınır
            add(FAIL, 'Canlı uygulama', f'{base} doğrulanamadı: {error}')
    if 'ekip henüz beyan etmedi' in readme:
        add(FAIL, 'AI beyanı', 'README içindeki elle düzeltme alanı hâlâ boş.')
    else:
        add(PASS, 'AI beyanı', 'Elle düzeltme alanı doldurulmuş.')


def main():
    global ONLINE
    parser = argparse.ArgumentParser(description='Teslim kapısı denetimi.')
    parser.add_argument('--online', action='store_true',
                        help='Canlı URL ve model manifestini HTTP ile doğrula.')
    args = parser.parse_args()
    ONLINE = args.online
    data_result = check_data()
    check_model(data_result)
    check_release()
    check_git()
    check_video_and_links()
    print('Teslim kapısı raporu')
    print('=' * 72)
    for status, name, detail in results:
        print(f'[{status:<5}] {name:<20} {detail}')
    passed = sum(1 for status, _, _ in results if status == PASS)
    failed = sum(1 for status, _, _ in results if status == FAIL)
    print('-' * 72)
    print(f'{passed}/{len(results)} kapı geçti, {failed} kapı kaldı.')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
