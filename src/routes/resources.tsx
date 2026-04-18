import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { FileText, ChevronRight, BookmarkCheck, Award } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — AlUlamaa Academy" },
      { name: "description", content: "Browse PDF lessons across Islamic subjects." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, { opened: boolean; quiz_generated: boolean }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: lessonsData } = await supabase.from("lessons").select("*").order("subject");
      setLessons(lessonsData ?? []);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: progData } = await supabase.from("lesson_progress").select("*").eq("user_id", session.user.id);
        const map: Record<string, any> = {};
        progData?.forEach((p) => { map[p.lesson_id] = { opened: true, quiz_generated: p.quiz_generated }; });
        setProgress(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const grouped = lessons.reduce<Record<string, any[]>>((acc, l) => {
    (acc[l.subject] ||= []).push(l);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground">PDF lessons across all subjects</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : lessons.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <FileText size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No lessons uploaded yet. Check back soon, in shaa Allah.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([subject, items]) => (
              <div key={subject}>
                <h2 className="font-heading font-semibold text-lg text-foreground mb-3">{subject}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((l) => {
                    const p = progress[l.id];
                    return (
                      <Link
                        key={l.id}
                        to="/lesson/$id"
                        params={{ id: l.id }}
                        className="glass rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{l.title}</p>
                            {l.description && <p className="text-xs text-muted-foreground truncate">{l.description}</p>}
                            <div className="flex gap-2 mt-1 text-[10px]">
                              {p?.opened && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1"><BookmarkCheck size={10} /> Opened</span>}
                              {p?.quiz_generated && <span className="px-1.5 py-0.5 rounded bg-gold/20 text-foreground flex items-center gap-1"><Award size={10} /> Quiz made</span>}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
