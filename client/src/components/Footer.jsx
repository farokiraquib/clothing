import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/logo-full.png" alt="SupremeIt" style={{ height: '60px', marginBottom: '16px' }} loading="lazy" decoding="async" />
            <p>Your destination for casual fashion. Curating the best from world-class brands to elevate your everyday style.</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><FaInstagram size={20} /></a>
              <a href="#" aria-label="Twitter"><FaTwitter size={20} /></a>
              <a href="#" aria-label="Facebook"><FaFacebook size={20} /></a>
              <a href="#" aria-label="YouTube"><FaYoutube size={20} /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop?category=men">Men</Link>
            <Link to="/shop?category=women">Women</Link>
            <Link to="/shop?category=kids">Kids</Link>
            <Link to="/shop">New Arrivals</Link>
            <Link to="/shop">Sale</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/press">Press</Link>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <Link to="/track-order">Track Order</Link>
            <Link to="/shipping">Shipping Info</Link>
            <Link to="/returns">Returns</Link>
            <Link to="/size-guide">Size Guide</Link>
            <Link to="/faq">FAQ</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 SupremeIt. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
