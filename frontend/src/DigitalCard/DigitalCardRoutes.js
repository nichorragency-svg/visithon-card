import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import CardDisplay from './card-display/CardDisplayView';
import CardLogin from './auth/CardLogin';
import CardSignup from './auth/CardSignup';
import ForgotPassword from './auth/ForgotPassword';
import CardResetPassword from './auth/CardResetPassword';
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
import SavedCardsList from './pages/SavedCardsList';
import ManualPaymentSubmit from './pages/ManualPaymentSubmit';

/** Lets existing card holders open wizard again when coming from Edit (avoid redirect back to `/card/view`). */
function WizardStep1Entry({ isCardAuthenticated, hasCard, profileUserId }) {
  const location = useLocation();
  const editMode =
    location.state?.editMode === true || new URLSearchParams(location.search).get('edit') === '1';
  if (!isCardAuthenticated) return <Navigate to="/card/login" replace />;
  if (hasCard && !editMode) return <Navigate to={`/card/view/${profileUserId}`} replace />;
  return <WizardStep1 />;
}

const DigitalCardRoutesComp = () => {
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication using standard JWT Token from MongoDB backend
    const token = localStorage.getItem('visithon_card_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setAuthReady(true);
  }, []);

  if (!authReady) {
    return <SplashScreen />;
  }

  let userInfo = {};
  try {
    userInfo = JSON.parse(localStorage.getItem('visithon_user_info') || '{}');
  } catch {
    userInfo = {};
  }

  const hasCard = !!userInfo.has_card;
  const userId = userInfo?.id || userInfo?._id;

  return (
    <Routes>
      <Route
        index
        element={
          !isAuthenticated ? (
            <Navigate to="/card/login" replace />
          ) : userId ? (
            <Navigate to={`/card/view/${userId}`} replace />
          ) : (
            <Navigate to="/card/wizard/step-1" replace />
          )
        }
      />

      <Route path="login" element={<CardLogin />} />
      <Route path="signup" element={<CardSignup />} />
      <Route path="manual-pay" element={<ManualPaymentSubmit />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<CardResetPassword />} />

      <Route path="view/:userId" element={<CardDisplay />} />
      <Route path="scan" element={<QRScanner />} />
      <Route path="link-device/:userId" element={<LinkDevice />} />
      
      <Route
        path="saved"
        element={
          isAuthenticated ? (
            <SavedCardsList />
          ) : (
            <Navigate to="/card/login" replace state={{ from: 'saved-cards' }} />
          )
        }
      />

      <Route
        path="wizard/step-1"
        element={
          <WizardStep1Entry
            isCardAuthenticated={isAuthenticated}
            hasCard={hasCard}
            profileUserId={userId}
          />
        }
      />

      <Route path="wizard/step-1-feature" element={isAuthenticated ? <WizardStep1Feature /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-1-plan" element={isAuthenticated ? <WizardStep1Plan /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-10" element={isAuthenticated ? <WizardStep1Plan /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-2" element={isAuthenticated ? <WizardStep2 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-3" element={isAuthenticated ? <WizardStep3 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-4" element={isAuthenticated ? <WizardStep4 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-5" element={isAuthenticated ? <WizardStep5 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-6" element={isAuthenticated ? <WizardStep6 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-7" element={isAuthenticated ? <WizardStep7 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-8" element={isAuthenticated ? <WizardStep8 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-9" element={isAuthenticated ? <WizardStep9 /> : <Navigate to="/card/login" replace />} />

      <Route path="reminders" element={isAuthenticated ? <RemindersList /> : <Navigate to="/card/login" replace />} />
      <Route path="reminders/add" element={isAuthenticated ? <AddReminder /> : <Navigate to="/card/login" replace />} />
      <Route path="settings" element={isAuthenticated ? <CardSettings /> : <Navigate to="/card/login" replace />} />

      <Route path="*" element={<Navigate to="/card/login" replace />} />
    </Routes>
  );
};

export default DigitalCardRoutesComp;
