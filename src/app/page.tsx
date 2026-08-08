import Link from "next/link";
import { HeroSection } from "@/components/hero/HeroSection";
import { CategoryExplorer } from "@/components/categories/CategoryExplorer";
import { DigitalAtmosphere } from "@/components/fx/DigitalAtmosphere";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getMetaConfig } from "@/lib/meta/config";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const config = await getMetaConfig();
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
        subtitle="Haber silme, fake hesap kapatma, Instagram güvenlik ve daha fazlası."
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

      <CategoryExplorer />

      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: "Resmi bağlantı",
            text: "Instagram girişi yalnızca Meta’nın kendi ekranında gerçekleşir. Şifre istemeyiz.",
          },
          {
            title: "Şeffaf sonuçlar",
            text: "Ölçülebilen bilgiler gösterilir; uydurma güvenlik skoru yoktur.",
          },
          {
            title: "Hızlı destek",
            text: `WhatsApp: ${CONTACT_PHONE_DISPLAY} — ürün ve sipariş için yazın.`,
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
          <Link href="/instagram/dashboard" className="btn btn-ghost">
            Hesap Güvenlik Testi
          </Link>
          <a
            href={whatsappUrl("Merhaba, ürünler hakkında bilgi almak istiyorum.")}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      </section>
    </div>
  );
}
