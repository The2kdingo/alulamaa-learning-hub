-- =========================================================================
-- PHASE A FOUNDATION MIGRATION
-- =========================================================================

-- 1. ROLES SYSTEM (replaces is_admin flag — security best practice)
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-grant admin to designated admin email + default user role to everyone
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  IF NEW.email = 'abdulsamadsaleh7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 2. EXPAND PROFILES (add columns the app actually needs)
-- =========================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS knowledge_level TEXT DEFAULT 'Beginner',
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. LESSONS (admin-uploaded PDFs organized by subject)
-- =========================================================================
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read lessons" ON public.lessons
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage lessons" ON public.lessons
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. LESSON PROGRESS (tracks which lessons a user opened/saved)
-- =========================================================================
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  quiz_generated BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.lesson_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all progress" ON public.lesson_progress
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. SAVED HIGHLIGHTS (text user selected from PDFs)
-- =========================================================================
CREATE TABLE public.saved_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  topic TEXT,
  selected_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own highlights" ON public.saved_highlights
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. EXPAND QUIZZES (add public-link, lesson reference, manual flag)
-- =========================================================================
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS public_slug TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS context TEXT,
  ADD COLUMN IF NOT EXISTS is_manual BOOLEAN NOT NULL DEFAULT false;

-- Allow public (unauth) read of quizzes via slug for shareable links
DROP POLICY IF EXISTS "quizzes_select_authenticated" ON public.quizzes;
CREATE POLICY "Public can read quizzes (for shareable links)" ON public.quizzes
  FOR SELECT TO anon, authenticated USING (true);

-- 7. PUBLIC QUIZ ATTEMPTS (anon users with just a name)
-- =========================================================================
CREATE TABLE public.public_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.public_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a public attempt" ON public.public_quiz_attempts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Quiz creator and admin view attempts" ON public.public_quiz_attempts
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND q.created_by = auth.uid())
  );

-- 8. COMMUNITY POSTS (users share thoughts; anyone authenticated can read+post)
-- =========================================================================
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read posts" ON public.community_posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated create posts" ON public.community_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own posts; admins delete any" ON public.community_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 9. TASBIH COUNTERS (per-user dhikr counts)
-- =========================================================================
CREATE TABLE public.tasbih_counters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dhikr TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  target INTEGER DEFAULT 33,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, dhikr)
);
ALTER TABLE public.tasbih_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasbih" ON public.tasbih_counters
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. PRAYER SETTINGS (location + calculation method per user)
-- =========================================================================
CREATE TABLE public.prayer_settings (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  city TEXT,
  country TEXT,
  method INTEGER NOT NULL DEFAULT 2,  -- ISNA default
  notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prayer_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prayer settings" ON public.prayer_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11. DUA & ADHKAR LIBRARY (read-only for users, admin manages)
-- =========================================================================
CREATE TABLE public.duas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,  -- e.g. 'morning', 'evening', 'sleep', 'food', 'travel', 'general'
  title TEXT NOT NULL,
  arabic TEXT NOT NULL,
  transliteration TEXT,
  translation TEXT NOT NULL,
  reference TEXT,
  recommended_count INTEGER DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.duas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads duas" ON public.duas
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage duas" ON public.duas
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed a curated starter set of duas/adhkar
INSERT INTO public.duas (category, title, arabic, transliteration, translation, reference, recommended_count, display_order) VALUES
('morning', 'Morning Remembrance (1)', 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ', 'Asbahna wa asbahal-mulku lillah, wal-hamdu lillah', 'We have entered the morning and the dominion belongs to Allah, and all praise belongs to Allah.', 'Muslim', 1, 10),
('morning', 'Sayyid al-Istighfar', 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ', 'Allahumma anta Rabbi la ilaha illa Anta, khalaqtani wa ana abduka', 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant.', 'Bukhari', 1, 20),
('morning', 'SubhanAllah wa bihamdihi (100x)', 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'SubhanAllahi wa bihamdihi', 'Glory be to Allah and praise be to Him.', 'Muslim', 100, 30),
('morning', 'La ilaha illa Allah (100x)', 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', 'La ilaha illa Allah wahdahu la sharika lah', 'There is no deity except Allah, alone, with no partner.', 'Bukhari', 100, 40),
('evening', 'Evening Remembrance (1)', 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', 'Amsayna wa amsal-mulku lillah', 'We have entered the evening and the dominion belongs to Allah.', 'Muslim', 1, 10),
('evening', 'A''udhu bikalimatillah (3x)', 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', 'A''udhu bikalimatillahit-tammati min sharri ma khalaq', 'I seek refuge in the perfect words of Allah from the evil of what He created.', 'Muslim', 3, 20),
('sleep', 'Before Sleep', 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', 'Bismika Allahumma amutu wa ahya', 'In Your name, O Allah, I die and I live.', 'Bukhari', 1, 10),
('sleep', 'Ayat al-Kursi before sleep', 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', 'Allahu la ilaha illa Huwal-Hayyul-Qayyum', 'Allah! There is no deity except Him, the Ever-Living, the Sustainer.', 'Bukhari', 1, 20),
('food', 'Before Eating', 'بِسْمِ اللَّهِ', 'Bismillah', 'In the name of Allah.', 'Bukhari', 1, 10),
('food', 'After Eating', 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ', 'Alhamdu lillahil-ladhi at''amani hadha wa razaqanihi', 'All praise is for Allah who fed me this and provided it for me.', 'Tirmidhi', 1, 20),
('travel', 'Travel Dua', 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ', 'Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin', 'Glory to Him who has subjected this to us, and we could never have accomplished it ourselves.', 'Muslim', 1, 10),
('general', 'Forgiveness', 'رَبِّ اغْفِرْ لِي', 'Rabbighfir li', 'My Lord, forgive me.', 'Quran', 1, 10),
('general', 'For Beneficial Knowledge', 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', 'Allahumma inni as''aluka ''ilman nafi''a', 'O Allah, I ask You for beneficial knowledge.', 'Ibn Majah', 1, 20),
('general', 'Anxiety & Distress', 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ', 'La ilaha illa Allah Al-Adheem Al-Haleem', 'There is no deity except Allah, the Magnificent, the Forbearing.', 'Bukhari', 1, 30),
('after_prayer', 'After Salah - Tasbih', 'سُبْحَانَ اللَّهِ', 'SubhanAllah', 'Glory be to Allah.', 'Muslim', 33, 10),
('after_prayer', 'After Salah - Tahmid', 'الْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'All praise is for Allah.', 'Muslim', 33, 20),
('after_prayer', 'After Salah - Takbir', 'اللَّهُ أَكْبَرُ', 'Allahu Akbar', 'Allah is the Greatest.', 'Muslim', 34, 30),
('after_prayer', 'After Salah - Tahlil', 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', 'La ilaha illa Allah wahdahu la sharika lah', 'There is no deity except Allah, alone, with no partner.', 'Muslim', 1, 40);

-- 12. ANNOUNCEMENT REPLIES / COMMUNITY THREAD UNDER ANNOUNCEMENTS
-- =========================================================================
CREATE TABLE public.announcement_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcement_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read replies" ON public.announcement_replies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated create replies" ON public.announcement_replies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own; admin delete any" ON public.announcement_replies
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 13. STORAGE BUCKETS (lessons-pdf for admin uploads, profile-pictures public)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('lesson-pdfs', 'lesson-pdfs', false),
  ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Lesson PDFs: anyone authenticated can read; admin uploads
CREATE POLICY "Authenticated read lesson PDFs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'lesson-pdfs');
CREATE POLICY "Admin upload lesson PDFs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update lesson PDFs" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'lesson-pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete lesson PDFs" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'lesson-pdfs' AND public.has_role(auth.uid(), 'admin'));

-- Profile pictures: public read; users upload to their folder
CREATE POLICY "Anyone read profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');
CREATE POLICY "Users upload own profile pic" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users update own profile pic" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]
  );
