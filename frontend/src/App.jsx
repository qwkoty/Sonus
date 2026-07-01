import { useState } from 'react';
import { Menu, X, Music, User } from 'lucide-react';
import Player from './pages/Player';
import Profile from './pages/Profile';

export default function App() {
  const [view, setView] = useState('player');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ height: '100%', position: 'relative', background: 'var(--bg-primary)' }}>
      {/* 左上角导航 */}
      <div style={{
        position: 'fixed',
        top: 'calc(12px + env(safe-area-inset-top))',
        left: 16,
        zIndex: 200,
      }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'rgba(30,30,36,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {menuOpen && (
          <div className="animate-scaleIn" style={{
            marginTop: 10,
            background: 'rgba(30,30,36,0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: 14,
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            minWidth: 140,
          }}>
            <button
              onClick={() => { setView('player'); setMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                width: '100%',
                color: view === 'player' ? 'var(--accent)' : 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 600,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <Music size={18} />
              播放器
            </button>
            <button
              onClick={() => { setView('profile'); setMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                width: '100%',
                color: view === 'profile' ? 'var(--accent)' : 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <User size={18} />
              个人
            </button>
          </div>
        )}
      </div>

      {/* 主内容 */}
      {view === 'player' ? <Player /> : <Profile />}
    </div>
  );
}
