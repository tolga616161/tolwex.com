import type { Metadata, Viewport } from "next";
import { Syne, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/navigation/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/contact/WhatsAppFab";
import { PageAtmosphere } from "@/components/fx/PageAtmosphere";
import { AnnouncementBanner } from "@/components/marketing/AnnouncementBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { SEO_KEYWORDS, SITE_NAME, SITE_TAGLINE, absoluteUrl, siteUrl } from "@/lib/seo";

const display = Syne({
  variable: "--font-display-face",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body-face",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} | SMM Panel Türkiye — Takipçi, Beğeni, İzlenme`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_TAGLINE}. Instagram, TikTok, YouTube SMM paneli — ucuz takipçi, beğeni, izlenme. Üye ol, bakiye yükle, anında sipariş ver.`,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_NAME, url: siteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl(),
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Profesyonel SMM Panel`,
    description: SITE_TAGLINE,
    images: [
      {
        url: absoluteUrl("/icon.png"),
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | SMM Panel`,
    description: SITE_TAGLINE,
    images: [absoluteUrl("/icon.png")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon-32.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  manifest: "/site.webmanifest",
  category: "technology",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased site-body">
        <JsonLd />
        <PageAtmosphere />
        <AnnouncementBanner />
        <SiteNav />
        <main className="flex-1 site-main">{children}</main>
        <SiteFooter />
        <WhatsAppFab />
        <VisitTracker />
      </body>
    </html>
  );
}
