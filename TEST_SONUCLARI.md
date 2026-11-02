# Yerel doğrulama sonuçları — 2 Kasım 2026

Bu rapor yerel v2 adayına aittir; canlı uygulama veya gerçek kullanıcı deneyi değildir.

| Kontrol | Sonuç |
|---|---|
| TypeScript (`npm run lint`) | Geçti |
| Üretim derlemesi (`npm run build`) | Geçti |
| Python testleri | 13/13 geçti (3 eğitim + 10 veri kapısı) |
| Python ONNX oracle | 5/5 referans doğrulandı |
| Cypress v2 model/parite/dağıtım/veri/mobil testleri | 11/11 geçti |
| Ödev 6 regresyon E2E | 3/3 geçti |
| Veri kapısı doğrulayıcısı | Boş gerçek CSV'yi reddetti; 15 oturum / 45 satır kabul edildi |
| ONNX modeli | 5 özellik, StandardScaler + LogisticRegression |
| Sentetik holdout doğruluğu (karar eşiği 0.60) | 0.9055555556 |
| sklearn -> ONNX maksimum mutlak fark | 1.3763748297e-7 (<1e-4) |
| Gerçek oturum sayısı | 0; başarı iddiası yok |

Eğitim testleri boş gerçek verinin reddini, başarısız eval'in önceki artefaktı korumasını
ve aynı veri/seed/bağımlılıklarla birebir aynı model+metriklerin üretilmesini doğruladı.
ONNX grafik adı da sabittir.

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

Son v2 test tekrarında 11/11 model testi ve 3/3 regresyon testi geçti (toplam 14/14).
Bunlar gerçek insan oturumları değildir; test verileri gerçek CSV'ye yazılmadı.

Veri kapısı doğrulayıcısı (`scripts/validate_data.py`) boş dosyayı, 14 oturumu, yinelenen
sahneyi, aralık dışı özelliği, tek sınıfı ve yanlış kaynağı reddetti; 15 tamamlanmış oturumu
(45 satır) kabul etti. `scripts/delivery_check.py` eksik kapıları tek raporda gösteriyor.

Bekleyenler: 15 gerçek oturum, gerçek veri eval kapısı, HF public repo/commit,
canlı v2 yayını, 60–90 saniyelik insan tarafından sunulan demo video.
