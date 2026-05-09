import React, { useState } from 'react';
import { apiClient, apiErrorMessage } from '../../apiClient';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import './AuthLayout.css'; 

const ForgotPassword = () => {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/card-auth/forgot-password', { email });
            alert("OTP has been sent! Please check the system console.");
            setStep(2);
        } catch (err) {
            alert(apiErrorMessage(err, "Email address not found."));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/card-auth/reset-password', {
                email,
                otp,
                password: newPassword
            });
            alert("Password reset successful! You can now login.");
            navigate("/card/login");
        } catch (err) {
            alert(apiErrorMessage(err, "Invalid OTP or request failed."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {/* Logo Section - Branding consistency ke liye */}
                <div className="auth-logo-section">
                    <img src="/logo.png" alt="Visithon Logo" className="auth-logo-img" />
                </div>

                <div className="auth-header">
                    <h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>
                    <p>
                        {step === 1 
                            ? "Enter your registered email to receive a password reset OTP." 
                            : "Enter the OTP from the console and set your new password."}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="auth-form">
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
                            {loading ? "Sending..." : "Get Reset OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="auth-input-group">
                            <FaKey className="input-icon" />
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                required 
                                placeholder="6-Digit OTP Code"
                            />
                        </div>
                        <div className="auth-input-group">
                            <FaLock className="input-icon" />
                            <input 
                                type={showNewPassword ? "text" : "password"} 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                                placeholder="New Password"
                            />
                            <div 
                                className="password-toggle-icon"
                                onClick={() => setShowNewPassword(!showNewPassword)} 
                            >
                                {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </div>
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}

                <p className="auth-footer" onClick={() => navigate("/card/login")} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                    <FaArrowLeft size={12} /> Back to Login
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;