import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { searchProducts } from '../api';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isShopActive = (cat) => {
    if (cat) return location.pathname === '/shop' && location.search === `?category=${cat}`;
    return location.pathname === '/shop' && !location.search;
  };
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const results = await searchProducts(searchQuery);
          setSearchResults(results);
          setShowSearch(true);
        } catch { setSearchResults([]); }
      } else {
        setSearchResults([]);
        setShowSearch(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleResultClick = (id) => {
    navigate(`/product/${id}`);
    setShowSearch(false);
    setSearchQuery('');
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">Mac<span>Miller</span></Link>
        <div className="navbar-nav">
          <NavLink to="/" end>Home</NavLink>
          <Link to="/shop" className={isShopActive() ? 'active' : ''}>Shop</Link>
          <Link to="/shop?category=men" className={isShopActive('men') ? 'active' : ''}>Men</Link>
          <Link to="/shop?category=women" className={isShopActive('women') ? 'active' : ''}>Women</Link>
          <Link to="/shop?category=kids" className={isShopActive('kids') ? 'active' : ''}>Kids</Link>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/track-order">Track Order</NavLink>
        </div>
        <div className="navbar-search" ref={searchRef}>
          <Search size={16} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {showSearch && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(p => (
                <div key={p.id} className="search-result-item" onClick={() => handleResultClick(p.id)}>
                  <div className="search-result-img" style={{background: 'var(--bg-secondary)'}} />
                  <div className="search-result-info">
                    <h4>{p.name}</h4>
                    <p>{p.brand.toUpperCase()} · {formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="navbar-actions">
          <Link to="/wishlist" className="navbar-action-btn" title="Wishlist">
            <Heart size={20} />
            {wishlistCount > 0 && <span key={`w-${wishlistCount}`} className="navbar-badge animate-pop">{wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="navbar-action-btn" title="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span key={`c-${cartCount}`} className="navbar-badge animate-pop">{cartCount}</span>}
          </Link>
          <Link to="/admin" className="navbar-action-btn hide-mobile" title="Admin">
            <User size={20} />
          </Link>
          <button className="navbar-action-btn navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-search">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {showSearch && searchResults.length > 0 && (
              <div className="search-results" style={{position: 'static', marginTop: 8}}>
                {searchResults.map(p => (
                  <div key={p.id} className="search-result-item" onClick={() => handleResultClick(p.id)}>
                    <div className="search-result-img" style={{background: 'var(--bg-secondary)'}} />
                    <div className="search-result-info">
                      <h4>{p.name}</h4>
                      <p>{formatPrice(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/" onClick={() => setMobileOpen(false)}>Home</NavLink>
          <Link to="/shop" className={isShopActive() ? 'active' : ''} onClick={() => setMobileOpen(false)}>Shop All</Link>
          <Link to="/shop?category=men" className={isShopActive('men') ? 'active' : ''} onClick={() => setMobileOpen(false)}>Men</Link>
          <Link to="/shop?category=women" className={isShopActive('women') ? 'active' : ''} onClick={() => setMobileOpen(false)}>Women</Link>
          <Link to="/shop?category=kids" className={isShopActive('kids') ? 'active' : ''} onClick={() => setMobileOpen(false)}>Kids</Link>
          <NavLink to="/about" onClick={() => setMobileOpen(false)}>About</NavLink>
          <NavLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</NavLink>
          <NavLink to="/admin" onClick={() => setMobileOpen(false)}>Admin</NavLink>
        </div>
      )}
    </nav>
  );
}
