import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import KitchenPage from './pages/KitchenPage';
import AdminPage from './pages/AdminPage';
import QRPage from './pages/QRPage';
import DashboardPage from './pages/DashboardPage';
import { unlockNotificationSound } from './utils/notificationSound';
import { requestForToken, onMessageListener } from "./utils/firebase";
import { saveFcmToken } from './utils/api';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'kitchen', label: 'Báº¿p' },
  { key: 'qr', label: 'QR Code' },
  { key: 'admin', label: 'Quáº£n lÃ½' },
];

const SOUND_KEY = 'snack_kitchen_sound_enabled';
const ADMIN_PAGES = ['dashboard', 'admin'];

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
  const [soundTested, setSoundTested] = useState(false);
  const [pushStatus, setPushStatus] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const account = user?.user || user;
  const sessionToken = user?.token || account?.token;
  const isAdmin = account?.role === 'admin';

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('dashboard')) setPage('dashboard');
    else if (path.includes('admin')) setPage('admin');
    else if (path.includes('qr')) setPage('qr');
    else setPage('kitchen');
  }, []);

  useEffect(() => {
    if (user && !isAdmin && ADMIN_PAGES.includes(page)) {
      setPage('kitchen');
      setMenuOpen(false);
    }
  }, [user, isAdmin, page]);

  async function enableSound() {
    try {
      await unlockNotificationSound();
      localStorage.setItem(SOUND_KEY, 'true');
      setSoundEnabled(true);
      setSoundTested(true);
    } catch {
      localStorage.setItem(SOUND_KEY, 'true');
      setSoundEnabled(true);
      setSoundTested(true);
    }
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('snack_user');
    setMenuOpen(false);
  };

  const enablePushNotifications = async () => {
    try {
      setPushStatus('Dang bat...');
      const fcmToken = await requestForToken();
      await saveFcmToken(fcmToken);
      setPushStatus('Da bat');
      alert('Da luu FCM token cho thiet bi nay.');
    } catch (error) {
      setPushStatus('Loi');
      alert(`Khong lay/luu duoc FCM token: ${error.message}`);
    }
  };

  const showKitchenSoundPrompt = page === 'kitchen' && (!soundEnabled || !soundTested);
  const navItems = isAdmin ? NAV_ITEMS : NAV_ITEMS.filter((item) => !ADMIN_PAGES.includes(item.key));
  const selectPage = (nextPage) => {
    if (ADMIN_PAGES.includes(nextPage) && !isAdmin) return;
    setPage(nextPage);
    setMenuOpen(false);
  };
  useEffect(() => {
    if (!sessionToken) return undefined;

    let active = true;

    onMessageListener().then((payload) => {
      if (active && payload?.notification) {
        alert(`[Thong bao moi]: ${payload.notification.title} - ${payload.notification.body}`);
      }
    });

    return () => {
      active = false;
    };
  }, [sessionToken]);
  if (!user) {
    return (
      <LoginPage
        onLogin={(u) => {
          const session = u?.user ? { ...u.user, token: u.token } : u;
          setUser(session);
          localStorage.setItem('snack_user', JSON.stringify(session));
        }}
      />
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="app-nav">
        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 15, marginRight: 20 }}>Tháº¡ch Ngá»c QuÃ¡n</span>
        <button
          className="app-nav__menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="kitchen-nav-menu"
        >
          Menu
        </button>

        <div id="kitchen-nav-menu" className={`app-nav__menu ${menuOpen ? 'app-nav__menu--open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => selectPage(item.key)}
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
        <div className="app-nav__spacer" />
        <span className="app-nav__user">{account?.username}</span>
        <button onClick={enablePushNotifications} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13 }}>
          {pushStatus || 'Bat thong bao'}
        </button>
        <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13 }}>
          ÄÄƒng xuáº¥t
        </button>
        </div>
      </nav>

      {page === 'dashboard' && isAdmin && <DashboardPage token={sessionToken} />}
      {page === 'kitchen' && <KitchenPage token={sessionToken} soundEnabled={soundEnabled} />}
      {page === 'qr' && <QRPage token={sessionToken} />}
      {page === 'admin' && isAdmin && <AdminPage token={sessionToken} />}

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
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Báº­t Ã¢m thanh thÃ´ng bÃ¡o</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              Báº­t Ã¢m thanh Ä‘á»ƒ khi cÃ³ Ä‘Æ¡n má»›i, báº¿p sáº½ phÃ¡t file <code>/notification.mp3</code>.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  localStorage.setItem(SOUND_KEY, 'true');
                  setSoundEnabled(true);
                }}
                style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}
              >
                KhÃ´ng báº­t
              </button>
              <button
                onClick={enableSound}
                style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 800 }}
              >
                Báº­t Ã¢m thanh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

