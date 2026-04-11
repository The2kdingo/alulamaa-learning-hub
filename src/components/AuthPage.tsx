import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logoImage from "@/assets/alulamaa-logo.png";

export function AuthPage({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const flipCard = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsFlipping(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("As-Salaam Alaikum! Welcome back.");
        onAuthSuccess();
      } else {
        if (form.password !== form.confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        if (form.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { name: form.name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created! Please check your email to verify.");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden" style={{ background: "var(--gradient-warm)" }}>
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gold/5 translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative" style={{ perspective: "1000px" }}>
        <div
          className={`transition-transform duration-500 ${isFlipping ? "scale-95 opacity-80" : "scale-100 opacity-100"}`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="glass rounded-2xl shadow-elevated p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <img src={logoImage} alt="AlUlamaa" width={80} height={80} className="mb-3" />
              <h2 className="text-2xl font-heading font-bold text-foreground">
                {isLogin ? "Welcome Back" : "Join AlUlamaa"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isLogin ? "Sign in to continue your journey" : "Begin your Islamic learning path"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="animate-fade-in-up">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required={!isLogin}
                    className="mt-1.5 bg-background/50"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="mt-1.5 bg-background/50"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="mt-1.5 bg-background/50"
                />
              </div>

              {!isLogin && (
                <div className="animate-fade-in-up">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required={!isLogin}
                    className="mt-1.5 bg-background/50"
                  />
                </div>
              )}

              <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={flipCard}
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {/* Islamic decoration */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground font-medium tracking-wider">بِسْمِ اللَّهِ</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
