import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Heart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dua")({
  head: () => ({
    meta: [
      { title: "Dua & Adhkar — AlUlamaa Academy" },
      { name: "description", content: "Authentic supplications and remembrances of Allah." },
    ],
  }),
  component: DuaPage,
});

const CATEGORIES = [
  { key: "morning", label: "🌅 Morning", color: "bg-gold/20" },
  { key: "evening", label: "🌙 Evening", color: "bg-primary/10" },
  { key: "after_prayer", label: "🕌 After Salah", color: "bg-primary/10" },
  { key: "sleep", label: "😴 Before Sleep", color: "bg-warm/10" },
  { key: "food", label: "🍽️ Food", color: "bg-gold/20" },
  { key: "travel", label: "✈️ Travel", color: "bg-primary/10" },
  { key: "general", label: "🤲 General", color: "bg-muted" },
];

function DuaPage() {
  const [duas, setDuas] = useState<any[]>([]);
  const [active, setActive] = useState("morning");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("duas").select("*").order("display_order").then(({ data }) => setDuas(data ?? []));
  }, []);

  const filtered = duas
    .filter((d) => d.category === active)
    .filter((d) => !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.translation.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <Heart size={26} className="text-primary" /> Dua & Adhkar
          </h1>
          <p className="text-muted-foreground">Authentic supplications from Quran & Sunnah</p>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-9" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                active === c.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No duas in this category.</p>
          ) : filtered.map((d) => (
            <div key={d.id} className="glass rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-heading font-semibold text-foreground">{d.title}</h3>
                {d.recommended_count > 1 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                    × {d.recommended_count}
                  </span>
                )}
              </div>
              <p className="text-2xl text-right leading-loose text-foreground" dir="rtl" lang="ar">{d.arabic}</p>
              {d.transliteration && <p className="text-sm italic text-muted-foreground">{d.transliteration}</p>}
              <p className="text-sm text-foreground">{d.translation}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">📖 {d.reference}</span>
                {d.recommended_count > 1 && (
                  <Link to="/tasbih" className="text-primary hover:underline">Count with Tasbih →</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
