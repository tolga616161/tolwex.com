# Meta Developer App Kurulum Rehberi

Telefondaki şu hata:

> Bu bağlantının domaini uygulamanın domainlerinde yer almıyor

neredeyse her zaman **App Domains / Site URL** eksikliğinden gelir.

## Tolwex (App ID: 1023808800487900) — şu anki URL’ler

Kaynak: `NEXT_PUBLIC_APP_URL`

| Alan | Değer |
|------|--------|
| App Domains | `bucks-travesti-calcium-bell.trycloudflare.com` **ve** `trycloudflare.com` |
| Site URL | `https://bucks-travesti-calcium-bell.trycloudflare.com/` |
| Valid OAuth Redirect URIs | `https://bucks-travesti-calcium-bell.trycloudflare.com/api/meta/oauth/callback` |
| Privacy Policy URL | `https://bucks-travesti-calcium-bell.trycloudflare.com/privacy` |
| Terms URL | `https://bucks-travesti-calcium-bell.trycloudflare.com/terms` |
| Data Deletion | `https://bucks-travesti-calcium-bell.trycloudflare.com/api/data-deletion` |
| Webhook Callback | `https://bucks-travesti-calcium-bell.trycloudflare.com/api/meta/webhook` |

## Adım adım

1. https://developers.facebook.com/apps/1023808800487900/settings/basic/
2. **App Domains** → yukarıdaki iki domain’i ekleyin → Save
3. Altta **Website** platformu yoksa Add Platform → Website → Site URL yapıştırın
4. **Facebook Login → Settings**
   - Valid OAuth Redirect URIs → callback URL
   - “Login with the JavaScript SDK” gerekmez
5. **Roles → Roles** → kendi Facebook hesabınızı Admin/Developer/Tester ekleyin  
   (Development mode’da yalnızca roller bağlanabilir)
6. 1–2 dakika bekleyin, mobilde tekrar deneyin

## Neden Facebook açılıyor?

Instagram hesap bağlantısı resmi Meta Graph / Facebook Login OAuth üzerinden yapılır.
Bu beklenen davranıştır. Kullanıcı şifresini sitemize yazmaz.

## Not

`*.trycloudflare.com` tünelleri geçicidir. URL değişirse App Domains + Redirect URI’yi yeniden güncelleyin.
Production’da sabit domain (HTTPS) kullanın.

## Ortam değişkenleri

- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI` (callback ile birebir aynı olmalı)
- `META_API_VERSION`
- `META_WEBHOOK_VERIFY_TOKEN`
