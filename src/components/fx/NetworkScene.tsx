"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Kind =
  | "ig"
  | "yt"
  | "fb"
  | "tt"
  | "x"
  | "wa"
  | "google"
  | "lock"
  | "key"
  | "shield"
  | "user"
  | "analytics"
  | "cloud"
  | "node";

type Body = {
  kind: Kind;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  scale: number;
  baseScale: number;
  spin: number;
  depth: number;
};

const BRAND: Record<Kind, string> = {
  ig: "#E1306C",
  yt: "#FF0000",
  fb: "#1877F2",
  tt: "#69C9D0",
  x: "#E7E9EA",
  wa: "#25D366",
  google: "#4285F4",
  lock: "#F2EDE4",
  key: "#D4AF37",
  shield: "#C0C7D1",
  user: "#F5F5F5",
  analytics: "#A8B0BC",
  cloud: "#8E99A4",
  node: "#FFFFFF",
};

function BrandMat({ kind, intensity = 0.55 }: { kind: Kind; intensity?: number }) {
  const color = BRAND[kind];
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      metalness={0.72}
      roughness={0.22}
    />
  );
}

function DarkMat() {
  return (
    <meshStandardMaterial color="#111" metalness={0.5} roughness={0.35} emissive="#222" emissiveIntensity={0.1} />
  );
}

function IconMesh({ kind, scale }: { kind: Kind; scale: number }) {
  const s = scale;
  switch (kind) {
    case "ig":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.72, 0.72, 0.2]} />
            <BrandMat kind="ig" intensity={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <torusGeometry args={[0.18, 0.05, 12, 28]} />
            <DarkMat />
          </mesh>
          <mesh position={[0.22, 0.22, 0.12]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "yt":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.92, 0.58, 0.18]} />
            <BrandMat kind="yt" intensity={0.65} />
          </mesh>
          <mesh position={[0.04, 0, 0.12]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.14, 0.24, 3]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </group>
      );
    case "fb":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.58, 0.66, 0.18]} />
            <BrandMat kind="fb" intensity={0.6} />
          </mesh>
          <mesh position={[0.02, -0.02, 0.12]}>
            <boxGeometry args={[0.1, 0.34, 0.04]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0.1, 0.08, 0.12]}>
            <boxGeometry args={[0.16, 0.08, 0.04]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </group>
      );
    case "tt":
      return (
        <group scale={s} rotation={[0.2, 0.5, 0.1]}>
          <mesh>
            <capsuleGeometry args={[0.12, 0.46, 8, 14]} />
            <BrandMat kind="tt" intensity={0.55} />
          </mesh>
          <mesh position={[0.16, 0.24, 0]} rotation={[0, 0, -0.6]}>
            <capsuleGeometry args={[0.08, 0.24, 8, 12]} />
            <meshStandardMaterial color="#EE1D52" emissive="#EE1D52" emissiveIntensity={0.4} metalness={0.7} />
          </mesh>
        </group>
      );
    case "x":
      return (
        <group scale={s}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.8, 0.12, 0.12]} />
            <BrandMat kind="x" intensity={0.5} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.8, 0.12, 0.12]} />
            <BrandMat kind="x" intensity={0.45} />
          </mesh>
        </group>
      );
    case "wa":
      return (
        <group scale={s}>
          <mesh>
            <sphereGeometry args={[0.36, 24, 24]} />
            <BrandMat kind="wa" intensity={0.55} />
          </mesh>
          <mesh position={[0.22, -0.26, 0]} rotation={[0.4, 0, 0.6]}>
            <coneGeometry args={[0.12, 0.22, 8]} />
            <BrandMat kind="wa" intensity={0.45} />
          </mesh>
        </group>
      );
    case "google":
      return (
        <group scale={s}>
          <mesh>
            <torusGeometry args={[0.28, 0.08, 12, 32, Math.PI * 1.5]} />
            <BrandMat kind="google" intensity={0.5} />
          </mesh>
          <mesh position={[0.28, 0, 0]}>
            <boxGeometry args={[0.22, 0.08, 0.08]} />
            <meshStandardMaterial color="#34A853" emissive="#34A853" emissiveIntensity={0.4} />
          </mesh>
        </group>
      );
    case "lock":
      return (
        <group scale={s}>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.58, 0.46, 0.3]} />
            <BrandMat kind="lock" intensity={0.45} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <torusGeometry args={[0.2, 0.055, 12, 28, Math.PI]} />
            <BrandMat kind="lock" intensity={0.4} />
          </mesh>
        </group>
      );
    case "key":
      return (
        <group scale={s} rotation={[0.2, 0.4, -0.5]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.9, 12]} />
            <BrandMat kind="key" intensity={0.55} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <torusGeometry args={[0.16, 0.05, 12, 24]} />
            <BrandMat kind="key" intensity={0.5} />
          </mesh>
        </group>
      );
    case "shield":
      return (
        <group scale={s}>
          <mesh>
            <cylinderGeometry args={[0.36, 0.44, 0.6, 6]} />
            <BrandMat kind="shield" intensity={0.4} />
          </mesh>
        </group>
      );
    case "user":
      return (
        <group scale={s}>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.2, 20, 20]} />
            <BrandMat kind="user" intensity={0.4} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <sphereGeometry args={[0.3, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <BrandMat kind="user" intensity={0.35} />
          </mesh>
        </group>
      );
    case "analytics":
      return (
        <group scale={s}>
          <mesh position={[-0.22, -0.05, 0]}>
            <boxGeometry args={[0.14, 0.35, 0.14]} />
            <BrandMat kind="analytics" />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.14, 0.55, 0.14]} />
            <BrandMat kind="analytics" intensity={0.5} />
          </mesh>
          <mesh position={[0.22, 0.18, 0]}>
            <boxGeometry args={[0.14, 0.72, 0.14]} />
            <BrandMat kind="analytics" intensity={0.55} />
          </mesh>
        </group>
      );
    case "cloud":
      return (
        <group scale={s}>
          <mesh position={[-0.18, 0, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <BrandMat kind="cloud" intensity={0.35} />
          </mesh>
          <mesh position={[0.16, 0.05, 0]}>
            <sphereGeometry args={[0.26, 16, 16]} />
            <BrandMat kind="cloud" intensity={0.4} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[0.55, 0.22, 0.28]} />
            <BrandMat kind="cloud" intensity={0.3} />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh scale={s}>
          <icosahedronGeometry args={[0.18, 0]} />
          <BrandMat kind="node" intensity={0.8} />
        </mesh>
      );
  }
}

function seedBodies(reduce: boolean): Body[] {
  const kinds: Kind[] = [
    "ig",
    "ig",
    "ig",
    "yt",
    "fb",
    "tt",
    "x",
    "wa",
    "google",
    "lock",
    "key",
    "shield",
    "user",
    "analytics",
    "cloud",
    "ig",
    "yt",
    "fb",
  ];
  const list = reduce ? kinds.filter((_, i) => i % 2 === 0).slice(0, 10) : kinds;
  const dirs = [
    [0, 1, 0],
    [0, -1, 0],
    [1, 0, 0],
    [-1, 0, 0],
    [0.7, 0.7, 0],
    [-0.7, 0.5, 0.2],
  ];

  return list.map((kind, i) => {
    const dir = dirs[i % dirs.length];
    const speed = 0.35 + (i % 5) * 0.12;
    const depth = -1.2 - (i % 6) * 0.55;
    const baseScale = kind === "ig" ? 1.15 + (i % 3) * 0.15 : 0.75 + (i % 4) * 0.12;
    const startFar = kind === "ig" && i % 3 === 0;
    return {
      kind,
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 7,
        startFar ? depth - 4 : depth + (Math.random() - 0.5) * 1.5
      ),
      vel: new THREE.Vector3(dir[0] * speed, dir[1] * speed, (startFar ? 1.1 : (Math.random() - 0.5) * 0.35) * speed),
      scale: startFar ? baseScale * 0.35 : baseScale,
      baseScale,
      spin: (Math.random() - 0.5) * 1.2,
      depth,
    };
  });
}

function TrafficField({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const bodies = useRef<Body[]>([]);
  const meshes = useRef<THREE.Group[]>([]);
  const zone = useRef(0);

  useMemo(() => {
    bodies.current = seedBodies(reduce);
  }, [reduce]);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      zone.current = window.scrollY / max;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((_, dt) => {
    const clamped = Math.min(dt, 0.033);
    const z = zone.current;
    // soft theme shift by scroll: 0 hero network, mid analytics, late security bias via opacity handled in parent lights
    const bounds = { x: 7.5, y: 5.2, zNear: -0.4, zFar: -7.5 };

    for (let i = 0; i < bodies.current.length; i++) {
      const b = bodies.current[i];
      b.pos.addScaledVector(b.vel, clamped);

      // approach / recede scaling for IG traffic feel
      if (b.kind === "ig") {
        const approach = THREE.MathUtils.clamp((-b.pos.z - 1) / 6, 0, 1);
        b.scale = THREE.MathUtils.lerp(b.baseScale * 0.4, b.baseScale * 1.35, 1 - approach);
      } else {
        b.scale = b.baseScale * (0.85 + 0.15 * Math.sin(performance.now() * 0.001 + i));
      }

      // wrap / recycle
      if (b.pos.x > bounds.x) b.pos.x = -bounds.x;
      if (b.pos.x < -bounds.x) b.pos.x = bounds.x;
      if (b.pos.y > bounds.y) b.pos.y = -bounds.y;
      if (b.pos.y < -bounds.y) b.pos.y = bounds.y;
      if (b.pos.z > bounds.zNear) {
        b.pos.z = bounds.zFar;
        b.scale = b.baseScale * 0.35;
      }
      if (b.pos.z < bounds.zFar) {
        b.pos.z = bounds.zNear - 0.2;
      }

      // scroll influences vertical drift
      b.vel.y += (z - 0.5) * 0.002;
      b.vel.y = THREE.MathUtils.clamp(b.vel.y, -1.6, 1.6);
      b.vel.x = THREE.MathUtils.clamp(b.vel.x, -1.8, 1.8);
    }

    // soft collisions
    for (let i = 0; i < bodies.current.length; i++) {
      for (let j = i + 1; j < bodies.current.length; j++) {
        const a = bodies.current[i];
        const b = bodies.current[j];
        const dx = a.pos.x - b.pos.x;
        const dy = a.pos.y - b.pos.y;
        const dz = a.pos.z - b.pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const min = 0.85 * ((a.scale + b.scale) * 0.55);
        if (dist > 0.001 && dist < min) {
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;
          const push = (min - dist) * 0.5;
          a.pos.x += nx * push;
          a.pos.y += ny * push;
          a.pos.z += nz * push * 0.35;
          b.pos.x -= nx * push;
          b.pos.y -= ny * push;
          b.pos.z -= nz * push * 0.35;
          // bounce / redirect
          const avx = a.vel.x;
          const avy = a.vel.y;
          a.vel.x = a.vel.x * 0.35 + b.vel.x * 0.65 + nx * 0.25;
          a.vel.y = a.vel.y * 0.35 + b.vel.y * 0.65 + ny * 0.25;
          b.vel.x = b.vel.x * 0.35 + avx * 0.65 - nx * 0.25;
          b.vel.y = b.vel.y * 0.35 + avy * 0.65 - ny * 0.25;
          a.vel.z += nz * 0.08;
          b.vel.z -= nz * 0.08;
        }
      }
    }

    meshes.current.forEach((m, i) => {
      const b = bodies.current[i];
      if (!m || !b) return;
      m.position.copy(b.pos);
      m.scale.setScalar(b.scale);
      m.rotation.y += clamped * b.spin;
      m.rotation.x += clamped * 0.2;
    });
  });

  return (
    <group ref={group}>
      {bodies.current.map((b, i) => (
        <group
          key={`${b.kind}-${i}`}
          ref={(el) => {
            if (el) meshes.current[i] = el;
          }}
          position={b.pos.toArray() as [number, number, number]}
        >
          <IconMesh kind={b.kind} scale={1} />
          <pointLight intensity={0.25} distance={2.4} color={BRAND[b.kind]} />
        </group>
      ))}
    </group>
  );
}

function NetworkLinks({ reduce }: { reduce: boolean }) {
  const points = useMemo(() => {
    const n = reduce ? 5 : 9;
    const arr: THREE.Vector3[][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      arr.push([
        new THREE.Vector3(Math.cos(a) * 1.2, Math.sin(a) * 0.8, -2.2),
        new THREE.Vector3(Math.cos(a + 1.2) * 3.6, Math.sin(a + 0.4) * 2.2, -4.5),
      ]);
    }
    return arr;
  }, [reduce]);

  const dots = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    dots.current.forEach((m, i) => {
      if (!m) return;
      const pair = points[i % points.length];
      const p = (t * 0.22 + i * 0.11) % 1;
      m.position.lerpVectors(pair[0], pair[1], p);
    });
  });

  return (
    <>
      {points.map((pts, i) => (
        <Line key={i} points={pts} color="#cfc8bc" lineWidth={1} transparent opacity={0.28} />
      ))}
      {points.map((_, i) => (
        <mesh
          key={`d-${i}`}
          ref={(el) => {
            if (el) dots.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1.2} />
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
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = -1 - Math.random() * 9;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.018;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f2ebe0" size={0.03} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

function SceneRig({ reduce }: { reduce: boolean }) {
  const root = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 0.35,
        y: (e.clientY / window.innerHeight - 0.5) * 0.2,
      };
    };
    const onScroll = () => {
      scroll.current = window.scrollY;
    };
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
    const ty = Math.min(scroll.current * 0.0012, 2.4);
    root.current.position.y += (ty - root.current.position.y) * 0.05;
  });

  return (
    <group ref={root}>
      <ambientLight intensity={0.45} color="#fff8f0" />
      <directionalLight position={[6, 8, 4]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[-5, -2, 3]} intensity={0.45} color="#f0e6d8" />
      <pointLight position={[0, 0, 4]} intensity={0.7} color="#fffaf2" distance={16} />
      <Particles count={reduce ? 40 : 140} />
      <NetworkLinks reduce={reduce} />
      <TrafficField reduce={reduce} />
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
        dpr={reduce ? [1, 1.2] : [1, 1.75]}
        camera={{ position: [0, 0.6, 9.5], fov: 40 }}
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
