import { prisma } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto/tokens";
import { getMetaConfig } from "@/lib/meta/config";
import {
  API_NOT_PROVIDED,
  debugAccessToken,
  fetchInstagramAccount,
  fetchMe,
  fetchPermissions,
} from "@/lib/meta/api";
import { MetaIntegrationError } from "@/lib/meta/errors";

export type SecurityCheckItem = {
  id: string;
  label: string;
  status: "ok" | "warn" | "unavailable";
  detail: string;
};

export async function buildConnectionDashboard(visitorId: string, refresh = true) {
  const config = await getMetaConfig();
  const connection = await prisma.instagramConnection.findUnique({
    where: { visitorSessionId: visitorId },
  });

  if (!config.configured) {
    return {
      metaConfigured: false,
      connected: false,
      message: "Meta entegrasyonu henüz yapılandırılmadı.",
      privacyNotice:
        "Instagram hesabınız yalnızca resmi Meta bağlantısı üzerinden bağlanır. Instagram şifreniz platformumuz tarafından istenmez veya saklanmaz.",
      connectionCard: { status: "inactive" as const, label: "Instagram bağlantısı aktif değil" },
      apiCard: { status: "unavailable" as const, label: "API erişimi yapılandırılmamış" },
      securityChecks: [] as SecurityCheckItem[],
      permissions: [] as Array<{ permission: string; status: string }>,
      account: null as null | Record<string, unknown>,
      tokenStatus: "none",
      lastCheckedAt: null as string | null,
      apiError: null as string | null,
      notProvided: API_NOT_PROVIDED,
      securitySummary: [
        { status: "warn" as const, text: "Bazı güvenlik bilgileri API tarafından sağlanmıyor" },
      ],
    };
  }

  if (!connection?.connected || !connection.encryptedAccessToken) {
    return {
      metaConfigured: true,
      connected: false,
      message: "Instagram hesabınız henüz bağlanmadı.",
      privacyNotice:
        "Instagram hesabınız yalnızca resmi Meta bağlantısı üzerinden bağlanır. Instagram şifreniz platformumuz tarafından istenmez veya saklanmaz.",
      connectionCard: { status: "inactive" as const, label: "Instagram bağlantısı aktif değil" },
      apiCard: { status: "idle" as const, label: "API erişimi bekleniyor" },
      securityChecks: baseUnavailableChecks(),
      permissions: [] as Array<{ permission: string; status: string }>,
      account: null,
      tokenStatus: connection?.tokenStatus || "none",
      lastCheckedAt: connection?.lastCheckedAt?.toISOString() ?? null,
      apiError: connection?.lastApiError ?? null,
      notProvided: API_NOT_PROVIDED,
      securitySummary: [
        { status: "warn" as const, text: "Bağlantı kurulmadan güvenlik analizi yapılamaz" },
        { status: "warn" as const, text: "Bazı güvenlik bilgileri API tarafından sağlanmıyor" },
      ],
    };
  }

  let accessToken: string;
  try {
    accessToken = decryptSecret(connection.encryptedAccessToken);
  } catch {
    await prisma.instagramConnection.update({
      where: { id: connection.id },
      data: { tokenStatus: "error", lastApiError: "decrypt_failed" },
    });
    throw new MetaIntegrationError("invalid_token");
  }

  // Expiry check without inventing security scores
  if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() < Date.now()) {
    await prisma.instagramConnection.update({
      where: { id: connection.id },
      data: { tokenStatus: "expired", lastApiError: "expired_token" },
    });
    return {
      metaConfigured: true,
      connected: true,
      message: "Instagram bağlantınızın süresi dolmuş olabilir. Hesabınızı yeniden bağlamayı deneyin.",
      privacyNotice:
        "Instagram hesabınız yalnızca resmi Meta bağlantısı üzerinden bağlanır. Instagram şifreniz platformumuz tarafından istenmez veya saklanmaz.",
      connectionCard: { status: "warn" as const, label: "Instagram bağlantısı süresi dolmuş olabilir" },
      apiCard: { status: "error" as const, label: "API erişimi geçersiz (token süresi)" },
      securityChecks: [
        { id: "api", label: "API bağlantısı", status: "warn" as const, detail: "Token süresi dolmuş olabilir" },
        { id: "auth", label: "Yetkilendirme", status: "warn" as const, detail: "Yeniden bağlanma gerekli" },
        ...baseUnavailableChecks(),
      ],
      permissions: JSON.parse(connection.grantedScopes || "[]"),
      account: connection.igUsername
        ? { username: connection.igUsername, id: connection.igUserId, accountType: connection.accountType }
        : null,
      tokenStatus: "expired",
      lastCheckedAt: new Date().toISOString(),
      apiError: "expired_token",
      notProvided: API_NOT_PROVIDED,
      securitySummary: [
        { status: "warn" as const, text: "Yetkilendirme yenilenmeli" },
        { status: "warn" as const, text: "Bazı güvenlik bilgileri API tarafından sağlanmıyor" },
      ],
    };
  }

  let permissions: Array<{ permission: string; status: string }> = [];
  let account: Record<string, unknown> | null = null;
  let apiError: string | null = null;
  let tokenStatus = "active";
  let apiOk = true;

  if (refresh) {
    try {
      const debug = await debugAccessToken(accessToken);
      if (!debug.isValid) {
        throw new MetaIntegrationError("invalid_token");
      }

      const me = await fetchMe(accessToken);
      permissions = await fetchPermissions(accessToken);
      const ig = await fetchInstagramAccount(accessToken);

      account = {
        metaUserId: me.id || debug.userId || connection.metaUserId,
        name: me.name || null,
        username: ig.profile?.username || connection.igUsername || null,
        igUserId: ig.profile?.id || connection.igUserId || null,
        accountType: ig.profile?.account_type || connection.accountType || null,
        mediaCount:
          typeof ig.profile?.media_count === "number" ? ig.profile.media_count : null,
        fieldsFromApi: ig.available,
        tokenValidated: true,
        tokenType: debug.type || null,
      };

      await prisma.instagramConnection.update({
        where: { id: connection.id },
        data: {
          metaUserId: me.id || debug.userId || connection.metaUserId,
          igUsername: ig.profile?.username || connection.igUsername,
          igUserId: ig.profile?.id || connection.igUserId,
          accountType: ig.profile?.account_type || connection.accountType,
          grantedScopes: JSON.stringify(permissions),
          tokenStatus: "active",
          lastCheckedAt: new Date(),
          lastApiError: null,
          lastApiErrorCode: null,
        },
      });
    } catch (e) {
      apiOk = false;
      const kind = e instanceof MetaIntegrationError ? e.kind : "unknown";
      apiError = kind;
      tokenStatus = kind === "expired_token" || kind === "invalid_token" ? kind : "error";
      await prisma.instagramConnection.update({
        where: { id: connection.id },
        data: {
          tokenStatus,
          lastCheckedAt: new Date(),
          lastApiError: kind,
          lastApiErrorCode: kind,
        },
      });
      permissions = JSON.parse(connection.grantedScopes || "[]");
      account = connection.igUsername
        ? {
            username: connection.igUsername,
            igUserId: connection.igUserId,
            accountType: connection.accountType,
            metaUserId: connection.metaUserId,
          }
        : null;
    }
  } else {
    permissions = JSON.parse(connection.grantedScopes || "[]");
    account = connection.igUsername
      ? {
          username: connection.igUsername,
          igUserId: connection.igUserId,
          accountType: connection.accountType,
          metaUserId: connection.metaUserId,
        }
      : null;
  }

  const securityChecks: SecurityCheckItem[] = [
    {
      id: "api",
      label: "API bağlantısı",
      status: apiOk ? "ok" : "warn",
      detail: apiOk ? "API bağlantısı aktif" : "API bağlantısı kontrol edilemedi",
    },
    {
      id: "auth",
      label: "Yetkilendirme",
      status: tokenStatus === "active" ? "ok" : "warn",
      detail: tokenStatus === "active" ? "Yetkilendirme geçerli" : "Yetkilendirme yenilenmeli",
    },
    {
      id: "scopes",
      label: "İzinler",
      status: permissions.length ? "ok" : "warn",
      detail: permissions.length
        ? `${permissions.filter((p) => p.status === "granted").length} izin verildi`
        : "İzin bilgisi alınamadı",
    },
    ...baseUnavailableChecks(),
  ];

  return {
    metaConfigured: true,
    connected: true,
    message: apiOk
      ? "Instagram bağlantısı aktif."
      : "Instagram bağlantısı şu anda kontrol edilemiyor. Lütfen daha sonra tekrar deneyin.",
    privacyNotice:
      "Instagram hesabınız yalnızca resmi Meta bağlantısı üzerinden bağlanır. Instagram şifreniz platformumuz tarafından istenmez veya saklanmaz.",
    connectionCard: {
      status: apiOk ? ("active" as const) : ("warn" as const),
      label: apiOk ? "Instagram bağlantısı aktif" : "Instagram bağlantısı kontrol edilemedi",
    },
    apiCard: {
      status: apiOk ? ("active" as const) : ("error" as const),
      label: apiOk ? "API erişimi aktif" : "API erişimi sorunlu",
    },
    securityChecks,
    permissions,
    account,
    tokenStatus,
    lastCheckedAt: new Date().toISOString(),
    apiError,
    notProvided: API_NOT_PROVIDED,
    securitySummary: [
      {
        status: apiOk ? ("ok" as const) : ("warn" as const),
        text: apiOk ? "API bağlantısı aktif" : "API bağlantısı kontrol edilemedi",
      },
      {
        status: tokenStatus === "active" ? ("ok" as const) : ("warn" as const),
        text: tokenStatus === "active" ? "Yetkilendirme geçerli" : "Yetkilendirme yenilenmeli",
      },
      {
        status: "warn" as const,
        text: "Bazı güvenlik bilgileri API tarafından sağlanmıyor",
      },
    ],
    suspiciousGuidance:
      "Şüpheli giriş fark ettiyseniz resmi hesap güvenliği adımlarını uygulayın.",
  };
}

function baseUnavailableChecks(): SecurityCheckItem[] {
  return [
    {
      id: "selfie",
      label: "Selfie doğrulama",
      status: "unavailable",
      detail: API_NOT_PROVIDED.selfieVerification,
    },
    {
      id: "score",
      label: "Güvenlik skoru",
      status: "unavailable",
      detail: API_NOT_PROVIDED.securityScore,
    },
    {
      id: "2fa",
      label: "2FA durumu",
      status: "unavailable",
      detail: API_NOT_PROVIDED.twoFactorStatus,
    },
    {
      id: "devices",
      label: "Bağlı cihazlar",
      status: "unavailable",
      detail: API_NOT_PROVIDED.linkedDevices,
    },
  ];
}
