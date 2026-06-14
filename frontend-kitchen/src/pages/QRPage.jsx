import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTables, createTablesBulk } from '../utils/api';

export default function QRPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTables(); }, []);

  async function loadTables() {
    try {
      const data = await getTables();
      setTables(data);
    } catch {
      toast.error('Không tải được danh sách bàn');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTables() {
    const count = prompt('Tạo bao nhiêu bàn?', '10');
    if (!count) return;
    try {
      await createTablesBulk(parseInt(count));
      toast.success('Tạo bàn thành công');
      loadTables();
    } catch {
      toast.error('Lỗi tạo bàn');
    }
  }

  function printQR(table) {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>QR Bàn ${table.number}</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:40px">
        <h2 style="font-size:32px;margin-bottom:8px">🍿 Thạch Ngọc Quán</h2>
        <h3 style="color:#D85A30;font-size:24px;margin-bottom:20px">Bàn ${table.number}</h3>
        <img src="${table.qrDataUrl}" width="260" style="margin-bottom:16px"/>
        <p style="font-size:14px;color:#888">Quét để đặt món</p>
        <p style="font-size:12px;color:#bbb">${table.qrUrl}</p>
      </body></html>
    `);
    win.print();
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>📱 QR Code theo bàn</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleCreateTables}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
            + Tạo bàn
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {tables.map((table) => (
          <div key={table._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, textAlign: 'center' }}>
            {table.qrDataUrl && (
              <img src={table.qrDataUrl} alt={`QR Bàn ${table.number}`} style={{ width: 140, height: 140, marginBottom: 10, borderRadius: 8 }} />
            )}
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Bàn {table.number}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, wordBreak: 'break-all' }}>{table.qrUrl}</div>
            <button onClick={() => printQR(table)}
              style={{ width: '100%', padding: '8px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600 }}>
              🖨️ In QR
            </button>
          </div>
        ))}
        {tables.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            Chưa có bàn nào.
            <br /><button onClick={handleCreateTables} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Tạo bàn ngay</button>
          </div>
        )}
      </div>
    </div>
  );
}
