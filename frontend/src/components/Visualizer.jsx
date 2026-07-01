import { useEffect, useRef } from 'react';
import { readFrequencyData } from '../audio/engine';

export default function Visualizer({ isPlaying }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      let freqData = readFrequencyData();
      const hasData = freqData.length > 0 && isPlaying;

      if (!hasData) {
        freqData = new Uint8Array(64).map((_, i) =>
          Math.max(3, Math.sin(i * 0.25 + Date.now() * 0.002) * 8 + 8)
        );
      }

      const bars = 48;
      const step = Math.floor(freqData.length / bars);
      const barW = (w / bars) * 0.55;
      const gap = (w / bars) * 0.45;
      const maxH = h * 0.9;

      for (let i = 0; i < bars; i++) {
        const idx = Math.min(i * step, freqData.length - 1);
        const raw = freqData[idx] || 0;
        const normalized = raw / 255;

        // 中间高两边低
        const centerDist = Math.abs(i - bars / 2) / (bars / 2);
        const envelope = 1 - centerDist * 0.5;

        const bh = Math.max(2, normalized * maxH * envelope * (hasData ? 1.2 : 0.7));
        const x = i * (barW + gap) + (w - bars * (barW + gap)) / 2 + gap / 2;
        const y = (h - bh) / 2;

        const alpha = 0.15 + normalized * 0.85;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, bh, barW / 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
}
