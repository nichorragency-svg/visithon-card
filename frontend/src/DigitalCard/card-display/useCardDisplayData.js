import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

/** Two Mongo round-trips + slow Atlas: 20s client timeout was too tight. */
const FETCH_TIMEOUT_MS = 45_000;

function readAxiosDetail(err) {
  if (!axios.isAxiosError(err) || err.response?.data == null) return null;
  const d = err.response.data.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d
      .map((x) => (typeof x === 'object' && x?.msg ? x.msg : String(x)))
      .filter(Boolean)
      .join(' ');
  }
  return null;
}

/** Fetch `/card-view/:id` — same on mobile PWAs / WebView-friendly GET. */
export function useCardDisplayData(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const load = useCallback(
    async (signal) => {
      if (!userId || String(userId).trim() === '') {
        setUser(null);
        setFetchError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError(null);
      try {
        const id = String(userId).trim();
        const res = await axios.get(`${API_BASE_URL}/card-view/${encodeURIComponent(id)}`, {
          timeout: FETCH_TIMEOUT_MS,
          signal,
        });
        setUser(res.data?.data ?? null);
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;

        const detail = readAxiosDetail(err);
        if (detail) console.error('Card fetch:', detail);
        else console.error('Card fetch:', err?.message ?? err);

        setUser(null);
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setFetchError(null);
        } else {
          const aborted = axios.isAxiosError(err) && err.code === 'ECONNABORTED';
          if (aborted) {
            setFetchError(
              'Request timed out. Check API (port 8000), MongoDB Atlas (IP allowlist / URI), then retry.',
            );
          } else if (detail) {
            setFetchError(detail.length > 220 ? `${detail.slice(0, 220)}…` : detail);
          } else {
            setFetchError(
              'Could not load this card. Check your network and that the backend is running.',
            );
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const fetchCard = useCallback(() => load(undefined), [load]);

  return { user, loading, fetchError, fetchCard };
}
