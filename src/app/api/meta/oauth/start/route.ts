import { NextRequest, NextResponse } from "next/server";
import { appBaseUrl, getSessionForResponse } from "@/lib/session";
import { buildAuthorizeUrl } from "@/lib/meta/oauth";
import { issueOAuthState } from "@/lib/meta/oauth-state";
import { getMetaConfig } from "@/lib/meta/config";
import { writeAuditLog } from "@/lib/audit";
import { MetaIntegrationError } from "@/lib/meta/errors";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

function errorRedirect(req: NextRequest, code: string) {
  const url = new URL("/auth/error", appBaseUrl(req));
  url.searchParams.set("code", code);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = rateLimit(`oauth-start:${ip}`, 30, 60_000);
    if (!rl.ok) return errorRedirect(req, "rate_limit");

    const config = await getMetaConfig();
    if (!config.configured) return errorRedirect(req, "not_configured");

    // Temporary response object so iron-session can attach cookies to the final redirect
    const authorizeProbe = "https://www.facebook.com/";
    const res = NextResponse.redirect(authorizeProbe);
    const session = await getSessionForResponse(req, res);

    let visitorId = session.visitorId;
    if (visitorId) {
      const existing = await prisma.visitorSession.findUnique({ where: { id: visitorId } });
      if (!existing) visitorId = undefined;
    }
    if (!visitorId) {
      const visitor = await prisma.visitorSession.create({ data: {} });
      visitorId = visitor.id;
    }

    // Fresh state every time — never reuse old OAuth state
    const state = await issueOAuthState(visitorId);
    session.visitorId = visitorId;
    session.oauthState = state;
    session.oauthStateExpiresAt = Date.now() + 15 * 60 * 1000;
    await session.save();

    const authorizeUrl = await buildAuthorizeUrl(state, { rerequest: true });

    await writeAuditLog({
      action: "oauth.start",
      actorType: "visitor",
      actorId: visitorId,
      metadata: { force: req.nextUrl.searchParams.get("force") === "1" },
    });

    // Replace location with real authorize URL while keeping Set-Cookie from session.save()
    const finalRes = NextResponse.redirect(authorizeUrl);
    const cookies =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : [];
    for (const c of cookies) finalRes.headers.append("Set-Cookie", c);

    // If runtime didn't expose getSetCookie, bind session directly to final response
    if (!cookies.length) {
      const session2 = await getSessionForResponse(req, finalRes);
      session2.visitorId = visitorId;
      session2.oauthState = state;
      session2.oauthStateExpiresAt = Date.now() + 15 * 60 * 1000;
      await session2.save();
    }

    finalRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return finalRes;
  } catch (e) {
    const code = e instanceof MetaIntegrationError ? e.kind : "unknown";
    return errorRedirect(req, code);
  }
}
