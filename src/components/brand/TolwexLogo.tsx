import Image from "next/image";

type Props = {
  className?: string;
  /** Site icon (TW mark). Off by default — wordmark-only in nav/header. */
  showMark?: boolean;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { mark: 28, wordH: 18 },
  md: { mark: 34, wordH: 22 },
  lg: { mark: 44, wordH: 28 },
};

/** Rounded square "TW" mark — favicon / app icon glyph */
export function TolwexMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/brand/tolwex-icon.png"
      alt="TW"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

export function TolwexLogo({
  className = "",
  showMark = false,
  showWordmark = true,
  size = "md",
}: Props) {
  const s = SIZES[size];
  const wordW = Math.round(s.wordH * 5.9);

  return (
    <span className={`tolwex-logo ${className}`} data-brand="TOLWEX">
      {showMark ? <TolwexMark size={s.mark} className="tolwex-mark" /> : null}
      {showWordmark ? (
        <Image
          src="/brand/tolwex-wordmark.png"
          alt="TOLWEX"
          width={wordW}
          height={s.wordH}
          className="tolwex-wordmark-img"
          priority
        />
      ) : null}
    </span>
  );
}
