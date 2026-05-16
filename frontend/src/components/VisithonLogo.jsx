import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_UNLOCK_SESSION_KEY } from '../Admin_Panel/constants';

const LONG_PRESS_MS = 3000;
const MOVE_CANCEL_PX = 14;
const FALLBACK_SRC = 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png';

/**
 * Header / public Visithon mark. Hidden admin entry: hold 3s → `/admin/login`.
 * No UI feedback (silent). Sets the same session unlock flag as Alt+A×2.
 */
export default function VisithonLogo({
  className = '',
  imgClassName = 'h-10 w-auto object-contain',
  alt = 'Visithon Logo',
}) {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const originRef = useRef({ x: 0, y: 0 });

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const openAdminLogin = useCallback(() => {
    clearTimer();
    try {
      sessionStorage.setItem(ADMIN_UNLOCK_SESSION_KEY, '1');
    } catch {
      /* private mode */
    }
    navigate('/admin/login', { replace: true });
  }, [clearTimer, navigate]);

  const beginLongPress = useCallback(
    (clientX, clientY) => {
      clearTimer();
      originRef.current = { x: clientX, y: clientY };
      timerRef.current = window.setTimeout(openAdminLogin, LONG_PRESS_MS);
    },
    [clearTimer, openAdminLogin],
  );

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* unsupported */
    }
    beginLongPress(e.clientX, e.clientY);
  };

  const endPress = (e) => {
    clearTimer();
    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* */
    }
  };

  const onPointerLeave = (e) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
    clearTimer();
  };

  const onPointerMove = (e) => {
    if (timerRef.current == null) return;
    const dx = e.clientX - originRef.current.x;
    const dy = e.clientY - originRef.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) clearTimer();
  };

  return (
    <div
      className={className}
      style={{
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src="/logo.png"
        alt={alt}
        className={imgClassName}
        draggable={false}
        onError={(e) => {
          e.currentTarget.src = FALLBACK_SRC;
        }}
      />
    </div>
  );
}
