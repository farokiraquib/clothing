import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, ClipboardList, Plus, LogOut, Package, Eye, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrders, updateOrderStatus } from '../../api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    loadOrders();
  }, [isAdmin]);

  const loadOrders = () => {
    setLoading(true);
    getOrders().then(d => { setOrders(d); setLoading(false); }).catch(() => setLoading(false));
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status });
      loadOrders();
    } catch { alert('Failed to update status'); }
  };

  const formatPrice = (p) => `₹${(p || 0).toLocaleString('en-IN')}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusColor = (s) => {
    if (s === 'Delivered') return 'badge-success';
    if (s === 'Shipped') return 'badge-accent';
    if (s === 'Processing') return 'badge-warning';
    return 'badge-error';
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Mac Miller Admin</div>
        <Link to="/admin/dashboard"><LayoutDashboard size={18} /> Dashboard</Link>
        <Link to="/admin/products"><Box size={18} /> Products</Link>
        <Link to="/admin/orders" className="active"><ClipboardList size={18} /> Orders</Link>
        <Link to="/admin/categories"><ImageIcon size={18} /> Categories</Link>
        <Link to="/admin/settings"><Settings size={18} /> Settings</Link>
        <Link to="/admin/products/new"><Plus size={18} /> Add Product</Link>
        <div style={{marginTop:'auto',paddingTop:32}}>
          <Link to="/"><Package size={18} /> View Store</Link>
          <button onClick={() => { logoutAdmin(); navigate('/admin'); }} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',color:'rgba(255,255,255,0.7)',fontSize:14,width:'100%'}}><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      <main className="admin-content">
        <h1>Orders</h1>
        {orders.length === 0 && !loading ? (
          <div style={{textAlign:'center',padding:48,background:'var(--bg-surface)',borderRadius:12,border:'1px solid var(--border)'}}>
            <ClipboardList size={40} style={{color:'var(--text-tertiary)',marginBottom:16}} />
            <h3 style={{marginBottom:8}}>No orders yet</h3>
            <p style={{color:'var(--text-secondary)'}}>Orders will appear here once customers place them.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{fontWeight:600}}>{o.id}</td>
                    <td>{o.customer?.name || 'N/A'}</td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>{formatPrice(o.total)}</td>
                    <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                          style={{padding:'4px 8px',fontSize:12,border:'1px solid var(--border)',borderRadius:4}}>
                          <option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option>
                        </select>
                        <button onClick={() => setSelectedOrder(o)} style={{padding:4}}><Eye size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:560}}>
              <h3>Order {selectedOrder.id}</h3>
              <div style={{fontSize:14,marginBottom:16}}>
                <p><strong>Customer:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>
                <p><strong>Address:</strong> {selectedOrder.customer?.address}, {selectedOrder.customer?.city}, {selectedOrder.customer?.state} - {selectedOrder.customer?.pincode}</p>
              </div>
              <h4 style={{marginBottom:8}}>Items</h4>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:14,borderBottom:'1px solid var(--border)'}}>
                  <span>{item.name} (Size: {item.size}) × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',fontWeight:700,marginTop:8}}>
                <span>Total</span><span>{formatPrice(selectedOrder.total)}</span>
              </div>
              <div className="modal-actions"><button className="btn btn-primary" onClick={() => setSelectedOrder(null)}>Close</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
