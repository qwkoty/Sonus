import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MiniPlayer() {
  const {
    currentTrack, isPlaying, currentTime, duration,
    togglePlay, next, toggleLike, liked, toggleFullscreen,
  } = usePlayerStore();

  if (!currentTrack) return null;

  const isLiked = liked.has(currentTrack.id);
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={(e) => {
        if (e.target.closest('button')) return;
        toggleFullscreen();
      }}
      style={{
        position: 'fixed',
        bottom: 'calc(64px + var(--safe-bottom))',
        left: 12,
        right: 12,
        zIndex: 45,
        background: 'rgba(30,30,36,0.92)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        cursor: 'pointer',
      }}
    >
      <img
        src={currentTrack.cover}
        alt=""
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          objectFit: 'cover',
          flexShrink: 0,
          animation: isPlaying ? 'spin 8s linear infinite' : 'none',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {currentTrack.title}
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: 2,
        }}>
          {currentTrack.artist}
        </div>
        <div style={{
          height: 2,
          background: 'var(--surface)',
          borderRadius: 2,
          marginTop: 6,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'var(--accent)',
            borderRadius: 2,
            transition: 'width 0.3s linear',
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => toggleLike(currentTrack.id)} style={{ color: isLiked ? 'var(--accent)' : 'var(--text-secondary)' }}>
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
        <button onClick={togglePlay} style={{ color: 'var(--text-primary)' }}>
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>
        <button onClick={next} style={{ color: 'var(--text-secondary)' }}>
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
}
