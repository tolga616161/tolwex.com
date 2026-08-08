"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Kind = "ig" | "fb" | "yt" | "tt" | "wa" | "node" | "lock" | "shield";

type Body = {
  kind: Kind;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  scale: number;
  baseScale: number;
  spin: number;
};

const BRAND: Record<Kind, string> = {
  ig: "#E1306C",
  fb: "#1877F2",
  yt: "#FF0000",
  tt: "#69C9D0",
  wa: "#25D366",
  node: "#FFFFFF",
  lock: "#E8E0D4",
  shield: "#A8B4C4",
};

function BrandMat({ kind, intensity = 0.55 }: { kind: Kind; intensity?: number }) {
  const color = BRAND[kind];
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      metalness={0.75}
      roughness={0.2}
    />
  );
}

function DarkMat() {
  return (
    <meshStandardMaterial
      color="#111"
      metalness={0.5}
      roughness={0.35}
      emissive="#222"
      emissiveIntensity={0.1}
    />
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
            <BrandMat kind="ig" intensity={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <torusGeometry args={[0.18, 0.055, 12, 32]} />
            <DarkMat />
          </mesh>
          <mesh position={[0.22, 0.22, 0.12]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <DarkMat />
          </mesh>
        </group>
      );
    case "fb":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.62, 0.7, 0.2]} />
            <BrandMat kind="fb" intensity={0.8} />
          </mesh>
          <mesh position={[0.02, -0.02, 0.13]}>
            <boxGeometry args={[0.11, 0.38, 0.04]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0.12, 0.1, 0.13]}>
            <boxGeometry args={[0.18, 0.09, 0.04]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </group>
      );
    case "yt":
      return (
        <group scale={s}>
          <mesh>
            <boxGeometry args={[0.9, 0.56, 0.16]} />
            <BrandMat kind="yt" intensity={0.55} />
          </mesh>
          <mesh position={[0.04, 0, 0.11]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.13, 0.22, 3]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </group>
      );
    case "tt":
      return (
        <group scale={s} rotation={[0.15, 0.4, 0.1]}>
          <mesh>
            <capsuleGeometry args={[0.11, 0.42, 8, 14]} />
            <BrandMat kind="tt" intensity={0.5} />
          </mesh>
          <mesh position={[0.15, 0.22, 0]} rotation={[0, 0, -0.55]}>
            <capsuleGeometry args={[0.07, 0.22, 8, 12]} />
            <meshStandardMaterial color="#EE1D52" emissive="#EE1D52" emissiveIntensity={0.4} />
          </mesh>
        </group>
      );
    case "wa":
      return (
        <group scale={s}>
          <mesh>
            <sphereGeometry args={[0.34, 22, 22]} />
            <BrandMat kind="wa" intensity={0.45} />
          </mesh>
        </group>
      );
    case "lock":
      return (
        <group scale={s}>
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[0.42, 0.32, 0.18]} />
            <BrandMat kind="lock" intensity={0.35} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <torusGeometry args={[0.14, 0.04, 10, 20]} />
            <BrandMat kind="lock" intensity={0.3} />
          </mesh>
        </group>
      );
    case "shield":
      return (
        <group scale={s}>
          <mesh>
            <octahedronGeometry args={[0.36, 0]} />
            <BrandMat kind="shield" intensity={0.4} />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh scale={s}>
          <icosahedronGeometry args={[0.16, 0]} />
          <BrandMat kind="node" intensity={0.7} />
        </mesh>
      );
  }
}

function CyberGlobe({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const meridians = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const segs = reduce ? 6 : 10;
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 48; j++) {
        const t = (j / 48) * Math.PI * 2;
        pts.push(
          new THREE.Vector3(
            Math.sin(t) * Math.cos(a) * 2.35,
            Math.cos(t) * 2.35,
            Math.sin(t) * Math.sin(a) * 2.35
          )
        );
      }
      lines.push(pts);
    }
    for (let i = 1; i < (reduce ? 4 : 6); i++) {
      const y = -2.1 + (i / 5) * 4.2;
      const r = Math.sqrt(Math.max(0.05, 2.35 ** 2 - y * y));
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 48; j++) {
        const t = (j / 48) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
      }
      lines.push(pts);
    }
    return lines;
  }, [reduce]);

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.08;
    group.current.rotation.x = Math.sin(performance.now() * 0.0002) * 0.12;
  });

  return (
    <group ref={group} position={[2.2, -0.2, -4.2]} scale={1.15}>
      <mesh>
        <sphereGeometry args={[2.32, 32, 32]} />
        <meshStandardMaterial
          color="#0a1420"
          emissive="#12304a"
          emissiveIntensity={0.35}
          metalness={0.85}
          roughness={0.35}
          transparent
          opacity={0.35}
          wireframe={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.38, reduce ? 16 : 28, reduce ? 16 : 28]} />
        <meshBasicMaterial color="#4fc3f7" wireframe transparent opacity={0.22} />
      </mesh>
      {meridians.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={i % 2 === 0 ? "#E1306C" : "#1877F2"}
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}
      {!reduce
        ? Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2;
            const b = ((i * 3) % 18) / 18 * Math.PI;
            return (
              <mesh
                key={`n-${i}`}
                position={[
                  Math.sin(b) * Math.cos(a) * 2.4,
                  Math.cos(b) * 2.4,
                  Math.sin(b) * Math.sin(a) * 2.4,
                ]}
              >
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshStandardMaterial
                  color={i % 2 ? "#1877F2" : "#E1306C"}
                  emissive={i % 2 ? "#1877F2" : "#E1306C"}
                  emissiveIntensity={1.4}
                />
              </mesh>
            );
          })
        : null}
    </group>
  );
}

/** Instagram + Facebook logos orbit and merge at center */
function MetaMerge({ reduce }: { reduce: boolean }) {
  const root = useRef<THREE.Group>(null);
  const ig = useRef<THREE.Group>(null);
  const fb = useRef<THREE.Group>(null);
  const bridge = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = (Math.sin(t * 1.2) + 1) / 2;
    const dist = THREE.MathUtils.lerp(1.35, 0.55, pulse);
    if (ig.current) {
      ig.current.position.set(-dist, Math.sin(t * 0.9) * 0.15, 0);
      ig.current.rotation.y = t * 0.6;
      ig.current.scale.setScalar(1.05 + pulse * 0.12);
    }
    if (fb.current) {
      fb.current.position.set(dist, Math.cos(t * 0.9) * 0.15, 0);
      fb.current.rotation.y = -t * 0.55;
      fb.current.scale.setScalar(1.05 + pulse * 0.12);
    }
    if (bridge.current) {
      bridge.current.scale.set(dist * 1.6, 1, 1);
      const mat = bridge.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + pulse * 1.2;
      mat.opacity = 0.25 + pulse * 0.45;
    }
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.4) * 0.15 + 0.4;
      root.current.rotation.z = Math.sin(t * 0.25) * 0.05;
    }
  });

  return (
    <group ref={root} position={[-1.6, 0.6, -1.2]}>
      <group ref={ig}>
        <IconMesh kind="ig" scale={reduce ? 1.1 : 1.35} />
        <pointLight intensity={0.9} distance={3.2} color="#E1306C" />
      </group>
      <group ref={fb}>
        <IconMesh kind="fb" scale={reduce ? 1.05 : 1.3} />
        <pointLight intensity={0.9} distance={3.2} color="#1877F2" />
      </group>
      <mesh ref={bridge} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 0.04, 0.04]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#9ecbff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>
      {!reduce ? (
        <mesh>
          <torusGeometry args={[1.55, 0.015, 8, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
        </mesh>
      ) : null}
    </group>
  );
}

function RisingAsh({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const speeds = useRef<Float32Array>(new Float32Array(count));
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = -6 + Math.random() * 12;
      arr[i * 3 + 2] = -1 - Math.random() * 10;
      speeds.current[i] = 0.35 + Math.random() * 0.9;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds.current[i] * dt;
      if (arr[i * 3 + 1] > 6.5) {
        arr[i * 3 + 1] = -6.5;
        arr[i * 3] = (Math.random() - 0.5) * 16;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#b8d4ff" size={0.035} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function CyberGridFloor() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.z += dt * 0.45;
    if (ref.current.position.z > 1.2) ref.current.position.z = 0;
  });
  const lines = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    for (let i = -8; i <= 8; i++) {
      out.push([new THREE.Vector3(i * 0.7, -3.4, -8), new THREE.Vector3(i * 0.7, -3.4, 2)]);
      out.push([new THREE.Vector3(-6, -3.4, i * 0.7 - 3), new THREE.Vector3(6, -3.4, i * 0.7 - 3)]);
    }
    return out;
  }, []);

  return (
    <group ref={ref}>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={i % 3 === 0 ? "#E1306C" : "#1877F2"}
          transparent
          opacity={0.14}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

function seedBodies(reduce: boolean): Body[] {
  const kinds: Kind[] = reduce
    ? ["ig", "fb", "ig", "fb", "wa", "ig", "fb", "node"]
    : [
        "ig",
        "fb",
        "ig",
        "fb",
        "ig",
        "fb",
        "ig",
        "fb",
        "yt",
        "tt",
        "wa",
        "lock",
        "shield",
        "ig",
        "fb",
        "node",
        "ig",
        "fb",
      ];

  return kinds.map((kind, i) => {
    const baseScale = kind === "ig" || kind === "fb" ? 0.95 + (i % 3) * 0.12 : 0.65 + (i % 3) * 0.1;
    return {
      kind,
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        -6.5 + Math.random() * 2,
        -1.5 - Math.random() * 6
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.35,
        0.55 + Math.random() * 0.85,
        (Math.random() - 0.5) * 0.15
      ),
      scale: baseScale,
      baseScale,
      spin: (Math.random() - 0.5) * 1.4,
    };
  });
}

function RisingBrands({ reduce }: { reduce: boolean }) {
  const bodies = useRef<Body[]>([]);
  const meshes = useRef<THREE.Group[]>([]);

  useMemo(() => {
    bodies.current = seedBodies(reduce);
  }, [reduce]);

  useFrame((_, dt) => {
    const clamped = Math.min(dt, 0.033);
    for (let i = 0; i < bodies.current.length; i++) {
      const b = bodies.current[i];
      b.pos.addScaledVector(b.vel, clamped);
      b.scale = b.baseScale * (0.9 + 0.1 * Math.sin(performance.now() * 0.001 + i));
      if (b.pos.y > 6.8) {
        b.pos.y = -6.8;
        b.pos.x = (Math.random() - 0.5) * 12;
        b.pos.z = -1.5 - Math.random() * 6;
      }
      if (Math.abs(b.pos.x) > 7.5) b.vel.x *= -1;
    }

    for (let i = 0; i < bodies.current.length; i++) {
      for (let j = i + 1; j < bodies.current.length; j++) {
        const a = bodies.current[i];
        const b = bodies.current[j];
        const dx = a.pos.x - b.pos.x;
        const dy = a.pos.y - b.pos.y;
        const dz = a.pos.z - b.pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const min = 0.75 * ((a.scale + b.scale) * 0.55);
        if (dist > 0.001 && dist < min) {
          const nx = dx / dist;
          const ny = dy / dist;
          const push = (min - dist) * 0.45;
          a.pos.x += nx * push;
          a.pos.y += ny * push;
          b.pos.x -= nx * push;
          b.pos.y -= ny * push;
          if (a.kind === "ig" && b.kind === "fb") {
            a.vel.x += nx * 0.15;
            b.vel.x -= nx * 0.15;
          }
        }
      }
    }

    meshes.current.forEach((m, i) => {
      const b = bodies.current[i];
      if (!m || !b) return;
      m.position.copy(b.pos);
      m.scale.setScalar(b.scale);
      m.rotation.y += clamped * b.spin;
      m.rotation.x += clamped * 0.15;
    });
  });

  return (
    <group>
      {bodies.current.map((b, i) => (
        <group
          key={`${b.kind}-${i}`}
          ref={(el) => {
            if (el) meshes.current[i] = el;
          }}
        >
          <IconMesh kind={b.kind} scale={1} />
          {(b.kind === "ig" || b.kind === "fb") && (
            <pointLight intensity={0.35} distance={2.6} color={BRAND[b.kind]} />
          )}
        </group>
      ))}
    </group>
  );
}

function NetworkLinks({ reduce }: { reduce: boolean }) {
  const points = useMemo(() => {
    const n = reduce ? 4 : 8;
    const arr: THREE.Vector3[][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      arr.push([
        new THREE.Vector3(Math.cos(a) * 1.1, Math.sin(a) * 0.7 - 0.4, -1.8),
        new THREE.Vector3(Math.cos(a + 1.1) * 3.8, Math.sin(a + 0.5) * 2.4 + 0.6, -5),
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
      const p = (t * 0.18 + i * 0.1) % 1;
      m.position.lerpVectors(pair[0], pair[1], p);
    });
  });

  return (
    <>
      {points.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={i % 2 ? "#1877F2" : "#E1306C"}
          lineWidth={1}
          transparent
          opacity={0.28}
        />
      ))}
      {points.map((_, i) => (
        <mesh
          key={`d-${i}`}
          ref={(el) => {
            if (el) dots.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#fff" emissive="#9ecbff" emissiveIntensity={1.3} />
        </mesh>
      ))}
    </>
  );
}

function SceneRig({ reduce }: { reduce: boolean }) {
  const root = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 0.28,
        y: (e.clientY / window.innerHeight - 0.5) * 0.16,
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
    root.current.rotation.y += (target.current.x - root.current.rotation.y) * 0.035;
    root.current.rotation.x += (target.current.y - root.current.rotation.x) * 0.035;
    // scroll lifts the whole cyber field upward
    const ty = Math.min(scroll.current * 0.0014, 3.2);
    root.current.position.y += (ty - root.current.position.y) * 0.045;
  });

  return (
    <group ref={root}>
      <fog attach="fog" args={["#000008", 10, 24]} />
      <ambientLight intensity={0.35} color="#cfe0ff" />
      <directionalLight position={[5, 7, 4]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-4, 2, 2]} intensity={0.45} color="#E1306C" />
      <directionalLight position={[3, -1, 3]} intensity={0.35} color="#1877F2" />
      <pointLight position={[0, -2, 2]} intensity={0.55} color="#6ec6ff" distance={14} />
      <CyberGridFloor />
      <CyberGlobe reduce={reduce} />
      <MetaMerge reduce={reduce} />
      <RisingAsh count={reduce ? 50 : 160} />
      <NetworkLinks reduce={reduce} />
      <RisingBrands reduce={reduce} />
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
        camera={{ position: [0, 0.4, 9.2], fov: 42 }}
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
