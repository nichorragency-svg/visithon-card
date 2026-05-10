import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../../apiClient';
import { supabase } from '../../supabase/client';
import { refreshLocalUserInfoForSession } from '../../supabase/supabaseWizard';
import './AuthLayout.css';

const CardSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (info) setInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords match nahi kar rahy!');
      return;
    }

    if (!supabase) {
      setError('Missing Supabase configuration. Set env vars and rebuild.');
      return;
    }

    setLoading(true);
    try {
      const fn = formData.fullName.trim();
      const { data, error: signErr } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: { full_name: fn },
        },
      });
      if (signErr) throw signErr;

      // With "Confirm email" on, there is often no session yet — RLS blocks upsert (401). Trigger still creates profile + full_name from metadata.
      if (data.session && data.user?.id && fn) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fn,
          updated_at: new Date().toISOString(),
        });
      }

      if (data.session) {
        await refreshLocalUserInfoForSession(data.session.access_token, data.session);
        navigate('/card/wizard/step-1');
      } else {
        setInfo('Account created — check your email to confirm before logging in.');
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Signup mein masla aya hy.'));
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
          <h2>Create Card Account</h2>
          <p>Join Visithon to build your professional digital presence.</p>
        </div>

        {info && <div className="auth-error-msg">{info}</div>}
        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <FaUser className="input-icon" />
            <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required />
          </div>

          <div className="auth-input-group">
            <FaEnvelope className="input-icon" />
            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
          </div>

          <div className="auth-input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : <>Sign Up <FaArrowRight /></>}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button className="google-btn" type="button">
          <FaGoogle /> Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account?{' '}
          <span onClick={() => navigate('/card/login')} className="create-link">
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default CardSignup;
