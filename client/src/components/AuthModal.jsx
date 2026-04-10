import { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useUser();
  const overlayRef = useRef();

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => { setTab(defaultTab); setError(''); setForm({ name: '', email: '', password: '' }); }, [defaultTab, isOpen]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
      }}
    >
      <div className="animate-pop" style={{
        background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 420,
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {tab === 'login' ? 'Sign in to your Mac Miller account' : 'Join Mac Miller for a faster checkout'}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '20px 28px 0', display: 'flex', gap: 4, background: 'var(--bg-surface)' }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: tab === t ? 'var(--accent)' : 'var(--bg-secondary)',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
              {error}
            </div>
          )}

          {tab === 'register' && (
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                name="name" type="text" required placeholder="Full name"
                value={form.name} onChange={handleChange}
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', fontSize: 14, outline: 'none' }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              name="email" type="email" required placeholder="Email address"
              value={form.email} onChange={handleChange}
              style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', fontSize: 14, outline: 'none' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              name="password" type={showPass ? 'text' : 'password'} required
              placeholder={tab === 'register' ? 'Password (min 6 chars)' : 'Password'}
              value={form.password} onChange={handleChange}
              style={{ width: '100%', padding: '12px 44px 12px 42px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', fontSize: 14, outline: 'none' }}
            />
            <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              padding: '13px', borderRadius: 10, background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: 15, marginTop: 4,
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => setTab(tab === 'login' ? 'register' : 'login')} style={{ color: 'var(--accent)', fontWeight: 600 }}>
              {tab === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
