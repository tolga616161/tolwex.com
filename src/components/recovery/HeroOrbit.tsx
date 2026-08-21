"use client";

const SOCIAL = [
  { id: "ig", src: "/brand/social/ig.png", label: "Instagram", cls: "hero-sm-ig" },
  { id: "fb", src: "/brand/social/fb.png", label: "Facebook", cls: "hero-sm-fb" },
  { id: "tt", src: "/brand/social/tt.svg", label: "TikTok", cls: "hero-sm-tt" },
  { id: "tw", src: "/brand/social/tw.png", label: "X", cls: "hero-sm-tw" },
  { id: "yt", src: "/brand/social/yt.png", label: "YouTube", cls: "hero-sm-yt" },
  { id: "tg", src: "/brand/social/tg.svg", label: "Telegram", cls: "hero-sm-tg" },
  { id: "sc", src: "/brand/social/sc.png", label: "Snapchat", cls: "hero-sm-sc" },
  { id: "in", src: "/brand/social/in.png", label: "LinkedIn", cls: "hero-sm-in" },
];

/** 3D hero: tüm sosyal logolar + hacker şapka — siyah/beyaz + hafif yeşil */
export function HeroOrbit() {
  return (
    <div className="hero-orbit" aria-hidden>
      <div className="hero-depth">
        <div className="hero-aurora hero-aurora-a" />
        <div className="hero-aurora hero-aurora-b" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid-floor" />
        <div className="hero-vignette" />
      </div>

      <div className="hero-orbit-glow" />
      <div className="hero-orbit-ring hero-orbit-ring-a" />
      <div className="hero-orbit-ring hero-orbit-ring-b" />
      <div className="hero-orbit-ring hero-orbit-ring-c" />

      {SOCIAL.map((s) => (
        <div key={s.id} className={`hero-float hero-float-3d ${s.cls}`} title={s.label}>
          <span className="hero-float-shine" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt="" className="hero-brand-img" width={34} height={34} />
        </div>
      ))}

      <div className="hero-float hero-float-3d hero-float-hat" title="Hacker">
        <span className="hero-float-shine" />
        <HackerHat />
      </div>
      <div className="hero-float hero-float-3d hero-float-star">
        <span className="hero-float-shine" />
        <StarMark />
      </div>
      <div className="hero-float hero-float-3d hero-float-globe">
        <span className="hero-float-shine" />
        <GlobeMark />
      </div>

      <span className="hero-bit hero-bit-a">010101</span>
      <span className="hero-bit hero-bit-b">101010</span>
      <span className="hero-bit hero-bit-c">01</span>
      <span className="hero-bit hero-bit-d">10</span>
    </div>
  );
}

function HackerHat() {
  return (
    <svg viewBox="0 0 64 64" className="hero-hat-svg" aria-hidden>
      <ellipse cx="32" cy="48" rx="22" ry="5" fill="rgba(255,255,255,0.12)" />
      <path
        d="M12 40c2-14 10-22 20-22s18 8 20 22H12z"
        fill="#111"
        stroke="#5eead4"
        strokeWidth="1.4"
      />
      <path d="M10 40h44c1 0 2 .8 2 2s-1 2-2 2H10c-1 0-2-.8-2-2s1-2 2-2z" fill="#1a1a1a" />
      <path d="M28 22c0-6 3-10 8-12 1 4 2 8-1 12" fill="none" stroke="#5eead4" strokeWidth="1.5" />
      <circle cx="32" cy="34" r="2.2" fill="#5eead4" />
    </svg>
  );
}

function StarMark() {
  return (
    <svg viewBox="0 0 24 24" className="hero-deco-svg hero-spin-slow" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.8 5.7 21l2.3-7.2-6-4.4h7.6L12 2.2z"
      />
    </svg>
  );
}

function GlobeMark() {
  return (
    <svg viewBox="0 0 24 24" className="hero-deco-svg hero-spin-slower" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M3.5 12h17M4.2 8h15.6M4.2 16h15.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}
