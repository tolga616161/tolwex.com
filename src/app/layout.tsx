import type { Metadata, Viewport } from "next";
import { Syne, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/navigation/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/contact/WhatsAppFab";
import { PageAtmosphere } from "@/components/fx/PageAtmosphere";

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
  title: "TOLWEX — Profesyonel SMM Panel",
  description:
    "TOLWEX SMM paneli: üye hesabı, bakiye, binlerce servis ve otomatik sipariş.",
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
    title: "TOLWEX",
  },
  manifest: "/site.webmanifest",

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
        <PageAtmosphere />
        <SiteNav />
        <main className="flex-1 site-main">{children}</main>
        <SiteFooter />
        <WhatsAppFab />
      </body>
    </html>
  );
}
