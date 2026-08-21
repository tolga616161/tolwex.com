"use client";

const SOCIAL = [
  { id: "ig", src: "/brand/social/ig.png", label: "Instagram", cls: "hero-sm-ig" },
  { id: "fb", src: "/brand/social/fb.png", label: "Facebook", cls: "hero-sm-fb" },
  { id: "tt", src: "/brand/social/tt.svg", label: "TikTok", cls: "hero-sm-tt" },
  { id: "tw", src: "/brand/social/tw.png", label: "X", cls: "hero-sm-tw" },
  { id: "yt", src: "/brand/social/yt.png", label: "YouTube", cls: "hero-sm-yt" },
  { id: "tg", src: "/brand/social/tg.svg", label: "Telegram", cls: "hero-sm-tg" },
];

/** 3D hero: siber savaş haritası + ortada mature hacker silüeti */
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

      <div className="hero-hacker" title="Operator">
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

/** Olgun silüet: fedora + hoodie + maske + terminal — çocuksu değil */
function HackerFigure() {
  return (
    <svg viewBox="0 0 220 280" className="hero-hacker-svg" aria-hidden>
      <defs>
        <linearGradient id="coatGrad" x1="0%" y1="0%" x2="40%" y2="100%">
          <stop offset="0%" stopColor="#1c1c1c" />
          <stop offset="55%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#222" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <linearGradient id="scrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0d3d36" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="1" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="110" cy="268" rx="56" ry="7" fill="rgba(94,234,212,0.1)" />

      {/* Long coat / body silhouette */}
      <path
        d="M62 128
           C70 96 88 78 110 78
           C132 78 150 96 158 128
           C168 168 172 220 168 252
           L52 252
           C48 220 52 168 62 128Z"
        fill="url(#coatGrad)"
        stroke="rgba(94,234,212,0.28)"
        strokeWidth="1.2"
      />
      {/* Lapel lines */}
      <path d="M96 130 L88 210" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" fill="none" />
      <path d="M124 130 L132 210" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" fill="none" />

      {/* Hood under hat */}
      <path
        d="M78 118 C86 92 98 82 110 82 C122 82 134 92 142 118 C130 126 118 130 110 130 C102 130 90 126 78 118Z"
        fill="#080808"
      />

      {/* Head / mask */}
      <ellipse cx="110" cy="112" rx="22" ry="26" fill="#0b0b0b" />
      <path
        d="M90 118 C96 128 104 132 110 132 C116 132 124 128 130 118"
        fill="#050505"
        stroke="rgba(94,234,212,0.2)"
        strokeWidth="0.8"
      />
      {/* Mask visor */}
      <rect
        x="92"
        y="104"
        width="36"
        height="12"
        rx="3"
        fill="#04110e"
        stroke="rgba(94,234,212,0.45)"
        strokeWidth="1"
      />
      <ellipse cx="101" cy="110" rx="4" ry="3" fill="url(#eyeGlow)" filter="url(#softGlow)" />
      <ellipse cx="119" cy="110" rx="4" ry="3" fill="url(#eyeGlow)" filter="url(#softGlow)" />
      <line x1="105" y1="110" x2="115" y2="110" stroke="#5eead4" strokeWidth="0.7" opacity="0.5" />

      {/* Fedora — sharp, adult proportions */}
      <ellipse cx="110" cy="86" rx="48" ry="7" fill="#0a0a0a" stroke="rgba(94,234,212,0.35)" strokeWidth="1.1" />
      <path
        d="M78 86
           C82 58 94 46 110 46
           C126 46 138 58 142 86
           Z"
        fill="url(#hatGrad)"
        stroke="rgba(94,234,212,0.4)"
        strokeWidth="1.3"
      />
      {/* Hat band */}
      <path
        d="M82 78 H138"
        stroke="#5eead4"
        strokeWidth="2"
        opacity="0.55"
        strokeLinecap="round"
      />
      {/* Feather / antenna accent */}
      <path
        d="M128 52 C138 40 148 38 154 42"
        fill="none"
        stroke="#5eead4"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Arms — folded toward keyboard */}
      <path
        d="M62 150 C40 175 32 205 36 228"
        fill="none"
        stroke="#0c0c0c"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M158 150 C180 175 188 205 184 228"
        fill="none"
        stroke="#0c0c0c"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M62 150 C40 175 32 205 36 228"
        fill="none"
        stroke="rgba(94,234,212,0.25)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M158 150 C180 175 188 205 184 228"
        fill="none"
        stroke="rgba(94,234,212,0.25)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Terminal / laptop — low, cinematic */}
      <rect
        x="48"
        y="208"
        width="124"
        height="42"
        rx="3"
        fill="#050505"
        stroke="rgba(94,234,212,0.4)"
        strokeWidth="1.2"
      />
      <rect x="54" y="213" width="112" height="28" rx="2" fill="#02110d" />
      <rect x="54" y="213" width="112" height="28" rx="2" fill="url(#scrGrad)" opacity="0.28" />
      <g fontFamily="ui-monospace, monospace" fontSize="6.5" fill="#5eead4" opacity="0.85">
        <text x="60" y="223">root@tolwex:~# inject --target</text>
        <text x="60" y="232">[OK] session opened · 01</text>
      </g>

      {/* Attack beams up to map */}
      <g className="hero-hacker-rays" stroke="#5eead4" strokeWidth="1.15" fill="none" opacity="0.65">
        <path className="ray r1" d="M110 208 L110 150" />
        <path className="ray r2" d="M78 210 L42 130" />
        <path className="ray r3" d="M142 210 L178 130" />
      </g>
    </svg>
  );
}
