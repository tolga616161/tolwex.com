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

/** Icons orbiting under / around a globe — always visible in hero. */
const ORBIT_A: OrbitItem[] = [
  { kind: "ig", scale: 1.35, radius: 3.4, y: -1.35, speed: 0.22, phase: 0, glow: 1.35 },
  { kind: "fb", scale: 1.2, radius: 3.4, y: -1.35, speed: 0.22, phase: 1.05, glow: 1.2 },
  { kind: "yt", scale: 1.25, radius: 3.4, y: -1.35, speed: 0.22, phase: 2.1, glow: 1.2 },
  { kind: "x", scale: 1.15, radius: 3.4, y: -1.35, speed: 0.22, phase: 3.15, glow: 1.15 },
  { kind: "tt", scale: 1.15, radius: 3.4, y: -1.35, speed: 0.22, phase: 4.2, glow: 1.15 },
  { kind: "lock", scale: 1.4, radius: 3.4, y: -1.35, speed: 0.22, phase: 5.25, glow: 1.3 },
];

const ORBIT_B: OrbitItem[] = [
  { kind: "key", scale: 1.1, radius: 4.3, y: -2.15, speed: -0.14, phase: 0.4, glow: 1.1 },
  { kind: "shield", scale: 1.15, radius: 4.3, y: -2.15, speed: -0.14, phase: 1.45, glow: 1.15 },
  { kind: "ig", scale: 1.0, radius: 4.3, y: -2.15, speed: -0.14, phase: 2.5, glow: 1.1 },
  { kind: "yt", scale: 1.05, radius: 4.3, y: -2.15, speed: -0.14, phase: 3.55, glow: 1.05 },
  { kind: "fb", scale: 1.0, radius: 4.3, y: -2.15, speed: -0.14, phase: 4.6, glow: 1.05 },
  { kind: "lock", scale: 1.15, radius: 4.3, y: -2.15, speed: -0.14, phase: 5.65, glow: 1.2 },
];

const ORBIT_C: OrbitItem[] = [
  { kind: "node", scale: 0.55, radius: 2.55, y: -0.55, speed: 0.35, phase: 0.2, glow: 1.5 },
  { kind: "node", scale: 0.45, radius: 2.55, y: -0.55, speed: 0.35, phase: 1.25, glow: 1.4 },
  { kind: "node", scale: 0.5, radius: 2.55, y: -0.55, speed: 0.35, phase: 2.3, glow: 1.4 },
  { kind: "node", scale: 0.4, radius: 2.55, y: -0.55, speed: 0.35, phase: 3.35, glow: 1.3 },
  { kind: "node", scale: 0.48, radius: 2.55, y: -0.55, speed: 0.35, phase: 4.4, glow: 1.4 },
  { kind: "node", scale: 0.42, radius: 2.55, y: -0.55, speed: 0.35, phase: 5.45, glow: 1.3 },
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
  const ei = 0.42 * glow;
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
            <GlowMat color="#fffdf8" emissiveIntensity={ei * 1.2} />
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
    ref.current.rotation.y += dt * (reduce ? 0.08 : 0.12);
    ref.current.rotation.x = Math.sin(performance.now() * 0.0002) * 0.08;
  });

  return (
    <group ref={ref} position={[0, 0.55, -1.8]}>
      <mesh>
        <sphereGeometry args={[1.65, reduce ? 24 : 40, reduce ? 24 : 40]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.7}
          roughness={0.35}
          transparent
          opacity={0.35}
          wireframe
          emissive="#ffffff"
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.55, 20, 20]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.85}
          roughness={0.4}
          transparent
          opacity={0.45}
        />
      </mesh>
      {/* equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.72, 0.012, 8, 64]} />
        <meshStandardMaterial
          color="#f2ebe0"
          emissive="#ffffff"
          emissiveIntensity={0.55}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.6, 0.4, 0.2]}>
        <torusGeometry args={[1.78, 0.008, 8, 64]} />
        <meshStandardMaterial
          color="#cfc8bc"
          emissive="#ddd"
          emissiveIntensity={0.35}
          transparent
          opacity={0.45}
        />
      </mesh>
      <pointLight intensity={0.55} distance={6} color="#fff8ee" position={[0, -0.4, 1]} />
    </group>
  );
}

function OrbitBelt({
  items,
  reduce,
  ringRadius,
  ringY,
}: {
  items: OrbitItem[];
  reduce: boolean;
  ringRadius: number;
  ringY: number;
}) {
  const belt = useRef<THREE.Group>(null);
  const dirs = useMemo(() => items.map(() => new THREE.Vector3()), [items]);

  useFrame(({ clock }) => {
    if (!belt.current) return;
    const t = clock.getElapsedTime();
    // whole belt slowly tips like orbiting under a planet
    belt.current.rotation.x = -0.55 + Math.sin(t * 0.15) * 0.05;
    belt.current.rotation.z = Math.sin(t * 0.1) * 0.08;

    belt.current.children.forEach((child, i) => {
      const item = items[i];
      if (!item) return;
      const a = t * item.speed + item.phase;
      const x = Math.cos(a) * item.radius;
      const z = Math.sin(a) * item.radius;
      child.position.set(x, item.y, z);
      // face outward from center
      dirs[i].set(x, 0, z).normalize();
      child.lookAt(dirs[i].x * 10, item.y, dirs[i].z * 10);
      child.rotation.z += 0.01;
    });
  });

  const list = reduce ? items.filter((_, i) => i % 2 === 0) : items;

  return (
    <group ref={belt} position={[0, 0.2, -1.6]}>
      {/* faint orbit path */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ringY, 0]}>
        <torusGeometry args={[ringRadius, 0.01, 8, 80]} />
        <meshStandardMaterial
          color="#bdb6aa"
          transparent
          opacity={0.28}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
      {list.map((item, i) => (
        <group key={`${item.kind}-${i}`}>
          <Float speed={1.1} floatIntensity={0.25} rotationIntensity={0.35}>
            <group>
              <IconMesh kind={item.kind} scale={item.scale} glow={item.glow ?? 1} />
              <pointLight
                intensity={0.35 * (item.glow ?? 1)}
                distance={2.8}
                color="#fff8ee"
              />
            </group>
          </Float>
        </group>
      ))}
    </group>
  );
}

function AmbientDrift({ reduce }: { reduce: boolean }) {
  const items = useMemo(
    () =>
      (
        [
          ["ig", 1.0, -4.2, 1.8, -3.2],
          ["lock", 1.1, 4.0, 1.2, -2.8],
          ["yt", 0.95, -3.6, -0.4, -4.0],
          ["fb", 0.9, 3.8, -0.8, -3.6],
          ["x", 0.85, 0.2, 2.4, -4.5],
          ["key", 0.9, -1.5, -2.2, -3.2],
        ] as Array<[Kind, number, number, number, number]>
      ).filter((_, i) => !reduce || i % 2 === 0),
    [reduce]
  );

  return (
    <>
      {items.map(([kind, scale, x, y, z], i) => (
        <Float
          key={i}
          speed={0.8 + i * 0.1}
          floatIntensity={0.55}
          rotationIntensity={0.5}
        >
          <group position={[x, y, z]}>
            <IconMesh kind={kind} scale={scale} glow={0.95} />
          </group>
        </Float>
      ))}
    </>
  );
}

function NetworkSparks({ reduce }: { reduce: boolean }) {
  const points = useMemo(() => {
    const a: THREE.Vector3[][] = [];
    const n = reduce ? 6 : 12;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      a.push([
        new THREE.Vector3(Math.cos(ang) * 1.7, 0.4, Math.sin(ang) * 1.7 - 1.8),
        new THREE.Vector3(Math.cos(ang) * 3.3, -1.2, Math.sin(ang) * 3.3 - 1.6),
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
      const p = (t * 0.25 + i * 0.08) % 1;
      m.position.lerpVectors(pair[0], pair[1], p);
    });
  });

  return (
    <>
      {points.map((pts, i) => (
        <Line key={i} points={pts} color="#cfc8bc" lineWidth={1} transparent opacity={0.35} />
      ))}
      {points.map((_, i) => (
        <mesh
          key={`d-${i}`}
          ref={(el) => {
            if (el) dots.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#fffaf2" emissive="#fff" emissiveIntensity={1.3} />
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
    ref.current.rotation.y += dt * 0.025;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f2ebe0" size={0.035} transparent opacity={0.55} sizeAttenuation />
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
        x: (e.clientX / window.innerWidth - 0.5) * 0.32,
        y: (e.clientY / window.innerHeight - 0.5) * 0.18,
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
    root.current.rotation.y += (target.current.x - root.current.rotation.y) * 0.04;
    root.current.rotation.x += (target.current.y - root.current.rotation.x) * 0.04;
    // gentle rise as page scrolls — globe system stays in view longer
    const ty = Math.min(scrollY.current * 0.0018, 2.2);
    root.current.position.y += (ty - root.current.position.y) * 0.06;
  });

  return (
    <group ref={root}>
      <ambientLight intensity={0.6} color="#fff8f0" />
      <directionalLight position={[5, 6, 4]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-4, -3, 2]} intensity={0.5} color="#f0e6d8" />
      <pointLight position={[0, -1.5, 3]} intensity={0.85} color="#fffaf2" distance={14} />

      <Particles count={reduce ? 40 : 130} />
      <WorldGlobe reduce={reduce} />
      <OrbitBelt items={ORBIT_A} reduce={reduce} ringRadius={3.4} ringY={-1.35} />
      <OrbitBelt items={ORBIT_B} reduce={reduce} ringRadius={4.3} ringY={-2.15} />
      {!reduce ? <OrbitBelt items={ORBIT_C} reduce={reduce} ringRadius={2.55} ringY={-0.55} /> : null}
      <NetworkSparks reduce={reduce} />
      <AmbientDrift reduce={reduce} />
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
        camera={{ position: [0, 1.2, 8.2], fov: 40 }}
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
