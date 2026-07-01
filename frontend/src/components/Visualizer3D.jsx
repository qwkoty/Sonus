import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getSpectrumBars } from '../audio/engine';

const PARTICLE_COUNT = 4000;
const NUM_BARS = 64;
const BASE_RADIUS = 42;

// 3D 粒子星球：球面粒子随频谱呼吸位移，加色混合辉光，自动旋转
export default function Visualizer3D({ coverRadius = 80 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = container.offsetWidth;
    const H = container.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(80, W / H, 0.1, 1000);
    camera.position.z = 130;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(dpr);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Fibonacci 球面分布
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const original = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const barIdxMap = new Int32Array(PARTICLE_COUNT);

    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      original[i * 3] = x * BASE_RADIUS;
      original[i * 3 + 1] = y * BASE_RADIUS;
      original[i * 3 + 2] = z * BASE_RADIUS;
      positions[i * 3] = x * BASE_RADIUS;
      positions[i * 3 + 1] = y * BASE_RADIUS;
      positions[i * 3 + 2] = z * BASE_RADIUS;

      // 颜色：从青蓝到暖白，按纬度渐变
      const t = (y + 1) / 2;
      colors[i * 3] = 0.25 + t * 0.75;
      colors[i * 3 + 1] = 0.75 + t * 0.25;
      colors[i * 3 + 2] = 1.0;

      barIdxMap[i] = Math.floor(Math.random() * NUM_BARS);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 内层光晕球（半透明，营造体积感）
    const haloGeo = new THREE.SphereGeometry(BASE_RADIUS * 0.55, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x1a2a4a,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    scene.add(halo);

    let raf;
    const posAttr = geometry.attributes.position;
    const colorAttr = geometry.attributes.color;

    const animate = () => {
      const { data, hasData } = getSpectrumBars(NUM_BARS);

      // 低频能量驱动呼吸
      let bass = 0;
      if (hasData) {
        for (let i = 0; i < 8; i++) bass += data[i];
        bass /= 8;
      } else {
        bass = 0.08 + Math.sin(Date.now() * 0.001) * 0.04;
      }
      const breathe = 1 + bass * 0.18;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const bi = barIdxMap[i];
        const value = hasData
          ? data[bi]
          : 0.08 + Math.sin(Date.now() * 0.002 + i * 0.012) * 0.05;
        const disp = 1 + value * 0.4;

        const ox = original[i * 3];
        const oy = original[i * 3 + 1];
        const oz = original[i * 3 + 2];

        posAttr.array[i * 3] = ox * disp * breathe;
        posAttr.array[i * 3 + 1] = oy * disp * breathe;
        posAttr.array[i * 3 + 2] = oz * disp * breathe;

        // 颜色亮度随位移变化
        const intensity = 0.35 + value * 0.65;
        const t = (oy / BASE_RADIUS + 1) / 2;
        colorAttr.array[i * 3] = (0.25 + t * 0.75) * intensity;
        colorAttr.array[i * 3 + 1] = (0.75 + t * 0.25) * intensity;
        colorAttr.array[i * 3 + 2] = 1.0 * intensity;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // 自动旋转
      points.rotation.y += 0.003;
      points.rotation.x += 0.0008;
      halo.rotation.y -= 0.001;
      halo.scale.setScalar(breathe);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const nw = container.offsetWidth;
      const nh = container.offsetHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [coverRadius]);

  return (
    <div
      ref={containerRef}
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
