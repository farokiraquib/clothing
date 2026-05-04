import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, Phone, Mail, Edit2, Check, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { updateMyProfile, getMyOrders } from '../api';

const STATUSES = {
  Processing: { color: '#f59e0b', bg: '#fef3c7' },
  Confirmed:  { color: '#3b82f6', bg: '#dbeafe' },
  Shipped:    { color: '#8b5cf6', bg: '#ede9fe' },
  Delivered:  { color: '#10b981', bg: '#d1fae5' },
  Cancelled:  { color: '#ef4444', bg: '#fee2e2' },
};

export default function Profile() {
  const [searchParams]         = useSearchParams();
  const navigate               = useNavigate();
  const { user, token, logout, updateUser } = useUser();
  const [tab, setTab]          = useState(searchParams.get('tab') === 'orders' ? 'orders' : 'account');
  const [orders, setOrders]    = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editing, setEditing]  = useState(false);
  const [saving, setSaving]    = useState(false);
  const [form, setForm]        = useState({ name: '', phone: '', address: { line1: '', city: '', state: '', pincode: '' } });
  const [saved, setSaved]      = useState(false);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    setForm({ name: user.name || '', phone: user.phone || '', address: { line1: user.address?.line1 || '', city: user.address?.city || '', state: user.address?.state || '', pincode: user.address?.pincode || '' } });
  }, [user]);

  useEffect(() => {
    if (tab === 'orders' && token) {
      setOrdersLoading(true);
      getMyOrders(token).then(setOrders).catch(() => {}).finally(() => setOrdersLoading(false));
    }
  }, [tab, token]);

  if (!user) return null;

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const formatDate  = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const initials    = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const updated = await updateMyProfile(token, form);
      updateUser(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'orders',  label: 'My Orders',  icon: Package },
  ];

  return (
    <div className="page-enter" style={{ minHeight: '80vh', padding: '40px 0', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* Profile Header */}
        <div className="profile-header">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{user.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 13 }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-bg)', padding: 6, borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: tab === id ? 'var(--accent)' : 'transparent',
              color: tab === id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {tab === 'account' && (
          <div style={{ background: 'var(--surface-bg)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Account Details</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>
                  <Edit2 size={14} /> Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSave} style={{ padding: 28 }}>
              {saved && (
                <div className="animate-pop" style={{ background: '#d1fae5', color: '#065f46', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={15} /> Profile updated successfully!
                </div>
              )}
              <div className="profile-grid">
                {[
                  { label: 'Full Name', field: 'name', icon: User, isTop: true },
                  { label: 'Phone', field: 'phone', icon: Phone, isTop: true },
                ].map(({ label, field, icon: Icon, isTop }) => (
                  <div key={field}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Icon size={12} /> {label}
                    </label>
                    {editing ? (
                      <input
                        value={isTop ? form[field] : form.address[field]}
                        onChange={e => isTop
                          ? setForm(p => ({ ...p, [field]: e.target.value }))
                          : setForm(p => ({ ...p, address: { ...p.address, [field]: e.target.value } }))
                        }
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', fontSize: 14 }}
                      />
                    ) : (
                      <p style={{ fontSize: 15, color: form[field] ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                        {form[field] || '—'}
                      </p>
                    )}
                  </div>
                ))}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Mail size={12} /> Email
                  </label>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{user.email} (cannot change)</p>
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <MapPin size={12} /> Saved Address
                </label>
                <div className="profile-grid" style={{ gap: 12 }}>
                  {[
                    { label: 'Address Line 1', key: 'line1' },
                    { label: 'City', key: 'city' },
                    { label: 'State', key: 'state' },
                    { label: 'PIN Code', key: 'pincode' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4, display: 'block' }}>{label}</label>
                      {editing ? (
                        <input
                          value={form.address[key] || ''}
                          onChange={e => setForm(p => ({ ...p, address: { ...p.address, [key]: e.target.value } }))}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', fontSize: 14 }}
                        />
                      ) : (
                        <p style={{ fontSize: 14, color: form.address[key] ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                          {form.address[key] || '—'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {editing && (
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button type="submit" disabled={saving} style={{ padding: '11px 24px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} style={{ padding: '11px 24px', borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80, background: 'var(--surface-bg)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <Package size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>No orders yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>When you place an order, it will appear here.</p>
                <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map(order => {
                  const s = STATUSES[order.status] || STATUSES.Processing;
                  return (
                    <div key={order._id} style={{ background: 'var(--surface-bg)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Order ID: </span>
                          <strong style={{ fontSize: 14 }}>{order.id}</strong>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(order.createdAt)}</span>
                        <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
                          {order.status}
                        </span>
                        <strong style={{ fontSize: 15 }}>{formatPrice(order.total)}</strong>
                      </div>
                      <div style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.quantity} <span style={{ fontSize: 12 }}>({item.size})</span></span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
