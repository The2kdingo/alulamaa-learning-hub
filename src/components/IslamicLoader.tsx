import { cn } from "@/lib/utils";

interface IslamicLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  fullscreen?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 36,
  md: 56,
  lg: 88,
  xl: 128,
};

/**
 * A unique, brand-aligned loader: an 8-pointed Islamic star (rub-el-hizb) that
 * gently rotates while a pulsing crescent core glows in gold. Pure SVG +
 * Tailwind animations — no external assets, fully theme-aware.
 */
export function IslamicLoader({ size = "md", label, fullscreen, className }: IslamicLoaderProps) {
  const px = sizeMap[size];

  const loader = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative" style={{ width: px, height: px }}>
        {/* Outer rotating star */}
        <svg
          viewBox="0 0 100 100"
          width={px}
          height={px}
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "4s" }}
          aria-hidden
        >
          <defs>
            <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.55 0.17 160)" />
              <stop offset="100%" stopColor="oklch(0.72 0.12 85)" />
            </linearGradient>
          </defs>
          <g transform="translate(50 50)">
            <rect
              x="-32"
              y="-32"
              width="64"
              height="64"
              fill="none"
              stroke="url(#starGrad)"
              strokeWidth="3"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <rect
              x="-32"
              y="-32"
              width="64"
              height="64"
              fill="none"
              stroke="url(#starGrad)"
              strokeWidth="3"
              strokeLinejoin="round"
              transform="rotate(45)"
              opacity="0.85"
            />
          </g>
        </svg>

        {/* Counter-rotating inner ring */}
        <svg
          viewBox="0 0 100 100"
          width={px}
          height={px}
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "2.5s", animationDirection: "reverse" }}
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="none"
            stroke="oklch(0.72 0.12 85)"
            strokeWidth="2"
            strokeDasharray="6 8"
            opacity="0.7"
          />
        </svg>

        {/* Central glowing crescent */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full animate-pulse-glow"
            style={{
              width: px * 0.32,
              height: px * 0.32,
              background: "var(--gradient-gold)",
              boxShadow: "0 0 20px var(--gold)",
            }}
          />
        </div>
      </div>

      {label && (
        <p className="text-sm font-medium text-muted-foreground tracking-wide animate-fade-in">
          {label}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
}
