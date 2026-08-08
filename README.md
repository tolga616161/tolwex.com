# SecureLink — Meta / Instagram OAuth Hesap Kontrolü

Resmi Meta/Instagram OAuth ile Instagram hesabı bağlama ve güvenlik kontrolü.

## Temel kural

Kullanıcıdan **asla** istenmez:

- Instagram şifresi
- Cookie / session
- 2FA / recovery code
- Manuel access token

Yalnızca resmi Meta OAuth ekranı kullanılır.

## Kurulum

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Tarayıcı: http://localhost:3000

## Environment

`.env.example` dosyasındaki değişkenleri doldurun:

- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI`
- `META_API_VERSION`
- `META_WEBHOOK_VERIFY_TOKEN`
- `TOKEN_ENCRYPTION_KEY` (`openssl rand -hex 32`)
- `SESSION_SECRET` (min 32 karakter)
- `ADMIN_PASSWORD`

Credential yoksa uygulama çalışır; Meta özelliği **“yapılandırılmamış”** gösterilir. Sahte API verisi üretilmez.

## Meta Developer App

[Meta for Developers](https://developers.facebook.com/) üzerinde uygulama oluşturun:

| Alan | Değer |
|------|--------|
| App ID / Secret | `.env` |
| Valid OAuth Redirect URI | `{APP_URL}/api/meta/oauth/callback` |
| App Domains | sitenizin domain’i |
| Privacy Policy URL | `{APP_URL}/privacy` |
| Terms URL | `{APP_URL}/terms` |
| Data Deletion Callback | `{APP_URL}/api/data-deletion` |

Admin paneli: `/admin` → **Meta API Kurulum** sihirbazı.

## Akış

1. Ana sayfa → **Instagram Hesabımı Kontrol Et**
2. Resmi Meta OAuth
3. Callback → sunucu token alışverişi (şifreli saklama)
4. `/instagram/dashboard` — bağlantı, izinler, API durumu
5. Güvenlik checklist’i (kullanıcı beyanı; API sonucu değil)
6. İstenirse bağlantıyı kaldır

## Güvenlik

- Access token AES-256-GCM ile şifreli saklanır
- Token / App Secret frontend’e gönderilmez
- OAuth `state` + CSRF koruması
- Audit log (token yazılmaz)
- API’nin vermediği alanlar için açık “sağlanmıyor” mesajı
