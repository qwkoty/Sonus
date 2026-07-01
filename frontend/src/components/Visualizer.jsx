import { useEffect, useRef } from 'react';
import { readFrequencyDataLog } from '../audio/engine';

export default function Visualizer({ isPlaying, coverRadius = 80 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const smoothRef = useRef(null); // 平滑数据
  const rotationRef = useRef(0);

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

    const BARS = 80;
    if (!smoothRef.current || smoothRef.current.length !== BARS) {
      smoothRef.current = new Float32Array(BARS);
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const INNER_R = coverRadius * dpr;
      const MAX_BAR_LEN = Math.min(w, h) / 2 - INNER_R - 4 * dpr;
      if (MAX_BAR_LEN < 4) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const { data: freqData, hasData } = readFrequencyDataLog(BARS);
      const smooth = smoothRef.current;
      const t = Date.now() * 0.001;

      rotationRef.current += hasData ? 0.15 : 0.3;

      // 绘制三层环，模拟 3D 深度
      const LAYERS = [
        { scale: 1.0, alpha: 1.0, offset: 0 },
        { scale: 0.78, alpha: 0.4, offset: 0.5 },
        { scale: 0.58, alpha: 0.18, offset: 1.0 },
      ];

      for (const layer of LAYERS) {
        const layerR = INNER_R * layer.scale;
        const layerMaxLen = MAX_BAR_LEN * layer.scale;
        const rotOffset = rotationRef.current * layer.offset * 0.01;

        for (let i = 0; i < BARS; i++) {
          const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2 + rotOffset;

          let value;
          if (hasData) {
            value = freqData[i] || 0;
          } else {
            // 待机动画
            const wave1 = Math.sin(i * 0.25 + t * 2.0) * 0.5 + 0.5;
            const wave2 = Math.sin(i * 0.13 + t * 1.1) * 0.3 + 0.5;
            value = wave1 * wave2 * 0.5;
          }

          // 平滑插值
          smooth[i] += (value - smooth[i]) * 0.25;
          const v = smooth[i];

          const barLen = Math.max(1.5 * dpr, v * layerMaxLen);
          const x1 = cx + Math.cos(angle) * layerR;
          const y1 = cy + Math.sin(angle) * layerR;
          const x2 = cx + Math.cos(angle) * (layerR + barLen);
          const y2 = cy + Math.sin(angle) * (layerR + barLen);

          // 渐变透明度：根部暗，尖端亮
          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          const baseAlpha = layer.alpha * (0.1 + v * 0.2);
          const tipAlpha = layer.alpha * (0.3 + v * 0.7);
          grad.addColorStop(0, `rgba(255,255,255,${baseAlpha})`);
          grad.addColorStop(1, `rgba(255,255,255,${tipAlpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = (2.5 * layer.scale) * dpr;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // 最外层尖端发光
          if (layer.scale === 1.0 && hasData && v > 0.35) {
            ctx.fillStyle = `rgba(255,255,255,${v * 0.5})`;
            ctx.beginPath();
            ctx.arc(x2, y2, 1.5 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 内圈描边
        ctx.strokeStyle = `rgba(255,255,255,${0.04 * layer.alpha})`;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, layerR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 中心脉冲圈
      const avgEnergy = hasData
        ? freqData.reduce((a, b) => a + b, 0) / BARS
        : (Math.sin(t * 1.5) * 0.5 + 0.5) * 0.15;
      const pulseR = INNER_R - 3 * dpr + avgEnergy * 8 * dpr;
      ctx.strokeStyle = `rgba(255,255,255,${0.06 + avgEnergy * 0.15})`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
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
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 2,
      perspective: '600px',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: 'rotateX(8deg)',
        }}
      />
    </div>
  );
}
