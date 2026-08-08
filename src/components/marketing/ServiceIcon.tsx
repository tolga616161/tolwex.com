type Icon =
  | "analytics"
  | "instagram"
  | "followers"
  | "unfollow"
  | "nonfollow"
  | "fake"
  | "report"
  | "news"
  | "security"
  | "social"
  | "eye"
  | "block";

export function ServiceIcon({ name }: { name: Icon }) {
  return (
    <svg className="service-icon-svg" viewBox="0 0 48 48" fill="none" aria-hidden>
      {name === "analytics" && (
        <>
          <rect x="8" y="28" width="6" height="12" rx="1" fill="currentColor" />
          <rect x="18" y="20" width="6" height="20" rx="1" fill="currentColor" />
          <rect x="28" y="12" width="6" height="28" rx="1" fill="currentColor" />
          <path d="M8 14h32" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        </>
      )}
      {name === "instagram" && (
        <>
          <rect x="10" y="10" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" />
          <circle cx="24" cy="24" r="7" stroke="currentColor" strokeWidth="2" />
          <circle cx="33" cy="15" r="2" fill="currentColor" />
        </>
      )}
      {name === "eye" && (
        <>
          <path
            d="M6 24c4-8 10-12 18-12s14 4 18 12c-4 8-10 12-18 12S10 32 6 24z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="24" cy="24" r="2.5" fill="currentColor" />
        </>
      )}
      {name === "block" && (
        <>
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" />
          <path d="M14 14l20 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
      {name === "followers" && (
        <>
          <circle cx="18" cy="18" r="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="18" r="5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M10 36c1.5-6 6-9 14-9s12.5 3 14 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {name === "unfollow" && (
        <>
          <circle cx="20" cy="18" r="6" stroke="currentColor" strokeWidth="2" />
          <path
            d="M10 36c1.2-7 5-10 10-10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M28 20l12 12M40 20L28 32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {name === "nonfollow" && (
        <>
          <circle cx="16" cy="20" r="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="20" r="5" stroke="currentColor" strokeWidth="2" />
          <path d="M16 28v6M32 28v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M22 20h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </>
      )}
      {name === "fake" && (
        <>
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" />
          <path d="M24 14v12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="24" cy="32" r="1.6" fill="currentColor" />
        </>
      )}
      {name === "report" && (
        <>
          <path d="M12 10h18l6 6v22H12V10z" stroke="currentColor" strokeWidth="2" />
          <path d="M30 10v6h6" stroke="currentColor" strokeWidth="2" />
          <path d="M18 24h12M18 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {name === "news" && (
        <>
          <rect x="8" y="12" width="22" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 18h14M12 24h10M12 30h12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M28 18l8-4v22l-8-4V18z" stroke="currentColor" strokeWidth="2" />
        </>
      )}
      {name === "security" && (
        <>
          <path
            d="M24 8l14 6v10c0 9-6 14-14 16C16 38 10 33 10 24V14l14-6z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M18 24l4 4 8-8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === "social" && (
        <>
          <circle cx="14" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="34" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="24" cy="32" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M17.5 18.5l5 10M30.5 18.5l-5 10" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}
