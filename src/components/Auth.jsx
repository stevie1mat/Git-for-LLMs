import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './HomePage.css';

export default function Auth({ compact = false, onSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Intentionally no onAuthStateChange redirect; we navigate only after form success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
      }
      if (onSuccess) onSuccess();
      else navigate('/app');
    } catch (err) {
      setError(err.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const Card = (
      <div className="auth-card">
        <h2 className="auth-title">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        <p className="auth-subtitle">Use your email and password to continue</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          {error && <div className="auth-error">{error}</div>}
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Sign up')}
          </button>
        </form>
        <div className="auth-switch">
          {mode === 'login' ? (
            <button className="link-button" onClick={() => setMode('register')}>Need an account? Register</button>
          ) : (
            <button className="link-button" onClick={() => setMode('login')}>Have an account? Sign in</button>
          )}
        </div>
      </div>
  );
  
  if (compact) return Card;
  return (<div className="auth-page">{Card}</div>);
}


