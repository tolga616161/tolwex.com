import { SITE_NAME, SITE_TAGLINE, absoluteUrl, siteUrl } from "@/lib/seo";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl()}/#website`,
        url: siteUrl(),
        name: SITE_NAME,
        description: SITE_TAGLINE,
        inLanguage: "tr-TR",
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl()}/#organization`,
        name: SITE_NAME,
        url: siteUrl(),
        logo: absoluteUrl("/icon.png"),
        description: SITE_TAGLINE,
        sameAs: ["https://tolwex.com", "https://www.tolwex.com"],
      },
      {
        "@type": "Service",
        name: "Kapanan hesap kurtarma",
        url: absoluteUrl("/basvuru/kapanan"),
        provider: { "@id": `${siteUrl()}/#organization` },
        areaServed: "TR",
      },
      {
        "@type": "Service",
        name: "Çalınan hesap kurtarma",
        url: absoluteUrl("/basvuru/calinan"),
        provider: { "@id": `${siteUrl()}/#organization` },
        areaServed: "TR",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
