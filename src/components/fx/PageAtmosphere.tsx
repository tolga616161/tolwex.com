"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Component, useEffect, useState, type ReactNode } from "react";
import { StaticAtmosphere } from "@/components/fx/StaticAtmosphere";

const NetworkScene = dynamic(
  () => import("@/components/fx/NetworkScene").then((m) => m.NetworkScene),
  { ssr: false, loading: () => <StaticAtmosphere /> }
);

class AtmosphereSafe extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.failed) return <StaticAtmosphere />;
    return this.props.children;
  }
}

function shouldSkip3d(path: string) {
  if (path.startsWith("/admin61")) return true;
  // Member panel pages: keep UI snappy — no WebGL
  if (
    path.startsWith("/uye") &&
    !path.startsWith("/uye/giris") &&
    !path.startsWith("/uye/kayit")
  ) {
    return true;
  }
  return false;
}

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const dbg = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      const renderer = (gl as WebGLRenderingContext).getParameter(dbg.UNMASKED_RENDERER_WEBGL);
      if (typeof renderer === "string" && /swiftshader|llvmpipe|software/i.test(renderer)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** Fixed full-page atmosphere — 3D when safe, CSS fallback otherwise. */
export function PageAtmosphere() {
  const pathname = usePathname() || "/";
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");

  useEffect(() => {
    if (shouldSkip3d(pathname)) {
      setMode("static");
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    );
    if (reduce || saveData || !canUseWebGL()) {
      setMode("static");
      return;
    }
    // Mobile: static (lighter). Desktop: 3D.
    setMode(mobile ? "static" : "3d");
  }, [pathname]);

  if (shouldSkip3d(pathname)) return null;

  return (
    <div className="page-3d-atmosphere" aria-hidden>
      {mode === "3d" ? (
        <AtmosphereSafe onError={() => setMode("static")}>
          <NetworkScene />
        </AtmosphereSafe>
      ) : (
        <StaticAtmosphere />
      )}
    </div>
  );
}
