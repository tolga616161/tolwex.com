"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Kind = "ig" | "fb";

type Body = {
  kind: Kind;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  scale: number;
  baseScale: number;
  spin: number;
};

const BRAND = { ig: "#E1306C", fb: "#1877F2" } as const;

function BrandMat({ kind, intensity = 0.7 }: { kind: Kind; intensity?: number }) {
  const color = BRAND[kind];
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      metalness={0.78}
      roughness={0.18}
    />
  );
}

function DarkMat() {
  return (
    <meshStandardMaterial
      color="#0c0c0c"
      metalness={0.55}
      roughness={0.3}
      emissive="#1a1a1a"
      emissiveIntensity={0.15}
    />
  );
}

function IconMesh({ kind, scale }: { kind: Kind; scale: number }) {
  const s = scale;
  if (kind === "ig") {
    return (
      <group scale={s}>
        <mesh>
          <boxGeometry args={[0.72, 0.72, 0.2]} />
          <BrandMat kind="ig" intensity={0.95} />
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
  }
  return (
    <group scale={s}>
      <mesh>
        <boxGeometry args={[0.62, 0.7, 0.2]} />
        <BrandMat kind="fb" intensity={0.9} />
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
}

/** Big cyber world + orbiting IG/FB satellites + debris fragments */
function WorldCore({ reduce }: { reduce: boolean }) {
  const world = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Group>(null);
  const ringB = useRef<THREE.Group>(null);
  const ringC = useRef<THREE.Group>(null);
  const debris = useRef<THREE.Group>(null);

  const meridians = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const segs = reduce ? 7 : 12;
    const R = 2.55;
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 56; j++) {
        const t = (j / 56) * Math.PI * 2;
        pts.push(
          new THREE.Vector3(
            Math.sin(t) * Math.cos(a) * R,
            Math.cos(t) * R,
            Math.sin(t) * Math.sin(a) * R
          )
        );
      }
      lines.push(pts);
    }
    for (let i = 1; i < (reduce ? 5 : 7); i++) {
      const y = -2.3 + (i / 6) * 4.6;
      const r = Math.sqrt(Math.max(0.08, R * R - y * y));
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 56; j++) {
        const t = (j / 56) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
      }
      lines.push(pts);
    }
    return lines;
  }, [reduce]);

  const satellites = useMemo(() => {
    const n = reduce ? 10 : 22;
    return Array.from({ length: n }, (_, i) => ({
      kind: (i % 2 === 0 ? "ig" : "fb") as Kind,
      radius: 3.35 + (i % 5) * 0.42,
      speed: 0.22 + (i % 7) * 0.05,
      tilt: (i % 4) * 0.35,
      phase: (i / n) * Math.PI * 2,
      scale: 0.55 + (i % 4) * 0.12,
      elev: ((i % 5) - 2) * 0.35,
    }));
  }, [reduce]);

  const shards = useMemo(() => {
    const n = reduce ? 14 : 36;
    return Array.from({ length: n }, (_, i) => ({
      kind: (i % 2 === 0 ? "ig" : "fb") as Kind,
      radius: 2.7 + (i % 6) * 0.55,
      speed: 0.35 + (i % 8) * 0.08,
      phase: Math.random() * Math.PI * 2,
      tilt: Math.random() * Math.PI,
      size: 0.08 + (i % 5) * 0.04,
      spin: 0.8 + Math.random() * 1.6,
    }));
  }, [reduce]);

  const satRefs = useRef<THREE.Group[]>([]);
  const shardRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    if (world.current) {
      world.current.rotation.y += dt * 0.12;
      world.current.rotation.x = Math.sin(t * 0.15) * 0.14;
    }
    if (ringA.current) ringA.current.rotation.z = t * 0.35;
    if (ringB.current) ringB.current.rotation.x = t * 0.22;
    if (ringC.current) {
      ringC.current.rotation.y = -t * 0.28;
      ringC.current.rotation.z = t * 0.1;
    }
    if (debris.current) debris.current.rotation.y = t * 0.18;

    satellites.forEach((s, i) => {
      const g = satRefs.current[i];
      if (!g) return;
      const a = s.phase + t * s.speed;
      g.position.set(
        Math.cos(a) * s.radius,
        s.elev + Math.sin(a * 1.3) * 0.35,
        Math.sin(a) * s.radius
      );
      g.rotation.y = a + Math.PI / 2;
      g.rotation.x = s.tilt * 0.4;
      g.rotation.z = Math.sin(t + i) * 0.2;
    });

    shards.forEach((s, i) => {
      const m = shardRefs.current[i];
      if (!m) return;
      const a = s.phase + t * s.speed;
      const wobble = Math.sin(t * 1.4 + i) * 0.25;
      m.position.set(
        Math.cos(a) * (s.radius + wobble),
        Math.sin(a * 0.7 + s.tilt) * 1.4,
        Math.sin(a) * (s.radius + wobble)
      );
      m.rotation.x += dt * s.spin;
      m.rotation.y += dt * s.spin * 0.7;
    });
  });

  return (
    <group position={[1.1, 0.15, -3.6]} scale={reduce ? 0.92 : 1.08}>
      <group ref={world}>
        <mesh>
          <sphereGeometry args={[2.5, 48, 48]} />
          <meshStandardMaterial
            color="#071018"
            emissive="#0d2a44"
            emissiveIntensity={0.55}
            metalness={0.9}
            roughness={0.28}
            transparent
            opacity={0.55}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.58, reduce ? 18 : 36, reduce ? 18 : 36]} />
          <meshBasicMaterial color="#5ec8ff" wireframe transparent opacity={0.28} />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.72, 24, 24]} />
          <meshBasicMaterial color="#E1306C" wireframe transparent opacity={0.08} />
        </mesh>
        {meridians.map((pts, i) => (
          <Line
            key={i}
            points={pts}
            color={i % 2 === 0 ? "#E1306C" : "#1877F2"}
            lineWidth={1}
            transparent
            opacity={0.42}
          />
        ))}
        {Array.from({ length: reduce ? 16 : 28 }).map((_, i) => {
          const a = (i / 28) * Math.PI * 2;
          const b = ((i * 5) % 28) / 28 * Math.PI;
          return (
            <mesh
              key={`city-${i}`}
              position={[
                Math.sin(b) * Math.cos(a) * 2.56,
                Math.cos(b) * 2.56,
                Math.sin(b) * Math.sin(a) * 2.56,
              ]}
            >
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial
                color={i % 2 ? "#1877F2" : "#E1306C"}
                emissive={i % 2 ? "#1877F2" : "#E1306C"}
                emissiveIntensity={1.6}
              />
            </mesh>
          );
        })}
        <pointLight intensity={1.2} distance={8} color="#4fc3f7" />
      </group>

      {/* orbital rings */}
      <group ref={ringA}>
        <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
          <torusGeometry args={[3.4, 0.018, 8, 96]} />
          <meshBasicMaterial color="#E1306C" transparent opacity={0.35} />
        </mesh>
      </group>
      <group ref={ringB}>
        <mesh rotation={[0.9, 0.4, 0.2]}>
          <torusGeometry args={[3.95, 0.014, 8, 96]} />
          <meshBasicMaterial color="#1877F2" transparent opacity={0.3} />
        </mesh>
      </group>
      <group ref={ringC}>
        <mesh rotation={[1.4, -0.3, 0.5]}>
          <torusGeometry args={[4.55, 0.012, 8, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
        </mesh>
      </group>

      {/* logos orbiting the world */}
      {satellites.map((s, i) => (
        <group
          key={`sat-${i}`}
          ref={(el) => {
            if (el) satRefs.current[i] = el;
          }}
        >
          <IconMesh kind={s.kind} scale={s.scale} />
          <pointLight intensity={0.45} distance={2.2} color={BRAND[s.kind]} />
        </group>
      ))}

      {/* crystal / fragment pieces spinning from the world */}
      <group ref={debris}>
        {shards.map((s, i) => (
          <mesh
            key={`shard-${i}`}
            ref={(el) => {
              if (el) shardRefs.current[i] = el;
            }}
          >
            {i % 3 === 0 ? (
              <octahedronGeometry args={[s.size, 0]} />
            ) : i % 3 === 1 ? (
              <tetrahedronGeometry args={[s.size * 1.1, 0]} />
            ) : (
              <icosahedronGeometry args={[s.size * 0.9, 0]} />
            )}
            <meshStandardMaterial
              color={BRAND[s.kind]}
              emissive={BRAND[s.kind]}
              emissiveIntensity={0.85}
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Extra IG ↔ FB merge pair in foreground */
function MetaMerge({ reduce }: { reduce: boolean }) {
  const root = useRef<THREE.Group>(null);
  const ig = useRef<THREE.Group>(null);
  const fb = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = (Math.sin(t * 1.15) + 1) / 2;
    const dist = THREE.MathUtils.lerp(1.2, 0.48, pulse);
    if (ig.current) {
      ig.current.position.set(-dist, Math.sin(t * 0.9) * 0.12, 0);
      ig.current.rotation.y = t * 0.7;
    }
    if (fb.current) {
      fb.current.position.set(dist, Math.cos(t * 0.9) * 0.12, 0);
      fb.current.rotation.y = -t * 0.65;
    }
    if (root.current) {
      root.current.position.y = 0.85 + Math.sin(t * 0.35) * 0.12;
      root.current.rotation.z = Math.sin(t * 0.2) * 0.04;
    }
  });

  return (
    <group ref={root} position={[-2.4, 0.5, -0.6]}>
      <group ref={ig}>
        <IconMesh kind="ig" scale={reduce ? 1.05 : 1.25} />
        <pointLight intensity={1} distance={3} color="#E1306C" />
      </group>
      <group ref={fb}>
        <IconMesh kind="fb" scale={reduce ? 1 : 1.2} />
        <pointLight intensity={1} distance={3} color="#1877F2" />
      </group>
      <mesh>
        <torusGeometry args={[1.4, 0.012, 8, 64]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

function RisingAsh({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const speeds = useRef<Float32Array>(new Float32Array(count));
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = -7 + Math.random() * 14;
      arr[i * 3 + 2] = -1 - Math.random() * 11;
      speeds.current[i] = 0.4 + Math.random() * 1.1;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds.current[i] * dt;
      if (arr[i * 3 + 1] > 7) {
        arr[i * 3 + 1] = -7;
        arr[i * 3] = (Math.random() - 0.5) * 18;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#b8d4ff" size={0.032} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function CyberGridFloor() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.z += dt * 0.5;
    if (ref.current.position.z > 1.2) ref.current.position.z = 0;
  });
  const lines = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    for (let i = -9; i <= 9; i++) {
      out.push([new THREE.Vector3(i * 0.7, -3.55, -9), new THREE.Vector3(i * 0.7, -3.55, 2.5)]);
      out.push([new THREE.Vector3(-7, -3.55, i * 0.7 - 3), new THREE.Vector3(7, -3.55, i * 0.7 - 3)]);
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
          opacity={0.12}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

function seedBodies(reduce: boolean): Body[] {
  const n = reduce ? 16 : 34;
  return Array.from({ length: n }, (_, i) => {
    const kind: Kind = i % 2 === 0 ? "ig" : "fb";
    const baseScale = 0.72 + (i % 5) * 0.14;
    return {
      kind,
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        -7 + Math.random() * 3,
        -1.2 - Math.random() * 7
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.45,
        0.65 + Math.random() * 1.05,
        (Math.random() - 0.5) * 0.2
      ),
      scale: baseScale,
      baseScale,
      spin: (Math.random() - 0.5) * 1.8,
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
      b.scale = b.baseScale * (0.88 + 0.12 * Math.sin(performance.now() * 0.001 + i));
      if (b.pos.y > 7.2) {
        b.pos.y = -7.2;
        b.pos.x = (Math.random() - 0.5) * 14;
        b.pos.z = -1.2 - Math.random() * 7;
      }
      if (Math.abs(b.pos.x) > 8) b.vel.x *= -1;
    }

    for (let i = 0; i < bodies.current.length; i++) {
      for (let j = i + 1; j < bodies.current.length; j++) {
        const a = bodies.current[i];
        const b = bodies.current[j];
        const dx = a.pos.x - b.pos.x;
        const dy = a.pos.y - b.pos.y;
        const dz = a.pos.z - b.pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const min = 0.7 * ((a.scale + b.scale) * 0.55);
        if (dist > 0.001 && dist < min) {
          const nx = dx / dist;
          const ny = dy / dist;
          const push = (min - dist) * 0.4;
          a.pos.x += nx * push;
          a.pos.y += ny * push;
          b.pos.x -= nx * push;
          b.pos.y -= ny * push;
        }
      }
    }

    meshes.current.forEach((m, i) => {
      const b = bodies.current[i];
      if (!m || !b) return;
      m.position.copy(b.pos);
      m.scale.setScalar(b.scale);
      m.rotation.y += clamped * b.spin;
      m.rotation.x += clamped * 0.18;
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
          {i % 3 === 0 ? (
            <pointLight intensity={0.3} distance={2.2} color={BRAND[b.kind]} />
          ) : null}
        </group>
      ))}
    </group>
  );
}

function NetworkLinks({ reduce }: { reduce: boolean }) {
  const points = useMemo(() => {
    const n = reduce ? 5 : 10;
    const arr: THREE.Vector3[][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      arr.push([
        new THREE.Vector3(Math.cos(a) * 1.2, Math.sin(a) * 0.8 - 0.2, -1.5),
        new THREE.Vector3(Math.cos(a + 1.1) * 4.2, Math.sin(a + 0.5) * 2.6 + 0.4, -5.2),
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
      const p = (t * 0.2 + i * 0.09) % 1;
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
          opacity={0.26}
        />
      ))}
      {points.map((_, i) => (
        <mesh
          key={`d-${i}`}
          ref={(el) => {
            if (el) dots.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.032, 10, 10]} />
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
        x: (e.clientX / window.innerWidth - 0.5) * 0.3,
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
    const ty = Math.min(scroll.current * 0.0014, 3.2);
    root.current.position.y += (ty - root.current.position.y) * 0.045;
  });

  return (
    <group ref={root}>
      <fog attach="fog" args={["#000008", 9, 26]} />
      <ambientLight intensity={0.38} color="#cfe0ff" />
      <directionalLight position={[5, 7, 4]} intensity={1.15} color="#ffffff" />
      <directionalLight position={[-5, 2, 2]} intensity={0.55} color="#E1306C" />
      <directionalLight position={[4, -1, 3]} intensity={0.45} color="#1877F2" />
      <pointLight position={[0, -1.5, 2]} intensity={0.65} color="#6ec6ff" distance={16} />
      <CyberGridFloor />
      <WorldCore reduce={reduce} />
      <MetaMerge reduce={reduce} />
      <RisingAsh count={reduce ? 60 : 190} />
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
        dpr={reduce ? [1, 1.15] : [1, 1.7]}
        camera={{ position: [0, 0.35, 9.4], fov: 42 }}
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
