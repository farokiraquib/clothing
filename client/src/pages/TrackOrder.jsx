import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { trackOrder } from '../api';

const STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];

const STATUS_META = {
  Processing:  { icon: Clock,       color: '#f59e0b', label: 'Processing'  },
  Confirmed:   { icon: Package,     color: '#3b82f6', label: 'Confirmed'   },
  Shipped:     { icon: Truck,       color: '#8b5cf6', label: 'Shipped'     },
  Delivered:   { icon: CheckCircle, color: '#10b981', label: 'Delivered'   },
  Cancelled:   { icon: XCircle,     color: '#ef4444', label: 'Cancelled'   },
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId]   = useState(searchParams.get('id') || '');
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);
    setSearched(true);
    try {
      const data = await trackOrder(orderId.trim());
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Order not found. Please check your Order ID.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUSES.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'Cancelled';

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const formatDate  = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  return (
    <div className="page-enter" style={{ minHeight: '80vh', padding: '60px 0', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: 800 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, borderRadius:'50%', background:'var(--accent-bg)', marginBottom:16 }}>
            <Truck size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Track Your Order</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Enter your Order ID to get the latest status.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} style={{ background:'var(--surface-bg)', borderRadius:16, padding:32, marginBottom:32, border:'1px solid var(--border)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:16, marginBottom:16 }}>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:500, marginBottom:6, color:'var(--text-secondary)' }}>Order ID</label>
              <input
                type="text"
                required
                placeholder="e.g. ORD-ABC12345"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:14, outline:'none' }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'14px', fontSize:15 }} disabled={loading}>
            {loading ? 'Searching...' : <><Search size={16} style={{marginRight:8}} />Track Order</>}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="animate-pop" style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', borderRadius:12, padding:'16px 20px', marginBottom:24, textAlign:'center', fontSize:15 }}>
            {error}
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div className="animate-pop" style={{ background:'var(--surface-bg)', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden' }}>

            {/* Order Header */}
            <div style={{ padding:'24px 32px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:4, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>Order ID</div>
                <div style={{ fontSize:20, fontWeight:700 }}>{order.id}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:4, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>Placed On</div>
                <div style={{ fontSize:15, fontWeight:500 }}>{formatDate(order.createdAt)}</div>
              </div>
              <div>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:6, padding:'6px 16px', borderRadius:999, fontSize:13, fontWeight:600,
                  background: `${STATUS_META[order.status]?.color}18`,
                  color: STATUS_META[order.status]?.color,
                  border: `1px solid ${STATUS_META[order.status]?.color}40`
                }}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Progress Stepper */}
            {!isCancelled && (
              <div style={{ padding:'32px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
                  {/* connector line */}
                  <div style={{ position:'absolute', top:'18px', left:'10%', right:'10%', height:3, background:'var(--border)', borderRadius:4, zIndex:0 }} />
                  <div style={{
                    position:'absolute', top:'18px', left:'10%', height:3, borderRadius:4, zIndex:1, background:'var(--accent)',
                    width: currentStep < 0 ? '0%' : `${(currentStep / (STATUSES.length - 1)) * 80}%`,
                    transition: 'width 0.6s ease'
                  }} />

                  {STATUSES.map((step, i) => {
                    const done  = i <= currentStep;
                    const Icon  = STATUS_META[step].icon;
                    return (
                      <div key={step} style={{ display:'flex', flexDirection:'column', alignItems:'center', zIndex:2, flex:1 }}>
                        <div style={{
                          width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                          background: done ? 'var(--accent)' : 'var(--bg-primary)',
                          border: `3px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                          color: done ? '#fff' : 'var(--text-tertiary)',
                          transition:'all 0.4s ease'
                        }}>
                          <Icon size={16} />
                        </div>
                        <div style={{ marginTop:8, fontSize:11, fontWeight:done?600:400, color: done ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign:'center' }}>{step}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tracking Info (if available) */}
            {(order.trackingLink || order.trackingNumber) && (
              <div style={{ padding:'24px 32px', borderBottom:'1px solid var(--border)', background: 'rgba(139, 92, 246, 0.03)' }}>
                <h3 style={{ fontSize:15, fontWeight:600, marginBottom:12, display: 'flex', alignItems: 'center', gap: 6 }}><Truck size={18} color="var(--accent)" /> Courier Tracking</h3>
                {order.trackingNumber && <p style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-secondary)' }}>Tracking Number / AWB: <strong style={{ color: 'var(--text-primary)' }}>{order.trackingNumber}</strong></p>}
                {order.trackingLink && (
                  <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', padding: '10px 20px', fontSize: 14 }}>
                    Track via Courier ↗
                  </a>
                )}
              </div>
            )}

            {/* Items */}
            <div style={{ padding:'24px 32px', borderBottom:'1px solid var(--border)' }}>
              <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Items Ordered</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--bg-primary)', borderRadius:10 }}>
                    <div>
                      <div style={{ fontWeight:600, marginBottom:2 }}>{item.name}</div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight:600 }}>{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary + Address */}
            <div style={{ padding:'24px 32px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Delivery Address</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.7 }}>
                  {order.customer.name}<br/>
                  {order.customer.address}<br/>
                  {order.customer.city}, {order.customer.state} - {order.customer.pincode}<br/>
                  📞 {order.customer.phone}
                </p>
              </div>
              <div>
                <h3 style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Order Total</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-secondary)' }}>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-secondary)' }}>Shipping</span>
                    <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:16, marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
