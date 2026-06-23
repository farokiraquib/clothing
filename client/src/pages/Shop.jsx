import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { getProducts, getBrands, getCategories } from '../api';

const COLORS = [
  { name: 'Black', hex: '#1A1A1A' }, { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1B2A4A' }, { name: 'Grey', hex: '#B0B0B0' },
  { name: 'Red', hex: '#C62828' }, { name: 'Blue', hex: '#1E40AF' },
  { name: 'Green', hex: '#2D8A4E' }, { name: 'Beige', hex: '#D4C5A9' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const searchString = searchParams.toString();
  const [lastSearch, setLastSearch] = useState(searchString);

  if (searchString !== lastSearch) {
    setLastSearch(searchString);
    setPage(1);
  }

  const observerRef = useRef();
  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, page, totalPages]);

  const filters = {
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    newArrival: searchParams.get('newArrival') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  };

  useEffect(() => {
    getBrands().then(setBrands).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.sort) params.sort = filters.sort;
    if (filters.search) params.search = filters.search;
    if (filters.featured) params.featured = filters.featured;
    if (filters.newArrival) params.newArrival = filters.newArrival;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    params.page = page;
    params.limit = 30; // Fetching 30 items for infinite scroll chunk

    getProducts(params).then(data => {
      if (page === 1) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setLoading(false);
      setLoadingMore(false);
    }).catch(() => {
      setLoading(false);
      setLoadingMore(false);
    });
  }, [lastSearch, page]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.delete('page'); // Clear page from URL if present
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});

  const activeFilterCount = [filters.category, filters.brand, filters.maxPrice, filters.featured, filters.newArrival].filter(Boolean).length;

  const title = filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}'s Collection` :
                filters.brand ? brands.find(b => b.id === filters.brand)?.name || 'Shop' : 'All Products';

  return (
    <div className="shop-page page-enter">
      <div className="container">
        <div className="shop-header">
          <h1>{title}</h1>
          <p>{total} products found</p>
        </div>
        <div className="shop-layout">
          {/* Filter Sidebar */}
          <aside className={`filter-sidebar ${filterOpen ? 'open' : ''}`}>
            {filterOpen && (
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
                <h3 style={{fontSize:18,fontWeight:700}}>Filters</h3>
                <button onClick={() => setFilterOpen(false)} style={{padding:8}}><X size={20} /></button>
              </div>
            )}
            {/* Categories */}
            <div className="filter-section">
              <div className="filter-section-title">Category</div>
              {categories.map(c => (
                <div key={c.id} className={`filter-option ${filters.category === c.id ? 'active' : ''}`} onClick={() => updateFilter('category', filters.category === c.id ? '' : c.id)}>
                  <div className="filter-checkbox">{filters.category === c.id && <Check size={12} />}</div>
                  {c.name}
                </div>
              ))}
            </div>
            {/* Brands */}
            <div className="filter-section">
              <div className="filter-section-title">Brand</div>
              {brands.map(b => (
                <div key={b.id} className={`filter-option ${filters.brand === b.id ? 'active' : ''}`} onClick={() => updateFilter('brand', filters.brand === b.id ? '' : b.id)}>
                  <div className="filter-checkbox">{filters.brand === b.id && <Check size={12} />}</div>
                  {b.name}
                </div>
              ))}
            </div>
            {/* Price */}
            <div className="filter-section">
              <div className="filter-section-title">Max Price</div>
              <div className="price-range">
                <input type="range" min="500" max="20000" step="500"
                  value={filters.maxPrice || 20000}
                  onChange={(e) => updateFilter('maxPrice', e.target.value === '20000' ? '' : e.target.value)}
                />
                <div className="price-range-labels">
                  <span>₹500</span>
                  <span>₹{filters.maxPrice || '20,000'}</span>
                </div>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button className="filter-clear" onClick={clearFilters}>Clear all filters ({activeFilterCount})</button>
            )}
          </aside>

          {/* Products */}
          <div>
            <div className="shop-toolbar">
              <div className="shop-results">
                <button className="btn btn-outline btn-sm filter-mobile-toggle" onClick={() => setFilterOpen(true)}>
                  <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
              </div>
              <div className="shop-sort">
                <label>Sort by:</label>
                <select className="input" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            {loading ? (
              <div className="product-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <div className="skeleton" style={{aspectRatio:'3/4',marginBottom:12}} />
                    <div className="skeleton" style={{height:12,width:'60%',marginBottom:8}} />
                    <div className="skeleton" style={{height:16,width:'80%',marginBottom:8}} />
                    <div className="skeleton" style={{height:14,width:'40%'}} />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{textAlign:'center',padding:'80px 0'}}>
                <h3 style={{fontSize:20,marginBottom:8}}>No products found</h3>
                <p style={{color:'var(--text-secondary)',marginBottom:24}}>Try adjusting your filters</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((p, i) => {
                  if (i === products.length - 1) {
                    return <ProductCard ref={lastElementRef} key={p.id} product={p} />;
                  }
                  return <ProductCard key={p.id} product={p} />;
                })}
              </div>
            )}
            {loadingMore && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>Loading more products...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
