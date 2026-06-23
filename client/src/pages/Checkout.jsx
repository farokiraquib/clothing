import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Smartphone, Building, Wallet, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from '../api';
import SEO from '../components/SEO';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', city:'', state:'', pincode:'' });
  const [rushOrder, setRushOrder] = useState(false);
  const [boxPacking, setBoxPacking] = useState(false);

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

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  const shipping = cartTotal > 1999 ? 0 : 50;
  
  const addOnsBase = (rushOrder ? 50 : 0) + (boxPacking ? 15 : 0);
  const addOnsGst = addOnsBase * 0.18;
  const addOnsTotal = addOnsBase + addOnsGst;
  const grandTotal = cartTotal + shipping + addOnsTotal;

  const handleChange = (e) => setForm(prev => ({...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate: customizable products must have a design image
    const missingDesign = cart.find(i => i.isCustomizable && !i.customImage);
    if (missingDesign) {
      alert(`"${missingDesign.name}" requires a design image. Please go back and upload your design.`);
      return;
    }
    try {
      // 1. Create order in our database
      const order = await createOrder({
        customer: form,
        items: cart.map(i => ({ productId: i.id, name: i.name, size: i.selectedSize, color: i.selectedColor, quantity: i.quantity, price: i.price, customText: i.customText || '', customImage: i.customImage || '' })),
        subtotal: cartTotal,
        shipping,
        addOns: {
          rushOrder,
          boxPacking,
          totalPrice: addOnsTotal,
          gst: addOnsGst
        },
        total: grandTotal
      });

      // 2. Create Razorpay order
      const rzpOrder = await createRazorpayOrder(grandTotal);

      // 3. Open Razorpay checkout
      const options = {
        key: 'rzp_test_So7egikyu7MjeY',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'SupremeIt Store',
        description: `Order ${order.id}`,
        order_id: rzpOrder.id,
        notes: {
          internal_order_id: order.id,
          customer_email: form.email
        },
        handler: async function (response) {
          try {
            // 4. Verify payment on server
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internal_order_id: order.id
            });
            if (verifyRes.success) {
              setOrderId(order.id);
              setOrderPlaced(true);
              window.scrollTo(0, 0);
              clearCart();
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error(err);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        theme: {
          color: '#111111'
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();

    } catch (err) { 
      console.error(err);
      alert('Failed to place order'); 
    }
  };

  if (cart.length === 0 && !orderPlaced) { navigate('/cart'); return null; }

  if (orderPlaced) return (
    <div className="checkout-page page-enter">
      <SEO title="Order Placed" noindex />
      <div className="container" style={{textAlign:'center',padding:'80px 0'}}>
        <div style={{width: 80, height: 80, margin: '0 auto 24px', background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}} className="animate-pop">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
             <polyline points="20 6 9 17 4 12" className="animate-success-draw" />
           </svg>
        </div>
        <h1 style={{marginBottom:8}} className="animate-pop">Order Placed!</h1>
        <p style={{color:'var(--text-secondary)',fontSize:18,marginBottom:8}}>Thank you for shopping with SupremeIt.</p>
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
      <SEO title="Checkout" noindex />
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
                <h2>Optional Add-ons</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={rushOrder} onChange={(e) => setRushOrder(e.target.checked)} />
                    <span style={{ fontWeight: '500' }}>Rush Order (+₹50.00)</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>- Expedited processing & fulfillment</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={boxPacking} onChange={(e) => setBoxPacking(e.target.checked)} />
                    <span style={{ fontWeight: '500' }}>Premium Box Packing (+₹15.00)</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>- Extra protection & branded presentation</span>
                  </label>
                </div>
              </div>
              <div className="checkout-section">
                <h2>Payment Method</h2>
                <p style={{ fontSize: '14px', color: 'var(--error)', marginBottom: '16px', fontWeight: '500' }}>
                  Note: As a small brand, we do not currently accept Cash on Delivery (COD). All orders must be prepaid.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)' }}>
                    <ShieldCheck size={24} style={{color: 'var(--success)'}} />
                    <div>
                      <p style={{ fontWeight: '600', margin: 0 }}>Secure Checkout by Razorpay</p>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>End-to-end encrypted and PCI DSS compliant.</p>
                    </div>
                  </div>
                  <div className="payment-methods-grid">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <CreditCard size={20} style={{color:'var(--text-secondary)'}} />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Credit & Debit Cards</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <Smartphone size={20} style={{color:'var(--text-secondary)'}} />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>UPI / QR Codes</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <Building size={20} style={{color:'var(--text-secondary)'}} />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Netbanking</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <Wallet size={20} style={{color:'var(--text-secondary)'}} />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Digital Wallets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="cart-summary">
              <h3>Order Summary</h3>
              {cart.map((item, i) => (
                <div key={i} style={{padding:'8px 0',fontSize:14, borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{color:'var(--text-secondary)'}}>{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  {(item.customText || item.customImage) && (
                    <div style={{marginTop:4, fontSize:11, color:'var(--text-tertiary)'}}>
                      <span style={{color:'var(--success)', fontWeight:600}}>✨ Custom</span>
                      {item.customText && <span> · "{item.customText}"</span>}
                      {item.customImage && <span> · Design attached</span>}
                    </div>
                  )}
                </div>
              ))}
              <div className="cart-summary-row" style={{marginTop:16}}><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
              {addOnsBase > 0 && (
                <>
                  <div className="cart-summary-row" style={{ color: 'var(--text-secondary)' }}>
                    <span>Add-ons {rushOrder && boxPacking ? '(Rush + Box)' : (rushOrder ? '(Rush)' : '(Box)')}</span>
                    <span>{formatPrice(addOnsBase)}</span>
                  </div>
                  <div className="cart-summary-row" style={{ color: 'var(--text-secondary)' }}>
                    <span>Add-ons GST (18%)</span>
                    <span>{formatPrice(addOnsGst)}</span>
                  </div>
                </>
              )}
              <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="cart-summary-total"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
              <button type="submit" className="btn btn-primary btn-lg">Place Order</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
