<div align="center">
  <img width="30%" alt="Giriş Ekranı" src="./assets/Stitch1.png" />
  <img width="30%" alt="Kriz Odası" src="./assets/Stitch2.png" />
  <img width="30%" alt="Sonuç Analizi" src="./assets/Stitch3.png" />
  <h1>SE Primer — Muhteşem Cuma Kriz Odası</h1>
  <p><b>YZM301 Yazılım Gerçekleme ve Test · AI-DLC İnteraktif Eğitim Simülasyonu</b></p>
  <p><a href="https://kurtulusyuksel.github.io/SE-Primer-v2/"><strong>🔴 CANLI v2 DEMOYU AÇ →</strong></a></p>
</div>

---

## Proje Hakkında

**SE Primer**, yüksek trafikli bir e-ticaret altyapısında Muhteşem Cuma gecesi yaşanan ödeme servisi kilitlenmesini simüle eden, mobil öncelikli ve etkileşimli bir eğitim uygulamasıdır.

Oyuncu, kriz sırasında mimari, test ve veri güvenliği (KVKK/PCI-DSS) kararları alır. Kararların sonuçları uygulamada simüle edilir; Sokratik mentor ise doğrudan yanıt vermek yerine yönlendirici sorularla kök neden analizine teşvik eder.

## Demo ve Tasarım

- 🌐 **Canlı v2 (GitHub Pages):** [kurtulusyuksel.github.io/SE-Primer-v2](https://kurtulusyuksel.github.io/SE-Primer-v2/)
- 🕰️ **v1 (AI Studio):** [SE Primer](https://se-primer-muhte-em-cuma-kriz-odas.ai.studio/) — v2 değişikliklerini içermez
- 💻 **v2 kaynak deposu:** [github.com/kurtulusyuksel/SE-Primer-v2](https://github.com/kurtulusyuksel/SE-Primer-v2)
- 🎥 **Cypress E2E demo videosu:** [Videoyu görüntüle](<./cypress/e2e/Kayıt 2026-10-26 232608.mp4>)
- 🎨 **Tasarım sistemi:** [design.md](./design.md)
- 📊 **Sokratik mentor değerlendirmesi:** [eval.md](./eval.md)
- 📋 **Proje kapsamı ve kabul kriterleri:** [spec.md](./spec.md)

## Teknolojiler

- React, TypeScript ve Vite
- Express sunucusu
- Google Gemini API (isteğe bağlı; anahtar olmadan yerel Sokratik yanıt motoru kullanılır)
- Cypress E2E testleri

## Yerel Kurulum

**Gereksinimler:** Node.js `^20.19.0` veya `>=22.12.0` ve npm.

```bash
npm ci
npm run dev
```

Uygulamayı `http://localhost:3000` adresinde açın.

Gemini API kullanmak isterseniz `.env.example` dosyasını `.env` olarak kopyalayıp `GEMINI_API_KEY` değerini ekleyin. API anahtarı olmadan uygulama yerel yanıt motoruyla çalışır. Gerçek anahtarları GitHub'a yüklemeyin; `.env` Git tarafından yok sayılır.

## Testler

Önce `npm run dev` komutuyla sunucuyu başlatın. Ardından ikinci bir terminalde E2E testlerini çalıştırın:

```bash
npm run test:e2e
```

Cypress arayüzüyle çalıştırmak için:

```bash
npm run test:e2e:open
```

TypeScript kontrolü ve üretim derlemesi:

```bash
npm run lint
npm run build
```

## Proje Dosyaları

- `src/`: React arayüzü, bileşenler, senaryolar ve yardımcı kodlar.
- `server.ts`: Express sunucusu ve Sokratik mentor API uç noktası.
- `cypress/e2e/simulation.cy.js`: Başarılı ve başarısız karar akışlarını ve Sokratik mentor arayüzünü doğrulayan E2E testleri.
- `spec.md`: Problem tanımı, kapsam ve kabul kriterleri.
- `design.md`: Arayüz tasarımı ve tasarım sistemi.
- `eval.md`: Sokratik mentor değerlendirme raporu.

## Kapsam Dışı Bırakılan Özellikler

MVP kapsamı ve önceliklendirme doğrultusunda aşağıdaki özellikler ilk sürüme dahil edilmemiştir:

1. **Çok oyunculu kriz odası:** İlk sürüm tek kullanıcılı simülasyona odaklanır; gerçek zamanlı işbirliği ve WebSocket altyapısı kapsam dışıdır.
2. **Zaman serisi metrik panosu:** Simülasyon karar akışına odaklanmak için ayrıntılı grafik ve metrik panosu ertelenmiştir.
3. **Çoklu dil desteği:** İlk sürüm Türkçe eğitim senaryolarına odaklanır; i18n altyapısı kapsam dışıdır.


## Ödev 7 — Kriz freni (v2)

**Depo:** https://github.com/kurtulusyuksel/SE-Primer-v2  
**Canlı v2:** https://kurtulusyuksel.github.io/SE-Primer-v2/  
**Durum:** v2 GitHub Pages'te yayında. Gerçek oturum: henüz yok. Model: açıkça sentetik demo.
AI Studio'daki v1 adresi bu değişiklikleri içermez. HF yayını ve 60–90 sn video teslimi bekliyor.

Model mentorun **ne zaman** açılacağını belirler; Gemini mentorun konuşma üretiminden
ayrıdır. Yüksek ihtiyaçta sahneye özel Sokratik soru ve deneyimli modda sayaç durdurma var.
Oyun sonucu eski A-A-A / herhangi B kuralını korur.

### Uygulamayı aç (en fazla 3 komut)

Node sürümü yukarıdaki gibi. Repoda üretilmiş ONNX/config bulunur; Python yalnız eğitim içindir.

```powershell
npm ci
npm run dev
```

http://localhost:3000 · Parite laboratuvarı: http://localhost:3000/?model-lab
postinstall WASM dosyalarını yerel public/ort dizinine kopyalar; runtime CDN'sine bağlı değildir.

### Gerçek veri ve eğitim

Ana ekranda **“Gerçek oturum veri toplama modu (gönüllü)”** kutusunu işaretleyin; kutu
işaretli değilse oyun kaydedilmez. Her karardan önce, karar kartlarının hemen üstündeki
tek soruda kendi ihtiyaç etiketinizi tek tıkla seçin; etiket seçilmeden A/B düğmeleri açılmaz.
Etiket her sahnede ayrı sorulur çünkü her oturum üç bağımsız satır üretir; tek etiket
45 satırlık veri sözleşmesini bozar.
Üç sahneyi bitirin; ana ekrana dönüp CSV indirin. Oyun sırasında üstte “Kayıt açık —
bu oturumda 2/3 karar kaydedildi” durumu görünür; mod sekme yenilenince açık kalır.
En az 15 tamamlanmış gerçek oturumu `data/oturumlar.csv` olarak kaydedin.
Ayrıntılar `data/SOZLUK.md`; 15 oturumluk dağıtım, gönüllü mesajı ve ilerleme tablosu
`data/GONULLU_PLANI.md`.

Python 3.12 önerilir. PowerShell'de:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-lock.txt
.\.venv\Scripts\python.exe train.py
```

Bu makinedeki .venv hazırdır; ilk iki komutu tekrar çalıştırmanız gerekmez.
Varsayılan eğitim gerçek veri ister. Eşik altındaysa yeni artefakt üretmez.
Eğitim geçtikten sonra:

```powershell
.\.venv\Scripts\python.exe tests/parite.py
npm run model:sync
```

Yalnız demo verisini yeniden üretmek için (gerçek veri değildir):

```powershell
.\.venv\Scripts\python.exe scripts/generate_demo.py
.\.venv\Scripts\python.exe train.py --demo
.\.venv\Scripts\python.exe tests/parite.py
npm run model:sync
```

### Sentetik veri üretim formülü (ödev şartı)

`scripts/generate_demo.py`, `random.Random(42)` ile 240 sentetik oturum / 720 karar üretir.
Her karar için skor ve etiket şu kuralla hesaplanır:

```text
skor = karar_suresi_sn / 22 + onceki_yanlis_sayisi * 1.3 + ipucu_sayisi * 0.7
       - seviye * 1.8 + sahne_no * 0.15 - 2.6
ipucu_gerekli = 1 if skor >= 0 else 0     # %3 olasılıkla etiket rastgele çevrilir
```

Çıktı `data/sentetik.csv`, `kaynak=sentetik`. Bu formül gerçek kullanıcı davranışının kanıtı
değildir; yalnız açıkça etiketli demo artefaktı üretir. Aynı kural `data/SOZLUK.md` içinde de yazılıdır.

### Veri doğrulama ve birleştirme

Toplama sürerken ilerlemeyi görmek için (eksikler uyarı sayılır, yapısal hata yine durdurur):

```powershell
.\.venv\Scripts\python.exe scripts/validate_data.py --allow-incomplete
```

Farklı cihazlardan indirilen CSV'leri tek dosyada birleştirmek için (yinelenen satır atılır,
çelişen kopyada hiçbir dosya yazılmaz):

```powershell
.\.venv\Scripts\python.exe scripts/merge_exports.py indirilen1.csv indirilen2.csv
.\.venv\Scripts\python.exe scripts/validate_data.py
```

Teslim öncesi tüm kapıları tek komutta denetlemek için:

```powershell
.\.venv\Scripts\python.exe scripts/delivery_check.py
```

Betik veri, model, HF manifesti, Git durumu, video ve beyan alanlarını kontrol eder;
ağ isteği yapmaz, canlı bağlantıyı "elle doğrula" olarak işaretler.

Üretici seed=42 ve kuralı `data/SOZLUK.md` içinde. Sentetik veri gerçek CSV'ye yazılmaz.
Accuracy>=0.75 kabul eşiği `spec.md` ve `model/contract.json` içinde eğitimden önce tanımlıdır;
inference karar eşiği 0.60'tır. Bunlar farklı kavramlardır. Split oturum bazlıdır.

### Testler

Sunucu açıkken:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py"
.\.venv\Scripts\python.exe tests/parite.py --check
npm run lint
npm run build
npm run test:e2e
```

`model.cy.js` mock olasılık kullanmaz; gerçek tarayıcı WASM çıkarımını Python oracle ile
karşılaştırır. Ayrıca shadow, model hatası, özellik/hash sözleşmesi, gerçek veri toplama
ve otomatik kriz freni testleri vardır. Eski `simulation.cy.js` regresyon olarak korunur.

### Hugging Face yayını

Hesap: `kurtulus7182`. Repo henüz yok; aşağıdaki ad öneridir, `--repo` ile değiştirilebilir.
Önce gerçek verili eğitim, model kartı, oracle ve E2E testleri tamamlanmalı.

```powershell
.\.venv\Scripts\hf.exe auth login
.\.venv\Scripts\python.exe scripts/publish_model.py --repo kurtulus7182/se-primer-kriz-freni
```

Betik sentetik demoyu yayınlamaz. Gerçek adayı public modele yükler; commit SHA'yı
`public/model-release.json` içine yazar ve shadow'da başlatır. Detaylar `RELEASE.md`.
Canlı uygulamayı bu değişikliklerle ayrıca yeniden yayınlayın. Token'ı repoya koymayın.

### GitHub Pages yayını

v2 bugün GitHub Pages'te yayında: https://kurtulusyuksel.github.io/SE-Primer-v2/

```powershell
npm run build:pages    # alt yol tabanı /SE-Primer-v2/ ile derler
npm run deploy:pages   # dist'i gh-pages dalına gönderir
```

Sayfa alt yolda çalıştığı için model, WASM ve manifest yolları `import.meta.env.BASE_URL`
üzerinden çözülür; kök tabanlı AI Studio derlemesi varsayılan olarak korunur.
Sunucusuz Pages ortamında `/api/socratic-tutor` yoktur; mentor sahneye özel yerel Sokratik
yanıtla devam eder. Yayın sonrası canlı URL'de gerçek WASM çıkarımı Cypress ile doğrulandı.

### Taban örnekten farkımız (özgünlük gerekçesi)

Ödev yönergesindeki taban örnekle ortak olan kısımlar bilinçli olarak korunmuştur:
"ipucu gerekli mi" hedefi, beş özellik, küçük doğrusal model, ONNX'e aktarım, Hugging Face
üzerinden dağıtım ve 0.75 kabul eşiği. Bunlar yönergenin ölçülebilir çerçevesidir.

v2'de eklenen ve taban örnekte bulunmayan kararlar:

| Katman | Bizim tasarımımız | Neden |
|---|---|---|
| Müdahale | Kriz freni: mentor yalnız yüksek ihtiyaçta otomatik açılır, sahneye özel Sokratik soru gösterilir | Tahmini doğrudan pedagojik eyleme çevirir; "tutor aç/kapa"dan fazlasıdır |
| Süre politikası | Deneyimli profilde müdahale anında 60 sn sayaç durur, sonraki sahnede yeniden başlar | Öğrenme desteği ile zaman baskısını çeliştirmeden birleştirir |
| Etiket | Karar öncesi gönüllü öz bildirim (0/1); sonuçtan veya A/B seçiminden türetilmez | Modelin hedefi "doğru cevap" değil, "yardım ihtiyacı"dır |
| Veri ayrımı | Oturum kimliği bazlı %25 holdout | Aynı oyunun satırları eğitim ve test arasında sızmaz |
| Dağıtım | Hash doğrulamalı manifest, shadow → canary %5→%25→%50→%100, geri dönüş manifesti | Model hatası oyunu kilitlemez; yayın kademeli ve ölçülebilir olur |
| Toplama | Toplama modunda otomatik müdahale kapalı (shadow) | Etiketin model kararından etkilenmesini engeller |

Özgünlük iddiası "yeni algoritma" değil, bu kararların birlikte kurgulanmasıdır. Model yine
lojistik regresyondur; fark etiket tanımı, müdahale politikası ve yayın güvenliğindedir.
Gerçek oturum sayısı 15'e ulaşmadan bu tasarımın öğrenmeyi iyileştirdiği iddia edilmez.

### 8 karar yolu sınırı

Üç sahne ve iki seçenek nedeniyle bir oyunun A/B karar yolu en fazla 2³ = 8'dir:
`AAA, AAB, ABA, ABB, BAA, BAB, BBA, BBB`. 15 oturum bu yolları tekrar eder; bu, 15 farklı
senaryo anlamına gelmez. Veri setinin birimi oturum değil **karar satırıdır**: 15 × 3 = 45 satır.
Model A/B yolunu sınıflandırmaz; `ipucu_gerekli` etiketini beş sayısal özellikle tahmin eder.
Aynı yol farklı karar süresi, ipucu sayısı, profil ve önceki yanlış sayısıyla farklı satırlar
üretir. Yine de bu tekrar geniş genelleme iddiasını sınırlar; sonuçlar yalnız bu senaryo
ailesi için raporlanır ve "8 yolun tamamı öğrenildi" gibi bir iddia kurulmaz.

### Teslimde kalanlar

- [ ] En az 15 gerçek tamamlanmış oturum (45 karar), iki sınıfı da içeren veri
  (`scripts/validate_data.py` ile doğrulanmış).
- [ ] Gerçek veri eğitimi ve tüm kapıların geçmesi; sentetik sonuçla karıştırılmaması.
- [ ] HF public repo ve commit'e sabit model URL'si.
- [x] v2 canlı uygulama GitHub Pages'te yayında.
- [ ] Teslimden önce gizli pencerede dört teslim bağlantısının son kontrolü.
- [ ] `DEMO.md` planıyla 60–90 sn video çekimi ve video bağlantısı.
- [ ] `SINAV_TASARIMI.md` içeriğini okuyup kendi cümlelerinle gözden geçirme.

Kapı durumunu tek komutta görmek için:

```powershell
.\.venv\Scripts\python.exe scripts/delivery_check.py
```

### AI araç kullanımı beyanı

- OpenAI Codex ve OpenCode (DeepSeek V4.1): mevcut kod/yönerge incelemesi, veri toplama akışı,
  eğitim ve ONNX entegrasyonu taslağı; parite/regresyon testleri ve teknik dokümantasyon taslağı.
- Kullanıcı katkısı: tutor hedefi ve tarayıcı mimarisi tercihi; komutların çalıştırılması,
  testlerin gözlenmesi ve sonuçların bildirilmesi.
- AI önerisi: kriz freni, karar öncesi öz bildirim etiketi, oturum bazlı veri ayrımı ve
  shadow/canary yayın planı.
- Elle düzeltilen kısımlar: **elle düzeltme yapılmadı.** Kod ve metinler AI araçlarıyla
  üretildi; kullanıcı yalnızca komutları çalıştırdı ve sonuçları doğruladı. Yapılmamış bir
  insan incelemesi yapılmış gibi gösterilmemektedir.

Kaynaklar: `RELEASE.md` ve `model/README.md`. Tasarım ve fikir kökenleri açıkça ayrılmıştır.
