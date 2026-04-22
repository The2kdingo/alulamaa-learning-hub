import { Link, useLocation } from "@tanstack/react-router";
import {
  User, BookOpen, Home, Award, LogOut, Library, Compass,
  Heart, Users, Shield, Menu, X
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
// import logoImage from "../assets/alulamaa-logo.png"; // Disabled for server

export function Navbar() {
  const location = useLocation();
  const { isAdmin } = useUserRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const baseItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/resources", label: "Resources", icon: Library },
    { to: "/quiz", label: "Quizzes", icon: Award },
    { to: "/prayer", label: "Prayer", icon: Compass },
    { to: "/dua", label: "Dua", icon: Heart },
    { to: "/community", label: "Community", icon: Users },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  const navItems = isAdmin
    ? [...baseItems, { to: "/admin", label: "Admin", icon: Shield } as const]
    : baseItems;

  const bottomItems = navItems.slice(0, 5);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <nav className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
<div className="w-[36px] h-[36px] bg-gradient-to-br from-primary to-secondary rounded-lg shadow-gold flex items-center justify-center">
  A
</div>

              <span className="font-heading font-bold text-lg text-foreground">AlUlamaa</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1 flex-wrap">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
              </button>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden p-2 text-foreground rounded-lg hover:bg-accent"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded mobile menu (full list) */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border/30 px-4 py-3 grid grid-cols-2 gap-2 bg-background/95">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="col-span-2 mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm text-destructive bg-destructive/10 rounded-lg"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Bottom tab bar (mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 px-2 py-1.5 grid grid-cols-5 gap-1">
        {bottomItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              location.pathname === to
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            }`}
          >
            <Icon size={18} />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
      {/* Spacer so mobile content isn't covered by bottom tab */}
      <div className="lg:hidden h-14" />
    </>
  );
}
