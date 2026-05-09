import React, { useState } from 'react';
import { FaPhoneAlt, FaQrcode, FaCopy, FaTimes, FaUniversity } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const ActionButtons = ({ user, userId, IMAGE_BASE_URL }) => {
    const [payModal, setPayModal] = useState(false);

    // Dynamic URL for bank QR images
    const BANK_QR_URL = `${API_BASE_URL}/static/card_bank_qrs/`;

    const handleSaveContact = () => {
        window.location.href = `${API_BASE_URL}/card-auth/download-vcard/${userId}`;
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        alert("Account Number Copied!");
    };

    return (
        <>
            {/* Action Buttons Row */}
            <div style={{ display: 'flex', gap: '12px', width: '90%', margin: '20px auto' }}>
                <button onClick={handleSaveContact} style={{
                    flex: 1, padding: '14px', backgroundColor: '#004aad', color: 'white',
                    border: 'none', borderRadius: '15px', fontWeight: '700', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px',
                    boxShadow: '0 4px 15px rgba(0, 74, 173, 0.2)', cursor: 'pointer'
                }}>
                    <FaPhoneAlt size={14} /> Save Contact
                </button>

                <button onClick={() => setPayModal(true)} style={{
                    flex: 1, padding: '14px', backgroundColor: '#059669', color: 'white',
                    border: 'none', borderRadius: '15px', fontWeight: '700', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px',
                    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.2)', cursor: 'pointer'
                }}>
                    <FaQrcode size={14} /> Pay Now
                </button>
            </div>

            {/* Premium Payment Modal */}
            {payModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 3000
                }}>
                    <div style={{
                        backgroundColor: '#fff', width: '100%', maxWidth: '450px',
                        borderTopLeftRadius: '30px', borderTopRightRadius: '30px',
                        padding: '30px 20px', position: 'relative', animation: 'slideUp 0.3s ease-out',
                        maxHeight: '85vh', overflowY: 'auto' // Added for multiple accounts
                    }}>
                        {/* Close Indicator */}
                        <div onClick={() => setPayModal(false)} style={{
                            width: '40px', height: '5px', background: '#e2e8f0', borderRadius: '10px',
                            margin: '-15px auto 20px auto', cursor: 'pointer'
                        }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ color: '#1e293b', fontSize: '20px', fontWeight: '800', margin: 0 }}>Payment Details</h3>
                            <FaTimes onClick={() => setPayModal(false)} style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }} />
                        </div>

                        {/* --- Loop Through Payment Methods --- */}
                        {user?.payment_methods && user.payment_methods.length > 0 ? (
                            user.payment_methods.map((method, index) => (
                                <div key={index} style={{ 
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                                    padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                        <div style={{ background: '#004aad', padding: '8px', borderRadius: '10px', color: '#fff' }}>
                                            <FaUniversity size={16} />
                                        </div>
                                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{method.bank_name || "Bank Account"}</span>
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>ACCOUNT TITLE</label>
                                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{method.account_title || "Not Available"}</span>
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>IBAN / ACCOUNT NUMBER</label>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#004aad', letterSpacing: '0.5px' }}>
                                                {method.iban || "XXXX-XXXX-XXXX-XXXX"}
                                            </span>
                                            <FaCopy 
                                                onClick={() => copyToClipboard(method.iban)} 
                                                style={{ color: '#004aad', cursor: 'pointer' }} 
                                            />
                                        </div>
                                    </div>

                                    {/* QR Code for this Specific Bank */}
                                    {method.pay_qr_img && (
                                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                            <div style={{ 
                                                display: 'inline-block', padding: '10px', background: '#fff', 
                                                borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                                                border: '1px solid #f1f5f9'
                                            }}>
                                                <img 
                                                    src={`${BANK_QR_URL}${method.pay_qr_img}`} 
                                                    alt="Payment QR" 
                                                    style={{ width: '140px', borderRadius: '10px', display: 'block' }} 
                                                />
                                            </div>
                                            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>Scan for EasyPaisa / JazzCash</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <FaQrcode size={40} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                                <p style={{ color: '#64748b' }}>No payment methods added.</p>
                            </div>
                        )}

                        <button 
                            onClick={() => setPayModal(false)}
                            style={{
                                width: '100%', marginTop: '10px', padding: '15px', background: '#f1f5f9',
                                border: 'none', borderRadius: '15px', color: '#475569', fontWeight: '700', cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            
            {/* Animation Style */}
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default ActionButtons;