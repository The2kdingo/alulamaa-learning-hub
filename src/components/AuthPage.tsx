import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles } from "lucide-react";
import { IslamicLoader } from "@/components/IslamicLoader";
import logoImage from "@/assets/alulamaa-logo.png";

type Mode = "login" | "signup" | "forgot";

export function AuthPage({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [isFlipping, setIsFlipping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const switchMode = (next: Mode) => {
    setIsFlipping(true);
    setTimeout(() => {
      setMode(next);
      setIsFlipping(false);
    }, 280);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("As-Salaam Alaikum! Welcome back.");
        onAuthSuccess();
      } else if (mode === "signup") {
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
            data: { name: form.name, full_name: form.name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to verify.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        toast.success("Password reset link sent! Check your email.");
        switchMode("login");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, { title: string; sub: string; cta: string }> = {
    login: { title: "Welcome Back", sub: "Sign in to continue your journey", cta: "Sign In" },
    signup: { title: "Join AlUlamaa", sub: "Begin your Islamic learning path", cta: "Create Account" },
    forgot: { title: "Reset Password", sub: "We'll send a recovery link to your email", cta: "Send Reset Link" },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: "var(--gradient-warm)" }}
    >
      {/* Decorative animated orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gold/10 translate-y-1/2 -translate-x-1/2" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L50 30L80 40L50 50L40 80L30 50L0 40L30 30Z' fill='%23000'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="w-full max-w-md relative" style={{ perspective: "1200px" }}>
        <div
          className={`transition-all duration-500 ${isFlipping ? "scale-95 opacity-0 rotate-y-12" : "scale-100 opacity-100"}`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="glass rounded-3xl shadow-elevated p-8 relative overflow-hidden">
            {/* Top gold accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />

            {/* Logo + Heading */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-3">
                <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl animate-pulse-glow" />
                <img src={logoImage} alt="AlUlamaa" width={72} height={72} className="relative" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground animate-fade-in-up">
                {titles[mode].title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 text-center">{titles[mode].sub}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="animate-fade-in-up">
                  <Label htmlFor="name" className="text-foreground text-sm">Full Name</Label>
                  <div className="relative mt-1.5">
                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="pl-9 bg-background/60"
                    />
                  </div>
                </div>
              )}

              <div className="animate-fade-in-up">
                <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="pl-9 bg-background/60"
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground text-sm">Password</Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1.5">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      className="pl-9 pr-9 bg-background/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div className="animate-fade-in-up">
                  <Label htmlFor="confirmPassword" className="text-foreground text-sm">Confirm Password</Label>
                  <div className="relative mt-1.5">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      required
                      className="pl-9 bg-background/60"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 gradient-primary text-primary-foreground hover:opacity-90 shadow-gold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <IslamicLoader size="sm" />
                    Please wait...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} />
                    {titles[mode].cta}
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Don't have an account? <span className="underline">Sign up</span>
                </button>
              )}
              {mode === "signup" && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Already have an account? <span className="underline">Sign in</span>
                </button>
              )}
              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  ← Back to sign in
                </button>
              )}
            </div>

            {/* Islamic decoration */}
            <div className="mt-6 flex items-center justify-center gap-3">
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
