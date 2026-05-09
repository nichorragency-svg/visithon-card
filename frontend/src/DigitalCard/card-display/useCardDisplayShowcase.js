import { useLayoutEffect, useMemo, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import { staticUrl } from '../../visithon/utils/staticUrl';
import { onlyDigits } from './helpers';

/**
 * Auto-scroll strip for products / gallery — subpixel-safe for mobile GPUs.
 * @param {{ enableShowcaseStrip?: boolean }} [options] — set false to hide strip (handlers still work).
 */
export function useCardDisplayShowcase(user, options = {}) {
  const { enableShowcaseStrip = true } = options;

  const showcaseInnerRef = useRef(null);
  const showcasePausedRef = useRef(false);
  const showcaseTranslateXRef = useRef(0);

  const showcaseItems = useMemo(() => {
    if (!enableShowcaseStrip || !user) return [];
    if (user.products && user.products.length > 0) {
      return user.products.filter((p) => p && (p.image || p.url));
    }
    if (Array.isArray(user.gallery?.images)) {
      return user.gallery.images.filter((p) => p && (p.url || p.image));
    }
    return [];
  }, [user, enableShowcaseStrip]);
  const showcaseLoopItems =
    showcaseItems.length > 0 ? [...showcaseItems, ...showcaseItems] : [];

  useLayoutEffect(() => {
    const inner = showcaseInnerRef.current;
    if (!inner || showcaseItems.length < 1) return undefined;

    showcaseTranslateXRef.current = 0;
    inner.style.transform = 'translate3d(0,0,0)';

    let rafId = 0;
    let cancelled = false;
    const speed = 0.45;

    const tick = () => {
      if (cancelled) return;
      if (!showcasePausedRef.current) {
        const loopW = inner.scrollWidth / 2;
        if (loopW > 0) {
          showcaseTranslateXRef.current -= speed;
          if (showcaseTranslateXRef.current <= -loopW) {
            showcaseTranslateXRef.current += loopW;
          }
          inner.style.transform = `translate3d(${Math.round(showcaseTranslateXRef.current)}px,0,0)`;
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [showcaseItems]);

  const handleWhatsAppProduct = (prod) => {
    const phoneNumber = onlyDigits(user.whatsapp || user.phone1);
    if (!phoneNumber) return;
    const imageUrl =
      (prod.image && `${API_BASE_URL}/static/product_assets/${prod.image}`) ||
      (prod.url && staticUrl(prod.url)) ||
      '';
    const message = `Assalam-o-Alaikum, I am interested in this product:\n\n*Product:* ${prod.name || 'N/A'}\n*Price:* ${prod.price || 'N/A'}${imageUrl ? `\n*Image:* ${imageUrl}` : ''}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWhatsAppAllServices = () => {
    const phoneNumber = onlyDigits(user.whatsapp || user.phone1);
    if (!phoneNumber || !user.services?.length) return;
    const lines = user.services.map((s) => `• ${(s.name || '').trim()}`).filter(Boolean).join('\n');
    const message = `Assalam-o-Alaikum, I would like to know more about your services:\n\n${lines}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWhatsAppShop = () => {
    const phoneNumber = onlyDigits(user.whatsapp || user.phone1);
    if (!phoneNumber) return;
    const message =
      'Assalam-o-Alaikum, I would like to inquire about your shop / products. Please share details.';
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return {
    showcaseInnerRef,
    showcasePausedRef,
    showcaseItems,
    showcaseLoopItems,
    handleWhatsAppProduct,
    handleWhatsAppAllServices,
    handleWhatsAppShop,
  };
}
