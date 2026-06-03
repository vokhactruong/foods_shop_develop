import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getOrders, updateOrderStatus } from '../utils/api';
import { useKitchenSocket } from '../hooks/useKitchenSocket';

const ACTIVE_STATUSES = ['new', 'doing', 'done', 'served'];

const STATUSES = [
  { key: 'new', label: 'Đơn mới', color: '#E24B4A', bg: 'rgba(226,75,74,0.1)' },
  { key: 'doing', label: 'Món đang làm', color: '#EF9F27', bg: 'rgba(239,159,39,0.1)' },
  { key: 'served', label: 'Chờ tính tiền', color: '#7DA7D9', bg: 'rgba(125,167,217,0.12)' },
];

function timeSince(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'Vừa xong';
  return `${diff} phút trước`;
}

function money(value) {
  return Number(value || 0).toLocaleString('vi-VN') + '₫';
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  function visibleOrders(nextOrders) {
    return nextOrders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  }

  async function loadOrders() {
    try {
      const data = await getOrders({ status: 'all' });
      setOrders(visibleOrders(data));
      setConnected(true);
    } catch {
      toast.error('Không tải được đơn hàng');
    } finally {
      setLoading(false);
    }
  }

  useKitchenSocket({
    onNewOrder: (order) => {
      setOrders((prev) => [order, ...prev]);
      toast('Đơn mới - ' + order.orderNumber, { icon: '🔔', style: { background: '#E24B4A', color: 'white', fontWeight: 700 } });
    },
    onOrderUpdated: (updated) => {
      setOrders((prev) => visibleOrders(prev.map((order) => (order._id === updated._id ? updated : order))));
    },
  });

  async function moveOrder(order, nextStatus) {
    try {
      const updated = await updateOrderStatus(order._id, nextStatus);
      setOrders((prev) => visibleOrders(prev.map((item) => (item._id === updated._id ? updated : item))));
      if (nextStatus === 'paid') toast.success(`Đã tính tiền ${order.orderNumber}`);
    } catch {
      toast.error('Lỗi cập nhật trạng thái');
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải đơn hàng...</div>;

  return (
    <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: connected ? '#639922' : '#E24B4A' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {connected ? 'Đang kết nối real-time' : 'Mất kết nối'}
        </div>
        <button onClick={loadOrders} style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12 }}>
          Tải lại
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, flex: 1 }}>
        {STATUSES.map(({ key, label, color, bg }) => {
          const col = orders.filter((order) => key === 'doing' ? ['doing', 'done'].includes(order.status) : order.status === key);
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{label}</span>
                <span style={{ background: color, color: 'white', borderRadius: 20, padding: '1px 8px', fontSize: 12, fontWeight: 700 }}>{col.length}</span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>Không có đơn</div>
                )}
                {col.map((order) => (
                  <div key={order._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, borderLeft: `3px solid ${color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color }}>{order.orderNumber}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeSince(order.createdAt)}</div>
                      </div>
                      <div style={{ background: color + '20', color, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>
                        Bàn {order.tableNumber}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginBottom: 8 }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', gap: 10 }}>
                          <span>{item.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.note && (
                      <div style={{ background: 'rgba(239,159,39,0.1)', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: '#EF9F27', marginBottom: 8 }}>
                        {order.note}
                      </div>
                    )}

                    {key === 'served' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Tổng tiền</span>
                        <strong style={{ color: 'var(--primary)', fontSize: 15 }}>{money(order.totalAmount)}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6 }}>
                      {key === 'new' && (
                        <button onClick={() => moveOrder(order, 'doing')} style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: '#EF9F27', color: 'white', fontSize: 12, fontWeight: 700 }}>
                          Bắt đầu làm
                        </button>
                      )}
                      {key === 'doing' && (
                        <button onClick={() => moveOrder(order, 'served')} style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: '#7DA7D9', color: '#111', fontSize: 12, fontWeight: 800 }}>
                          Đã phục vụ
                        </button>
                      )}
                      {key === 'served' && (
                        <button onClick={() => moveOrder(order, 'paid')} style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 800 }}>
                          Tính tiền
                        </button>
                      )}
                      {key !== 'served' && (
                        <button onClick={() => moveOrder(order, 'cancelled')} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12 }}>
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
