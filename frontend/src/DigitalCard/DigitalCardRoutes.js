import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import SplashScreen from './components/SplashScreen';

import CardDisplay from './card-display/CardDisplayView';
import CardLogin from './auth/CardLogin';
import CardSignup from './auth/CardSignup';
import ForgotPassword from './auth/ForgotPassword';
import QRScanner from './components/QRScanner';
import LinkDevice from './components/LinkDevice';
import WizardStep1 from '../visithon/wizard/WizardStep1';
import WizardStep1Feature from '../visithon/wizard/WizardStep1Feature';
import WizardStep1Plan from '../visithon/wizard/WizardStep1Plan';
import WizardStep2 from '../visithon/wizard/WizardStep2';
import WizardStep3 from '../visithon/wizard/WizardStep3';
import WizardStep4 from '../visithon/wizard/WizardStep4';
import WizardStep5 from '../visithon/wizard/WizardStep5';
import WizardStep6 from '../visithon/wizard/WizardStep6';
import WizardStep7 from '../visithon/wizard/WizardStep7';
import WizardStep8 from '../visithon/wizard/WizardStep8';
import WizardStep9 from '../visithon/wizard/WizardStep9';
import RemindersList from '../visithon/reminders/RemindersList';
import AddReminder from '../visithon/reminders/AddReminder';
import CardSettings from '../visithon/settings/CardSettings';

const DigitalCardRoutesComp = () => {
  // 1. Check karo user login hy ya nahi
  const isCardAuthenticated = !!localStorage.getItem('visithon_card_token');

  // 2. User info se data nikalo
  const userInfo = JSON.parse(localStorage.getItem('visithon_user_info') || '{}');
  const hasCard = userInfo?.has_card || false; // Backend flag
  const userId = userInfo?.id || userInfo?._id; // User ki unique ID

  return (
    <Routes>
      {/* 
         HOME/INDEX LOGIC: 
         Agar login hy aur card tayyar hy -> Seedha Display par bhejo.
         Agar login hy magar card nahi hy -> Wizard Step-1 par bhejo.
         Agar login hi nahi hy -> Splash screen dikhao.
      */}
      <Route 
        index 
        element={
          isCardAuthenticated 
            ? (userId ? <Navigate to={`/card/view/${userId}`} replace /> : <Navigate to="/card/wizard/step-1" replace />)
            : <SplashScreen />
        } 
      />
      
      {/* Auth Routes */}
      <Route path="login" element={<CardLogin />} />
      <Route path="signup" element={<CardSignup />} />
      <Route path="forgot-password" element={<ForgotPassword />} />

      {/* Public & Functional Routes */}
      <Route path="view/:userId" element={<CardDisplay />} />
      <Route path="scan" element={<QRScanner />} />
      <Route path="link-device/:userId" element={<LinkDevice />} />

      {/* 
         WIZARD LOGIC: 
         Agar koi purana user galti se 'wizard/step-1' par aaye, 
         to usay wapas Display par bhej do.
      */}
      <Route
        path="wizard/step-1"
        element={
          isCardAuthenticated 
            ? (hasCard ? <Navigate to={`/card/view/${userId}`} replace /> : <WizardStep1 />)
            : <Navigate to="/card/login" replace />
        }
      />

      {/* Baqi Steps Protected rahen gy */}
      <Route
        path="wizard/step-1-feature"
        element={isCardAuthenticated ? <WizardStep1Feature /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="wizard/step-1-plan"
        element={isCardAuthenticated ? <WizardStep1Plan /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="wizard/step-2"
        element={isCardAuthenticated ? <WizardStep2 /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="wizard/step-3"
        element={isCardAuthenticated ? <WizardStep3 /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="wizard/step-4"
        element={isCardAuthenticated ? <WizardStep4 /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="wizard/step-5"
        element={isCardAuthenticated ? <WizardStep5 /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="wizard/step-6"
        element={isCardAuthenticated ? <WizardStep6 /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="wizard/step-7"
        element={isCardAuthenticated ? <WizardStep7 /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="wizard/step-8"
        element={isCardAuthenticated ? <WizardStep8 /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="wizard/step-9"
        element={isCardAuthenticated ? <WizardStep9 /> : <Navigate to="/card/login" replace />}
      />

      {/* Dashboard Features */}
      <Route
        path="reminders"
        element={isCardAuthenticated ? <RemindersList /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="reminders/add"
        element={isCardAuthenticated ? <AddReminder /> : <Navigate to="/card/login" replace />}
      />
      <Route
        path="settings"
        element={isCardAuthenticated ? <CardSettings /> : <Navigate to="/card/login" replace />}
      />

      {/* Default Catch-all (Redirect to login) */}
      <Route path="*" element={<Navigate to="/card/login" replace />} />
    </Routes>
  );
};

export default DigitalCardRoutesComp;