import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Mac<span>Miller</span></h3>
            <p>Your destination for casual fashion. Curating the best from world-class brands to elevate your everyday style.</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="Twitter">TW</a>
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="YouTube">YT</a>
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
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <a href="#">Shipping Info</a>
            <a href="#">Returns</a>
            <a href="#">Size Guide</a>
            <a href="#">FAQ</a>
            <div className="footer-newsletter">
              <h4 style={{marginTop: '24px'}}>Newsletter</h4>
              <div className="footer-newsletter-form">
                <input type="email" placeholder="Your email" />
                <button>Join</button>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Mac Miller. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
