import { Sparkles, Heart, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="about-page page-enter">
      <SEO title="About Us" description="Learn more about SupremeIt and our mission to curate the best casual fashion." />
      <div className="container">
        <div className="about-hero">
          <h1>About SupremeIt</h1>
          <p>We believe great style shouldn't be complicated. SupremeIt curates the best from the world's top brands, making fashion accessible, comfortable, and effortlessly cool.</p>
        </div>
        <div className="about-values">
          <div className="about-value">
            <div className="about-value-icon"><Sparkles size={28} /></div>
            <h3>Quality First</h3>
            <p>Every product we carry is hand-selected for quality, durability, and style. We partner with brands that share our commitment to excellence.</p>
          </div>
          <div className="about-value">
            <div className="about-value-icon"><Heart size={28} /></div>
            <h3>Customer Love</h3>
            <p>Your satisfaction is our priority. From easy returns to responsive support, we're here to make your shopping experience exceptional.</p>
          </div>
          <div className="about-value">
            <div className="about-value-icon"><Leaf size={28} /></div>
            <h3>Sustainability</h3>
            <p>We're committed to reducing our environmental footprint. We prioritize brands with sustainable practices and eco-friendly materials.</p>
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:48}}>
          <Link to="/shop" className="btn btn-primary btn-lg">Explore Our Collection</Link>
        </div>
      </div>
    </div>
  );
}
