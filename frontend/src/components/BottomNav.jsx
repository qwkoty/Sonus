import { Home, Search, Library, BarChart3, User } from 'lucide-react';

const tabs = [
  { key: 'discover', label: '发现', icon: Home },
  { key: 'search', label: '探索', icon: Search },
  { key: 'library', label: '收藏', icon: Library },
  { key: 'charts', label: '榜单', icon: BarChart3 },
  { key: 'profile', label: '我的', icon: User },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="glass" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: 'calc(64px + var(--safe-bottom))',
      paddingBottom: 'var(--safe-bottom)',
    }}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              flex: 1,
              height: 64,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'color 0.2s',
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
