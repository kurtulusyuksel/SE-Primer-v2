"""HF yükleme: gerçek veri adayı veya açıkça etiketli sentetik demo.

Gerçek aday kapıları yeniden geçmelidir. Demo modu yalnız `synthetic-demo`
artefaktını, adı `-demo` ile biten ayrı bir depoya yükler. Token yazdırılmaz.
"""
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from huggingface_hub import HfApi

ROOT = Path(__file__).resolve().parents[1]

def publish(repo_id, demo=False):
    config = json.loads((ROOT / 'model/config.json').read_text(encoding='utf-8'))
    if demo:
        if config['status'] != 'synthetic-demo' or config['metrics'].get('real_sessions', 0) != 0:
            raise ValueError('Demo yayini yalniz status=synthetic-demo ve real_sessions=0 artefakti kabul eder.')
        if repo_id.strip('/').lower() == 'kurtulus7182/se-primer-kriz-freni':
            raise ValueError('Demo yayini resmi gercek model deposuna yapilamaz.')
        if not repo_id.split('/')[-1].endswith('-demo'):
            print('UYARI: demo deposu adi -demo ile bitmiyor; model karti sentetik demo olarak isaretli.')
        mode, percentage = 'active', 100
        commit_message = 'v2.0: synthetic demo model (not a real-data candidate)'
    else:
        if config['status'] != 'real-data-candidate' or config['metrics']['real_sessions'] < 15:
            raise ValueError('Yayin engellendi: en az 15 gercek oturumla egitilmis aday gerekli.')
        if config['metrics']['accuracy'] < .75:
            raise ValueError('Eval esigi gecilemedi.')
        if hashlib.sha256((ROOT / 'data/oturumlar.csv').read_bytes()).hexdigest() != config['data_sha256']:
            raise ValueError('Veri degismis; yeniden egitin.')
        mode, percentage = 'shadow', 5
        commit_message = 'v2.0: validated real-session crisis brake model'
    if hashlib.sha256((ROOT / 'model/model.onnx').read_bytes()).hexdigest() != config['model_sha256']:
        raise ValueError('Model hash uyusmuyor.')
    subprocess.run([sys.executable, str(ROOT / 'tests/parite.py'), '--check'], cwd=ROOT, check=True)
    api = HfApi()  # HF_TOKEN ortam değişkeni veya hf auth login; anahtar dosyaya yazılmaz.
    api.whoami()
    api.create_repo(repo_id, repo_type='model', private=False, exist_ok=True)
    info = api.upload_folder(repo_id=repo_id, repo_type='model', folder_path=str(ROOT / 'model'),
        allow_patterns=['model.onnx', 'config.json', 'contract.json', 'config.schema.json', 'README.md'],
        commit_message=commit_message)
    previous = json.loads((ROOT / 'public/model-release.json').read_text(encoding='utf-8'))
    (ROOT / 'public/model-release.previous.json').write_text(json.dumps(previous, indent=2) + '\n', encoding='utf-8')
    release = {'source': 'huggingface', 'mode': mode, 'percentage': percentage,
               'kind': 'synthetic-demo' if demo else 'real-data-candidate',
               'repo_id': repo_id, 'revision': info.oid}
    (ROOT / 'public/model-release.json').write_text(json.dumps(release, indent=2) + '\n', encoding='utf-8')
    with (ROOT / 'RELEASE.md').open('a', encoding='utf-8') as stream:
        if demo:
            stream.write(f'\n## Yayınlanan sentetik demo\n- Repo: https://huggingface.co/{repo_id}\n'
                         f'- Commit: `{info.oid}`\n- Mod: active (yalnız demo; gerçek veri modeli değildir).\n'
                         f'- Model: https://huggingface.co/{repo_id}/resolve/{info.oid}/model.onnx\n'
                         '- Bu yayın model eval kapısını geçmez; gerçek kullanıcı başarımı iddiası taşımaz.\n')
        else:
            stream.write(f'\n## Yayınlanan aday\n- Repo: https://huggingface.co/{repo_id}\n'
                         f'- Commit: `{info.oid}`\n- Başlangıç modu: shadow.\n'
                         f'- Model: https://huggingface.co/{repo_id}/resolve/{info.oid}/model.onnx\n')
    print(f'https://huggingface.co/{repo_id}/resolve/{info.oid}/model.onnx')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--repo', required=True, help='kurtulus7182/se-primer-kriz-freni gibi')
    parser.add_argument('--demo', action='store_true',
                        help='Yalniz sentetik demoyu -demo ekli ayri depoya yukle.')
    args = parser.parse_args()
    publish(args.repo, demo=args.demo)
