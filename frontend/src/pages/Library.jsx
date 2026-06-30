import { Library as LibIcon } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import SongItem from '../components/SongItem';

export default function Library() {
  const { playlist, playTrack, liked } = usePlayerStore();

  const likedTracks = playlist.filter((t) => liked.has(t.id));

  return (
    <div style={{ padding: 'calc(12px + env(safe-area-inset-top)) 20px 140px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>收藏</h1>

      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
      }}>
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))',
          borderRadius: 16,
          padding: 18,
          color: '#0C0C0F',
        }}>
          <LibIcon size={24} />
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10 }}>{likedTracks.length}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>已收藏</div>
        </div>
        <div style={{
          flex: 1,
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          padding: 18,
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 34 }}>{playlist.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>全部声波</div>
        </div>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>全部声波</h2>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '8px 16px' }}>
        {playlist.map((track, i) => (
          <SongItem key={track.id} track={track} index={i} onPlay={playTrack} />
        ))}
      </div>
    </div>
  );
}
