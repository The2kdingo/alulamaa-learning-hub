import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/SplashScreen";
import { AuthPage } from "@/components/AuthPage";
import { IslamicLoader } from "@/components/IslamicLoader";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { BookOpen, Calendar, Users, Library, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AlUlamaa Academy — Islamic Learning Platform" },
      { name: "description", content: "Discover authentic Islamic knowledge through structured courses in Quranic Studies, Hadith, Fiqh, and Aqidah." },
      { property: "og:title", content: "AlUlamaa Academy — Islamic Learning Platform" },
      { property: "og:description", content: "Discover authentic Islamic knowledge through structured courses." },
    ],
  }),
  component: Index,
});

const courses = [
  { title: "Quranic Studies", description: "Deep dive into Tafseer, Tajweed, and memorization techniques for understanding the Holy Quran.", lessons: 24, duration: "12 weeks", level: "All Levels", icon: "📖" },
  { title: "Hadith Collection", description: "Study authentic collections of Sahih Bukhari, Muslim, and other major compilations.", lessons: 18, duration: "10 weeks", level: "Intermediate", icon: "📚" },
  { title: "Islamic Jurisprudence", description: "Learn the principles of Fiqh covering worship, transactions, and daily life rulings.", lessons: 20, duration: "14 weeks", level: "Intermediate", icon: "⚖️" },
  { title: "Aqidah (Beliefs)", description: "Foundation course on Islamic creed, theology, and the pillars of faith.", lessons: 12, duration: "6 weeks", level: "Beginner", icon: "🌙" },
];

const quickLinks = [
  { label: "Prayer Times", icon: Calendar, to: "/prayer", color: "bg-primary/10 text-primary" },
  { label: "Tasbih", icon: Heart, to: "/tasbih", color: "bg-gold/20 text-gold-foreground" },
  { label: "Community", icon: Users, to: "/community", color: "bg-warm/10 text-warm" },
  { label: "Resources", icon: Library, to: "/resources", color: "bg-primary/10 text-primary" },
];

function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Student");
      }
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Student");
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  const handleAuthSuccess = useCallback(() => {
    // Session listener will update state
  }, []);

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><IslamicLoader size="lg" label="Preparing your journey..." /></div>;
  if (!session) return <AuthPage onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero px-4 py-12 md:py-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="animate-fade-in-up">
            <p className="text-primary-foreground/70 text-sm font-medium tracking-widest uppercase mb-2">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground leading-tight">
              As-Salaam Alaikum,<br />
              <span className="text-gradient-gold" style={{ WebkitTextFillColor: "initial", color: "oklch(0.82 0.12 85)" }}>{userName}</span>
            </h1>
            <p className="mt-3 text-primary-foreground/80 max-w-lg text-base md:text-lg">
              Continue your journey of seeking knowledge. May Allah bless your path.
            </p>
          </div>

          {/* Quick stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map(({ label, icon: Icon, to, color }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3 text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-200 text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-primary-foreground/20`}>
                  <Icon size={18} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Featured Courses</h2>
            <p className="text-muted-foreground mt-1">Begin or continue your studies</p>
          </div>
          <Button variant="ghost" className="text-primary hidden sm:flex">
            View All <ArrowRight size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.title} {...course} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AlUlamaa Academy. Seeking knowledge is an obligation upon every Muslim.
          </p>
        </div>
      </footer>
    </div>
  );
}
