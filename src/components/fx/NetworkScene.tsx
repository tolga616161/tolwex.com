"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Kind =
  | "lock"
  | "key"
  | "shield"
  | "ig"
  | "yt"
  | "fb"
  | "x"
  | "tt"
  | "user"
  | "cloud"
  | "chart"
  | "node";

type NodeSpec = {
  position: [number, number, number];
  scale: number;
  kind: Kind;
  glow?: number;
};

/** Dense, visible white/beige 3D social + security objects across the page. */
const NODES: NodeSpec[] = [
  // Hero — big & close
  { position: [2.6, 1.5, 0.6], scale: 1.55, kind: "ig", glow: 1.2 },
  { position: [-2.8, 1.1, 0.3], scale: 1.4, kind: "lock", glow: 1.1 },
  { position: [0.2, 2.2, -1.4], scale: 1.25, kind: "key", glow: 1 },
  { position: [-1.4, -0.2, 0.8], scale: 1.15, kind: "fb", glow: 1.1 },
  { position: [1.5, -0.6, 0.5], scale: 1.1, kind: "x", glow: 1 },
  { position: [3.2, -1.2, -0.8], scale: 1.05, kind: "yt", glow: 0.9 },
  { position: [-3.1, -1.5, -0.5], scale: 1.0, kind: "tt", glow: 0.9 },
  { position: [0.8, 0.8, -2.2], scale: 0.7, kind: "node", glow: 1.4 },
  { position: [-2.0, 2.0, -2.6], scale: 0.55, kind: "node", glow: 1.2 },
  // Mid page — services / social swarm
  { position: [-2.4, -3.0, 0.2], scale: 1.25, kind: "ig", glow: 1 },
  { position: [2.5, -3.4, 0.4], scale: 1.2, kind: "fb", glow: 1 },
  { position: [0.0, -4.0, -0.6], scale: 1.15, kind: "yt", glow: 0.95 },
  { position: [-1.6, -4.8, 0.5], scale: 1.1, kind: "x", glow: 1 },
  { position: [1.8, -5.2, -0.2], scale: 1.05, kind: "tt", glow: 0.95 },
  { position: [3.0, -4.2, -1.8], scale: 1.2, kind: "lock", glow: 1 },
  { position: [-3.0, -5.6, -1.4], scale: 1.0, kind: "key", glow: 0.9 },
  { position: [0.6, -6.2, -2.4], scale: 0.65, kind: "node", glow: 1.3 },
  // Analytics band
  { position: [-2.2, -8.0, 0.3], scale: 1.25, kind: "chart", glow: 1 },
  { position: [0.5, -8.6, 0.1], scale: 1.1, kind: "user", glow: 0.95 },
  { position: [2.6, -8.2, -0.5], scale: 1.05, kind: "cloud", glow: 0.85 },
  { position: [-0.8, -9.4, -1.6], scale: 1.15, kind: "ig", glow: 1 },
  { position: [1.8, -10.0, 0.4], scale: 1.0, kind: "shield", glow: 1 },
  // Security band
  { position: [-2.0, -12.5, 0.5], scale: 1.45, kind: "lock", glow: 1.2 },
  { position: [0.4, -13.2, -0.2], scale: 1.3, kind: "shield", glow: 1.1 },
  { position: [2.8, -12.8, 0.3], scale: 1.25, kind: "key", glow: 1 },
  { position: [-1.2, -14.4, -1.2], scale: 1.05, kind: "fb", glow: 0.9 },
  { position: [1.6, -14.8, -0.8], scale: 1.0, kind: "x", glow: 0.9 },
  // Lower page
  { position: [-2.4, -17.5, 0.2], scale: 1.15, kind: "ig", glow: 1 },
  { position: [2.2, -18.0, 0.0], scale: 1.1, kind: "yt", glow: 0.9 },
  { position: [0.0, -18.8, -1.0], scale: 1.05, kind: "tt", glow: 0.9 },
  { position: [-1.6, -19.6, 0.4], scale: 0.95, kind: "user", glow: 0.85 },
  { position: [1.4, -20.2, -1.6], scale: 0.9, kind: "lock", glow: 1 },
  { position: [2.8, -21.0, -0.4], scale: 0.7, kind: "node", glow: 1.2 },
  { position: [-2.8, -21.4, -1.2], scale: 0.65, kind: "node", glow: 1.1 },
];

const LINKS: Array<[number, number]> = [
  [0, 1],
  [0, 3],
  [1, 2],
  [3, 4],
  [4, 5],
  [5, 6],
  [0, 7],
  [1, 8],
  [9, 10],
  [10, 11],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [17, 18],
  [18, 19],
  [18, 20],
  [20, 21],
  [22, 23],
  [23, 24],
  [22, 25],
  [24, 26],
  [27, 28],
  [28, 29],
  [29, 30],
  [30, 31],
];

function GlowMat({
  color = "#f4f1ea",
  emissive = "#ffffff",
  emissiveIntensity = 0.45,
  metalness = 0.88,
  roughness = 0.18,
  opacity = 0.98,
}: {
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
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
      metalness={0.5}
      roughness={0.4}
      emissive="#333333"
      emissiveIntensity={0.15}
    />
  );
}

function IconMesh({ kind, scale, glow = 1 }: { kind: Kind; scale: number; glow?: number }) {
  const s = scale;
  const ei = 0.35 * glow;
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
          <mesh position={[0.16, -0.36, 0]}>
            <boxGeometry args={[0.15, 0.06, 0.06]} />
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
          <mesh position={[0, -0.08, 0.14]}>
            <boxGeometry args={[0.2, 0.09, 0.05]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "ig":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.7, 0.7, 0.22]} />
            <GlowMat color="#fffdf8" emissiveIntensity={ei * 1.15} />
          </mesh>
          <mesh position={[0, 0, 0.14]}>
            <torusGeometry args={[0.18, 0.05, 14, 32]} />
            <DarkMat />
          </mesh>
          <mesh position={[0.22, 0.22, 0.14]}>
            <sphereGeometry args={[0.05, 14, 14]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "yt":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.86, 0.56, 0.2]} />
            <GlowMat color="#f8f5ef" emissiveIntensity={ei} />
          </mesh>
          <mesh position={[0.05, 0, 0.14]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.14, 0.24, 3]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "fb":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.56, 0.64, 0.2]} />
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
            <boxGeometry args={[0.8, 0.13, 0.13]} />
            <GlowMat color="#fffaf3" emissiveIntensity={ei * 1.15} metalness={0.92} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.8, 0.13, 0.13]} />
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
    case "cloud":
      return (
        <group scale={s}>
          <mesh position={[-0.18, 0, 0]}>
            <sphereGeometry args={[0.26, 18, 18]} />
            <GlowMat color="#efeae2" emissiveIntensity={ei * 0.7} opacity={0.88} roughness={0.35} />
          </mesh>
          <mesh position={[0.22, 0.05, 0]}>
            <sphereGeometry args={[0.32, 18, 18]} />
            <GlowMat color="#f8f4ee" emissiveIntensity={ei * 0.75} opacity={0.85} roughness={0.35} />
          </mesh>
        </group>
      );
    case "chart":
      return (
        <group scale={s}>
          <mesh position={[-0.26, -0.05, 0]}>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <GlowMat color="#e8e2d8" emissiveIntensity={ei * 0.8} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.15, 0.56, 0.15]} />
            <GlowMat color="#f2ece4" emissiveIntensity={ei} />
          </mesh>
          <mesh position={[0.26, 0.22, 0]}>
            <boxGeometry args={[0.15, 0.8, 0.15]} />
            <GlowMat color="#fffaf3" emissiveIntensity={ei * 1.15} />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh scale={s}>
          <icosahedronGeometry args={[0.22, 0]} />
          <GlowMat color="#ffffff" emissiveIntensity={ei * 1.4} metalness={0.98} roughness={0.12} />
        </mesh>
      );
  }
}

function FloatingNode({
  node,
  index,
  reduce,
}: {
  node: NodeSpec;
  index: number;
  reduce: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const base = node.position;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const speed = reduce ? 0.35 : 0.55 + (index % 5) * 0.08;
    const amp = reduce ? 0.12 : 0.22 + (index % 3) * 0.05;
    group.current.position.x = base[0] + Math.sin(t * speed + index) * amp;
    group.current.position.y = base[1] + Math.cos(t * speed * 0.85 + index * 0.7) * amp * 1.15;
    group.current.position.z = base[2] + Math.sin(t * speed * 0.6 + index) * amp * 0.5;
    group.current.rotation.y = t * (0.25 + (index % 4) * 0.05) * (index % 2 === 0 ? 1 : -1);
    group.current.rotation.x = Math.sin(t * 0.4 + index) * 0.2;
  });

  return (
    <Float
      speed={reduce ? 0.7 : 1.4 + (index % 3) * 0.2}
      rotationIntensity={reduce ? 0.2 : 0.55}
      floatIntensity={reduce ? 0.3 : 0.7}
    >
      <group ref={group} position={node.position}>
        <IconMesh kind={node.kind} scale={node.scale} glow={node.glow ?? 1} />
        <pointLight
          intensity={(reduce ? 0.25 : 0.45) * (node.glow ?? 1)}
          distance={3.2}
          color="#fff8ee"
          decay={2}
        />
      </group>
    </Float>
  );
}

function DataPulses({ links }: { links: THREE.Vector3[][] }) {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const pair = links[i % links.length];
      if (!pair) return;
      const p = (t * 0.28 + i * 0.11) % 1;
      mesh.position.lerpVectors(pair[0], pair[1], p);
    });
  });

  return (
    <>
      {links.slice(0, 18).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            color="#fffaf2"
            emissive="#ffffff"
            emissiveIntensity={1.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </>
  );
}

function NetworkLinks({ points }: { points: THREE.Vector3[][] }) {
  return (
    <>
      {points.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#cfc8bc"
          lineWidth={1.25}
          transparent
          opacity={0.42}
        />
      ))}
      <DataPulses links={points} />
    </>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = 4 - Math.random() * 28;
      arr[i * 3 + 2] = -0.2 - Math.random() * 6;
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
      <pointsMaterial
        color="#f2ebe0"
        size={0.04}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

function SceneRig({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const scrollY = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 0.38,
        y: (e.clientY / window.innerHeight - 0.5) * 0.22,
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
    if (!group.current) return;
    group.current.rotation.y += (target.current.x - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (target.current.y - group.current.rotation.x) * 0.05;
    const targetPosY = scrollY.current * 0.0045;
    group.current.position.y += (targetPosY - group.current.position.y) * 0.085;
  });

  const nodes = useMemo(
    () => (reduce ? NODES.filter((_, i) => i % 2 === 0) : NODES),
    [reduce]
  );

  const linkPoints = useMemo(
    () =>
      LINKS.filter(([a, b]) => a < NODES.length && b < NODES.length).map(([a, b]) => [
        new THREE.Vector3(...NODES[a].position),
        new THREE.Vector3(...NODES[b].position),
      ]),
    []
  );

  return (
    <group ref={group}>
      <ambientLight intensity={0.55} color="#fff8f0" />
      <directionalLight position={[4, 7, 5]} intensity={1.55} color="#ffffff" />
      <directionalLight position={[-5, -2, 2]} intensity={0.55} color="#f0e6d8" />
      <pointLight position={[0, 1, 4]} intensity={0.7} color="#fffaf2" distance={12} />
      <Particles count={reduce ? 50 : 160} />
      {!reduce ? <NetworkLinks points={linkPoints} /> : null}
      {nodes.map((n, i) => (
        <FloatingNode key={`${n.kind}-${i}`} node={n} index={i} reduce={reduce} />
      ))}
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
        camera={{ position: [0, 0, 6.8], fov: 42 }}
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
