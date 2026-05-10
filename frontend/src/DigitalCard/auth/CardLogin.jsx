import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../../apiClient';
import { supabase } from '../../supabase/client';
import { refreshLocalUserInfoForSession } from '../../supabase/supabaseWizard';
import './AuthLayout.css';

const CardLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!supabase) {
        setError('Missing Supabase configuration. Set env vars and rebuild.');
        return;
      }

      const { error: signErr, data } = await supabase.auth.signInWithPassword({
        email: loginData.email.trim(),
        password: loginData.password,
      });

      if (signErr) {
        throw signErr;
      }

      await refreshLocalUserInfoForSession(data.session?.access_token);

      let user = {};
      try {
        user = JSON.parse(localStorage.getItem('visithon_user_info') || '{}');
      } catch {
        user = {};
      }

      if (location.state?.from === 'saved-cards') {
        navigate('/card/saved', { replace: true });
        return;
      }

      const returnTo = location.state?.returnTo;
      if (location.state?.from === 'wallet-save' && typeof returnTo === 'string' && returnTo.startsWith('/card/view/')) {
        navigate(returnTo, { replace: true });
        return;
      }

      if (user.has_card) {
        navigate(`/card/view/${user.id}`);
      } else {
        navigate('/card/wizard/step-1');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(apiErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo-section">
          <img src="/logo.png" alt="Visithon Logo" className="auth-logo-img" />
        </div>

        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to manage your Visithon Card.</p>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={loginData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleChange}
              required
            />
            <div className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Authenticating...' : <>Login <FaSignInAlt /></>}
          </button>

          <p className="forgot-password-link" onClick={() => navigate('/card/forgot-password')}>
            Forgot Password?
          </p>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <span onClick={() => navigate('/card/signup')} className="create-link">
            Create one
          </span>
        </p>
      </div>
    </div>
  );
};

export default CardLogin;
