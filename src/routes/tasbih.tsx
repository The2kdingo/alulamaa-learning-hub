import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tasbih")({
  head: () => ({ meta: [{ title: "Tasbih Counter — AlUlamaa Academy" }] }),
  component: TasbihPage,
});

const PRESETS = [
  { dhikr: "SubhanAllah", target: 33 },
  { dhikr: "Alhamdulillah", target: 33 },
  { dhikr: "Allahu Akbar", target: 34 },
  { dhikr: "La ilaha illa Allah", target: 100 },
  { dhikr: "Astaghfirullah", target: 100 },
  { dhikr: "SubhanAllahi wa bihamdihi", target: 100 },
];

function TasbihPage() {
  const [counters, setCounters] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [newDhikr, setNewDhikr] = useState("");
  const [newTarget, setNewTarget] = useState(33);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from("tasbih_counters").select("*").eq("user_id", session.user.id);
    let list = data ?? [];
    // Seed presets if user has none
    if (list.length === 0) {
      const seeded = await Promise.all(PRESETS.map(async (p) => {
        const { data } = await supabase.from("tasbih_counters").insert({
          user_id: session.user.id, dhikr: p.dhikr, target: p.target, count: 0,
        }).select().single();
        return data;
      }));
      list = seeded.filter((x): x is NonNullable<typeof x> => x !== null);
    }
    setCounters(list);
    if (!active && list.length > 0) setActive(list[0]);
  };

  const increment = async () => {
    if (!active) return;
    if (typeof navigator.vibrate === "function") navigator.vibrate(20);
    const newCount = active.count + 1;
    setActive({ ...active, count: newCount });
    setCounters((c) => c.map((x) => (x.id === active.id ? { ...x, count: newCount } : x)));
    await supabase.from("tasbih_counters").update({ count: newCount, updated_at: new Date().toISOString() }).eq("id", active.id);
    if (newCount === active.target) toast.success(`Reached ${active.target}! Barakallahu feek 🤲`);
  };

  const reset = async () => {
    if (!active) return;
    setActive({ ...active, count: 0 });
    setCounters((c) => c.map((x) => (x.id === active.id ? { ...x, count: 0 } : x)));
    await supabase.from("tasbih_counters").update({ count: 0 }).eq("id", active.id);
  };

  const addCustom = async () => {
    if (!newDhikr) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase.from("tasbih_counters").insert({
      user_id: session.user.id, dhikr: newDhikr, target: newTarget, count: 0,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setCounters([...counters, data]);
    setActive(data);
    setNewDhikr("");
  };

  const removeCounter = async (id: string) => {
    await supabase.from("tasbih_counters").delete().eq("id", id);
    const remaining = counters.filter((c) => c.id !== id);
    setCounters(remaining);
    if (active?.id === id) setActive(remaining[0] ?? null);
  };

  if (!active) {
    return (
      <div className="min-h-screen bg-background"><Navbar /><p className="text-center py-20 text-muted-foreground">Please sign in to use Tasbih.</p></div>
    );
  }

  const pct = Math.min(100, (active.count / active.target) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-6">Tasbih Counter</h1>

        {/* Counter selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {counters.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                active.id === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {c.dhikr} ({c.count})
            </button>
          ))}
        </div>

        {/* Counter */}
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-2xl font-heading font-semibold text-foreground mb-1">{active.dhikr}</p>
          <p className="text-sm text-muted-foreground mb-6">Target: {active.target}</p>

          <button
            onClick={increment}
            className="relative w-56 h-56 mx-auto rounded-full gradient-primary shadow-elevated active:scale-95 transition-transform"
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
              <circle
                cx="50" cy="50" r="46" fill="none"
                stroke="oklch(0.82 0.12 85)" strokeWidth="4"
                strokeDasharray={`${(pct / 100) * 289} 289`}
                strokeLinecap="round"
              />
            </svg>
            <span className="relative text-6xl font-bold text-primary-foreground">{active.count}</span>
          </button>

          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" onClick={reset}><RotateCcw size={14} /> Reset</Button>
            <Button variant="ghost" onClick={() => removeCounter(active.id)}><Trash2 size={14} className="text-destructive" /></Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">Tap the circle to count. Vibrates on supported devices.</p>
        </div>

        {/* Add custom */}
        <div className="glass rounded-2xl p-5 mt-6 space-y-3">
          <h2 className="font-heading font-semibold text-foreground">Add Custom Dhikr</h2>
          <Input value={newDhikr} onChange={(e) => setNewDhikr(e.target.value)} placeholder="Dhikr (e.g. La hawla wa la quwwata illa billah)" />
          <div className="flex gap-2">
            <Input type="number" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} className="w-32" />
            <Button onClick={addCustom} variant="hero" className="flex-1"><Plus size={14} /> Add</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
