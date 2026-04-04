import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { LayoutDashboard, Box, ClipboardList, Plus, LogOut, Package, ArrowLeft, X, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addProduct, updateProduct, getProduct, getBrands, getCategories, addBrand } from '../../api';

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
    name: '', brand: '', category: '', subcategory: '', price: '', comparePrice: '',
    description: '', sizes: '', stock: '', featured: false, newArrival: false
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
          name: p.name, brand: p.brand, category: p.category, subcategory: p.subcategory || '',
          price: String(p.price), comparePrice: p.comparePrice ? String(p.comparePrice) : '',
          description: p.description, sizes: p.sizes.join(', '), stock: String(p.stock),
          featured: p.featured, newArrival: p.newArrival
        });
        setExistingImages(p.images || []);
      }).catch(() => {});
    }
  }, [isAdmin, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      fd.append('name', form.name);
      fd.append('brand', finalBrand);
      fd.append('category', form.category);
      fd.append('subcategory', form.subcategory);
      fd.append('price', form.price);
      if (form.comparePrice) fd.append('comparePrice', form.comparePrice);
      fd.append('description', form.description);
      fd.append('sizes', JSON.stringify(form.sizes.split(',').map(s => s.trim()).filter(Boolean)));
      fd.append('colors', JSON.stringify([{ name: 'Default', hex: '#1A1A1A' }]));
      fd.append('stock', form.stock);
      fd.append('featured', String(form.featured));
      fd.append('newArrival', String(form.newArrival));
      fd.append('existingImages', JSON.stringify(existingImages));
      
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

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Mac Miller Admin</div>
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
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="input-group full-width"><label>Product Name *</label><input className="input" name="name" value={form.name} onChange={handleChange} required /></div>
            <div className="input-group">
              <label>Brand *</label>
              <select className="input" name="brand" value={form.brand} onChange={handleChange} required>
                <option value="">Select brand</option>
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
            <div className="input-group"><label>Category *</label>
              <select className="input" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label>Subcategory</label>
              <select className="input" name="subcategory" value={form.subcategory} onChange={handleChange}>
                <option value="">Select subcategory</option>
                {selectedCat?.subcategories?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="input-group"><label>Price (₹) *</label><input className="input" name="price" type="number" value={form.price} onChange={handleChange} required /></div>
            <div className="input-group"><label>Compare Price (₹)</label><input className="input" name="comparePrice" type="number" value={form.comparePrice} onChange={handleChange} /></div>
            <div className="input-group"><label>Stock *</label><input className="input" name="stock" type="number" value={form.stock} onChange={handleChange} required /></div>
            <div className="input-group full-width"><label>Sizes (comma separated) *</label><input className="input" name="sizes" value={form.sizes} onChange={handleChange} placeholder="S, M, L, XL" required /></div>
            <div className="input-group full-width"><label>Description *</label><textarea className="input" name="description" value={form.description} onChange={handleChange} required /></div>
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
            <div style={{display:'flex',gap:24,alignItems:'center'}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured</label>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" name="newArrival" checked={form.newArrival} onChange={handleChange} /> New Arrival</label>
            </div>
          </div>
          <div className="admin-form-actions">
            <Link to="/admin/products" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
