# 60–90 saniyelik demo çekim planı

Bu dosya çekim planıdır. Video kaydedildi: `assets/demo.mp4`, 75,7 sn, H.264 + AAC.
Video, sahibinin kendi sesiyle 60–90 saniye içinde anlatılmalıdır. Aşağıdaki metin
yaklaşık 80 saniyelik bir okuma içindir; birebir okunmak zorunda değildir.

## Seslendirme metni (yaklaşık 80 sn)

> Bu, Muhteşem Cuma kriz odası. Saat 00:00, ödeme servisi çöktü; oyuncu üç sahnede
> mimari, test ve gizlilik kararları veriyor. Ekrandaki küçük model Gemini değil;
> yalnızca karar öncesi yardım ihtiyacını tahmin eden, tarayıcıda WASM ile çalışan
> sentetik demo bir sınıflandırıcı.
>
> Deneyimli profildeyim. İlk sahnede model otomatik müdahale etmiyor; süre ilerliyor
> ve karar bana kalıyor.
>
> Şimdi yeni başlayan profilde aynı sahne. Model, karar öncesi öz bildirimimi ve
> bekleme süremi görüp Sokratik bir soru açıyor. Model laboratuvarında iki örneğin
> olasılıklarını görüyorsunuz; bu ekran gerçek oyunun yerine geçmiyor, yalnızca
> çıkarımı kanıtlıyor.
>
> Deneyimli profile dönüyorum; yeterince beklediğimde süre baskısı duruyor, çünkü
> kriz freni riski düşürüyor.
>
> Veri toplama açık; 15 oturum topladım, ancak etiketlerin neredeyse tamamı 0 çıktığı
> için model eğitimi kapıda reddedildi. Model hâlâ sentetik demo. Sentetik demoyu Hugging
> Face'te açık etiketle yayınladım; eval kapısını geçmediği için gerçek veri modelini
> yayınlamadım. Python ve tarayıcı çıkarımı aynı sonucu veriyor. Bu video, sentetik demo
> modelini ve mevcut v2 akışını gösteriyor.

Çekimden önce tarayıcıyı gizli pencerede açın, kişisel sekme/parola göstermeyin.


1. 0–15 sn: Muhteşem Cuma problemi; küçük modelin Gemini'den farklı görevi; sentetik demo etiketi.
2. 15–30 sn: Deneyimli oyuncuyu başlat; ilk sahnede otomatik müdahale olmadığını göster.
3. 30–55 sn: Yeni başlayan oyuncuda aynı sahnede uzun bekleme örneğini hızlandırılmış kesitle
   göster; modelin banner ve soru tonunu göster. Model lab'ında referans `[0,55,1,0,2]`
   ile `[1,12,0,0,1]` olasılıklarını da göster. Gerçek oyundaki ekranı lab ile karıştırma.
4. 55–70 sn: Deneyimli oyuncunun yeterli beklemesiyle süre baskısının durmasını göster.
   Bekleme süresi çekimde kesilebilir; gerçekten modelin çalıştığını belirt.
5. 70–90 sn: Veri toplama protokolü (15 oturum, tek kullanıcı) ve gerçek veri eval
   kapısının henüz geçilmediği; Hugging Face'te yalnız açık etiketli sentetik demonun
   yayında olduğu.

Teslim videosu iki oyuncunun **aynı sahnede** farklı model kararını gerçek arayüzde
göstermeli. Lab ekranı tek başına bu koşulu karşılamaz. Kişisel veri/anahtar gösterme.

## Çekim kontrol listesi

**Önce**

- [ ] Canlı adresi gizli pencerede aç: https://kurtulusyuksel.github.io/SE-Primer-v2/
- [ ] 1920×1080, %100 yakınlaştırma; bildirimleri ve kişisel sekmeleri kapat.
- [ ] Mikrofonu test et; sesin videoda net duyulduğunu kontrol et.
- [ ] Ekran kaydını 30 fps başlat; fare imlecini yavaş hareket ettir.

**Çekerken**

- [ ] Aynı sahneyi (sahne 1) önce deneyimli, sonra yeni başlayan profilde göster.
- [ ] Deneyimli profilde otomatik müdahale olmadığını ve sürenin ilerlediğini göster.
- [ ] Yeni başlayan profilde ihtiyaç etiketini işaretle; yeterince bekle.
- [ ] Banner ve sahneye özel Sokratik sorunun açıldığını göster.
- [ ] Model laboratuvarında `[0,55,1,0,2]` ve `[1,12,0,0,1]` olasılıklarını göster.
- [ ] Sentetik demo etiketini ve gerçek veri modelinin yayınlanmadığını söyle.

**Sonra**

- [x] Kaydı 60–90 saniyeye kırp; gerekiyorsa 2–3 kesit kullan. (75,7 sn)
- [x] `assets/demo.mp4` olarak kaydet ve README'deki video bağlantısını buna çevir.
- [x] `.\.venv\Scripts\python.exe scripts/delivery_check.py` çalıştır;
      "Demo videosu" satırının GEÇTİ olduğunu doğrula.
- [ ] Videoda ad, e-posta, token veya kişisel sekme görünmediğini son kez izle.
