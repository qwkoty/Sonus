import { useState } from 'react';
import { Zap, Clock, Disc3 } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import SongItem from '../components/SongItem';

const moods = [
  { title: '深夜独白', cover: 'https://picsum.photos/seed/mood1/300/300', desc: '安静 / 氛围' },
  { title: '城市漫游', cover: 'https://picsum.photos/seed/mood2/300/300', desc: '节奏 / 电子' },
  { title: '晨间微光', cover: 'https://picsum.photos/seed/mood3/300/300', desc: '轻柔 / 治愈' },
  { title: '专注时刻', cover: 'https://picsum.photos/seed/mood4/300/300', desc: '低保真 / 沉浸' },
];

const recent = [
  { id: 6, title: 'Resonance', artist: 'Home', cover: 'https://picsum.photos/seed/res/400/400' },
  { id: 7, title: 'Affection', artist: 'between friends', cover: 'https://picsum.photos/seed/aff/400/400' },
  { id: 8, title: 'Vibes', artist: 'Unknown', cover: 'https://picsum.photos/seed/vibes/400/400' },
];

export default function Discover() {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 12) return '早安';
    if (h < 18) return '下午好';
    return '晚上好';
  });

  return (
    <div style={{ padding: 'calc(12px + env(safe-area-inset-top)) 20px 140px' }}>
      <header className="animate-slideUp" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>
          {greeting}，<span className="text-gradient">Sonus</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
          让声波穿透此刻的寂静
        </p>
      </header>

      {/* Moods */}
      <section className="animate-slideUp" style={{ animationDelay: '0.05s', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Zap size={18} color="var(--accent)" />
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>此刻心境</h2>
        </div>
        <div style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none',
        }}>
          {moods.map((m, i) => (
            <div key={i} style={{
              flex: '0 0 140px',
              borderRadius: 16,
              overflow: 'hidden',
              background: 'var(--bg-elevated)',
              cursor: 'pointer',
            }}>
              <div style={{ height: 140, overflow: 'hidden' }}>
                <img src={m.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section className="animate-slideUp" style={{ animationDelay: '0.1s', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Clock size={18} color="var(--accent)" />
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>最近回响</h2>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '8px 16px' }}>
          {recent.map((track, i) => (
            <SongItem key={track.id} track={track} index={i} onPlay={playTrack} />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="animate-slideUp" style={{ animationDelay: '0.15s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Disc3 size={18} color="var(--accent)" />
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>推荐声景</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          {[
            { title: '霓虹雨夜', artist: 'Synthwave Mix', cover: 'https://picsum.photos/seed/neon/400/400' },
            { title: '森林低语', artist: 'Nature Ambient', cover: 'https://picsum.photos/seed/forest/400/400' },
            { title: '宇宙尘埃', artist: 'Space Drone', cover: 'https://picsum.photos/seed/space2/400/400' },
            { title: '旧日磁带', artist: 'Lo-Fi Beats', cover: 'https://picsum.photos/seed/tape/400/400' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-secondary)',
              borderRadius: 16,
              overflow: 'hidden',
              cursor: 'pointer',
            }}>
              <img src={item.cover} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{item.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
