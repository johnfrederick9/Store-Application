-- =============================================================
-- Storefront: scope auth to this app when the Supabase project
-- is shared with another app (Alay-Trabaho).
--
-- Run this ONCE in the SQL Editor. Safe to re-run.
-- =============================================================

-- Backfill existing Storefront users so the app-layer gate
-- (user_metadata.app === 'storefront') recognises them. We
-- identify legacy Storefront users by their ownership of a
-- store row.
update auth.users
set raw_user_meta_data =
      coalesce(raw_user_meta_data, '{}'::jsonb)
      || '{"app":"storefront"}'::jsonb
where id in (select owner_id from public.stores)
  and coalesce(raw_user_meta_data->>'app', '') = '';
