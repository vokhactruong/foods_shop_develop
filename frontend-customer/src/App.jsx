import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import MenuPage from './pages/MenuPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import SessionExpiredPopup from './components/SessionExpiredPopup';
import { getStoredToken, setStoredToken, clearStoredToken } from './utils/sessions';
import { createTableSession, validateTableSession } from './utils/api';

export default function App() {
  const [page, setPage] = useState('menu');
  const [orderData, setOrderData] = useState(null);

  // Đọc số bàn từ URL ?table=X
  const tableNumberFromUrl = parseInt(new URLSearchParams(window.location.search).get('table')) || 1;

  const [sessionToken, setSessionToken] = useState(null);
  const [sessionTableNumber, setSessionTableNumber] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      try {
        setSessionLoading(true);
        const existingToken = getStoredToken();

        if (existingToken) {
          const res = await validateTableSession(existingToken);
          if (res?.valid) {
            if (cancelled) return;
            setSessionToken(existingToken);
            setSessionTableNumber(res.tableNumber);
            setSessionExpiredOpen(false);
            return;
          }
        }

        // Không có token hoặc token expired => tạo token mới
        const created = await createTableSession(tableNumberFromUrl);
        setStoredToken(created.token);
        if (cancelled) return;

        const validated = await validateTableSession(created.token);
        if (!validated?.valid) {
          throw new Error('SessionExpired');
        }

        setSessionToken(created.token);
        setSessionTableNumber(validated.tableNumber);
        setSessionExpiredOpen(false);
      } catch (err) {
        // Với luồng expired: backend trả 403 + message đúng yêu cầu
        if (cancelled) return;
        clearStoredToken();
        setSessionToken(null);
        setSessionTableNumber(null);

        setSessionExpiredOpen(true);

        // Không toast thêm để tránh chồng thông báo
        // toast.error(err?.response?.data?.message || 'Phiên hết hạn');
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    }

    initSession();
    return () => {
      cancelled = true;
    };
  }, [tableNumberFromUrl]);

  if (page === 'success') {
    const tn = sessionTableNumber ?? tableNumberFromUrl;
    return (
      <OrderSuccessPage
        order={orderData}
        tableNumber={tn}
        onBack={() => {
          setPage('menu');
        }}
      />
    );
  }

  return (
    <>
      <SessionExpiredPopup open={sessionExpiredOpen} onClose={() => setSessionExpiredOpen(true)} />
      {sessionLoading || sessionTableNumber == null ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang kiểm tra phiên...</div>
      ) : (
        <MenuPage
          tableNumber={sessionTableNumber}
          token={sessionToken}
          onOrderPlaced={(order) => {
            setOrderData(order);
            setPage('success');
          }}
        />
      )}
    </>
  );
}

