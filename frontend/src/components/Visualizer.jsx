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

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
      cx = w / 2;
      cy = h / 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const BARS = 96; // 更多点，更平滑
    const smooth = new Float32Array(BARS);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const INNER_R = coverRadius * dpr;
      const MAX_BAR_LEN = Math.min(w, h) / 2 - INNER_R - 4 * dpr;
      if (MAX_BAR_LEN < 4) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const { data: spectrum, hasData } = getSpectrumBars(BARS);
      const t = Date.now() * 0.001;

      // 计算每根柱子的值
      const values = new Float32Array(BARS);
      for (let i = 0; i < BARS; i++) {
        let value;
        if (hasData) {
          value = spectrum[i] || 0;
        } else {
          const wave1 = Math.sin(i * 0.18 + t * 1.8) * 0.5 + 0.5;
          const wave2 = Math.sin(i * 0.09 + t * 0.9) * 0.3 + 0.5;
          value = wave1 * wave2 * 0.2;
        }
        // Attack fast, release slow
        if (value > smooth[i]) {
          smooth[i] += (value - smooth[i]) * 0.5;
        } else {
          smooth[i] += (value - smooth[i]) * 0.1;
        }
        values[i] = smooth[i];
      }

      // 绘制连续填充的外环
      ctx.beginPath();
      // 先画外轮廓（柱子顶端连线）
      const outerPoints = [];
      for (let i = 0; i <= BARS; i++) {
        const idx = i % BARS;
        const angle = (idx / BARS) * Math.PI * 2 - Math.PI / 2;
        const v = values[idx];
        const r = INNER_R + Math.max(1.5 * dpr, v * MAX_BAR_LEN);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        outerPoints.push({ x, y });
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // 闭合回内圈
      for (let i = BARS; i >= 0; i--) {
        const idx = i % BARS;
        const angle = (idx / BARS) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * INNER_R;
        const y = cy + Math.sin(angle) * INNER_R;
        ctx.lineTo(x, y);
      }
      ctx.closePath();

      // 径向渐变填充：内圈暗蓝 -> 外圈亮白
      const grad = ctx.createRadialGradient(cx, cy, INNER_R, cx, cy, INNER_R + MAX_BAR_LEN);
      grad.addColorStop(0, 'rgba(40,80,180,0.15)');
      grad.addColorStop(0.5, 'rgba(80,150,255,0.25)');
      grad.addColorStop(1, 'rgba(255,255,255,0.5)');
      ctx.fillStyle = grad;
      ctx.fill();

      // 描边外轮廓
      ctx.beginPath();
      for (let i = 0; i <= BARS; i++) {
        const idx = i % BARS;
        const angle = (idx / BARS) * Math.PI * 2 - Math.PI / 2;
        const v = values[idx];
        const r = INNER_R + Math.max(1.5 * dpr, v * MAX_BAR_LEN);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(180,220,255,0.4)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // 高能量点发光
      for (let i = 0; i < BARS; i++) {
        const v = values[i];
        if (v > 0.3) {
          const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;
          const r = INNER_R + v * MAX_BAR_LEN;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          ctx.fillStyle = `rgba(255,255,255,${v * 0.6})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.5 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 内圈光环
      const avgEnergy = hasData
        ? spectrum.reduce((a, b) => a + b, 0) / BARS
        : (Math.sin(t * 1.5) * 0.5 + 0.5) * 0.08;
      ctx.strokeStyle = `rgba(80,140,255,${0.05 + avgEnergy * 0.15})`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, INNER_R - 2 * dpr, 0, Math.PI * 2);
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
