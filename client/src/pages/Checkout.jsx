import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { createOrder } from '../api';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', city:'', state:'', pincode:'' });

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name:    user.name    || '',
        email:   user.email   || '',
        phone:   user.phone   || '',
        address: user.address?.line1   || '',
        city:    user.address?.city    || '',
        state:   user.address?.state   || '',
        pincode: user.address?.pincode || '',
      }));
    }
  }, [user]);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const shipping = cartTotal > 1999 ? 0 : 99;

  const handleChange = (e) => setForm(prev => ({...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const order = await createOrder({
        customer: form,
        items: cart.map(i => ({ productId: i.id, name: i.name, size: i.selectedSize, color: i.selectedColor, quantity: i.quantity, price: i.price })),
        subtotal: cartTotal,
        shipping,
        total: cartTotal + shipping
      });
      setOrderId(order.id);
      setOrderPlaced(true);
      clearCart();
    } catch (err) { alert('Failed to place order'); }
  };

  if (cart.length === 0 && !orderPlaced) { navigate('/cart'); return null; }

  if (orderPlaced) return (
    <div className="checkout-page page-enter">
      <div className="container" style={{textAlign:'center',padding:'80px 0'}}>
        <div style={{width: 80, height: 80, margin: '0 auto 24px', background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}} className="animate-pop">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
             <polyline points="20 6 9 17 4 12" className="animate-success-draw" />
           </svg>
        </div>
        <h1 style={{marginBottom:8}} className="animate-pop">Order Placed!</h1>
        <p style={{color:'var(--text-secondary)',fontSize:18,marginBottom:8}}>Thank you for shopping with Mac Miller.</p>
        <p style={{color:'var(--text-secondary)',marginBottom:32}}>Order ID: <strong>{orderId}</strong></p>
        <div style={{display:'flex', gap:12, justifyContent:'center'}}>
          <Link to="/shop" className="btn btn-outline btn-lg">Continue Shopping</Link>
          <Link to={`/track-order?id=${orderId}`} className="btn btn-primary btn-lg">Track Order</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="checkout-page page-enter">
      <div className="container">
        <h1>Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">
            <div>
              <div className="checkout-section">
                <h2>Shipping Information</h2>
                <div className="checkout-form-grid">
                  <div className="input-group"><label>Full Name *</label><input className="input" name="name" value={form.name} onChange={handleChange} required /></div>
                  <div className="input-group"><label>Email *</label><input className="input" name="email" type="email" value={form.email} onChange={handleChange} required /></div>
                  <div className="input-group"><label>Phone *</label><input className="input" name="phone" value={form.phone} onChange={handleChange} required /></div>
                  <div className="input-group"><label>City *</label><input className="input" name="city" value={form.city} onChange={handleChange} required /></div>
                  <div className="input-group full-width"><label>Address *</label><input className="input" name="address" value={form.address} onChange={handleChange} required /></div>
                  <div className="input-group"><label>State *</label><input className="input" name="state" value={form.state} onChange={handleChange} required /></div>
                  <div className="input-group"><label>PIN Code *</label><input className="input" name="pincode" value={form.pincode} onChange={handleChange} required /></div>
                </div>
              </div>
              <div className="checkout-section">
                <h2>Payment</h2>
                <div className="payment-placeholder">
                  <CreditCard size={40} style={{color:'var(--text-tertiary)'}} />
                  <p>Payment gateway integration coming soon.<br/>Your order will be placed as Cash on Delivery.</p>
                </div>
              </div>
            </div>
            <div className="cart-summary">
              <h3>Order Summary</h3>
              {cart.map((item, i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',fontSize:14}}>
                  <span style={{color:'var(--text-secondary)'}}>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="cart-summary-row" style={{marginTop:16}}><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
              <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="cart-summary-total"><span>Total</span><span>{formatPrice(cartTotal + shipping)}</span></div>
              <button type="submit" className="btn btn-primary btn-lg">Place Order</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
