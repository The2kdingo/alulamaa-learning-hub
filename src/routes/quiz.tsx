import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Award, Plus, Sparkles, Edit, Share2, Eye, Trash2 } from "lucide-react";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quizzes — AlUlamaa Academy" },
      { name: "description", content: "Generate AI Islamic quizzes or build them by hand." },
    ],
  }),
  component: QuizPage,
});

type QQ = { question: string; options: string[]; correct_index: number; explanation?: string };

function QuizPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"mine" | "ai" | "manual">("mine");
  const [myQuizzes, setMyQuizzes] = useState<any[]>([]);

  // AI form
  const [ai, setAi] = useState({ title: "", context: "", count: 15 });
  const [aiBusy, setAiBusy] = useState(false);

  // Manual form
  const [manual, setManual] = useState({ title: "", questions: [] as QQ[] });

  useEffect(() => {
    loadMine();
  }, []);

  const loadMine = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from("quizzes").select("*").eq("created_by", session.user.id).order("created_at", { ascending: false });
    setMyQuizzes(data ?? []);
  };

  const generateAi = async () => {
    if (!ai.title || ai.context.length < 100) {
      toast.error("Title and at least 100 characters of context required");
      return;
    }
    setAiBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Sign in first"); setAiBusy(false); return; }
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(ai),
      });
      if (resp.status === 429) { toast.error("Rate limit, try again shortly"); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted"); return; }
      if (!resp.ok) { toast.error("Generation failed"); return; }
      const { questions } = await resp.json();
      const { data: created, error } = await supabase.from("quizzes").insert({
        title: ai.title,
        questions,
        context: ai.context,
        created_by: session.user.id,
        is_manual: false,
      }).select("public_slug").single();
      if (error) { toast.error(error.message); return; }
      toast.success(`Generated ${questions.length} questions!`);
      navigate({ to: "/q/$slug", params: { slug: created.public_slug ?? "" } });
    } finally { setAiBusy(false); }
  };

  const addManualQuestion = () => {
    setManual((m) => ({ ...m, questions: [...m.questions, { question: "", options: ["", "", "", ""], correct_index: 0 }] }));
  };

  const saveManual = async () => {
    if (!manual.title || manual.questions.length === 0) { toast.error("Need title + questions"); return; }
    const valid = manual.questions.every((q) => q.question && q.options.every((o) => o));
    if (!valid) { toast.error("Fill all questions and options"); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Sign in"); return; }
    const { data: created, error } = await supabase.from("quizzes").insert({
      title: manual.title,
      questions: manual.questions,
      created_by: session.user.id,
      is_manual: true,
    }).select("public_slug").single();
    if (error) { toast.error(error.message); return; }
    toast.success("Quiz created!");
    navigate({ to: "/q/$slug", params: { slug: created.public_slug ?? "" } });
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/q/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm("Delete this quiz?")) return;
    await supabase.from("quizzes").delete().eq("id", id);
    loadMine();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground">Quizzes</h1>
          <p className="text-muted-foreground">Create AI or manual quizzes; share via public link</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { k: "mine", label: "My Quizzes", icon: Award },
            { k: "ai", label: "AI Generate", icon: Sparkles },
            { k: "manual", label: "Manual Create", icon: Edit },
          ].map(({ k, label, icon: Icon }) => (
            <button
              key={k}
              onClick={() => setTab(k as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                tab === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {tab === "mine" && (
          <div className="space-y-3">
            {myQuizzes.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Award size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No quizzes yet — create one above.</p>
              </div>
            ) : myQuizzes.map((q) => {
              const questions = (q.questions as any[]) ?? [];
              return (
                <div key={q.id} className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{q.title}</p>
                    <p className="text-xs text-muted-foreground">{questions.length} questions • {q.is_manual ? "manual" : "AI-generated"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/q/$slug" params={{ slug: q.public_slug }}>
                      <Button size="sm" variant="outline"><Eye size={14} /> View</Button>
                    </Link>
                    <Link to="/q/$slug/results" params={{ slug: q.public_slug }}>
                      <Button size="sm" variant="outline">Results</Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => copyLink(q.public_slug)}><Share2 size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteQuiz(q.id)}><Trash2 size={14} className="text-destructive" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "ai" && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-heading font-semibold flex items-center gap-2"><Sparkles size={18} className="text-primary" /> AI Quiz Generator</h2>
            <div>
              <Label>Lesson Title</Label>
              <Input value={ai.title} onChange={(e) => setAi({ ...ai, title: e.target.value })} className="mt-1.5" placeholder="e.g. The Five Pillars of Islam" />
            </div>
            <div>
              <Label>Lesson Context (paste 100+ chars)</Label>
              <textarea
                value={ai.context}
                onChange={(e) => setAi({ ...ai, context: e.target.value })}
                rows={8}
                className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm resize-none"
                placeholder="Paste the lesson text here. The AI will generate questions only from this content."
              />
              <p className="text-xs text-muted-foreground mt-1">{ai.context.length} characters</p>
            </div>
            <div>
              <Label>Number of questions (15-20)</Label>
              <Input type="number" min={15} max={20} value={ai.count} onChange={(e) => setAi({ ...ai, count: Number(e.target.value) })} className="mt-1.5 w-32" />
            </div>
            <Button onClick={generateAi} disabled={aiBusy} variant="hero" className="w-full">
              {aiBusy ? "Generating…" : <>✨ Generate Quiz</>}
            </Button>
          </div>
        )}

        {tab === "manual" && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-heading font-semibold flex items-center gap-2"><Edit size={18} /> Create Quiz Manually</h2>
            <div>
              <Label>Quiz Title</Label>
              <Input value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} className="mt-1.5" />
            </div>
            <div className="space-y-4">
              {manual.questions.map((q, i) => (
                <div key={i} className="bg-background/40 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <Label>Question {i + 1}</Label>
                    <button
                      onClick={() => setManual({ ...manual, questions: manual.questions.filter((_, idx) => idx !== i) })}
                      className="text-xs text-destructive"
                    >Remove</button>
                  </div>
                  <Input
                    value={q.question}
                    onChange={(e) => {
                      const qs = [...manual.questions];
                      qs[i] = { ...qs[i], question: e.target.value };
                      setManual({ ...manual, questions: qs });
                    }}
                    placeholder="Question text"
                  />
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${i}`}
                        checked={q.correct_index === oi}
                        onChange={() => {
                          const qs = [...manual.questions];
                          qs[i] = { ...qs[i], correct_index: oi };
                          setManual({ ...manual, questions: qs });
                        }}
                      />
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const qs = [...manual.questions];
                          const opts = [...qs[i].options];
                          opts[oi] = e.target.value;
                          qs[i] = { ...qs[i], options: opts };
                          setManual({ ...manual, questions: qs });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={addManualQuestion} variant="outline" className="flex-1"><Plus size={16} /> Add Question</Button>
              <Button onClick={saveManual} variant="hero" className="flex-1">Save Quiz</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
