import { ensureSupabase } from './client';
import { buildCardPayload } from './cardPayload';

/** Load a card for public `/card/view/:userId` (Supabase `profiles` + `themes`). */
export async function fetchPublishedCardPayload(userId, opts = {}) {
  const supabase = ensureSupabase();
  const id = String(userId || '').trim();
  if (!id) return { payload: null };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const viewerId = session?.user?.id || null;
  const isOwnerPreview = opts.isOwnerPreview !== false && viewerId && String(viewerId) === id;

  const { data: row, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, has_card, wizard_completed, is_published, profile, products, payment_methods, reminders',
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message || 'Card load failed.');
  if (!row) return { payload: null };

  if (!row.is_published && !isOwnerPreview) {
    return { payload: null };
  }

  const themeKey = (row.profile?.step1 && row.profile.step1.theme) || '';

  let themeRow = null;
  if (themeKey) {
    const { data: t } = await supabase
      .from('themes')
      .select('layout_key, name, category, is_active, ui_tokens')
      .eq('layout_key', themeKey)
      .eq('is_active', true)
      .maybeSingle();
    themeRow = t;
  }

  return { payload: buildCardPayload(row, themeRow), row };
}
