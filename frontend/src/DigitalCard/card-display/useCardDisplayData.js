import { useCallback, useEffect, useState } from 'react';
import { fetchPublishedCardPayload } from '../../api/visithonApi';

export function useCardDisplayData(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const load = useCallback(async () => {
    if (!userId || String(userId).trim() === '') {
      setUser(null);
      setFetchError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const { payload } = await fetchPublishedCardPayload(String(userId).trim());
      const data = payload?.data ?? null;
      setUser(data);
      setFetchError(null);
    } catch (err) {
      console.error('Card fetch:', err?.message ?? err);
      const msg =
        typeof err?.message === 'string' && err.message.trim()
          ? err.message.trim()
          : 'Could not load this card.';
      setFetchError(msg.length > 220 ? `${msg.slice(0, 220)}…` : msg);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const fetchCard = useCallback(() => load(), [load]);

  return { user, loading, fetchError, fetchCard };
}
