import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, LayoutDashboard, Box, ClipboardList, LogOut,
  Plus, Image as ImageIcon, Settings, Trash2, Edit3,
  ChevronUp, ChevronDown, Upload, X, Check, GripVertical, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBanners, addBanner, updateBanner, deleteBanner, reorderBanners, API_ROOT } from '../../api';

/* ── Sidebar (shared across admin pages) ── */
function AdminSidebar({ active }) {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-title">Mac Miller Admin</div>
      <Link to="/admin/dashboard"  className={active === 'dashboard'  ? 'active' : ''}><LayoutDashboard size={18}/> Dashboard</Link>
      <Link to="/admin/products"   className={active === 'products'   ? 'active' : ''}><Box size={18}/> Products</Link>
      <Link to="/admin/orders"     className={active === 'orders'     ? 'active' : ''}><ClipboardList size={18}/> Orders</Link>
      <Link to="/admin/categories" className={active === 'categories' ? 'active' : ''}><ImageIcon size={18}/> Categories</Link>
      <Link to="/admin/settings"   className={active === 'settings'   ? 'active' : ''}><Settings size={18}/> Settings</Link>
      <Link to="/admin/products/new"><Plus size={18}/> Add Product</Link>
      <div style={{ marginTop: 'auto', paddingTop: 32 }}>
        <Link to="/" style={{ opacity: 0.6 }}><Package size={18}/> View Store</Link>
        <button onClick={() => { logoutAdmin(); navigate('/admin'); }}
          style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', color:'rgba(255,255,255,0.7)', fontSize:14, width:'100%' }}>
          <LogOut size={18}/> Logout
        </button>
      </div>
    </aside>
  );
}

/* ── Banner Form Modal ── */
const EMPTY = { url:'', tag:'', headline:'', sub:'', cta:'Shop Now', link:'/shop', align:'left', dark:false };

function BannerModal({ banner, onSave, onClose, uploading, onUpload }) {
  const [form, setForm] = useState(banner ? { ...banner } : { ...EMPTY });
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="banner-modal">
        <div className="banner-modal-header">
          <h3>{banner ? 'Edit Banner' : 'Add New Banner'}</h3>
          <button onClick={onClose} className="banner-modal-close"><X size={20}/></button>
        </div>

        {/* Image Upload */}
        <div className="banner-field">
          <label>Banner Image *</label>
          {form.url && (
            <div className="banner-preview-thumb">
              <img src={form.url.startsWith('http') ? form.url : `${API_ROOT}${form.url}`} alt="preview" />
              <button className="banner-preview-remove" onClick={() => set('url', '')}><X size={14}/></button>
            </div>
          )}
          {!form.url && (
            <div className="banner-upload-zone" onClick={() => fileRef.current?.click()}>
              {uploading ? (
                <div className="banner-upload-spinner" />
              ) : (
                <>
                  <Upload size={28} />
                  <span>Click to upload image</span>
                  <span style={{ fontSize: 12, opacity: 0.6 }}>Recommended: 1600×700px</span>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                onChange={(e) => onUpload(e.target.files[0], (url) => set('url', url))} />
            </div>
          )}
          {form.url && (
            <button className="banner-reupload-btn" onClick={() => fileRef.current?.click()}>
              <Upload size={14}/> Replace Image
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                onChange={(e) => onUpload(e.target.files[0], (url) => set('url', url))} />
            </button>
          )}
        </div>

        <div className="banner-form-grid">
          <div className="banner-field">
            <label>Tag Label</label>
            <input placeholder="e.g. New Season 2026" value={form.tag} onChange={e => set('tag', e.target.value)} />
          </div>
          <div className="banner-field">
            <label>Headline</label>
            <input placeholder="e.g. Elevate Your Style" value={form.headline} onChange={e => set('headline', e.target.value)} />
          </div>
          <div className="banner-field full">
            <label>Subtext</label>
            <input placeholder="Short description..." value={form.sub} onChange={e => set('sub', e.target.value)} />
          </div>
          <div className="banner-field">
            <label>CTA Button Text</label>
            <input placeholder="Shop Now" value={form.cta} onChange={e => set('cta', e.target.value)} />
          </div>
          <div className="banner-field">
            <label>CTA Link</label>
            <input placeholder="/shop?category=men" value={form.link} onChange={e => set('link', e.target.value)} />
          </div>
          <div className="banner-field">
            <label>Text Alignment</label>
            <select value={form.align} onChange={e => set('align', e.target.value)}>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="banner-field" style={{ alignItems:'center', flexDirection:'row', gap:12, paddingTop:24 }}>
            <input type="checkbox" id="darkMode" checked={form.dark} onChange={e => set('dark', e.target.checked)} style={{ width:18, height:18 }}/>
            <label htmlFor="darkMode" style={{ marginBottom:0, fontWeight:500 }}>Dark overlay (for bright images)</label>
          </div>
        </div>

        <div className="banner-modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!form.url}>
            <Check size={16}/> {banner ? 'Save Changes' : 'Add Banner'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminSettings() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | banner object
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState('');

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    getBanners().then(res => { setBanners(res || []); setLoading(false); }).catch(() => setLoading(false));
  }, [isAdmin, navigate]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* Upload helper — shared by modal */
  const handleUpload = async (file, onUrl) => {
    if (!file) return;
    setUploading(true);
    try {
      const pw = localStorage.getItem('adminPassword');
      const fd = new FormData();
      fd.append('images', file);
      const res = await fetch(`${API_ROOT}/api/admin/upload`, {
        method: 'POST',
        headers: { 'x-admin-password': pw },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (data.urls?.[0]) onUrl(data.urls[0]);
    } catch (err) { 
      alert(err.message || 'Upload failed'); 
    } finally { 
      setUploading(false); 
    }
  };

  /* Save (add or edit) */
  const handleSave = async (form) => {
    try {
      let updated;
      if (modal === 'add') {
        updated = await addBanner(form);
      } else {
        updated = await updateBanner(modal._id, form);
      }
      setBanners(updated);
      setModal(null);
      showToast(modal === 'add' ? 'Banner added!' : 'Banner updated!');
    } catch { alert('Save failed'); }
  };

  /* Delete */
  const handleDelete = async (id) => {
    try {
      const updated = await deleteBanner(id);
      setBanners(updated);
      setDeleteConfirm(null);
      showToast('Banner deleted.');
    } catch { alert('Delete failed'); }
  };

  /* Reorder — move up or down */
  const moveItem = async (idx, dir) => {
    const list = [...banners];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
    const orderPayload = list.map((b, i) => ({ id: b._id, order: i }));
    setBanners(list); // optimistic
    try {
      const updated = await reorderBanners(orderPayload);
      setBanners(updated);
    } catch { /* revert silently */ }
  };

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar active="settings" />
      <main className="admin-content"><div className="skeleton" style={{ height: 200, borderRadius: 12 }} /></main>
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminSidebar active="settings" />

      <main className="admin-content">
        <div className="banner-page-header">
          <div>
            <h1>Hero Banners</h1>
            <p className="banner-page-sub">Manage the homepage slideshow. Drag to reorder or use arrows.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={16}/> Add Banner
          </button>
        </div>

        {/* Toast */}
        {toast && <div className="banner-toast"><Check size={14}/> {toast}</div>}

        {banners.length === 0 ? (
          <div className="banner-empty">
            <ImageIcon size={48} style={{ opacity: 0.25, marginBottom: 16 }} />
            <h3>No banners yet</h3>
            <p>Add your first banner to power the homepage slideshow.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal('add')}>
              <Plus size={16}/> Add First Banner
            </button>
          </div>
        ) : (
          <div className="banner-list">
            {banners.map((b, idx) => (
              <div key={b._id} className="banner-row">
                {/* Thumb */}
                <div className="banner-row-thumb">
                  <img src={b.url.startsWith('http') ? b.url : `${API_ROOT}${b.url}`} alt="banner" />
                  <span className="banner-row-num">#{idx + 1}</span>
                </div>

                {/* Info */}
                <div className="banner-row-info">
                  <div className="banner-row-tag">{b.tag || 'No tag'}</div>
                  <div className="banner-row-headline">{b.headline || <em style={{ opacity: 0.4 }}>No headline</em>}</div>
                  <div className="banner-row-meta">
                    <span>{b.align === 'left' ? '← Left' : 'Right →'}</span>
                    <span>·</span>
                    <span>{b.dark ? 'Dark overlay' : 'Light overlay'}</span>
                    <span>·</span>
                    <span className="banner-row-link">{b.link}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="banner-row-actions">
                  <button title="Move up"    onClick={() => moveItem(idx, -1)} disabled={idx === 0}            className="banner-icon-btn"><ChevronUp size={18}/></button>
                  <button title="Move down"  onClick={() => moveItem(idx, 1)}  disabled={idx === banners.length - 1} className="banner-icon-btn"><ChevronDown size={18}/></button>
                  <a href={b.link} target="_blank" rel="noreferrer" title="Preview" className="banner-icon-btn"><Eye size={18}/></a>
                  <button title="Edit"   onClick={() => setModal(b)}           className="banner-icon-btn banner-icon-btn--edit"><Edit3 size={18}/></button>
                  <button title="Delete" onClick={() => setDeleteConfirm(b._id)} className="banner-icon-btn banner-icon-btn--delete"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info note */}
        <div className="banner-note">
          <strong>Tip:</strong> Use the ↑ ↓ arrows to reorder slides. Changes save immediately.
          Recommended image size: <strong>1600 × 700px</strong>.
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <BannerModal
          banner={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          uploading={uploading}
          onUpload={handleUpload}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Banner?</h3>
            <p>This will permanently remove the banner from the homepage slideshow.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background:'var(--error)', color:'#fff' }} onClick={() => handleDelete(deleteConfirm)}>
                <Trash2 size={16}/> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
