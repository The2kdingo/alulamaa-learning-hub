-- Harden existing functions with explicit search_path
CREATE OR REPLACE FUNCTION public.set_accepted_terms(uid uuid, accepted boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF accepted THEN
    UPDATE public.profiles SET accepted_terms_at = now() WHERE id = uid;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (new.id, new.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop the legacy SECURITY DEFINER view (replaced by direct table access with RLS)
DROP VIEW IF EXISTS public.recent_announcements;