import { useState } from 'react';

export default function OrderModal({ cartItems, total, tableNumber, submitting, onConfirm, onClose }) {
  const [note, setNote] = useState('');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, margin: '0 auto', padding: '20px 16px', maxHeight: '80dvh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Xác nhận đơn — Bàn {tableNumber}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          {cartItems.map(({ item, qty }) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 14 }}>{item.emoji} {item.name} × {qty}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{(item.price * qty).toLocaleString('vi-VN')}₫</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, color: 'var(--primary)', marginBottom: 14 }}>
          <span>Tổng cộng</span>
          <span>{total.toLocaleString('vi-VN')}₫</span>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú cho bếp (không cay, ít đá, dị ứng...)"
          rows={2}
          style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, resize: 'none', marginBottom: 14 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 13, border: '1px solid var(--border)', borderRadius: 12, background: 'white', fontSize: 14, fontWeight: 600 }}>Hủy</button>
          <button
            onClick={() => onConfirm(note)}
            disabled={submitting}
            style={{ flex: 2, padding: 13, background: submitting ? '#ccc' : 'var(--primary)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700 }}
          >
            {submitting ? 'Đang gửi...' : '✅ Gửi đơn tới bếp'}
          </button>
        </div>
      </div>
    </div>
  );
}
