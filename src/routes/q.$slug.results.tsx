import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";

export const Route = createFileRoute("/q/$slug/results")({
  head: () => ({ meta: [{ title: "Quiz Results — AlUlamaa Academy" }] }),
  component: ResultsPage,
});

function ResultsPage() {
  const { slug } = Route.useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: q } = await supabase.from("quizzes").select("*").eq("public_slug", slug).maybeSingle();
      setQuiz(q);
      if (q) {
        const { data: a } = await supabase
          .from("public_quiz_attempts")
          .select("*")
          .eq("quiz_id", q.id)
          .order("score", { ascending: false });
        setAttempts(a ?? []);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/quiz" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft size={14} /> Back to Quizzes
        </Link>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-1">{quiz?.title || "Quiz"} — Results</h1>
        <p className="text-sm text-muted-foreground mb-6">{attempts.length} participants</p>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : attempts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Trophy size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No one has taken this quiz yet.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/q/${slug}`);
              }}
            >
              Copy share link
            </Button>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary/10">
                <tr>
                  <th className="text-left px-4 py-2 text-foreground">#</th>
                  <th className="text-left px-4 py-2 text-foreground">Name</th>
                  <th className="text-right px-4 py-2 text-foreground">Score</th>
                  <th className="text-right px-4 py-2 text-foreground">When</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => (
                  <tr key={a.id} className="border-t border-border/30">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-foreground">{a.participant_name}</td>
                    <td className="px-4 py-2 text-right text-foreground">{a.score}/{a.total} ({Math.round((a.score / a.total) * 100)}%)</td>
                    <td className="px-4 py-2 text-right text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
