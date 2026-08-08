import { NextRequest, NextResponse } from "next/server";
import { appBaseUrl, getSessionForResponse } from "@/lib/session";
import { exchangeCodeForToken, exchangeLongLivedToken } from "@/lib/meta/oauth";
import { consumeOAuthState } from "@/lib/meta/oauth-state";
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

function errorRedirect(req: NextRequest, code: string) {
  const url = new URL("/auth/error", appBaseUrl(req));
  url.searchParams.set("code", code);
  return NextResponse.redirect(url);
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
    return errorRedirect(req, "oauth_denied");
  }

  try {
    // Prepare response early for cookie binding
    const draft = NextResponse.redirect(new URL("/instagram/dashboard", appBaseUrl(req)));
    const session = await getSessionForResponse(req, draft);

    const consumed = await consumeOAuthState({
      state,
      sessionState: session.oauthState,
      sessionExpiresAt: session.oauthStateExpiresAt,
      visitorId: session.visitorId,
    });

    if (!consumed.ok) {
      throw new MetaIntegrationError(consumed.reason === "expired" ? "csrf" : "csrf");
    }

    let visitorId = consumed.visitorId;
    if (!visitorId) {
      const visitor = await prisma.visitorSession.create({ data: {} });
      visitorId = visitor.id;
    }

    // Clear one-time cookie state so reconnects are never blocked
    session.oauthState = undefined;
    session.oauthStateExpiresAt = undefined;
    session.visitorId = visitorId;
    await session.save();

    if (!code) {
      throw new MetaIntegrationError("oauth_denied");
    }

    const shortLived = await exchangeCodeForToken(code);
    const longLived = await exchangeLongLivedToken(shortLived.accessToken);
    const debug = await debugAccessToken(longLived.accessToken);

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
      // Token already validated via debug_token
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

    const res = NextResponse.redirect(new URL("/instagram/dashboard", appBaseUrl(req)));
    const setCookie = draft.headers.getSetCookie?.() || [];
    for (const c of setCookie) {
      res.headers.append("Set-Cookie", c);
    }
    const session2 = await getSessionForResponse(req, res);
    session2.visitorId = visitorId;
    session2.oauthState = undefined;
    session2.oauthStateExpiresAt = undefined;
    await session2.save();
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    const kind = e instanceof MetaIntegrationError ? e.kind : "unknown";
    await writeAuditLog({
      action: "oauth.callback_error",
      actorType: "system",
      metadata: { kind },
    });
    return errorRedirect(req, kind);
  }
}
