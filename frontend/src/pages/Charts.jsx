import { Trophy } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import SongItem from '../components/SongItem';

const charts = [
  {
    title: '全球热声',
    subtitle: '本周最受欢迎的声波',
    tracks: [
      { id: 101, title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://picsum.photos/seed/bl/400/400' },
      { id: 102, title: 'Levitating', artist: 'Dua Lipa', cover: 'https://picsum.photos/seed/lev/400/400' },
      { id: 103, title: 'Stay', artist: 'Kid LAROI', cover: 'https://picsum.photos/seed/stay/400/400' },
      { id: 104, title: 'Peaches', artist: 'Justin Bieber', cover: 'https://picsum.photos/seed/peach/400/400' },
    ],
  },
  {
    title: '独立之声',
    subtitle: '地下场景的隐秘瑰宝',
    tracks: [
      { id: 201, title: 'Scott Street', artist: 'Phoebe Bridgers', cover: 'https://picsum.photos/seed/scott/400/400' },
      { id: 202, title: 'Motion Sickness', artist: 'Phoebe Bridgers', cover: 'https://picsum.photos/seed/motion/400/400' },
      { id: 203, title: 'Chinese Satellite', artist: 'Phoebe Bridgers', cover: 'https://picsum.photos/seed/sat/400/400' },
    ],
  },
  {
    title: '氛围回响',
    subtitle: '让空间充满情绪',
    tracks: [
      { id: 301, title: 'Weightless', artist: 'Marconi Union', cover: 'https://picsum.photos/seed/weight/400/400' },
      { id: 302, title: 'Bloom', artist: 'The Ambientist', cover: 'https://picsum.photos/seed/bloom/400/400' },
    ],
  },
];

export default function Charts() {
  const playTrack = usePlayerStore((s) => s.playTrack);

  return (
    <div style={{ padding: 'calc(12px + env(safe-area-inset-top)) 20px 140px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Trophy size={26} color="var(--accent)" />
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>声波榜单</h1>
      </div>

      {charts.map((chart, ci) => (
        <section key={ci} style={{ marginBottom: 28 }} className="animate-slideUp">
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{chart.title}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{chart.subtitle}</p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '8px 16px' }}>
            {chart.tracks.map((track, i) => (
              <SongItem key={track.id} track={track} index={i} onPlay={playTrack} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
