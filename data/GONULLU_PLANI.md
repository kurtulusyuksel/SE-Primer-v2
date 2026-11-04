# 15 gerçek oturum toplama planı

Bu dosya gönüllü bulma ve veriyi eksiksiz toplama içindir. Oturumlar bu makinede
uydurulmaz; her satır gerçek bir gönüllünün oynadığı oyundan gelir.

## Güncel veri durumu — 4 Kasım 2026

`data/oturumlar.csv` içinde 15 tamamlanmış oturum / 45 karar satırı vardır; iki etiket
de mevcuttur. Kullanıcı bu oturumları kendi gerçek kullanımıyla kaydettiğini bildirmiştir;
15 farklı katılımcı oldukları iddia edilmez. Eğitim holdout doğruluğu 0.333 olduğundan
eval kapısı geçilmedi. Yeni katılımcı ve daha çeşitli davranışlardan veri toplama sürmelidir.
Etiket veya kararlar model eşiğini geçsin diye yönlendirilmemelidir.

## Hedef

- 15 **tamamlanmış** oturum = 45 karar satırı.
- Öneri: 5 gönüllü × 3 oturum. Her oturum üç sahne bitirilerek tamamlanır.
- En az 2 yeni başlayan ve 2 deneyimli profil olsun; tek profile sıkışmayın.
- Aynı gönüllünün oturumları ayrı UUID alır; oturum bazlı holdout bu yüzden önemlidir.

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

Gönüllüye gönderilecek kısa mesaj:

> Merhaba, yazılım mühendisliği dersi için kısa bir kriz simülasyonu test ediyorum.
> Yaklaşık 5–8 dakika sürüyor; üç sahne var. İsterseniz oyun içindeki veri toplama
> kutusunu açıp kendi ihtiyaç etiketinizi işaretleyin. Ad, e-posta veya başka kişisel
> bilgi istemiyorum; kayıt yalnızca sizin tarayıcınızda tutulur ve CSV olarak dışa
> aktarılır. Katılım tamamen gönüllüdür, istediğiniz an bırakabilirsiniz.

## Gönüllüye verilecek adımlar

1. Bağlantıyı açın; profil seçin (yeni başlayan / deneyimli).
2. Veri toplama kutusundaki gönüllülük metnini okuyun ve kutuya tik atın.
3. Her sahnede, sonucu görmeden **kendi ihtiyaç etiketinizi** seçin:
   “yardım gerekli” veya “kendim ilerleyebilirim”.
4. Kararı verin; üç sahneyi bitirin.
5. Sonuç ekranından ana ekrana dönün. Yeni oyun = yeni oturum.
6. Ana ekrandaki **CSV indir** düğmesiyle dosyayı indirip size gönderin.
   Dosyada ad/e-posta yoktur; yalnızca oturum UUID'si ve sayısal özellikler vardır.

Yarım kalan oturumlar dışa aktarılmaz. Bir cihazın yeni dışa aktarımı eski kayıtları
da içerir; aynı dosyayı iki kez birleştirmeyin.

## İlerleme tablosu

Tablo elle doldurulur; `oturum_id` dosyadan kısaltılarak yazılabilir.

| # | Tarih | Gönüllü kodu | Profil | Oturum ID (kısa) | Sahne | CSV dosyası | Not |
|---|---|---|---|---|---|---|---|
| 1 |  | G1 | yeni |  | 3/3 |  |  |
| 2 |  | G1 | yeni |  | 3/3 |  |  |
| 3 |  | G1 | yeni |  | 3/3 |  |  |
| 4 |  | G2 | deneyimli |  | 3/3 |  |  |
| 5 |  | G2 | deneyimli |  | 3/3 |  |  |
| 6 |  | G2 | deneyimli |  | 3/3 |  |  |
| 7 |  | G3 | yeni |  | 3/3 |  |  |
| 8 |  | G3 | yeni |  | 3/3 |  |  |
| 9 |  | G3 | yeni |  | 3/3 |  |  |
| 10 |  | G4 | deneyimli |  | 3/3 |  |  |
| 11 |  | G4 | deneyimli |  | 3/3 |  |  |
| 12 |  | G4 | deneyimli |  | 3/3 |  |  |
| 13 |  | G5 | karışık |  | 3/3 |  |  |
| 14 |  | G5 | karışık |  | 3/3 |  |  |
| 15 |  | G5 | karışık |  | 3/3 |  |  |

## Toplama sonrası

```powershell
# İndirilen CSV'leri tek dosyada birleştir (başlık tekilleştirilir)
.\.venv\Scripts\python.exe scripts/merge_exports.py indirilen1.csv indirilen2.csv

# Kapıyı kontrol et: 15 tamamlanmış oturum, 45 satır, iki sınıf
.\.venv\Scripts\python.exe scripts/validate_data.py data/oturumlar.csv

# Gerçek veriyle eğit; kapı geçmezse artefakt üretilmez
.\.venv\Scripts\python.exe train.py

# Python/WASM paritesi ve uygulama testleri
.\.venv\Scripts\python.exe tests/parite.py
npm run lint
npm run build
```

Kapı geçtikten sonra `model/config.json` içindeki `status` ve `real_sessions`
alanlarını betik günceller; elle “gerçek” yazmayın.
