import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, User, LogOut, Package, Settings, Mic } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUser } from '../context/UserContext';
import { searchProducts } from '../api';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authModal, setAuthModal]     = useState(false);
  const [authTab, setAuthTab]         = useState('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch]   = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchRef  = useRef(null);
  const profileRef = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();

  const { cartCount }     = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout }  = useUser();

  const isShopActive = (cat) => {
    if (cat) return location.pathname === '/shop' && location.search === `?category=${cat}`;
    return location.pathname === '/shop' && !location.search;
  };

  // Close search/profile on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const r = await searchProducts(searchQuery);
          setSearchResults(r); setShowSearch(true);
        } catch { setSearchResults([]); }
      } else { setSearchResults([]); setShowSearch(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleResultClick = (id) => {
    navigate(`/product/${id}`); setShowSearch(false); setSearchQuery('');
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  const initials = user ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '';

  const openLogin    = () => { setAuthTab('login');    setAuthModal(true); setProfileOpen(false); };
  const openRegister = () => { setAuthTab('register'); setAuthModal(true); setProfileOpen(false); };

  const handleLogout = () => { logout(); setProfileOpen(false); navigate('/'); };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">

          {/* LEFT — Category Navigation */}
          <div className="navbar-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
            <Link to="/shop" className={isShopActive() ? 'active' : ''}>Shop</Link>
            <Link to="/shop?category=men"   className={isShopActive('men')   ? 'active' : ''}>Men</Link>
            <Link to="/shop?category=women" className={isShopActive('women') ? 'active' : ''}>Women</Link>
            <Link to="/shop?category=kids"  className={isShopActive('kids')  ? 'active' : ''}>Kids</Link>
          </div>

          {/* CENTER — Logo */}
          <Link to="/" className="navbar-logo">
            Mac<span>Miller</span>
          </Link>

          {/* RIGHT — Search + Icons */}
          <div className="navbar-right">

            {/* Search */}
            <div className={`navbar-search ${searchFocused ? 'focused' : ''}`} ref={searchRef}>
              <Search size={15} className="navbar-search-icon" />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
              />
              <button className="navbar-search-mic" title="Voice search" tabIndex={-1}>
                <Mic size={14} />
              </button>
              {showSearch && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(p => (
                    <div key={p.id} className="search-result-item" onClick={() => handleResultClick(p.id)}>
                      <div className="search-result-img" style={{ background: 'var(--bg-secondary)' }} />
                      <div className="search-result-info">
                        <h4>{p.name}</h4>
                        <p>{p.brand.toUpperCase()} · {formatPrice(p.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="navbar-action-btn" title="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span key={`w-${wishlistCount}`} className="navbar-badge animate-pop">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="navbar-action-btn" title="Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span key={`c-${cartCount}`} className="navbar-badge animate-pop">{cartCount}</span>
              )}
            </Link>

            {/* Profile */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                className={`navbar-action-btn ${user ? 'navbar-action-btn--avatar' : ''}`}
                onClick={() => setProfileOpen(p => !p)}
                title="Account"
              >
                {user ? initials : <User size={20} />}
              </button>

              {profileOpen && (
                <div className="profile-dropdown animate-pop">
                  {user ? (
                    <>
                      <div className="profile-dropdown-header">
                        <div className="profile-avatar">{initials}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</div>
                        </div>
                      </div>
                      <div className="profile-dropdown-divider" />
                      <Link to="/profile" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                        <Settings size={16} /> My Account
                      </Link>
                      <Link to="/profile?tab=orders" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                        <Package size={16} /> My Orders
                      </Link>
                      <div className="profile-dropdown-divider" />
                      <button className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ padding: '16px 16px 12px', fontSize: 14, color: 'var(--text-secondary)' }}>
                        Sign in for faster checkout &amp; order tracking
                      </div>
                      <div className="profile-dropdown-divider" />
                      <button className="profile-dropdown-item" onClick={openLogin}>
                        <User size={16} /> Sign In
                      </button>
                      <button className="profile-dropdown-item" onClick={openRegister} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        + Create Account
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button className="navbar-action-btn navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-search">
            <input
              type="text" placeholder="Search products..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
            {showSearch && searchResults.length > 0 && (
              <div className="search-results" style={{ position: 'static', marginTop: 8 }}>
                {searchResults.map(p => (
                  <div key={p.id} className="search-result-item" onClick={() => { handleResultClick(p.id); setMobileOpen(false); }}>
                    <div className="search-result-img" style={{ background: 'var(--bg-secondary)' }} />
                    <div className="search-result-info">
                      <h4>{p.name}</h4><p>{formatPrice(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/"                                        onClick={() => setMobileOpen(false)}>Home</NavLink>
          <Link to="/shop"             className={isShopActive()       ? 'active' : ''} onClick={() => setMobileOpen(false)}>Shop All</Link>
          <Link to="/shop?category=men"   className={isShopActive('men')   ? 'active' : ''} onClick={() => setMobileOpen(false)}>Men</Link>
          <Link to="/shop?category=women" className={isShopActive('women') ? 'active' : ''} onClick={() => setMobileOpen(false)}>Women</Link>
          <Link to="/shop?category=kids"  className={isShopActive('kids')  ? 'active' : ''} onClick={() => setMobileOpen(false)}>Kids</Link>
          <NavLink to="/about"       onClick={() => setMobileOpen(false)}>About</NavLink>
          <NavLink to="/contact"     onClick={() => setMobileOpen(false)}>Contact</NavLink>
          <NavLink to="/track-order" onClick={() => setMobileOpen(false)}>Track Order</NavLink>
          {user ? (
            <>
              <NavLink to="/profile" onClick={() => setMobileOpen(false)}>My Account</NavLink>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ textAlign: 'left', padding: '16px', fontSize: '1.125rem', color: 'var(--error)' }}>Sign Out</button>
            </>
          ) : (
            <button onClick={() => { openLogin(); setMobileOpen(false); }} style={{ textAlign: 'left', padding: '16px', fontSize: '1.125rem', fontWeight: 600, color: 'var(--accent)' }}>Sign In / Register</button>
          )}
        </div>
      )}

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab={authTab} />
    </>
  );
}
