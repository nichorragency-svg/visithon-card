import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VisithonLogo from '../../components/VisithonLogo';
import './SplashScreen.css';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/card/login');
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="visithon-splash">
      {/* Background Effects */}
      <div className="glow-circle"></div>

      {/* Main Content Area */}
      <div className="splash-content">
        <div className="logo-container">
          <VisithonLogo className="inline-flex" imgClassName="main-logo-img" />
          
          <div className="brand-section">
            <h1 className="brand-name">VISITHON</h1>
            <div className="card-divider">
              <span className="line"></span>
              <p className="card-text">CARD</p>
              <span className="line"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Area */}
      <div className="splash-footer">
        <p className="footer-tagline">Your Digital Identity</p>
        <div className="progress-container">
          <div className="progress-fill"></div>
        </div>
      </div>
    </div>
  );
}