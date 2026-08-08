import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { getMetaConfig } from "@/lib/meta/config";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const config = await getMetaConfig();

  const errorMap: Record<string, string> = {
    not_configured: "Meta entegrasyonu henüz yapılandırılmadı.",
    oauth_denied: "Instagram bağlantısı iptal edildi veya izin verilmedi.",
    csrf: "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.",
    expired_token:
      "Instagram bağlantınızın süresi dolmuş olabilir. Hesabınızı yeniden bağlamayı deneyin.",
    invalid_token:
      "Instagram bağlantınızın süresi dolmuş olabilir. Hesabınızı yeniden bağlamayı deneyin.",
  };

  const errorText =
    params.error &&
    (errorMap[params.error] ||
      (params.error.length < 120 ? params.error : "Bir hata oluştu. Lütfen tekrar deneyin."));

  return (
    <div className="site-shell pt-10 pb-20">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 min-h-[70vh] flex items-end">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(7,26,31,0.2) 0%, rgba(7,26,31,0.55) 40%, rgba(7,26,31,0.92) 100%), url('https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1800&q=80') center/cover",
          }}
        />
        <div className="relative z-10 p-8 md:p-14 max-w-2xl">
          <p className="display text-4xl md:text-6xl font-extrabold fade-up mb-4">
            SecureLink
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold fade-up-delay mb-4">
            Instagram hesabınızı resmi Meta bağlantısıyla kontrol edin
          </h1>
          <p className="muted text-base md:text-lg fade-up-delay-2 mb-8 max-w-xl">
            Şifre, cookie veya session istemeyiz. Yalnızca Meta/Instagram OAuth
            ekranından bağlanırsınız.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 fade-up-delay-2">
            {config.configured ? (
              <ConnectButton label="Instagram Hesabımı Kontrol Et" />
            ) : (
              <Link href="/admin/setup" className="btn btn-ghost">
                Meta entegrasyonu henüz yapılandırılmadı
              </Link>
            )}
            <Link href="/instagram/guide" className="btn btn-ghost">
              2FA Güvenlik Rehberi
            </Link>
          </div>
        </div>
      </section>

      {errorText ? (
        <div className="surface mt-6 rounded-2xl p-4 text-sm" style={{ color: "#ffc4c0" }}>
          {errorText}
        </div>
      ) : null}

      <section className="mt-14 grid md:grid-cols-3 gap-5">
        {[
          {
            title: "Resmi OAuth",
            text: "Giriş ve izinler yalnızca Meta’nın kendi ekranında gerçekleşir.",
          },
          {
            title: "Şeffaf sonuçlar",
            text: "API’nin vermediği bilgiler tahmin edilmez; açıkça belirtilir.",
          },
          {
            title: "Güvenli token",
            text: "Access token şifreli saklanır, frontend’e gönderilmez.",
          },
        ].map((item) => (
          <div key={item.title} className="surface rounded-2xl p-6">
            <h2 className="display text-xl mb-2">{item.title}</h2>
            <p className="muted text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 surface rounded-2xl p-6 md:p-8">
        <p className="text-sm md:text-base leading-relaxed">
          Instagram hesabınız yalnızca resmi Meta bağlantısı üzerinden bağlanır.
          Instagram şifreniz platformumuz tarafından istenmez veya saklanmaz.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ConnectButton label="Instagram Hesabını Güvenli Şekilde Bağla" />
          <Link href="/instagram/security" className="btn btn-ghost">
            Güvenlik Merkezi
          </Link>
        </div>
      </section>
    </div>
  );
}
