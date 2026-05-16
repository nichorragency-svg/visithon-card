import React, { useState } from 'react';
import { apiErrorMessage } from '../../apiClient';
import { requestPasswordReset } from '../../api/visithonApi';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AuthLayout.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
      navigate('/card/reset-password', { state: { email: email.trim() } });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send reset code.'));
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
          <h2>Forgot Password</h2>
          <p>We&apos;ll send a 6-digit code if this email exists in our system.</p>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}
        {sent && (
          <div className="auth-error-msg" style={{ borderColor: '#22c55e80', background: '#14532d40' }}>
            Enter the code on the next screen to set a new password.
          </div>
        )}

        <form onSubmit={handleRequest} className="auth-form">
          <div className="auth-input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset code'}
          </button>
        </form>

        <p className="auth-footer" onClick={() => navigate('/card/login')} style={{ cursor: 'pointer' }}>
          <FaArrowLeft size={12} style={{ marginRight: 8 }} /> Back to Login
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
