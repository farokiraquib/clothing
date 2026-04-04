import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Package, ShoppingCart, DollarSign, AlertTriangle, LayoutDashboard, Box, ClipboardList, LogOut, Plus, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats, exportCustomersCSV } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const { isAdmin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    getAdminStats().then(setStats).catch(() => {});
  }, [isAdmin]);

  const formatPrice = (p) => `₹${(p || 0).toLocaleString('en-IN')}`;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Mac Miller Admin</div>
        <Link to="/admin/dashboard" className="active"><LayoutDashboard size={18} /> Dashboard</Link>
        <Link to="/admin/products"><Box size={18} /> Products</Link>
        <Link to="/admin/orders"><ClipboardList size={18} /> Orders</Link>
        <Link to="/admin/categories"><ImageIcon size={18} /> Categories</Link>
        <Link to="/admin/settings"><Settings size={18} /> Settings</Link>
        <Link to="/admin/products/new"><Plus size={18} /> Add Product</Link>
        <div style={{marginTop:'auto',paddingTop:32}}>
          <Link to="/" style={{opacity:0.6}}><Package size={18} /> View Store</Link>
          <button onClick={() => { logoutAdmin(); navigate('/admin'); }} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',color:'rgba(255,255,255,0.7)',fontSize:14,width:'100%'}}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <h1 style={{marginBottom:0}}>Dashboard</h1>
          <button className="btn btn-outline" onClick={exportCustomersCSV} style={{display:'flex',alignItems:'center',gap:8}}>
            <Download size={16} /> Export Customers
          </button>
        </div>
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="label">Total Products</div>
            <div className="value">{stats.totalProducts || 0}</div>
          </div>
          <div className="admin-stat-card">
            <div className="label">Total Orders</div>
            <div className="value">{stats.totalOrders || 0}</div>
          </div>
          <div className="admin-stat-card">
            <div className="label">Revenue</div>
            <div className="value">{formatPrice(stats.totalRevenue)}</div>
          </div>
          <div className="admin-stat-card">
            <div className="label">Low Stock</div>
            <div className="value" style={{color: stats.lowStock > 0 ? 'var(--warning)' : 'inherit'}}>{stats.lowStock || 0}</div>
            <div className="sub">Products with &lt; 10 stock</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <Link to="/admin/products" className="admin-stat-card" style={{textDecoration:'none',cursor:'pointer'}}>
            <Box size={24} style={{marginBottom:8,color:'var(--admin-accent)'}} />
            <h3 style={{fontSize:16,fontWeight:600}}>Manage Products</h3>
            <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:4}}>Add, edit, or remove products</p>
          </Link>
          <Link to="/admin/orders" className="admin-stat-card" style={{textDecoration:'none',cursor:'pointer'}}>
            <ClipboardList size={24} style={{marginBottom:8,color:'var(--admin-accent)'}} />
            <h3 style={{fontSize:16,fontWeight:600}}>Manage Orders</h3>
            <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:4}}>View and update order status</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
