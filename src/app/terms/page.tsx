import Link from "next/link";

export const metadata = { title: "Kullanım Şartları" };

export default function TermsPage() {
  return (
    <div className="site-shell py-16 max-w-3xl">
      <h1 className="display text-3xl mb-6">Kullanım Şartları</h1>
      <div className="grid gap-4 muted text-sm leading-relaxed">
        <p>
          TOLWEX üzerinden verilen SMM siparişleri otomatik olarak işleme alınır.
          Yanlış link veya hesap bilgisi kullanıcı sorumluluğundadır. Sipariş
          verdiğinizde kullanım şartlarını ve iade koşullarını kabul etmiş
          sayılırsınız.
        </p>

        <h2 className="display text-xl text-white">Bakiye</h2>
        <p>
          Yüklenen bakiyeler siparişlerde kullanılır. Nakit iade yapılmaz; sipariş
          iadeleri bakiyenize tanımlanır.
        </p>

        <h2 className="display text-xl text-white">İade ve iptal</h2>
        <p>
          İşleme alınan siparişlerde manuel iptal/iade yoktur. Sipariş
          tamamlanmazsa veya kısmen tamamlanırsa kalan tutar otomatik iade edilir.
          Teslimat süreleri tahmindir; işlenen siparişler gecikme gerekçesiyle iade
          edilmez. Detaylı maddeler için{" "}
          <Link href="/sss" className="text-white underline underline-offset-2">
            İade Koşulları
          </Link>{" "}
          sayfasını okuyunuz.
        </p>

        <h2 className="display text-xl text-white">Hesap</h2>
        <p>
          Hesap güvenliği kullanıcıya aittir. Şüpheli kullanımda hesap askıya
          alınabilir.
        </p>
      </div>
    </div>
  );
}
