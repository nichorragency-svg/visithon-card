import React from 'react';
import { FaAddressBook, FaClipboardList, FaShoppingBasket, FaWhatsapp } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

export function CardDisplayActionTiles({
  userId,
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
  // Clean Style: No background, just the icon with its brand/theme color
  const bareIconClass = "flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-110 text-3xl sm:text-4xl p-2";

  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 px-4">
        
        {/* Save Contact */}
        {tileRowShowSave && (
          <a
            href={`${API_BASE_URL}/card-auth/download-vcard/${userId}`}
            download
            className={bareIconClass}
            title="Save contact"
          >
            <FaAddressBook className={stSvTile.icon} />
          </a>
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
            onClick={tileRowShopAsLink ? () => window.open(tileRowShopWebsite, '_blank') : handleWhatsAppShop}
            className={bareIconClass}
            title="Shop"
          >
            {/* Tokri wala icon as requested */}
            <FaShoppingBasket className={stShopTile.icon} />
          </button>
        )}
        
      </div>
    </div>
  );
}