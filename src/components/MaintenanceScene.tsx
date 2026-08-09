"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  remainingMs: number;
  message: string;
  until: string | null;
};

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MaintenanceScene({ remainingMs, message, until }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const remainingRef = useRef(remainingMs);

  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  useEffect(() => {
    const el = countdownRef.current;
    if (!el) return;
    el.textContent = formatCountdown(remainingRef.current);
    const id = window.setInterval(() => {
      remainingRef.current = Math.max(0, remainingRef.current - 1000);
      el.textContent = formatCountdown(remainingRef.current);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070d, 0.035);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0.4, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.55);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 3);
    const rim = new THREE.PointLight(0x7dd3fc, 1.4, 30);
    rim.position.set(-4, -1, 2);
    scene.add(amb, key, rim);

    const group = new THREE.Group();
    scene.add(group);

    const mats = [
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.55, roughness: 0.28 }),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.4, roughness: 0.35 }),
      new THREE.MeshStandardMaterial({ color: 0xa1a1aa, metalness: 0.65, roughness: 0.22 }),
    ];

    const geos = [
      new THREE.IcosahedronGeometry(0.55, 0),
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.TetrahedronGeometry(0.6, 0),
      new THREE.BoxGeometry(0.7, 0.7, 0.7),
      new THREE.TorusGeometry(0.42, 0.14, 12, 36),
      new THREE.DodecahedronGeometry(0.48, 0),
    ];

    const meshes: THREE.Mesh[] = [];
    for (let i = 0; i < 18; i++) {
      const geo = geos[i % geos.length];
      const mat = mats[i % mats.length].clone();
      const mesh = new THREE.Mesh(geo, mat);
      const a = (i / 18) * Math.PI * 2;
      const r = 2.2 + (i % 4) * 0.35;
      mesh.position.set(Math.cos(a) * r, Math.sin(a * 1.7) * 1.1, Math.sin(a) * r * 0.55);
      mesh.rotation.set(a, a * 0.5, a * 0.25);
      mesh.userData = { speed: 0.2 + (i % 5) * 0.08, phase: a };
      group.add(mesh);
      meshes.push(mesh);
    }

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.1, 0.035, 12, 100),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.55 }),
    );
    ring.rotation.x = Math.PI / 2.4;
    group.add(ring);

    const resize = () => {
      if (!mount) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    window.addEventListener("resize", resize);

    const t0 = performance.now();
    const tick = (now: number) => {
      if (disposed) return;
      const t = (now - t0) / 1000;
      group.rotation.y = t * 0.18;
      group.rotation.x = Math.sin(t * 0.25) * 0.12;
      ring.rotation.z = t * 0.35;
      for (const mesh of meshes) {
        const { speed, phase } = mesh.userData as { speed: number; phase: number };
        mesh.rotation.x += 0.008 * speed;
        mesh.rotation.y += 0.01 * speed;
        mesh.position.y += Math.sin(t * speed + phase) * 0.002;
      }
      camera.position.x = Math.sin(t * 0.15) * 0.35;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      for (const mesh of meshes) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      for (const g of geos) g.dispose();
      for (const m of mats) m.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  const untilLabel = until
    ? new Date(until).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="maint-root" role="alertdialog" aria-modal="true" aria-label="Bakım modu">
      <div className="maint-canvas" ref={mountRef} aria-hidden />
      <div className="maint-veil" aria-hidden />
      <div className="maint-content">
        <p className="maint-brand">TOLWEX</p>
        <h1 className="maint-title">3D Bakım Modu</h1>
        <p className="maint-msg">{message}</p>
        <div className="maint-timer" ref={countdownRef} aria-live="polite">
          {formatCountdown(remainingMs)}
        </div>
        <p className="maint-hint">Tahmini kalan süre</p>
        {untilLabel ? <p className="maint-until">Bitiş: {untilLabel}</p> : null}
      </div>
    </div>
  );
}
