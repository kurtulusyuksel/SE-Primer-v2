# 60–90 saniyelik demo çekim planı

Bu dosya çekim planıdır; video henüz kaydedilip yayınlanmadı.
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
> Veri toplama açık ama henüz sıfır gerçek oturum var. On beş oturum toplanmadan
> gerçek veri başarımı iddia etmiyorum. Python ve tarayıcı çıkarımı aynı sonucu
> veriyor. Bu video, sentetik demo modelini ve mevcut v2 akışını gösteriyor.

Çekimden önce tarayıcıyı gizli pencerede açın, kişisel sekme/parola göstermeyin.


1. 0–15 sn: Muhteşem Cuma problemi; küçük modelin Gemini'den farklı görevi; sentetik demo etiketi.
2. 15–30 sn: Deneyimli oyuncuyu başlat; ilk sahnede otomatik müdahale olmadığını göster.
3. 30–55 sn: Yeni başlayan oyuncuda aynı sahnede uzun bekleme örneğini hızlandırılmış kesitle
   göster; modelin banner ve soru tonunu göster. Model lab'ında referans `[0,55,1,0,2]`
   ile `[1,12,0,0,1]` olasılıklarını da göster. Gerçek oyundaki ekranı lab ile karıştırma.
4. 55–70 sn: Deneyimli oyuncunun yeterli beklemesiyle süre baskısının durmasını göster.
   Bekleme süresi çekimde kesilebilir; gerçekten modelin çalıştığını belirt.
5. 70–90 sn: Veri toplama, Python/WASM paritesi ve 15 gerçek oturumun henüz tamamlanmadığı.

Teslim videosu iki oyuncunun **aynı sahnede** farklı model kararını gerçek arayüzde
göstermeli. Lab ekranı tek başına bu koşulu karşılamaz. Kişisel veri/anahtar gösterme.
