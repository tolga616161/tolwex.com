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
  | "node"
  | "link";

type NodeSpec = {
  position: [number, number, number];
  scale: number;
  kind: Kind;
};

/**
 * Tall world: Y spans hero → footer so scroll reveals different clusters.
 * Near (z ~ 0): large hero objects. Far (z < -3): small depth nodes.
 */
const NODES: NodeSpec[] = [
  // HERO cluster (y 2 .. -1)
  { position: [-2.4, 1.6, 0.2], scale: 1.35, kind: "ig" },
  { position: [2.5, 1.2, -0.4], scale: 1.25, kind: "lock" },
  { position: [0.3, 2.0, -2.4], scale: 1.1, kind: "key" },
  { position: [-1.2, 0.4, -1.2], scale: 0.85, kind: "node" },
  { position: [1.6, 0.2, -2.8], scale: 0.7, kind: "node" },
  // SERVICES / social row (y -2 .. -6)
  { position: [-2.8, -2.4, -0.6], scale: 1.05, kind: "yt" },
  { position: [-0.9, -3.2, 0.1], scale: 1.0, kind: "fb" },
  { position: [1.1, -2.8, -1.0], scale: 0.95, kind: "tt" },
  { position: [2.9, -3.6, -0.3], scale: 0.9, kind: "x" },
  { position: [0.2, -4.4, -2.6], scale: 0.75, kind: "ig" },
  { position: [-2.0, -5.0, -2.2], scale: 0.55, kind: "node" },
  { position: [2.2, -5.2, -2.8], scale: 0.5, kind: "node" },
  // ANALYTICS (y -7 .. -11)
  { position: [-2.2, -7.4, -0.2], scale: 1.15, kind: "chart" },
  { position: [0.4, -8.0, -1.4], scale: 0.95, kind: "user" },
  { position: [2.4, -7.8, -0.8], scale: 0.9, kind: "cloud" },
  { position: [-0.8, -9.2, -2.6], scale: 0.65, kind: "node" },
  { position: [1.6, -9.8, -2.2], scale: 0.6, kind: "link" },
  // SECURITY (y -12 .. -16)
  { position: [-1.8, -12.6, 0.0], scale: 1.3, kind: "lock" },
  { position: [0.6, -13.2, -1.0], scale: 1.15, kind: "shield" },
  { position: [2.6, -12.8, -0.5], scale: 1.1, kind: "key" },
  { position: [-2.6, -14.4, -2.4], scale: 0.55, kind: "node" },
  { position: [1.8, -15.0, -2.8], scale: 0.5, kind: "node" },
  // META / lower (y -17 .. -22)
  { position: [-1.4, -17.4, -0.6], scale: 1.0, kind: "ig" },
  { position: [1.8, -18.0, -1.2], scale: 0.85, kind: "link" },
  { position: [0.0, -18.8, -2.4], scale: 0.7, kind: "user" },
  { position: [-2.8, -19.6, -2.0], scale: 0.55, kind: "node" },
  { position: [2.6, -20.2, -2.6], scale: 0.5, kind: "node" },
  { position: [-0.6, -21.4, -1.0], scale: 0.75, kind: "cloud" },
];

const LINKS: Array<[number, number]> = [
  [0, 1],
  [0, 3],
  [1, 2],
  [2, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [5, 10],
  [12, 13],
  [13, 14],
  [12, 15],
  [14, 16],
  [17, 18],
  [18, 19],
  [17, 20],
  [22, 23],
  [23, 24],
  [22, 25],
  [24, 27],
];

function Mat({
  color = "#eaeaea",
  metalness = 0.82,
  roughness = 0.22,
  opacity = 0.95,
}: {
  color?: string;
  metalness?: number;
  roughness?: number;
  opacity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

function IconMesh({ kind, scale }: { kind: Kind; scale: number }) {
  const s = scale;
  switch (kind) {
    case "lock":
      return (
        <group scale={s}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[0.58, 0.48, 0.32]} />
            <Mat color="#f2f2f2" />
          </mesh>
          <mesh position={[0, 0.28, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.2, 0.055, 12, 28, Math.PI]} />
            <Mat color="#c8c8c8" metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.08, 0.18]}>
            <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
            <Mat color="#888" />
          </mesh>
        </group>
      );
    case "key":
      return (
        <group scale={s} rotation={[0.15, 0.4, -0.55]}>
          <mesh>
            <cylinderGeometry args={[0.055, 0.055, 0.95, 14]} />
            <Mat color="#d0d0d0" metalness={0.92} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <torusGeometry args={[0.17, 0.05, 12, 24]} />
            <Mat color="#efefef" metalness={0.9} />
          </mesh>
          <mesh position={[0.14, -0.22, 0]}>
            <boxGeometry args={[0.2, 0.055, 0.055]} />
            <Mat color="#bbb" />
          </mesh>
          <mesh position={[0.14, -0.34, 0]}>
            <boxGeometry args={[0.14, 0.055, 0.055]} />
            <Mat color="#bbb" />
          </mesh>
        </group>
      );
    case "shield":
      return (
        <group scale={s}>
          <mesh>
            <cylinderGeometry args={[0.38, 0.46, 0.62, 6]} />
            <Mat color="#e8e8e8" metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.02, 0.12]}>
            <boxGeometry args={[0.08, 0.22, 0.04]} />
            <Mat color="#222" />
          </mesh>
          <mesh position={[0, -0.08, 0.12]}>
            <boxGeometry args={[0.18, 0.08, 0.04]} />
            <Mat color="#222" />
          </mesh>
        </group>
      );
    case "ig":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.62, 0.62, 0.2]} />
            <Mat color="#f5f5f5" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <torusGeometry args={[0.16, 0.045, 12, 28]} />
            <Mat color="#1a1a1a" metalness={0.4} roughness={0.45} />
          </mesh>
          <mesh position={[0.2, 0.2, 0.12]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <Mat color="#333" />
          </mesh>
        </group>
      );
    case "yt":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.78, 0.52, 0.18]} />
            <Mat color="#ececec" />
          </mesh>
          <mesh position={[0.05, 0, 0.12]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.13, 0.22, 3]} />
            <Mat color="#111" metalness={0.3} roughness={0.5} />
          </mesh>
        </group>
      );
    case "fb":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.5, 0.58, 0.18]} />
            <Mat color="#f0f0f0" />
          </mesh>
          <mesh position={[0.02, -0.02, 0.12]}>
            <boxGeometry args={[0.1, 0.32, 0.04]} />
            <Mat color="#222" />
          </mesh>
          <mesh position={[0.08, 0.06, 0.12]}>
            <boxGeometry args={[0.16, 0.08, 0.04]} />
            <Mat color="#222" />
          </mesh>
        </group>
      );
    case "x":
      return (
        <group scale={s}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.72, 0.11, 0.11]} />
            <Mat color="#f4f4f4" metalness={0.85} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.72, 0.11, 0.11]} />
            <Mat color="#d8d8d8" metalness={0.85} />
          </mesh>
        </group>
      );
    case "tt":
      return (
        <group scale={s} rotation={[0.25, 0.55, 0.1]}>
          <mesh>
            <capsuleGeometry args={[0.11, 0.42, 6, 14]} />
            <Mat color="#efefef" />
          </mesh>
          <mesh position={[0.16, 0.22, 0]} rotation={[0, 0, -0.6]}>
            <capsuleGeometry args={[0.07, 0.22, 6, 12]} />
            <Mat color="#bdbdbd" />
          </mesh>
        </group>
      );
    case "user":
      return (
        <group scale={s}>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.2, 20, 20]} />
            <Mat color="#f2f2f2" />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.32, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Mat color="#cfcfcf" />
          </mesh>
        </group>
      );
    case "cloud":
      return (
        <group scale={s}>
          <mesh position={[-0.16, 0, 0]}>
            <sphereGeometry args={[0.24, 16, 16]} />
            <Mat color="#d9d9d9" metalness={0.35} roughness={0.45} opacity={0.82} />
          </mesh>
          <mesh position={[0.2, 0.04, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <Mat color="#ececec" metalness={0.35} roughness={0.45} opacity={0.78} />
          </mesh>
          <mesh position={[0.02, -0.1, 0.08]}>
            <sphereGeometry args={[0.2, 14, 14]} />
            <Mat color="#c8c8c8" metalness={0.35} roughness={0.5} opacity={0.75} />
          </mesh>
        </group>
      );
    case "chart":
      return (
        <group scale={s}>
          <mesh position={[-0.24, -0.05, 0]}>
            <boxGeometry args={[0.14, 0.28, 0.14]} />
            <Mat color="#ddd" />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.14, 0.52, 0.14]} />
            <Mat color="#f0f0f0" />
          </mesh>
          <mesh position={[0.24, 0.2, 0]}>
            <boxGeometry args={[0.14, 0.76, 0.14]} />
            <Mat color="#fff" />
          </mesh>
        </group>
      );
    case "link":
      return (
        <group scale={s} rotation={[0.4, 0.2, 0.5]}>
          <mesh position={[-0.12, 0, 0]}>
            <torusGeometry args={[0.16, 0.045, 10, 20]} />
            <Mat color="#e0e0e0" metalness={0.9} />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <torusGeometry args={[0.16, 0.045, 10, 20]} />
            <Mat color="#bbb" metalness={0.9} />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh scale={s}>
          <icosahedronGeometry args={[0.2, 0]} />
          <Mat color="#ffffff" metalness={0.95} roughness={0.15} opacity={0.9} />
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
  return (
    <Float
      speed={reduce ? 0.5 : 0.9 + (index % 4) * 0.12}
      rotationIntensity={reduce ? 0.12 : 0.28}
      floatIntensity={reduce ? 0.2 : 0.45}
    >
      <group position={node.position}>
        <IconMesh kind={node.kind} scale={node.scale} />
        <pointLight intensity={0.12} distance={2.4} color="#ffffff" />
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
      const p = (t * 0.18 + i * 0.13) % 1;
      mesh.position.lerpVectors(pair[0], pair[1], p);
    });
  });

  return (
    <>
      {links.slice(0, 14).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
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
          color="#8a8a8a"
          lineWidth={1}
          transparent
          opacity={0.32}
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
      arr[i * 3 + 1] = 3 - Math.random() * 28;
      arr[i * 3 + 2] = -0.5 - Math.random() * 7;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#aaaaaa" size={0.028} transparent opacity={0.5} sizeAttenuation />
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
        x: (e.clientX / window.innerWidth - 0.5) * 0.28,
        y: (e.clientY / window.innerHeight - 0.5) * 0.16,
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
    group.current.rotation.y += (target.current.x - group.current.rotation.y) * 0.045;
    group.current.rotation.x += (target.current.y - group.current.rotation.x) * 0.045;
    // Map page scroll into world Y so lower-page clusters come into view
    const targetPosY = scrollY.current * 0.0042;
    group.current.position.y += (targetPosY - group.current.position.y) * 0.08;
  });

  const nodes = useMemo(
    () => (reduce ? NODES.filter((_, i) => i % 2 === 0) : NODES),
    [reduce]
  );

  const linkPoints = useMemo(
    () =>
      LINKS.map(([a, b]) => [
        new THREE.Vector3(...NODES[a].position),
        new THREE.Vector3(...NODES[b].position),
      ]),
    []
  );

  return (
    <group ref={group}>
      <ambientLight intensity={0.32} />
      <directionalLight position={[5, 8, 4]} intensity={1.15} color="#ffffff" />
      <directionalLight position={[-6, -3, -2]} intensity={0.28} color="#bdbdbd" />
      <Particles count={reduce ? 36 : 120} />
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
        dpr={reduce ? [1, 1.2] : [1, 1.65]}
        camera={{ position: [0, 0, 7.2], fov: 40 }}
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
