import { prisma } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/crypto/tokens";

export type MetaRuntimeConfig = {
  configured: boolean;
  appId: string;
  appSecret: string;
  redirectUri: string;
  domain: string;
  apiVersion: string;
  webhookVerifyToken: string;
  source: "env" | "database" | "none";
};

function envValue(key: string): string {
  return (process.env[key] || "").trim();
}

/** Resolve Meta credentials: env vars take precedence, then encrypted DB config. */
export async function getMetaConfig(): Promise<MetaRuntimeConfig> {
  const envAppId = envValue("META_APP_ID");
  const envSecret = envValue("META_APP_SECRET");
  const envRedirect = envValue("META_REDIRECT_URI");
  const envVersion = envValue("META_API_VERSION") || "v21.0";
  const envWebhook = envValue("META_WEBHOOK_VERIFY_TOKEN");
  const envDomain = envValue("NEXT_PUBLIC_APP_URL");

  if (envAppId && envSecret && envRedirect) {
    return {
      configured: true,
      appId: envAppId,
      appSecret: envSecret,
      redirectUri: envRedirect,
      domain: envDomain,
      apiVersion: envVersion,
      webhookVerifyToken: envWebhook,
      source: "env",
    };
  }

  const row = await prisma.metaConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  if (row?.configured && row.appId && row.encryptedAppSecret && row.redirectUri) {
    let appSecret = "";
    try {
      appSecret = decryptSecret(row.encryptedAppSecret);
    } catch {
      return {
        configured: false,
        appId: row.appId,
        appSecret: "",
        redirectUri: row.redirectUri,
        domain: row.domain,
        apiVersion: row.apiVersion || "v21.0",
        webhookVerifyToken: row.webhookVerifyToken || "",
        source: "database",
      };
    }
    return {
      configured: Boolean(appSecret),
      appId: row.appId,
      appSecret,
      redirectUri: row.redirectUri,
      domain: row.domain,
      apiVersion: row.apiVersion || "v21.0",
      webhookVerifyToken: row.webhookVerifyToken || "",
      source: "database",
    };
  }

  return {
    configured: false,
    appId: envAppId || row?.appId || "",
    appSecret: "",
    redirectUri: envRedirect || row?.redirectUri || "",
    domain: envDomain || row?.domain || "",
    apiVersion: envVersion || row?.apiVersion || "v21.0",
    webhookVerifyToken: envWebhook || row?.webhookVerifyToken || "",
    source: "none",
  };
}

/** Public-safe status for admin UI — never includes secrets. */
export async function getMetaPublicStatus() {
  const config = await getMetaConfig();
  const row = await prisma.metaConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  const connectedCount = await prisma.instagramConnection.count({
    where: { connected: true },
  });

  return {
    configured: config.configured,
    source: config.source,
    appIdConfigured: Boolean(config.appId),
    appSecretConfigured: Boolean(config.appSecret),
    redirectUri: config.redirectUri || null,
    domain: config.domain || null,
    apiVersion: config.apiVersion,
    webhookConfigured: Boolean(config.webhookVerifyToken),
    lastTestAt: row?.lastTestAt?.toISOString() ?? null,
    lastTestOk: row?.lastTestOk ?? null,
    lastTestMessage: row?.lastTestMessage ?? null,
    lastApiRequestAt: row?.lastApiRequestAt?.toISOString() ?? null,
    lastApiError: row?.lastApiError ?? null,
    connectedAccountsCount: connectedCount,
    integrationStatus: config.configured
      ? "ready"
      : "not_configured",
    message: config.configured
      ? "Meta entegrasyonu yapılandırıldı."
      : "Meta entegrasyonu henüz yapılandırılmadı.",
  };
}

export async function upsertMetaConfig(input: {
  appId: string;
  appSecret?: string;
  redirectUri: string;
  domain: string;
  apiVersion: string;
  webhookVerifyToken?: string;
}) {
  const existing = await prisma.metaConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  let encryptedAppSecret = existing?.encryptedAppSecret || "";
  if (input.appSecret && input.appSecret.trim()) {
    encryptedAppSecret = encryptSecret(input.appSecret.trim());
  }

  const configured = Boolean(
    input.appId.trim() && encryptedAppSecret && input.redirectUri.trim()
  );

  const data = {
    appId: input.appId.trim(),
    encryptedAppSecret,
    redirectUri: input.redirectUri.trim(),
    domain: input.domain.trim(),
    apiVersion: input.apiVersion.trim() || "v21.0",
    webhookVerifyToken: input.webhookVerifyToken?.trim() || existing?.webhookVerifyToken || "",
    configured,
  };

  if (existing) {
    return prisma.metaConfig.update({ where: { id: existing.id }, data });
  }
  return prisma.metaConfig.create({ data });
}
