import Image from "next/image";

type Props = {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { mark: 28, wordH: 18 },
  md: { mark: 34, wordH: 22 },
  lg: { mark: 44, wordH: 28 },
};

/** Rounded square "T" mark — site icon / brand glyph */
export function TolwexMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/brand/tolwex-icon.png"
      alt=""
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

export function TolwexLogo({ className = "", showWordmark = true, size = "md" }: Props) {
  const s = SIZES[size];
  const wordW = Math.round(s.wordH * 5.9);

  return (
    <span className={`tolwex-logo ${className}`} data-brand="TOLWEX">
      <TolwexMark size={s.mark} className="tolwex-mark" />
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
