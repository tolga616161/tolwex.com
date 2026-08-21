"use client";

const SOCIAL = [
  { id: "ig", src: "/brand/social/ig.png", label: "Instagram", cls: "hero-sm-ig" },
  { id: "fb", src: "/brand/social/fb.png", label: "Facebook", cls: "hero-sm-fb" },
  { id: "tt", src: "/brand/social/tt.svg", label: "TikTok", cls: "hero-sm-tt" },
  { id: "tw", src: "/brand/social/tw.png", label: "X", cls: "hero-sm-tw" },
  { id: "yt", src: "/brand/social/yt.png", label: "YouTube", cls: "hero-sm-yt" },
  { id: "tg", src: "/brand/social/tg.svg", label: "Telegram", cls: "hero-sm-tg" },
];

/** 3D hero: siber savaş haritası + ortada saldıran siyah hacker */
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

      {/* Ortada: şapkalı siyah hacker — haritaya saldırıyor */}
      <div className="hero-hacker" title="Hacker">
        <div className="hero-hacker-pulse" />
        <div className="hero-hacker-beams">
          <span />
          <span />
          <span />
          <span />
        </div>
        <HackerFigure />
      </div>

      <span className="hero-bit hero-bit-a">010101</span>
      <span className="hero-bit hero-bit-b">ATTACK.MAP</span>
      <span className="hero-bit hero-bit-c">CYBER</span>
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

        <g className="cyber-map-land" fill="none" stroke="url(#mapStroke)" strokeWidth="1.2">
          <path d="M120 80c40-30 90-35 130-10 25 15 40 40 35 70-8 40-50 55-85 45-40-12-70-55-80-105z" />
          <path d="M280 95c55-20 110-5 140 35 20 28 15 70-20 90-40 22-95 10-120-25-22-30-18-75 0-100z" />
          <path d="M480 70c70-25 140-10 170 40 25 42 10 95-40 115-55 22-130 5-155-45-20-40-5-85 25-110z" />
          <path d="M160 210c35-15 75-5 95 30 15 28 5 60-30 70-38 12-80-10-90-45-8-28 5-45 25-55z" />
          <path d="M520 200c45-20 95 0 110 40 12 32-10 65-50 70-42 6-85-20-90-55-4-28 10-45 30-55z" />
          <path d="M620 250c40-10 80 15 75 50-5 30-45 40-75 25-28-14-35-50 0-75z" />
        </g>

        <g className="cyber-map-arcs" fill="none" stroke="#5eead4" strokeWidth="1.4" filter="url(#mapGlow)">
          <path className="cyber-arc a1" d="M150 120 C280 40, 420 40, 560 110" />
          <path className="cyber-arc a2" d="M200 220 C340 140, 480 160, 620 200" />
          <path className="cyber-arc a3" d="M320 130 C400 90, 520 180, 650 260" />
          <path className="cyber-arc a4" d="M180 180 C300 260, 450 240, 580 160" />
          <path className="cyber-arc a5" d="M100 160 C250 80, 500 60, 700 140" />
        </g>

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
          SİBER SAVAŞ HARİTASI · LIVE
        </text>
      </svg>
    </div>
  );
}

/** Tam figür: şapkalı siyah hacker (hoodie + laptop saldırı pozu) */
function HackerFigure() {
  return (
    <svg viewBox="0 0 200 240" className="hero-hacker-svg" aria-hidden>
      <defs>
        <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <linearGradient id="screenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0.2" />
        </linearGradient>
        <filter id="hackerGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="100" cy="228" rx="48" ry="8" fill="rgba(94,234,212,0.12)" />

      {/* Body / hoodie */}
      <path
        d="M58 118c8-28 28-48 42-48s34 20 42 48c6 22 8 48 6 72H52c-2-24 0-50 6-72z"
        fill="url(#hoodieGrad)"
        stroke="#5eead4"
        strokeWidth="1.4"
        strokeOpacity="0.45"
      />
      {/* Hood */}
      <path
        d="M72 95c6-22 18-34 28-34s22 12 28 34c-8 6-18 10-28 10s-20-4-28-10z"
        fill="#0d0d0d"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />

      {/* Face (shadowed) */}
      <ellipse cx="100" cy="88" rx="18" ry="20" fill="#0a0a0a" />
      <ellipse cx="93" cy="86" rx="3" ry="2" fill="#5eead4" opacity="0.85" filter="url(#hackerGlow)" />
      <ellipse cx="107" cy="86" rx="3" ry="2" fill="#5eead4" opacity="0.85" filter="url(#hackerGlow)" />

      {/* Hacker hat */}
      <path
        d="M68 78c4-22 16-34 32-34s28 12 32 34H68z"
        fill="#080808"
        stroke="#5eead4"
        strokeWidth="1.5"
      />
      <path
        d="M62 78h76c2 0 3.5 1.2 3.5 2.8S140 84 138 84H62c-2 0-3.5-1.4-3.5-3.2S60 78 62 78z"
        fill="#111"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.8"
      />
      <path
        d="M108 48c2-10 8-16 16-18-1 8 0 14-4 18"
        fill="none"
        stroke="#5eead4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="100" cy="68" r="2.2" fill="#5eead4" />

      {/* Arms to laptop */}
      <path
        d="M58 140c-18 18-28 38-30 52"
        fill="none"
        stroke="#111"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M142 140c18 18 28 38 30 52"
        fill="none"
        stroke="#111"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M58 140c-18 18-28 38-30 52"
        fill="none"
        stroke="#5eead4"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M142 140c18 18 28 38 30 52"
        fill="none"
        stroke="#5eead4"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />

      {/* Laptop */}
      <rect x="48" y="168" width="104" height="58" rx="4" fill="#0a0a0a" stroke="#5eead4" strokeWidth="1.3" />
      <rect x="54" y="174" width="92" height="40" rx="2" fill="#04110c" />
      <rect x="54" y="174" width="92" height="40" rx="2" fill="url(#screenGlow)" opacity="0.35" />
      {/* Code lines on screen */}
      <g stroke="#5eead4" strokeWidth="1.2" opacity="0.8">
        <line x1="62" y1="184" x2="110" y2="184" />
        <line x1="62" y1="192" x2="128" y2="192" />
        <line x1="62" y1="200" x2="98" y2="200" />
        <line x1="62" y1="208" x2="118" y2="208" />
      </g>
      <text x="70" y="206" fill="#5eead4" fontSize="7" fontFamily="monospace" opacity="0.7">
        01 ATTACK
      </text>

      {/* Attack rays from laptop upward to map */}
      <g className="hero-hacker-rays" stroke="#5eead4" strokeWidth="1.2" fill="none" opacity="0.7">
        <path d="M100 168 L100 120" className="ray r1" />
        <path d="M80 170 L40 100" className="ray r2" />
        <path d="M120 170 L160 100" className="ray r3" />
      </g>
    </svg>
  );
}
