import { randomBytes, timingSafeEqual } from "crypto";
import { getMetaConfig } from "@/lib/meta/config";
import { MetaIntegrationError } from "@/lib/meta/errors";

/** Scopes for Instagram Login / Instagram Graph — adjust in Meta App Dashboard. */
export const DEFAULT_SCOPES = [
  "instagram_basic",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

export function createOAuthState(): string {
  return randomBytes(24).toString("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function buildAuthorizeUrl(
  state: string,
  opts?: { rerequest?: boolean }
): Promise<string> {
  const config = await getMetaConfig();
  if (!config.configured) {
    throw new MetaIntegrationError("not_configured");
  }

  const url = new URL(`https://www.facebook.com/${config.apiVersion}/dialog/oauth`);
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", DEFAULT_SCOPES);
  url.searchParams.set("response_type", "code");
  // Helps second/third connect attempts show a usable Meta screen again
  if (opts?.rerequest !== false) {
    url.searchParams.set("auth_type", "rerequest");
  }
  // Better mobile Facebook dialog
  url.searchParams.set("display", "touch");
  return url.toString();
}

export type TokenExchangeResult = {
  accessToken: string;
  expiresIn: number | null;
  tokenType?: string;
};

export async function exchangeCodeForToken(code: string): Promise<TokenExchangeResult> {
  const config = await getMetaConfig();
  if (!config.configured) {
    throw new MetaIntegrationError("not_configured");
  }

  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/oauth/access_token`);
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("client_secret", config.appSecret);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("code", code);

  let res: Response;
  try {
    res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  } catch {
    throw new MetaIntegrationError("network");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new MetaIntegrationError("unknown", "token_exchange_failed");
  }

  return {
    accessToken: data.access_token as string,
    expiresIn: typeof data.expires_in === "number" ? data.expires_in : null,
    tokenType: data.token_type,
  };
}

/** Exchange short-lived token for long-lived token (server-side only). */
export async function exchangeLongLivedToken(shortLived: string): Promise<TokenExchangeResult> {
  const config = await getMetaConfig();
  if (!config.configured) {
    throw new MetaIntegrationError("not_configured");
  }

  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("client_secret", config.appSecret);
  url.searchParams.set("fb_exchange_token", shortLived);

  let res: Response;
  try {
    res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  } catch {
    throw new MetaIntegrationError("network");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    return { accessToken: shortLived, expiresIn: null };
  }

  return {
    accessToken: data.access_token as string,
    expiresIn: typeof data.expires_in === "number" ? data.expires_in : null,
  };
}

/** Best-effort token revocation via Graph API. */
export async function revokeMetaToken(accessToken: string): Promise<void> {
  const config = await getMetaConfig();
  if (!config.configured) return;

  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/me/permissions`);
  try {
    await fetch(url.toString(), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    // Disconnect must succeed locally even if remote revoke fails
  }
}
