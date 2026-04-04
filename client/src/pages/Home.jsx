import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, Star, ChevronLeft, ChevronRight, Zap, Clock, Sparkles, TrendingUp, Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts, getNewArrivals, getCategories, getSettings, API_ROOT } from '../api';

const BRANDS_DISPLAY = ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', "Levi's", 'Calvin Klein', 'Tommy Hilfiger', 'Under Armour', 'The North Face'];

const PROMO_BANNERS = [
  { text: '🔥 Summer Sale — Up to 50% Off Select Styles', link: '/shop', accent: true },
  { text: '🚚 Free Shipping on Orders Above ₹1,999', link: '/shop', accent: false },
  { text: '✨ New Arrivals Just Dropped — Shop Now', link: '/shop?newArrival=true', accent: true },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [currentPromo, setCurrentPromo] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getFeaturedProducts().then(setFeatured).catch(() => {});
    getNewArrivals().then(setNewArrivals).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
    getSettings().then(setSettings).catch(() => {});
  }, []);

  // Auto-rotate promo banners
  useEffect(() => {
    const t = setInterval(() => setCurrentPromo(p => (p + 1) % PROMO_BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const scrollProducts = (direction) => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  return (
    <div className="page-enter">
      {/* Promo Banner Strip */}
      <div className="promo-strip">
        <div className="promo-strip-inner">
          {PROMO_BANNERS.map((p, i) => (
            <Link
              key={i}
              to={p.link}
              className={`promo-strip-item ${i === currentPromo ? 'active' : ''}`}
            >
              {p.text}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-content">
          <div className="hero-badge-pill">
            <Sparkles size={14} />
            <span>New Season 2026</span>
          </div>
          <h1>Elevate Your <br /><span className="hero-accent-text">Everyday Style</span></h1>
          <p>Discover curated collections from the world's most iconic brands. Fashion that moves with you.</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary btn-lg hero-cta-main">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/shop?newArrival=true" className="btn btn-outline btn-lg">New Arrivals</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <h4>200+</h4>
              <p>Products</p>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <h4>10+</h4>
              <p>Brands</p>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <h4>50K+</h4>
              <p>Happy Customers</p>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-card hero-image-card-1">
            {settings?.heroImage1 ? (
              <img src={settings.heroImage1.startsWith('http') ? settings.heroImage1 : `${API_ROOT}${settings.heroImage1}`} alt="Trending" style={{width:'100%', height:'100%', objectFit:'cover'}} />
            ) : (
              <div className="hero-card-shimmer" />
            )}
          </div>
          <div className="hero-image-card hero-image-card-2">
            {settings?.heroImage2 ? (
              <img src={settings.heroImage2.startsWith('http') ? settings.heroImage2 : `${API_ROOT}${settings.heroImage2}`} alt="Best Seller" style={{width:'100%', height:'100%', objectFit:'cover'}} />
            ) : (
              <div className="hero-card-shimmer" />
            )}
          </div>
          <div className="hero-floating-badge hero-floating-badge-1">
            <TrendingUp size={16} />
            <span>Trending</span>
          </div>
          <div className="hero-floating-badge hero-floating-badge-2">
            <Heart size={16} />
            <span>Best Seller</span>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-strip-grid">
            <div className="trust-item">
              <div className="trust-item-icon">
                <Truck size={22} />
              </div>
              <div>
                <h4>Free Shipping</h4>
                <p>On orders above ₹1,999</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon">
                <RotateCcw size={22} />
              </div>
              <div>
                <h4>Easy Returns</h4>
                <p>30-day hassle-free</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon">
                <Shield size={22} />
              </div>
              <div>
                <h4>100% Authentic</h4>
                <p>Genuine products</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon">
                <Zap size={22} />
              </div>
              <div>
                <h4>Fast Delivery</h4>
                <p>2-5 business days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="brands-strip">
        <div className="container">
          <div className="brands-strip-title">Trusted by the world's best brands</div>
          <div className="brands-marquee">
            <div className="brands-marquee-track">
              {[...BRANDS_DISPLAY, ...BRANDS_DISPLAY].map((b, i) => (
                <div key={i} className="brand-item" onClick={() => navigate(`/shop?brand=${b.toLowerCase().replace(/['\s]/g, '-')}`)}>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle" style={{marginBottom: 0}}>Find your perfect look</p>
            </div>
            <Link to="/shop" className="btn btn-outline">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat, idx) => {
              const fallbacks = [
                { sub: 'Discover the latest trends', gradient: 'linear-gradient(135deg,#2C3E50 0%,#4A6741 100%)' },
                { sub: 'Elevate your wardrobe', gradient: 'linear-gradient(135deg,#8E6B5E 0%,#C9A96E 100%)' },
                { sub: 'Fresh drops this week', gradient: 'linear-gradient(135deg,#4A90D9 0%,#67B8DE 100%)' }
              ];
              const fb = fallbacks[idx % fallbacks.length];
              return (
                <Link to={`/shop?category=${cat.id}`} key={cat.id} className="category-card">
                  {(cat.image && cat.image.startsWith('/uploads')) || (cat.image && cat.image.startsWith('http')) ? (
                    <img src={cat.image.startsWith('http') ? cat.image : `${API_ROOT}${cat.image}`} alt={cat.name} className="category-card-img" />
                  ) : (
                    <div className="category-card-bg" style={{background: fb.gradient}} />
                  )}
                  <div className="category-card-overlay" />
                  <div className="category-card-content">
                    <span className="category-card-tag">{cat.name.toUpperCase()}</span>
                    <h3>Shop {cat.name}</h3>
                    <p>{fb.sub}</p>
                    <span className="category-card-link">Explore Collection <ArrowRight size={16} /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-eyebrow"><Sparkles size={14} /> Handpicked For You</div>
                <h2 className="section-title">Featured Products</h2>
              </div>
              <Link to="/shop?featured=true" className="btn btn-outline">View All <ArrowRight size={16} /></Link>
            </div>
            <div className="product-grid">
              {featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Scroll */}
      {newArrivals.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-eyebrow"><Clock size={14} /> Just Dropped</div>
                <h2 className="section-title">New Arrivals</h2>
              </div>
              <div className="scroll-controls">
                <button className="scroll-btn" onClick={() => scrollProducts(-1)}><ChevronLeft size={20} /></button>
                <button className="scroll-btn" onClick={() => scrollProducts(1)}><ChevronRight size={20} /></button>
                <Link to="/shop?newArrival=true" className="btn btn-outline" style={{marginLeft: 8}}>See All <ArrowRight size={16} /></Link>
              </div>
            </div>
            <div className="product-scroll" ref={scrollRef}>
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-banner-bg" />
        <div className="container" style={{position: 'relative', zIndex: 2}}>
          <div className="cta-banner-content">
            <div className="cta-banner-badge">Limited Time Offer</div>
            <h2>Summer Collection 2026</h2>
            <p>Get up to 50% off on select styles. Don't miss out on the hottest trends of the season.</p>
            <Link to="/shop" className="btn btn-accent btn-lg">Shop the Sale <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-inner">
            <div className="newsletter-text">
              <h2>Stay in the Loop</h2>
              <p>Subscribe for exclusive offers, new drops, and style inspiration delivered to your inbox.</p>
            </div>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button className="btn btn-accent">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
