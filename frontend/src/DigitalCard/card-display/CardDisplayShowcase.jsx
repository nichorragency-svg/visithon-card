import React from 'react';
import { API_BASE_URL } from '../../config';
import { staticUrl } from '../../visithon/utils/staticUrl';

export function CardDisplayShowcase({
  showcaseItems,
  showcaseLoopItems,
  showcaseInnerRef,
  showcasePausedRef,
  handleWhatsAppProduct,
  tokenTheme,
  accentInlineStyle,
  showcaseFrameStyle,
}) {
  if (showcaseItems.length === 0) return null;

  return (
    <section className="mt-4 w-full min-w-0">
      <div
        className="w-full min-w-0 overflow-hidden"
        onMouseEnter={() => {
          showcasePausedRef.current = true;
        }}
        onMouseLeave={() => {
          showcasePausedRef.current = false;
        }}
        onTouchStart={() => {
          showcasePausedRef.current = true;
        }}
        onTouchEnd={() => {
          showcasePausedRef.current = false;
        }}
      >
        <div ref={showcaseInnerRef} className="flex w-max gap-3 pb-1">
          {showcaseLoopItems.map((prod, index) => {
            const name = String(prod?.name || '').trim();
            const price = String(prod?.price || '').trim();
            const imgSrc = prod?.image
              ? `${API_BASE_URL}/static/product_assets/${prod.image}`
              : prod?.url
                ? staticUrl(prod.url)
                : '';
            if (!imgSrc) return null;

            return (
              <button
                key={`${prod?.id || index}-${index}`}
                type="button"
                onClick={() => handleWhatsAppProduct(prod)}
                className="group w-[5.7rem] shrink-0 touch-manipulation text-left active:opacity-95"
              >
                <div
                  className="relative isolate h-[7.75rem] overflow-hidden rounded-[0.9rem] border border-white/10 bg-[#111827] shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition group-hover:-translate-y-0.5 group-hover:brightness-[1.04]"
                  style={showcaseFrameStyle}
                >
                  <img
                    src={imgSrc}
                    alt={name ? `${name} image` : 'Product image'}
                    className="h-full w-full object-cover [image-rendering:auto]"
                    decoding="async"
                    loading="lazy"
                  />
                </div>

                {name ? (
                  <p className="mt-1.5 truncate text-center text-[13px] font-semibold leading-tight text-white/90">
                    {name}
                  </p>
                ) : null}
                {price ? (
                  <p
                    className={`truncate text-center text-xs font-bold ${tokenTheme ? '' : 'text-cyan-300'}`}
                    style={tokenTheme ? accentInlineStyle : undefined}
                  >
                    {price}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
