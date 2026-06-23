import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_ROOT } from '../api';
import SEO from '../components/SEO';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const shipping = cartTotal > 1999 ? 0 : 50;

  if (cart.length === 0) return (
    <div className="cart-page page-enter">
      <SEO title="Your Cart" noindex />
      <div className="container">
        <div className="cart-empty">
          <ShoppingBag size={48} style={{color:'var(--text-tertiary)'}} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">Start Shopping</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cart-page page-enter">
      <SEO title="Your Cart" noindex />
      <div className="container">
        <h1>Shopping Cart</h1>
        <p className="cart-count">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="cart-item">
                <div className="cart-item-image">
                  {item.images?.[0]?.startsWith('/uploads') || item.images?.[0]?.startsWith('http') ? (
                    <img src={item.images[0].startsWith('http') ? item.images[0] : `${API_ROOT}${item.images[0]}`} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  ) : (
                    <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#f0ebe3,#e8e0d2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#999',fontWeight:500}}>
                      {item.brand?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-brand">{item.brand}</div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-meta">
                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                  </div>
                  {(item.customText || item.customImage) && (
                    <div style={{marginTop:8, padding:'8px 12px', background:'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.08))', borderRadius:8, fontSize:12}}>
                      <span style={{fontWeight:600, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:4, marginBottom:4}}>✨ Custom Design</span>
                      {item.customText && <p style={{margin:'2px 0', color:'var(--text-secondary)'}}>Text: "{item.customText}"</p>}
                      {item.customImage && (
                        <div style={{marginTop:6}}>
                          <img src={item.customImage} alt="Custom design" style={{width:48, height:48, objectFit:'cover', borderRadius:6, border:'1px solid var(--border)'}} />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="cart-item-bottom">
                    <div className="cart-item-quantity">
                      <button onClick={() => updateQuantity(index, item.quantity - 1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <div className="cart-item-price">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(index)}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary-row"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            {shipping > 0 && <p style={{fontSize:12,color:'var(--success)',marginTop:4}}>Free shipping on orders above ₹1,999</p>}
            <div className="cart-summary-total"><span>Total</span><span>{formatPrice(cartTotal + shipping)}</span></div>
            <Link to="/checkout" className="btn btn-primary btn-lg">Checkout <ArrowRight size={18} /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
