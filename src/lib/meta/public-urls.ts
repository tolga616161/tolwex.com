export function getAppOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getMetaDomainHints() {
  const origin = getAppOrigin();
  let hostname = "localhost";
  try {
    hostname = new URL(origin).hostname;
  } catch {
    // keep default
  }

  const parts = hostname.split(".");
  const rootDomain =
    parts.length >= 2 ? parts.slice(-2).join(".") : hostname;

  return {
    origin,
    hostname,
    rootDomain,
    appDomains: [hostname, rootDomain].filter(
      (v, i, arr) => v && arr.indexOf(v) === i
    ),
    siteUrl: `${origin}/`,
    oauthRedirectUri: `${origin}/api/meta/oauth/callback`,
    privacyUrl: `${origin}/privacy`,
    termsUrl: `${origin}/terms`,
    dataDeletionUrl: `${origin}/api/data-deletion`,
    webhookUrl: `${origin}/api/meta/webhook`,
  };
}
