import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SUPABASE_CONFIGURED } from '../../config';
import { supabase } from '../../supabase/client';
import { CardDisplayActionTiles } from './CardDisplayActionTiles';
import { CardDisplayFooter } from './CardDisplayFooter';
import { CardDisplayHeader } from './CardDisplayHeader';
import { CardDisplayAccountModal } from './CardDisplayAccountModal';
import { CardDisplayHoursModal } from './CardDisplayHoursModal';
import {
  CardDisplayFetchError,
  CardDisplayLoading,
  CardDisplayNotFound,
} from './CardDisplayStates';
import { CardDisplayProfile } from './CardDisplayProfile';
import { CardDisplayQuickActions } from './CardDisplayQuickActions';
import { CardDisplayServicesModal } from './CardDisplayServicesModal';
import { CardDisplayShowcase } from './CardDisplayShowcase';
import { CardDisplaySocialRow } from './CardDisplaySocialRow';
import { buildQuickActions } from './quickActions';
import { onlyDigits, sortSocialEntries, withHttp } from './helpers';
import { useCardDisplayData } from './useCardDisplayData';
import { useCardDisplayShowcase } from './useCardDisplayShowcase';
import { getCardDisplayTheme } from './useCardDisplayTheme';
import {
  getSavedCardCount,
  isSavedCard,
  removeSavedCard,
  upsertSavedCard,
} from '../utils/savedCardsStorage';

export default function CardDisplayView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, loading, fetchError, fetchCard } = useCardDisplayData(userId);
  const [menuOpen, setMenuOpen] = useState(false);
  /** Supabase session + localStorage shadow; avoids menu thinking user is logged out when token not synced yet. */
  const [hasSessionOrToken, setHasSessionOrToken] = useState(() =>
    typeof localStorage !== 'undefined' ? !!localStorage.getItem('visithon_card_token') : false,
  );
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [hoursModalOpen, setHoursModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [walletTick, setWalletTick] = useState(0);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  useEffect(() => {
    const fromLs = () =>
      typeof localStorage !== 'undefined' && !!localStorage.getItem('visithon_card_token');
    const apply = async () => {
      if (!SUPABASE_CONFIGURED || !supabase) {
        setHasSessionOrToken(fromLs());
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSessionOrToken(!!session?.access_token || fromLs());
    };
    apply();
    if (!SUPABASE_CONFIGURED || !supabase) return undefined;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      apply();
    });
    return () => subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!servicesModalOpen && !hoursModalOpen && !accountModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setServicesModalOpen(false);
        setHoursModalOpen(false);
        setAccountModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [servicesModalOpen, hoursModalOpen, accountModalOpen]);

  const isOwner =
    typeof localStorage !== 'undefined' &&
    (() => {
      try {
        const raw = localStorage.getItem('visithon_user_info');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        const id = String(parsed?.id || parsed?._id || '').trim();
        return id.length > 0 && id === String(userId || '').trim();
      } catch {
        return false;
      }
    })();

  const hasToken = hasSessionOrToken;
  /** Always offer wallet affordances on card view; mutations need login. */
  const showWalletChrome = true;
  void walletTick;
  const isWalletSaved = userId ? isSavedCard(userId) : false;
  const walletSavedCount = getSavedCardCount();

  const toggleWalletSave = () => {
    if (!userId) return;
    if (!hasToken) {
      navigate('/card/login', {
        state: {
          from: 'wallet-save',
          returnTo: `/card/view/${encodeURIComponent(String(userId).trim())}`,
        },
      });
      return;
    }
    if (isSavedCard(userId)) removeSavedCard(userId);
    else {
      const cardUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/card/view/${encodeURIComponent(String(userId).trim())}`
          : '';
      upsertSavedCard({
        userId,
        name: String(user?.name || '').trim(),
        cardUrl,
      });
    }
    setWalletTick((t) => t + 1);
  };

  const goReminders = () => {
    setMenuOpen(false);
    if (hasToken) navigate('/card/reminders');
    else navigate('/card/login', { state: { from: 'reminders' } });
  };

  const goSettings = () => {
    setMenuOpen(false);
    if (hasToken) navigate('/card/settings');
    else navigate('/card/login', { state: { from: 'settings' } });
  };

  const {
    showcaseInnerRef,
    showcasePausedRef,
    showcaseItems,
    showcaseLoopItems,
    handleWhatsAppProduct,
    handleWhatsAppAllServices,
    handleWhatsAppShop,
  } = useCardDisplayShowcase(user);

  const theme = getCardDisplayTheme(user);

  if (loading) return <CardDisplayLoading />;
  if (fetchError) return <CardDisplayFetchError message={fetchError} onRetry={fetchCard} />;
  if (!user) return <CardDisplayNotFound />;

  const showContacts = user.show_all_contacts !== false;
  const waDigits = onlyDigits(user.whatsapp);
  const showWa = showContacts && user.whatsapp_visible !== false && waDigits.length > 0;
  const phoneDigits = onlyDigits(user.phone1);
  const quickActions = buildQuickActions(user, phoneDigits);
  const paymentMethods = Array.isArray(user.payment_methods) ? user.payment_methods : [];
  const hasAccountLink = paymentMethods.some(
    (m) => (m?.iban || '').toString().trim() || (m?.pay_qr_img || '').toString().trim(),
  );

  const tileRowWaPhone = onlyDigits(user.whatsapp || user.phone1);
  const tileRowShopWebsite = (user.website || '').trim() ? withHttp(user.website) : '';
  const tileRowSocialEntries =
    showContacts && user.social ? sortSocialEntries(Object.entries(user.social)) : [];
  const tileRowShowServices = !!(user.services?.length > 0);
  const onboardingShopEnabled = user.shop_portfolio_enabled === true;
  const tileRowShopAsLink = onboardingShopEnabled && !!tileRowShopWebsite;
  const tileRowShopAsWa = onboardingShopEnabled && !tileRowShopWebsite && tileRowWaPhone.length > 0;
  const tileRowShowSave = !!showContacts;
  const tileRowShop = tileRowShopAsLink || tileRowShopAsWa;
  const tileRowShowActions =
    tileRowShowSave || showWa || tileRowShop || showWalletChrome;

  const hasBusinessHours =
    user.business_hours &&
    typeof user.business_hours === 'object' &&
    Object.values(user.business_hours).some((row) => row && typeof row === 'object' && row.enabled);

  const {
    selectedTheme,
    tokenTheme,
    isLightTheme,
    quickActionPalette,
    stSvTile,
    stWaTile,
    stShopTile,
    mainTextClass,
    cardBorderClass,
    pageInlineStyle,
    shellInlineStyle,
    headerInlineStyle,
    accentInlineStyle,
    pageAmbientClass,
    avatarRingClass,
    avatarRingStyle,
    tileInnerStyle,
    showcaseFrameStyle,
  } = theme;

  return (
    <div
      className={`relative min-h-screen w-full overflow-x-hidden pb-12 ${selectedTheme.pageBg} ${mainTextClass}`}
      style={pageInlineStyle}
    >
      <div className={`pointer-events-none fixed inset-0 ${pageAmbientClass}`} aria-hidden />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-md px-3 pt-2 sm:px-4">
        <div
          className={`overflow-hidden rounded-[1.75rem] border ${cardBorderClass} bg-gradient-to-b ${selectedTheme.shell} shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
          style={shellInlineStyle}
        >
          <CardDisplayHeader
            user={user}
            userId={userId}
            navigate={navigate}
            selectedTheme={selectedTheme}
            isLightTheme={isLightTheme}
            headerInlineStyle={headerInlineStyle}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            isOwner={isOwner}
            hasToken={hasToken}
            isWalletSaved={isWalletSaved}
            onToggleWalletSave={toggleWalletSave}
            walletSavedCount={walletSavedCount}
            goReminders={goReminders}
            goSettings={goSettings}
          />

          <div className="px-5 pb-8 pt-4">
            <CardDisplayProfile
              user={user}
              mainTextClass={mainTextClass}
              isLightTheme={isLightTheme}
              tokenTheme={tokenTheme}
              accentInlineStyle={accentInlineStyle}
              avatarRingClass={avatarRingClass}
              avatarRingStyle={avatarRingStyle}
              hasBusinessHours={hasBusinessHours}
              onHoursClick={() => setHoursModalOpen(true)}
              hasServices={tileRowShowServices}
              onServicesClick={() => setServicesModalOpen(true)}
              hasAccount={hasAccountLink}
              onAccountClick={() => setAccountModalOpen(true)}
            />

            <CardDisplayShowcase
              showcaseItems={showcaseItems}
              showcaseLoopItems={showcaseLoopItems}
              showcaseInnerRef={showcaseInnerRef}
              showcasePausedRef={showcasePausedRef}
              handleWhatsAppProduct={handleWhatsAppProduct}
              tokenTheme={tokenTheme}
              accentInlineStyle={accentInlineStyle}
              showcaseFrameStyle={showcaseFrameStyle}
            />

            {tileRowShowActions ? (
              <CardDisplayActionTiles
                navigate={navigate}
                showWalletRow={showWalletChrome}
                hasToken={hasToken}
                isWalletSaved={isWalletSaved}
                onToggleWalletSave={toggleWalletSave}
                walletSavedCount={walletSavedCount}
                user={user}
                tileRowShowSave={tileRowShowSave}
                showWa={showWa}
                waDigits={waDigits}
                tileRowShopAsLink={tileRowShopAsLink}
                tileRowShopWebsite={tileRowShopWebsite}
                tileRowShopAsWa={tileRowShopAsWa}
                handleWhatsAppShop={handleWhatsAppShop}
                stSvTile={stSvTile}
                stWaTile={stWaTile}
                stShopTile={stShopTile}
                tileInnerStyle={tileInnerStyle}
                isLightTheme={isLightTheme}
              />
            ) : null}

            <CardDisplaySocialRow entries={tileRowSocialEntries} />

            {showContacts ? (
              <CardDisplayQuickActions
                quickActions={quickActions}
                quickActionPalette={quickActionPalette}
                tokenTheme={tokenTheme}
                tileInnerStyle={tileInnerStyle}
              />
            ) : (
              <p className="mt-10 w-full rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-8 text-center text-sm text-white/50 backdrop-blur-xl">
                Contact details are hidden on this card.
              </p>
            )}

            <CardDisplayFooter tokenTheme={tokenTheme} />
          </div>
        </div>
      </div>

      <CardDisplayHoursModal
        open={hoursModalOpen}
        onClose={() => setHoursModalOpen(false)}
        user={user}
        isLightTheme={isLightTheme}
        tokenTheme={tokenTheme}
        accentInlineStyle={accentInlineStyle}
      />

      <CardDisplayAccountModal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} user={user} />

      <CardDisplayServicesModal
        open={servicesModalOpen}
        onClose={() => setServicesModalOpen(false)}
        user={user}
        tileRowWaPhone={tileRowWaPhone}
        tokenTheme={tokenTheme}
        onWhatsAppAllServices={() => {
          handleWhatsAppAllServices();
          setServicesModalOpen(false);
        }}
      />
    </div>
  );
}
