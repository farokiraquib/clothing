import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { LayoutDashboard, Box, ClipboardList, Plus, LogOut, Package, ArrowLeft, X, Image as ImageIcon, Settings, Shirt, Watch, PawPrint, Footprints, Sparkles, Loader2 } from 'lucide-react';
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
  const [combinedImages, setCombinedImages] = useState([]);
  const [customBrandName, setCustomBrandName] = useState('');
  const [form, setForm] = useState({
    productType: '', name: '', brand: '', category: '', subcategory: '', price: '', comparePrice: '',
    description: '', sizes: '', stock: '', material: '', featured: false, newArrival: false, isCustomizable: false, qikinkSku: '', qikinkPrintTypeId: 1
  });
  const [colorList, setColorList] = useState([]);
  const [qikinkVariants, setQikinkVariants] = useState({});
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
        
        const existingVariants = {};
        if (p.qikinkVariants) {
          p.qikinkVariants.forEach(v => {
            existingVariants[`${v.color}-${v.size}`] = v.sku;
          });
        }
        setQikinkVariants(existingVariants);
        setQikinkVariants(existingVariants);
        setColorList(p.colors && p.colors.length > 0 && p.colors[0].name !== 'Default' ? p.colors : []);
        setCombinedImages((p.images || []).map(url => ({ type: 'existing', url })));
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
      
      const parsedColors = colorList.length > 0 ? colorList : [{ name: 'Default', hex: '#1A1A1A', qikinkCode: '' }];
      fd.append('colors', JSON.stringify(parsedColors));
      if (form.material) fd.append('material', form.material);
      fd.append('stock', form.stock);
      fd.append('featured', String(form.featured));
      fd.append('newArrival', String(form.newArrival));
      fd.append('isCustomizable', String(form.isCustomizable));
      if (form.qikinkSku) fd.append('qikinkSku', form.qikinkSku);
      if (form.qikinkPrintTypeId !== undefined) fd.append('qikinkPrintTypeId', form.qikinkPrintTypeId);
      
      const variantsPayload = [];
      Object.keys(qikinkVariants).forEach(key => {
        if (qikinkVariants[key]) {
          const [color, size] = key.split('-');
          variantsPayload.push({ color, size, sku: qikinkVariants[key] });
        }
      });
      fd.append('qikinkVariants', JSON.stringify(variantsPayload));
      
      const imageSequence = [];
      let newFileIndex = 0;
      combinedImages.forEach(img => {
        if (img.type === 'existing') {
          imageSequence.push({ type: 'existing', url: img.url });
        } else {
          fd.append('images', img.file);
          imageSequence.push({ type: 'new', index: newFileIndex });
          newFileIndex++;
        }
      });
      fd.append('imageSequence', JSON.stringify(imageSequence));

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
                <div className="input-group"><label>Category (optional)</label>
                  <select className="input" name="category" value={form.category} onChange={handleChange}>
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

                {/* Colors */}
                <div className="input-group full-width">
                  <label>Colors</label>
                  <p style={{fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8}}>Add specific colors, pick their exact hex code for the display dot, and enter their Qikink abbreviation (e.g. BLK).</p>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12}}>
                    {colorList.map((color, idx) => (
                      <div key={idx} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                        <input 
                          className="input" 
                          placeholder="Color Name (e.g. Black)" 
                          value={color.name} 
                          onChange={(e) => {
                            const newColors = [...colorList];
                            newColors[idx].name = e.target.value;
                            setColorList(newColors);
                          }} 
                          style={{flex: 1}}
                        />
                        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                          <input 
                            type="color" 
                            value={color.hex || '#000000'} 
                            onChange={(e) => {
                              const newColors = [...colorList];
                              newColors[idx].hex = e.target.value;
                              setColorList(newColors);
                            }}
                            style={{width: 32, height: 32, padding: 0, border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer'}}
                          />
                          <input 
                            className="input" 
                            placeholder="#000000" 
                            value={color.hex || ''} 
                            onChange={(e) => {
                              const newColors = [...colorList];
                              newColors[idx].hex = e.target.value;
                              setColorList(newColors);
                            }} 
                            style={{width: 80, fontSize: 13, padding: '4px 8px'}}
                          />
                        </div>
                        <input 
                          className="input" 
                          placeholder="Qikink Code (e.g. BLK)" 
                          value={color.qikinkCode || ''} 
                          onChange={(e) => {
                            const newColors = [...colorList];
                            newColors[idx].qikinkCode = e.target.value;
                            setColorList(newColors);
                          }} 
                          style={{flex: 1}}
                        />
                        <button 
                          type="button" 
                          onClick={() => setColorList(colorList.filter((_, i) => i !== idx))}
                          style={{background: 'var(--error)', color: '#fff', border: 'none', borderRadius: 4, width: 40, height: 40, cursor: 'pointer'}}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => setColorList([...colorList, { name: '', hex: '#000000', qikinkCode: '' }])}
                    style={{width: 'fit-content'}}
                  >
                    + Add Color
                  </button>
                </div>

                {/* Description — Always shown */}
                <div className="input-group full-width"><label>Description *</label><textarea className="input" name="description" value={form.description} onChange={handleChange} required /></div>
                
                {/* Images — Always shown */}
                <div className="input-group full-width">
                  <label>Images</label>
                  {combinedImages.length > 0 && (
                    <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
                      {combinedImages.map((imgObj, idx) => {
                        const src = imgObj.type === 'existing' ? (imgObj.url?.startsWith('/uploads') ? `http://localhost:5000${imgObj.url}` : imgObj.url) : imgObj.preview;
                        if (!src) return null;
                        return (
                          <div key={idx} style={{position:'relative',width:100,height:100,borderRadius:8,overflow:'hidden',border:'1px solid var(--border)'}}>
                            <img src={src} alt={`Product ${idx+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                            <div style={{position:'absolute', bottom: 4, left: 4, display:'flex', gap: 4}}>
                              {idx > 0 && (
                                <button type="button" onClick={() => {
                                  const arr = [...combinedImages];
                                  [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
                                  setCombinedImages(arr);
                                }} style={{background:'rgba(0,0,0,0.6)',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',fontSize:12,padding:'2px 6px',fontWeight:'bold'}}>&lt;</button>
                              )}
                              {idx < combinedImages.length - 1 && (
                                <button type="button" onClick={() => {
                                  const arr = [...combinedImages];
                                  [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]];
                                  setCombinedImages(arr);
                                }} style={{background:'rgba(0,0,0,0.6)',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',fontSize:12,padding:'2px 6px',fontWeight:'bold'}}>&gt;</button>
                              )}
                            </div>
                            <button type="button" onClick={() => setCombinedImages(combinedImages.filter((_, i) => i !== idx))} style={{position:'absolute',top:4,right:4,background:'rgba(0,0,0,0.6)',color:'#fff',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}><X size={12} /></button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <input type="file" multiple accept="image/*" onChange={(e) => {
                    const newFiles = Array.from(e.target.files).map(file => ({ type: 'new', file, preview: URL.createObjectURL(file) }));
                    setCombinedImages(prev => [...prev, ...newFiles]);
                  }} />
                  <p style={{fontSize: 12, color: 'var(--text-secondary)', marginTop: 4}}>Upload up to 5 images. The first image will be the main product image. Use the &lt; &gt; buttons to change their sequence.</p>
                </div>

                {/* Flags */}
                <div style={{display:'flex',gap:24,alignItems:'center',flexWrap:'wrap'}}>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured</label>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" name="newArrival" checked={form.newArrival} onChange={handleChange} /> New Arrival</label>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" name="isCustomizable" checked={form.isCustomizable} onChange={handleChange} /> Enable Customization</label>
                </div>
                <div className="input-group full-width" style={{marginTop:8}}>
                  <div>
                    <label>Qikink Print Type ID</label>
                    <input className="input" type="number" name="qikinkPrintTypeId" value={form.qikinkPrintTypeId} onChange={handleChange} placeholder="e.g. 2 for DTF" />
                    <p style={{fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4}}>Required to specify print technology (e.g. 1 = DTG, 2 = DTF, 5 = Sublimation)</p>
                  </div>
                </div>

                {/* Qikink SKU — shown for ALL products */}
                <div className="input-group full-width" style={{marginTop:8}}>
                  <label>Base Qikink SKU</label>
                  <input className="input" name="qikinkSku" value={form.qikinkSku} onChange={handleChange} placeholder="Enter base Qikink product SKU (e.g. MT-HS)" />
                  <p style={{fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4}}>
                    {form.isCustomizable 
                      ? '⚡ Customizable: Customer uploads their design. Use base SKU from Qikink SKU Descriptions page.' 
                      : '🎨 Pre-designed: Qikink will print the design already saved on this SKU.'}
                  </p>
                </div>
                
                {/* Dynamic Variants Table */}
                {(() => {
                  const sizeList = form.sizes.split(',').map(s => s.trim()).filter(Boolean);
                  const validColors = colorList.filter(c => c.name.trim() !== '');
                  
                  if (sizeList.length === 0 && validColors.length === 0) return null;
                  
                  const sizes = sizeList.length > 0 ? sizeList : ['Default'];
                  const colors = validColors.length > 0 ? validColors : [{ name: 'Default', qikinkCode: '' }];
                  
                  // Don't show if no variations exist
                  if (sizes.length === 1 && colors.length === 1 && sizes[0] === 'Default' && colors[0].name === 'Default') return null;

                  const handleAutoFill = () => {
                    const newVariants = { ...qikinkVariants };
                    const baseSku = form.qikinkSku.trim();
                    if (!baseSku) {
                      alert('Please enter a Base Qikink SKU first.');
                      return;
                    }
                    colors.forEach(color => {
                      sizes.forEach(size => {
                        const key = `${color.name}-${size}`;
                        const code = color.qikinkCode ? color.qikinkCode.trim().toUpperCase() : color.name.substring(0,3).toUpperCase();
                        newVariants[key] = `${baseSku}-${code}-${size}`;
                      });
                    });
                    setQikinkVariants(newVariants);
                  };

                  return (
                    <div className="input-group full-width" style={{marginTop: 16, border: '1px solid var(--border)', borderRadius: 8, padding: 16, background: 'var(--surface)'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                        <h4 style={{margin: 0}}>Qikink SKU Variations</h4>
                        <button type="button" onClick={handleAutoFill} className="btn btn-primary" style={{padding: '6px 12px', fontSize: 12}}>⚡ Auto-Fill SKUs</button>
                      </div>
                      <p style={{fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16}}>Paste the exact Qikink SKU for each specific combination below. This overrides the Base SKU.</p>
                      <div style={{display: 'grid', gap: 12}}>
                        {colors.map(color => (
                          sizes.map(size => {
                            const key = `${color.name}-${size}`;
                            const label = `${color.name !== 'Default' ? color.name : ''} ${color.name !== 'Default' && size !== 'Default' ? '-' : ''} ${size !== 'Default' ? size : ''}`;
                            return (
                              <div key={key} style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <div style={{width: 140, fontSize: 13, fontWeight: 600}}>
                                  {label.trim()}
                                </div>
                                <input 
                                  className="input" 
                                  placeholder={`e.g. MT-HS-${color.qikinkCode || color.name.substring(0,3).toUpperCase()}-${size}`}
                                  value={qikinkVariants[key] || ''}
                                  onChange={(e) => setQikinkVariants(prev => ({...prev, [key]: e.target.value}))}
                                  style={{flex: 1}}
                                />
                              </div>
                            )
                          })
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="admin-form-actions">
                <Link to="/admin/products" className="btn btn-outline">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                      Uploading & Saving...
                    </>
                  ) : (
                    isEdit ? 'Update Product' : 'Add Product'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
