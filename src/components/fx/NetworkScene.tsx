"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Kind = "lock" | "key" | "shield" | "ig" | "yt" | "fb" | "x" | "tt" | "user" | "node";

type OrbitItem = {
  kind: Kind;
  scale: number;
  radius: number;
  y: number;
  speed: number;
  phase: number;
  glow?: number;
};

/** Primary belt — lock + IG + FB + YT under the globe */
const UNDER_GLOBE: OrbitItem[] = [
  { kind: "lock", scale: 1.65, radius: 3.55, y: -2.05, speed: 0.28, phase: 0, glow: 1.55 },
  { kind: "ig", scale: 1.7, radius: 3.55, y: -2.05, speed: 0.28, phase: Math.PI / 2, glow: 1.6 },
  { kind: "fb", scale: 1.55, radius: 3.55, y: -2.05, speed: 0.28, phase: Math.PI, glow: 1.45 },
  { kind: "yt", scale: 1.6, radius: 3.55, y: -2.05, speed: 0.28, phase: (Math.PI * 3) / 2, glow: 1.5 },
];

/** Outer counter-orbit — more brand marks */
const OUTER_BELT: OrbitItem[] = [
  { kind: "ig", scale: 1.15, radius: 4.65, y: -2.85, speed: -0.16, phase: 0.3, glow: 1.2 },
  { kind: "lock", scale: 1.25, radius: 4.65, y: -2.85, speed: -0.16, phase: 1.35, glow: 1.3 },
  { kind: "yt", scale: 1.1, radius: 4.65, y: -2.85, speed: -0.16, phase: 2.4, glow: 1.15 },
  { kind: "fb", scale: 1.1, radius: 4.65, y: -2.85, speed: -0.16, phase: 3.45, glow: 1.15 },
  { kind: "x", scale: 1.05, radius: 4.65, y: -2.85, speed: -0.16, phase: 4.5, glow: 1.1 },
  { kind: "tt", scale: 1.05, radius: 4.65, y: -2.85, speed: -0.16, phase: 5.55, glow: 1.1 },
];

const INNER_NODES: OrbitItem[] = [
  { kind: "node", scale: 0.5, radius: 2.45, y: -1.15, speed: 0.42, phase: 0.2, glow: 1.5 },
  { kind: "node", scale: 0.42, radius: 2.45, y: -1.15, speed: 0.42, phase: 1.25, glow: 1.4 },
  { kind: "node", scale: 0.48, radius: 2.45, y: -1.15, speed: 0.42, phase: 2.3, glow: 1.4 },
  { kind: "node", scale: 0.4, radius: 2.45, y: -1.15, speed: 0.42, phase: 3.35, glow: 1.3 },
  { kind: "node", scale: 0.46, radius: 2.45, y: -1.15, speed: 0.42, phase: 4.4, glow: 1.4 },
  { kind: "shield", scale: 0.85, radius: 2.45, y: -1.15, speed: 0.42, phase: 5.45, glow: 1.25 },
];

function GlowMat({
  color = "#f4f1ea",
  emissiveIntensity = 0.5,
  metalness = 0.9,
  roughness = 0.16,
  opacity = 0.98,
}: {
  color?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive="#ffffff"
      emissiveIntensity={emissiveIntensity}
      metalness={metalness}
      roughness={roughness}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

function DarkMat() {
  return (
    <meshStandardMaterial
      color="#1a1a1a"
      metalness={0.45}
      roughness={0.4}
      emissive="#2a2a2a"
      emissiveIntensity={0.12}
    />
  );
}

function IconMesh({ kind, scale, glow = 1 }: { kind: Kind; scale: number; glow?: number }) {
  const s = scale;
  const ei = 0.48 * glow;
  switch (kind) {
    case "lock":
      return (
        <group scale={s}>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.62, 0.5, 0.34]} />
            <GlowMat color="#f7f4ee" emissiveIntensity={ei} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <torusGeometry args={[0.22, 0.06, 14, 32, Math.PI]} />
            <GlowMat color="#e8e4dc" emissiveIntensity={ei * 0.9} metalness={0.95} />
          </mesh>
          <mesh position={[0, -0.06, 0.2]}>
            <cylinderGeometry args={[0.055, 0.055, 0.1, 14]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "key":
      return (
        <group scale={s} rotation={[0.2, 0.5, -0.6]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 1.0, 16]} />
            <GlowMat color="#f0ebe3" emissiveIntensity={ei} metalness={0.95} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <torusGeometry args={[0.18, 0.055, 14, 28]} />
            <GlowMat color="#fffaf2" emissiveIntensity={ei * 1.1} />
          </mesh>
          <mesh position={[0.16, -0.24, 0]}>
            <boxGeometry args={[0.22, 0.06, 0.06]} />
            <GlowMat color="#ddd6cb" emissiveIntensity={ei * 0.8} />
          </mesh>
        </group>
      );
    case "shield":
      return (
        <group scale={s}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.48, 0.66, 6]} />
            <GlowMat color="#f5f2ec" emissiveIntensity={ei} />
          </mesh>
          <mesh position={[0, 0.04, 0.14]}>
            <boxGeometry args={[0.09, 0.24, 0.05]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "ig":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.72, 0.72, 0.22]} />
            <GlowMat color="#fffdf8" emissiveIntensity={ei * 1.25} />
          </mesh>
          <mesh position={[0, 0, 0.14]}>
            <torusGeometry args={[0.19, 0.05, 14, 32]} />
            <DarkMat />
          </mesh>
          <mesh position={[0.23, 0.23, 0.14]}>
            <sphereGeometry args={[0.05, 14, 14]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "yt":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.9, 0.58, 0.2]} />
            <GlowMat color="#f8f5ef" emissiveIntensity={ei} />
          </mesh>
          <mesh position={[0.05, 0, 0.14]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.15, 0.26, 3]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "fb":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.58, 0.66, 0.2]} />
            <GlowMat color="#f7f3ec" emissiveIntensity={ei * 1.1} />
          </mesh>
          <mesh position={[0.02, -0.02, 0.13]}>
            <boxGeometry args={[0.11, 0.36, 0.05]} />
            <DarkMat />
          </mesh>
          <mesh position={[0.1, 0.08, 0.13]}>
            <boxGeometry args={[0.18, 0.09, 0.05]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "x":
      return (
        <group scale={s}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.82, 0.13, 0.13]} />
            <GlowMat color="#fffaf3" emissiveIntensity={ei * 1.15} metalness={0.92} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.82, 0.13, 0.13]} />
            <GlowMat color="#ebe6de" emissiveIntensity={ei} metalness={0.92} />
          </mesh>
        </group>
      );
    case "tt":
      return (
        <group scale={s} rotation={[0.3, 0.6, 0.15]}>
          <mesh>
            <capsuleGeometry args={[0.13, 0.48, 8, 16]} />
            <GlowMat color="#f6f2ea" emissiveIntensity={ei} />
          </mesh>
          <mesh position={[0.18, 0.26, 0]} rotation={[0, 0, -0.65]}>
            <capsuleGeometry args={[0.08, 0.26, 8, 14]} />
            <GlowMat color="#ddd6cb" emissiveIntensity={ei * 0.85} />
          </mesh>
        </group>
      );
    case "user":
      return (
        <group scale={s}>
          <mesh position={[0, 0.24, 0]}>
            <sphereGeometry args={[0.22, 24, 24]} />
            <GlowMat color="#f8f4ed" emissiveIntensity={ei} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.34, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <GlowMat color="#e7e1d7" emissiveIntensity={ei * 0.85} />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh scale={s}>
          <icosahedronGeometry args={[0.22, 0]} />
          <GlowMat color="#ffffff" emissiveIntensity={ei * 1.5} metalness={0.98} roughness={0.1} />
        </mesh>
      );
  }
}

function WorldGlobe({ reduce }: { reduce: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * (reduce ? 0.07 : 0.11);
    ref.current.rotation.x = Math.sin(performance.now() * 0.00018) * 0.1;
  });

  const segs = reduce ? 28 : 48;

  return (
    <group ref={ref} position={[0, 1.05, -1.4]}>
      {/* solid core */}
      <mesh>
        <sphereGeometry args={[1.48, 24, 24]} />
        <meshStandardMaterial
          color="#0c0c0c"
          metalness={0.9}
          roughness={0.35}
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* wireframe shell */}
      <mesh>
        <sphereGeometry args={[1.58, segs, segs]} />
        <meshStandardMaterial
          color="#d8d0c4"
          metalness={0.75}
          roughness={0.3}
          transparent
          opacity={0.55}
          wireframe
          emissive="#ffffff"
          emissiveIntensity={0.14}
        />
      </mesh>
      {/* latitude rings */}
      {[0.35, -0.35, 0.85, -0.85].map((tilt, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + tilt * 0.55, 0.15 * i, 0.08 * i]}>
          <torusGeometry args={[1.62 + i * 0.02, 0.01, 8, 72]} />
          <meshStandardMaterial
            color="#f0ebe3"
            emissive="#ffffff"
            emissiveIntensity={0.45}
            transparent
            opacity={0.55}
          />
        </mesh>
      ))}
      {/* equator highlight */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.68, 0.018, 10, 80]} />
        <meshStandardMaterial
          color="#fffaf2"
          emissive="#ffffff"
          emissiveIntensity={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>
      <pointLight intensity={0.7} distance={7} color="#fff8ee" position={[0, -0.6, 1.2]} />
      <pointLight intensity={0.35} distance={5} color="#e8e0d4" position={[1.2, 0.8, -0.5]} />
    </group>
  );
}

function OrbitBelt({
  items,
  reduce,
  ringRadius,
  ringY,
  tip = -0.72,
}: {
  items: OrbitItem[];
  reduce: boolean;
  ringRadius: number;
  ringY: number;
  tip?: number;
}) {
  const belt = useRef<THREE.Group>(null);
  const look = useMemo(() => new THREE.Vector3(), []);
  const list = useMemo(
    () => (reduce && items.length > 4 ? items.filter((_, i) => i % 2 === 0) : items),
    [items, reduce]
  );

  useFrame(({ clock, camera }) => {
    if (!belt.current) return;
    const t = clock.getElapsedTime();
    belt.current.rotation.x = tip + Math.sin(t * 0.12) * 0.04;
    belt.current.rotation.z = Math.sin(t * 0.09) * 0.06;

    belt.current.children.forEach((child) => {
      const item = child.userData?.item as OrbitItem | undefined;
      if (!item) return;
      const a = t * item.speed + item.phase;
      const x = Math.cos(a) * item.radius;
      const z = Math.sin(a) * item.radius;
      child.position.set(x, item.y, z);
      look.copy(camera.position);
      child.lookAt(look);
      child.rotateY(Math.PI);
    });
  });

  return (
    <group ref={belt} position={[0, 0.35, -1.35]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ringY, 0]}>
        <torusGeometry args={[ringRadius, 0.014, 8, 96]} />
        <meshStandardMaterial
          color="#cfc6b8"
          transparent
          opacity={0.38}
          emissive="#ffffff"
          emissiveIntensity={0.28}
        />
      </mesh>
      {list.map((item, i) => (
        <group key={`${item.kind}-${i}`} userData={{ item }}>
          <Float speed={1.2} floatIntensity={0.2} rotationIntensity={0.15}>
            <group>
              <IconMesh kind={item.kind} scale={item.scale} glow={item.glow ?? 1} />
              <pointLight
                intensity={0.45 * (item.glow ?? 1)}
                distance={3.2}
                color="#fff8ee"
              />
            </group>
          </Float>
        </group>
      ))}
    </group>
  );
}

function NetworkSparks({ reduce }: { reduce: boolean }) {
  const points = useMemo(() => {
    const a: THREE.Vector3[][] = [];
    const n = reduce ? 6 : 10;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      a.push([
        new THREE.Vector3(Math.cos(ang) * 1.55, 0.95, Math.sin(ang) * 1.55 - 1.4),
        new THREE.Vector3(Math.cos(ang) * 3.4, -1.9, Math.sin(ang) * 3.4 - 1.35),
      ]);
    }
    return a;
  }, [reduce]);

  const dots = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    dots.current.forEach((m, i) => {
      if (!m) return;
      const pair = points[i % points.length];
      const p = (t * 0.28 + i * 0.08) % 1;
      m.position.lerpVectors(pair[0], pair[1], p);
    });
  });

  return (
    <>
      {points.map((pts, i) => (
        <Line key={i} points={pts} color="#cfc8bc" lineWidth={1} transparent opacity={0.32} />
      ))}
      {points.map((_, i) => (
        <mesh
          key={`d-${i}`}
          ref={(el) => {
            if (el) dots.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#fffaf2" emissive="#fff" emissiveIntensity={1.35} />
        </mesh>
      ))}
    </>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = -1 - Math.random() * 8;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f2ebe0" size={0.035} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function SceneRig({ reduce }: { reduce: boolean }) {
  const root = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const scrollY = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 0.28,
        y: (e.clientY / window.innerHeight - 0.5) * 0.14,
      };
    };
    const onScroll = () => {
      scrollY.current = window.scrollY;
    };
    onScroll();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame(() => {
    if (!root.current) return;
    root.current.rotation.y += (target.current.x - root.current.rotation.y) * 0.045;
    root.current.rotation.x += (target.current.y - root.current.rotation.x) * 0.045;
    const ty = Math.min(scrollY.current * 0.0015, 1.8);
    root.current.position.y += (ty - root.current.position.y) * 0.05;
  });

  return (
    <group ref={root}>
      <ambientLight intensity={0.55} color="#fff8f0" />
      <directionalLight position={[5, 7, 4]} intensity={1.55} color="#ffffff" />
      <directionalLight position={[-4, -2, 3]} intensity={0.55} color="#f0e6d8" />
      <pointLight position={[0, -2.2, 3.5]} intensity={1.05} color="#fffaf2" distance={16} />

      <Particles count={reduce ? 36 : 120} />
      <WorldGlobe reduce={reduce} />
      {/* logos spin under the world */}
      <OrbitBelt items={UNDER_GLOBE} reduce={false} ringRadius={3.55} ringY={-2.05} tip={-0.78} />
      <OrbitBelt items={OUTER_BELT} reduce={reduce} ringRadius={4.65} ringY={-2.85} tip={-0.68} />
      {!reduce ? (
        <OrbitBelt items={INNER_NODES} reduce={reduce} ringRadius={2.45} ringY={-1.15} tip={-0.62} />
      ) : null}
      <NetworkSparks reduce={reduce} />
    </group>
  );
}

export function NetworkScene({ className = "" }: { className?: string }) {
  const [reduce, setReduce] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px), (prefers-reduced-motion: reduce)");
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    setReady(true);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!ready) return <div className={`network-scene ${className}`} aria-hidden />;

  return (
    <div className={`network-scene ${className}`} aria-hidden>
      <Canvas
        dpr={reduce ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 2.4, 9.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <SceneRig reduce={reduce} />
        </Suspense>
      </Canvas>
      <div className="network-vignette" />
    </div>
  );
}
