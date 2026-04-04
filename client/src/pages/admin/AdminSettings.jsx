import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, LayoutDashboard, Box, ClipboardList, LogOut, Plus, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSettings, updateSettings, API_ROOT } from '../../api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({ heroImage1: '', heroImage2: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const { isAdmin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    getSettings().then(res => {
      setSettings(res || { heroImage1: '', heroImage2: '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAdmin, navigate]);

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    const formData = new FormData();
    formData.append('images', file);

    try {
      const pw = localStorage.getItem('adminPassword');
      const res = await fetch(`${API_ROOT}/api/admin/upload`, {
        method: 'POST',
        headers: { 'x-admin-password': pw },
        body: formData
      }).then(r => r.json());

      if (res.urls && res.urls[0]) {
        const url = res.urls[0];
        setSettings({...settings, [field]: url});
        
        // Immediately save it to DB
        await updateSettings({...settings, [field]: url});
        setMessage('Image updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Mac Miller Admin</div>
        <Link to="/admin/dashboard"><LayoutDashboard size={18} /> Dashboard</Link>
        <Link to="/admin/products"><Box size={18} /> Products</Link>
        <Link to="/admin/orders"><ClipboardList size={18} /> Orders</Link>
        <Link to="/admin/categories"><ImageIcon size={18} /> Categories</Link>
        <Link to="/admin/settings" className="active"><Settings size={18} /> Settings</Link>
        <Link to="/admin/products/new"><Plus size={18} /> Add Product</Link>
        <div style={{marginTop:'auto',paddingTop:32}}>
          <Link to="/" style={{opacity:0.6}}><Package size={18} /> View Store</Link>
          <button onClick={() => { logoutAdmin(); navigate('/admin'); }} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',color:'rgba(255,255,255,0.7)',fontSize:14,width:'100%'}}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      
      <main className="admin-content">
        <h1>Storefront Settings</h1>
        {message && <div style={{padding:12,background:'#e0faeb',color:'var(--success)',borderRadius:8,marginBottom:16}}>{message}</div>}

        <div className="admin-form" style={{maxWidth: 600}}>
          <div className="form-group">
            <label>Trending Hero Image (Left)</label>
            <p style={{fontSize: 13, color:'var(--text-secondary)', marginBottom: 8}}>Recommended size: 600x800. This is the first main image card on the homepage.</p>
            {settings.heroImage1 && (
              <div style={{marginBottom: 16, height: 200, width: 150, borderRadius: 12, overflow: 'hidden'}}>
                <img src={settings.heroImage1.startsWith('http') ? settings.heroImage1 : `${API_ROOT}${settings.heroImage1}`} alt="Hero 1" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'heroImage1')} disabled={saving} />
          </div>

          <div className="form-group" style={{marginTop: 32}}>
            <label>Best Seller Hero Image (Right)</label>
            <p style={{fontSize: 13, color:'var(--text-secondary)', marginBottom: 8}}>Recommended size: 600x800. This is the second main image card on the homepage.</p>
            {settings.heroImage2 && (
              <div style={{marginBottom: 16, height: 200, width: 150, borderRadius: 12, overflow: 'hidden'}}>
                <img src={settings.heroImage2.startsWith('http') ? settings.heroImage2 : `${API_ROOT}${settings.heroImage2}`} alt="Hero 2" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'heroImage2')} disabled={saving} />
          </div>
        </div>
      </main>
    </div>
  );
}
