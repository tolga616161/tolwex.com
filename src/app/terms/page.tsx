export default function TermsPage() {
  return (
    <div className="site-shell py-10 pb-20 max-w-3xl">
      <h1 className="display text-4xl font-bold mb-6">Kullanım Koşulları</h1>
      <div className="space-y-5 muted leading-relaxed">
        <p>
          Bu hizmet, Instagram hesap bağlantısını yalnızca resmi Meta OAuth ile
          sağlar. Kullanıcılar kendi Meta/Instagram hesaplarıyla giriş yapar ve
          izinleri kendileri onaylar.
        </p>
        <p>
          Platform, Instagram şifresi, cookie, session veya 2FA kodu talep etmez.
          Kullanıcılar hesap güvenlik önlemlerinden (2FA, güçlü parola, cihaz
          kontrolü) kendileri sorumludur.
        </p>
        <p>
          Meta API’nin sağlamadığı veriler tahmin edilmez; güvenlik skoru veya selfie
          doğrulama gibi API dışı iddialar üretilmez.
        </p>
        <p>
          Hizmet “olduğu gibi” sunulur. Meta API kesintileri, izin değişiklikleri veya
          token süreleri bağlantı deneyimini etkileyebilir.
        </p>
      </div>
    </div>
  );
}
