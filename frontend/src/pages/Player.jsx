import { useState, useRef, lazy, Suspense } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Heart, Shuffle, Repeat, ListMusic, Volume2,
  Search, X, Plus, Music, ChevronUp, ChevronDown,
  User, Radio, Sliders
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { music } from '../api/music';
import Visualizer from '../components/Visualizer';
import FloatingLyrics from '../components/FloatingLyrics';

const Visualizer3D = lazy(() => import('../components/Visualizer3D'));

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatPlatform(p) {
  const map = { netease: '网易云', qq: 'QQ音乐', demo: '示例' };
  return map[p] || p;
}

const VIZ_MODES = [
  { key: 'ring', label: '环形' },
  { key: 'wave', label: '波形' },
  { key: 'particles', label: '粒子' },
  { key: 'waterfall', label: '瀑布' },
  { key: '3d', label: '3D' },
];

export default function Player({ onNavigate }) {
  const store = usePlayerStore();
  const {
    currentTrack, isPlaying, currentTime, duration,
    volume, playMode, playlist, liked, playlists,
    togglePlay, next, prev, seek, setVolume,
    toggleMode, toggleLike, playTrack, addToPlaylist,
    platform, preloadUrls,
    lyrics, currentLyric,
  } = store;

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [addMenuTrack, setAddMenuTrack] = useState(null);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [vizMode, setVizMode] = useState(() => {
    try { return localStorage.getItem('sonus_viz_mode') || 'ring'; } catch { return 'ring'; }
  });
  const changeVizMode = (m) => {
    setVizMode(m);
    try { localStorage.setItem('sonus_viz_mode', m); } catch {}
  };
  const progressRef = useRef(null);

  const isLiked = currentTrack ? liked.has(currentTrack.id) : false;
  const progress = duration ? (currentTime / duration) * 100 : 0;
  const COVER_RADIUS = 90;

  const doSearch = async (kw) => {
    if (!kw.trim()) return;
    setSearching(true);
    try {
      const searchPlatforms = platform === 'none' ? 'netease,qq' : platform;
      const res = await music.search(kw, searchPlatforms, 15);
      const list = (res.data || []).map((item) => ({
        ...item,
        cover: item.cover || `https://picsum.photos/seed/${item.id}/400/400`,
      }));
      setResults(list);
      preloadUrls(list);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handlePlaySearch = (track) => {
    playTrack(track);
    setSearchOpen(false);
    setResults([]);
    setQuery('');
  };

  return (
    <div style={{
      height: '100%',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ====== 全屏可视化区域 ====== */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'relative',
          width: 'min(85vw, 340px)',
          height: 'min(85vw, 340px)',
        }}>
          <FloatingLyrics lyrics={lyrics} isPlaying={isPlaying} />
          {vizMode === '3d'
            ? <Suspense fallback={null}><Visualizer3D coverRadius={COVER_RADIUS} /></Suspense>
            : <Visualizer isPlaying={isPlaying} coverRadius={COVER_RADIUS} mode={vizMode} />
          }

          {/* 圆形旋转封面 */}
          {vizMode !== '3d' && (
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(44vw, 180px)',
              height: 'min(44vw, 180px)',
              borderRadius: '50%',
              overflow: 'hidden',
              zIndex: 3,
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              animation: isPlaying ? 'spin 24s linear infinite' : 'none',
            }}>
              {currentTrack ? (
                <img src={currentTrack.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <Music size={40} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ====== 悬浮歌词（可视化区域上方） ====== */}
      <div style={{
        position: 'absolute',
        bottom: panelExpanded ? 280 : 80,
        left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        padding: '0 32px',
        zIndex: 10,
        transition: 'bottom 0.3s ease',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontSize: 15, fontWeight: 600, color: '#fff',
          textAlign: 'center',
          opacity: currentLyric ? 1 : 0,
          transition: 'opacity 0.4s ease',
          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: '85vw',
        }}>
          {currentLyric || ' '}
        </p>
      </div>

      {/* ====== 顶部导航浮层 ====== */}
      <div style={{
        position: 'absolute',
        top: 'calc(12px + env(safe-area-inset-top))',
        left: 16,
        display: 'flex',
        gap: 8,
        zIndex: 100,
      }}>
        <button
          onClick={() => onNavigate?.('profile')}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(30,30,36,0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <User size={18} />
        </button>
      </div>

      <div style={{
        position: 'absolute',
        top: 'calc(12px + env(safe-area-inset-top))',
        right: 16,
        zIndex: 100,
      }}>
        <button
          onClick={() => { setSearchOpen(!searchOpen); setResults([]); setQuery(''); setAddMenuTrack(null); }}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(30,30,36,0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
        >
          {searchOpen ? <X size={18} /> : <Search size={18} />}
        </button>
      </div>

      {/* ====== 搜索面板 ====== */}
      {searchOpen && (
        <div className="animate-fadeIn" style={{
          position: 'absolute', inset: 0, zIndex: 200,
          background: 'rgba(10,10,10,0.98)',
          backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column',
          padding: 'calc(64px + env(safe-area-inset-top)) 20px 20px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-secondary)', borderRadius: 14,
            padding: '10px 14px', marginBottom: 16,
            border: '1px solid var(--border)',
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch(query)}
              placeholder="搜索歌曲、艺术家..."
              autoFocus
              style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 15, color: 'var(--text-primary)' }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); }}>
                <X size={18} color="var(--text-muted)" />
              </button>
            )}
          </div>

          {searching && (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 13 }}>
              正在搜寻...
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {results.map((track) => (
              <div key={track.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--border)', position: 'relative',
              }}>
                <img src={track.cover} alt="" onClick={() => handlePlaySearch(track)}
                  style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => handlePlaySearch(track)}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {track.artist} · {formatPlatform(track.platform)}
                  </div>
                </div>
                <button onClick={() => setAddMenuTrack(addMenuTrack === track.id ? null : track.id)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: addMenuTrack === track.id ? '#fff' : 'var(--surface)',
                    color: addMenuTrack === track.id ? '#0A0A0A' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                  <Plus size={14} />
                </button>
                <button onClick={() => handlePlaySearch(track)} style={{ color: '#fff', flexShrink: 0 }}>
                  <Play size={18} />
                </button>

                {addMenuTrack === track.id && playlists.length > 0 && (
                  <div className="animate-scaleIn" style={{
                    position: 'absolute', right: 8, top: 44,
                    background: 'var(--bg-elevated)', borderRadius: 12,
                    border: '1px solid var(--border)', padding: '8px 0', minWidth: 140,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 300,
                  }}>
                    <div style={{ padding: '4px 12px 8px', fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      添加到歌单
                    </div>
                    {playlists.map((pl) => (
                      <button key={pl.id} onClick={() => { addToPlaylist(pl.id, track); setAddMenuTrack(null); }}
                        style={{ display: 'block', width: '100%', padding: '8px 12px', fontSize: 13, textAlign: 'left', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                        {pl.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== 底部悬浮控制面板 ====== */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        zIndex: 50,
        background: 'rgba(15,15,18,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0',
        padding: '14px 20px calc(16px + var(--safe-bottom))',
        transition: 'transform 0.3s ease',
      }}>
        {/* 展开/收起把手 */}
        <div
          onClick={() => setPanelExpanded(!panelExpanded)}
          style={{
            display: 'flex', justifyContent: 'center', marginBottom: 10, cursor: 'pointer',
          }}
        >
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} />
        </div>

        {/* 歌曲信息 + 进度条（始终显示） */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 8,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 700,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {currentTrack?.title || '未播放'}
              </div>
              <div style={{
                fontSize: 12, color: 'var(--text-secondary)', marginTop: 2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {currentTrack?.artist || '选择一首歌开始'}
              </div>
            </div>
            <button
              onClick={() => setPanelExpanded(!panelExpanded)}
              style={{ color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}
            >
              {panelExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>

          {/* 进度条 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressRef}
              style={{ flex: 1, height: 3, background: 'var(--surface)', borderRadius: 4, cursor: 'pointer' }}
              onClick={(e) => {
                const rect = progressRef.current.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                seek(ratio * duration);
              }}
            >
              <div style={{
                width: `${progress}%`, height: '100%',
                background: '#fff', borderRadius: 4,
                transition: 'width 0.1s linear',
              }} />
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 30, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 主控制按钮（始终显示） */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
        }}>
          <button onClick={prev} style={{ color: 'var(--text-primary)' }}>
            <SkipBack size={22} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0A0A0A',
              boxShadow: '0 4px 16px rgba(255,255,255,0.12)',
            }}
          >
            {isPlaying
              ? <Pause size={24} fill="currentColor" />
              : <Play size={24} fill="currentColor" style={{ marginLeft: 2 }} />}
          </button>
          <button onClick={next} style={{ color: 'var(--text-primary)' }}>
            <SkipForward size={22} fill="currentColor" />
          </button>
        </div>

        {/* ====== 展开后显示的扩展区域 ====== */}
        {panelExpanded && (
          <div className="animate-slideUp" style={{ marginTop: 14 }}>
            {/* 副控制行 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 14,
            }}>
              <button onClick={() => currentTrack && toggleLike(currentTrack.id)} style={{ color: isLiked ? '#fff' : 'var(--text-muted)' }}>
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button onClick={toggleMode} style={{ color: playMode !== 'list' ? '#fff' : 'var(--text-muted)' }}>
                {playMode === 'random' ? <Shuffle size={16} /> : playMode === 'single' ? <Repeat size={16} /> : <ListMusic size={16} />}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, margin: '0 12px' }}>
                <Volume2 size={13} color="var(--text-muted)" />
                <input type="range" min={0} max={1} step={0.01} value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#fff', height: 2 }} />
              </div>
              <button onClick={() => setShowPlaylist(!showPlaylist)}
                style={{ color: showPlaylist ? '#fff' : 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>
                列表
              </button>
            </div>

            {/* 可视化模式切换 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            }}>
              <Sliders size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', gap: 5, flex: 1, overflowX: 'auto' }}>
                {VIZ_MODES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => changeVizMode(m.key)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 16,
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      background: vizMode === m.key ? '#fff' : 'var(--surface)',
                      color: vizMode === m.key ? '#0A0A0A' : 'var(--text-muted)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 播放列表 */}
            {showPlaylist && (
              <div style={{
                maxHeight: 120, overflowY: 'auto',
                background: 'var(--bg-secondary)', borderRadius: 10, padding: '6px 10px',
              }}>
                {playlist.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
                    播放列表为空
                  </div>
                ) : playlist.map((track, i) => (
                  <div key={track.id} onClick={() => playTrack(track)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                    cursor: 'pointer',
                    borderBottom: i < playlist.length - 1 ? '1px solid var(--border)' : 'none',
                    color: currentTrack?.id === track.id ? '#fff' : 'var(--text-primary)',
                  }}>
                    <img src={track.cover} alt="" style={{ width: 28, height: 28, borderRadius: 5, objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.title}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{track.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
