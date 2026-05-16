import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../../apiClient';
import { signupWithPassword } from '../../api/visithonApi';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    setLoading(true);
    try {
      const fn = formData.fullName.trim();
      const data = await signupWithPassword(fn, formData.email.trim(), formData.password);

      if (data?.token) {
        navigate('/card/wizard/step-1', { replace: true });
      } else {
        setInfo('Account created. You can log in now.');
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
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create Password"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <div className="auth-input-group">
            <FaLock className="input-icon" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
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
