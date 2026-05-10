import React from 'react';
import {
  FaAddressBook,
  FaClipboardList,
  FaShoppingBasket,
  FaWhatsapp,
} from 'react-icons/fa';
import { triggerVCardDownload } from '../utils/downloadVCard';

export function CardDisplayActionTiles({
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
}) {
  const bareIconClass =
    'flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-110 text-3xl sm:text-4xl p-2';

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
      </div>
    </div>
  );
}
