export const metadata = { title: "Kullanım Şartları" };

export default function TermsPage() {
  return (
    <div className="site-shell py-16 max-w-3xl">
      <h1 className="display text-3xl mb-6">Kullanım Şartları</h1>
      <div className="grid gap-4 muted text-sm leading-relaxed">
        <p>
          TOLWEX üzerinden verilen SMM siparişleri otomatik olarak tedarikçi API’sine
          iletilir. Yanlış link veya hesap bilgisi kullanıcı sorumluluğundadır.
        </p>
        <h2 className="display text-xl text-white">Bakiye</h2>
        <p>
          Yüklenen bakiyeler siparişlerde kullanılır. Onaylanmış bakiyeler ve tamamlanan
          siparişler için iade politikası destek üzerinden değerlendirilir.
        </p>
        <h2 className="display text-xl text-white">Hesap</h2>
        <p>
          Hesap güvenliği kullanıcıya aittir. Şüpheli kullanımda hesap askıya alınabilir.
        </p>
      </div>
    </div>
  );
}
