import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyAdmin } from '../lib/api';
import '../styles/pages/login.css';

export default function Login() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (pin.length !== 4) { setError('PIN ni tarakimu 4'); return; }
    setError('');
    setLoading(true);

    try {
      const data = await verifyAdmin(pin);
      if (data.ok) {
        login(data.admin);
        navigate('/');
      } else {
        setError(data.error || 'PIN si sahihi');
      }
    } catch (err) {
      setError('Hitilafu ya mtandao');
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/icons/icon.svg" alt="KMCA" className="login-logo-img" />
        <h1 className="login-title">KMCA Admin</h1>
        <p className="login-subtitle">Weka PIN yako ya tarakimu 4</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="pin">PIN</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              className="pin-input"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading || pin.length !== 4}>
            {loading ? <span className="login-spinner"></span> : 'Ingia'}
          </button>
        </form>
      </div>
    </div>
  );
}
