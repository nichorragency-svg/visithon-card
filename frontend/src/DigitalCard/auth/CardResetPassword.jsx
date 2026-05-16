import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import { resetPasswordWithOtp } from '../../api/visithonApi';
import './AuthLayout.css';

export default function CardResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!otp.trim()) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithOtp(email.trim(), otp.trim(), password);
      navigate('/card/login', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo-section">
          <img src="/logo.png" alt="" className="auth-logo-img" />
        </div>
        <div className="auth-header">
          <h2>Set new password</h2>
          <p>Enter the code we sent to your email.</p>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="auth-input-group">
            <FaKey className="input-icon" />
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              required
              maxLength={6}
            />
          </div>
          <div className="auth-input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Saving…' : 'Save password'}
          </button>
        </form>

        <p className="auth-footer" onClick={() => navigate('/card/login')} style={{ cursor: 'pointer' }}>
          <FaArrowLeft size={12} style={{ marginRight: 8 }} /> Login
        </p>
      </div>
    </div>
  );
}
