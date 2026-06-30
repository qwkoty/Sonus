import { useState } from 'react';
import { User, Link as LinkIcon, LogOut, Moon, Settings, HelpCircle } from 'lucide-react';

export default function Profile() {
  const [linked, setLinked] = useState(false);

  return (
    <div style={{ padding: 'calc(12px + env(safe-area-inset-top)) 20px 140px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>我的</h1>

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
          background: 'linear-gradient(135deg, var(--accent-light), var(--accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
          color: '#0C0C0F',
        }}>
          <User size={32} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {linked ? 'QQ 声波用户' : '访客'}
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
              background: 'linear-gradient(135deg, var(--accent-light), var(--accent))',
              color: '#0C0C0F',
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
