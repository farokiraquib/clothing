import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminLogin } from '../../api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(password);
      loginAdmin(password);
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <Lock size={40} style={{color:'var(--admin-primary)', marginBottom: 16}} />
        <h1>Admin Access</h1>
        <p>Enter the admin password to continue</p>
        {error && <div className="admin-login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
