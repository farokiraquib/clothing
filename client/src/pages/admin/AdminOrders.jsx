import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, ClipboardList, Plus, LogOut, Package, Eye, Trash2, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrders, updateOrderStatus, deleteOrder, sendOrderToQikink } from '../../api';
import { Truck } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingLink, setTrackingLink] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
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

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder(orderId);
        loadOrders();
      } catch { alert('Failed to delete order'); }
    }
  };

  const handleSendToQikink = async (orderId) => {
    if (window.confirm('Send this order to Qikink for fulfillment?')) {
      try {
        const res = await sendOrderToQikink(orderId);
        alert(`Success! Qikink Order ID: ${res.qikinkOrderId}`);
        // Update local state to show the ID
        setSelectedOrder(prev => ({...prev, qikinkOrderId: res.qikinkOrderId}));
        loadOrders(); // Refresh table in background
      } catch (err) {
        console.error('Failed to send to Qikink. Error object:', err);
        console.error('Error Details:', err.details);
        console.error('Payload Sent:', err.payload);
        alert('Failed to send to Qikink. ' + (err.details || err.message));
      }
    }
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
        <div className="admin-sidebar-title">SupremeIt Admin</div>
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
                        <button onClick={() => {
                          setSelectedOrder(o);
                          setTrackingLink(o.trackingLink || '');
                          setTrackingNumber(o.trackingNumber || '');
                        }} style={{padding:4}} title="View Order"><Eye size={16} /></button>
                        <button onClick={() => handleDelete(o.id)} style={{padding:4, color: 'var(--error)'}} title="Delete Order"><Trash2 size={16} /></button>
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
                <p><strong>Payment Method:</strong> Razorpay</p>
                <p><strong>Payment Status:</strong> <span className={`badge ${selectedOrder.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{padding: '2px 6px', fontSize: '12px'}}>{selectedOrder.paymentStatus || 'Pending'}</span></p>
              </div>
              
              {selectedOrder.addOns && (selectedOrder.addOns.rushOrder || selectedOrder.addOns.boxPacking) && (
                <div style={{marginBottom:16, padding:'12px', background:'var(--surface)', borderRadius:8, border:'1px solid var(--accent)'}}>
                  <h4 style={{marginBottom:8, display:'flex', alignItems:'center', gap:6}}><Package size={16} color="var(--accent)" /> Paid Add-ons (Apply in Qikink)</h4>
                  {selectedOrder.addOns.rushOrder && <p style={{margin:0, fontSize:13, fontWeight:600}}>⚡ Rush Order Selected</p>}
                  {selectedOrder.addOns.boxPacking && <p style={{margin:0, fontSize:13, fontWeight:600}}>📦 Premium Box Packing Selected</p>}
                </div>
              )}

              <h4 style={{marginBottom:8}}>Items</h4>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{padding:'8px 0',fontSize:14,borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span>{item.name} (Size: {item.size}) × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  {(item.customText || item.customImage) && (
                    <div style={{marginTop:8, padding:'10px 14px', background:'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.08))', borderRadius:8}}>
                      <span style={{fontWeight:700, fontSize:13, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:4, marginBottom:6}}>✨ Custom Design</span>
                      {item.customText && <p style={{margin:'4px 0', fontSize:13, color:'var(--text-secondary)'}}>Text: <strong>"{item.customText}"</strong></p>}
                      {item.customImage && (
                        <div style={{marginTop:8}}>
                          <img src={item.customImage} alt="Customer design" style={{width:80, height:80, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)'}} />
                          <a href={item.customImage} target="_blank" rel="noopener noreferrer" style={{display:'block', marginTop:6, fontSize:12, color:'var(--accent)', textDecoration:'underline'}}>Download Design File ↗</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {selectedOrder.qikinkOrderId && (
                <div style={{marginTop:12, padding:'8px 12px', background:'rgba(16, 185, 129, 0.1)', borderRadius:8, fontSize:13}}>
                  <strong>Qikink Order ID:</strong> {selectedOrder.qikinkOrderId}
                </div>
              )}
              
              <div style={{marginTop: 16, padding: '16px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)'}}>
                <h4 style={{marginBottom: 8}}>Tracking Information</h4>
                <div style={{display: 'grid', gap: 12}}>
                  <div>
                    <label style={{display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--text-secondary)'}}>Courier Tracking Link</label>
                    <input type="text" className="input" placeholder="https://..." value={trackingLink} onChange={e => setTrackingLink(e.target.value)} />
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--text-secondary)'}}>AWB / Tracking Number</label>
                    <input type="text" className="input" placeholder="e.g. 1234567890" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                  </div>
                  <button className="btn btn-outline" style={{width: 'fit-content'}} onClick={async () => {
                    try {
                      await updateOrderStatus(selectedOrder.id, { trackingLink, trackingNumber });
                      alert('Tracking info updated!');
                      loadOrders();
                    } catch { alert('Failed to update tracking info'); }
                  }}>Save Tracking Info</button>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',fontWeight:700,marginTop:8}}>
                <span>Total</span><span>{formatPrice(selectedOrder.total)}</span>
              </div>
              <div className="modal-actions" style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                {!selectedOrder.qikinkOrderId && (
                  <button className="btn btn-primary" onClick={() => handleSendToQikink(selectedOrder.id)} style={{display:'flex', alignItems:'center', gap:8}}>
                    <Truck size={16} /> Send to Qikink
                  </button>
                )}
                <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
