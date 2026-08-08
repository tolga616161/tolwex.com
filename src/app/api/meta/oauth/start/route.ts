import { NextRequest, NextResponse } from "next/server";
import { ensureVisitorSession } from "@/lib/session";
import { buildAuthorizeUrl, createOAuthState } from "@/lib/meta/oauth";
import { getMetaConfig } from "@/lib/meta/config";
import { writeAuditLog } from "@/lib/audit";
import { MetaIntegrationError } from "@/lib/meta/errors";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = rateLimit(`oauth-start:${ip}`, 20, 60_000);
    if (!rl.ok) {
      return NextResponse.redirect(
        new URL(
          "/?error=" + encodeURIComponent("Çok fazla istek. Lütfen biraz sonra tekrar deneyin."),
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        )
      );
    }

    const config = await getMetaConfig();
    if (!config.configured) {
      return NextResponse.redirect(
        new URL(
          "/?error=not_configured",
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        )
      );
    }

    const { session, visitorId } = await ensureVisitorSession();
    const state = createOAuthState();
    session.oauthState = state;
    session.oauthStateExpiresAt = Date.now() + 10 * 60 * 1000;
    await session.save();

    const url = await buildAuthorizeUrl(state);
    await writeAuditLog({
      action: "oauth.start",
      actorType: "visitor",
      actorId: visitorId,
      metadata: { redirectConfigured: true },
    });

    return NextResponse.redirect(url);
  } catch (e) {
    const msg =
      e instanceof MetaIntegrationError ? e.userMessage : "OAuth başlatılamadı.";
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(msg)}`,
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      )
    );
  }
}
