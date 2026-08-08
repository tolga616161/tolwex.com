# Neyi nereye yazacaksın? — TOLWEX (tolwex.com)

## 1) Meta Developer Console (zorunlu)

Aç: https://developers.facebook.com/apps/1023808800487900/settings/basic/

| Nereye | Ne yapıştır |
|--------|-------------|
| **App Domains** | `tolwex.com` |
| **Website → Site URL** | `https://tolwex.com/` |
| **Facebook Login → Valid OAuth Redirect URIs** | `https://tolwex.com/api/meta/oauth/callback` |
| **Privacy Policy URL** | `https://tolwex.com/privacy` |
| **Terms of Service URL** | `https://tolwex.com/terms` |
| **Data Deletion** | `https://tolwex.com/api/data-deletion` |
| **Webhooks → Callback URL** | `https://tolwex.com/api/meta/webhook` |
| **Webhooks → Verify Token** | Hostinger env → `META_WEBHOOK_VERIFY_TOKEN` |
| **Roles → Roles** | Kendi Facebook hesabını ekle |

Eski `trycloudflare.com` adreslerini silebilirsin. Kaydet → 1–2 dk bekle.

## 2) Hostinger (siteyi ayağa kaldır)

Domain `tolwex.com` kayıtlı ama şu an **parked** sayfa. Siteyi yayınlamak için:

1. hPanel → **Websites** → **Add website** / Node.js veya Git deploy
2. GitHub reposunu bağla (veya dosyaları yükle)
3. Build: `npm install && npx prisma generate && npm run build`
4. Start: `npm run start` (port Hostinger’ın verdiği)
5. SSL açık olsun (HTTPS)

### Ortam değişkenleri (Hostinger → Environment)

```
NEXT_PUBLIC_APP_URL=https://tolwex.com
DATABASE_URL=file:./dev.db
SESSION_SECRET=<en-az-32-karakter-rastgele>
TOKEN_ENCRYPTION_KEY=<openssl rand -hex 32>
META_APP_ID=1023808800487900
META_APP_SECRET=<Meta App Secret>
META_REDIRECT_URI=https://tolwex.com/api/meta/oauth/callback
META_API_VERSION=v21.0
META_WEBHOOK_VERIFY_TOKEN=<rastgele-token>
ADMIN_PASSWORD=<güçlü-şifre>
```

## 3) Ürün / fiyat

`/admin` → `/admin/products` → Düzenle → Güncelle

## 4) WhatsApp

`+90 533 823 61 75` — `src/lib/contact.ts`

## 5) Instagram güvenlik

1. `https://tolwex.com/instagram/connect`
2. Meta resmi ekran
3. `https://tolwex.com/instagram/dashboard`
