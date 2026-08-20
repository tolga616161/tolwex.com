import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** SMM panel / üye / servis rotalarını kurtarma sitesine yönlendir */
const BLOCK_PREFIXES = [
  "/hizmetler",
  "/uye",
  "/blog",
  "/sss",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin61")) return NextResponse.next();
  if (pathname.startsWith("/api")) return NextResponse.next();
  if (pathname.startsWith("/basvuru")) return NextResponse.next();

  for (const p of BLOCK_PREFIXES) {
    if (pathname === p || pathname.startsWith(`${p}/`)) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hizmetler/:path*", "/uye/:path*", "/blog/:path*", "/sss/:path*", "/hizmetler", "/uye", "/blog", "/sss"],
};
