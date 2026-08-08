import { getMetaConfig } from "@/lib/meta/config";
import { classifyGraphError, MetaIntegrationError } from "@/lib/meta/errors";
import { prisma } from "@/lib/db";

export type GraphMe = {
  id?: string;
  name?: string;
};

export type InstagramProfile = {
  id?: string;
  username?: string;
  account_type?: string;
  media_count?: number;
};

export type PermissionRow = {
  permission: string;
  status: string;
};

async function touchApiMeta(error?: string) {
  const row = await prisma.metaConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!row) return;
  await prisma.metaConfig.update({
    where: { id: row.id },
    data: {
      lastApiRequestAt: new Date(),
      lastApiError: error || null,
    },
  });
}

async function graphGet<T>(path: string, accessToken: string, params?: Record<string, string>): Promise<T> {
  const config = await getMetaConfig();
  if (!config.configured) {
    throw new MetaIntegrationError("not_configured");
  }

  const url = new URL(`https://graph.facebook.com/${config.apiVersion}${path}`);
  url.searchParams.set("access_token", accessToken);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  } catch {
    await touchApiMeta("network");
    throw new MetaIntegrationError("network");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const kind = classifyGraphError(data, res.status);
    await touchApiMeta(kind);
    throw new MetaIntegrationError(kind);
  }

  await touchApiMeta();
  return data as T;
}

export async function fetchMe(accessToken: string): Promise<GraphMe> {
  return graphGet<GraphMe>("/me", accessToken, { fields: "id,name" });
}

export async function fetchPermissions(accessToken: string): Promise<PermissionRow[]> {
  const data = await graphGet<{ data?: PermissionRow[] }>("/me/permissions", accessToken);
  return data.data || [];
}

export type DebugTokenInfo = {
  isValid: boolean;
  appId?: string;
  userId?: string;
  scopes: string[];
  expiresAt: number | null;
  type?: string;
};

/**
 * Validate a user access token via Meta debug_token (server-side only).
 * Never returns the token itself.
 */
export async function debugAccessToken(inputToken: string): Promise<DebugTokenInfo> {
  const config = await getMetaConfig();
  if (!config.configured) {
    throw new MetaIntegrationError("not_configured");
  }

  const appToken = `${config.appId}|${config.appSecret}`;
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/debug_token`);
  url.searchParams.set("input_token", inputToken);
  url.searchParams.set("access_token", appToken);

  let res: Response;
  try {
    res = await fetch(url.toString(), { cache: "no-store" });
  } catch {
    throw new MetaIntegrationError("network");
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const kind = classifyGraphError(payload, res.status);
    throw new MetaIntegrationError(kind);
  }

  const data = (payload as { data?: Record<string, unknown> }).data || {};
  const isValid = Boolean(data.is_valid);
  if (!isValid) {
    throw new MetaIntegrationError("invalid_token", "debug_token_invalid");
  }

  return {
    isValid,
    appId: typeof data.app_id === "string" ? data.app_id : undefined,
    userId: typeof data.user_id === "string" ? data.user_id : undefined,
    scopes: Array.isArray(data.scopes) ? (data.scopes as string[]) : [],
    expiresAt: typeof data.expires_at === "number" ? data.expires_at : null,
    type: typeof data.type === "string" ? data.type : undefined,
  };
}

/**
 * Attempt to resolve Instagram account data that the Graph API can actually return
 * for the granted token/scopes. Returns only fields present in the response.
 */
export async function fetchInstagramAccount(accessToken: string): Promise<{
  profile: InstagramProfile | null;
  available: string[];
  unavailableNote: string;
}> {
  const unavailableNote =
    "Bu bilgi resmi Meta API tarafından sağlanmıyor.";

  // Path 1: Instagram Graph via Pages (common for Business/Creator)
  try {
    const pages = await graphGet<{ data?: Array<{ id: string; access_token?: string; name?: string }> }>(
      "/me/accounts",
      accessToken,
      { fields: "id,name,access_token,instagram_business_account" }
    );

    for (const page of pages.data || []) {
      const pageToken = page.access_token || accessToken;
      const detailed = await graphGet<{
        instagram_business_account?: { id: string };
      }>(`/${page.id}`, pageToken, { fields: "instagram_business_account" });

      const igId = detailed.instagram_business_account?.id;
      if (!igId) continue;

      const ig = await graphGet<InstagramProfile>(`/${igId}`, pageToken, {
        fields: "id,username,account_type,media_count",
      });

      const available: string[] = [];
      if (ig.id) available.push("id");
      if (ig.username) available.push("username");
      if (ig.account_type) available.push("account_type");
      if (typeof ig.media_count === "number") available.push("media_count");

      return { profile: ig, available, unavailableNote };
    }
  } catch {
    // Fall through — do not invent data
  }

  // Path 2: Instagram API with Instagram Login (ig_id on /me)
  try {
    const me = await graphGet<{
      id?: string;
      user_id?: string;
      username?: string;
      account_type?: string;
    }>("/me", accessToken, { fields: "id,user_id,username,account_type" });

    if (me.username || me.user_id || me.id) {
      const profile: InstagramProfile = {
        id: me.user_id || me.id,
        username: me.username,
        account_type: me.account_type,
      };
      const available: string[] = [];
      if (profile.id) available.push("id");
      if (profile.username) available.push("username");
      if (profile.account_type) available.push("account_type");
      return { profile, available, unavailableNote };
    }
  } catch {
    // Fall through
  }

  return { profile: null, available: [], unavailableNote };
}

/** Fields Meta Graph API does NOT provide for consumer security claims. */
export const API_NOT_PROVIDED = {
  selfieVerification:
    "Selfie doğrulama bilgisi resmi API tarafından sağlanmıyor.",
  securityScore:
    "Hesap güvenlik skoru resmi API tarafından sağlanmıyor.",
  twoFactorStatus:
    "İki faktörlü doğrulama durumu resmi API tarafından sağlanmıyor.",
  loginHistory:
    "Giriş geçmişi resmi API tarafından sağlanmıyor.",
  linkedDevices:
    "Bağlı cihaz bilgisi resmi API tarafından sağlanmıyor.",
  emailSecurity:
    "E-posta güvenlik durumu resmi API tarafından sağlanmıyor.",
  phoneSecurity:
    "Telefon güvenlik durumu resmi API tarafından sağlanmıyor.",
} as const;

/** App-level connectivity test using app access token — no user token required. */
export async function testMetaAppConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  const config = await getMetaConfig();
  if (!config.configured) {
    return {
      ok: false,
      message: "Meta API bağlantısı yapılandırılmamış veya erişilemiyor.",
    };
  }

  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/app`);
  url.searchParams.set("access_token", `${config.appId}|${config.appSecret}`);
  url.searchParams.set("fields", "id,name");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    const row = await prisma.metaConfig.findFirst({ orderBy: { updatedAt: "desc" } });

    if (!res.ok || !data.id) {
      const message = "Meta API bağlantısı başarısız.";
      if (row) {
        await prisma.metaConfig.update({
          where: { id: row.id },
          data: {
            lastTestAt: new Date(),
            lastTestOk: false,
            lastTestMessage: message,
            lastApiRequestAt: new Date(),
            lastApiError: "connection_test_failed",
          },
        });
      }
      return { ok: false, message };
    }

    const message = "Meta API bağlantısı çalışıyor.";
    if (row) {
      await prisma.metaConfig.update({
        where: { id: row.id },
        data: {
          lastTestAt: new Date(),
          lastTestOk: true,
          lastTestMessage: message,
          lastApiRequestAt: new Date(),
          lastApiError: null,
        },
      });
    }
    return { ok: true, message };
  } catch {
    return {
      ok: false,
      message: "Meta API bağlantısı yapılandırılmamış veya erişilemiyor.",
    };
  }
}
