import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ALT_A_DOUBLE_MS, ADMIN_UNLOCK_SESSION_KEY } from './constants';

/**
 * Global listener: Alt+A twice within ADMIN_ALT_A_DOUBLE_MS → unlock + /admin/login.
 * Not linked from public UI.
 */
export default function AdminShortcutListener() {
  const navigate = useNavigate();
  const lastAltARef = useRef(0);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!e.altKey) return;
      if (e.code !== 'KeyA' && e.key?.toLowerCase() !== 'a') return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastAltARef.current <= ADMIN_ALT_A_DOUBLE_MS) {
        try {
          sessionStorage.setItem(ADMIN_UNLOCK_SESSION_KEY, '1');
        } catch {
          /* private mode etc. — still navigate */
        }
        lastAltARef.current = 0;
        navigate('/admin/login', { replace: true });
      } else {
        lastAltARef.current = now;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  return null;
}
