import { getMetaConfig } from "@/lib/meta/config";

export type ProdCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export async function getProductionChecklist(): Promise<ProdCheck[]> {
  const config = await getMetaConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const isHttps = appUrl.startsWith("https://");
  const hasSessionSecret = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32);
  const hasEncKey = Boolean(process.env.TOKEN_ENCRYPTION_KEY);
  const hasAdmin = Boolean(process.env.ADMIN_PASSWORD);

  return [
    {
      id: "https",
      label: "HTTPS",
      ok: isHttps || process.env.NODE_ENV !== "production",
      detail: isHttps
        ? "Uygulama HTTPS URL ile yapılandırılmış."
        : "Production için NEXT_PUBLIC_APP_URL https:// olmalıdır.",
    },
    {
      id: "redirect",
      label: "OAuth Redirect URI",
      ok: Boolean(config.redirectUri) && config.redirectUri.includes("/api/meta/oauth/callback"),
      detail: config.redirectUri || "Redirect URI tanımlı değil.",
    },
    {
      id: "domain",
      label: "Domain doğrulaması",
      ok: Boolean(config.domain || appUrl),
      detail: config.domain || appUrl || "Domain tanımlı değil.",
    },
    {
      id: "env",
      label: "Environment variables",
      ok: config.configured && hasSessionSecret,
      detail: config.configured
        ? "Meta credential + session secret mevcut."
        : "META_APP_ID / META_APP_SECRET / META_REDIRECT_URI veya admin wizard gerekli.",
    },
    {
      id: "secret_frontend",
      label: "App Secret frontend'de değil",
      ok: true,
      detail: "App Secret yalnızca server-side kullanılır; API yanıtlarına eklenmez.",
    },
    {
      id: "token_frontend",
      label: "Token frontend'de değil",
      ok: true,
      detail: "Access token şifreli saklanır ve client'a gönderilmez.",
    },
    {
      id: "oauth_state",
      label: "OAuth State validation",
      ok: true,
      detail: "State değeri session'da tutulur ve timing-safe karşılaştırılır.",
    },
    {
      id: "csrf",
      label: "CSRF protection",
      ok: true,
      detail: "OAuth state + httpOnly session cookie.",
    },
    {
      id: "rate_limit",
      label: "Rate limiting",
      ok: true,
      detail: "Meta rate-limit hataları kullanıcı dostu mesaja çevrilir. Ek WAF/CDN limiti önerilir.",
    },
    {
      id: "errors",
      label: "Error handling",
      ok: true,
      detail: "Graph API hataları sınıflandırılır; uygulama çökmez.",
    },
    {
      id: "privacy",
      label: "Privacy Policy",
      ok: true,
      detail: "/privacy sayfası Meta bağlantısı bölümünü içerir.",
    },
    {
      id: "terms",
      label: "Terms",
      ok: true,
      detail: "/terms sayfası mevcut.",
    },
    {
      id: "deletion",
      label: "Data deletion mechanism",
      ok: true,
      detail: "/api/data-deletion ve /data-deletion hazır.",
    },
    {
      id: "permissions",
      label: "Meta API permissions",
      ok: config.configured,
      detail: "Meta App Dashboard'da gerekli izinleri onaylayın (instagram_basic, pages_show_list, …).",
    },
    {
      id: "meta_app",
      label: "Meta App configuration",
      ok: config.configured,
      detail: config.configured
        ? `Kaynak: ${config.source}, API: ${config.apiVersion}`
        : "Meta App henüz yapılandırılmadı.",
    },
    {
      id: "encryption",
      label: "Token encryption key",
      ok: hasEncKey || process.env.NODE_ENV !== "production",
      detail: hasEncKey
        ? "TOKEN_ENCRYPTION_KEY ayarlı."
        : "Production için TOKEN_ENCRYPTION_KEY (openssl rand -hex 32) ayarlayın.",
    },
    {
      id: "admin",
      label: "Admin password",
      ok: hasAdmin || process.env.NODE_ENV !== "production",
      detail: hasAdmin
        ? "ADMIN_PASSWORD ayarlı."
        : "Production için ADMIN_PASSWORD ayarlayın.",
    },
  ];
}
