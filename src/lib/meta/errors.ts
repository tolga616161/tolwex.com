export type MetaErrorKind =
  | "not_configured"
  | "invalid_token"
  | "expired_token"
  | "permission"
  | "rate_limit"
  | "network"
  | "unavailable"
  | "unsupported"
  | "oauth_denied"
  | "csrf"
  | "unknown";

export class MetaIntegrationError extends Error {
  kind: MetaErrorKind;
  userMessage: string;
  httpStatus: number;

  constructor(kind: MetaErrorKind, technical?: string) {
    super(technical || kind);
    this.kind = kind;
    this.httpStatus = statusFor(kind);
    this.userMessage = userMessageFor(kind);
  }
}

function statusFor(kind: MetaErrorKind): number {
  switch (kind) {
    case "not_configured":
      return 503;
    case "csrf":
    case "oauth_denied":
      return 400;
    case "invalid_token":
    case "expired_token":
    case "permission":
      return 401;
    case "rate_limit":
      return 429;
    default:
      return 502;
  }
}

export function userMessageFor(kind: MetaErrorKind): string {
  switch (kind) {
    case "not_configured":
      return "Meta entegrasyonu henüz yapılandırılmadı.";
    case "invalid_token":
    case "expired_token":
      return "Instagram bağlantınızın süresi dolmuş olabilir. Hesabınızı yeniden bağlamayı deneyin.";
    case "permission":
      return "Bu işlem için gerekli Meta izni mevcut değil.";
    case "rate_limit":
      return "Instagram bağlantısı şu anda yoğunluk nedeniyle kontrol edilemiyor. Lütfen daha sonra tekrar deneyin.";
    case "network":
    case "unavailable":
      return "Instagram bağlantısı şu anda kontrol edilemiyor. Lütfen daha sonra tekrar deneyin.";
    case "unsupported":
      return "Bu bilgi resmi Meta API tarafından sağlanmıyor.";
    case "oauth_denied":
      return "Instagram bağlantısı iptal edildi veya izin verilmedi.";
    case "csrf":
      return "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.";
    default:
      return "Instagram bağlantısı şu anda kontrol edilemiyor. Lütfen daha sonra tekrar deneyin.";
  }
}

export function classifyGraphError(payload: unknown, httpStatus?: number): MetaErrorKind {
  const err = (payload as { error?: { code?: number; type?: string; message?: string } })?.error;
  const code = err?.code;
  const message = (err?.message || "").toLowerCase();

  if (httpStatus === 429 || code === 4 || code === 17 || code === 32 || message.includes("rate")) {
    return "rate_limit";
  }
  if (code === 190 || message.includes("expired") || message.includes("session has expired")) {
    return "expired_token";
  }
  if (code === 102 || code === 463 || code === 467 || message.includes("invalid")) {
    return "invalid_token";
  }
  if (code === 10 || code === 200 || code === 294 || message.includes("permission")) {
    return "permission";
  }
  if (httpStatus && httpStatus >= 500) return "unavailable";
  return "unknown";
}
