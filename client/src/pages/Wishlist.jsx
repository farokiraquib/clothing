import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import { API_ROOT } from '../api';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  const handleMoveToCart = (product) => {
    addToCart(product, product.sizes?.[0], product.colors?.[0]?.name);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) return (
    <div className="wishlist-page page-enter">
      <SEO title="Your Wishlist" noindex />
      <div className="container" style={{textAlign:'center',padding:'100px 0'}}>
        <div className="wishlist-empty">
          <Heart size={48} style={{color:'var(--text-tertiary)'}} />
          <h2>Your wishlist is empty</h2>
          <p>Save items you love to your wishlist.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">Explore Products</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="wishlist-page page-enter">
      <SEO title="Your Wishlist" noindex />
      <div className="container">
        <h1>Wishlist</h1>
        <p className="wishlist-count">{wishlistCount} item{wishlistCount !== 1 ? 's' : ''}</p>
        <div className="product-grid">
          {wishlist.map(product => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`}>
                <div className="product-card-image">
                  {product.images?.[0]?.startsWith('/uploads') || product.images?.[0]?.startsWith('http') ? (
                    <img src={product.images[0].startsWith('http') ? product.images[0] : `${API_ROOT}${product.images[0]}`} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  ) : (
                    <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#f0ebe3,#e8e0d2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#999',fontWeight:500}}>
                      {product.brand?.toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <div className="product-card-info">
                <div className="product-card-brand">{product.brand}</div>
                <div className="product-card-name">{product.name}</div>
                <div className="product-card-price">
                  <span className="product-card-price-current">{formatPrice(product.price)}</span>
                </div>
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={() => handleMoveToCart(product)}>
                    <ShoppingBag size={14} /> Move to Cart
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeFromWishlist(product.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
