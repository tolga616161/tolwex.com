"use client";

const SOCIAL = [
  { id: "ig", src: "/brand/social/ig.png", label: "Instagram", cls: "hero-sm-ig" },
  { id: "fb", src: "/brand/social/fb.png", label: "Facebook", cls: "hero-sm-fb" },
  { id: "tt", src: "/brand/social/tt.svg", label: "TikTok", cls: "hero-sm-tt" },
  { id: "tw", src: "/brand/social/tw.png", label: "X", cls: "hero-sm-tw" },
  { id: "yt", src: "/brand/social/yt.png", label: "YouTube", cls: "hero-sm-yt" },
  { id: "tg", src: "/brand/social/tg.svg", label: "Telegram", cls: "hero-sm-tg" },
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
    // North America
    [140, 90, 300, 230, (x, y) => {
      const nx = (x - 220) / 80;
      const ny = (y - 155) / 70;
      return nx * nx * 0.7 + ny * ny < 1.05 && y < 210 + Math.sin(x / 30) * 12;
    }],
    // South America
    [250, 240, 340, 380, (x, y) => {
      const nx = (x - 295) / 38;
      const ny = (y - 305) / 70;
      return nx * nx + ny * ny * 0.55 < 1;
    }],
    // Europe
    [450, 95, 560, 175, (x, y) => {
      const nx = (x - 505) / 48;
      const ny = (y - 130) / 35;
      return nx * nx + ny * ny < 1.1;
    }],
    // Africa
    [470, 175, 590, 340, (x, y) => {
      const nx = (x - 525) / 48;
      const ny = (y - 255) / 75;
      return nx * nx * 0.85 + ny * ny < 1;
    }],
    // Asia
    [560, 90, 860, 230, (x, y) => {
      const nx = (x - 710) / 130;
      const ny = (y - 155) / 60;
      return nx * nx + ny * ny * 0.9 < 1.05;
    }],
    // SE Asia / Australia
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

/** 3D hero: noktalı dünya + siber saldırı + ortada hooded operator */
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
        <div className="hero-hacker-beams">
          <span />
          <span />
          <span />
          <span />
        </div>
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
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.12" />
              <stop offset="55%" stopColor="#fff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0" />
              <stop offset="35%" stopColor="#5eead4" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
            </linearGradient>
            <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="pingGlow">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="1000" height="460" fill="url(#mapWash)" />

          {/* Grid latitude / longitude */}
          <g className="cyber-map-grid" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" fill="none">
            {[90, 150, 210, 270, 330].map((y) => (
              <path key={`lat-${y}`} d={`M40 ${y} Q500 ${y - 18} 960 ${y}`} />
            ))}
            {[160, 320, 480, 640, 800].map((x) => (
              <path key={`lon-${x}`} d={`M${x} 50 Q${x + 8} 230 ${x} 410`} />
            ))}
          </g>

          {/* Dotted continents */}
          <g className="cyber-map-dots" filter="url(#mapGlow)">
            {WORLD_DOTS.map((d, i) => (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill={i % 7 === 0 ? "rgba(94,234,212,0.75)" : "rgba(255,255,255,0.55)"}
              />
            ))}
          </g>

          {/* Attack arcs */}
          <g className="cyber-map-arcs" fill="none" stroke="url(#arcGrad)" strokeWidth="1.6">
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

          {/* Traveling attack packets */}
          <g className="cyber-map-packets" filter="url(#pingGlow)">
            {ARCS.slice(0, 6).map(([a, b], i) => {
              const from = HUBS[a];
              const to = HUBS[b];
              const mx = (from.x + to.x) / 2;
              const my = Math.min(from.y, to.y) - 40 - (i % 3) * 18;
              return (
                <circle key={`pkt-${i}`} className={`cyber-packet p${i + 1}`} r="3.2" fill="#5eead4">
                  <animateMotion
                    dur={`${2.4 + i * 0.35}s`}
                    repeatCount="indefinite"
                    path={`M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`}
                  />
                </circle>
              );
            })}
          </g>

          {/* Impact hubs */}
          <g className="cyber-map-nodes">
            {HUBS.map((h, i) => (
              <g key={h.id} transform={`translate(${h.x} ${h.y})`}>
                <circle className={`cyber-ring r${(i % 4) + 1}`} r="14" fill="none" stroke="#5eead4" strokeWidth="1" />
                <circle className={`cyber-node n${(i % 7) + 1}`} r="3.8" />
              </g>
            ))}
          </g>

          <text x="500" y="34" textAnchor="middle" className="cyber-map-label">
            SİBER SALDIRI HARİTASI · LIVE
          </text>
        </svg>
      </div>
    </div>
  );
}

/** Hooded operator + laptop — referans: gölgeli yüz, 3D silüet */
function HackerFigure() {
  return (
    <svg viewBox="0 0 280 340" className="hero-hacker-svg" aria-hidden>
      <defs>
        <linearGradient id="hoodGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="40%" stopColor="#121212" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id="lapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1f1f1f" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id="scrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#0d9488" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#022c26" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="faceShade" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#000" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </radialGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="depthShadow" x="-30%" y="-10%" width="160%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#000" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* Floor contact shadow */}
      <ellipse cx="140" cy="318" rx="78" ry="10" fill="rgba(0,0,0,0.55)" />
      <ellipse cx="140" cy="318" rx="52" ry="6" fill="rgba(94,234,212,0.12)" />

      <g filter="url(#depthShadow)">
        {/* Torso / hoodie */}
        <path
          d="M78 150
             C70 175 62 220 58 270
             L78 292 L202 292 L222 270
             C218 220 210 175 202 150
             C188 168 162 178 140 178
             C118 178 92 168 78 150Z"
          fill="url(#bodyGrad)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />

        {/* Hood volume */}
        <path
          d="M88 148
             C78 110 95 72 140 68
             C185 72 202 110 192 148
             C176 162 156 170 140 170
             C124 170 104 162 88 148Z"
          fill="url(#hoodGrad)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1.2"
        />
        {/* Hood inner rim */}
        <path
          d="M100 145
             C108 118 120 102 140 100
             C160 102 172 118 180 145
             C166 156 152 162 140 162
             C128 162 114 156 100 145Z"
          fill="#050505"
          stroke="rgba(94,234,212,0.15)"
          strokeWidth="0.8"
        />

        {/* Face cavity — fully shadowed */}
        <ellipse cx="140" cy="132" rx="28" ry="34" fill="url(#faceShade)" />
        {/* Soft teal eye glints deep in shadow */}
        <ellipse cx="128" cy="130" rx="3.2" ry="2.2" fill="#5eead4" opacity="0.55" filter="url(#softGlow)" />
        <ellipse cx="152" cy="130" rx="3.2" ry="2.2" fill="#5eead4" opacity="0.55" filter="url(#softGlow)" />

        {/* Arms to keyboard */}
        <path
          d="M78 188 C48 210 36 248 42 278"
          fill="none"
          stroke="#0d0d0d"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M202 188 C232 210 244 248 238 278"
          fill="none"
          stroke="#0d0d0d"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M78 188 C48 210 36 248 42 278"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M202 188 C232 210 244 248 238 278"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Hands */}
        <ellipse cx="48" cy="278" rx="12" ry="7" fill="#111" />
        <ellipse cx="232" cy="278" rx="12" ry="7" fill="#111" />

        {/* Laptop base */}
        <path
          d="M56 286 L224 286 L236 302 L44 302 Z"
          fill="#0a0a0a"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        {/* Laptop screen — perspective */}
        <path
          d="M72 214 L208 214 L218 286 L62 286 Z"
          fill="url(#lapGrad)"
          stroke="rgba(94,234,212,0.35)"
          strokeWidth="1.4"
        />
        <path d="M80 222 L200 222 L208 278 L72 278 Z" fill="#02110e" />
        <path d="M80 222 L200 222 L208 278 L72 278 Z" fill="url(#scrGrad)" opacity="0.38" />

        <g fontFamily="ui-monospace, monospace" fontSize="7.5" fill="#5eead4" opacity="0.9">
          <text x="88" y="242">tolwex@ops:~# scan --live</text>
          <text x="88" y="254">▸ attack vector locked</text>
          <text x="88" y="266">▸ session · secure</text>
        </g>
      </g>

      {/* Beams from laptop to map */}
      <g className="hero-hacker-rays" stroke="#5eead4" strokeWidth="1.2" fill="none">
        <path className="ray r1" d="M140 214 L140 40" />
        <path className="ray r2" d="M100 220 L40 70" />
        <path className="ray r3" d="M180 220 L240 70" />
        <path className="ray r4" d="M120 218 L80 50" />
        <path className="ray r5" d="M160 218 L200 50" />
      </g>
    </svg>
  );
}
