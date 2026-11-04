---
language: tr
library_name: sklearn
tags:
  - onnx
  - tabular-classification
  - education
  - logistic-regression
model-index:
  - name: SE Primer Kriz Freni
    results: []
---

# SE Primer — Kriz freni model kartı

> **Sentetik demo (`synthetic-demo`):** Bu artefakt yalnız `scripts/generate_demo.py`
> tarafından üretilen sentetik veriyle eğitilmiştir. Gerçek kullanıcı verisiyle
> eğitilmedi; gerçek öğrenci başarımı, genelleme veya üretim kullanımı iddiası taşımaz.
> Gerçek veri adayı eval kapısını geçemediği için yayınlanmamıştır.

## Amaç
Muhteşem Cuma ödeme krizi oyununda oyuncunun yönlendirici ipucu isteyip istemediğini
tahmin etmek. Lojistik regresyon + StandardScaler tek ONNX pipeline'ıdır. Ölçeklemeyi
istemci ayrıca yapmaz. Pozitif sınıf 1; karar eşiği 0.60. Sahneye özgü soru, mentorun
açılma zamanı ve deneyimli modun sayaç durdurması bu kararı kullanır.

## Veri ve ölçüm
Güncel durum ve kesin metrikler aynı commit'teki `config.json` içindedir.
`status=synthetic-demo` ise gerçek insan başarımı **ölçülmemiştir**; sentetik doğruluk
gerçek kullanıcılarda başarı demek değildir. 240 sentetik oturumun üreticisi seed=42 ile
`scripts/generate_demo.py` dosyasında; veri sözlüğünde açık kuralı yazılıdır.
Gerçek veri adayı yalnız en az 15 tamamlanmış gerçek oturumdan eğitilebilir.
Etiket karar öncesi öz bildirimdir; modelden veya A/B sonucundan üretilmez.

Holdout oturum bazlı %25; seed=42. Test doğruluğu `p>=0.60` kararıyla hesaplanır.
Kabul kapısı accuracy>=0.75. Her iki sınıf hem eğitim hem testte bulunmalıdır.
Ayrıca holdout çoğunluk baseline'ı hesaplanır; model bunu kesin olarak aşmalıdır,
eşitlik de reddedilir. Tek sınıfı tahmin eden model yayımlanmaz.
ONNX/sklearn tüm veri ve referanslarda mutlak olasılık farkı <1e-4.
Test kümesiyle model seçimi yapılmaz; başarısızlıkta daha çeşitli veri toplanır.

## Sözleşme ve yeniden üretim
`contract.json` eğitim öncesi özellik sırası, aralıklar ve eşiklerdir.
`config.json` giriş `[N,5] float32`, çıkış adı, sınıf sırası, metrikler, veri/model SHA256
ve bağımlılık sürümlerini içerir. Model dosyası ile config birlikte sürümlenir.
Tam bağımlılıklar `requirements-lock.txt`; eğitim komutu repo README'sinde.
Python oracle ve gerçek tarayıcı WASM'ı aynı beş referansla karşılaştırılır.

## Sınırlar / kullanılmaması gereken durumlar
Küçük ve tek hikâyeye ait veri; tekrar oyunlarında öğrenme etkisi; öz bildirim yanlılığı.
Profil seçimi uzmanlığın nesnel ölçümü değildir. Uzun düşünmek başarısızlık değildir.
Oturum ayrımı kişi ayrımı garantilemez. Model olasılıkları kalibre edilmiş güven puanı değildir.
Öğrenci notlandırma, işe alım, kişilik/sağlık değerlendirmesi veya gerçek ödeme sistemlerinde
karar verme için kullanılmaz. İstemciye indirilen model gizli değildir.

## Kaynaklar
- https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
- https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupShuffleSplit.html
- https://onnx.ai/sklearn-onnx/auto_tutorial/plot_dbegin_options_zipmap.html
- https://onnxruntime.ai/docs/tutorials/web/deploy.html
