const BG_MAP = { chips: '#FAECE7', hot: '#FAEEDA', drink: '#E1F5EE', sweet: '#EEEDFE', other: '#F1EFE8' };

export default function MenuCard({ item, qty, onAdd, onUpdateQty }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ height: 80, background: BG_MAP[item.category] || '#F5EEE8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 28, color: 'var(--text-muted)' }}>
            {item.name?.slice(0, 1)?.toUpperCase()}
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
            {item.price.toLocaleString('vi-VN')}₫
          </span>
          {qty === 0 ? (
            <button
              onClick={onAdd}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, width: 28, height: 28, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >+</button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => onUpdateQty(-1)} style={{ background: '#F5EEE8', border: 'none', borderRadius: 6, width: 26, height: 26, fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>−</button>
              <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => onUpdateQty(1)} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, width: 26, height: 26, fontSize: 16, fontWeight: 700 }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
