import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Player from './pages/Player';
import Profile from './pages/Profile';

export default function App() {
  const [view, setView] = useState('player');

  return (
    <div style={{ height: '100%', position: 'relative', background: 'var(--bg-primary)' }}>
      {view === 'player' ? (
        <Player onNavigate={setView} />
      ) : (
        <div style={{ height: '100%', position: 'relative' }}>
          {/* 返回播放器按钮 */}
          <div style={{
            position: 'fixed',
            top: 'calc(12px + env(safe-area-inset-top))',
            left: 16,
            zIndex: 200,
          }}>
            <button
              onClick={() => setView('player')}
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
              <ArrowLeft size={20} />
            </button>
          </div>
          <Profile />
        </div>
      )}
    </div>
  );
}
