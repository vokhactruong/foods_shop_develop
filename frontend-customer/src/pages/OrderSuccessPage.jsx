export default function OrderSuccessPage({ order, tableNumber, onBack }) {
  const fmt = (n) => n.toLocaleString('vi-VN') + ' ₫';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>Đặt món thành công!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Bếp đã nhận được đơn của bạn. Vui lòng chờ trong giây lát!</p>

      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, width: '100%', maxWidth: 340, border: '1px solid var(--border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
          <span style={{ color: 'var(--text-muted)' }}>Mã đơn</span>
          <strong>{order?.orderNumber}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
          <span style={{ color: 'var(--text-muted)' }}>Bàn</span>
          <strong>Bàn {tableNumber}</strong>
        </div>
        {order?.isTakeaway && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
            <span style={{ color: 'var(--text-muted)' }}>Hình thức</span>
            <strong>Mang về</strong>
          </div>
        )}
        <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 12, marginBottom: 12 }}>
          {order?.items?.map((it) => (
            <div key={it._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
              <span>{it.name} × {it.quantity}</span>
              <span>{fmt(it.subtotal)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>
          <span>Tổng cộng</span>
          <span>{fmt(order?.totalAmount || 0)}</span>
        </div>
      </div>

      <button
        onClick={onBack}
        style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 700 }}
      >
        Đặt thêm món
      </button>
    </div>
  );
}
