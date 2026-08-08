type Props = {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { mark: 22, text: "1rem" },
  md: { mark: 28, text: "1.15rem" },
  lg: { mark: 40, text: "1.6rem" },
};

/** Geometric mark: linked nodes forming a secure network node. */
export function TolwexMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <rect x="1" y="1" width="30" height="30" rx="8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="11" r="2.2" fill="currentColor" />
      <circle cx="22" cy="10" r="2.2" fill="currentColor" />
      <circle cx="16" cy="21" r="2.4" fill="currentColor" />
      <path
        d="M11.8 12.2L14.4 19.2M20.2 11.6L17.6 19.1M12.2 11.1L19.8 10.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="16" cy="15.5" r="1.1" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

export function TolwexLogo({ className = "", showWordmark = true, size = "md" }: Props) {
  const s = SIZES[size];
  return (
    <span className={`tolwex-logo ${className}`} data-brand="TOLWEX">
      <TolwexMark size={s.mark} className="tolwex-mark" />
      {showWordmark ? (
        <span className="tolwex-wordmark" style={{ fontSize: s.text }}>
          TOLWEX
        </span>
      ) : null}
    </span>
  );
}
