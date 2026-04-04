import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { API_ROOT } from '../api';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0]?.name);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className={`product-card ${product.stock === 0 ? 'out-of-stock' : ''}`} style={{ opacity: product.stock === 0 ? 0.6 : 1 }} onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-card-image">
        {(product.images?.[0]?.startsWith('/uploads') || product.images?.[0]?.startsWith('http')) ? (
          <img src={product.images[0].startsWith('http') ? product.images[0] : `${API_ROOT}${product.images[0]}`} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
        ) : (
          <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#f0ebe3,#e8e0d2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',color:'#999',fontWeight:500}}>
            {product.brand.toUpperCase()}
          </div>
        )}
        <div className="product-card-badges">
          {product.stock === 0 && <span className="product-card-badge product-card-badge-sale" style={{background: 'rgba(0,0,0,0.8)', color: '#fff'}}>Sold Out</span>}
          {product.stock > 0 && product.newArrival && <span className="product-card-badge product-card-badge-new">New</span>}
          {product.stock > 0 && discount > 0 && <span className="product-card-badge product-card-badge-sale">{discount}% OFF</span>}
        </div>
        <button className={`product-card-wishlist ${inWishlist ? 'active' : ''}`} onClick={handleWishlist}>
          <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
        <div className="product-card-quick-add">
          {product.stock === 0 ? (
            <button disabled style={{cursor: 'not-allowed', background: '#ccc', color: '#666'}}>Sold Out</button>
          ) : (
            <button onClick={handleQuickAdd}>Quick Add</button>
          )}
        </div>
      </div>
      <div className="product-card-info">
        <div className="product-card-brand">{product.brand}</div>
        <div className="product-card-name">{product.name}</div>
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
}
