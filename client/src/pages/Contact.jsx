import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="contact-page page-enter">
      <div className="container">
        <h1 style={{fontSize:'var(--text-4xl)',fontWeight:800,marginBottom:8,textAlign:'center'}}>Get in Touch</h1>
        <p style={{textAlign:'center',color:'var(--text-secondary)',fontSize:'var(--text-lg)',marginBottom:48}}>We'd love to hear from you</p>
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p>Have a question or feedback? Reach out to us through any of these channels.</p>
            <div className="contact-detail">
              <div className="contact-detail-icon"><MapPin size={20} /></div>
              <div><h4>Address</h4><p>123 Fashion Street, Mumbai, India</p></div>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon"><Phone size={20} /></div>
              <div><h4>Phone</h4><p>+91 98765 43210</p></div>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon"><Mail size={20} /></div>
              <div><h4>Email</h4><p>hello@macmiller.store</p></div>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon"><Clock size={20} /></div>
              <div><h4>Working Hours</h4><p>Mon - Sat: 10AM - 8PM</p></div>
            </div>
          </div>
          <div className="contact-form">
            <h2>Send a Message</h2>
            {sent && <div className="badge badge-success" style={{marginBottom:16,padding:'8px 16px'}}>Message sent successfully!</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-group"><label>Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="input-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div className="input-group"><label>Subject</label><input className="input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required /></div>
              <div className="input-group"><label>Message</label><textarea className="input" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required /></div>
              <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%',marginTop:8}}>Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
