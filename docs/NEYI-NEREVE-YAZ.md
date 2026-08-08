# Neyi nereye yazacaksın? (hata istemiyorsan burayı takip et)

## 1) Meta Developer Console (zorunlu — bağlantı hatası için)

Aç: https://developers.facebook.com/apps/1023808800487900/settings/basic/

| Nereye | Ne yapıştır |
|--------|-------------|
| **App Domains** | `bucks-travesti-calcium-bell.trycloudflare.com` **ve** `trycloudflare.com` |
| **Website → Site URL** | `https://bucks-travesti-calcium-bell.trycloudflare.com/` |
| **Facebook Login → Settings → Valid OAuth Redirect URIs** | `https://bucks-travesti-calcium-bell.trycloudflare.com/api/meta/oauth/callback` |
| **Privacy Policy URL** | `https://bucks-travesti-calcium-bell.trycloudflare.com/privacy` |
| **Terms of Service URL** | `https://bucks-travesti-calcium-bell.trycloudflare.com/terms` |
| **Data Deletion** | `https://bucks-travesti-calcium-bell.trycloudflare.com/api/data-deletion` |
| **Webhooks → Callback URL** | `https://bucks-travesti-calcium-bell.trycloudflare.com/api/meta/webhook` |
| **Webhooks → Verify Token** | `.env` içindeki `META_WEBHOOK_VERIFY_TOKEN` (admin panelde de görünür) |
| **Roles → Roles** | Kendi Facebook hesabını Admin/Developer/Tester ekle |

Kaydet → 1–2 dk bekle → telefonda tekrar dene.

> Domain / URL değişirse (yeni cloudflare tüneli) bu tabloyu yeni adrese göre güncelle.
> Teknik URL’ler artık **sadece Admin** panelinde; müşteri sitesinde görünmez.

## 2) Ürün fiyat / içerik değiştirme (Admin)

1. Siteye git → `/admin` → şifre: `.env` içindeki `ADMIN_PASSWORD`
2. `/admin/products` aç
3. Ürüne **Düzenle** bas
4. Ad, fiyat, kısa/uzun açıklama, özellikler (her satır 1 madde), rozet, aktif/öne çıkan
5. **Güncelle**

Hazır ürünler:

| Ürün | Fiyat | Sayfa |
|------|-------|-------|
| Haber / İçerik Silme | ₺4.500 | `/urunler/haber-silme` |
| Fake Hesap Kapatma | ₺2.990 | `/urunler/fake-hesap-kapatma` |
| Instagram Hesap Güvenlik | ₺499 | `/urunler/instagram-hesap-guvenlik-kontrolu` |
| Instagram Yönetim | ₺4.990 | `/urunler/instagram-yonetim-paketi` |
| … diğerleri | katalogda | `/urunler` |

Fiyatı değiştirmek için kod yazmana gerek yok — admin panel yeterli.

## 3) Telefon / WhatsApp

Site geneli numara: **+90 533 823 61 75** (`+905338236175`)

- Sağ altta yeşil WhatsApp butonu
- Footer, ürün formu, menü

Numarayı değiştirmek için: `src/lib/contact.ts`

## 4) Instagram güvenlik akışı (müşteri)

1. `/instagram/connect` → **Instagram Hesabımı Bağla**
2. Meta’nın resmi ekranı açılır (şifre sitede yazılmaz)
3. Onay → `/instagram/dashboard`
4. Orada: bağlantı durumu, izinler, hesap bilgisi, checklist, 2FA rehberi

API anahtarları / App Secret müşteriye gösterilmez.

## 5) Admin Meta testi

`/admin/setup` → Domain kartı + sihirbaz → “Meta API Bağlantısını Test Et”

PASS görmelisin. OAuth hâlâ domain hatası veriyorsa sorun kodda değil; yukarıdaki Meta tablo eksiktir.
