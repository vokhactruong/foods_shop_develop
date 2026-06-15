import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCategories, getMenu, placeOrder } from '../utils/api';
import MenuCard from '../components/MenuCard';
import CartBar from '../components/CartBar';
import OrderModal from '../components/OrderModal';

const ALL_CATEGORY = { key: 'all', label: 'Tất cả', icon: '📋' };

export default function MenuPage({ tableNumber, token, onOrderPlaced }) {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([ALL_CATEGORY]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMenu();
  }, [activeCategory]);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories([ALL_CATEGORY, ...data]);
    } catch {
      toast.error('Khong tai duoc danh muc');
    }
  }

  async function loadMenu() {
    try {
      setLoading(true);
      const data = await getMenu(activeCategory);
      setMenu(data);
    } catch {
      toast.error('Khong tai duoc menu, thu lai sau');
    } finally {
      setLoading(false);
    }
  }

  function addToCart(item) {
    setCart((prev) => ({ ...prev, [item._id]: { item, qty: (prev[item._id]?.qty || 0) + 1 } }));
    toast.success(`Da them ${item.name}`);
  }

  function updateQty(itemId, delta) {
    setCart((prev) => {
      const current = prev[itemId]?.qty || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { ...prev[itemId], qty: next } };
    });
  }

  const cartItems = Object.values(cart).filter((c) => c.qty > 0);
  const cartCount = cartItems.reduce((sum, cartItem) => sum + cartItem.qty, 0);
  const cartTotal = cartItems.reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.qty, 0);

  async function handleOrder(note, isTakeaway) {
    try {
      setSubmitting(true);
      const orderPayload = {
        token,
        note,
        isTakeaway,
        items: cartItems.map(({ item, qty }) => ({
          menuItemId: item._id,
          name: item.name,
          quantity: qty,
        })),
      };

      const order = await placeOrder(orderPayload);
      setCart({});
      setShowModal(false);
      onOrderPlaced(order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dat mon that bai, thu lai');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div style={{ background: 'var(--primary)', color: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Phở Lợi Hương</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '6px 14px', fontSize: 14, fontWeight: 600 }}>
          Bàn {tableNumber}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '10px 12px', overflowX: 'auto', background: 'white', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: 20,
              border: activeCategory === cat.key ? 'none' : '1px solid var(--border)',
              background: activeCategory === cat.key ? 'var(--primary)' : 'white',
              color: activeCategory === cat.key ? 'white' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {cat.icon ? `${cat.icon} ` : ''}{cat.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, overflowY: 'auto', paddingBottom: cartCount > 0 ? 90 : 12 }}>
        {loading
          ? Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ height: 170, background: '#F5EEE8', borderRadius: 'var(--radius)', animation: 'pulse 1.4s infinite' }} />
            ))
          : menu.map((item) => (
              <MenuCard
                key={item._id}
                item={item}
                qty={cart[item._id]?.qty || 0}
                onAdd={() => addToCart(item)}
                onUpdateQty={(delta) => updateQty(item._id, delta)}
              />
            ))}
        {!loading && menu.length === 0 && (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            Không có món trong danh mục này
          </div>
        )}
      </div>

      {cartCount > 0 && (
        <CartBar count={cartCount} total={cartTotal} onOrder={() => setShowModal(true)} />
      )}

      {showModal && (
        <OrderModal
          cartItems={cartItems}
          total={cartTotal}
          tableNumber={tableNumber}
          submitting={submitting}
          onConfirm={handleOrder}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
