const PLATFORMS = [
  { id: "ig", name: "Instagram", src: "/brand/social/ig.png" },
  { id: "yt", name: "YouTube", src: "/brand/social/yt.png" },
  { id: "tw", name: "X / Twitter", src: "/brand/social/tw.png" },
  { id: "fb", name: "Facebook", src: "/brand/social/fb.png" },
  { id: "sc", name: "Snapchat", src: "/brand/social/sc.png" },
  { id: "tt", name: "TikTok", src: "/brand/social/tt.svg" },
  { id: "in", name: "LinkedIn", src: "/brand/social/in.png" },
  { id: "pt", name: "Pinterest", src: "/brand/social/pt.png" },
] as const;

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
