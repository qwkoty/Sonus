import { useState } from 'react';
import { Search as SearchIcon, X, TrendingUp } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import SongItem from '../components/SongItem';

const hotTags = ['电子', '氛围', '后摇', '爵士', '古典', '合成器', '白噪音', '独立'];

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const doSearch = async (kw) => {
    if (!kw.trim()) return;
    setSearching(true);
    try {
      // 模拟搜索结果（接入真实API后可替换为 qqmusic.search）
      const demo = [
        { id: 10 + Math.random(), title: `${kw} - Remix`, artist: 'Various Artists', cover: `https://picsum.photos/seed/${kw}1/400/400` },
        { id: 11 + Math.random(), title: `${kw} (Live)`, artist: 'Indie Band', cover: `https://picsum.photos/seed/${kw}2/400/400` },
        { id: 12 + Math.random(), title: `The Sound of ${kw}`, artist: 'Ambient Project', cover: `https://picsum.photos/seed/${kw}3/400/400` },
      ];
      await new Promise((r) => setTimeout(r, 400));
      setResults(demo);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ padding: 'calc(12px + env(safe-area-inset-top)) 20px 140px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>探索</h1>

      {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--bg-secondary)',
        borderRadius: 14,
        padding: '10px 14px',
        marginBottom: 24,
        border: '1px solid var(--border)',
      }}>
        <SearchIcon size={18} color="var(--text-muted)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch(query)}
          placeholder="搜索声波、艺术家..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontSize: 15,
            color: 'var(--text-primary)',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }}>
            <X size={18} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Hot Tags */}
      {results.length === 0 && (
        <div className="animate-fadeIn">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={18} color="var(--accent)" />
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>热门标签</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {hotTags.map((tag) => (
              <button
                key={tag}
                onClick={() => { setQuery(tag); doSearch(tag); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="animate-slideUp">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>搜索结果</h2>
            <button onClick={() => setResults([])} style={{ fontSize: 12, color: 'var(--text-muted)' }}>清除</button>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '8px 16px' }}>
            {results.map((track, i) => (
              <SongItem key={track.id} track={track} index={i} onPlay={playTrack} />
            ))}
          </div>
        </div>
      )}

      {searching && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
          正在搜寻声波...
        </div>
      )}
    </div>
  );
}
