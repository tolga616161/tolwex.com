import * as THREE from "three";

export type SocialKind = "ig" | "fb" | "tt";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function plate(ctx: CanvasRenderingContext2D, size: number) {
  const s = size;
  const metal = ctx.createLinearGradient(0, 0, s, s);
  metal.addColorStop(0, "#f4f4f4");
  metal.addColorStop(0.4, "#d0d0d0");
  metal.addColorStop(1, "#8a8a8a");
  roundRect(ctx, s * 0.05, s * 0.05, s * 0.9, s * 0.9, s * 0.23);
  ctx.fillStyle = metal;
  ctx.fill();

  // Inner dark face
  roundRect(ctx, s * 0.09, s * 0.09, s * 0.82, s * 0.82, s * 0.19);
  const face = ctx.createLinearGradient(0, s * 0.08, 0, s * 0.92);
  face.addColorStop(0, "#222");
  face.addColorStop(1, "#050505");
  ctx.fillStyle = face;
  ctx.fill();

  // Subtle top highlight for emboss
  const hi = ctx.createLinearGradient(0, s * 0.09, 0, s * 0.35);
  hi.addColorStop(0, "rgba(255,255,255,0.12)");
  hi.addColorStop(1, "rgba(255,255,255,0)");
  roundRect(ctx, s * 0.09, s * 0.09, s * 0.82, s * 0.28, s * 0.19);
  ctx.fillStyle = hi;
  ctx.fill();
}

/** Instagram camera glyph — rounded square + lens + corner flash. */
function drawInstagram(ctx: CanvasRenderingContext2D, size: number) {
  const s = size;
  ctx.clearRect(0, 0, s, s);
  plate(ctx, s);

  const ink = "#f3f3f3";
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Outer camera body outline
  ctx.lineWidth = s * 0.052;
  roundRect(ctx, s * 0.23, s * 0.23, s * 0.54, s * 0.54, s * 0.155);
  ctx.stroke();

  // Lens
  ctx.lineWidth = s * 0.048;
  ctx.beginPath();
  ctx.arc(s * 0.5, s * 0.515, s * 0.15, 0, Math.PI * 2);
  ctx.stroke();

  // Inner lens detail
  ctx.lineWidth = s * 0.02;
  ctx.beginPath();
  ctx.arc(s * 0.5, s * 0.515, s * 0.065, 0, Math.PI * 2);
  ctx.stroke();

  // Flash / viewfinder (top-right) — key IG recognition cue
  ctx.beginPath();
  ctx.arc(s * 0.675, s * 0.325, s * 0.042, 0, Math.PI * 2);
  ctx.fill();
}

/** Facebook “f” mark — classic stem + crossbar + top curl. */
function drawFacebook(ctx: CanvasRenderingContext2D, size: number) {
  const s = size;
  ctx.clearRect(0, 0, s, s);
  plate(ctx, s);

  ctx.fillStyle = "#f4f4f4";

  // Vertical stem (slightly right of center, classic FB layout)
  ctx.beginPath();
  roundRect(ctx, s * 0.445, s * 0.3, s * 0.125, s * 0.48, s * 0.02);
  ctx.fill();

  // Top of f (hook)
  ctx.beginPath();
  ctx.moveTo(s * 0.445, s * 0.36);
  ctx.bezierCurveTo(s * 0.445, s * 0.2, s * 0.62, s * 0.175, s * 0.74, s * 0.215);
  ctx.lineTo(s * 0.74, s * 0.33);
  ctx.bezierCurveTo(s * 0.64, s * 0.295, s * 0.57, s * 0.31, s * 0.57, s * 0.39);
  ctx.lineTo(s * 0.445, s * 0.39);
  ctx.closePath();
  ctx.fill();

  // Crossbar
  ctx.beginPath();
  roundRect(ctx, s * 0.3, s * 0.455, s * 0.4, s * 0.105, s * 0.02);
  ctx.fill();
}

/** TikTok note — stem, flag, and note head (monochrome). */
function drawTikTok(ctx: CanvasRenderingContext2D, size: number) {
  const s = size;
  ctx.clearRect(0, 0, s, s);
  plate(ctx, s);

  // Ghost offset layer (mono stand-in for cyan/red dual outline)
  ctx.save();
  ctx.translate(s * 0.035, -s * 0.015);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  paintNote(ctx, s);
  ctx.restore();

  ctx.fillStyle = "#f5f5f5";
  paintNote(ctx, s);
}

function paintNote(ctx: CanvasRenderingContext2D, s: number) {
  // Stem
  ctx.beginPath();
  ctx.moveTo(s * 0.6, s * 0.2);
  ctx.lineTo(s * 0.6, s * 0.64);
  ctx.lineTo(s * 0.515, s * 0.64);
  ctx.lineTo(s * 0.515, s * 0.28);
  ctx.closePath();
  ctx.fill();

  // Flag / wing
  ctx.beginPath();
  ctx.moveTo(s * 0.515, s * 0.2);
  ctx.bezierCurveTo(s * 0.62, s * 0.15, s * 0.8, s * 0.2, s * 0.82, s * 0.38);
  ctx.bezierCurveTo(s * 0.74, s * 0.3, s * 0.64, s * 0.28, s * 0.6, s * 0.3);
  ctx.lineTo(s * 0.6, s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Note head
  ctx.beginPath();
  ctx.ellipse(s * 0.4, s * 0.68, s * 0.155, s * 0.125, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

const cache = new Map<SocialKind, THREE.CanvasTexture>();

export function getSocialLogoTexture(kind: SocialKind): THREE.CanvasTexture {
  const hit = cache.get(kind);
  if (hit) return hit;

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const empty = new THREE.CanvasTexture(canvas);
    cache.set(kind, empty);
    return empty;
  }

  if (kind === "ig") drawInstagram(ctx, size);
  else if (kind === "fb") drawFacebook(ctx, size);
  else drawTikTok(ctx, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cache.set(kind, tex);
  return tex;
}
