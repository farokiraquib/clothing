import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { API_ROOT } from '../api';

const ProductCard = forwardRef(({ product }, ref) => {
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const inCart = cart.some(item => item.id === product.id);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (inCart) {
      navigate('/cart');
    } else {
      addToCart(product, product.sizes[0], product.colors[0]?.name);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div ref={ref} className={`product-card ${product.stock === 0 ? 'out-of-stock' : ''}`} style={{ opacity: product.stock === 0 ? 0.6 : 1 }} onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-card-image">
        {(product.images?.[0]?.startsWith('/uploads') || product.images?.[0]?.startsWith('http')) ? (
          <img src={product.images[0].startsWith('http') ? product.images[0] : `${API_ROOT}${product.images[0]}`} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
        ) : (
          <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#f0ebe3,#e8e0d2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',color:'#999',fontWeight:500}}>
            {product.brand.toUpperCase()}
          </div>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em', color: '#111', zIndex: 2 }}>
          | EXCLUSIVE FIT
        </div>
        <div className="product-card-badges" style={{ position: 'absolute', bottom: 12, left: 12, top: 'auto', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
          {product.stock === 0 && <span className="product-card-badge product-card-badge-sale" style={{background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '4px 8px'}}>Sold Out</span>}
          {product.stock > 0 && product.newArrival && <span className="product-card-badge product-card-badge-new" style={{background: '#1A1A1A', color: '#fff', padding: '4px 8px', textTransform: 'uppercase', fontSize: '9px'}}>Premium Heavy<br/>Gauge Fabric</span>}
          {product.stock > 0 && discount > 0 && <span className="product-card-badge product-card-badge-sale" style={{padding: '4px 8px'}}>{discount}% OFF</span>}
        </div>
        <button className={`product-card-wishlist ${inWishlist ? 'active' : ''}`} onClick={handleWishlist}>
          <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
        <div className="product-card-quick-add">
          {product.stock === 0 ? (
            <button disabled style={{cursor: 'not-allowed', background: '#ccc', color: '#666'}}>Sold Out</button>
          ) : (
            <button onClick={handleQuickAdd}>{inCart ? 'Go to Cart' : 'Quick Add'}</button>
          )}
        </div>
      </div>
      <div className="product-card-info" style={{ padding: '12px 0 0 0', textAlign: 'left' }}>
        <div className="product-card-name" style={{ fontSize: '14px', fontWeight: 700, color: '#333', marginBottom: '2px' }}>{product.name}</div>
        <div className="product-card-brand" style={{ fontSize: '13px', fontWeight: 400, color: '#777', textTransform: 'capitalize', marginBottom: '6px' }}>{product.category || product.brand}</div>
        <div className="product-card-price">
          <span className="product-card-price-current">{formatPrice(product.price)}</span>
          {product.comparePrice && <span className="product-card-price-compare">{formatPrice(product.comparePrice)}</span>}
          {discount > 0 && <span className="product-card-price-discount">{discount}% off</span>}
        </div>
        {product.rating > 0 && (
          <div className="product-card-rating">
            <Star size={12} className="star" fill="currentColor" />
            <span>{product.rating}</span>
            <span>({product.reviews})</span>
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
