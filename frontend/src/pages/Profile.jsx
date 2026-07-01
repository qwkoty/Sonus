import { useState } from 'react';
import {
  User, Link as LinkIcon, LogOut, Moon, Settings, HelpCircle,
  Plus, Trash2, Play, Music, X
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export default function Profile() {
  const [linked, setLinked] = useState(false);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState(null);

  const {
    playlists, createPlaylist, deletePlaylist, removeFromPlaylist,
    playPlaylist, playTrack,
  } = usePlayerStore();

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div style={{ padding: 'calc(12px + env(safe-area-inset-top)) 20px 40px', overflowY: 'auto', height: '100%' }}>
      {/* 标题区域：左侧留空避让导航按钮 */}
      <div style={{ paddingLeft: 52, marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>我的</h1>
      </div>

      {/* User Card */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 20,
        padding: 24,
        textAlign: 'center',
        marginBottom: 24,
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
          color: '#fff',
        }}>
          <User size={32} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {linked ? '声波用户' : '访客'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {linked ? '已连接声波源' : '尚未连接声波源'}
        </div>

        {!linked ? (
          <button
            onClick={() => setLinked(true)}
            style={{
              marginTop: 16,
              padding: '10px 28px',
              borderRadius: 24,
              background: '#fff',
              color: '#0A0A0A',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LinkIcon size={16} />
              连接声波源
            </span>
          </button>
        ) : (
          <button
            onClick={() => setLinked(false)}
            style={{
              marginTop: 16,
              padding: '10px 28px',
              borderRadius: 24,
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={16} />
              断开连接
            </span>
          </button>
        )}
      </div>

      {/* 歌单系统 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>我的歌单</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              color: 'var(--text-primary)',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 10,
              background: 'var(--surface)',
            }}
          >
            <Plus size={14} />
            新建
          </button>
        </div>

        {showCreate && (
          <div className="animate-slideUp" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="歌单名称"
              autoFocus
              style={{
                flex: 1,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={handleCreate}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                background: '#fff',
                color: '#0A0A0A',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              创建
            </button>
          </div>
        )}

        {playlists.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
            还没有歌单，点击右上角新建一个
          </div>
        )}

        {playlists.map((pl) => (
          <div
            key={pl.id}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 10,
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <div
              onClick={() => setActivePlaylist(activePlaylist === pl.id ? null : pl.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}>
                  <Music size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{pl.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {pl.tracks.length} 首声波
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {pl.tracks.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); playPlaylist(pl.id); }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#fff',
                      color: '#0A0A0A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); setActivePlaylist(null); }}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {activePlaylist === pl.id && pl.tracks.length > 0 && (
              <div className="animate-slideUp" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                {pl.tracks.map((track, i) => (
                  <div
                    key={track.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 0',
                      borderBottom: i < pl.tracks.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <img src={track.cover} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }} onClick={() => playTrack(track)}>
                      <div style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{track.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{track.artist}</div>
                    </div>
                    <button onClick={() => removeFromPlaylist(pl.id, track.id)} style={{ color: 'var(--text-muted)' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Menu */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {[
          { icon: Moon, label: '深色模式', value: '始终开启' },
          { icon: Settings, label: '偏好设置', value: '' },
          { icon: HelpCircle, label: '关于 Sonus', value: 'v1.0.0' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 20px',
            borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
            cursor: 'pointer',
          }}>
            <item.icon size={20} color="var(--text-secondary)" />
            <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
