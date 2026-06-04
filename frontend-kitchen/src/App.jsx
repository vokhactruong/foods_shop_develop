import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import KitchenPage from './pages/KitchenPage';
import AdminPage from './pages/AdminPage';
import QRPage from './pages/QRPage';
import DashboardPage from './pages/DashboardPage';
import { unlockNotificationSound } from './utils/notificationSound';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'kitchen', label: 'Bếp' },
  { key: 'qr', label: 'QR Code' },
  { key: 'admin', label: 'Quản lý' },
];

const SOUND_KEY = 'snack_kitchen_sound_enabled';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('snack_user'));
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState('kitchen');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(SOUND_KEY) === 'true');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('dashboard')) setPage('dashboard');
    else if (path.includes('admin')) setPage('admin');
    else if (path.includes('qr')) setPage('qr');
    else setPage('kitchen');
  }, []);

  useEffect(() => {
    if (page !== 'kitchen' || !soundEnabled) return;

    unlockNotificationSound().catch(() => {});
  }, [page, soundEnabled]);

  async function enableSound() {
    try {
      await unlockNotificationSound();
      localStorage.setItem(SOUND_KEY, 'true');
      setSoundEnabled(true);
    } catch {
      localStorage.setItem(SOUND_KEY, 'true');
      setSoundEnabled(true);
    }
  }

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

  const showKitchenSoundPrompt = page === 'kitchen' && !soundEnabled;

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
      {page === 'kitchen' && <KitchenPage token={user.token} soundEnabled={soundEnabled} />}
      {page === 'qr' && <QRPage token={user.token} />}
      {page === 'admin' && <AdminPage token={user.token} />}

      {showKitchenSoundPrompt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.72)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 50,
            padding: 20,
          }}
        >
          <div style={{ width: '100%', maxWidth: 420, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Bật âm thanh thông báo</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              Bật âm thanh để khi có đơn mới, bếp sẽ phát file <code>/notification.mp3</code>.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  localStorage.setItem(SOUND_KEY, 'true');
                  setSoundEnabled(true);
                }}
                style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}
              >
                Không bật
              </button>
              <button
                onClick={enableSound}
                style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 800 }}
              >
                Bật âm thanh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
