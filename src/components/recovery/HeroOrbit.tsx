"use client";

const SOCIAL = [
  { id: "ig", src: "/brand/social/ig.png", label: "Instagram", cls: "hero-sm-ig" },
  { id: "tw", src: "/brand/social/tw.png", label: "X", cls: "hero-sm-tw" },
  { id: "yt", src: "/brand/social/yt.png", label: "YouTube", cls: "hero-sm-yt" },
  { id: "wa", src: "/brand/social/wa.svg", label: "WhatsApp", cls: "hero-sm-wa" },
];

/** Hubs for cyber attack arcs (viewBox 1000×460) */
const HUBS = [
  { id: "na", x: 220, y: 160 },
  { id: "sa", x: 300, y: 310 },
  { id: "eu", x: 500, y: 130 },
  { id: "af", x: 520, y: 260 },
  { id: "me", x: 580, y: 190 },
  { id: "as", x: 720, y: 150 },
  { id: "sea", x: 780, y: 240 },
  { id: "au", x: 840, y: 330 },
] as const;

const ARCS: Array<[number, number]> = [
  [0, 2],
  [0, 5],
  [2, 5],
  [2, 3],
  [1, 3],
  [4, 6],
  [5, 7],
  [3, 5],
  [0, 4],
  [6, 2],
];

/** Dot field approximating continents — dense, map-like */
function buildWorldDots() {
  const dots: Array<{ x: number; y: number; r: number }> = [];
  const regions: Array<[number, number, number, number, (x: number, y: number) => boolean]> = [
    [140, 90, 300, 230, (x, y) => {
      const nx = (x - 220) / 80;
      const ny = (y - 155) / 70;
      return nx * nx * 0.7 + ny * ny < 1.05 && y < 210 + Math.sin(x / 30) * 12;
    }],
    [250, 240, 340, 380, (x, y) => {
      const nx = (x - 295) / 38;
      const ny = (y - 305) / 70;
      return nx * nx + ny * ny * 0.55 < 1;
    }],
    [450, 95, 560, 175, (x, y) => {
      const nx = (x - 505) / 48;
      const ny = (y - 130) / 35;
      return nx * nx + ny * ny < 1.1;
    }],
    [470, 175, 590, 340, (x, y) => {
      const nx = (x - 525) / 48;
      const ny = (y - 255) / 75;
      return nx * nx * 0.85 + ny * ny < 1;
    }],
    [560, 90, 860, 230, (x, y) => {
      const nx = (x - 710) / 130;
      const ny = (y - 155) / 60;
      return nx * nx + ny * ny * 0.9 < 1.05;
    }],
    [760, 230, 900, 360, (x, y) => {
      const a = ((x - 800) / 55) ** 2 + ((y - 255) / 30) ** 2 < 1;
      const b = ((x - 845) / 45) ** 2 + ((y - 325) / 28) ** 2 < 1;
      return a || b;
    }],
  ];

  for (const [x0, y0, x1, y1, inside] of regions) {
    for (let y = y0; y <= y1; y += 7) {
      for (let x = x0; x <= x1; x += 7) {
        const jx = x + ((y / 7) % 2 === 0 ? 0 : 3.5);
        if (inside(jx, y)) {
          dots.push({ x: jx, y, r: 1.15 + ((jx + y) % 5) * 0.12 });
        }
      }
    }
  }
  return dots;
}

const WORLD_DOTS = buildWorldDots();

/** 3D hero: noktalı dünya + saldırı yayları + ortada hooded operator */
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
      <div className="hero-stage-ring" />

      {SOCIAL.map((s) => (
        <div key={s.id} className={`hero-float hero-float-3d ${s.cls}`} title={s.label}>
          <span className="hero-float-shine" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt="" className="hero-brand-img" width={34} height={34} />
        </div>
      ))}

      <div className="hero-hacker" title="Operator">
        <div className="hero-hacker-pulse" />
        <HackerFigure />
      </div>
    </div>
  );
}

function CyberAttackMap() {
  return (
    <div className="cyber-map">
      <div className="cyber-map-plane">
        <svg viewBox="0 0 1000 460" className="cyber-map-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="mapWash" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.08" />
              <stop offset="55%" stopColor="#5eead4" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0" />
              <stop offset="35%" stopColor="#5eead4" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#fff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
            </linearGradient>
            <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="pingGlow">
              <feGaussianBlur stdDeviation="3.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="1000" height="460" fill="url(#mapWash)" />

          <g className="cyber-map-grid" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" fill="none">
            {[90, 150, 210, 270, 330].map((y) => (
              <path key={`lat-${y}`} d={`M40 ${y} Q500 ${y - 18} 960 ${y}`} />
            ))}
            {[160, 320, 480, 640, 800].map((x) => (
              <path key={`lon-${x}`} d={`M${x} 50 Q${x + 8} 230 ${x} 410`} />
            ))}
          </g>

          <g className="cyber-map-dots" filter="url(#mapGlow)">
            {WORLD_DOTS.map((d, i) => (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill={i % 9 === 0 ? "rgba(94,234,212,0.65)" : "rgba(220,220,220,0.58)"}
              />
            ))}
          </g>

          <g className="cyber-map-arcs" fill="none" stroke="url(#arcGrad)" strokeWidth="1.55">
            {ARCS.map(([a, b], i) => {
              const from = HUBS[a];
              const to = HUBS[b];
              const mx = (from.x + to.x) / 2;
              const my = Math.min(from.y, to.y) - 40 - (i % 3) * 18;
              return (
                <path
                  key={`arc-${i}`}
                  className={`cyber-arc a${(i % 5) + 1}`}
                  d={`M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`}
                />
              );
            })}
          </g>

          <g className="cyber-map-packets" filter="url(#pingGlow)">
            {ARCS.slice(0, 6).map(([a, b], i) => {
              const from = HUBS[a];
              const to = HUBS[b];
              const mx = (from.x + to.x) / 2;
              const my = Math.min(from.y, to.y) - 40 - (i % 3) * 18;
              return (
                <circle key={`pkt-${i}`} className={`cyber-packet p${i + 1}`} r="3" fill="#5eead4">
                  <animateMotion
                    dur={`${2.4 + i * 0.35}s`}
                    repeatCount="indefinite"
                    path={`M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`}
                  />
                </circle>
              );
            })}
          </g>

          <g className="cyber-map-nodes">
            {HUBS.map((h, i) => (
              <g key={h.id} transform={`translate(${h.x} ${h.y})`}>
                <circle className={`cyber-ring r${(i % 4) + 1}`} r="14" fill="none" stroke="#5eead4" strokeWidth="1" />
                <circle className={`cyber-node n${(i % 7) + 1}`} r="3.6" />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

/** Referans: önden hoodie, gölgeli yüz, laptop — 3D silüet */
function HackerFigure() {
  return (
    <svg viewBox="0 0 300 360" className="hero-hacker-svg" aria-hidden>
      <defs>
        <linearGradient id="hoodOut" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="35%" stopColor="#1c1c1c" />
          <stop offset="100%" stopColor="#070707" />
        </linearGradient>
        <linearGradient id="hoodIn" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#151515" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#242424" />
          <stop offset="55%" stopColor="#101010" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id="sleeveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id="lapShell" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </linearGradient>
        <linearGradient id="scrGlow" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#e8e8e8" stopOpacity="0.55" />
          <stop offset="40%" stopColor="#5eead4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0a1f1c" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="voidFace" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.2" />
          <stop offset="45%" stopColor="#050505" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </radialGradient>
        <filter id="figShadow" x="-35%" y="-10%" width="170%" height="150%">
          <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000" floodOpacity="0.8" />
        </filter>
        <filter id="softLight" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="150" cy="338" rx="86" ry="11" fill="rgba(0,0,0,0.6)" />
      <ellipse cx="150" cy="338" rx="54" ry="6" fill="rgba(255,255,255,0.06)" />

      <g filter="url(#figShadow)">
        {/* Desk edge hint */}
        <path
          d="M40 312 H260 L268 328 H32 Z"
          fill="#0a0a0a"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />

        {/* Torso */}
        <path
          d="M86 168
             C78 200 70 245 66 295
             L86 318 H214 L234 295
             C230 245 222 200 214 168
             C196 188 168 198 150 198
             C132 198 104 188 86 168Z"
          fill="url(#bodyGrad)"
        />
        {/* Hoodie pocket / folds */}
        <path
          d="M118 230 C132 242 168 242 182 230"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1.4"
        />
        <path d="M150 198 V268" stroke="rgba(255,255,255,0.06)" strokeWidth="1.2" />

        {/* Shoulders / sleeves */}
        <path
          d="M86 175 C55 195 42 235 48 288"
          fill="none"
          stroke="url(#sleeveGrad)"
          strokeWidth="28"
          strokeLinecap="round"
        />
        <path
          d="M214 175 C245 195 258 235 252 288"
          fill="none"
          stroke="url(#sleeveGrad)"
          strokeWidth="28"
          strokeLinecap="round"
        />

        {/* Hood outer */}
        <path
          d="M96 165
             C84 120 102 74 150 68
             C198 74 216 120 204 165
             C186 182 166 192 150 192
             C134 192 114 182 96 165Z"
          fill="url(#hoodOut)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1.2"
        />
        {/* Hood rim */}
        <path
          d="M108 160
             C116 128 128 108 150 104
             C172 108 184 128 192 160
             C176 174 162 182 150 182
             C138 182 124 174 108 160Z"
          fill="url(#hoodIn)"
        />
        {/* Face void — no features, like reference */}
        <ellipse cx="150" cy="142" rx="32" ry="38" fill="url(#voidFace)" />
        {/* Soft cheek edge only */}
        <ellipse cx="150" cy="148" rx="22" ry="26" fill="#000" opacity="0.85" />

        {/* Hands on keyboard */}
        <ellipse cx="72" cy="296" rx="16" ry="9" fill="#141414" />
        <ellipse cx="228" cy="296" rx="16" ry="9" fill="#141414" />

        {/* Laptop base */}
        <path
          d="M62 300 L238 300 L252 318 L48 318 Z"
          fill="#111"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        {/* Trackpad hint */}
        <rect x="128" y="306" width="44" height="6" rx="1.5" fill="rgba(255,255,255,0.06)" />

        {/* Screen — slight perspective, soft glow like photo */}
        <path
          d="M78 218 L222 218 L236 300 L64 300 Z"
          fill="url(#lapShell)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
          filter="url(#softLight)"
        />
        <path d="M88 228 L212 228 L222 290 L78 290 Z" fill="#0b0b0b" />
        <path d="M88 228 L212 228 L222 290 L78 290 Z" fill="url(#scrGlow)" opacity="0.55" />
        {/* Soft UI bars on screen */}
        <g opacity="0.45">
          <rect x="98" y="242" width="52" height="4" rx="1" fill="#5eead4" />
          <rect x="98" y="252" width="78" height="3" rx="1" fill="rgba(255,255,255,0.45)" />
          <rect x="98" y="260" width="64" height="3" rx="1" fill="rgba(255,255,255,0.28)" />
          <rect x="168" y="242" width="36" height="28" rx="3" fill="rgba(94,234,212,0.2)" stroke="rgba(94,234,212,0.4)" />
        </g>
      </g>
    </svg>
  );
}
