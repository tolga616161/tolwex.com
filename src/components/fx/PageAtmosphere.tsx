"use client";

import dynamic from "next/dynamic";

const NetworkScene = dynamic(
  () => import("@/components/fx/NetworkScene").then((m) => m.NetworkScene),
  { ssr: false }
);

/** Fixed full-page 3D layer — hero through footer. */
export function PageAtmosphere() {
  return (
    <div className="page-3d-atmosphere" aria-hidden>
      <NetworkScene />
    </div>
  );
}
