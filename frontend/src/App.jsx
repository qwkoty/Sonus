import { useState } from 'react';
import BottomNav from './components/BottomNav';
import MiniPlayer from './components/MiniPlayer';
import FullScreenPlayer from './components/FullScreenPlayer';
import Discover from './pages/Discover';
import Search from './pages/Search';
import Library from './pages/Library';
import Charts from './pages/Charts';
import Profile from './pages/Profile';

const pages = {
  discover: Discover,
  search: Search,
  library: Library,
  charts: Charts,
  profile: Profile,
};

export default function App() {
  const [tab, setTab] = useState('discover');
  const Page = pages[tab];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Page />
      </main>
      <MiniPlayer />
      <BottomNav active={tab} onChange={setTab} />
      <FullScreenPlayer />
    </div>
  );
}
