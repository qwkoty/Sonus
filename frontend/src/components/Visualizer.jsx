import { useEffect, useRef } from 'react';
import { getSpectrumBars, readTimeDomainData } from '../audio/engine';

const NUM_BARS = 64;

export default function Visualizer({ isPlaying, coverRadius = 80, mode = 'ring' }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const smoothRef = useRef(new Float32Array(NUM_BARS));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, cx, cy, dpr;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
      cx = w / 2;
      cy = h / 2;
    };
    resize();
    window.addEventListener('resize', resize);

    // ---- 模式：连续闭合环形频谱 ----
    // 用 Catmull-Rom 风格的平滑插值把所有频谱点连成一条闭合曲线
    // 外层 = 主曲线（分色辉光），内层 = 镜像反射
    const drawRing = (spectrum, hasData) => {
      const data = spectrum;
      const INNER_R = coverRadius * dpr;
      const MAX_BAR = Math.min(w, h) * 0.30;

      // 平滑过渡：每帧向目标值靠拢，消除抖动
      const smooth = smoothRef.current;
      const smoothFactor = 0.35;
      for (let i = 0; i < NUM_BARS; i++) {
        smooth[i] += (data[i] - smooth[i]) * smoothFactor;
      }

      // 计算每个点的坐标（外层 + 内层镜像）
      const outerPts = [];
      const innerPts = [];
      for (let i = 0; i < NUM_BARS; i++) {
        const angle = (i / NUM_BARS) * Math.PI * 2 - Math.PI / 2;
        const value = hasData ? smooth[i] : 0.04;
        const barLen = Math.max(1, value * MAX_BAR * (hasData ? 1.2 : 0.4));

        outerPts.push({
          x: cx + Math.cos(angle) * (INNER_R + barLen),
          y: cy + Math.sin(angle) * (INNER_R + barLen),
          hue: 200 - (i / NUM_BARS) * 170,
          value,
        });
        innerPts.push({
          x: cx + Math.cos(angle) * (INNER_R - barLen * 0.5),
          y: cy + Math.sin(angle) * (INNER_R - barLen * 0.5),
        });
      }

      // 绘制平滑闭合曲线（3 层辉光：外光晕 → 中层 → 亮芯）
      const drawSmoothLoop = (pts, lineWidth, alpha, useGradient) => {
        if (pts.length < 3) return;
        ctx.beginPath();
        // 用二次贝塞尔在相邻点中点处过渡，形成平滑闭合曲线
        const midX = (pts[0].x + pts[pts.length - 1].x) / 2;
        const midY = (pts[0].y + pts[pts.length - 1].y) / 2;
        ctx.moveTo(midX, midY);
        for (let i = 0; i < pts.length; i++) {
          const next = pts[(i + 1) % pts.length];
          const mx = (pts[i].x + next.x) / 2;
          const my = (pts[i].y + next.y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.closePath();

        if (useGradient) {
          // 按频率分色的渐变描边
          const grad = ctx.createLinearGradient(cx - INNER_R, cy, cx + INNER_R, cy);
          grad.addColorStop(0, `hsla(30, 90%, 65%, ${alpha})`);
          grad.addColorStop(0.5, `hsla(200, 90%, 65%, ${alpha})`);
          grad.addColorStop(1, `hsla(320, 90%, 65%, ${alpha})`);
          ctx.strokeStyle = grad;
        } else {
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        }
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      };

      // 镜像反射层（向内，暗色）
      drawSmoothLoop(innerPts, 1.5 * dpr, 0.12, true);

      // 3 层辉光
      drawSmoothLoop(outerPts, 8 * dpr, 0.06, true);  // 外光晕
      drawSmoothLoop(outerPts, 4 * dpr, 0.15, true);  // 中层
      drawSmoothLoop(outerPts, 2 * dpr, 0.85, true);  // 亮芯

      // 高能量点：额外亮点
      if (hasData) {
        for (const pt of outerPts) {
          if (pt.value > 0.4) {
            ctx.fillStyle = `hsla(${pt.hue}, 100%, 80%, ${pt.value * 0.7})`;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    // ---- 模式：波形示波器 ----
    const drawWave = () => {
      const wave = readTimeDomainData();
      const hasData = wave.length > 0 && isPlaying;
      const midY = cy;
      const amp = h * 0.32;

      const layers = [
        { width: 6 * dpr, alpha: 0.08, color: '#4FC3F7' },
        { width: 3.5 * dpr, alpha: 0.18, color: '#4FC3F7' },
        { width: 2 * dpr, alpha: 0.9, color: '#fff' },
      ];

      for (const layer of layers) {
        ctx.strokeStyle = layer.color;
        ctx.globalAlpha = layer.alpha;
        ctx.lineWidth = layer.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        if (hasData && wave.length > 0) {
          const step = wave.length / w;
          for (let x = 0; x < w; x++) {
            const idx = Math.floor(x * step);
            const v = (wave[idx] - 128) / 128;
            const y = midY + v * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        } else {
          const t = Date.now() * 0.002;
          for (let x = 0; x < w; x++) {
            const y = midY + Math.sin(x * 0.02 + t) * amp * 0.12;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    // ---- 主循环 ----
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const { data, hasData } = getSpectrumBars(NUM_BARS);

      if (mode === 'wave') {
        drawWave();
      } else {
        drawRing(data, hasData);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // 重置平滑缓冲
    smoothRef.current.fill(0);

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, coverRadius, mode]);

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
