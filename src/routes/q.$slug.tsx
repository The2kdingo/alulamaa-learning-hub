import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Award, ArrowRight, RefreshCw, Share2 } from "lucide-react";

export const Route = createFileRoute("/q/$slug")({
  head: () => ({ meta: [{ title: "Quiz — AlUlamaa Academy" }] }),
  component: PublicQuizPage,
});

type QQ = { question: string; options: string[]; correct_index: number; explanation?: string };

function PublicQuizPage() {
  const { slug } = Route.useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    supabase.from("quizzes").select("*").eq("public_slug", slug).maybeSingle()
      .then(({ data }) => setQuiz(data));
  }, [slug]);

  const questions: QQ[] = (quiz?.questions as any[]) ?? [];

  const start = () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    setStarted(true);
    setAnswers(new Array(questions.length).fill(-1));
  };

  const select = (i: number) => {
    const next = [...answers];
    next[step] = i;
    setAnswers(next);
  };

  const submit = async () => {
    const correct = answers.reduce((acc, ans, i) => acc + (ans === questions[i].correct_index ? 1 : 0), 0);
    setScore(correct);
    setDone(true);
    await supabase.from("public_quiz_attempts").insert({
      quiz_id: quiz.id,
      participant_name: name.trim(),
      answers,
      score: correct,
      total: questions.length,
    });
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  if (!quiz) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  if (!started) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--gradient-warm)" }}>
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
        <Award size={48} className="text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-heading font-bold text-foreground">{quiz.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{questions.length} questions</p>
        <div className="mt-6 space-y-3 text-left">
          <Input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background/50"
          />
          <Button onClick={start} variant="hero" size="lg" className="w-full">Start Quiz <ArrowRight size={16} /></Button>
          <Button onClick={shareLink} variant="ghost" size="sm" className="w-full"><Share2 size={14} /> Share Link</Button>
        </div>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--gradient-warm)" }}>
      <div className="glass rounded-2xl p-8 max-w-2xl w-full">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full gradient-primary mx-auto flex items-center justify-center text-3xl font-bold text-primary-foreground">
            {Math.round((score / questions.length) * 100)}%
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-4">Barakallahu feek, {name}!</h2>
          <p className="text-muted-foreground">You scored {score} out of {questions.length}</p>
        </div>

        <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
          {questions.map((q, i) => {
            const userAns = answers[i];
            const right = userAns === q.correct_index;
            return (
              <div key={i} className={`bg-background/40 rounded-lg p-3 border-l-4 ${right ? "border-primary" : "border-destructive"}`}>
                <p className="font-medium text-sm text-foreground">{i + 1}. {q.question}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your answer: <span className={right ? "text-primary" : "text-destructive"}>{q.options[userAns] ?? "—"}</span>
                </p>
                {!right && <p className="text-xs text-primary mt-0.5">Correct: {q.options[q.correct_index]}</p>}
                {q.explanation && <p className="text-xs text-muted-foreground italic mt-1">{q.explanation}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => { setDone(false); setStarted(false); setStep(0); setName(""); }} variant="outline" className="flex-1">
            <RefreshCw size={14} /> Take Again
          </Button>
          <Link to="/" className="flex-1"><Button variant="hero" className="w-full">Home</Button></Link>
        </div>
      </div>
    </div>
  );

  const q = questions[step];
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--gradient-warm)" }}>
      <div className="glass rounded-2xl p-6 md:p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-medium text-muted-foreground">Question {step + 1} / {questions.length}</span>
          <div className="h-1.5 bg-muted rounded-full flex-1 ml-4 overflow-hidden">
            <div className="h-full gradient-primary" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
        <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4">{q.question}</h2>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => select(i)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                answers[step] === i
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background/40 text-foreground hover:border-primary/50"
              }`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="flex-1">Previous</Button>
          {step < questions.length - 1 ? (
            <Button variant="hero" disabled={answers[step] === -1} onClick={() => setStep((s) => s + 1)} className="flex-1">
              Next <ArrowRight size={16} />
            </Button>
          ) : (
            <Button variant="hero" disabled={answers[step] === -1} onClick={submit} className="flex-1">Submit</Button>
          )}
        </div>
      </div>
    </div>
  );
}
