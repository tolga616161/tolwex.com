# TOLWEX | SMM Panel

Üye paneli: istatistikler, tekli/toplu sipariş, drip-feed, bakiye, kupon, destek, SSS ve PerfectPanel uyumlu kullanıcı API’si.

Referans mimari: [smm-panel-free](https://github.com/evansnguyen0104/smm-panel-free) (özellikler Next.js’e taşındı).

## Üye menü

Dashboard · Yeni Sipariş · Siparişlerim · Servisler · Bakiye Yükle · İşlem Geçmişi · Destek · SSS · API · Profil · Çıkış

## Ortam

```bash
DATABASE_URL=
SESSION_SECRET=
ADMIN_PASSWORD=
SMM_API_KEY=
SMM_API_URL=https://smmapi.com/api/v2
SMM_MARKUP_PERCENT=125
CRON_SECRET=
```

## Cron (sipariş durumu)

```
GET /api/cron/sync-orders?key=$CRON_SECRET
```

## Kullanıcı API

`POST /api/v1` — `balance` · `services` · `add` · `status`

## Geliştirme

```bash
npm install
npx prisma db push
npm run dev
```
