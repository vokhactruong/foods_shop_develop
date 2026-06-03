export default function CartBar({ count, total, onOrder }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: 'white', borderTop: '1px solid var(--border)',
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 100,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} món đã chọn</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{total.toLocaleString('vi-VN')}₫</div>
      </div>
      <button
        onClick={onOrder}
        style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 15, fontWeight: 700 }}
      >
        🛒 Đặt món
      </button>
    </div>
  );
}
