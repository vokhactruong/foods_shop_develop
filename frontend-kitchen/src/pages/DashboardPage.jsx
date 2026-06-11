import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getStats } from '../utils/api';

const RANGES = [
  { key: 'today', label: 'Hôm nay' },
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
];

const STATUS_LABELS = {
  new: 'Đơn mới',
  doing: 'Đang làm',
  done: 'Xong',
  served: 'Đã phục vụ',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
};

function money(value) {
  return Number(value || 0).toLocaleString('vi-VN') + '₫';
}

function shortDate(value) {
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function shortMonth(value) {
  const [year, month] = value.split('-');
  return `${month}/${year}`;
}

function dateTime(value) {
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatCard({ label, value, hint, color = 'var(--primary)' }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, minHeight: 104 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>{label}</div>
      <div style={{ color, fontSize: 26, lineHeight: '32px', fontWeight: 800 }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>{hint}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState('today');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    loadStats(range);
  }, [range]);

  async function loadStats(nextRange = range) {
    try {
      setLoading(true);
      const data = await getStats({ range: nextRange });
      setStats(data);
      setSelectedDay(null);
      setSelectedMonth(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được thống kê');
    } finally {
      setLoading(false);
    }
  }

  const maxRevenue = useMemo(() => {
    return Math.max(...(stats?.revenueByDay || []).map((day) => day.revenue), 1);
  }, [stats]);

  const maxMonthlyRevenue = useMemo(() => {
    return Math.max(...(stats?.revenueByMonth || []).map((month) => month.revenue), 1);
  }, [stats]);

  if (loading && !stats) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải thống kê...</div>;
  }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Dashboard thu nhập</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Doanh thu tính từ đơn đã thanh toán
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {RANGES.map((item) => (
            <button
              key={item.key}
              onClick={() => setRange(item.key)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: range === item.key ? 'var(--primary)' : 'var(--bg-card)',
                color: range === item.key ? 'white' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => loadStats()}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13 }}
          >
            Tải lại
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <StatCard label="Doanh thu" value={money(stats?.todayRevenue)} hint="Tổng tiền đơn hợp lệ" />
        <StatCard label="Số đơn" value={stats?.todayOrders || 0} hint="Không tính đơn đã hủy" color="#EF9F27" />
        <StatCard label="Đơn đã thu" value={stats?.paidOrders || 0} hint="Đơn đã thanh toán" color="#639922" />
        <StatCard label="Trung bình đơn" value={money(stats?.averageOrderValue)} hint="Doanh thu / đơn đã thu" color="#7DA7D9" />
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, minHeight: 280 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800 }}>Doanh thu theo tháng</h3>
          <span style={{ color: selectedMonth ? '#639922' : 'var(--text-muted)', fontSize: 12, fontWeight: selectedMonth ? 800 : 400 }}>
            {selectedMonth ? `${shortMonth(selectedMonth.month)} - ${money(selectedMonth.revenue)}` : '12 tháng gần nhất'}
          </span>
        </div>
        {stats?.revenueByMonth?.length ? (
          <div style={{ height: 210, display: 'flex', alignItems: 'end', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 8, overflowX: 'auto' }}>
            {stats.revenueByMonth.map((month) => (
              <div
                key={month.month}
                onClick={() => setSelectedMonth(month)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedMonth(month);
                }}
                style={{ flex: 1, minWidth: 58, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <div
                  style={{
                    width: '100%',
                    minHeight: 6,
                    height: `${Math.max((month.revenue / maxMonthlyRevenue) * 150, 6)}px`,
                    background: 'linear-gradient(180deg, #7DA7D9, #639922)',
                    borderRadius: 6,
                    outline: selectedMonth?.month === month.month ? '2px solid #F5F0EB' : 'none',
                    outlineOffset: 2,
                  }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{shortMonth(month.month)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: 210, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Chưa có doanh thu theo tháng</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, minHeight: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Doanh thu theo ngày</h3>
            <span style={{ color: selectedDay ? 'var(--primary)' : 'var(--text-muted)', fontSize: 12, fontWeight: selectedDay ? 800 : 400 }}>
              {selectedDay ? `${shortDate(selectedDay.date)} - ${money(selectedDay.revenue)}` : `${stats?.revenueByDay?.length || 0} ngày có doanh thu`}
            </span>
          </div>
          {stats?.revenueByDay?.length ? (
            <div style={{ height: 210, display: 'flex', alignItems: 'end', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 8, overflowX: 'auto' }}>
              {stats.revenueByDay.map((day) => (
                <div
                  key={day.date}
                  onClick={() => setSelectedDay(day)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedDay(day);
                  }}
                  style={{ flex: 1, minWidth: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                >
                  <div
                    style={{
                      width: '100%',
                      minHeight: 6,
                      height: `${Math.max((day.revenue / maxRevenue) * 150, 6)}px`,
                      background: 'linear-gradient(180deg, #EF9F27, var(--primary))',
                      borderRadius: 6,
                      outline: selectedDay?.date === day.date ? '2px solid #F5F0EB' : 'none',
                      outlineOffset: 2,
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{shortDate(day.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: 210, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Chưa có doanh thu</div>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Trạng thái đơn</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(stats?.statusBreakdown || []).map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{STATUS_LABELS[item._id] || item._id}</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{item.count}</span>
              </div>
            ))}
            {!stats?.statusBreakdown?.length && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Chưa có đơn</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Top món bán chạy</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(stats?.topItems || []).map((item, index) => (
              <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, alignItems: 'center' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>#{index + 1}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.quantity} món</div>
                </div>
                <span style={{ fontWeight: 800 }}>{money(item.revenue)}</span>
              </div>
            ))}
            {!stats?.topItems?.length && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Chưa có món đã bán</div>}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, overflow: 'auto' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Đơn gần đây</h3>
          <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Mã đơn', 'Bàn', 'Tổng tiền', 'Trạng thái', 'Thời gian'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, padding: '8px 6px' }}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '9px 6px', fontSize: 13, fontWeight: 800 }}>{order.orderNumber}</td>
                  <td style={{ padding: '9px 6px', fontSize: 13 }}>Bàn {order.tableNumber}</td>
                  <td style={{ padding: '9px 6px', fontSize: 13, color: 'var(--primary)', fontWeight: 800 }}>{money(order.totalAmount)}</td>
                  <td style={{ padding: '9px 6px', fontSize: 13, color: 'var(--text-muted)' }}>{STATUS_LABELS[order.status] || order.status}</td>
                  <td style={{ padding: '9px 6px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{dateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!stats?.recentOrders?.length && <div style={{ color: 'var(--text-muted)', fontSize: 13, paddingTop: 12 }}>Chưa có đơn gần đây</div>}
        </div>
      </div>
    </div>
  );
}
