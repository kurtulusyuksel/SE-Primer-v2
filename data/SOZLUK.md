# Veri sözlüğü ve toplama protokolü

Her satır bir karar öncesi gözlemdir; her tamamlanmış oturum 3 satırdır.

| Sütun | Anlam / birim / aralık |
|---|---|
| oturum_id | Her oyun başlangıcında rastgele UUID; kişi, cihaz veya hesap kimliği değildir. |
| kaynak | `gercek` veya `sentetik`; dosyalar eğitimde karıştırılmaz. |
| seviye | Oyuncunun seçtiği profil: 0 yeni başlayan, 1 deneyimli. |
| karar_suresi_sn | Sahne başlangıcından etiketin işaretlendiği ana kadar geçen saniye; [0,600]. Çıkarımda o anki bekleme süresi. |
| onceki_yanlis_sayisi | Yalnız önceki sahnelerdeki B kararları; 0–2. Mevcut karar bilinmez. |
| ipucu_sayisi | Oturumda o ana kadar mentor açma / soru gönderme eylemleri; 0–30'a kırpılır. İlk otomatik selamlama ve model açılışı sayılmaz. |
| sahne_no | 1 mimari, 2 test, 3 gizlilik. |
| ipucu_gerekli | Karar öncesi gönüllü öz bildirim: 1 yardım gerekli, 0 kendim ilerleyebilirim. Başarı veya tanı etiketi değildir. |

## Gerçek veri toplama

1. Ana ekranda gönüllülük metnini okuyup veri toplama kutusunu açın.
2. Her sahnede sonucu görmeden ihtiyaç etiketini seçip karar verin; 3 sahneyi tamamlayın.
3. Sonuçtan ana ekrana dönün. Yeni oyun yeni rastgele oturumdur.
4. En az 15 tamamlanmış oturum; örneğin 3 farklı gönüllüye beşer oyun oynatın.
   Kişi bilgisi tutulmadığından farklı kişi sayısı yazılımla doğrulanamaz; çeşitliliği ekip gözetir.
5. CSV indir. Dosyayı `data/oturumlar.csv` yerine koyun. Yarım oturumlar dışa aktarılmaz.
6. Farklı cihaz CSV'lerini birleştirirken yalnız tek başlık bırakın. Aynı UUID/sahne tekrarı
   eğitimde reddedilir. Bir cihazın yeni dışa aktarımı eski kayıtları da içerir; tekrar eklemeyin.

Somut 15 oturumluk dağıtım, gönüllü mesajı ve ilerleme tablosu: `data/GONULLU_PLANI.md`.

Otomatik kriz freni toplama sırasında kapalı; manuel mentor kullanılabilir.
Özellikler etiket anında dondurulur, karar anında kaydedilir. Etiket yanlış karar sayısından
veya sentetik üretici kuralından türetilmez. İhtiyaç etiketi öznel ve yanlı olabilir.
İlk üç aynı sahneyi tekrar oynamak öğrenme etkisi yaratır; küçük veriyle genelleme iddia edilmez.
Oturum bazlı ayrım aynı insanın farklı oturumlarda bulunmasını engelleyemez.

Ad, e-posta, IP, konum, cihaz kimliği veya serbest metin veri kümesine alınmaz.
localStorage yalnız bu tarayıcıdadır; kayıtlar ana ekrandaki sil düğmesiyle silinir.
Gönüllü katılım hukuki uygunluğun tek başına garantisi değildir; teslimde kişisel veri paylaşmayın.

## Sentetik veri

`scripts/generate_demo.py`: Python random.Random(42), 240 oturum / 720 karar.
Skor = süre/22 + önceki_yanlış*1.3 + ipucu*.7 - seviye*1.8 + sahne*.15 - 2.6.
Etiket skor>=0; %3 rastgele etiket çevirme. Bu kural gerçek eğitim ihtiyacının kanıtı değildir.
`data/sentetik.csv` ayrı tutulur. Varsayılan `train.py` bunu kullanmaz; `--demo` gerekir.
