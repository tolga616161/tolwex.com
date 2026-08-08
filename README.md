# TOLWEX — Profesyonel SMM Panel

Üye paneli, bakiye, kupon, destek ve smmapi.com servis senkronu ile çalışan SMM paneli.

## Özellikler

- Üye kayıt / giriş (kullanıcı adı + şifre)
- Yeni sipariş, siparişler, servis kataloğu
- Bakiye talepleri ve kupon kullanımı
- Destek talepleri
- Admin: kullanıcılar, siparişler, servisler, kategoriler, kuponlar, API senkron, loglar

## Ortam değişkenleri

- `DATABASE_URL`
- `SESSION_SECRET`
- `ADMIN_PASSWORD`
- `SMM_API_KEY`
- `SMM_API_URL` (varsayılan: `https://smmapi.com/api/v2`)
- `SMM_MARKUP_PERCENT` (varsayılan: `50`)

## Geliştirme

```bash
npm install
npx prisma db push
npm run dev
```
