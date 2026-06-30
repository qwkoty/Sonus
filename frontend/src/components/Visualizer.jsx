import { useEffect, useRef } from 'react';

export default function Visualizer({ isPlaying }) {
  const canvasRef = useRef(null);
  const barsRef = useRef(Array.from({ length: 32 }, () => Math.random() * 20));
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * 2;
      h = canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const bars = barsRef.current;
      const barW = w / bars.length;
      const gap = barW * 0.35;

      for (let i = 0; i < bars.length; i++) {
        if (isPlaying) {
          bars[i] += (Math.random() - 0.5) * 10;
          bars[i] = Math.max(4, Math.min(h * 0.45, bars[i]));
        } else {
          bars[i] += (4 - bars[i]) * 0.05;
        }

        const x = i * barW + gap / 2;
        const bh = bars[i];
        const y = (h - bh) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + bh);
        gradient.addColorStop(0, 'rgba(201,148,62,0.1)');
        gradient.addColorStop(0.5, 'rgba(201,148,62,0.6)');
        gradient.addColorStop(1, 'rgba(201,148,62,0.1)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barW - gap, bh, 4);
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
        height: 60,
        opacity: 0.9,
      }}
    />
  );
}
