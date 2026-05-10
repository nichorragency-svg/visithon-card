import React from 'react';
import {
  FaAddressBook,
  FaBookmark,
  FaClipboardList,
  FaIdCard,
  FaShoppingBasket,
  FaWhatsapp,
} from 'react-icons/fa';
import { triggerVCardDownload } from '../utils/downloadVCard';

export function CardDisplayActionTiles({
  navigate,
  showWalletRow,
  hasToken = false,
  isWalletSaved,
  onToggleWalletSave,
  walletSavedCount,
  user,
  tileRowShowSave,
  showWa,
  waDigits,
  tileRowShowServices,
  setServicesModalOpen,
  tileRowShopAsLink,
  tileRowShopWebsite,
  tileRowShopAsWa,
  handleWhatsAppShop,
  stSvTile,
  stWaTile,
  stSvcTile,
  stShopTile,
  isLightTheme = false,
}) {
  const bareIconClass =
    'flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-110 text-3xl sm:text-4xl p-2';

  /** Inline colors so SVGs stay visible on any theme / build (Purged Tailwind-safe). */
  const bookmarkInk = isWalletSaved ? '#fbbf24' : isLightTheme ? '#64748b' : '#f8fafc';
  const myCardsInk = isLightTheme ? '#0369a1' : '#7dd3fc';

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-center gap-6 px-4 sm:gap-8">
        {/* Save Contact */}
        {tileRowShowSave && (
          <button
            type="button"
            onClick={() => triggerVCardDownload(user)}
            className={bareIconClass}
            title="Save contact"
          >
            <FaAddressBook className={stSvTile.icon} />
          </button>
        )}

        {/* WhatsApp */}
        {showWa && (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noreferrer"
            className={bareIconClass}
            title="WhatsApp"
          >
            <FaWhatsapp className={stWaTile.icon} />
          </a>
        )}

        {/* Services */}
        {tileRowShowServices && (
          <button
            type="button"
            onClick={() => setServicesModalOpen(true)}
            className={bareIconClass}
            title="Services"
          >
            <FaClipboardList className={stSvcTile.icon} />
          </button>
        )}

        {/* Shop (Link or WhatsApp) */}
        {(tileRowShopAsLink || tileRowShopAsWa) && (
          <button
            type="button"
            onClick={
              tileRowShopAsLink ? () => window.open(tileRowShopWebsite, '_blank') : handleWhatsAppShop
            }
            className={bareIconClass}
            title="Shop"
          >
            <FaShoppingBasket className={stShopTile.icon} />
          </button>
        )}

        {showWalletRow && (
          <>
            <button
              type="button"
              onClick={onToggleWalletSave}
              className={bareIconClass}
              title={
                hasToken
                  ? isWalletSaved
                    ? 'Remove from My cards'
                    : 'Save to My cards'
                  : 'Login to save this card'
              }
            >
              <FaBookmark style={{ width: 28, height: 28, color: bookmarkInk }} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() =>
                hasToken
                  ? navigate('/card/saved')
                  : navigate('/card/login', { state: { from: 'saved-cards' } })
              }
              className={`${bareIconClass} relative text-current`}
              title={hasToken ? 'My saved cards' : 'Login to open My cards'}
            >
              <FaIdCard style={{ width: 28, height: 28, color: myCardsInk }} aria-hidden />
              {hasToken && walletSavedCount > 0 ? (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-slate-950 shadow-md">
                  {walletSavedCount > 99 ? '99+' : walletSavedCount}
                </span>
              ) : null}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
