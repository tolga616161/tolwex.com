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
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl()}/hizmetler?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
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
        "@type": "WebApplication",
        name: `${SITE_NAME} SMM Panel`,
        url: siteUrl(),
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "TRY",
          description: "Ücretsiz üyelik — bakiyeli SMM sipariş",
        },
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
