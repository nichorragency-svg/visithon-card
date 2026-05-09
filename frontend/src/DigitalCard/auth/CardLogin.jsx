import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiClient, apiErrorMessage } from '../../apiClient';
import './AuthLayout.css';

const CardLogin = () => {
    const navigate = useNavigate();
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
            const response = await apiClient.post('/card-auth/login', loginData);
            
            if (response.data.status === "success") {
                // 1. Token aur User Info save karen
                localStorage.setItem('visithon_card_token', response.data.token);
                localStorage.setItem('visithon_user_info', JSON.stringify(response.data.user));
    
                // 2. Planning logic: Check karen card bana hy ya nahi
                const user = response.data.user;
                if (user.has_card) {
                    // Agar card bana hy to seedha View par bhejen
                    navigate(`/card/view/${user.id || user._id}`);
                } else {
                    // Agar naya user hy to setup (wizard) par bhejen
                    navigate('/card/wizard/step-1');
                }
            } else {
                setError(response.data?.message || 'Login failed.');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(apiErrorMessage(err, "Login failed. Please check your credentials."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {/* Partner, yahan logo add kar diya hy */}
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
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="Password" 
                            value={loginData.password}
                            onChange={handleChange} 
                            required 
                        />
                        <div 
                            className="password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)} 
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </div>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : <>Login <FaSignInAlt /></>}
                    </button>

                    <p className="forgot-password-link" onClick={() => navigate("/card/forgot-password")}>
                        Forgot Password?
                    </p>
                </form>

                <p className="auth-footer">
                    Don't have an account? <span onClick={() => navigate("/card/signup")} className="create-link">Create one</span>
                </p>
            </div>
        </div>
    );
};

export default CardLogin;