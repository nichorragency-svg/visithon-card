"""
Future: Supabase-backed admin card directory.

When profiles in Supabase should appear alongside (or instead of) Mongo `visithon_cards`:

1. Implement async fetch against Supabase (service role or secure admin path only on server).
2. Map each row to the same dict shape as `mongo_cards_source.admin_row_from_visithon_doc`:
   `{"_id": str, "user": {"name": str}, "cardTitle": str, "status": str}`.
3. In `admin_panel/router.py`, merge or switch sources (keep HTTP handlers thin).

Do not put Supabase secrets in the React bundle; prefer server-side aggregation if possible.
"""
