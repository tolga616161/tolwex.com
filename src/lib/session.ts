import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export type AppSession = {
  isAdmin?: boolean;
  memberId?: string;
  memberEmail?: string;
};

function isHttpsApp(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) return true;
  const url = process.env.NEXT_PUBLIC_APP_URL || "";
  return url.startsWith("https://");
}

export function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET || "dev-only-session-secret-min-32-characters!!";
  return {
    password: password.length >= 32 ? password : password.padEnd(32, "x"),
    cookieName: "tolwex_session",
    cookieOptions: {
      httpOnly: true,
      secure: isHttpsApp(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<AppSession>(cookieStore, sessionOptions());
}

export async function getSessionForResponse(req: NextRequest, res: NextResponse) {
  return getIronSession<AppSession>(req, res, sessionOptions());
}

export function appBaseUrl(req?: NextRequest): string {
  const env =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL;
  if (env) return env.replace(/\/$/, "");
  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    if (host && !host.includes("localhost")) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }
    return req.nextUrl.origin;
  }
  return "http://localhost:3000";
}
