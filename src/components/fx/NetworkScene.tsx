"use client";

import { Canvas, useFrame } from "@react-three/fiber";
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
      {/* Depth / bevel body */}
      <RoundedBox args={[1, 1, 0.14]} radius={0.16} smoothness={4}>
        <meshPhysicalMaterial
          color="#121212"
          metalness={0.85}
          roughness={0.28}
          clearcoat={0.55}
          clearcoatRoughness={0.35}
          transparent
          opacity={opacity}
        />
      </RoundedBox>
      {/* Face with accurate logo texture */}
      <mesh position={[0, 0, 0.072]}>
        <planeGeometry args={[0.92, 0.92]} />
        <meshPhysicalMaterial
          map={tex}
          transparent
          opacity={opacity}
          metalness={0.35}
          roughness={0.35}
          clearcoat={0.4}
          clearcoatRoughness={0.4}
          side={THREE.FrontSide}
        />
      </mesh>
      {/* Soft rim light catch */}
      <mesh position={[0, 0, -0.072]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.92, 0.92]} />
        <meshPhysicalMaterial
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.25}
          transparent
          opacity={opacity * 0.85}
        />
      </mesh>
    </group>
  );
}

function seedFloaters(reduce: boolean): Floater[] {
  const kinds: SocialKind[] = ["ig", "fb", "tt"];
  const n = reduce ? 12 : 22;
  const out: Floater[] = [];

  for (let i = 0; i < n; i++) {
    const kind = kinds[i % 3];
    const depthBand = i % 3;
    const z =
      depthBand === 0
        ? -1.4 - Math.random() * 1.4
        : depthBand === 1
          ? -3.0 - Math.random() * 2.0
          : -5.5 - Math.random() * 2.8;

    const near = z > -2.6;
    const far = z < -5.8;
    const scale = near
      ? 0.85 + Math.random() * 0.45
      : far
        ? 0.35 + Math.random() * 0.3
        : 0.55 + Math.random() * 0.4;

    // Bias floaters to the right / upper so left copy stays clear
    const xBias = 1.2 + Math.random() * 5.5 * (Math.random() > 0.35 ? 1 : -0.4);

    out.push({
      kind,
      pos: new THREE.Vector3(
        xBias * (Math.random() > 0.5 ? 1 : -0.55),
        (Math.random() - 0.35) * (near ? 5 : 7),
        z
      ),
      rot: new THREE.Euler(
        (Math.random() - 0.5) * 0.7,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 0.45
      ),
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 0.18,
        (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.12
      ),
      scale,
      opacity: far ? 0.45 + Math.random() * 0.2 : near ? 0.92 : 0.7 + Math.random() * 0.18,
      drift: 0.1 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Guaranteed large, readable hero marks (right / mid field)
  const hero: Array<[SocialKind, THREE.Vector3, number, THREE.Euler]> = [
    ["ig", new THREE.Vector3(2.6, 1.55, -2.0), 1.55, new THREE.Euler(-0.18, -0.45, 0.12)],
    ["fb", new THREE.Vector3(4.1, -0.15, -2.6), 1.35, new THREE.Euler(0.22, 0.55, -0.1)],
    ["tt", new THREE.Vector3(1.5, -1.55, -1.7), 1.3, new THREE.Euler(0.1, -0.3, 0.18)],
    ["ig", new THREE.Vector3(-4.2, -2.0, -3.4), 0.85, new THREE.Euler(0.3, 0.8, -0.2)],
    ["fb", new THREE.Vector3(-3.6, 2.1, -4.2), 0.7, new THREE.Euler(-0.25, -0.6, 0.15)],
    ["tt", new THREE.Vector3(5.0, 1.9, -4.8), 0.75, new THREE.Euler(0.4, 0.2, -0.25)],
  ];
  hero.forEach(([kind, pos, scale, rot], i) => {
    out.push({
      kind,
      pos,
      rot,
      spin: new THREE.Vector3(0.04, 0.14 + i * 0.02, 0.025),
      scale,
      opacity: i < 3 ? 0.95 : 0.65,
      drift: 0.12,
      phase: i * 0.9,
    });
  });

  return out;
}

function FloatingLogos({ reduce }: { reduce: boolean }) {
  const items = useMemo(() => seedFloaters(reduce), [reduce]);
  const refs = useRef<THREE.Group[]>([]);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    const clamped = Math.min(dt, 0.033);
    items.forEach((f, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.position.set(
        f.pos.x + Math.sin(t * f.drift + f.phase) * 0.22,
        f.pos.y + Math.cos(t * f.drift * 0.85 + f.phase) * 0.18,
        f.pos.z
      );
      g.rotation.x = f.rot.x + t * f.spin.x;
      g.rotation.y = f.rot.y + t * f.spin.y;
      g.rotation.z = f.rot.z + Math.sin(t * 0.4 + f.phase) * 0.08;
      // Subtle scale pulse for presence
      const pulse = 1 + Math.sin(t * 0.7 + f.phase) * 0.02;
      g.scale.setScalar(f.scale * pulse);
      void clamped;
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
          <MonoPlate kind={f.kind} scale={1} opacity={f.opacity} />
        </group>
      ))}
    </group>
  );
}

function DigitalLattice({ reduce }: { reduce: boolean }) {
  const nodes = useMemo(() => {
    const n = reduce ? 18 : 36;
    return Array.from({ length: n }, () =>
      new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        -2 - Math.random() * 9
      )
    );
  }, [reduce]);

  const links = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    const maxDist = reduce ? 3.8 : 4.4;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < maxDist) {
          out.push([nodes[i], nodes[j]]);
        }
      }
    }
    return out.slice(0, reduce ? 28 : 55);
  }, [nodes, reduce]);

  const pulse = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    pulse.current.forEach((m, i) => {
      if (!m) return;
      const pair = links[i % links.length];
      if (!pair) return;
      const p = (t * 0.15 + i * 0.07) % 1;
      m.position.lerpVectors(pair[0], pair[1], p);
    });
  });

  return (
    <group>
      {links.map((pts, i) => (
        <Line
          key={`l-${i}`}
          points={pts}
          color="#cfcfcf"
          transparent
          opacity={0.1}
          lineWidth={1}
        />
      ))}
      {nodes.map((p, i) => (
        <mesh key={`n-${i}`} position={p}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#e8e8e8" transparent opacity={0.35} />
        </mesh>
      ))}
      {links.slice(0, reduce ? 8 : 14).map((_, i) => (
        <mesh
          key={`p-${i}`}
          ref={(el) => {
            if (el) pulse.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function DustField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = -1 - Math.random() * 12;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += dt * (0.08 + (i % 5) * 0.02);
      if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = -6;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#d0d0d0"
        size={0.02}
        transparent
        opacity={0.28}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function SoftWireSphere({ reduce }: { reduce: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.05;
    ref.current.rotation.x += dt * 0.015;
  });

  return (
    <group ref={ref} position={[2.8, 0.2, -7.5]} scale={reduce ? 0.85 : 1}>
      <mesh>
        <sphereGeometry args={[2.2, reduce ? 16 : 28, reduce ? 16 : 28]} />
        <meshBasicMaterial color="#8a8a8a" wireframe transparent opacity={0.08} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.35, 12, 12]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

function SceneRig({ reduce }: { reduce: boolean }) {
  const root = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 0.18,
        y: (e.clientY / window.innerHeight - 0.5) * 0.1,
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
    root.current.rotation.y += (target.current.x - root.current.rotation.y) * 0.03;
    root.current.rotation.x += (target.current.y - root.current.rotation.x) * 0.03;
    const ty = Math.min(scroll.current * 0.0011, 2.4);
    root.current.position.y += (ty - root.current.position.y) * 0.04;
  });

  return (
    <group ref={root}>
      {/* Soft depth fade — far icons blur into dark without washing logos */}
      <fog attach="fog" args={["#050505", 9, 20]} />
      <ambientLight intensity={0.75} color="#eaeaea" />
      <directionalLight position={[4, 6, 5]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[-4, 2, 3]} intensity={0.45} color="#c8c8c8" />
      <pointLight position={[3, 1.5, 2]} intensity={0.7} color="#ffffff" distance={16} />

      <SoftWireSphere reduce={reduce} />
      <DigitalLattice reduce={reduce} />
      <DustField count={reduce ? 40 : 110} />
      <FloatingLogos reduce={reduce} />
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
        dpr={reduce ? [1, 1.15] : [1, 1.65]}
        camera={{ position: [0, 0.2, 8.6], fov: 40 }}
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
