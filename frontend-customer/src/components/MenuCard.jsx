const BG_MAP = {
  che: '#E8F5E9',
  suachua: '#FCE4EC',
  caramen: '#EFEBE9',
  monmoi: '#FFF9C4',
  douong: '#E0F2F1',
  doanutat: '#FFE0B2',
  pizza: '#FFEBEE',
  mycay: '#FFCCBC',
};

export default function MenuCard({ item, qty, onAdd, onUpdateQty }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        aspectRatio: '1 / 1.4925373134',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: '0 0 67%',
          background: BG_MAP[item.category] || '#F5EEE8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 28, color: 'var(--text-muted)' }}>
            {item.name?.slice(0, 1)?.toUpperCase()}
          </div>
        )}
      </div>

      <div
        style={{
          flex: '1 1 33%',
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2, lineHeight: 1.3 }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
            {item.price.toLocaleString('vi-VN')}₫
          </span>
          {qty === 0 ? (
            <button
              onClick={onAdd}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                width: 28,
                height: 28,
                fontSize: 18,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => onUpdateQty(-1)}
                style={{
                  background: '#F5EEE8',
                  border: 'none',
                  borderRadius: 6,
                  width: 26,
                  height: 26,
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                −
              </button>
              <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
              <button
                onClick={() => onUpdateQty(1)}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  width: 26,
                  height: 26,
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
