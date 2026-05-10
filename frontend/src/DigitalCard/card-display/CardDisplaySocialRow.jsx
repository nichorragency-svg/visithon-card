import React from 'react';
import { SOCIAL_STYLES } from './styles';
import { socialIcon } from './socialIconMap';
import { effectiveSocialHref } from './helpers';

export function CardDisplaySocialRow({ entries }) {
  if (!entries.length) return null;

  return (
    <div className="mt-8">
      {/* Standard spacing logic: Icons ke darmiyan proper gap (gap-5)
         taake mobile par click karne mein asani ho.
      */}
      <div className="flex flex-wrap justify-center items-center gap-5 sm:gap-6 px-4">
        {entries.map(([key, url]) => {
          const href = effectiveSocialHref(key, url);
          if (!href) return null;
          const Icon = socialIcon[key] || socialIcon.custom;
          const stSoc = SOCIAL_STYLES[key] || SOCIAL_STYLES.custom;

          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer"
              title={key}
              /* Standard Clean Style: Pura container logic hata di hy.
                 Ab ye sirf ek anchor tag hy jiske andar icon hy.
              */
              className="touch-manipulation p-1 transition-all active:scale-90 hover:scale-110"
            >
              {/* Yahan sirf icon render ho raha hy.
                 Icon size ko thora barha kar text-2xl kiya hy taake
                 khali container ke baghair wo prominent nazar aaye.
                 Brand colors 'stSoc.icon' se handle honge.
              */}
              <Icon className={`${stSoc.icon} text-2xl sm:text-3xl`} />
            </a>
          );
        })}
      </div>
    </div>
  );
}