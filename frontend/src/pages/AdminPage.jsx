import React, { useState, useEffect, useCallback } from 'react';
import {
  adminLogin, adminLogout,
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminGetEnterprises, adminCreateEnterprise, adminUpdateEnterprise, adminDeleteEnterprise,
  uploadImage, API_BASE_URL,
} from '../services/api';

// === Login Form ===
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin(username, password);
      onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Panel</h1>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-2.5 disabled:opacity-50">
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}

// === Confirm Dialog ===
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <p className="text-gray-800 mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">ยืนยันลบ</button>
        </div>
      </div>
    </div>
  );
}

// === Product Form ===
function ProductForm({ initial, onSave, onCancel, token }) {
  const [form, setForm] = useState({
    id: '', name: '', price: '', description: '', weight: '',
    shelfLife: '', categoryId: '', enterpriseId: '', imageUrl: '',
    ...initial,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setForm({ ...form, imageUrl: res.data.url });
    } catch (err) {
      alert(err.response?.data?.error || 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const imgSrc = form.imageUrl
    ? (form.imageUrl.startsWith('http') ? form.imageUrl : `${API_BASE_URL}${form.imageUrl}`)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!initial && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID (ไม่ระบุจะสร้างอัตโนมัติ)</label>
            <input name="id" value={form.id} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="เช่น Product_MyProduct01" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผลิตภัณฑ์ *</label>
          <input name="name" value={form.name} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท) *</label>
          <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">น้ำหนัก</label>
          <input name="weight" value={form.weight} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">อายุเก็บรักษา (วัน)</label>
          <input name="shelfLife" type="number" value={form.shelfLife} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ (Category ID)</label>
          <input name="categoryId" value={form.categoryId} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="เช่น ProcessedMeat, Beverage" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">วิสาหกิจ (Enterprise ID)</label>
          <input name="enterpriseId" value={form.enterpriseId} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="เช่น Enterprise_BanDung" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
        <textarea name="description" rows={3} value={form.description} onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพ</label>
        <div className="flex items-center gap-4">
          <input type="file" accept="image/jpeg,image/png" onChange={handleFileUpload}
            className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
          {uploading && <span className="text-sm text-gray-500">กำลังอัปโหลด...</span>}
        </div>
        {imgSrc && (
          <img src={imgSrc} alt="Preview" className="mt-2 h-32 object-cover rounded-lg border" />
        )}
        {form.imageUrl && (
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange}
            className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-500 outline-none"
            placeholder="URL รูปภาพ" />
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || uploading}
          className="btn-primary px-6 py-2 disabled:opacity-50">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
      </div>
    </form>
  );
}

// === Enterprise Form ===
function EnterpriseForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: '', name: '', description: '',
    ...initial,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initial && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID (ไม่ระบุจะสร้างอัตโนมัติ)</label>
          <input name="id" value={form.id} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="เช่น Enterprise_MyGroup01" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวิสาหกิจ *</label>
        <input name="name" value={form.name} onChange={handleChange} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
        <textarea name="description" rows={3} value={form.description} onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="btn-primary px-6 py-2 disabled:opacity-50">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
      </div>
    </form>
  );
}

// === Main Admin Page ===
export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false); // 'add' | 'edit' | false
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleLogin = (t) => {
    setToken(t);
    sessionStorage.setItem('admin_token', t);
  };

  const handleLogout = async () => {
    try { await adminLogout(token); } catch {}
    setToken('');
    sessionStorage.removeItem('admin_token');
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminGetProducts(token);
      setProducts(res.data.products || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setToken('');
        sessionStorage.removeItem('admin_token');
      } else {
        setError('โหลดข้อมูลผลิตภัณฑ์ไม่สำเร็จ');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadEnterprises = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminGetEnterprises(token);
      setEnterprises(res.data.enterprises || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setToken('');
        sessionStorage.removeItem('admin_token');
      } else {
        setError('โหลดข้อมูลวิสาหกิจไม่สำเร็จ');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (tab === 'products') loadProducts();
    else loadEnterprises();
  }, [token, tab, loadProducts, loadEnterprises]);

  // === Product handlers ===
  const handleSaveProduct = async (formData) => {
    try {
      if (editItem) {
        await adminUpdateProduct(token, editItem.product, formData);
      } else {
        await adminCreateProduct(token, formData);
      }
      setShowForm(false);
      setEditItem(null);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'บันทึกไม่สำเร็จ');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await adminDeleteProduct(token, id);
      setConfirmDelete(null);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'ลบไม่สำเร็จ');
    }
  };

  // === Enterprise handlers ===
  const handleSaveEnterprise = async (formData) => {
    try {
      if (editItem) {
        await adminUpdateEnterprise(token, editItem.enterprise, formData);
      } else {
        await adminCreateEnterprise(token, formData);
      }
      setShowForm(false);
      setEditItem(null);
      loadEnterprises();
    } catch (err) {
      alert(err.response?.data?.error || 'บันทึกไม่สำเร็จ');
    }
  };

  const handleDeleteEnterprise = async (id) => {
    try {
      await adminDeleteEnterprise(token, id);
      setConfirmDelete(null);
      loadEnterprises();
    } catch (err) {
      alert(err.response?.data?.error || 'ลบไม่สำเร็จ');
    }
  };

  if (!token) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        <button onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors">
          ออกจากระบบ
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button onClick={() => { setTab('products'); setShowForm(false); setEditItem(null); }}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'products' ? 'border-primary-800 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          ผลิตภัณฑ์ ({products.length})
        </button>
        <button onClick={() => { setTab('enterprises'); setShowForm(false); setEditItem(null); }}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'enterprises' ? 'border-primary-800 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          วิสาหกิจชุมชน ({enterprises.length})
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editItem ? 'แก้ไข' : 'เพิ่ม'}{tab === 'products' ? 'ผลิตภัณฑ์' : 'วิสาหกิจชุมชน'}
          </h2>
          {tab === 'products' ? (
            <ProductForm
              initial={editItem ? {
                name: editItem.name || '',
                price: editItem.price || '',
                description: editItem.description || '',
                weight: editItem.weight || '',
                shelfLife: editItem.shelfLife || '',
                categoryId: editItem.categoryName || '',
                enterpriseId: editItem.enterpriseName || '',
                imageUrl: editItem.imageUrl || '',
              } : null}
              onSave={handleSaveProduct}
              onCancel={() => { setShowForm(false); setEditItem(null); }}
              token={token}
            />
          ) : (
            <EnterpriseForm
              initial={editItem ? {
                name: editItem.name || '',
                description: editItem.description || '',
              } : null}
              onSave={handleSaveEnterprise}
              onCancel={() => { setShowForm(false); setEditItem(null); }}
            />
          )}
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          className="btn-primary px-5 py-2 mb-4">
          + เพิ่ม{tab === 'products' ? 'ผลิตภัณฑ์' : 'วิสาหกิจชุมชน'}
        </button>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">กำลังโหลด...</div>
      ) : tab === 'products' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">ชื่อ</th>
                <th className="px-4 py-3 font-medium text-gray-600">ราคา</th>
                <th className="px-4 py-3 font-medium text-gray-600">หมวดหมู่</th>
                <th className="px-4 py-3 font-medium text-gray-600">วิสาหกิจ</th>
                <th className="px-4 py-3 font-medium text-gray-600">รูป</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.product} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{parseFloat(p.price).toLocaleString('th-TH')} บาท</td>
                  <td className="px-4 py-3 text-gray-600">{p.categoryName || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{p.enterpriseName || '-'}</td>
                  <td className="px-4 py-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `${API_BASE_URL}${p.imageUrl}`}
                        alt="" className="h-8 w-8 object-cover rounded" />
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditItem(p); setShowForm(true); }}
                      className="text-primary-700 hover:text-primary-900 text-sm mr-3">แก้ไข</button>
                    <button onClick={() => setConfirmDelete({ type: 'product', id: p.product, name: p.name })}
                      className="text-red-500 hover:text-red-700 text-sm">ลบ</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">ไม่พบผลิตภัณฑ์</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">ชื่อ</th>
                <th className="px-4 py-3 font-medium text-gray-600">รายละเอียด</th>
                <th className="px-4 py-3 font-medium text-gray-600">ตำแหน่ง</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enterprises.map((e) => (
                <tr key={e.enterprise} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{e.name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[300px] truncate">{e.description || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.locationName || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditItem(e); setShowForm(true); }}
                      className="text-primary-700 hover:text-primary-900 text-sm mr-3">แก้ไข</button>
                    <button onClick={() => setConfirmDelete({ type: 'enterprise', id: e.enterprise, name: e.name })}
                      className="text-red-500 hover:text-red-700 text-sm">ลบ</button>
                  </td>
                </tr>
              ))}
              {enterprises.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">ไม่พบวิสาหกิจ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          message={`ต้องการลบ "${confirmDelete.name}" หรือไม่? การลบไม่สามารถกู้คืนได้`}
          onConfirm={() => {
            if (confirmDelete.type === 'product') handleDeleteProduct(confirmDelete.id);
            else handleDeleteEnterprise(confirmDelete.id);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
