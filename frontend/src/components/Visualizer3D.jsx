import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getSpectrumBars } from '../audio/engine';

export default function Visualizer3D({ isPlaying }) {
  const mountRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.offsetWidth;
    const H = mount.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 4, 7);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const light1 = new THREE.PointLight(0x6699ff, 1.5, 30);
    light1.position.set(4, 8, 4);
    scene.add(light1);
    const light2 = new THREE.PointLight(0xff6688, 0.6, 30);
    light2.position.set(-4, 6, -4);
    scene.add(light2);
    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 10, 2);
    scene.add(topLight);

    // ---- 4 圈同心圆柱，柱子宽度=间距，完全贴合 ----
    const RINGS = [
      { count: 16, radius: 0.9, maxH: 2.8, freqRange: [0,  12] },
      { count: 24, radius: 1.7, maxH: 2.0, freqRange: [12, 28] },
      { count: 32, radius: 2.5, maxH: 1.5, freqRange: [28, 48] },
      { count: 40, radius: 3.3, maxH: 1.0, freqRange: [48, 72] },
    ];

    const allBars = [];
    const barGroup = new THREE.Group();
    scene.add(barGroup);

    for (let r = 0; r < RINGS.length; r++) {
      const ring = RINGS[r];
      // 柱子宽度 = 弧长间距，让柱子完全贴合
      const arcLen = (2 * Math.PI * ring.radius) / ring.count;
      const barW = arcLen * 1.0; // 完全贴合，无间隙

      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2;
        const geo = new THREE.BoxGeometry(barW, 1, barW);
        geo.translate(0, 0.5, 0);

        // 颜色渐变：内圈暖白，外圈冷蓝
        const t = r / (RINGS.length - 1);
        const hue = 0.58 - t * 0.08;
        const sat = 0.4 + t * 0.3;
        const lit = 0.6 - t * 0.1;
        const color = new THREE.Color().setHSL(hue, sat, lit);

        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.2,
          metalness: 0.7,
          transparent: true,
          opacity: 0.85,
          emissive: color,
          emissiveIntensity: 0.3,
        });

        const bar = new THREE.Mesh(geo, mat);
        bar.position.set(Math.cos(angle) * ring.radius, 0, Math.sin(angle) * ring.radius);
        bar.lookAt(0, 0, 0);
        barGroup.add(bar);
        allBars.push({ mesh: bar, ring: r, idx: i, smooth: 0, ringData: ring });
      }
    }

    // 地面光环
    for (let i = 0; i < 4; i++) {
      const r = 0.9 + i * 0.8;
      const ringGeo = new THREE.RingGeometry(r - 0.015, r + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x3366aa,
        transparent: true,
        opacity: 0.05 - i * 0.008,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      scene.add(ringMesh);
    }

    const clock = new THREE.Clock();
    const TOTAL_BARS = 72;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const { data: spectrum, hasData } = getSpectrumBars(TOTAL_BARS);

      let bassEnergy = 0;
      if (hasData) {
        for (let i = 0; i < 6; i++) bassEnergy += spectrum[i] || 0;
        bassEnergy /= 6;
      } else {
        bassEnergy = (Math.sin(elapsed * 1.5) * 0.5 + 0.5) * 0.1;
      }

      for (const bar of allBars) {
        const ring = bar.ringData;
        const [fStart, fEnd] = ring.freqRange;

        let value;
        if (hasData) {
          const freqIdx = Math.floor(fStart + (bar.idx / ring.count) * (fEnd - fStart));
          value = spectrum[Math.min(freqIdx, TOTAL_BARS - 1)] || 0;
        } else {
          const wave = Math.sin(bar.idx * 0.3 + elapsed * (2 + bar.ring * 0.5)) * 0.5 + 0.5;
          value = wave * 0.12 * (1 - bar.ring * 0.12);
        }

        // Attack fast, release slow
        if (value > bar.smooth) {
          bar.smooth += (value - bar.smooth) * 0.45;
        } else {
          bar.smooth += (value - bar.smooth) * 0.08;
        }

        const v = Math.max(0.02, bar.smooth);
        bar.mesh.scale.y = v * ring.maxH;
        bar.mesh.material.opacity = 0.35 + v * 0.65;
        bar.mesh.material.emissiveIntensity = 0.1 + v * 1.5;
      }

      barGroup.rotation.y = elapsed * 0.12;

      camera.position.x = Math.sin(elapsed * 0.1) * 1.5;
      camera.position.z = 6.5 + Math.cos(elapsed * 0.08) * 1.0;
      camera.position.y = 3.5 + Math.sin(elapsed * 0.15) * 0.5;
      camera.lookAt(0, 0.8, 0);

      light1.intensity = 0.7 + bassEnergy * 2.5;
      light2.intensity = 0.3 + bassEnergy * 1.5;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const nw = mount.offsetWidth;
      const nh = mount.offsetHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
      }}
    />
  );
}
