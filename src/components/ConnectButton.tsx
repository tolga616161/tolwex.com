"use client";

type Props = {
  label?: string;
  className?: string;
  force?: boolean;
};

export function ConnectButton({
  label = "Instagram Hesabımı Kontrol Et",
  className = "",
  force = true,
}: Props) {
  const href = force ? "/api/meta/oauth/start?force=1" : "/api/meta/oauth/start";
  return (
    <a href={href} className={`btn btn-primary pulse-ring ${className}`}>
      {label}
    </a>
  );
}
