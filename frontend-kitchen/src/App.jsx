import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import KitchenPage from './pages/KitchenPage';
import AdminPage from './pages/AdminPage';
import QRPage from './pages/QRPage';
import DashboardPage from './pages/DashboardPage';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'kitchen', label: 'Bếp' },
  { key: 'qr', label: 'QR Code' },
  { key: 'admin', label: 'Quản lý' },
];

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('snack_user'));
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState('kitchen');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('dashboard')) setPage('dashboard');
    else if (path.includes('admin')) setPage('admin');
    else if (path.includes('qr')) setPage('qr');
    else setPage('kitchen');
  }, []);

  if (!user) {
    return (
      <LoginPage
        onLogin={(u) => {
          setUser(u);
          localStorage.setItem('snack_user', JSON.stringify(u));
        }}
      />
    );
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('snack_user');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav style={{ background: '#111', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', minHeight: 52, gap: 4, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 15, marginRight: 20 }}>Snack House</span>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: page === item.key ? 'var(--primary)' : 'transparent',
              color: page === item.key ? 'white' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {item.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 12 }}>{user.username}</span>
        <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13 }}>
          Đăng xuất
        </button>
      </nav>

      {page === 'dashboard' && <DashboardPage token={user.token} />}
      {page === 'kitchen' && <KitchenPage token={user.token} />}
      {page === 'qr' && <QRPage token={user.token} />}
      {page === 'admin' && <AdminPage token={user.token} />}
    </div>
  );
}
