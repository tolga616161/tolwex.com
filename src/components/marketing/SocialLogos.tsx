import { PLATFORMS as CORE } from "@/lib/platforms";

const PLATFORMS = CORE.filter((p) =>
  ["ig", "tt", "yt", "tw", "fb", "tg", "sc", "in"].includes(p.id)
);

export function SocialLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`social-logos ${className}`} aria-label="Desteklenen platformlar">
      {PLATFORMS.map((p) => (
        <div key={p.id} className="social-logo-item" title={p.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.src} alt={p.name} width={44} height={44} className="social-logo-img" />
          <span className="social-logo-name">{p.name}</span>
        </div>
      ))}
    </div>
  );
}
