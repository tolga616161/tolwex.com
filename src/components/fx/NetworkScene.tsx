"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  getSocialLogoTexture,
  type SocialKind,
} from "@/components/fx/socialLogoTextures";

type Floater = {
  kind: SocialKind;
  pos: THREE.Vector3;
  rot: THREE.Euler;
  spin: THREE.Vector3;
  scale: number;
  opacity: number;
  drift: number;
  phase: number;
};

function MonoPlate({
  kind,
  scale = 1,
  opacity = 1,
}: {
  kind: SocialKind;
  scale?: number;
  opacity?: number;
}) {
  const tex = useMemo(() => getSocialLogoTexture(kind), [kind]);

  return (
    <group scale={scale}>
      <RoundedBox args={[1, 1, 0.12]} radius={0.16} smoothness={3}>
        <meshStandardMaterial
          color="#141414"
          metalness={0.7}
          roughness={0.35}
          transparent
          opacity={opacity}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial
          map={tex}
          transparent
          opacity={opacity}
          metalness={0.2}
          roughness={0.35}
          emissive="#ffffff"
          emissiveIntensity={0.08}
          emissiveMap={tex}
        />
      </mesh>
    </group>
  );
}

function seedFloaters(lite: boolean): Floater[] {
  const kinds: SocialKind[] = ["ig", "fb", "tt"];
  const n = lite ? 8 : 14;
  const out: Floater[] = [];

  for (let i = 0; i < n; i++) {
    const kind = kinds[i % 3];
    const z = -1.6 - (i % 4) * 1.35 - Math.random() * 1.2;
    const far = z < -5;
    out.push({
      kind,
      pos: new THREE.Vector3(
        (Math.random() > 0.4 ? 1 : -0.6) * (1.5 + Math.random() * 4.5),
        (Math.random() - 0.35) * 5.5,
        z
      ),
      rot: new THREE.Euler(
        (Math.random() - 0.5) * 0.55,
        (Math.random() - 0.5) * 1.1,
        (Math.random() - 0.5) * 0.35
      ),
      spin: new THREE.Vector3(0.02, 0.08 + Math.random() * 0.12, 0.01),
      scale: far ? 0.4 + Math.random() * 0.25 : 0.7 + Math.random() * 0.45,
      opacity: far ? 0.45 : 0.85,
      drift: 0.08 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
    });
  }

  (
    [
      ["ig", new THREE.Vector3(2.5, 1.4, -2.0), 1.35],
      ["fb", new THREE.Vector3(3.9, -0.2, -2.5), 1.15],
      ["tt", new THREE.Vector3(1.4, -1.5, -1.8), 1.1],
    ] as Array<[SocialKind, THREE.Vector3, number]>
  ).forEach(([kind, pos, scale], i) => {
    out.push({
      kind,
      pos,
      rot: new THREE.Euler(0.1 * (i - 1), 0.3 * (i - 1), -0.06 * i),
      spin: new THREE.Vector3(0.02, 0.1, 0.01),
      scale,
      opacity: 0.92,
      drift: 0.1,
      phase: i,
    });
  });

  return out;
}

function FloatingLogos({ lite }: { lite: boolean }) {
  const items = useMemo(() => seedFloaters(lite), [lite]);
  const refs = useRef<THREE.Group[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    items.forEach((f, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.position.set(
        f.pos.x + Math.sin(t * f.drift + f.phase) * 0.16,
        f.pos.y + Math.cos(t * f.drift * 0.8 + f.phase) * 0.12,
        f.pos.z
      );
      g.rotation.x = f.rot.x + t * f.spin.x;
      g.rotation.y = f.rot.y + t * f.spin.y;
      g.rotation.z = f.rot.z;
      g.scale.setScalar(f.scale);
    });
  });

  return (
    <group>
      {items.map((f, i) => (
        <group
          key={`${f.kind}-${i}`}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <MonoPlate kind={f.kind} opacity={f.opacity} />
        </group>
      ))}
    </group>
  );
}

function DigitalLattice({ lite }: { lite: boolean }) {
  const nodes = useMemo(() => {
    const n = lite ? 12 : 22;
    return Array.from(
      { length: n },
      () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 9,
          -2.5 - Math.random() * 7
        )
    );
  }, [lite]);

  const links = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 3.8) out.push([nodes[i], nodes[j]]);
      }
    }
    return out.slice(0, lite ? 16 : 32);
  }, [nodes, lite]);

  return (
    <group>
      {links.map((pts, i) => (
        <Line key={i} points={pts} color="#cfcfcf" transparent opacity={0.08} lineWidth={1} />
      ))}
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.016, 6, 6]} />
          <meshBasicMaterial color="#ddd" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function VisibilityGate({ children }: { children: React.ReactNode }) {
  const { invalidate, setFrameloop } = useThree();
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setFrameloop("never");
      else {
        setFrameloop("always");
        invalidate();
      }
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [invalidate, setFrameloop]);
  return <>{children}</>;
}

function SceneRig({ lite }: { lite: boolean }) {
  const root = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 0.12,
        y: (e.clientY / window.innerHeight - 0.5) * 0.08,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    if (!root.current) return;
    root.current.rotation.y += (target.current.x - root.current.rotation.y) * 0.03;
    root.current.rotation.x += (target.current.y - root.current.rotation.x) * 0.03;
  });

  return (
    <group ref={root}>
      <fog attach="fog" args={["#050505", 10, 20]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <DigitalLattice lite={lite} />
      <FloatingLogos lite={lite} />
    </group>
  );
}

export function NetworkScene({ className = "" }: { className?: string }) {
  const [lite, setLite] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 1100px)").matches;
    setLite(narrow || (navigator.hardwareConcurrency || 4) <= 4);
    setReady(true);
  }, []);

  if (!ready) return <div className={`network-scene ${className}`} aria-hidden />;

  return (
    <div className={`network-scene ${className}`} aria-hidden>
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 0.2, 8.6], fov: 40 }}
        gl={{
          antialias: !lite,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <VisibilityGate>
            <SceneRig lite={lite} />
          </VisibilityGate>
        </Suspense>
      </Canvas>
      <div className="network-vignette" />
    </div>
  );
}
