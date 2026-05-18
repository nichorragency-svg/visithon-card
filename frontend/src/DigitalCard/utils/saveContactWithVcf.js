import { saveContactToDirectory } from '../../api/visithonApi';
import { triggerVCardDownload } from './downloadVCard';
import { buildPublicCardViewUrl } from './cardPublicUrl';
import { upsertSavedCard } from './savedCardsStorage';

/**
 * Download .vcf and, when logged in, persist the card to the Visithon directory API + local wallet cache.
 */
export async function saveContactWithVcf({ user, userId, profileImageUrl = '', hasToken = false }) {
  const uid = String(userId || user?.id || user?._id || '').trim();
  const cardUrl = uid ? buildPublicCardViewUrl(uid) : '';
  const imageUrl = String(profileImageUrl || '').trim();

  await triggerVCardDownload(user, { cardUrl, profileImageUrl: imageUrl });

  if (!hasToken || !uid) return;

  upsertSavedCard({
    userId: uid,
    name: user?.name || '',
    cardUrl: cardUrl || (typeof window !== 'undefined' ? `${window.location.origin}/card/view/${uid}` : ''),
  });

  try {
    await saveContactToDirectory(uid);
  } catch {
    /* vCard still downloaded; directory sync can retry from saved list */
  }
}
