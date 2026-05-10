-- ONLY run this if profiles/themes already exist and you just need photo uploads to work.
-- Prerequisite: Storage → create bucket named `media` (public).
-- Paste in SQL Editor → Run. Do NOT re-run full schema.sql unless you use the updated schema with DROP POLICY.

drop policy if exists "media_public_select" on storage.objects;
drop policy if exists "media_authenticated_insert" on storage.objects;
drop policy if exists "media_authenticated_update" on storage.objects;
drop policy if exists "media_authenticated_delete" on storage.objects;

create policy "media_public_select"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername (name))[1] = (auth.uid ())::text
  );

create policy "media_authenticated_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername (name))[1] = (auth.uid ())::text
  );

create policy "media_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername (name))[1] = (auth.uid ())::text
  );
