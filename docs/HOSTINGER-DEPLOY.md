# Hostinger → tolwex.com Deploy

## Durum
- Domain: `tolwex.com` → IP `2.57.91.91` (Hostinger)
- Şu an: parked domain sayfası
- Marka: **TOLWEX**

## Adımlar

### A) Website oluştur
1. https://hpanel.hostinger.com → **Websites**
2. **Add website** → Node.js uygulaması veya GitHub deploy seç
3. Domain: `tolwex.com`

### B) Kodu bağla
- GitHub’da repo varsa: Hostinger Git entegrasyonu ile bağla
- Yoksa: bu projeyi zipleyip yükle / FTP

### C) Build & start
```bash
npm ci
npx prisma generate
npx prisma db push
npx prisma db seed
npm run build
npm run start
```

### D) Env
`docs/NEYI-NEREVE-YAZ.md` içindeki değişkenleri Hostinger Environment’a ekle.
`NEXT_PUBLIC_APP_URL=https://tolwex.com` zorunlu.

### E) Meta
Domain yayına girdikten sonra Meta App Domains’e `tolwex.com` yaz (eski cloudflare’i sil).

### F) Kontrol
- https://tolwex.com → TOLWEX ana sayfa
- https://tolwex.com/urunler → ürünler
- https://tolwex.com/instagram/connect → bağlan
