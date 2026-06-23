import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LayoutDashboard, Box, ClipboardList, LogOut, Package, Search, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProducts, deleteProduct, API_ROOT } from '../../api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const { isAdmin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    loadProducts();
  }, [isAdmin]);

  const loadProducts = () => {
    setLoading(true);
    getProducts({ limit: 100 }).then(d => { setProducts(d.products); setLoading(false); }).catch(() => setLoading(false));
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteProduct(deleteModal.id);
      setDeleteModal(null);
      loadProducts();
    } catch { alert('Failed to delete'); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">SupremeIt Admin</div>
        <Link to="/admin/dashboard"><LayoutDashboard size={18} /> Dashboard</Link>
        <Link to="/admin/products" className="active"><Box size={18} /> Products</Link>
        <Link to="/admin/orders"><ClipboardList size={18} /> Orders</Link>
        <Link to="/admin/categories"><ImageIcon size={18} /> Categories</Link>
        <Link to="/admin/settings"><Settings size={18} /> Settings</Link>
        <Link to="/admin/products/new"><Plus size={18} /> Add Product</Link>
        <div style={{marginTop:'auto',paddingTop:32}}>
          <Link to="/"><Package size={18} /> View Store</Link>
          <button onClick={() => { logoutAdmin(); navigate('/admin'); }} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',color:'rgba(255,255,255,0.7)',fontSize:14,width:'100%'}}><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      <main className="admin-content">
        <h1>Products</h1>
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <Search size={16} style={{color:'var(--text-tertiary)'}} />
              <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                style={{border:'none',outline:'none',fontSize:14,background:'transparent',width:200}} />
            </div>
            <Link to="/admin/products/new" className="btn btn-primary btn-sm"><Plus size={14} /> Add Product</Link>
          </div>
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-table-product">
                      <div style={{width:48,height:48,borderRadius:6,overflow:'hidden',background:'var(--bg-surface)'}}>
                        {p.images?.[0]?.startsWith('/uploads') || p.images?.[0]?.startsWith('http') ? (
                          <img src={p.images[0].startsWith('http') ? p.images[0] : `${API_ROOT}${p.images[0]}`} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        ) : (
                          <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#f0ebe3,#e8e0d2)',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600}}>{p.brand?.substring(0,3).toUpperCase()}</div>
                        )}
                      </div>
                      <div><div style={{fontWeight:500}}>{p.name}</div><div style={{fontSize:12,color:'var(--text-tertiary)'}}>{p.id}</div></div>
                    </div>
                  </td>
                  <td style={{textTransform:'capitalize'}}>{p.brand}</td>
                  <td style={{textTransform:'capitalize'}}>{p.category}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td><span className={`badge ${p.stock < 10 ? 'badge-warning' : 'badge-success'}`}>{p.stock}</span></td>
                  <td>
                    <div className="admin-table-actions">
                      <button onClick={() => navigate(`/admin/products/edit/${p.id}`)} title="Edit"><Edit size={16} /></button>
                      <button className="delete-btn" onClick={() => setDeleteModal(p)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {deleteModal && (
          <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Delete Product</h3>
              <p>Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setDeleteModal(null)}>Cancel</button>
                <button className="btn btn-primary" style={{background:'var(--error)'}} onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
