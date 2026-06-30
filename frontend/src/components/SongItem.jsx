import { Play, Heart, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export default function SongItem({ track, index, onPlay }) {
  const { currentTrack, isPlaying, liked, toggleLike } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;
  const isLiked = liked.has(track.id);

  return (
    <div
      onClick={() => onPlay(track)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 0',
        cursor: 'pointer',
        opacity: isActive ? 1 : 0.9,
      }}
    >
      <div style={{ width: 24, textAlign: 'center', flexShrink: 0 }}>
        {isActive && isPlaying ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, height: 14 }}>
            <span style={{ width: 3, height: 6, background: 'var(--accent)', borderRadius: 2, animation: 'pulse 0.6s ease infinite' }} />
            <span style={{ width: 3, height: 10, background: 'var(--accent)', borderRadius: 2, animation: 'pulse 0.8s ease infinite 0.1s' }} />
            <span style={{ width: 3, height: 8, background: 'var(--accent)', borderRadius: 2, animation: 'pulse 0.7s ease infinite 0.2s' }} />
          </div>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {index + 1}
          </span>
        )}
      </div>

      <img
        src={track.cover}
        alt=""
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: isActive ? '0 0 0 2px var(--accent)' : 'none',
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: isActive ? 'var(--accent)' : 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {track.title}
        </div>
        <div style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginTop: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {track.artist}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
        style={{ color: isLiked ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
      </button>
      <button style={{ color: 'var(--text-muted)' }}>
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}
