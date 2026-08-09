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
  // Bright metallic rim so icons pop on dark scenes
  const metal = ctx.createLinearGradient(0, 0, s, s);
  metal.addColorStop(0, "#ffffff");
  metal.addColorStop(0.35, "#e4e4e4");
  metal.addColorStop(1, "#9a9a9a");
  roundRect(ctx, s * 0.04, s * 0.04, s * 0.92, s * 0.92, s * 0.24);
  ctx.fillStyle = metal;
  ctx.fill();

  // Inner face — charcoal with enough contrast for white glyphs
  roundRect(ctx, s * 0.085, s * 0.085, s * 0.83, s * 0.83, s * 0.2);
  const face = ctx.createLinearGradient(0, s * 0.08, 0, s * 0.92);
  face.addColorStop(0, "#2c2c2c");
  face.addColorStop(1, "#0c0c0c");
  ctx.fillStyle = face;
  ctx.fill();

  const hi = ctx.createLinearGradient(0, s * 0.08, 0, s * 0.4);
  hi.addColorStop(0, "rgba(255,255,255,0.2)");
  hi.addColorStop(1, "rgba(255,255,255,0)");
  roundRect(ctx, s * 0.085, s * 0.085, s * 0.83, s * 0.3, s * 0.2);
  ctx.fillStyle = hi;
  ctx.fill();
}

/** Instagram camera glyph — rounded square + lens + corner flash. */
function drawInstagram(ctx: CanvasRenderingContext2D, size: number) {
  const s = size;
  ctx.clearRect(0, 0, s, s);
  plate(ctx, s);

  const ink = "#ffffff";
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(255,255,255,0.35)";
  ctx.shadowBlur = s * 0.02;

  // Outer camera body outline
  ctx.lineWidth = s * 0.06;
  roundRect(ctx, s * 0.22, s * 0.22, s * 0.56, s * 0.56, s * 0.16);
  ctx.stroke();

  // Lens
  ctx.lineWidth = s * 0.055;
  ctx.beginPath();
  ctx.arc(s * 0.5, s * 0.515, s * 0.155, 0, Math.PI * 2);
  ctx.stroke();

  // Inner lens detail
  ctx.shadowBlur = 0;
  ctx.lineWidth = s * 0.022;
  ctx.beginPath();
  ctx.arc(s * 0.5, s * 0.515, s * 0.07, 0, Math.PI * 2);
  ctx.stroke();

  // Flash / viewfinder (top-right) — key IG recognition cue
  ctx.beginPath();
  ctx.arc(s * 0.68, s * 0.32, s * 0.048, 0, Math.PI * 2);
  ctx.fill();
}

/** Facebook “f” mark — classic stem + crossbar + top curl. */
function drawFacebook(ctx: CanvasRenderingContext2D, size: number) {
  const s = size;
  ctx.clearRect(0, 0, s, s);
  plate(ctx, s);

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(255,255,255,0.3)";
  ctx.shadowBlur = s * 0.018;

  // Vertical stem (slightly right of center, classic FB layout)
  roundRect(ctx, s * 0.445, s * 0.3, s * 0.13, s * 0.5, s * 0.02);
  ctx.fill();

  // Top of f (hook)
  ctx.beginPath();
  ctx.moveTo(s * 0.445, s * 0.36);
  ctx.bezierCurveTo(s * 0.445, s * 0.195, s * 0.63, s * 0.17, s * 0.75, s * 0.21);
  ctx.lineTo(s * 0.75, s * 0.335);
  ctx.bezierCurveTo(s * 0.645, s * 0.295, s * 0.575, s * 0.31, s * 0.575, s * 0.395);
  ctx.lineTo(s * 0.445, s * 0.395);
  ctx.closePath();
  ctx.fill();

  // Crossbar
  roundRect(ctx, s * 0.29, s * 0.45, s * 0.42, s * 0.11, s * 0.02);
  ctx.fill();
  ctx.shadowBlur = 0;
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

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(255,255,255,0.3)";
  ctx.shadowBlur = s * 0.018;
  paintNote(ctx, s);
  ctx.shadowBlur = 0;
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
