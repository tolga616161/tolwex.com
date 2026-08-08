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
  title: "TOLWEX — Meta Eski · Projeli · Kapanan Hesap",
  description:
    "Meta eski tarihli hesap, projeli hesap paketleri ve kapanan hesap açma. Kapanma ekranı yükle, nedeni yaz, WhatsApp ile takip et.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TOLWEX",
  },
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
