import React from 'react';

export const Terms = () => (
  <div className='container' style={{paddingTop: 80, paddingBottom: 80, minHeight: '60vh', maxWidth: 800}}>
    <h1 style={{marginBottom: 24}}>Terms of Service</h1>
    <p>Welcome to SupremeIt! By using our website, you agree to the following terms and conditions:</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>1. General Conditions</h3>
    <p>We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission by us.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>2. Products and Pricing</h3>
    <p>Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product without notice at any time.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>3. Custom Designs</h3>
    <p>For customizable products, you represent and warrant that you own or have the rights to use any images, text, or designs you upload. SupremeIt is not liable for copyright infringement caused by user-uploaded content.</p>
  </div>
);

export const Privacy = () => (
  <div className='container' style={{paddingTop: 80, paddingBottom: 80, minHeight: '60vh', maxWidth: 800}}>
    <h1 style={{marginBottom: 24}}>Privacy Policy</h1>
    <p>At SupremeIt, we value your privacy. This policy explains how we collect, use, and protect your personal information.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>Information We Collect</h3>
    <p>When you make a purchase, we collect necessary information such as your name, billing address, shipping address, payment information, email address, and phone number.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>How We Use Your Information</h3>
    <p>We use this information to fulfill your orders, process payments, arrange shipping, and provide you with invoices and order confirmations.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>Data Security</h3>
    <p>We implement strict security measures to maintain the safety of your personal information when you place an order.</p>
  </div>
);

export const FAQ = () => (
  <div className='container' style={{paddingTop: 80, paddingBottom: 80, minHeight: '60vh', maxWidth: 800}}>
    <h1 style={{marginBottom: 24}}>Frequently Asked Questions</h1>
    <h4 style={{marginTop: 20}}>Do you offer Cash on Delivery (COD)?</h4>
    <p style={{color: 'var(--text-secondary)'}}>Currently, we only accept prepaid orders to ensure fast processing and delivery.</p>
    
    <h4 style={{marginTop: 20}}>How long does shipping take?</h4>
    <p style={{color: 'var(--text-secondary)'}}>Standard orders are usually processed within 24-48 hours. Delivery takes an additional 5 to 10 business days depending on your location.</p>
    
    <h4 style={{marginTop: 20}}>Can I print any design I want?</h4>
    <p style={{color: 'var(--text-secondary)'}}>Yes! For our customizable products, you can upload any high-quality image, logo, or text, and we will print it for you with no extra charge.</p>
  </div>
);

export const SizeGuide = () => (
  <div className='container' style={{paddingTop: 80, paddingBottom: 80, minHeight: '60vh', maxWidth: 800}}>
    <h1 style={{marginBottom: 24}}>Size Guide</h1>
    <p style={{marginBottom: 24}}>To find your perfect fit, compare your measurements to our sizing chart below. All measurements are in inches.</p>
    <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
      <thead>
        <tr style={{borderBottom: '2px solid var(--border)'}}>
          <th style={{padding: '12px 8px'}}>Size</th>
          <th style={{padding: '12px 8px'}}>Chest</th>
          <th style={{padding: '12px 8px'}}>Length</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{borderBottom: '1px solid var(--border)'}}>
          <td style={{padding: '12px 8px'}}>S</td>
          <td style={{padding: '12px 8px'}}>38"</td>
          <td style={{padding: '12px 8px'}}>26"</td>
        </tr>
        <tr style={{borderBottom: '1px solid var(--border)'}}>
          <td style={{padding: '12px 8px'}}>M</td>
          <td style={{padding: '12px 8px'}}>40"</td>
          <td style={{padding: '12px 8px'}}>27"</td>
        </tr>
        <tr style={{borderBottom: '1px solid var(--border)'}}>
          <td style={{padding: '12px 8px'}}>L</td>
          <td style={{padding: '12px 8px'}}>42"</td>
          <td style={{padding: '12px 8px'}}>28"</td>
        </tr>
        <tr style={{borderBottom: '1px solid var(--border)'}}>
          <td style={{padding: '12px 8px'}}>XL</td>
          <td style={{padding: '12px 8px'}}>44"</td>
          <td style={{padding: '12px 8px'}}>29"</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const Returns = () => (
  <div className='container' style={{paddingTop: 80, paddingBottom: 80, minHeight: '60vh', maxWidth: 800}}>
    <h1 style={{marginBottom: 24}}>Returns & Exchanges</h1>
    <p>We want you to be 100% satisfied with your purchase from SupremeIt.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>Standard Products</h3>
    <p>You can return standard (non-customized) products within [X] days of delivery. Items must be unworn, unwashed, and in their original packaging.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>Custom Products</h3>
    <p>Because custom items are printed specifically for you with your unique design, they are <strong>strictly non-returnable and non-refundable</strong> unless they arrive damaged or defective.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>Damaged Items</h3>
    <p>If you receive a defective or damaged product, please contact us within 48 hours of delivery with photo proof, and we will arrange a replacement free of charge.</p>
  </div>
);

export const Shipping = () => (
  <div className='container' style={{paddingTop: 80, paddingBottom: 80, minHeight: '60vh', maxWidth: 800}}>
    <h1 style={{marginBottom: 24}}>Shipping Information</h1>
    <h3 style={{marginTop: 24, marginBottom: 8}}>Processing Time</h3>
    <p>All orders are processed and sent to our printing facility within 24-48 hours. Custom orders may take an additional day for design verification.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>Delivery Time</h3>
    <p>Once shipped, standard delivery takes 5 to 10 business days depending on your pin code.</p>
    <h3 style={{marginTop: 24, marginBottom: 8}}>3. Shipping Costs</h3>
    <p>We offer free shipping on all prepaid orders over ₹1,999. A standard shipping fee of ₹50 applies to smaller orders. Note: As a small brand, we do not currently accept Cash on Delivery (COD). All orders must be prepaid.</p>
  </div>
);

export const Careers = () => (
  <div className='container' style={{paddingTop: 80, paddingBottom: 80, minHeight: '60vh', maxWidth: 800}}>
    <h1 style={{marginBottom: 24}}>Careers</h1>
    <p style={{marginTop: 20, fontSize: 18, fontWeight: 500}}>Currently no jobs available.</p>
  </div>
);

export const Press = () => (
  <div className='container' style={{paddingTop: 80, paddingBottom: 80, minHeight: '60vh', maxWidth: 800}}>
    <h1 style={{marginBottom: 24}}>Press</h1>
    <p>For press inquiries, brand collaborations, or media packages, please reach out to us directly.</p>
    <p style={{marginTop: 16}}><strong>Contact:</strong> [Press Email / Phone]</p>
  </div>
);
