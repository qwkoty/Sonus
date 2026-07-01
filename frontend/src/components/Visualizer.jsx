import { useEffect, useRef } from 'react';
import { getSpectrumBars, readTimeDomainData } from '../audio/engine';

const NUM_BARS = 64;

export default function Visualizer({ isPlaying, coverRadius = 80, mode = 'ring' }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const waterfallRef = useRef([]);

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

    // ---- 模式：环形频谱（分色 + 镜像反射） ----
    const drawRing = (spectrum, hasData) => {
      const data = spectrum;
      const INNER_R = coverRadius * dpr;
      const MAX_BAR = Math.min(w, h) * 0.32;

      for (let i = 0; i < NUM_BARS; i++) {
        const angle = (i / NUM_BARS) * Math.PI * 2 - Math.PI / 2;
        const value = data[i] || 0;

        // 外侧条
        const barLen = Math.max(2, value * MAX_BAR * (hasData ? 1.15 : 0.5));
        const x1 = cx + Math.cos(angle) * INNER_R;
        const y1 = cy + Math.sin(angle) * INNER_R;
        const x2 = cx + Math.cos(angle) * (INNER_R + barLen);
        const y2 = cy + Math.sin(angle) * (INNER_R + barLen);

        // 按频率分色：低频暖橙 → 高频青蓝
        const hue = 200 - (i / NUM_BARS) * 170; // 200(青) → 30(橙)
        const alpha = 0.3 + value * 0.7;
        ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
        ctx.lineWidth = 2.5 * dpr;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 镜像反射（向内）
        const x3 = cx + Math.cos(angle) * (INNER_R - barLen * 0.45);
        const y3 = cy + Math.sin(angle) * (INNER_R - barLen * 0.45);
        ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha * 0.3})`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x3, y3);
        ctx.stroke();

        // 端点微光
        if (hasData && value > 0.35) {
          ctx.fillStyle = `hsla(${hue}, 90%, 75%, ${value * 0.6})`;
          ctx.beginPath();
          ctx.arc(x2, y2, 2.5 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // ---- 模式：波形示波器 ----
    const drawWave = () => {
      const wave = readTimeDomainData();
      const hasData = wave.length > 0 && isPlaying;
      const midY = cy;
      const amp = h * 0.32;

      // 多层辉光
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
          // 待机正弦波
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

    // ---- 模式：粒子流场 ----
    const drawParticles = (spectrum, hasData) => {
      const data = spectrum;
      const INNER_R = coverRadius * dpr * 0.8;

      // 生成新粒子
      if (isPlaying) {
        const spawnCount = hasData ? 3 : 1;
        for (let s = 0; s < spawnCount; s++) {
          const barIdx = Math.floor(Math.random() * NUM_BARS);
          const value = data[barIdx] || 0.1;
          const angle = (barIdx / NUM_BARS) * Math.PI * 2 - Math.PI / 2;
          const speed = (0.5 + value * 4) * dpr;
          const hue = 200 - (barIdx / NUM_BARS) * 170;

          particlesRef.current.push({
            x: cx + Math.cos(angle) * INNER_R,
            y: cy + Math.sin(angle) * INNER_R,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.008 + Math.random() * 0.012,
            size: (1.5 + value * 3) * dpr,
            hue,
          });
        }
      }

      // 限制粒子数
      if (particlesRef.current.length > 500) {
        particlesRef.current.splice(0, particlesRef.current.length - 500);
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.life * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // ---- 模式：频谱瀑布图（居中镜像 + 渐变 + 辉光） ----
    const drawWaterfall = (spectrum, hasData) => {
      const data = spectrum;
      const colWidth = w / NUM_BARS;
      const midY = cy;

      // 保存当前帧
      waterfallRef.current.push(Array.from(data));
      const MAX_HISTORY = 120;
      if (waterfallRef.current.length > MAX_HISTORY) waterfallRef.current.shift();

      const history = waterfallRef.current;
      const rowH = (h * 0.42) / MAX_HISTORY; // 上下各占 42%

      for (let row = 0; row < history.length; row++) {
        const rowData = history[row];
        // 越新的帧越靠近中心，越旧的越远（向外扩散）
        const ageRatio = row / history.length;
        const ageAlpha = Math.pow(1 - ageRatio, 0.6); // 缓慢衰减

        for (let i = 0; i < NUM_BARS; i++) {
          const value = rowData[i] || 0;
          if (value < 0.015) continue;

          const hue = 200 - (i / NUM_BARS) * 170;
          const x = i * colWidth;
          const barH = value * h * 0.38;

          // 上半部分（向上延伸）
          const yTop = midY - row * rowH - barH;
          // 下半部分（向下延伸，镜像）
          const yBot = midY + row * rowH;

          const alpha = value * ageAlpha;

          // 渐变填充 - 上半
          const gradTop = ctx.createLinearGradient(x, yTop, x, yTop + barH);
          gradTop.addColorStop(0, `hsla(${hue}, 90%, 70%, 0)`);
          gradTop.addColorStop(0.5, `hsla(${hue}, 85%, 60%, ${alpha * 0.7})`);
          gradTop.addColorStop(1, `hsla(${hue}, 90%, 65%, ${alpha})`);
          ctx.fillStyle = gradTop;
          ctx.fillRect(x, yTop, colWidth + 1, barH);

          // 渐变填充 - 下半（镜像）
          const gradBot = ctx.createLinearGradient(x, yBot, x, yBot + barH);
          gradBot.addColorStop(0, `hsla(${hue}, 90%, 65%, ${alpha})`);
          gradBot.addColorStop(0.5, `hsla(${hue}, 85%, 60%, ${alpha * 0.7})`);
          gradBot.addColorStop(1, `hsla(${hue}, 90%, 70%, 0)`);
          ctx.fillStyle = gradBot;
          ctx.fillRect(x, yBot, colWidth + 1, barH);
        }
      }

      // 中心辉光线
      const centerGrad = ctx.createLinearGradient(0, midY - 2, 0, midY + 2);
      centerGrad.addColorStop(0, 'rgba(255,255,255,0)');
      centerGrad.addColorStop(0.5, 'rgba(255,255,255,0.15)');
      centerGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, midY - 2, w, 4);
    };

    // ---- 主循环 ----
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const { data, hasData } = getSpectrumBars(NUM_BARS);

      switch (mode) {
        case 'wave':
          drawWave();
          break;
        case 'particles':
          ctx.clearRect(0, 0, w, h); // 粒子模式完全清除
          drawParticles(data, hasData);
          break;
        case 'waterfall':
          drawWaterfall(data, hasData);
          break;
        default:
          drawRing(data, hasData);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // 切换模式时清空状态
    particlesRef.current = [];
    waterfallRef.current = [];

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
