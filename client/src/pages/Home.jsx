import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Zap, Clock, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts, getProducts, getNewArrivals, getCategories, getBanners, API_ROOT } from '../api';
import slide1 from '../assets/hero_slide_1.png';
import slide2 from '../assets/hero_slide_2.png';
import slide3 from '../assets/hero_slide_3.png';

const BRANDS_DISPLAY = ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', "Levi's", 'Calvin Klein', 'Tommy Hilfiger', 'Under Armour', 'The North Face'];

const PROMO_BANNERS = [
  { text: '🔥 Summer Sale — Up to 50% Off Select Styles', link: '/shop' },
  { text: '🚚 Free Shipping on Orders Above ₹1,999', link: '/shop' },
  { text: '✨ New Arrivals Just Dropped — Shop Now', link: '/shop?newArrival=true' },
];

/* Static fallback slides (used when no DB banners exist) */
const STATIC_SLIDES = [
  {
    image: slide1,
    tag: 'New Season 2026',
    headline: ['Elevate Your', 'Everyday Style'],
    sub: "Curated menswear from the world's most iconic brands.",
    cta: 'Shop Men',
    link: '/shop?category=men',
    align: 'left',
    dark: false,
  },
  {
    image: slide2,
    tag: "Women's Collection",
    headline: ['Timeless', 'Elegance'],
    sub: 'Discover flowing silhouettes and refined femininity.',
    cta: 'Shop Women',
    link: '/shop?category=women',
    align: 'right',
    dark: false,
  },
  {
    image: slide3,
    tag: 'Streetwear Drop',
    headline: ['Fresh Kicks', 'Fresh Fits'],
    sub: 'The latest sneakers and streetwear — just landed.',
    cta: 'Shop Now',
    link: '/shop',
    align: 'left',
    dark: true,
  },
];

/* Convert a DB banner doc into the slide shape */
function normalizeBanner(b) {
  return {
    image: b.url.startsWith('http') ? b.url : `${API_ROOT}${b.url}`,
    tag: b.tag || '',
    headline: b.headline ? b.headline.split('\n') : [''],
    sub: b.sub || '',
    cta: b.cta || '',
    link: b.link || '/shop',
    align: b.align || 'left',
    dark: !!b.dark,
  };
}

/* ── Hero Slideshow Component ── */
function HeroSlideshow({ slides }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const timerRef = useRef(null);
  const count = slides.length;

  if (count === 0) return null;

  const goTo = (idx) => {
    if (idx === current) return;
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => setPrev(null), 700);
  };

  const goNext = () => goTo((current + 1) % count);
  const goPrev = () => goTo((current - 1 + count) % count);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(goNext, 5000);
    return () => clearInterval(timerRef.current);
  }, [current, count]);

  const slide = slides[current];

  return (
    <div className="hero-slider">
      {/* Slide layers */}
      {slides.map((s, i) => (
        <Link
          to={s.link || '/shop'}
          key={i}
          className={`hero-slide${i === current ? ' hero-slide--active' : i === prev ? ' hero-slide--exit' : ''}`}
          style={{ display: 'block' }}
        >
          <img src={s.image} alt="" className="hero-slide-img" draggable={false} />
          {/* Only show dark gradient overlay if there is text that needs to be readable */}
          {(s.tag || (s.headline && s.headline.length > 0 && s.headline[0].trim() !== '') || s.sub) && (
            <div className={`hero-slide-overlay${s.dark ? ' hero-slide-overlay--dark' : ''}`} />
          )}
        </Link>
      ))}

      {/* Text overlay (pointerEvents none so clicks pass through to the image link) */}
      <div
        className={`hero-slide-content hero-slide-content--${slide.align}${slide.dark ? ' hero-slide-content--light' : ''}`}
        key={current}
        style={{ pointerEvents: 'none' }}
      >
        {slide.tag && <span className="hero-slide-tag">{slide.tag}</span>}
        
        {slide.headline && slide.headline.length > 0 && slide.headline[0].trim() !== '' && (
          <h1 className="hero-slide-headline">
            {slide.headline.map((line, idx) => (
              <span key={idx}>{line}{idx < slide.headline.length - 1 && <br />}</span>
            ))}
          </h1>
        )}
        
        {slide.sub && <p className="hero-slide-sub">{slide.sub}</p>}
      </div>

      {/* Arrows */}
      <button className="hero-arrow hero-arrow--left" onClick={goPrev} aria-label="Previous slide">
        <ChevronLeft size={28} />
      </button>
      <button className="hero-arrow hero-arrow--right" onClick={goNext} aria-label="Next slide">
        <ChevronRight size={28} />
      </button>

      {/* Dots */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === current ? ' hero-dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="hero-progress">
        <div key={current} className="hero-progress-bar" />
      </div>
    </div>
  );
}

/* ── Main Home Page ── */
export default function Home() {
  const [homeProducts, setHomeProducts] = useState([]);
  const [fetchState, setFetchState] = useState({ mode: 'featured', page: 1 });
  const [hasMore, setHasMore] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slides, setSlides] = useState(null);
  const [currentPromo, setCurrentPromo] = useState(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const observerRef = useRef();
  const lastProductElementRef = useCallback(node => {
    if (loadingMoreProducts || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setFetchState(prev => ({ ...prev, page: prev.page + 1 }));
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMoreProducts, hasMore]);

  useEffect(() => {
    if (!hasMore) return;
    
    setLoadingMoreProducts(true);
    const isFeaturedMode = fetchState.mode === 'featured';
    
    getProducts({ 
      featured: isFeaturedMode ? true : undefined, 
      page: fetchState.page, 
      limit: 30 
    })
      .then(data => {
        setHomeProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newUnique = data.products.filter(p => !existingIds.has(p.id));
          return [...prev, ...newUnique];
        });

        if (data.page >= data.totalPages) {
          if (isFeaturedMode) {
            setFetchState({ mode: 'normal', page: 1 });
          } else {
            setHasMore(false);
            setLoadingMoreProducts(false);
          }
        } else {
          setLoadingMoreProducts(false);
        }
      })
      .catch(() => {
        setLoadingMoreProducts(false);
      });
  }, [fetchState.mode, fetchState.page, hasMore]);

  useEffect(() => {
    getNewArrivals().then(setNewArrivals).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
    // Load banners from DB; fall back to static if none uploaded yet
    getBanners()
      .then(res => { 
        if (res && res.length > 0) {
          setSlides(res.map(normalizeBanner)); 
        } else {
          setSlides(STATIC_SLIDES);
        }
      })
      .catch(() => {
        setSlides(STATIC_SLIDES);
      });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentPromo(p => (p + 1) % PROMO_BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const scrollProducts = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <div className="page-enter">

      {/* Promo Strip */}
      <div className="promo-strip">
        <div className="promo-strip-inner">
          {PROMO_BANNERS.map((p, i) => (
            <Link key={i} to={p.link} className={`promo-strip-item${i === currentPromo ? ' active' : ''}`}>
              {p.text}
            </Link>
          ))}
        </div>
      </div>

      {/* ★ Hero Slideshow — powered by DB banners */}
      <div className="container" style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {slides ? (
          <HeroSlideshow slides={slides} />
        ) : (
          <div className="hero-slider" style={{ background: '#f4f4f5', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        )}
      </div>

      {/* Trust Strip — hidden on mobile to save space */}
      <section className="trust-strip trust-strip--desktop-only">
        <div className="container">
          <div className="trust-strip-grid">
            {[
              { icon: <Truck size={22} />,     title: 'Free Shipping',  sub: 'On orders above ₹1,999' },
              { icon: <RotateCcw size={22} />, title: 'Easy Returns',   sub: '30-day hassle-free' },
              { icon: <Shield size={22} />,    title: '100% Authentic', sub: 'Genuine products' },
              { icon: <Zap size={22} />,       title: 'Fast Delivery',  sub: '2-5 business days' },
            ].map((item, i) => (
              <div key={i} className="trust-item">
                <div className="trust-item-icon">{item.icon}</div>
                <div><h4>{item.title}</h4><p>{item.sub}</p></div>
              </div>
            ))}
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
                <div key={i} className="brand-item"
                  onClick={() => navigate(`/shop?brand=${b.toLowerCase().replace(/['\s]/g, '-')}`)}>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section" style={{ paddingTop: 'var(--space-12)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1A202C', marginBottom: 'var(--space-8)' }}>
              New Arrivals
            </h2>
            
            <div style={{ position: 'relative' }}>
              {/* Left Arrow */}
              <button 
                onClick={() => scrollProducts(-1)}
                style={{ position: 'absolute', left: 0, top: '40%', transform: 'translate(-50%, -50%)', zIndex: 10, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              >
                <ChevronLeft size={24} color="#333" />
              </button>

              <div className="product-scroll" ref={scrollRef}>
                {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Right Arrow */}
              <button 
                onClick={() => scrollProducts(1)}
                style={{ position: 'absolute', right: 0, top: '40%', transform: 'translate(50%, -50%)', zIndex: 10, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              >
                <ChevronRight size={24} color="#333" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Find your perfect look</p>
            </div>
            <Link to="/shop" className="btn btn-outline">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat, idx) => {
              const fallbacks = [
                { sub: 'Discover the latest trends', gradient: 'linear-gradient(135deg,#2C3E50 0%,#4A6741 100%)' },
                { sub: 'Elevate your wardrobe',      gradient: 'linear-gradient(135deg,#8E6B5E 0%,#C9A96E 100%)' },
                { sub: 'Fresh drops this week',      gradient: 'linear-gradient(135deg,#4A90D9 0%,#67B8DE 100%)' },
              ];
              const fb = fallbacks[idx % fallbacks.length];
              return (
                <Link to={`/shop?category=${cat.id}`} key={cat.id} className="category-card">
                  {cat.image && (cat.image.startsWith('/uploads') || cat.image.startsWith('http')) ? (
                    <img src={cat.image.startsWith('http') ? cat.image : `${API_ROOT}${cat.image}`} alt={cat.name} className="category-card-img" />
                  ) : (
                    <div className="category-card-bg" style={{ background: fb.gradient }} />
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

      {/* Featured Products */}
      {homeProducts.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-eyebrow"><Sparkles size={14} /> Handpicked For You</div>
                <h2 className="section-title">Featured Products</h2>
              </div>
              <Link to="/shop" className="btn btn-outline">View All <ArrowRight size={16} /></Link>
            </div>
            <div className="product-grid">
              {homeProducts.map((p, i) => {
                if (i === homeProducts.length - 1) {
                  return <ProductCard ref={lastProductElementRef} key={p.id} product={p} />;
                }
                return <ProductCard key={p.id} product={p} />;
              })}
            </div>
            {loadingMoreProducts && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>Loading more products...</div>
            )}
          </div>
        </section>
      )}


    </div>
  );
}
