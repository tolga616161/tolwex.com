import { NextRequest, NextResponse } from "next/server";
import { ensureVisitorSession, getSession } from "@/lib/session";
import { exchangeCodeForToken, exchangeLongLivedToken, safeEqual } from "@/lib/meta/oauth";
import { encryptSecret } from "@/lib/crypto/tokens";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import {
  debugAccessToken,
  fetchInstagramAccount,
  fetchMe,
  fetchPermissions,
} from "@/lib/meta/api";
import { MetaIntegrationError } from "@/lib/meta/errors";

function appUrl(path: string) {
  return new URL(path, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");

  if (error || errorReason === "user_denied") {
    await writeAuditLog({
      action: "oauth.denied",
      actorType: "visitor",
      metadata: { reason: errorReason || error || "denied" },
    });
    return NextResponse.redirect(appUrl("/?error=oauth_denied"));
  }

  try {
    const session = await getSession();
    if (
      !state ||
      !session.oauthState ||
      !session.oauthStateExpiresAt ||
      Date.now() > session.oauthStateExpiresAt ||
      !safeEqual(state, session.oauthState)
    ) {
      throw new MetaIntegrationError("csrf");
    }

    // One-time use state
    session.oauthState = undefined;
    session.oauthStateExpiresAt = undefined;
    await session.save();

    if (!code) {
      throw new MetaIntegrationError("oauth_denied");
    }

    const { visitorId } = await ensureVisitorSession();
    const shortLived = await exchangeCodeForToken(code);
    const longLived = await exchangeLongLivedToken(shortLived.accessToken);

    // Official Meta debug_token validation — reject invalid tokens
    const debug = await debugAccessToken(longLived.accessToken);

    // Token stays server-side only — encrypted before persistence
    const encryptedAccessToken = encryptSecret(longLived.accessToken);
    const tokenExpiresAt =
      longLived.expiresIn != null
        ? new Date(Date.now() + longLived.expiresIn * 1000)
        : debug.expiresAt
          ? new Date(debug.expiresAt * 1000)
          : null;

    let metaUserId: string | null = debug.userId || null;
    let igUsername: string | null = null;
    let igUserId: string | null = null;
    let accountType: string | null = null;
    let grantedScopes = JSON.stringify(
      debug.scopes.map((permission) => ({ permission, status: "granted" }))
    );

    try {
      const me = await fetchMe(longLived.accessToken);
      metaUserId = me.id || metaUserId;
      const permissions = await fetchPermissions(longLived.accessToken);
      if (permissions.length) grantedScopes = JSON.stringify(permissions);
      const ig = await fetchInstagramAccount(longLived.accessToken);
      igUsername = ig.profile?.username || null;
      igUserId = ig.profile?.id || null;
      accountType = ig.profile?.account_type || null;
    } catch {
      // Connection still saved after debug_token OK; dashboard surfaces API gaps
    }

    await prisma.instagramConnection.upsert({
      where: { visitorSessionId: visitorId },
      create: {
        visitorSessionId: visitorId,
        metaUserId,
        igUsername,
        igUserId,
        accountType,
        encryptedAccessToken,
        tokenExpiresAt,
        grantedScopes,
        tokenStatus: "active",
        connected: true,
        lastCheckedAt: new Date(),
        disconnectedAt: null,
      },
      update: {
        metaUserId,
        igUsername,
        igUserId,
        accountType,
        encryptedAccessToken,
        tokenExpiresAt,
        grantedScopes,
        tokenStatus: "active",
        connected: true,
        lastCheckedAt: new Date(),
        lastApiError: null,
        disconnectedAt: null,
      },
    });

    await writeAuditLog({
      action: "oauth.connected",
      actorType: "visitor",
      actorId: visitorId,
      metadata: {
        hasUsername: Boolean(igUsername),
        hasMetaUserId: Boolean(metaUserId),
      },
    });

    return NextResponse.redirect(appUrl("/instagram/dashboard"));
  } catch (e) {
    const kind = e instanceof MetaIntegrationError ? e.kind : "unknown";
    await writeAuditLog({
      action: "oauth.callback_error",
      actorType: "system",
      metadata: { kind },
    });
    return NextResponse.redirect(appUrl(`/?error=${encodeURIComponent(kind)}`));
  }
}
