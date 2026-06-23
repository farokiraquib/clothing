import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { LayoutDashboard, Box, ClipboardList, Plus, LogOut, Package, ArrowLeft, X, Image as ImageIcon, Settings, Shirt, Watch, PawPrint, Footprints, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addProduct, updateProduct, getProduct, getBrands, getCategories, addBrand } from '../../api';

// Product type configurations
const PRODUCT_TYPES = [
  { id: 'clothing', label: 'Clothing', icon: Shirt, color: '#6366f1', description: 'T-shirts, hoodies, jackets, pants, etc.' },
  { id: 'accessories', label: 'Accessories', icon: Watch, color: '#f59e0b', description: 'Bags, wallets, belts, jewelry, caps, etc.' },
  { id: 'footwear', label: 'Footwear', icon: Footprints, color: '#10b981', description: 'Shoes, sneakers, sandals, slippers' },
  { id: 'pet-accessories', label: 'Pet Accessories', icon: PawPrint, color: '#ec4899', description: 'Collars, leashes, bowls, pet clothing' },
  { id: 'custom', label: 'Custom Products', icon: Sparkles, color: '#8b5cf6', description: 'Fully custom printed items' },
];

const SIZE_PRESETS = {
  clothing: 'XS, S, M, L, XL, XXL',
  footwear: '6, 7, 8, 9, 10, 11, 12',
  'pet-accessories': 'Small, Medium, Large, X-Large',
  accessories: 'One Size',
  custom: 'S, M, L, XL, XXL',
};

const MATERIAL_OPTIONS = {
  clothing: ['Cotton', 'Polyester', 'Cotton Blend', 'Linen', 'Denim', 'Fleece', 'Wool'],
  accessories: ['Leather', 'Canvas', 'Metal', 'Fabric', 'Silicone', 'Stainless Steel', 'Plastic'],
  footwear: ['Leather', 'Canvas', 'Mesh', 'Synthetic', 'Rubber', 'Suede'],
  'pet-accessories': ['Nylon', 'Leather', 'Cotton', 'Polyester', 'Silicone', 'Stainless Steel'],
  custom: ['Cotton', 'Polyester', 'Cotton Blend', 'Canvas'],
};

export default function AdminAddProduct() {
  const { id } = useParams();
  const isEdit = !!id;
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [customBrandName, setCustomBrandName] = useState('');
  const [form, setForm] = useState({
    productType: '', name: '', brand: '', category: '', subcategory: '', price: '', comparePrice: '',
    description: '', sizes: '', stock: '', material: '', featured: false, newArrival: false, isCustomizable: false, qikinkSku: '', qikinkPrintTypeId: 1
  });
  const { isAdmin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    getBrands().then(setBrands).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
    if (isEdit) {
      getProduct(id).then(p => {
        setForm({
          productType: p.productType || 'clothing',
          name: p.name, brand: p.brand || '', category: p.category, subcategory: p.subcategory || '',
          price: String(p.price), comparePrice: p.comparePrice ? String(p.comparePrice) : '',
          description: p.description, sizes: (p.sizes || []).join(', '), stock: String(p.stock),
          material: p.material || '',
          featured: p.featured, newArrival: p.newArrival, isCustomizable: !!p.isCustomizable,
          qikinkSku: p.qikinkSku || '',
          qikinkPrintTypeId: p.qikinkPrintTypeId || 1
        });
        setExistingImages(p.images || []);
      }).catch(() => {});
    }
  }, [isAdmin, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProductTypeSelect = (typeId) => {
    setForm(prev => ({
      ...prev,
      productType: typeId,
      sizes: SIZE_PRESETS[typeId] || '',
      material: '',
      isCustomizable: typeId === 'custom' ? true : prev.isCustomizable,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let finalBrand = form.brand;
    try {
      if (form.brand === 'custom' && customBrandName) {
        const newBrand = await addBrand({ name: customBrandName });
        finalBrand = newBrand.id;
      }

      const fd = new FormData();
      fd.append('productType', form.productType);
      fd.append('name', form.name);
      if (finalBrand) fd.append('brand', finalBrand);
      fd.append('category', form.category);
      if (form.subcategory) fd.append('subcategory', form.subcategory);
      fd.append('price', form.price);
      if (form.comparePrice) fd.append('comparePrice', form.comparePrice);
      fd.append('description', form.description);
      fd.append('sizes', JSON.stringify(form.sizes.split(',').map(s => s.trim()).filter(Boolean)));
      fd.append('colors', JSON.stringify([{ name: 'Default', hex: '#1A1A1A' }]));
      if (form.material) fd.append('material', form.material);
      fd.append('stock', form.stock);
      fd.append('featured', String(form.featured));
      fd.append('newArrival', String(form.newArrival));
      fd.append('existingImages', JSON.stringify(existingImages));
      fd.append('isCustomizable', String(form.isCustomizable));
      if (form.qikinkSku) fd.append('qikinkSku', form.qikinkSku);
      
      if (images.length > 0) {
        images.forEach(img => fd.append('images', img));
      }

      if (isEdit) await updateProduct(id, fd);
      else await addProduct(fd);
      navigate('/admin/products');
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    }
    setLoading(false);
  };

  const selectedCat = categories.find(c => c.id === form.category);
  const currentType = form.productType;
  const showBrand = ['clothing', 'footwear', 'accessories'].includes(currentType);
  const showSubcategory = ['clothing', 'footwear'].includes(currentType);
  const showMaterial = !!currentType;
  const showSizes = currentType !== 'accessories' || form.sizes !== 'One Size';
  const categoryRequired = ['clothing', 'footwear', 'custom'].includes(currentType);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">SupremeIt Admin</div>
        <Link to="/admin/dashboard"><LayoutDashboard size={18} /> Dashboard</Link>
        <Link to="/admin/products"><Box size={18} /> Products</Link>
        <Link to="/admin/orders"><ClipboardList size={18} /> Orders</Link>
        <Link to="/admin/categories"><ImageIcon size={18} /> Categories</Link>
        <Link to="/admin/settings"><Settings size={18} /> Settings</Link>
        <Link to="/admin/products/new" className={!isEdit ? 'active' : ''}><Plus size={18} /> Add Product</Link>
        <div style={{marginTop:'auto',paddingTop:32}}>
          <Link to="/"><Package size={18} /> View Store</Link>
          <button onClick={() => { logoutAdmin(); navigate('/admin'); }} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',color:'rgba(255,255,255,0.7)',fontSize:14,width:'100%'}}><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      <main className="admin-content">
        <Link to="/admin/products" style={{display:'inline-flex',alignItems:'center',gap:8,color:'var(--text-secondary)',fontSize:14,marginBottom:16}}><ArrowLeft size={16} /> Back to Products</Link>
        <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

        {/* Step 1: Product Type Selector */}
        {!currentType && !isEdit && (
          <div style={{marginBottom:32}}>
            <h2 style={{fontSize:18, fontWeight:600, marginBottom:16}}>What type of product are you adding?</h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12}}>
              {PRODUCT_TYPES.map(pt => {
                const Icon = pt.icon;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => handleProductTypeSelect(pt.id)}
                    style={{
                      display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                      padding:'24px 16px', border:'2px solid var(--border)', borderRadius:16,
                      background:'var(--bg-surface)', cursor:'pointer', transition:'all 0.2s',
                      textAlign:'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = pt.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{width:48, height:48, borderRadius:12, background:`${pt.color}15`, display:'flex', alignItems:'center', justifyContent:'center', color:pt.color}}>
                      <Icon size={24} />
                    </div>
                    <span style={{fontWeight:600, fontSize:15}}>{pt.label}</span>
                    <span style={{fontSize:12, color:'var(--text-secondary)', lineHeight:1.4}}>{pt.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Product Form (only shows after type is selected) */}
        {(currentType || isEdit) && (
          <>
            {/* Type Badge */}
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24, padding:'12px 16px', background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:12}}>
              {(() => {
                const pt = PRODUCT_TYPES.find(t => t.id === currentType) || PRODUCT_TYPES[0];
                const Icon = pt.icon;
                return (
                  <>
                    <div style={{width:36, height:36, borderRadius:8, background:`${pt.color}15`, display:'flex', alignItems:'center', justifyContent:'center', color:pt.color}}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <span style={{fontWeight:600, fontSize:14}}>{pt.label}</span>
                      <span style={{fontSize:12, color:'var(--text-secondary)', display:'block'}}>{pt.description}</span>
                    </div>
                    {!isEdit && (
                      <button type="button" onClick={() => setForm(prev => ({...prev, productType: ''}))} style={{marginLeft:'auto', fontSize:12, color:'var(--text-secondary)', textDecoration:'underline', background:'none', border:'none', cursor:'pointer'}}>
                        Change Type
                      </button>
                    )}
                  </>
                );
              })()}
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-grid">
                {/* Name — Always shown */}
                <div className="input-group full-width"><label>Product Name *</label><input className="input" name="name" value={form.name} onChange={handleChange} required /></div>
                
                {/* Brand — Clothing, Footwear, Accessories only */}
                {showBrand && (
                  <div className="input-group">
                    <label>Brand</label>
                    <select className="input" name="brand" value={form.brand} onChange={handleChange}>
                      <option value="">No brand / Generic</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      <option value="custom">-- Add Custom Brand --</option>
                    </select>
                    {form.brand === 'custom' && (
                      <input 
                        className="input" 
                        style={{marginTop: 8}} 
                        placeholder="Enter new brand name" 
                        value={customBrandName} 
                        onChange={(e) => setCustomBrandName(e.target.value)} 
                        required 
                      />
                    )}
                  </div>
                )}

                {/* Category */}
                <div className="input-group"><label>Category {categoryRequired ? '*' : '(optional)'}</label>
                  <select className="input" name="category" value={form.category} onChange={handleChange} required={categoryRequired}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Subcategory — Clothing & Footwear */}
                {showSubcategory && (
                  <div className="input-group"><label>Subcategory</label>
                    <select className="input" name="subcategory" value={form.subcategory} onChange={handleChange}>
                      <option value="">Select subcategory</option>
                      {selectedCat?.subcategories?.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Price fields — Always shown */}
                <div className="input-group"><label>Price (₹) *</label><input className="input" name="price" type="number" value={form.price} onChange={handleChange} required /></div>
                <div className="input-group"><label>Compare Price (₹)</label><input className="input" name="comparePrice" type="number" value={form.comparePrice} onChange={handleChange} /></div>
                <div className="input-group"><label>Stock *</label><input className="input" name="stock" type="number" value={form.stock} onChange={handleChange} required /></div>
                
                {/* Material — shown for all types */}
                {showMaterial && (
                  <div className="input-group">
                    <label>Material</label>
                    <select className="input" name="material" value={form.material} onChange={handleChange}>
                      <option value="">Select material</option>
                      {(MATERIAL_OPTIONS[currentType] || []).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}

                {/* Sizes */}
                <div className="input-group full-width">
                  <label>
                    {currentType === 'footwear' ? 'Shoe Sizes (comma separated)' :
                     currentType === 'pet-accessories' ? 'Pet Sizes (comma separated)' :
                     currentType === 'accessories' ? 'Size' :
                     'Sizes (comma separated)'} *
                  </label>
                  <input className="input" name="sizes" value={form.sizes} onChange={handleChange}
                    placeholder={SIZE_PRESETS[currentType] || 'S, M, L, XL'} required />
                  {currentType && (
                    <button type="button" onClick={() => setForm(prev => ({...prev, sizes: SIZE_PRESETS[currentType] || ''}))}
                      style={{fontSize:11, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', marginTop:4, textDecoration:'underline'}}>
                      Use preset: {SIZE_PRESETS[currentType]}
                    </button>
                  )}
                </div>

                {/* Description — Always shown */}
                <div className="input-group full-width"><label>Description *</label><textarea className="input" name="description" value={form.description} onChange={handleChange} required /></div>
                
                {/* Images — Always shown */}
                <div className="input-group full-width">
                  <label>Images</label>
                  {isEdit && existingImages.length > 0 && (
                    <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
                      {existingImages.map((img, idx) => (
                        <div key={idx} style={{position:'relative',width:80,height:80,borderRadius:8,overflow:'hidden',border:'1px solid var(--border)'}}>
                          <img src={img.startsWith('/uploads') ? `http://localhost:5000${img}` : img} alt="product" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          <button type="button" onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))} style={{position:'absolute',top:4,right:4,background:'rgba(0,0,0,0.5)',color:'#fff',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} />
                  <p style={{fontSize: 12, color: 'var(--text-secondary)', marginTop: 4}}>Upload up to 5 images (jpg, png, webp). The first image will be the main product image.</p>
                </div>

                {/* Flags */}
                <div style={{display:'flex',gap:24,alignItems:'center',flexWrap:'wrap'}}>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured</label>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" name="newArrival" checked={form.newArrival} onChange={handleChange} /> New Arrival</label>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" name="isCustomizable" checked={form.isCustomizable} onChange={handleChange} /> Enable Customization</label>
                </div>
                {form.isCustomizable && (
                  <div className="input-group full-width" style={{marginTop:8}}>
                    <div>
                      <label>Qikink Print Type ID</label>
                      <input className="input" type="number" name="qikinkPrintTypeId" value={form.qikinkPrintTypeId} onChange={handleChange} placeholder="e.g. 5 for Sublimation" />
                      <p style={{fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4}}>Required for custom image uploads (e.g. 5 = Sublimation, 1 = DTG)</p>
                    </div>
                  </div>
                )}

                {/* Qikink SKU — shown for ALL products */}
                <div className="input-group full-width" style={{marginTop:8}}>
                  <label>Qikink SKU</label>
                  <input className="input" name="qikinkSku" value={form.qikinkSku} onChange={handleChange} placeholder="Enter Qikink product SKU for print fulfillment" />
                  <p style={{fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4}}>
                    {form.isCustomizable 
                      ? '⚡ Customizable: Customer uploads their design. Use base SKU from Qikink SKU Descriptions page.' 
                      : '🎨 Pre-designed: Qikink will print the design already saved on this SKU.'}
                  </p>
                </div>
              </div>
              <div className="admin-form-actions">
                <Link to="/admin/products" className="btn btn-outline">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}</button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
