# Meta Developer — TOLWEX (şimdi ne yapılacak)

## Durum (doğrulandı)

| Kontrol | Sonuç |
|---------|--------|
| Vercel API `/api/meta/status` | `configured: true`, App ID `1023…7900` |
| OAuth start | Facebook’a 307 redirect **çalışıyor** |
| `tolwex.com` | Hâlâ **GitHub Pages** → `/api/*` ve `/admin61` = **404** |
| Bağlantı sayısı | `0` — henüz tamamlanmış OAuth yok |

**Kod sorunu değil.** Facebook, App Domains / Valid OAuth Redirect URI eşleşmediği için login’i kesiyor.

Canlı bağlan URL’si (bunu kullan):
`https://tolwex-com.vercel.app/instagram/connect`

---

## Meta panelde TAM olarak yazılacaklar (App ID: 1023808800487900)

Aç: https://developers.facebook.com/apps/1023808800487900/settings/basic/

### 1) Settings → Basic
| Alan | Değer |
|------|--------|
| App Domains | `tolwex-com.vercel.app` |
| Privacy Policy URL | `https://tolwex-com.vercel.app/privacy` |
| Terms of Service URL | `https://tolwex-com.vercel.app/terms` |
| User data deletion | `https://tolwex-com.vercel.app/api/data-deletion` |
| Website → Site URL | `https://tolwex-com.vercel.app/` |

Eski `meron-social.glitch.me` varsa sil / değiştir.

### 2) Facebook Login → Settings
https://developers.facebook.com/apps/1023808800487900/fb-login/settings/

| Alan | Değer |
|------|--------|
| Valid OAuth Redirect URIs | `https://tolwex-com.vercel.app/api/meta/oauth/callback` |
| Client OAuth Login | Yes |
| Web OAuth Login | Yes |

### 3) Roles (Development modunda şart)
- Roles → Administrators / Developers / Testers: kendi Facebook hesabın
- Instagram tester: bağlayacağın IG hesabı

### 4) Kaydet → 1–2 dk bekle → bağla
1. https://tolwex-com.vercel.app/instagram/connect
2. **Instagram Hesabımı Bağla**
3. Meta onay → `/instagram/dashboard`

---

## Vercel env (zaten böyle olmalı)

```
NEXT_PUBLIC_APP_URL=https://tolwex-com.vercel.app
META_REDIRECT_URI=https://tolwex-com.vercel.app/api/meta/oauth/callback
META_APP_ID=1023808800487900
META_APP_SECRET=...panelden...
```

---

## tolwex.com ne zaman?

DNS’i Pages’ten Vercel’e alınca Meta’yı `tolwex.com` ile değiştir:

| Alan | Yeni değer |
|------|------------|
| App Domains | `tolwex.com` |
| Site URL | `https://tolwex.com/` |
| OAuth Redirect | `https://tolwex.com/api/meta/oauth/callback` |
| Vercel env | `NEXT_PUBLIC_APP_URL` + `META_REDIRECT_URI` → tolwex.com |

DNS (Vercel):
- A `@` → `76.76.21.21`
- CNAME `www` → `cname.vercel-dns.com`

Şu an DNS hâlâ `185.199.x` (GitHub Pages) — bu yüzden `tolwex.com` üzerinden Meta bağlanmaz.

---

## Sık hata

| Facebook mesajı | Çözüm |
|-----------------|--------|
| App Domains / Can’t Load URL | App Domains = `tolwex-com.vercel.app` |
| redirect_uri mismatch | Valid OAuth Redirect URI birebir callback URL |
| App not set up / Development | Roles’a kendi hesabını ekle |
| `tolwex.com` 404 | Vercel URL kullan veya DNS’i Vercel’e çevir |
