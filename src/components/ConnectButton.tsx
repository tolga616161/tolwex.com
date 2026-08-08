"use client";

type Props = {
  label?: string;
  className?: string;
};

export function ConnectButton({
  label = "Instagram Hesabımı Kontrol Et",
  className = "",
}: Props) {
  return (
    <a
      href="/api/meta/oauth/start"
      className={`btn btn-primary pulse-ring ${className}`}
    >
      {label}
    </a>
  );
}
