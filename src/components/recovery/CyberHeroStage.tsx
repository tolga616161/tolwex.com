"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const ICONS = [
  { name: "IG", label: "Instagram", color: "#E1306C", delay: "0s" },
  { name: "f", label: "Facebook", color: "#1877F2", delay: "0.4s" },
  { name: "♪", label: "TikTok", color: "#69C9D0", delay: "0.8s" },
  { name: "X", label: "X", color: "#E7E9EA", delay: "1.2s" },
  { name: "WA", label: "WhatsApp", color: "#25D366", delay: "1.6s" },
];

/** Binary rain + floating 3D social icons — hacker / yazılım görünümü */
export function CyberHeroStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const cols: { x: number; y: number; speed: number; chars: string }[] = [];
    const glyphs = "01アイウエオカキクケコサシスセソ01TOLWEX#$*";

    function resize() {
      const parent = canvas!.parentElement;
      w = parent?.clientWidth || window.innerWidth;
      h = parent?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols.length = 0;
      const colW = 16;
      const n = Math.ceil(w / colW);
      for (let i = 0; i < n; i++) {
        cols.push({
          x: i * colW,
          y: Math.random() * h,
          speed: 1.2 + Math.random() * 3.2,
          chars: Array.from({ length: 18 }, () => glyphs[(Math.random() * glyphs.length) | 0]).join(
            ""
          ),
        });
      }
    }

    function tick() {
      ctx!.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx!.fillRect(0, 0, w, h);
      ctx!.font = "13px ui-monospace, SFMono-Regular, Menlo, monospace";
      for (const c of cols) {
        for (let i = 0; i < c.chars.length; i++) {
          const ch = c.chars[i];
          const yy = c.y - i * 16;
          if (yy < -20 || yy > h + 20) continue;
          const head = i === 0;
          ctx!.fillStyle = head ? "rgba(180,255,210,0.95)" : `rgba(0,${180 - i * 6},90,${0.55 - i * 0.02})`;
          ctx!.fillText(ch, c.x, yy);
        }
        c.y += c.speed;
        if (c.y - c.chars.length * 16 > h) {
          c.y = -Math.random() * 80;
          c.speed = 1.2 + Math.random() * 3.2;
          if (Math.random() > 0.7) {
            c.chars = Array.from({ length: 18 }, () => glyphs[(Math.random() * glyphs.length) | 0]).join(
              ""
            );
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="cyber-stage" aria-hidden>
      <canvas ref={canvasRef} className="cyber-binary" />
      <div className="cyber-scanline" />
      <div className="cyber-icons-3d">
        {ICONS.map((icon) => (
          <div
            key={icon.label}
            className="cyber-icon-orb"
            style={
              {
                "--orb-color": icon.color,
                "--orb-delay": icon.delay,
              } as CSSProperties
            }
            title={icon.label}
          >
            <span className="cyber-icon-face">{icon.name}</span>
            <span className="cyber-icon-glow" />
          </div>
        ))}
      </div>
      <p className="cyber-ticker">
        <span>01010101 SYSTEM ONLINE · ACCOUNT FORENSICS · SOCIAL RECOVERY · 01010101</span>
        <span>01010101 SYSTEM ONLINE · ACCOUNT FORENSICS · SOCIAL RECOVERY · 01010101</span>
      </p>
    </div>
  );
}
