import { useState, useEffect } from "react";
// import logoImage from "../assets/alulamaa-logo.png"; // Disabled for server build

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("exit"), 2500);
    const t3 = setTimeout(onComplete, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gradient-hero transition-opacity duration-700 ${phase === "exit" ? "opacity-0" : "opacity-100"}`}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/10 animate-pulse-glow" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gold/5" />
      </div>

      {/* Logo */}
      <div className={`relative transition-all duration-1000 ${phase !== "logo" ? "animate-float" : ""}`}>
<div className="w-45 h-45 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-gold animate-spin-slow" />

      </div>

      {/* Text */}
      <div className={`mt-6 text-center transition-all duration-700 ${phase === "text" || phase === "exit" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground tracking-wide">
          AlUlamaa
        </h1>
        <p className="mt-2 text-lg text-primary-foreground/80 font-light tracking-widest uppercase">
          Academy
        </p>
        <div className="mt-4 h-0.5 w-24 mx-auto bg-gold/60 rounded-full" />
      </div>

      {/* Loading shimmer */}
      <div className="mt-10 w-48 h-1 rounded-full overflow-hidden bg-primary-foreground/10">
        <div className="h-full w-1/2 rounded-full bg-gold animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
      </div>
    </div>
  );
}
