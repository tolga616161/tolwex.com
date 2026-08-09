/** Lightweight CSS fallback when WebGL is unavailable or too heavy. */
export function StaticAtmosphere() {
  return (
    <div className="static-atmosphere" aria-hidden>
      <div className="static-atmosphere-glow" />
      <div className="static-logo static-logo-ig" />
      <div className="static-logo static-logo-fb" />
      <div className="static-logo static-logo-tt" />
      <div className="static-logo static-logo-ig far" />
      <div className="static-logo static-logo-fb far" />
      <div className="static-logo static-logo-tt far" />
      <div className="static-atmosphere-vignette" />
    </div>
  );
}
