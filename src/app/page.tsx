import Link from "next/link";
import { HeroSection } from "@/components/hero/HeroSection";
import { CategoryExplorer } from "@/components/categories/CategoryExplorer";
import { DigitalAtmosphere } from "@/components/fx/DigitalAtmosphere";
import { DomainSetupCard } from "@/components/meta/DomainSetupCard";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getMetaConfig } from "@/lib/meta/config";
import { getMetaDomainHints } from "@/lib/meta/public-urls";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const config = await getMetaConfig();
  const domains = getMetaDomainHints();
  const featuredProducts = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: [{ sortOrder: "asc" }],
    take: 8,
  });

  // Legacy ?error= links → premium error screen
  if (params.error) {
    const code = ["not_configured", "oauth_denied", "csrf", "expired_token", "invalid_token"].includes(
      params.error
    )
      ? params.error
      : "unknown";
    redirect(`/auth/error?code=${encodeURIComponent(code)}`);
  }

  return (
    <div className="site-shell pt-4 pb-20 space-y-14 relative">
      <div className="page-atmosphere" aria-hidden>
        <DigitalAtmosphere variant="page" />
      </div>
      <HeroSection configured={config.configured} />

      <ProductGrid
        title="Öne çıkan ürünler"
        subtitle="Satışa hazır paketler — boş vitrin yok."
        products={featuredProducts.map((p) => ({
          slug: p.slug,
          name: p.name,
          shortDesc: p.shortDesc,
          price: p.price,
          currency: p.currency,
          badge: p.badge,
          icon: p.icon,
          accent: p.accent,
          accent2: p.accent2,
        }))}
      />

      <DomainSetupCard
        appDomains={domains.appDomains}
        siteUrl={domains.siteUrl}
        redirectUri={domains.oauthRedirectUri}
      />

      <CategoryExplorer />

      <section className="grid md:grid-cols-3 gap-4">
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
          <div key={item.title} className="glass-panel rounded-2xl p-6">
            <h2 className="display text-xl mb-2">{item.title}</h2>
            <p className="muted text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-2xl p-6 md:p-8">
        <p className="text-sm md:text-base leading-relaxed">
          Instagram hesabınız yalnızca resmi Meta bağlantısı üzerinden bağlanır.
          Instagram şifreniz platformumuz tarafından istenmez veya saklanmaz.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/instagram/connect" className="btn btn-primary">
            Instagram Hesabını Güvenli Şekilde Bağla
          </Link>
          <Link href="/instagram/security" className="btn btn-ghost">
            Güvenlik Merkezi
          </Link>
          <Link href="/instagram/dashboard" className="btn btn-ghost">
            Hesap Güvenlik Testi
          </Link>
        </div>
      </section>
    </div>
  );
}
