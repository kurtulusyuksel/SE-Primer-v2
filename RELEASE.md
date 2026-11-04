# v2.0 — Kriz freni sürüm planı

## Gerçek durum
> **4 Kasım 2026: iki toplama turu da eval kapısını geçemedi.** Eski 30 oturumluk veri
> çalışma dosyasından kaldırıldı (Git geçmişi silinmedi) ve yerine 15 oturumluk ikinci tur
> toplandı. İkinci turda 45 satırın 44'ü 0 etiketli, süreler 1–4 sn ve `ipucu_sayisi` tüm
> satırlarda 0. `train.py` holdout'ta iki sınıfı da bulamadığı için eğitimi reddetti.
> Gerçek veri modeli yok; HF'de yalnız açık etiketli sentetik demo var.

v2 GitHub Pages'te yayında: https://kurtulusyuksel.github.io/SE-Primer-v2/
İkinci tur `data/oturumlar.csv` içinde: 15 tamamlanmış oturum / 45 satır. Yapısal kapılar
geçti ancak ayırt edicilik yok: etiket 44×0 / 1×1, 14 oturum tamamen 0, 45 satır yalnız
15 benzersiz özellik vektörü, 36 satır 1 sn. `train.py` "Eğitim ve testte iki sınıf da
bulunmalı" hatasıyla reddetti; model/ONNX yazılmadı.

Önceki 30 oturumluk deneme iki dışa aktarımda UUID çakışması olmadan birleştirilmişti.
Kullanıcının beyanına göre oturumlar kendi gerçek kullanımlarından geliyordu; 30 farklı
katılımcı olduğu ileri sürülmüyordu. Birleştirilmiş aday seed=42 oturum holdout'unda
accuracy=0.791667 verdi (24 test satırı, 8 oturum), fakat 24 satırın tamamını 0 olarak
tahmin etti (TN=19, FN=5) ve ilk üç altın örnekte beklenen `[1,0,1]` yerine `[0,0,0]`
üretti. Altın kabul kapısı adayı reddetti. Yeni artefakt yazılmadı; çalışan model açıkça
sentetik demo (`status=synthetic-demo`) olarak kaldı.
Hugging Face'te sentetik demo açık etiketle yayınlandı:
`kurtulus7182/SEPrimer`; `public/model-release.json` güncel commit'i gösteriyor.
Eval kapısı geçilirse aynı repo gerçek adayla güncellenecek. AI Studio'daki v1 adresi v2
değişikliklerini içermez.
Her iki denemede de `ipucu_sayisi` tüm satırlarda 0 olup ayırt edici özellik değildi.
15 oturum tek kullanıcıdan toplandığı için sonuç yalnız o kişiye ait olur; geniş kullanıcı
kitlesine genelleme iddiası kurulmaz ve kabul eşiği değiştirilmez.

Kök neden (önceki veri, `scripts/analyze_eval.py`): 90 satır yalnız 30 benzersiz özellik
vektörüne indirgeniyordu; 60 satır birebir tekrar ve 12 vektör aynı girdiyle çelişkili
etiketliydi. Bu veride çoğunluk oyu tavanı 70/90 = 0.7778 idi. Holdout'un 20/24 satırı
eğitimde birebir aynı özellik vektörüyle bulunuyordu; oturum bazlı ayrım özellik düzeyinde
sızıntıyı engellemiyordu. `karar_suresi_sn` 1–21 sn (8 farklı değer) iken altın örnekler
40–55 sn ile dağılım dışındaydı; eğitilen katsayılar süre ve önceki yanlış için negatifti.
Dolayısıyla 0.7917 öğrenme değil, çoğunluk sınıfını tahmin etmenin sonucuydu.

v2: gönüllü veri toplama, karar öncesi öz bildirim etiketi, gruplanmış holdout,
StandardScaler+LogisticRegression, ONNX sözleşmesi, Python/WASM paritesi ve kriz freni.
Ödev taban örneğinden fark: mimari/test/gizlilik için ayrı Sokratik sorular, profile göre
soru tonu ve riskte deneyimli profilde süre baskısının kaldırılması. Gemini eğitilmez.

## Yayın kapıları
1. >=15 tamamlanmış gerçek oturum, her oturum 3 sahne; CSV kaynak=gercek.
2. `train.py`: oturum ayrımı, accuracy>=0.75, çoğunluk baseline'ını kesin aşma, kabul
   örnekleri, sklearn/ONNX farkı<1e-4.
3. Python oracle, Cypress regresyon/parite, lint/build geçmeli.
4. HF hesabında `hf auth login`; sonra README'deki yayınlama komutu.
   Betik public repo oluşturur ve model/config/kartı birlikte yükler; anahtar yazdırmaz.
5. `public/model-release.json`: repo_id + tam 40 karakter commit SHA.
   `main`, hareketli tag veya yalnız dosya adı kullanılmaz. Model hash'i tarayıcıda doğrulanır.
   Başarısız aday mevcut çalışan modeli üzerine yazmaz; eski aday yeni sürüm sanılmaz.

## Güvenli devreye alma
Bu bir uygulanabilir plan; gerçek trafik üstünde tamamlanmış deney iddiası değildir.
- **Shadow**: `mode=shadow`. Tahmin hesaplanır, otomatik mentor/sayaç etkisi yoktur.
  Toplama modu her zaman shadow davranır. Yerel telemetri paneli ile hata/gecikme gözlenir.
- **Canary %5**: `mode=canary, percentage=5`. Rastgele oturum UUID'sinin kararlı
  hash kovasıyla aynı oturumun bütün sahnelerinde aynı dağıtım kararı verilir.
- **%25 -> %50 -> %100**: percentage sırasıyla artırılır; her aşamada mentorun gereksiz
  açılma geri bildirimi, başarısız yükleme ve gecikme gözden geçirilir. Küçük örneklemde
  nedensel fayda iddia edilmez. Off/shadow modlarında uygulama değişmez.
- **Aktif**: `mode=active`. Tüm oturumlar müdahaleye uygun; veri toplamada hâlâ kapalı.
Şu an merkezi telemetri servisi yok; gerçek üretim istatistiği toplanmıyor.

## Rollback
Yeni yayın öncesi betik mevcut manifesti `public/model-release.previous.json` olarak saklar.
Sorunda önce `mode=off` ile otomatik müdahaleyi kapatıp uygulamayı yeniden yayınlayın.
Ardından manifestteki repo/revision çiftini önceki doğrulanmış commit'e geri alın.
Model ve config aynı commit'ten gelir; tarayıcı oturumu yeniden yüklenir. v1'e dönüş için
ödev 6'nın Git commit'i kullanılmalı; bu çalışma kendiliğinden commit/tag oluşturmaz.
Model yüklenemezse normal oyun ve manuel mentor devam eder; kuralla sahte model sonucu üretilmez.

## Mimari ödünleşim matrisi
| Ortam | Ağ / gecikme | Veri cihazdan çıkar mı? | Model gizli mi? |
|---|---|---|---|
| **Seçilen: tarayıcı WASM** | İlk sayfa/model/WASM yüklemesinde ağ; sonra çıkarım yerel. Service worker yok, tam çevrimdışı tekrar açılış garantisi yok. | Beş sayısal özellik çıkarım için gönderilmez. Manuel Gemini sohbeti ayrı olarak sunucuya gider. HF/CDN indirme istekleri ağ metadatası taşır. | Hayır; model indirilir. |
| Cihaz içi mobil | Gömülü modelle yerel çıkarım çevrimdışı; uygulama paketleme gerektirir. | Çıkarım girdileri yerel kalabilir. | Hayır; paket incelenebilir. |
| Sunucu API | Her çıkarımda ağ ve sunucu gecikmesi; ölçekleme/ücretsiz kota kısıtı. | Evet, girdiler sunucuya gider. | Ağırlıklar doğrudan inmez; istek/yanıtla model çıkarımı saldırısı riski sürer. |

Tarayıcı seçimi: küçük model, mevcut AI Studio/Vite uygulaması ve ek çıkarım sunucusu
gerektirmemesi. Tek thread WASM, cross-origin isolation zorunluluğunu azaltır.
Model boyutu gerçek dosyadan ölçülür; runtime modelden çok daha büyüktür.

## Kaynaklar ve fikir kökeni
- Ödev 7 yönergesi: taban ipucu hedefi; özgün uygulama kararı kriz freni ve öz bildirim protokolü.
- ONNX web dağıtımı: https://onnxruntime.ai/docs/tutorials/web/deploy.html
- sklearn -> ONNX tensör olasılıkları: https://onnx.ai/sklearn-onnx/auto_tutorial/plot_dbegin_options_zipmap.html
- HF commit sürümleme: https://huggingface.co/docs/huggingface_hub/guides/download
- Grup ayrımı: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupShuffleSplit.html

## Yayınlanan sentetik demo
- Repo: https://huggingface.co/kurtulus7182/SEPrimer
- Commit: `2e720cf8bdf86b26c4584371b18475cc10d00df1`
- Mod: active (yalnız demo; gerçek veri modeli değildir).
- Model: https://huggingface.co/kurtulus7182/SEPrimer/resolve/2e720cf8bdf86b26c4584371b18475cc10d00df1/model.onnx
- Canlı yayın: https://kurtulusyuksel.github.io/SE-Primer-v2/ (manifest bu commit'i gösterir;
  4 Kasım 2026 canlı duman testi gerçek WASM ile 1/1 geçti).
- Bu yayın model eval kapısını geçmez; gerçek kullanıcı başarımı iddiası taşımaz.

## Yayınlanan sentetik demo
- Repo: https://huggingface.co/kurtulus7182/SEPrimer
- Commit: `5c3a5043bb18cfecad4a362e99e5a89e55660b7b`
- Mod: active (yalnız demo; gerçek veri modeli değildir).
- Model: https://huggingface.co/kurtulus7182/SEPrimer/resolve/5c3a5043bb18cfecad4a362e99e5a89e55660b7b/model.onnx
- Bu yayın model eval kapısını geçmez; gerçek kullanıcı başarımı iddiası taşımaz.

## Yayınlanan sentetik demo
- Repo: https://huggingface.co/kurtulus7182/SEPrimer
- Commit: `237b231a5167f8ee0ff4ad59b2b4ac763d6604a9`
- Mod: active (yalnız demo; gerçek veri modeli değildir).
- Model: https://huggingface.co/kurtulus7182/SEPrimer/resolve/237b231a5167f8ee0ff4ad59b2b4ac763d6604a9/model.onnx
- Bu yayın model eval kapısını geçmez; gerçek kullanıcı başarımı iddiası taşımaz.
