import { useState, useEffect } from 'react';
import MenuPage from './pages/MenuPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

export default function App() {
  const [page, setPage] = useState('menu');
  const [orderData, setOrderData] = useState(null);

  // Đọc số bàn từ URL ?table=X
  const tableNumber = parseInt(new URLSearchParams(window.location.search).get('table')) || 1;

  if (page === 'success') {
    return <OrderSuccessPage order={orderData} tableNumber={tableNumber} onBack={() => setPage('menu')} />;
  }

  return (
    <MenuPage
      tableNumber={tableNumber}
      onOrderPlaced={(order) => { setOrderData(order); setPage('success'); }}
    />
  );
}
