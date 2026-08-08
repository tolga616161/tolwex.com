# Meta Developer — TOLWEX (adım adım)

## Önce şunu bil

| Özellik | Durum |
|---------|--------|
| Instagram ile Bağlan (OAuth) | Kod hazır — **Node hosting** şart |
| Admin `/admin61` | Kod hazır — **Node hosting** şart |
| Profilime kim baktı listesi | **Resmi API yok** — sahte liste yok |
| Engelleyenler listesi (kişisel IG) | **Resmi API yok** — sahte liste yok |
| Hesap adı, tip, izinler, medya sayısı | OAuth sonrası API’den gelir |

`tolwex.com` şu an **GitHub Pages** (sadece HTML). Bu yüzden:
- `https://tolwex.com/api/meta/oauth/start` → **404**
- `https://tolwex.com/admin61` → **404**

Çözüm: Vercel veya Hostinger **Node.js**’e deploy + domain oraya bağla.

---

## Meta panelde dolduracakların (App ID: sende)

Aç: https://developers.facebook.com/apps/

### 1) Settings → Basic
| Alan | Yaz |
|------|-----|
| App Domains | `tolwex.com` |
| Privacy Policy URL | `https://tolwex.com/privacy` |
| Terms of Service URL | `https://tolwex.com/terms` |
| User data deletion | `https://tolwex.com/api/data-deletion` |
| Website → Site URL | `https://tolwex.com/` |

### 2) Facebook Login → Settings
| Alan | Yaz |
|------|-----|
| Valid OAuth Redirect URIs | `https://tolwex.com/api/meta/oauth/callback` |
| Client OAuth Login | Yes |
| Web OAuth Login | Yes |

### 3) Ürünler
- **Facebook Login** ekli olsun
- **Instagram** / Instagram Graph (Business) ekle
- Development’ta: Roles → kendi FB hesabın + Instagram tester

### 4) Sunucu `.env` (Node host’ta)
```
NEXT_PUBLIC_APP_URL=https://tolwex.com
META_APP_ID=...panelden...
META_APP_SECRET=...panelden...
META_REDIRECT_URI=https://tolwex.com/api/meta/oauth/callback
META_API_VERSION=v21.0
META_WEBHOOK_VERIFY_TOKEN=...rastgele...
SESSION_SECRET=...min 32 karakter...
TOKEN_ENCRYPTION_KEY=...openssl rand -hex 32...
ADMIN_PASSWORD=...
DATABASE_URL=...
```

Secret’ı siteye / GitHub’a yazma.

### 5) Test
1. Node site ayakta
2. `/admin61` → şifre → Meta kurulum → Connection Test
3. `/instagram/connect` → **Instagram Hesabımı Bağla**
4. Meta ekranı açılır → onay → `/instagram/dashboard`

---

## “Kim baktı” / “Engelleyenler” neden yok?

Instagram bunları **resmi Graph API ile vermiyor**.
Uydurma kullanıcı listesi göstermiyoruz (yasal + ban riski).

Sayfada dürüst açıklama var:
- Profil ziyaret = tahmini sinyal / “liste yok”
- Engelleme = olası sinyal / “resmi liste değil”

---

## Senin sıradaki iş

1. Vercel veya Hostinger Node’a projeyi al
2. Yukarıdaki Meta alanlarını kaydet
3. Env’leri yapıştır
4. Domain DNS’i Node host’a çevir (Pages’ten çıkar)
5. O zaman Bağlan + admin61 çalışır
