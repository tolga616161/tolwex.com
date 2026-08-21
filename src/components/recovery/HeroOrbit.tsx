"use client";

const SOCIAL = [
  { id: "ig", src: "/brand/social/ig.png", label: "Instagram", cls: "hero-sm-ig" },
  { id: "fb", src: "/brand/social/fb.png", label: "Facebook", cls: "hero-sm-fb" },
  { id: "tt", src: "/brand/social/tt.svg", label: "TikTok", cls: "hero-sm-tt" },
  { id: "tw", src: "/brand/social/tw.png", label: "X", cls: "hero-sm-tw" },
  { id: "yt", src: "/brand/social/yt.png", label: "YouTube", cls: "hero-sm-yt" },
  { id: "tg", src: "/brand/social/tg.svg", label: "Telegram", cls: "hero-sm-tg" },
];

/** 3D hero: SM logoları + hacker şapka + siber saldırı haritası */
export function HeroOrbit() {
  return (
    <div className="hero-orbit" aria-hidden>
      <div className="hero-depth">
        <div className="hero-aurora hero-aurora-a" />
        <div className="hero-aurora hero-aurora-b" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <CyberAttackMap />
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

      <span className="hero-bit hero-bit-a">010101</span>
      <span className="hero-bit hero-bit-b">ATTACK.MAP</span>
      <span className="hero-bit hero-bit-c">01</span>
      <span className="hero-bit hero-bit-d">SECURE</span>
    </div>
  );
}

function CyberAttackMap() {
  return (
    <div className="cyber-map">
      <svg viewBox="0 0 800 360" className="cyber-map-svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mapStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0.55" />
          </linearGradient>
          <filter id="mapGlow">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Simplified world continents (stylized) */}
        <g className="cyber-map-land" fill="none" stroke="url(#mapStroke)" strokeWidth="1.2">
          <path d="M120 80c40-30 90-35 130-10 25 15 40 40 35 70-8 40-50 55-85 45-40-12-70-55-80-105z" />
          <path d="M280 95c55-20 110-5 140 35 20 28 15 70-20 90-40 22-95 10-120-25-22-30-18-75 0-100z" />
          <path d="M480 70c70-25 140-10 170 40 25 42 10 95-40 115-55 22-130 5-155-45-20-40-5-85 25-110z" />
          <path d="M160 210c35-15 75-5 95 30 15 28 5 60-30 70-38 12-80-10-90-45-8-28 5-45 25-55z" />
          <path d="M520 200c45-20 95 0 110 40 12 32-10 65-50 70-42 6-85-20-90-55-4-28 10-45 30-55z" />
          <path d="M620 250c40-10 80 15 75 50-5 30-45 40-75 25-28-14-35-50 0-75z" />
        </g>

        {/* Attack arcs */}
        <g className="cyber-map-arcs" fill="none" stroke="#5eead4" strokeWidth="1.4" filter="url(#mapGlow)">
          <path className="cyber-arc a1" d="M150 120 C280 40, 420 40, 560 110" />
          <path className="cyber-arc a2" d="M200 220 C340 140, 480 160, 620 200" />
          <path className="cyber-arc a3" d="M320 130 C400 90, 520 180, 650 260" />
          <path className="cyber-arc a4" d="M180 180 C300 260, 450 240, 580 160" />
          <path className="cyber-arc a5" d="M100 160 C250 80, 500 60, 700 140" />
        </g>

        {/* Hot nodes */}
        <g className="cyber-map-nodes">
          <circle className="cyber-node n1" cx="150" cy="120" r="4" />
          <circle className="cyber-node n2" cx="320" cy="130" r="3.5" />
          <circle className="cyber-node n3" cx="560" cy="110" r="4.5" />
          <circle className="cyber-node n4" cx="200" cy="220" r="3.5" />
          <circle className="cyber-node n5" cx="620" cy="200" r="4" />
          <circle className="cyber-node n6" cx="650" cy="260" r="3.5" />
          <circle className="cyber-node n7" cx="480" cy="170" r="3" />
        </g>

        <text x="28" y="34" className="cyber-map-label">
          GLOBAL THREAT MAP · LIVE
        </text>
      </svg>
    </div>
  );
}

function HackerHat() {
  return (
    <svg viewBox="0 0 64 64" className="hero-hat-svg" aria-hidden>
      <ellipse cx="32" cy="50" rx="24" ry="4.5" fill="rgba(94,234,212,0.12)" />
      <path
        d="M11 41c2.5-15 11-24 21-24s18.5 9 21 24H11z"
        fill="#0a0a0a"
        stroke="#5eead4"
        strokeWidth="1.6"
      />
      <path
        d="M8 41h48c1.2 0 2.2.9 2.2 2.1S57.2 45 56 45H8c-1.2 0-2.2-.8-2.2-2s1-2.1 2.2-2.1z"
        fill="#141414"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.8"
      />
      <path
        d="M27 20c1-7 5-12 11-14 0 5 1 10-2 14"
        fill="none"
        stroke="#5eead4"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="32" cy="34" r="2.4" fill="#5eead4" />
      <path d="M22 36h20" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    </svg>
  );
}
