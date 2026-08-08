import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";

const MESSAGES: Record<string, { title: string; body: string }> = {
  oauth_denied: {
    title: "Meta bağlantısı iptal edildi",
    body: "Giriş veya izinler onaylanmadı. İstediğiniz zaman tekrar deneyebilirsiniz.",
  },
  csrf: {
    title: "Meta bağlantısı kurulamadı",
    body: "Oturum doğrulaması zaman aşımına uğradı veya geçersizdi. Bu, ikinci denemede sık görülür — tekrar deneyin.",
  },
  expired_token: {
    title: "Bağlantı süresi dolmuş olabilir",
    body: "Instagram bağlantınızın süresi dolmuş olabilir. Hesabınızı yeniden bağlayın.",
  },
  invalid_token: {
    title: "Meta bağlantısı kurulamadı",
    body: "Yetkilendirme geçersiz. Lütfen hesabınızı yeniden bağlayın.",
  },
  not_configured: {
    title: "Meta entegrasyonu yapılandırılmadı",
    body: "Yönetici Meta App kimlik bilgilerini henüz tamamlamamış.",
  },
  rate_limit: {
    title: "Çok fazla istek",
    body: "Lütfen birkaç saniye bekleyip tekrar deneyin.",
  },
  network: {
    title: "Meta bağlantısı kurulamadı",
    body: "Instagram bağlantısı şu anda kontrol edilemiyor. Lütfen daha sonra tekrar deneyin.",
  },
  unknown: {
    title: "Meta bağlantısı kurulamadı",
    body: "Beklenmeyen bir hata oluştu. Tekrar deneyebilirsiniz.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const key = code && MESSAGES[code] ? code : "unknown";
  const msg = MESSAGES[key];

  return (
    <div className="site-shell py-16 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-12 max-w-2xl mx-auto glass-panel fade-up">
        <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(228,87,77,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(46,196,182,0.12),transparent_40%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "#ffb4ae" }}>
            Bağlantı hatası
          </p>
          <h1 className="display text-3xl md:text-4xl font-bold mb-4">{msg.title}</h1>
          <p className="muted leading-relaxed mb-8">{msg.body}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <ConnectButton label="Tekrar Dene" force />
            <Link href="/" className="btn btn-ghost">
              Ana sayfaya dön
            </Link>
            <Link href="/instagram/dashboard" className="btn btn-ghost">
              Kontrol ekranı
            </Link>
          </div>
          <p className="mt-8 text-sm muted">
            Instagram şifreniz, cookie veya 2FA kodu bu sitede istenmez. Yalnızca resmi Meta
            giriş ekranı kullanılır.
          </p>
        </div>
      </div>
    </div>
  );
}
