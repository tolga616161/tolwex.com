"use client";

/** Sade hero dekor: IG / FB + dönen yıldız & dünya — abartısız */
export function HeroOrbit() {
  return (
    <div className="hero-orbit" aria-hidden>
      <div className="hero-orbit-ring" />
      <div className="hero-float hero-float-ig" title="Instagram">
        <IgMark />
      </div>
      <div className="hero-float hero-float-fb" title="Facebook">
        <FbMark />
      </div>
      <div className="hero-float hero-float-star">
        <StarMark />
      </div>
      <div className="hero-float hero-float-globe">
        <GlobeMark />
      </div>
      <span className="hero-bit hero-bit-a">01</span>
      <span className="hero-bit hero-bit-b">10</span>
      <span className="hero-bit hero-bit-c">01</span>
    </div>
  );
}

function IgMark() {
  return (
    <svg viewBox="0 0 24 24" className="hero-brand-svg" aria-hidden>
      <defs>
        <linearGradient id="igHeroGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f58529" />
          <stop offset="45%" stopColor="#dd2a7b" />
          <stop offset="100%" stopColor="#8134af" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#igHeroGrad)" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="#fff" />
    </svg>
  );
}

function FbMark() {
  return (
    <svg viewBox="0 0 24 24" className="hero-brand-svg" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.4 20v-6.3h2.1l.3-2.4h-2.4V9.7c0-.7.2-1.2 1.2-1.2h1.3V6.3c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.8H8.6v2.4h2.2V20h2.6z"
      />
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
