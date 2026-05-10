import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import { supabase } from '../../supabase/client';
import './AuthLayout.css';

/** Opened via Supabase email recovery redirect. */
export default function CardResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evt, sess) => {
      if ((evt === 'PASSWORD_RECOVERY' || evt === 'SIGNED_IN') && sess) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (!supabase) throw new Error('Supabase missing.');
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;
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
          <p>Use the link sent to your email to reach this screen.</p>
        </div>

        {!ready && (
          <p className="text-center text-xs text-white/55">
            Waiting for recovery session… If stuck, request a fresh link from Forgot Password.
          </p>
        )}

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
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
          <button type="submit" className="auth-btn" disabled={loading || !ready}>
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
