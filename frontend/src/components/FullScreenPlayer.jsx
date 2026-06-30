import { useEffect, useRef } from 'react';
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Heart, Shuffle, Repeat, ListMusic, Volume2
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import Visualizer from './Visualizer';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function FullScreenPlayer() {
  const store = usePlayerStore();
  const {
    currentTrack, isPlaying, currentTime, duration,
    volume, playMode, fullscreen, liked,
    togglePlay, next, prev, seek, setVolume,
    toggleMode, toggleFullscreen, toggleLike,
  } = store;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => store.tick(), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, store]);

  if (!fullscreen || !currentTrack) return null;

  const isLiked = liked.has(currentTrack.id);
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="animate-fadeIn" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'linear-gradient(180deg, #141418 0%, #0C0C0F 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        paddingTop: 'calc(12px + env(safe-area-inset-top))',
      }}>
        <button onClick={toggleFullscreen} style={{ color: 'var(--text-secondary)' }}>
          <ChevronDown size={28} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase' }}>正在播放</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{currentTrack.artist}</div>
        </div>
        <div style={{ width: 28 }} />
      </div>

      {/* Cover & Visualizer */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        gap: 28,
      }}>
        <div style={{ position: 'relative', width: 'min(72vw, 320px)', aspectRatio: '1' }}>
          <img
            src={currentTrack.cover}
            alt=""
            className="cover-shadow"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '24px',
              objectFit: 'cover',
              animation: isPlaying ? 'spin 20s linear infinite' : 'none',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: -20,
            zIndex: -1,
            opacity: 0.35,
            filter: 'blur(40px)',
            background: `url(${currentTrack.cover}) center/cover`,
          }} />
        </div>

        <Visualizer isPlaying={isPlaying} />

        {/* Info */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{currentTrack.title}</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 6 }}>{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '0 28px 28px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>{formatTime(currentTime)}</span>
          <div
            style={{ flex: 1, height: 4, background: 'var(--surface)', borderRadius: 4, cursor: 'pointer' }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seek(ratio * duration);
            }}
          >
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-dark), var(--accent))',
              borderRadius: 4,
              transition: 'width 0.2s linear',
            }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 36 }}>{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <button onClick={() => toggleLike(currentTrack.id)} style={{ color: isLiked ? 'var(--accent)' : 'var(--text-secondary)' }}>
            <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={prev} style={{ color: 'var(--text-primary)' }}>
            <SkipBack size={28} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-light), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0C0C0F',
              boxShadow: '0 8px 24px rgba(201,148,62,0.35)',
            }}
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: 4 }} />}
          </button>
          <button onClick={next} style={{ color: 'var(--text-primary)' }}>
            <SkipForward size={28} fill="currentColor" />
          </button>
          <button onClick={toggleMode} style={{ color: playMode !== 'list' ? 'var(--accent)' : 'var(--text-secondary)' }}>
            {playMode === 'random' ? <Shuffle size={22} /> : playMode === 'single' ? <Repeat size={22} /> : <ListMusic size={22} />}
          </button>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Volume2 size={16} color="var(--text-muted)" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              flex: 1,
              accentColor: 'var(--accent)',
              height: 3,
            }}
          />
        </div>
      </div>
    </div>
  );
}
