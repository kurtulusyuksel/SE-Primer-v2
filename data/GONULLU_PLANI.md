# 15 gerçek oturum toplama planı

Bu dosya 15 oturumluk veriyi eksiksiz toplama protokolüdür. Bu turda oturumları kullanıcı
kendisi oynayacak; gönüllü mesajı ve tablo yine de başka katılımcı eklenirse kullanılabilir.
Oturumlar bu makinede uydurulmaz; her satır gerçek bir oyundan gelir.

## Güncel veri durumu — 4 Kasım 2026

**Veri sıfırlandı.** Önceki 30 oturumluk / 90 satırlık gerçek veri yalnız çalışma dosyasından
kaldırıldı; Git geçmişi silinmedi. `data/oturumlar.csv` şu an yalnız başlık satırı içeriyor.
Kullanıcı 15 tamamlanmış oturumu kendisi yeniden oynayarak toplayacak. Yeni veri gelene kadar
gerçek veri eğitimi ve HF gerçek model yayını kapalıdır.

Önceki deneme (tarihsel): iki UUID-çakışmasız dışa aktarımdan birleştirilmiş 30 oturumda
holdout doğruluğu 0.791667 görünse de model tüm holdout kararlarını 0 tahmin etti ve ilk üç
altın örneği geçemedi; eval kapısı reddedildi. Kök neden (`scripts/analyze_eval.py`): 90 satır
yalnız 30 benzersiz özellik vektörü üretiyordu, 12 vektör çelişkili ve çoğunluk tavanı 0.7778
idi. Süreler 1–21 sn (8 değer) iken altın örnekler 40–55 sn. Bu yüzden yalnız aynı kişiden
daha fazla oturum toplamak genellemeyi kanıtlamaz; yeni 15 oturum da tek kullanıcıdan
toplanacağı için sonuç yalnız o kişiye ait olur. Etiket veya kararlar model eşiğini geçsin
diye yönlendirilmemelidir.

## Başlamadan önce: tarayıcıyı temizle

Canlı uygulamayı açtıktan sonra ana ekrandaki **Kayıtları sil** düğmesine basın. Eski 30
oturum tarayıcı `localStorage`'ında hâlâ duruyor olabilir; temizlenmezse yeni CSV eski
kayıtları da içerir. Silme sonrası sayaç 0 olmalı; ardından veri toplama modunu yeniden açın.

## Hedef

- 15 **tamamlanmış** oturum = 45 karar satırı.
- Bu tur tek kullanıcıyla (K1) yapılacak: 15 oturum, her oturum üç sahne bitirilerek tamamlanır.
- Profil çeşitliliği için oturumları yeni başlayan ve deneyimli arasında dönüşümlü oynayın;
  tek profile sıkışmayın.
- Aynı kullanıcının oturumları ayrı UUID alır; oturum bazlı holdout bu yüzden önemlidir.
- Sonuçlar yalnız bu kullanıcı için raporlanır; farklı katılımcılara genelleme iddia edilmez.
  Gönüllü bulunursa aynı protokolle ek oturum toplanabilir.

## 8 karar yolu

Üç sahne × iki seçenek = en fazla 8 olası A/B yolu:

`AAA · AAB · ABA · ABB · BAA · BAB · BBA · BBB`

15 oturum bu yolları ister istemez tekrar eder; bu normaldir. Veri setinin birimi 8 yol değil,
45 karar satırıdır. Model A/B seçimini değil, karar öncesi `ipucu_gerekli` etiketini tahmin eder;
aynı yol farklı süre, ipucu ve profille farklı satır üretir.

İdeal dağılım: 8 yolun en az birer kez görülmesi, kalan 7 oturumun dengeli dağılması.
Ancak gönüllülerin seçimini yönlendirmeyin; yol çeşitliliği için etiketi veya kararı
zorlamak veriyi yanlılaştırır. Tablodaki “Not” alanına isterseniz gözlenen yolu yazın.

## Paylaşılacak bağlantı

https://kurtulusyuksel.github.io/SE-Primer-v2/

Bu tur veriyi kendiniz toplayacaksanız aşağıdaki gönüllü mesajını göndermeniz gerekmez.
Başka gönüllü eklemek isterseniz mesaj hazır:

> Merhaba, yazılım mühendisliği dersi için kısa bir kriz simülasyonu test ediyorum.
> Yaklaşık 5–8 dakika sürüyor; üç sahne var. İsterseniz oyun içindeki veri toplama
> kutusunu açıp kendi ihtiyaç etiketinizi işaretleyin. Ad, e-posta veya başka kişisel
> bilgi istemiyorum; kayıt yalnızca sizin tarayıcınızda tutulur ve CSV olarak dışa
> aktarılır. Katılım tamamen gönüllüdür, istediğiniz an bırakabilirsiniz.

## Gönüllüye verilecek adımlar

1. Bağlantıyı açın; profil seçin (yeni başlayan / deneyimli).
2. İlk oyundan önce ana ekrandaki **Kayıtları sil** düğmesine basın; eski kayıtlar kalmasın.
3. Veri toplama kutusundaki gönüllülük metnini okuyun ve kutuya tik atın.
4. Her sahnede, sonucu görmeden **kendi ihtiyaç etiketinizi** seçin:
   “yardım gerekli” veya “kendim ilerleyebilirim”.
5. Kararı verin; üç sahneyi bitirin.
6. Sonuç ekranından ana ekrana dönün. Yeni oyun = yeni oturum.
7. Ana ekrandaki **CSV indir** düğmesiyle dosyayı indirip size gönderin.
   Dosyada ad/e-posta yoktur; yalnızca oturum UUID'si ve sayısal özellikler vardır.

Yarım kalan oturumlar dışa aktarılmaz. Bir cihazın yeni dışa aktarımı eski kayıtları
da içerir; aynı dosyayı iki kez birleştirmeyin.

## İlerleme tablosu

Tablo elle doldurulur; `oturum_id` dosyadan kısaltılarak yazılabilir.

| # | Tarih | Gönüllü kodu | Profil | Oturum ID (kısa) | Sahne | CSV dosyası | Not |
|---|---|---|---|---|---|---|---|
| 1 |  | K1 | yeni |  | 3/3 |  |  |
| 2 |  | K1 | deneyimli |  | 3/3 |  |  |
| 3 |  | K1 | yeni |  | 3/3 |  |  |
| 4 |  | K1 | deneyimli |  | 3/3 |  |  |
| 5 |  | K1 | yeni |  | 3/3 |  |  |
| 6 |  | K1 | deneyimli |  | 3/3 |  |  |
| 7 |  | K1 | yeni |  | 3/3 |  |  |
| 8 |  | K1 | deneyimli |  | 3/3 |  |  |
| 9 |  | K1 | yeni |  | 3/3 |  |  |
| 10 |  | K1 | deneyimli |  | 3/3 |  |  |
| 11 |  | K1 | yeni |  | 3/3 |  |  |
| 12 |  | K1 | deneyimli |  | 3/3 |  |  |
| 13 |  | K1 | yeni |  | 3/3 |  |  |
| 14 |  | K1 | deneyimli |  | 3/3 |  |  |
| 15 |  | K1 | yeni |  | 3/3 |  |  |

## Toplama sonrası

```powershell
# Tek kullanıcıdan 15 oturum bitince bir kez CSV indirin; birleştirme gerekmez.
# Birden fazla CSV varsa yalnız o zaman birleştirin (başlık tekilleştirilir):
.\.venv\Scripts\python.exe scripts/merge_exports.py indirilen1.csv indirilen2.csv

# Kapıyı kontrol et: 15 tamamlanmış oturum, 45 satır, iki sınıf
.\.venv\Scripts\python.exe scripts/validate_data.py --data data/oturumlar.csv

# Gerçek veriyle eğit; kapı geçmezse artefakt üretilmez
.\.venv\Scripts\python.exe train.py

# Python/WASM paritesi ve uygulama testleri
.\.venv\Scripts\python.exe tests/parite.py
npm run lint
npm run build
```

Kapı geçtikten sonra `model/config.json` içindeki `status` ve `real_sessions`
alanlarını betik günceller; elle “gerçek” yazmayın.
