import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export type AppSession = {
  visitorId?: string;
  oauthState?: string;
  oauthStateExpiresAt?: number;
  isAdmin?: boolean;
};

function isHttpsApp(): boolean {
  const url = process.env.NEXT_PUBLIC_APP_URL || "";
  return url.startsWith("https://") || process.env.NODE_ENV === "production";
}

export function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET || "dev-only-session-secret-min-32-characters!!";
  return {
    password: password.length >= 32 ? password : password.padEnd(32, "x"),
    cookieName: "meta_ig_session",
    cookieOptions: {
      httpOnly: true,
      secure: isHttpsApp(),
      sameSite: "lax",
      path: "/",
      // Max age helps survive OAuth round-trips
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<AppSession>(cookieStore, sessionOptions());
}

/** Route-handler safe session bound to the outgoing response (Set-Cookie on redirects). */
export async function getSessionForResponse(req: NextRequest, res: NextResponse) {
  return getIronSession<AppSession>(req, res, sessionOptions());
}

/** Ensure a VisitorSession row exists and is linked in the cookie. */
export async function ensureVisitorSession() {
  const session = await getSession();
  if (session.visitorId) {
    const existing = await prisma.visitorSession.findUnique({
      where: { id: session.visitorId },
    });
    if (existing) return { session, visitorId: existing.id };
  }

  const visitor = await prisma.visitorSession.create({ data: {} });
  session.visitorId = visitor.id;
  await session.save();
  return { session, visitorId: visitor.id };
}

export async function ensureVisitorOnResponse(req: NextRequest, res: NextResponse) {
  const session = await getSessionForResponse(req, res);
  if (session.visitorId) {
    const existing = await prisma.visitorSession.findUnique({
      where: { id: session.visitorId },
    });
    if (existing) return { session, visitorId: existing.id };
  }

  const visitor = await prisma.visitorSession.create({ data: {} });
  session.visitorId = visitor.id;
  await session.save();
  return { session, visitorId: visitor.id };
}

export function appBaseUrl(req?: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/$/, "");
  if (req) return req.nextUrl.origin;
  return "http://localhost:3000";
}
