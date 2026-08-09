/**
 * TOLWEX iade / iptal koşulları.
 * Kaynak: panel hizmet şartları (teslimat, iade ve telafi maddeleri).
 * Üye ve ziyaretçiye TOLWEX markası altında sunulur.
 */

export type IadeMadde = {
  id: string;
  title: string;
  body: string;
};

export const IADE_INTRO =
  "TOLWEX üzerinden sipariş verdiğinizde aşağıdaki iade ve iptal koşullarını kabul etmiş sayılırsınız. Sipariş öncesi servis açıklamasını okuyunuz.";

export const IADE_MADDELER: IadeMadde[] = [
  {
    id: "1",
    title: "Sipariş onayı",
    body: "Sipariş verdikten sonra bu koşulları okumuş ve kabul etmiş sayılırsınız. Koşullar önceden haber verilmeksizin güncellenebilir; her sipariş öncesi bu sayfayı kontrol etmeniz önerilir.",
  },
  {
    id: "2",
    title: "İşleme alınan siparişlerde manuel iade yok",
    body: "Sipariş sisteme girdikten sonra kullanıcı talebiyle iptal veya iade kabul edilmez. Sipariş tamamlanmazsa veya kısmen tamamlanırsa, tamamlanmayan kısım için ücret otomatik olarak bakiyenize iade edilir.",
  },
  {
    id: "3",
    title: "Teslimat süresi garantisi yok",
    body: "Servislerde yazan başlama ve tamamlanma süreleri tahmindir; garanti değildir. Sipariş işlenirken “geç kaldı” gerekçesiyle iade yapılmaz. Yoğunluğa göre süreler uzayabilir.",
  },
  {
    id: "4",
    title: "Yanlış link ve gizli hesap",
    body: "Yanlış, eksik veya özel (gizli) hesaba verilen siparişlerden kullanıcı sorumludur. Bu durumlarda sipariş tamamlandı görünse bile iade yapılmaz. Sipariş öncesi profilin herkese açık olduğundan emin olun.",
  },
  {
    id: "5",
    title: "Aynı linke ikinci sipariş",
    body: "Bir sipariş bitmeden aynı linke yeni sipariş vermeyin. Çakışan siparişlerde hata, gecikme veya bakiye kaybı oluşabilir; bu durumda iade yükümlülüğü doğmaz.",
  },
  {
    id: "6",
    title: "Sipariş sırasında değişiklik",
    body: "Sipariş tamamlanmadan kullanıcı adı, gönderi veya linki değiştirmeyin; hesabı gizlemeyin veya başka panelden aynı linke çekim yapmayın. Aksi halde sonuç hatalı olabilir ve iade yapılmayabilir.",
  },
  {
    id: "7",
    title: "Garantili ve garantisiz servisler",
    body: "Açıklamasında garantili yazmayan servisler garantisizdir; düşüş olursa telafi veya iade yapılmaz. Garantili servislerde yalnızca servis açıklamasında belirtilen süre ve koşullar geçerlidir. Telafi, yalnızca ilgili servisin kendi gönderdiği veri için geçerlidir.",
  },
  {
    id: "8",
    title: "Başlangıç sayısının altı",
    body: "Sipariş başlangıç sayısının altına düşen veya platform filtrelerine (ör. işaretlenenler) takılan hesaplar için telafi veya iptal sağlanmaz. Gerekli hesap ayarlarını sipariş öncesi yapmanız gerekir.",
  },
  {
    id: "9",
    title: "Kısmi iade sonrası telafi",
    body: "Kısmi iade yapılan siparişlerde aynı sipariş için yeniden telafi uygulanmaz. Eksik kalan kısım için yeni sipariş oluşturabilirsiniz.",
  },
  {
    id: "10",
    title: "Düşüş ve platform güncellemeleri",
    body: "Sosyal medya platformlarının güncelleme, filtre veya kısıtlamaları nedeniyle oluşabilecek düşüşlerde, servis açıklamasında telafi yoksa iade yapılmaz. Bot veya düşük kaliteli servislerde düşüş riski yüksektir.",
  },
  {
    id: "11",
    title: "Bakiye iadesi",
    body: "Yüklenen bakiye nakit olarak iade edilmez; panel içinde siparişlerde kullanılır. Otomatik sipariş iadeleri bakiyenize tanımlanır.",
  },
  {
    id: "12",
    title: "Servis değişikliği",
    body: "Siparişin tamamlanması için gerekli görülürse eşdeğer bir servis tipi kullanılabilir. Fiyatlar önceden haber verilmeksizin güncellenebilir; güncel fiyat sipariş anındaki listedir.",
  },
];
