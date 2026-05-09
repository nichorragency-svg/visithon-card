import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // navigate use karna behtar hy
import { apiClient, apiErrorMessage } from '../../apiClient';
import './AuthLayout.css';

const CardSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords match nahi kar rahy!");
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/card-auth/signup', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            });

            if (response.data.status === "success") {
                localStorage.setItem('visithon_card_token', response.data.token);
                localStorage.setItem('visithon_user_info', JSON.stringify(response.data.user));
                
                // navigate use karein refresh se bachne ke liye
                navigate('/card/wizard/step-1'); 
            }
        } catch (err) {
            setError(apiErrorMessage(err, "Signup mein masla aya hy."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {/* Logo Section - Bilkul login jaisa */}
                <div className="auth-logo-section">
                    <img src="/logo.png" alt="Visithon Logo" className="auth-logo-img" />
                </div>

                <div className="auth-header">
                    <h2>Create Card Account</h2>
                    <p>Join Visithon to build your professional digital presence.</p>
                </div>

                {/* Error Display - Isay CSS class mein shift kar diya hy */}
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
                        <input type="password" name="password" placeholder="Create Password" onChange={handleChange} required />
                    </div>

                    <div className="auth-input-group">
                        <FaLock className="input-icon" />
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Creating Account..." : <>Sign Up <FaArrowRight /></>}
                    </button>
                </form>

                <div className="auth-divider"><span>OR</span></div>

                <button className="google-btn" type="button">
                    <FaGoogle /> Continue with Google
                </button>

                <p className="auth-footer">
                    Already have an account? <span onClick={() => navigate("/card/login")} className="create-link">Login here</span>
                </p>
            </div>
        </div>
    );
};

export default CardSignup;