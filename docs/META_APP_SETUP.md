# Meta Developer — TOLWEX kurulum rehberi

Bu uygulama **resmi Meta OAuth** kullanır. Şifre, cookie veya 2FA yakalanmaz.
Secret değerler yalnızca sunucu `.env` dosyasında tutulur; frontend’e gönderilmez.

> Node hosting gerekir (Vercel / Hostinger Node vb.). GitHub Pages üzerinde `/api/*` çalışmaz.

---

## 1) `.env` değerleri

| Değişken | Kaynak (Meta panel) | Örnek / not |
|----------|---------------------|-------------|
| `META_APP_ID` | App → Settings → Basic → **App ID** | Panelden kopyala |
| `META_APP_SECRET` | App → Settings → Basic → **App Secret** | Asla commit etme |
| `META_REDIRECT_URI` | Sizin seçtiğiniz callback URL | `https://tolwex.com/api/meta/oauth/callback` |
| `META_API_VERSION` | Graph API sürümü | `v21.0` |
| `META_WEBHOOK_VERIFY_TOKEN` | Sizin ürettiğiniz rastgele token | `openssl rand -hex 24` |
| `NEXT_PUBLIC_APP_URL` | Canlı domain | `https://tolwex.com` |
| `SESSION_SECRET` | Sizin ürettiğiniz | min 32 karakter |
| `TOKEN_ENCRYPTION_KEY` | Sizin ürettiğiniz | `openssl rand -hex 32` |

Şablon: kök dizindeki `.env.example`

---

## 2) Meta Developer paneline girilecek alanlar

App: [developers.facebook.com/apps](https://developers.facebook.com/apps/)

### Settings → Basic

| Alan | Değer |
|------|--------|
| **App Domains** | `tolwex.com` |
| **Privacy Policy URL** | `https://tolwex.com/privacy` |
| **Terms of Service URL** | `https://tolwex.com/terms` |
| **User Data Deletion** | `https://tolwex.com/api/data-deletion` (veya Data Deletion Callback) |
| **Site URL** (Website platform) | `https://tolwex.com/` |

### Facebook Login → Settings

| Alan | Değer |
|------|--------|
| **Valid OAuth Redirect URIs** | `https://tolwex.com/api/meta/oauth/callback` |
| **Client OAuth Login** | Yes |
| **Web OAuth Login** | Yes |

> Redirect URI, `.env` içindeki `META_REDIRECT_URI` ile **birebir aynı** olmalı.

### Instagram / Instagram Graph (ürün ekliyse)

- Instagram ürününü App’e ekleyin.
- Gerekli izinler (App Review sürecine göre): örn. `instagram_basic`, business hesap alanları.
- Development modunda test kullanıcılarını Roles → Roles / Instagram Testers altına ekleyin.

### Webhooks (opsiyonel)

| Alan | Değer |
|------|--------|
| **Callback URL** | `https://tolwex.com/api/meta/webhook` |
| **Verify Token** | `.env` → `META_WEBHOOK_VERIFY_TOKEN` |

---

## 3) Uygulama içi kurulum

1. `.env.example` → `.env` kopyala, değerleri doldur.
2. `npm run db:push && npm run db:seed`
3. Sunucuyu başlat (`npm run dev` veya production start).
4. `/admin61` → şifre ile giriş → **Meta API Kurulum** sihirbazı.
5. **Connection Test** ile Graph API doğrula (sahte başarı üretilmez).

---

## 4) Kullanıcı akışı

1. Site: **Instagram ile Bağlan** → `/api/meta/oauth/start`
2. Meta login → callback → `/api/meta/oauth/callback`
3. Dashboard: `/instagram/dashboard` (yalnızca API’den gelen gerçek alanlar)

---

## 5) Güvenlik kuralları

- `META_APP_SECRET` ve access token **asla** client bundle’a konmaz.
- Token’lar `TOKEN_ENCRYPTION_KEY` ile veritabanında şifreli saklanır.
- Production’da HTTPS zorunlu (`NEXT_PUBLIC_APP_URL` https olmalı).
