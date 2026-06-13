import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import KitchenPage from './pages/KitchenPage';
import AdminPage from './pages/AdminPage';
import QRPage from './pages/QRPage';
import DashboardPage from './pages/DashboardPage';
import { unlockNotificationSound } from './utils/notificationSound';
import { requestForToken, showSystemNotification, subscribeToForegroundMessages } from "./utils/firebase";
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
  const [pushStatus, setPushStatus] = useState('');
  const [pushBusy, setPushBusy] = useState(false);
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('snack_user');
    setMenuOpen(false);
  };

  const toggleSound = async () => {
    if (soundEnabled) {
      localStorage.setItem(SOUND_KEY, 'false');
      setSoundEnabled(false);
      return;
    }

    try {
      await unlockNotificationSound();
    } catch {}

    localStorage.setItem(SOUND_KEY, 'true');
    setSoundEnabled(true);
  };

  const enablePushNotifications = async () => {
    if (pushBusy) return;

    try {
      setPushBusy(true);
      setPushStatus('Dang bat...');
      const fcmToken = await requestForToken();
      await saveFcmToken(fcmToken);
      setPushStatus('Da bat');
      alert('Da luu FCM token cho thiet bi nay.');
    } catch (error) {
      setPushStatus('Loi');
      alert(`Khong lay/luu duoc FCM token: ${error.message}`);
    } finally {
      setPushBusy(false);
    }
  };

  const navItems = isAdmin ? NAV_ITEMS : NAV_ITEMS.filter((item) => !ADMIN_PAGES.includes(item.key));
  const selectPage = (nextPage) => {
    if (ADMIN_PAGES.includes(nextPage) && !isAdmin) return;
    setPage(nextPage);
    setMenuOpen(false);
  };
  useEffect(() => {
    if (!sessionToken) return undefined;

    let unsubscribe = () => {};
    let active = true;

    subscribeToForegroundMessages(async (payload) => {
      if (!active || !payload) return;

      try {
        await showSystemNotification(payload);
      } catch {
        if (payload.notification) {
          alert(`[Thong bao moi]: ${payload.notification.title} - ${payload.notification.body}`);
        }
      }
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      active = false;
      unsubscribe();
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
        <button disabled={pushBusy} onClick={enablePushNotifications} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, opacity: pushBusy ? 0.65 : 1 }}>
          {pushStatus || 'Bat thong bao'}
        </button>
        <button onClick={toggleSound} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: soundEnabled ? 'var(--primary)' : 'transparent', color: soundEnabled ? 'white' : 'var(--text-muted)', fontSize: 13 }}>
          {soundEnabled ? 'Tat am thanh' : 'Bat am thanh'}
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

    </div>
  );
}

