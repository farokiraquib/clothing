import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, ClipboardList, LogOut, Package, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCategories, updateCategory, API_ROOT } from '../../api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const { isAdmin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    loadCategories();
  }, [isAdmin]);

  const loadCategories = () => {
    setLoading(true);
    getCategories().then(c => {
      setCategories(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleImageUpload = async (categoryId, file) => {
    if (!file) return;
    setUploadingId(categoryId);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await updateCategory(categoryId, fd);
      loadCategories(); // Reload to get updated image
    } catch (err) {
      alert('Failed to update category image');
    }
    setUploadingId(null);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">SupremeIt Admin</div>
        <Link to="/admin/dashboard"><LayoutDashboard size={18} /> Dashboard</Link>
        <Link to="/admin/products"><Box size={18} /> Products</Link>
        <Link to="/admin/orders"><ClipboardList size={18} /> Orders</Link>
        <Link to="/admin/categories" className="active"><ImageIcon size={18} /> Categories</Link>
        <Link to="/admin/settings"><Settings size={18} /> Settings</Link>
        <div style={{marginTop:'auto',paddingTop:32}}>
          <Link to="/"><Package size={18} /> View Store</Link>
          <button onClick={() => { logoutAdmin(); navigate('/admin'); }} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',color:'rgba(255,255,255,0.7)',fontSize:14,width:'100%'}}><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      <main className="admin-content">
        <h1>Categories</h1>
        <p style={{color:'var(--text-secondary)',marginBottom:24}}>Upload banner images for the homepage category grid. For best results, use vertical 3:4 aspect ratio images (e.g., 600x800).</p>
        
        {loading ? (
           <p>Loading...</p>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:24}}>
            {categories.map(c => (
              <div key={c.id} style={{background:'var(--bg-surface)',borderRadius:12,padding:16,border:'1px solid var(--border)'}}>
                <h3 style={{textTransform:'capitalize',marginBottom:16,fontSize:18}}>{c.name}</h3>
                <div style={{width:'100%',aspectRatio:'3/4',backgroundColor:'var(--bg-secondary)',borderRadius:8,overflow:'hidden',marginBottom:16,position:'relative'}}>
                  {c.image ? (
                    <img src={c.image.startsWith('/uploads') ? `${API_ROOT}${c.image}` : c.image} alt={c.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  ) : (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-tertiary)'}}>No Image</div>
                  )}
                  {uploadingId === c.id && (
                    <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontWeight:600}}>Uploading...</span>
                    </div>
                  )}
                </div>
                
                <label className="btn btn-outline" style={{width:'100%',textAlign:'center',cursor:'pointer',display:'block'}}>
                  {c.image ? 'Replace Image' : 'Upload Image'}
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={(e) => handleImageUpload(c.id, e.target.files[0])} disabled={uploadingId === c.id} />
                </label>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
