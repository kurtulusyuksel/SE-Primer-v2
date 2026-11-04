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
**Durum:** v2 GitHub Pages'te yayında. `data/oturumlar.csv` içinde iki dışa aktarımdan
birleştirilmiş 30 tamamlanmış oturum / 90 karar var. Kullanıcı bu oturumların kendi gerçek
kullanımlarından geldiğini bildirdi; 30 farklı katılımcı oldukları iddia edilmiyor.
Birleştirilmiş adayın holdout doğruluğu 0.792 olsa da 24 test kararının tamamını 0 tahmin ediyor
ve önceden belirlenen altın örneklerden ilk üçünü geçemiyor; eval kapısı reddetti.
Çalışan artefakt sentetik demo olarak kaldı ve açık etiketle HF'de yayınlandı:
[kurtulus7182/SEPrimer](https://huggingface.co/kurtulus7182/SEPrimer) —
commit `2e720cf8bdf86b26c4584371b18475cc10d00df1`. Bu bir gerçek veri modeli değildir;
eval kapısını geçmediği için gerçek aday yayınlanmadı. 60–90 sn demo video bekliyor.
AI Studio'daki v1 adresi bu değişiklikleri içermez.

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
En az 15 tamamlanmış gerçek oturumu `data/oturumlar.csv` olarak kaydedin. Mevcut dosya,
kullanıcının kendi kullanımlarından bildirdiği, UUID'leri çakışmayan iki dışa aktarımdan
birleştirilen 30 oturum içerir; bunlar 30 farklı katılımcı değildir. Geniş kullanıcı kitlesine
genelleme iddiası çıkarılamaz.
Ayrıntılar `data/SOZLUK.md`; gönüllü mesajı ve ilerleme tablosu
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

Mevcut 90 satırın etiketleri 64 "yardım gerekmiyor", 26 "yardım gerekli" olarak dağılır.
Holdout 8 oturum / 24 karardır. Accuracy=0.791667 görünse de model tüm test girdilerini 0
olarak sınıflandırmıştır (TN=19, FN=5); bu nedenle doğruluk tek başına yeterli değildir.
İlk üç altın kabul örneğinin beklenen `[1, 0, 1]` tahminleri yerine `[0, 0, 0]` çıktı;
eval kapısı reddetti, gerçek veri adayı artefaktları yazılmadı. `ipucu_sayisi` 90 satırın
tamamında 0 olduğundan ayırt edici bilgi taşımaz.

**Kök neden analizi** (`scripts/analyze_eval.py` ile yeniden üretilir):

- 90 satırda yalnız **30 benzersiz özellik vektörü** var; 60 satır birebir tekrar.
  12 vektör aynı girdiyle hem 0 hem 1 etiketli. Bu nedenle aynı satırların tamamını
  hiçbir model bilemez; tüm veride çoğunluk oyu tavanı **70/90 = 0.7778**'dir. Raporlanan
  0.7917 ise holdout'ta tüm satırlara 0 demenin doğruluğu olan **19/24 = 0.7917** ile
  birebir aynıdır; öğrenme göstergesi değildir.
- Holdout'taki 24 satırın **20'sinin birebir aynı özellik vektörü eğitimde de var**.
  Oturum bazlı `GroupShuffleSplit` aynı oturumun satırlarını ayırır, ancak farklı
  oturumlardaki aynı özellik vektörünü ayırmaz. Yani test kümesi özellik düzeyinde temiz değil.
- `karar_suresi_sn` yalnız **1–21 sn** arasında ve 8 farklı değer alıyor. Altın
  örneklerdeki 55 ve 40 sn gözlenen dağılımın tamamen dışında; model bu bölgeye
  eğitimde hiç görmediği için düşük olasılık veriyor.
- İki sınıfın özellik ortalamaları neredeyse aynı (süre 2.09 / 1.96 sn, önceki yanlış
  0.33 / 0.23). Eğitilen katsayılar süre ve önceki yanlış için **negatif**; bu örneklem
  "uzun süre → yardım gerekir" varsayımını desteklemiyor.

Sonuç: eşik veya model ayarı düşürülmemeli. Yeni veri farklı katılımcılardan, gerçek
ipucu kullanımını da içerecek şekilde ve etiket yönlendirilmeden toplanmalı. Altın
örnekler 40–55 sn bandında; mevcut veri bu bandı kapsamıyor. Süreyi yapay olarak
uzatmak da doğru değil; gerçekten uzun kararlar oluşursa model bu bölgeyi görebilir.
Analizi tekrar üretmek için:

```powershell
.\.venv\Scripts\python.exe scripts/analyze_eval.py
```

Üretici seed=42 ve kuralı `data/SOZLUK.md` içinde. Sentetik veri gerçek CSV'ye yazılmaz.
Accuracy>=0.75 kabul eşiği `spec.md` ve `model/contract.json` içinde eğitimden önce tanımlıdır;
inference karar eşiği 0.60'tır. Bunlar farklı kavramlardır. Split oturum bazlıdır.
Ayrıca `train.py`, holdout'ta tek sınıfı tahmin eden **çoğunluk baseline'ını** hesaplar ve
modelin bunu kesin olarak aşmasını ister; eşitlik de reddedilir. Mevcut gerçek veride
accuracy = baseline = 0.791667 olduğu için aday bu kapıda durur.

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

Hesap: `kurtulus7182`. İki ayrı yol var; ikisi de aynı betiği kullanır.

**Gerçek aday** (yalnız eval kapısı geçince):

```powershell
.\.venv\Scripts\hf.exe auth login
.\.venv\Scripts\python.exe scripts/publish_model.py --repo kurtulus7182/se-primer-kriz-freni
```

Betik gerçek adayı public modele yükler; commit SHA'yı `public/model-release.json`
içine yazar ve shadow'da başlatır.

**Sentetik demo** (mevcut durum; açık etiketli):

```powershell
.\.venv\Scripts\python.exe scripts/publish_model.py --demo --repo kurtulus7182/SEPrimer
```

`--demo` yalnız `status=synthetic-demo` ve `real_sessions=0` artefaktını kabul eder;
resmi gerçek model deposuna (`kurtulus7182/se-primer-kriz-freni`) yazmayı reddeder.
Repo adında `-demo` yoksa uyarı verir. Model kartı "sentetik demo" der, mod `active`
olur ama gerçek başarım iddiası taşımaz. Bu yayın HF public repo/commit kapısını
karşılar; model eval kapısını karşılamaz. Detaylar `RELEASE.md`. Token'ı repoya koymayın.

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
`AAA, AAB, ABA, ABB, BAA, BAB, BBA, BBB`. 30 oturum bu yolları tekrar eder; bu, 30 farklı
senaryo anlamına gelmez. Veri setinin birimi oturum değil **karar satırıdır**: 30 × 3 = 90 satır.
Model A/B yolunu sınıflandırmaz; `ipucu_gerekli` etiketini beş sayısal özellikle tahmin eder.
Aynı yol farklı karar süresi, ipucu sayısı, profil ve önceki yanlış sayısıyla farklı satırlar
üretir. Yine de bu tekrar geniş genelleme iddiasını sınırlar; sonuçlar yalnız bu senaryo
ailesi için raporlanır ve "8 yolun tamamı öğrenildi" gibi bir iddia kurulmaz.

### Teslimde kalanlar

- [x] En az 15 gerçek tamamlanmış oturum (45 karar), iki sınıfı da içeren veri
  (`scripts/validate_data.py` ile doğrulanmış).
- [ ] Gerçek veri eval kapısı (aday çoğunluk sınıfını tahmin etti ve altın örnekleri geçemedi).
  Yeni ve çeşitli gerçek oturumlar toplanmadan model/HF yayını yapılmamalı.
- [x] HF public demo repo ve commit'e sabit model URL'si
  (`kurtulus7182/SEPrimer@2e720cf…`; sentetik demo, gerçek veri modeli değil).
- [x] v2 canlı uygulama GitHub Pages'te yayında.
- [ ] Teslimden önce gizli pencerede dört teslim bağlantısının son kontrolü.
- [ ] `DEMO.md` planıyla 60–90 sn video çekimi ve video bağlantısı.
- [ ] `SINAV_TASARIMI.md` içeriğini okuyup kendi cümlelerinle gözden geçirme.

Kapı durumunu tek komutta görmek için:

```powershell
.\.venv\Scripts\python.exe scripts/delivery_check.py
```

### AI araç kullanımı beyanı

- GitHub Copilot SDK (VS Code): Ödev gereksinimleri ve teslim kapıları denetlendi; Python, TypeScript, derleme, oracle ve Cypress doğrulamaları çalıştırıldı. Bu incelemede uygulama kodu değiştirilmedi.
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
