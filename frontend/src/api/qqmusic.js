const BASE = import.meta.env.VITE_API_BASE || '';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const qqmusic = {
  qrcode: () => get('/api/qqmusic/qrcode'),
  poll: (authCode) => get(`/api/qqmusic/qrcode/poll?auth_code=${encodeURIComponent(authCode)}`),
  token: (code) => get(`/api/qqmusic/token?code=${encodeURIComponent(code)}`),
  refresh: (refreshToken) => get(`/api/qqmusic/token/refresh?refresh_token=${encodeURIComponent(refreshToken)}`),
  userinfo: (token) => get(`/api/qqmusic/userinfo?access_token=${encodeURIComponent(token)}`),
  search: (kw, page = 1, num = 20) => get(`/api/qqmusic/search?keyword=${encodeURIComponent(kw)}&page=${page}&num=${num}`),
  playlist: (id) => get(`/api/qqmusic/playlist?id=${id}`),
  rank: () => get('/api/qqmusic/rank'),
};
