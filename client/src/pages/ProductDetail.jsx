import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Minus, Plus, Star, ShoppingBag, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Palette, Upload, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { getProduct, getProducts, getReviews, submitReview, uploadCustomDesign, API_ROOT } from '../api';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const galleryRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, comment: '' });
  const [reviewStatus, setReviewStatus] = useState({ error: '', success: '' });
  const [cartAdded, setCartAdded] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customFile, setCustomFile] = useState(null);
  const [customImagePreview, setCustomImagePreview] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setCartAdded(false);
    getProduct(id).then(p => {
      setProduct(p);
      setSelectedSize(p.sizes?.[0] || '');
      setSelectedColor(p.colors?.[0]?.name || '');
      setQuantity(1);
      setLoading(false);
      getProducts({ category: p.category, limit: 4 }).then(d => {
        setRelated(d.products.filter(r => r.id !== p.id).slice(0, 4));
      }).catch(() => {});
      getReviews(p.id).then(setReviews).catch(() => {});
    }).catch(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="container" style={{padding:'48px 0'}}>
      <div className="product-detail-grid">
        <div className="skeleton" style={{aspectRatio:'3/4',borderRadius:12}} />
        <div>
          <div className="skeleton" style={{height:14,width:'30%',marginBottom:12}} />
          <div className="skeleton" style={{height:32,width:'80%',marginBottom:16}} />
          <div className="skeleton" style={{height:20,width:'40%',marginBottom:32}} />
          <div className="skeleton" style={{height:100,width:'100%'}} />
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="container" style={{padding:'80px 0',textAlign:'center'}}><h2>Product not found</h2><Link to="/shop" className="btn btn-primary" style={{marginTop:16}}>Back to Shop</Link></div>;

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const inWishlist = isInWishlist(product.id);
  const inCart = cart.some(item => item.id === product.id);

  const handleCustomFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCustomFile(file);
    setCustomImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const result = await uploadCustomDesign(file);
      setCustomImageUrl(result.url);
    } catch (err) {
      alert('Failed to upload design. Please try again.');
      setCustomFile(null);
      setCustomImagePreview('');
    }
    setUploading(false);
  };

  const handleRemoveCustomImage = () => {
    setCustomFile(null);
    setCustomImagePreview('');
    setCustomImageUrl('');
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    if (product.isCustomizable && !customImageUrl) {
      alert('Please upload your design image before adding to cart. This product requires a custom design.');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity, customText, customImageUrl);
    setCartAdded(true);
    setShowCustomizer(false);
    setCustomText('');
    setCustomFile(null);
    setCustomImagePreview('');
    setCustomImageUrl('');
    setTimeout(() => setCartAdded(false), 1800);
  };

  const scrollToImage = (idx) => {
    if (galleryRef.current) {
      galleryRef.current.scrollTo({ left: idx * galleryRef.current.clientWidth, behavior: 'smooth' });
    }
    setMainImageIndex(idx);
  };

  const nextImage = () => {
    if (!product?.images) return;
    scrollToImage((mainImageIndex + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product?.images) return;
    scrollToImage((mainImageIndex - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="product-detail page-enter">
      <SEO 
        title={product.name} 
        description={product.description || `Buy ${product.name} at SupremeIt. High quality fashion.`} 
        image={product.images && product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${API_ROOT}${product.images[0]}`) : undefined}
      />
      <div className="container">
        <Link to="/shop" style={{display:'inline-flex',alignItems:'center',gap:8,color:'var(--text-secondary)',fontSize:14,marginBottom:24}}>
          <ArrowLeft size={16} /> Back to Shop
        </Link>
        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="product-gallery-main" style={{position:'relative', overflow:'hidden'}}>
              <div 
                ref={galleryRef}
                onScroll={(e) => {
                  const idx = Math.round(e.target.scrollLeft / e.target.clientWidth);
                  if (idx !== mainImageIndex) setMainImageIndex(idx);
                }}
                style={{display:'flex', width:'100%', height:'100%', overflowX:'auto', scrollSnapType:'x mandatory', scrollBehavior:'smooth', scrollbarWidth:'none', msOverflowStyle:'none'}}
              >
                {product.images?.length > 0 ? product.images.map((img, i) => (
                  <div key={i} style={{flex:'0 0 100%', width:'100%', height:'100%', scrollSnapAlign:'start'}}>
                    {img?.startsWith('/uploads') || img?.startsWith('http') ? (
                      <img src={img.startsWith('http') ? img : `${API_ROOT}${img}`} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    ) : (
                      <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#f0ebe3,#e8e0d2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:'#999',fontWeight:600}}>
                        {product.brand.toUpperCase()}
                      </div>
                    )}
                  </div>
                )) : (
                  <div style={{flex:'0 0 100%', width:'100%', height:'100%', scrollSnapAlign:'start'}}>
                    <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#f0ebe3,#e8e0d2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:'#999',fontWeight:600}}>
                      {product.brand.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              {product.images?.length > 1 && (
                <>
                  <button onClick={prevImage} style={{position:'absolute',top:'50%',left:16,transform:'translateY(-50%)',background:'rgba(255,255,255,0.8)',border:'none',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'var(--shadow-sm)'}}>
                    <ChevronLeft size={20} style={{color:'var(--text-primary)'}} />
                  </button>
                  <button onClick={nextImage} style={{position:'absolute',top:'50%',right:16,transform:'translateY(-50%)',background:'rgba(255,255,255,0.8)',border:'none',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'var(--shadow-sm)'}}>
                    <ChevronRight size={20} style={{color:'var(--text-primary)'}} />
                  </button>
                </>
              )}
            </div>
            {product.images?.length > 1 && (
              <div style={{display:'flex',gap:12,marginTop:12,overflowX:'auto'}}>
                {product.images.map((img, idx) => (
                  <div key={idx} style={{width:80,height:80,flexShrink:0,cursor:'pointer',border:mainImageIndex === idx ? '2px solid var(--text-primary)' : '2px solid transparent',borderRadius:8,overflow:'hidden'}} onClick={() => scrollToImage(idx)}>
                    {img?.startsWith('http') || img?.startsWith('/uploads') ? (
                       <img src={img.startsWith('http') ? img : `${API_ROOT}${img}`} alt={`${product.name} ${idx}`} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    ) : (
                      <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#f0ebe3,#e8e0d2)'}} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="product-info">
            <div className="product-info-brand">{product.brand}</div>
            <h1>{product.name}</h1>
            <div className="product-info-rating">
              <span className="stars">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} />)}</span>
              <span>{product.rating} ({product.reviews} reviews)</span>
            </div>
            <div className="product-info-price">
              <span className="current">{formatPrice(product.price)}</span>
              {product.comparePrice && <span className="compare">{formatPrice(product.comparePrice)}</span>}
              {discount > 0 && <span className="discount">{discount}% off</span>}
            </div>
            <p className="product-info-description">{product.description}</p>

            {/* Size */}
            <div className="product-option-title">Size</div>
            <div className="product-sizes">
              {product.sizes.map(s => (
                <button key={s} className={`size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
              ))}
            </div>

            {/* Color */}
            {product.colors?.length > 0 && (
              <>
                <div className="product-option-title">Color — {selectedColor}</div>
                <div className="product-colors">
                  {product.colors.map(c => (
                    <button key={c.name} className={`color-swatch ${selectedColor === c.name ? 'active' : ''}`}
                      style={{background: c.hex}} title={c.name} onClick={() => setSelectedColor(c.name)} />
                  ))}
                </div>
              </>
            )}

            {/* Quantity */}
            <div className="product-option-title">Quantity</div>
            <div className="product-quantity">
              <button className="quantity-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
              <span className="quantity-value">{quantity}</span>
              <button className="quantity-btn" onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
            </div>

            {/* Customize Option */}
            {product.isCustomizable && (
              <div style={{marginTop:20}}>
                <button
                  type="button"
                  onClick={() => setShowCustomizer(!showCustomizer)}
                  style={{
                    display:'flex', alignItems:'center', gap:10, width:'100%',
                    padding:'14px 20px', border:'2px dashed var(--text-primary)',
                    borderRadius:12, background: showCustomizer ? 'var(--text-primary)' : 'transparent',
                    color: showCustomizer ? '#fff' : 'var(--text-primary)',
                    cursor:'pointer', fontSize:15, fontWeight:600,
                    transition:'all 0.3s ease'
                  }}
                >
                  <Palette size={20} />
                  {showCustomizer ? 'Close Customizer' : '✨ Add Your Own Design'}
                </button>

                {showCustomizer && (
                  <div style={{
                    marginTop:16, padding:24, border:'1px solid var(--border)',
                    borderRadius:12, background:'var(--bg-surface)',
                    animation:'fadeIn 0.3s ease'
                  }}>
                    <h4 style={{marginBottom:16, fontSize:16, fontWeight:600}}>Customize This Product</h4>

                    {/* Custom Text */}
                    <div style={{marginBottom:20}}>
                      <label style={{display:'block', fontSize:13, fontWeight:600, marginBottom:8, color:'var(--text-secondary)'}}>Custom Text (optional)</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g., Your name, a quote, pet name..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        maxLength={100}
                        style={{width:'100%'}}
                      />
                      <p style={{fontSize:11, color:'var(--text-tertiary)', marginTop:4}}>{customText.length}/100 characters</p>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label style={{display:'block', fontSize:13, fontWeight:600, marginBottom:8, color:'var(--text-secondary)'}}>Upload Your Design <span style={{color:'var(--error)'}}>*</span></label>
                      {customImagePreview ? (
                        <div style={{position:'relative', display:'inline-block'}}>
                          <img src={customImagePreview} alt="Custom design" style={{width:120, height:120, objectFit:'cover', borderRadius:12, border:'2px solid var(--border)'}} />
                          <button
                            type="button"
                            onClick={handleRemoveCustomImage}
                            style={{position:'absolute', top:-8, right:-8, background:'var(--error)', color:'#fff', border:'none', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}
                          >
                            <X size={14} />
                          </button>
                          {uploading && <p style={{fontSize:12, color:'var(--text-secondary)', marginTop:6}}>Uploading...</p>}
                        </div>
                      ) : (
                        <label style={{
                          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                          gap:8, padding:'28px 20px', border:'2px dashed var(--border)', borderRadius:12,
                          cursor:'pointer', color:'var(--text-secondary)', fontSize:14,
                          transition:'border-color 0.2s'
                        }}>
                          <Upload size={24} />
                          <span>Click to upload your logo or design</span>
                          <span style={{fontSize:11, color:'var(--text-tertiary)'}}>JPG, PNG, WebP — max 10MB</span>
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCustomFileChange} style={{display:'none'}} />
                        </label>
                      )}
                    </div>

                    <p style={{marginTop:16, fontSize:12, color:'var(--success)', fontWeight:500}}>🎉 Custom printing is FREE — no extra charges!</p>
                    {!customImageUrl && <p style={{marginTop:8, fontSize:12, color:'var(--error)', fontWeight:500}}>⚠️ Design image is required to add this product to cart</p>}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="product-actions">
              {product.stock === 0 ? (
                <button className="btn btn-primary btn-lg" disabled style={{background: '#ccc', cursor: 'not-allowed', color: '#666', border: 'none'}}>
                  Sold Out
                </button>
              ) : inCart ? (
                <button className="btn btn-primary btn-lg" style={{background: 'var(--text-primary)'}} onClick={() => navigate('/cart')}>
                  Go to Cart <ArrowRight size={18} />
                </button>
              ) : cartAdded ? (
                <button className="btn btn-primary btn-lg animate-pop" style={{background:'var(--success)', pointerEvents:'none'}}>
                  ✓ Added to Cart!
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={uploading} style={uploading ? {opacity: 0.7, cursor: 'wait'} : {}}>
                  <ShoppingBag size={18} /> {uploading ? 'Uploading Design...' : 'Add to Cart'}
                </button>
              )}
              <button className={`btn-wishlist ${inWishlist ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Stock */}
            <p style={{marginTop:16,fontSize:13,color: product.stock === 0 ? 'var(--error)' : product.stock > 10 ? 'var(--success)' : 'var(--warning)'}}>
              {product.stock === 0 ? 'Out of Stock' : product.stock > 10 ? 'In Stock' : `Only ${product.stock} left!`}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{marginTop: 80, borderTop: '1px solid var(--border)', paddingTop: 40}}>
          <h2 className="section-title">Customer Reviews</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, marginTop: 32}}>
            
            {/* Review List */}
            <div>
              <div style={{display:'flex', alignItems:'center', gap: 16, marginBottom: 32}}>
                <div style={{fontSize: 48, fontWeight: 'bold'}}>{product.rating > 0 ? product.rating.toFixed(1) : 0}</div>
                <div>
                  <div style={{display:'flex', gap: 4, color:'var(--text-primary)', marginBottom: 4}}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} strokeWidth={1} />)}
                  </div>
                  <div style={{color:'var(--text-secondary)', fontSize: 14}}>Based on {product.reviews} verified reviews</div>
                </div>
              </div>
              
              <div style={{display:'flex', flexDirection:'column', gap: 24}}>
                {reviews.length === 0 ? (
                  <p style={{color:'var(--text-secondary)'}}>No reviews yet. Be the first!</p>
                ) : (
                  reviews.map(r => (
                    <div key={r._id || r.id} style={{paddingBottom: 24, borderBottom: '1px solid var(--border)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom: 8}}>
                        <div style={{display:'flex', alignItems:'center', gap: 8}}>
                          <strong style={{fontWeight: 600}}>{r.customerName}</strong>
                          {r.verified && <span style={{fontSize: 12, background:'var(--success)', color:'#fff', padding:'2px 8px', borderRadius: 12}}>✓ Verified</span>}
                        </div>
                        <div style={{color:'var(--text-secondary)', fontSize: 12}}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{display:'flex', gap: 2, marginBottom: 12, color:'var(--text-primary)'}}>
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? 'currentColor' : 'none'} />)}
                      </div>
                      <p style={{color:'var(--text-secondary)', lineHeight: 1.6, fontSize: 15}}>{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Review Form */}
            <div style={{background: 'var(--surface-bg)', padding: 32, borderRadius: 16}}>
              <h3 style={{fontSize: 20, marginBottom: 24}}>Write a Review</h3>
              {reviewStatus.error && <div style={{padding: 12, background: '#fae0e4', color: 'var(--error)', borderRadius: 8, marginBottom: 16, fontSize: 14}}>{reviewStatus.error}</div>}
              {reviewStatus.success && <div style={{padding: 12, background: '#e0faeb', color: 'var(--success)', borderRadius: 8, marginBottom: 16, fontSize: 14}}>{reviewStatus.success}</div>}
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                setReviewStatus({ error:'', success:'' });
                try {
                  const payload = {
                    productId: product.id,
                    customerName: reviewForm.name,
                    customerEmail: reviewForm.email,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                  };
                  const newReview = await submitReview(payload);
                  setReviews([newReview, ...reviews]);
                  setReviewStatus({ error: '', success: 'Review submitted successfully!' });
                  setReviewForm({ name:'', email:'', rating:5, comment:'' });
                } catch (err) {
                  setReviewStatus({ error: err.message || 'Failed to submit review', success: '' });
                }
              }} style={{display:'flex', flexDirection:'column', gap: 16}}>
                <div style={{display:'flex', gap: 16}}>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize: 13, marginBottom: 6}}>Name</label>
                    <input type="text" required style={{width:'100%', padding:'10px 14px', borderRadius: 8, border:'1px solid var(--border)'}} value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display:'block', fontSize: 13, marginBottom: 6}}>Email</label>
                    <input type="email" required style={{width:'100%', padding:'10px 14px', borderRadius: 8, border:'1px solid var(--border)'}} value={reviewForm.email} onChange={e => setReviewForm({...reviewForm, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label style={{display:'block', fontSize: 13, marginBottom: 6}}>Rating</label>
                  <div style={{display:'flex', gap: 4}}>
                    {[1,2,3,4,5].map(star => (
                      <button type="button" key={star} onClick={() => setReviewForm({...reviewForm, rating: star})} style={{background:'none', border:'none', cursor:'pointer', padding: 0}}>
                        <Star size={24} fill={star <= reviewForm.rating ? 'var(--text-primary)' : 'none'} color="var(--text-primary)" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{display:'block', fontSize: 13, marginBottom: 6}}>Review</label>
                  <textarea required rows="4" style={{width:'100%', padding:'10px 14px', borderRadius: 8, border:'1px solid var(--border)', fontFamily:'inherit'}} value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{marginTop: 8}}>Submit Review</button>
              </form>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{marginTop:80}}>
            <h2 className="section-title">You May Also Like</h2>
            <div className="product-grid" style={{marginTop:32}}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
