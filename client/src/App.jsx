import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import TrackOrder from './pages/TrackOrder';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSettings from './pages/admin/AdminSettings';

import { Terms, Privacy, FAQ, SizeGuide, Returns, Shipping, Careers, Press } from './pages/StaticPages';

import './styles/index.css';
import './styles/navbar.css';
import './styles/home.css';
import './styles/product.css';
import './styles/shop.css';
import './styles/cart.css';
import './styles/admin.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Admin routes (no navbar/footer) */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/new" element={<AdminAddProduct />} />
              <Route path="/admin/products/edit/:id" element={<AdminAddProduct />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              
              {/* Store routes */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <main style={{ minHeight: 'calc(100vh - 72px)' }}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/track-order" element={<TrackOrder />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/size-guide" element={<SizeGuide />} />
                      <Route path="/returns" element={<Returns />} />
                      <Route path="/shipping" element={<Shipping />} />
                      <Route path="/careers" element={<Careers />} />
                      <Route path="/press" element={<Press />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </Router>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
