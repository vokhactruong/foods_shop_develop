import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getCategoriesAdmin,
  getMenuAdmin,
  updateCategory,
  updateMenuItem,
} from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinary';

const EMPTY_ITEM_FORM = { name: '', price: '', category: '', description: '', available: true, image: '' };
const EMPTY_CATEGORY_FORM = { key: '', label: '', icon: '', sortOrder: '', active: true };

function ImagePreview({ src, alt, size = 56 }) {
  if (src) {
    return <img src={src} alt={alt} style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />;
  }

  return (
    <div style={{ width: size, height: size, borderRadius: 8, border: '1px dashed var(--border)', background: 'var(--bg-card2)' }} />
  );
}

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_ITEM_FORM);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [editing, setEditing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [menuData, categoryData] = await Promise.all([getMenuAdmin(), getCategoriesAdmin()]);
      setItems(menuData);
      setCategories(categoryData);
    } catch {
      toast.error('Khong tai duoc du lieu quan ly');
    } finally {
      setLoading(false);
    }
  }

  function defaultCategoryKey() {
    return categories[0]?.key || '';
  }

  function categoryLabel(key) {
    return categories.find((category) => category.key === key)?.label || key || 'Chua co danh muc';
  }

  function openEdit(item) {
    setForm({
      name: item.name || '',
      price: item.price?.toString?.() || '',
      category: item.category || defaultCategoryKey(),
      description: item.description || '',
      available: item.available ?? true,
      image: item.image || '',
    });
    setEditing(item._id);
    setShowForm(true);
  }

  function openNew() {
    setForm({ ...EMPTY_ITEM_FORM, category: defaultCategoryKey() });
    setEditing(null);
    setShowForm(true);
  }

  function openCategoryEdit(category) {
    setCategoryForm({
      key: category.key || '',
      label: category.label || '',
      icon: category.icon || '',
      sortOrder: category.sortOrder?.toString?.() || '',
      active: category.active ?? true,
    });
    setEditingCategory(category._id);
    setShowCategoryForm(true);
  }

  function openCategoryNew() {
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setEditingCategory(null);
    setShowCategoryForm(true);
  }

  async function handleImageChange(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Chi chap nhan file anh');
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, image: imageUrl }));
      toast.success('Da upload anh');
    } catch (error) {
      toast.error(error.message || 'Loi upload anh');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name || !form.price) return toast.error('Nhap ten va gia');
    if (!form.category) return toast.error('Chon danh muc');

    try {
      const payload = { ...form, price: parseInt(form.price, 10) };
      if (editing) {
        const updated = await updateMenuItem(editing, payload);
        setItems((prev) => prev.map((item) => (item._id === editing ? updated : item)));
        toast.success('Da cap nhat mon');
      } else {
        const created = await createMenuItem(payload);
        setItems((prev) => [...prev, created]);
        toast.success('Da them mon moi');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Loi luu mon');
    }
  }

  async function handleSaveCategory() {
    if (!categoryForm.label) return toast.error('Nhap ten danh muc');

    try {
      const payload = {
        ...categoryForm,
        sortOrder: parseInt(categoryForm.sortOrder || '0', 10),
      };

      if (editingCategory) {
        const updated = await updateCategory(editingCategory, payload);
        setCategories((prev) => prev.map((category) => (category._id === editingCategory ? updated : category)));
        await loadAll();
        toast.success('Da cap nhat danh muc');
      } else {
        const created = await createCategory(payload);
        setCategories((prev) => [...prev, created]);
        toast.success('Da them danh muc');
      }
      setShowCategoryForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Loi luu danh muc');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xoa mon nay?')) return;
    try {
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success('Da xoa');
    } catch {
      toast.error('Loi xoa mon');
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm('Xoa danh muc nay?')) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((category) => category._id !== id));
      toast.success('Da xoa danh muc');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Loi xoa danh muc');
    }
  }

  const sortedItems = useMemo(() => items.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name)), [items]);
  const sortedCategories = useMemo(() => categories.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.label.localeCompare(b.label)), [categories]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Dang tai...</div>;

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Quản lý danh mục</h2>
          <button onClick={openCategoryNew} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 700 }}>
            + Thêm danh mục
          </button>
        </div>

        {showCategoryForm && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px', gap: 10, alignItems: 'end' }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Tên danh mục
                <input value={categoryForm.label} onChange={(e) => setCategoryForm((prev) => ({ ...prev, label: e.target.value }))} style={{ marginTop: 5, width: '100%', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)' }} />
              </label>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Mã danh mục
                <input value={categoryForm.key} onChange={(e) => setCategoryForm((prev) => ({ ...prev, key: e.target.value }))} placeholder="tự động nếu bỏ trống" style={{ marginTop: 5, width: '100%', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)' }} />
              </label>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Icon
                <input value={categoryForm.icon} onChange={(e) => setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))} style={{ marginTop: 5, width: '100%', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)' }} />
              </label>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Thứ tự
                <input type="number" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm((prev) => ({ ...prev, sortOrder: e.target.value }))} style={{ marginTop: 5, width: '100%', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)' }} />
              </label>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginTop: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={categoryForm.active} onChange={(e) => setCategoryForm((prev) => ({ ...prev, active: e.target.checked }))} />
              Hiển thị trên menu khách
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={() => setShowCategoryForm(false)} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)' }}>Huỷ</button>
              <button onClick={handleSaveCategory} style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: 'var(--primary)', color: 'white', fontWeight: 700 }}>Lưu danh mục</button>
            </div>
          </div>
        )}

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card2)' }}>
                {['Icon', 'Tên', 'Mã', 'Thứ tự', 'Trạng thái', 'Thao tác'].map((header) => (
                  <th key={header} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{header}</th>
                ))}
              </tr>
            </thead>            <tbody>
              {sortedCategories.map((category) => (
                <tr key={category._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontSize: 18 }}>{category.icon}</td>
                  <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700 }}>{category.label}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>{category.key}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{category.sortOrder || 0}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, background: category.active ? 'rgba(99,153,34,0.15)' : 'rgba(226,75,74,0.15)', color: category.active ? '#639922' : '#E24B4A', fontWeight: 600 }}>
                      {category.active ? 'Đang hiện' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                    <button onClick={() => openCategoryEdit(category)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 12 }}>Sửa</button>
                    <button onClick={() => handleDeleteCategory(category._id)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'rgba(226,75,74,0.15)', color: '#E24B4A', fontSize: 12, fontWeight: 600 }}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Quản lý thực đơn</h2>
          <button onClick={openNew} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 700 }}>
            + Thêm món
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20, overflowX: 'auto' }}>
            <div style={{ minWidth: 640 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>{editing ? 'Sua mon' : 'Them mon moi'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Tên món *
                  <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} style={{ marginTop: 5, width: '100%', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14 }} />
                </label>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Giá (VND) *
                  <input value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} type="number" style={{ marginTop: 5, width: '100%', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14 }} />
                </label>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Danh mục
                  <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} style={{ marginTop: 5, width: '100%', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14 }}>
                    <option value="">Chọn danh mục</option>
                    {sortedCategories.map((category) => <option key={category._id} value={category.key}>{category.label}</option>)}
                  </select>
                </label>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Anh mon
                  <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0])} disabled={uploading} style={{ marginTop: 5, width: '100%', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 14, opacity: uploading ? 0.6 : 1 }} />
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ImagePreview src={form.image} alt={form.name || 'preview'} />
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{uploading ? 'Dang upload...' : 'Upload truc tiep len Cloudinary'}</div>
                  </div>
                </label>
              </div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>
                Mo ta
                <input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} style={{ marginTop: 5, width: '100%', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14 }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 16, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.available} onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.checked }))} />
                Con phuc vu
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)', fontSize: 14 }}>Huy</button>
                <button onClick={handleSave} style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: 14 }}>Luu</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflowX: 'auto', overflowY: 'hidden' }}>
          <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card2)' }}>
                {['', 'Tên món', 'Danh mục', 'Giá', 'Trạng thái', 'Thao tác'].map((header) => (
                  <th key={header} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px' }}><ImagePreview src={item.image} alt={item.name} size={44} /></td>
                  <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>{categoryLabel(item.category)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{item.price.toLocaleString('vi-VN')}d</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, background: item.available ? 'rgba(99,153,34,0.15)' : 'rgba(226,75,74,0.15)', color: item.available ? '#639922' : '#E24B4A', fontWeight: 600 }}>
                      {item.available ? 'Còn món' : 'Hết'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(item)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 12 }}>Sửa</button>
                    <button onClick={() => handleDelete(item._id)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'rgba(226,75,74,0.15)', color: '#E24B4A', fontSize: 12, fontWeight: 600 }}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
