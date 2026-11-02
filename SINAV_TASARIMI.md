# Benimle uyumlanan bir klasik vize sorusu

**Senaryo (tek sayfa / 30 dakika):** Muhteşem Cuma kriz odasında iki oyuncu aynı test
sahnesine gelir. Birinde mentor otomatik açılır; diğerinde açılmaz. Python oracle aynı
girdi için p=0.60004, tarayıcı p=0.59998 üretmektedir. Model eşiği 0.60; kabul edilen
olasılık farkı 1e-4. CSV'de aynı oturuma ait üç satır vardır. Ekip accuracy=0.92 açıklayıp
modeli doğrudan tüm kullanıcılara açmak istiyor.

**Öğrencinin başlangıç seçimi:** Güçlü olduğun alanı seç (test / veri / dağıtım).
Önce o alanın sorusunu cevapla; sonra diğer iki alan için kısa gerekçe yaz. Seçim yalnız
sıralamayı değiştirir; puanlama ve beklenen temel kavramlar herkes için aynıdır.

1. **Test (30 puan):** Bu iki olasılık parite testini geçer mi? Davranış aynı mıdır?
   Beş ve 300 referans girdili testlerin neyi kanıtlayıp neyi kanıtlayamayacağını açıklayın.
   Eski A-A-A akışını korumak için bir regresyon testi tasarlayın.
2. **Veri (30 puan):** Rastgele satır ayrımındaki sızıntıyı açıklayın. Grup ayrımını ve
   modelden bağımsız etiketi önerin. 0.92'nin yalnız sentetik veriden gelmesi ne değiştirir?
3. **Dağıtım (30 puan):** Shadow -> %5 canary -> aşamalı geçiş ve bir rollback tetikleyicisi
   önerin. Commit SHA ile sabitleme neden `main` URL'sinden daha güvenlidir?
4. **Gerekçe (10 puan):** Bu müdahalenin teknik doğrulaması ile oyuncuya gerçekten yararlı
   olmasının geçerlemesini ayrı birer örnekle anlatın.

**Beklenen öz:** 0.00006 < 0.0001 olduğu için sayısal parite geçer; karar eşiğinin iki
yanında kaldıklarından davranış farklı olabilir. Parite modelin doğru/yararlı olduğunu
kanıtlamaz. Test örneklerini görmek eğitim başarısı değildir. Oturum bazlı holdout,
gönüllü karar öncesi etiket, gerçek/sentetik ayrımı, regresyon ve sürümlü geri alma gerekir.
**Çeldiriciler:** toleransı accuracy sanmak; 300 girdiyi eğitim kümesi yapmak; test
başarısını eğitimsel fayda saymak; shadow'da oyuncunun davranışını değiştirmek; aynı
kişinin farklı oturumlarını grup ayrımının kesin olarak ayırdığını varsaymak.
