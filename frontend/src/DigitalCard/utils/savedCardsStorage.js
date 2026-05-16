import { parseCardIdFromScanText } from './cardPublicUrl';

/** Per-device saved card list (localStorage). Wallet UI only when the user is logged in. */
const STORAGE_KEY = 'visithon_saved_cards_v1';
const MAX_CARDS = 60;

export function getSavedCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x === 'object' && String(x.userId || '').trim())
      .slice(0, MAX_CARDS);
  } catch {
    return [];
  }
}

export function getSavedCardCount() {
  return getSavedCards().length;
}

export function isSavedCard(userId) {
  const id = String(userId || '').trim();
  if (!id) return false;
  return getSavedCards().some((x) => String(x.userId) === id);
}

/**
 * @param {{ userId: string, name?: string, cardUrl?: string }} entry
 */
export function upsertSavedCard({ userId, name, cardUrl }) {
  const id = String(userId || '').trim();
  if (!id) return;
  const rest = getSavedCards().filter((x) => String(x.userId) !== id);
  const row = {
    userId: id,
    name: String(name || '').trim().slice(0, 160),
    cardUrl: String(cardUrl || '').trim().slice(0, 500),
    savedAt: new Date().toISOString(),
  };
  rest.unshift(row);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest.slice(0, MAX_CARDS)));
}

export function removeSavedCard(userId) {
  const id = String(userId || '').trim();
  if (!id) return;
  const next = getSavedCards().filter((x) => String(x.userId) !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** Try to parse `/card/view/:cardId` from a scanned URL or path (legacy name). */
export function parseViewUserIdFromUrl(href) {
  return parseCardIdFromScanText(href);
}
