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

import { SUPABASE_CONFIGURED } from '../config';
import { supabase } from '../supabase/client';
import { refreshLocalUserInfoForSession } from '../supabase/supabaseWizard';

/** Lets existing card holders open wizard again when coming from Edit (avoid redirect back to `/card/view`). */
function WizardStep1Entry({ isCardAuthenticated, hasCard, profileUserId }) {
  const location = useLocation();
  const editMode =
    location.state?.editMode === true || new URLSearchParams(location.search).get('edit') === '1';
  if (!isCardAuthenticated) return <Navigate to="/card/login" replace />;
  if (hasCard && !editMode) return <Navigate to={`/card/view/${profileUserId}`} replace />;
  return <WizardStep1 />;
}

function MissingSupabase() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center text-white/85">
      <p className="max-w-md text-sm leading-relaxed">
        Missing <code className="rounded bg-white/10 px-1">REACT_APP_SUPABASE_URL</code> or{' '}
        <code className="rounded bg-white/10 px-1">REACT_APP_SUPABASE_ANON_KEY</code>. Add both in Vercel
        Environment Variables, then redeploy.
      </p>
    </div>
  );
}

const DigitalCardRoutesComp = () => {
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED || !supabase) {
      setAuthReady(true);
      return undefined;
    }

    let unsub;
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      if (data.session) {
        await refreshLocalUserInfoForSession(data.session.access_token, data.session).catch(() => {});
      }
      setAuthReady(true);
    })();

    const ret = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess ?? null);
      if (sess) await refreshLocalUserInfoForSession(sess.access_token, sess).catch(() => {});
      else {
        localStorage.removeItem('visithon_card_token');
        localStorage.removeItem('visithon_user_info');
      }
    });
    unsub = ret?.data?.subscription;
    return () => unsub?.unsubscribe?.();
  }, []);

  if (!SUPABASE_CONFIGURED) {
    return (
      <Routes>
        <Route path="*" element={<MissingSupabase />} />
      </Routes>
    );
  }

  const isCardAuthenticated = !!session?.access_token || !!localStorage.getItem('visithon_card_token');

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
          !authReady ? (
            <SplashScreen />
          ) : !isCardAuthenticated ? (
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
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<CardResetPassword />} />

      <Route path="view/:userId" element={<CardDisplay />} />
      <Route path="scan" element={<QRScanner />} />
      <Route path="link-device/:userId" element={<LinkDevice />} />
      <Route
        path="saved"
        element={isCardAuthenticated ? <SavedCardsList /> : <Navigate to="/card/login" replace state={{ from: 'saved-cards' }} />}
      />

      <Route
        path="wizard/step-1"
        element={
          <WizardStep1Entry
            isCardAuthenticated={isCardAuthenticated}
            hasCard={hasCard}
            profileUserId={userId}
          />
        }
      />

      <Route path="wizard/step-1-feature" element={isCardAuthenticated ? <WizardStep1Feature /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-1-plan" element={isCardAuthenticated ? <WizardStep1Plan /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-2" element={isCardAuthenticated ? <WizardStep2 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-3" element={isCardAuthenticated ? <WizardStep3 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-4" element={isCardAuthenticated ? <WizardStep4 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-5" element={isCardAuthenticated ? <WizardStep5 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-6" element={isCardAuthenticated ? <WizardStep6 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-7" element={isCardAuthenticated ? <WizardStep7 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-8" element={isCardAuthenticated ? <WizardStep8 /> : <Navigate to="/card/login" replace />} />
      <Route path="wizard/step-9" element={isCardAuthenticated ? <WizardStep9 /> : <Navigate to="/card/login" replace />} />

      <Route path="reminders" element={isCardAuthenticated ? <RemindersList /> : <Navigate to="/card/login" replace />} />
      <Route path="reminders/add" element={isCardAuthenticated ? <AddReminder /> : <Navigate to="/card/login" replace />} />
      <Route path="settings" element={isCardAuthenticated ? <CardSettings /> : <Navigate to="/card/login" replace />} />

      <Route path="*" element={<Navigate to="/card/login" replace />} />
    </Routes>
  );
};

export default DigitalCardRoutesComp;
