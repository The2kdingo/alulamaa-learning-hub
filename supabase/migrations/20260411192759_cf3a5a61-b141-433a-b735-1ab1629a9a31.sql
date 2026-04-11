
-- Fix 1: Restrict users table SELECT to authenticated users only (was public with USING true)
DROP POLICY "Users can read all profiles" ON public.users;
CREATE POLICY "Authenticated users can read profiles"
  ON public.users FOR SELECT TO authenticated
  USING (true);

-- Fix 2: Set search_path on update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix 3: Tighten overly permissive INSERT policies
-- Quiz answers: require authenticated users
DROP POLICY "Anyone can submit answers" ON public.quiz_answers;
CREATE POLICY "Authenticated users can submit answers"
  ON public.quiz_answers FOR INSERT TO authenticated
  WITH CHECK (true);

-- Quiz participants: require authenticated users
DROP POLICY "Anyone can participate" ON public.quiz_participants;
CREATE POLICY "Authenticated users can participate"
  ON public.quiz_participants FOR INSERT TO authenticated
  WITH CHECK (true);

-- Quizzes INSERT: scope to quiz creator's email matching auth email
DROP POLICY "Users can insert their own quizzes" ON public.quizzes;
CREATE POLICY "Users can insert their own quizzes"
  ON public.quizzes FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = created_by_email);
