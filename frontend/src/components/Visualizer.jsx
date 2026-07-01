import { useEffect, useRef } from 'react';
import { getSpectrumBars } from '../audio/engine';

export default function Visualizer({ isPlaying, coverRadius = 80 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, cx, cy;

    // 性能：2D 可视化不需要 retina 2x，1.5x 足够且大幅减少像素填充
    const DPR_CAP = 1.5;
    let dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      w = canvas.width = Math.floor(canvas.offsetWidth * dpr);
      h = canvas.height = Math.floor(canvas.offsetHeight * dpr);
      cx = w / 2;
      cy = h / 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const BARS = 96;
    const SPECTRUM = 64;
    const SMOOTH = new Float32Array(BARS);
    const VALUES = new Float32Array(BARS);
    const OUTER = new Array(BARS);
    const INNER = new Array(BARS);
    for (let i = 0; i < BARS; i++) {
      OUTER[i] = { x: 0, y: 0 };
      INNER[i] = { x: 0, y: 0 };
    }

    // Catmull-Rom 样条插值
    function catmullRom(p0, p1, p2, p3, t) {
      const t2 = t * t;
      const t3 = t2 * t;
      return {
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      };
    }

    function smoothPath(pts) {
      const steps = 3;
      for (let i = 0; i < BARS; i++) {
        const p0 = pts[(i - 1 + BARS) % BARS];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % BARS];
        const p3 = pts[(i + 2) % BARS];
        for (let s = 0; s < steps; s++) {
          const pt = catmullRom(p0, p1, p2, p3, s / steps);
          if (i === 0 && s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.closePath();
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const INNER_R = coverRadius * dpr;
      const MAX_BAR_LEN = Math.min(w, h) / 2 - INNER_R - 4 * dpr;
      if (MAX_BAR_LEN < 16) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      const BASE_RING = 10 * dpr;
      const AUDIO_LEN = Math.max(0, MAX_BAR_LEN - BASE_RING);

      const { data: spectrum, hasData } = getSpectrumBars(SPECTRUM);
      const t = Date.now() * 0.001;

      // 插值到 BARS 个点
      let totalEnergy = 0;
      for (let i = 0; i < BARS; i++) {
        const ratio = (i / BARS) * SPECTRUM;
        const idx = Math.floor(ratio);
        const frac = ratio - idx;
        const idx2 = Math.min(idx + 1, SPECTRUM - 1);
        let rawVal;
        if (hasData) {
          rawVal = (spectrum[idx] || 0) * (1 - frac) + (spectrum[idx2] || 0) * frac;
        } else {
          const wave1 = Math.sin(i * 0.18 + t * 1.6) * 0.5 + 0.5;
          const wave2 = Math.sin(i * 0.1 + t * 0.9) * 0.3 + 0.5;
          rawVal = wave1 * wave2 * 0.38;
        }
        const prev = SMOOTH[i];
        SMOOTH[i] += (rawVal - prev) * (rawVal > prev ? 0.5 : 0.12);
        VALUES[i] = SMOOTH[i];
        totalEnergy += rawVal;
      }

      // 计算内外轮廓点
      for (let i = 0; i < BARS; i++) {
        const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;
        const v = VALUES[i];
        const outerR = INNER_R + BASE_RING + v * AUDIO_LEN;
        OUTER[i].x = cx + Math.cos(angle) * outerR;
        OUTER[i].y = cy + Math.sin(angle) * outerR;
        INNER[i].x = cx + Math.cos(angle) * INNER_R;
        INNER[i].y = cy + Math.sin(angle) * INNER_R;
      }

      // ---- 底层音浪圆盘 ----
      ctx.save();
      const baseGrad = ctx.createRadialGradient(
        cx, cy, INNER_R,
        cx, cy, INNER_R + BASE_RING + AUDIO_LEN * 0.6
      );
      baseGrad.addColorStop(0, 'rgba(10,40,100,0.18)');
      baseGrad.addColorStop(0.5, 'rgba(25,80,180,0.28)');
      baseGrad.addColorStop(1, 'rgba(60,130,235,0.08)');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, INNER_R + BASE_RING, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ---- 外层光晕填充 ----
      ctx.save();
      ctx.shadowColor = 'rgba(80,160,255,0.45)';
      ctx.shadowBlur = 16 * dpr;
      ctx.beginPath();
      smoothPath(OUTER);
      for (let i = BARS - 1; i >= 0; i--) {
        ctx.lineTo(INNER[i].x, INNER[i].y);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, INNER_R, cx, cy, INNER_R + MAX_BAR_LEN);
      grad.addColorStop(0, 'rgba(20,60,150,0.22)');
      grad.addColorStop(0.35, 'rgba(50,120,235,0.42)');
      grad.addColorStop(0.75, 'rgba(120,190,255,0.65)');
      grad.addColorStop(1, 'rgba(255,255,255,0.92)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // ---- 外轮廓线 ----
      ctx.beginPath();
      smoothPath(OUTER);
      ctx.strokeStyle = 'rgba(140,210,255,0.85)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // ---- 高能量点（稀疏采样）----
      ctx.save();
      for (let i = 0; i < BARS; i += 2) {
        const v = VALUES[i];
        if (v > 0.35) {
          const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;
          const r = INNER_R + BASE_RING + v * AUDIO_LEN;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          ctx.shadowColor = `rgba(200,235,255,${v * 0.6})`;
          ctx.shadowBlur = 6 * dpr;
          ctx.fillStyle = `rgba(255,255,255,${v * 0.85})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.4 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // ---- 内圈呼吸光环 ----
      const avgEnergy = hasData ? totalEnergy / BARS : (Math.sin(t * 1.5) * 0.5 + 0.5) * 0.12;
      ctx.strokeStyle = `rgba(90,155,255,${0.08 + avgEnergy * 0.22})`;
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, INNER_R - 3 * dpr, 0, Math.PI * 2);
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, coverRadius]);

  return (
    <canvas
      ref={canvasRef}
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
