# Yerel doğrulama sonuçları — 4 Kasım 2026

Bu rapor yerel v2 adayına aittir; canlı uygulama performansı ya da öğretim faydası iddiası
değildir. Gerçek oturum sayısı ve eval denemesi aşağıdaki CSV ve komut çıktısından alınmıştır.

| Kontrol | Sonuç |
|---|---|
| TypeScript (`npm run lint`) | Geçti |
| Üretim derlemesi (`npm run build`) | Geçti |
| Python testleri | 13/13 geçti (3 eğitim + 10 veri kapısı) |
| Python ONNX oracle | 5/5 referans doğrulandı |
| Cypress v2 model/parite/dağıtım/veri/mobil testleri | 11/11 geçti |
| Ödev 6 regresyon E2E | 3/3 geçti |
| Cypress tam yerel koşu | 14 geçti, 1 isteğe bağlı yayın testi atlandı |
| GitHub Pages canlı duman testi | 1/1 geçti (gerçek WASM, canlı URL) |
| Veri kapısı doğrulayıcısı | İki yeni dışa aktarımı birleştirdi; 30 oturum / 90 satır kabul edildi |
| ONNX modeli | 5 özellik, StandardScaler + LogisticRegression |
| Sentetik holdout doğruluğu (karar eşiği 0.60) | 0.9055555556 |
| sklearn -> ONNX maksimum mutlak fark | 1.3763748297e-7 (<1e-4) |
| Gerçek CSV | 30 tamamlanmış oturum / 90 satır; kaynak=gercek; etiketler 64/26 |
| Gerçek veri validator | 30/30 tamamlandı; UUID/sahne/özellik/sınıf kapıları geçti; `ipucu_sayisi` sabit, 60 tekrar ve 12 çelişkili vektör uyarısı |
| Gerçek veri eval denemesi | GroupShuffleSplit seed=42; holdout 8 oturum / 24 satır; accuracy=0.791667 |
| Holdout hata profili | TN=19, FP=0, FN=5, TP=0; model tüm holdout satırlarını 0 tahmin etti |
| Çoğunluk baseline kapısı | Holdout baseline=19/24=0.791667; accuracy eşit olduğu için `train.py` reddetti |
| Altın kabul örnekleri | Beklenen `[1,0,1]`; üretilen `[0,0,0]`; yayın kapısı reddetti |
| Reddedilen adayın yan etkisi | Model/config yazılmadı; sentetik demo ONNX ve Python oracle hash/paritesi korundu |
| Gerçek kullanıcı genellemesi | 30 oturum kullanıcının kendi kullanımından; 30 farklı katılımcı değildir |
| Veri tekrarı | 90 satırda yalnız 30 benzersiz özellik vektörü; 60 satır birebir tekrar |
| Çelişkili etiket | 12 özellik vektörü aynı girdiyle hem 0 hem 1 etiketli |
| Çoğunluk oyu tavanı | 70/90 = 0.7778; bu veride ulaşılabilecek en iyi sabit tahmin |
| Holdout özellik örtüşmesi | 24 test satırının 20'si eğitimde birebir aynı özellik vektörüyle var |
| Süre dağılımı / altın örnekler | Gerçek 1–21 sn (8 farklı değer); altın örnekler 40 ve 55 sn (dağılım dışı) |
| Model katsayıları (ölçekli) | seviye -0.354, süre -0.237, önceki yanlış -0.278, ipucu 0.000, sahne -0.094 |
| Kök neden analizi | `python scripts/analyze_eval.py` ile yeniden üretildi |

Eğitim testleri boş gerçek verinin reddini, başarısız eval'in önceki artefaktı korumasını
ve aynı veri/seed/bağımlılıklarla birebir aynı model+metriklerin üretilmesini doğruladı.
ONNX grafik adı da sabittir.

Kök neden analizi 0.7917'nin öğrenme olmadığını gösteriyor: bu değer 19/24, yani holdout'ta
tüm satırlara 0 demenin doğruluğuyla birebir aynı. 90 satır yalnız 30 benzersiz özellik
vektörüne indirgeniyor, 12 vektör çelişkili ve tüm veride çoğunluk oyu tavanı 70/90 = 0.7778.
Holdout'taki 24 satırın 20'sinin birebir aynı vektörü eğitimde de var. `karar_suresi_sn`
1–21 sn (8 değer) iken altın örnekler 40–55 sn; model bu bandı eğitimde hiç görmedi.
Katsayılar süre ve önceki yanlış için negatif; yani bu örneklem "uzun süre → yardım"
varsayımını desteklemiyor. Eşik düşürülmedi, aday artefakt yazılmadı.

Tarayıcı testleri gerçek ONNX Runtime Web WASM kullandı; model olasılıkları mock edilmedi.
HTTP hatası/hash/manifest olumsuz testlerinde ilgili ağ kaynağı kontrollü değiştirildi.
Sayaç duraklaması sıfıra ulaşmadan, sonraki sahnede yeniden çalışma ile kontrol edildi.

Üretim sunucusu localhost:3018 üzerinde çalıştırıldı:

```powershell
$env:NODE_ENV='production'
$env:PORT='3018'
npm start
```

Ayrı terminalde:

```powershell
npx cypress run --config baseUrl=http://localhost:3018 --browser electron
```

3000 portundaki mevcut sürece dokunulmadı. Geliştirme ortamındaki Vite WebSocket port
çakışması nedeniyle testler üretim derlemesinde yapıldı; hatalar testlerde yutulmadı.
Tarayıcı aracı kurulamadığından görsel kontrol Cypress ekran görüntüleri üzerinden yapıldı.
Ekran görüntüleri `cypress/screenshots/model.cy.js/` altında (Git dışında).

Son v2 test tekrarında 13/13 model/yayın/veri testi ve 3/3 regresyon testi geçti
(toplam 16/16; iki isteğe bağlı canlı test PAGES_URL verilmediği için atlandı).
4 Kasım yeniden koşusunda üretim derlemesine karşı 16 test geçti, 2 isteğe bağlı test atlandı.
GitHub Pages'teki canlı v2 URL'sinde gerçek WASM çıkarımı 1/1 ve uçtan uca veri
toplama akışı 1/1 doğrulandı (`--expose PAGES_URL=...`).
Bunlar gerçek insan oturumları değildir; test verileri gerçek CSV'ye yazılmadı.

Canlı v2: https://kurtulusyuksel.github.io/SE-Primer-v2/ — `npm run build:pages` ve
`npm run deploy:pages` ile gh-pages dalına yayınlanır. AI Studio'daki eski adres v1'dir.
Veri toplama modu sekme yenilenince açık kalır; kayıt kapalıyken oyun CSV'ye eklenmez
ve arayüz bunu oyun sırasında/sonucunda açıkça uyarır. İhtiyaç etiketi karar kartlarının
hemen üstünde tek tıkla seçilir; etiket seçilmeden A/B düğmeleri kilitlidir.

Veri kapısı doğrulayıcısı (`scripts/validate_data.py`) boş dosyayı, 14 oturumu, yinelenen
sahneyi, aralık dışı özelliği, tek sınıfı ve yanlış kaynağı reddetti; 15 tamamlanmış oturumu
(45 satır) kabul etti. `scripts/delivery_check.py` eksik kapıları tek raporda gösteriyor.

Birleştirilmiş gerçek veri doğruluğu 0.75'in üstünde olsa da model yalnız çoğunluk sınıfını
tahmin ediyor ve altın kabul örneklerini karşılamıyor; bu nedenle yeni gerçek veri adayı
yayımlanmadı. `ipucu_sayisi` tüm gerçek satırlarda 0'dır; mevcut örneklem tek kullanıcılı
olduğundan daha çeşitli kullanıcı oturumlarıyla değerlendirme gerekir.

Bekleyenler: daha çeşitli gerçek oturumlarla eval kapısını geçmek, HF public repo/commit ve
60–90 saniyelik insan tarafından sunulan demo video. Eşik düşürülmemeli; sentetik model
gerçek veri modeli gibi yayımlanmamalı.
