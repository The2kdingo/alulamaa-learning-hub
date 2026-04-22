import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/Page/AnnotationLayer.css"; // SSR ignore
// import "react-pdf/dist/Page/TextLayer.css"; // SSR ignore
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download, Highlighter, Share2, Sparkles, ArrowLeft } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const Route = createFileRoute("/lesson/$id")({
  head: () => ({ meta: [{ title: "Lesson — AlUlamaa Academy" }] }),
  component: LessonPage,
});

function LessonPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [selection, setSelection] = useState("");
  const [topic, setTopic] = useState("");
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [generating, setGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: lessonData } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
      if (!lessonData) { toast.error("Lesson not found"); return; }
      setLesson(lessonData);

      const { data: signed } = await supabase.storage.from("lesson-pdfs").createSignedUrl(lessonData.pdf_path, 3600);
      if (signed?.signedUrl) setPdfUrl(signed.signedUrl);

      // Track lesson open
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("lesson_progress").upsert(
          { user_id: session.user.id, lesson_id: id, opened_at: new Date().toISOString() },
          { onConflict: "user_id,lesson_id" }
        );
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection?.()?.toString().trim();
      if (sel && sel.length > 5 && containerRef.current?.contains(window.getSelection()?.anchorNode ?? null)) {
        setSelection(sel);
        setShowSaveBar(true);
      }
    };
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, []);

  const handleSaveHighlight = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Sign in to save highlights"); return; }
    const { error } = await supabase.from("saved_highlights").insert({
      user_id: session.user.id,
      lesson_id: id,
      topic: topic || null,
      selected_text: selection,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Highlight saved!");
      setShowSaveBar(false);
      setTopic("");
    }
  };

  const handleShare = async () => {
    const text = `${topic ? topic + "\n\n" : ""}${selection}\n\n— from ${lesson?.title || "AlUlamaa Academy"}`;
    if (navigator.share) {
      try { await navigator.share({ title: lesson?.title, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selection || selection.length < 50) {
      toast.error("Select at least 50 characters of context first");
      return;
    }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${process.env.SUPABASE_URL!}/functions/v1/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY!}`,
        },
        body: JSON.stringify({ title: topic || lesson?.title || "Lesson", context: selection, count: 15 }),
      });
      if (resp.status === 429) { toast.error("Rate limit hit, try again in a moment"); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted — top up in workspace settings"); return; }
      if (!resp.ok) { toast.error("Failed to generate quiz"); return; }

      const { questions } = await resp.json();
      if (!session) { toast.error("Sign in to save the quiz"); return; }

      const { data: created, error } = await supabase.from("quizzes").insert({
        title: topic || `${lesson?.title} — Quiz`,
        questions,
        context: selection,
        lesson_id: id,
        created_by: session.user.id,
        is_manual: false,
      }).select("public_slug").single();

      if (error) { toast.error(error.message); return; }

      // Mark progress
      await supabase.from("lesson_progress").upsert(
        { user_id: session.user.id, lesson_id: id, quiz_generated: true },
        { onConflict: "user_id,lesson_id" }
      );

      toast.success(`Generated ${questions.length} questions!`);
      navigate({ to: "/q/$slug", params: { slug: created.public_slug ?? "" } });
    } catch (e: any) {
      toast.error(e.message ?? "Error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link to="/resources" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft size={14} /> Back to Resources
        </Link>

        {lesson && (
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-primary font-medium">{lesson.subject}</p>
              <h1 className="text-2xl font-heading font-bold text-foreground">{lesson.title}</h1>
              {lesson.description && <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>}
            </div>
            {pdfUrl && (
              <a href={pdfUrl} download={`${lesson.title}.pdf`}>
                <Button variant="outline"><Download size={16} /> Download</Button>
              </a>
            )}
          </div>
        )}

        {/* Selection action bar */}
        {showSaveBar && selection && (
          <div className="glass rounded-xl p-4 mb-4 sticky top-20 z-10 space-y-3 border-2 border-primary/30">
            <div className="flex items-start gap-2">
              <Highlighter size={16} className="text-primary mt-1 shrink-0" />
              <p className="text-sm text-foreground line-clamp-2 flex-1">"{selection}"</p>
              <button onClick={() => setShowSaveBar(false)} className="text-muted-foreground hover:text-foreground text-xs">×</button>
            </div>
            <Input
              placeholder="Topic name (optional)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-background/50"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleSaveHighlight}>Save Highlight</Button>
              <Button size="sm" variant="outline" onClick={handleShare}><Share2 size={14} /> Share</Button>
              <Button size="sm" variant="hero" onClick={handleGenerateQuiz} disabled={generating}>
                <Sparkles size={14} /> {generating ? "Generating…" : "Generate Quiz"}
              </Button>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div ref={containerRef} className="glass rounded-2xl p-4 flex flex-col items-center">
          {!pdfUrl ? (
            <p className="text-muted-foreground py-12">Loading PDF…</p>
          ) : (
            <>
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<p className="text-muted-foreground py-12">Loading…</p>}
                error={<p className="text-destructive py-12">Failed to load PDF</p>}
              >
                <Page
                  pageNumber={pageNumber}
                  width={Math.min(900, (typeof window !== "undefined" ? window.innerWidth : 800) - 80)}
                />
              </Document>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="outline" size="sm"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => p - 1)}
                ><ChevronLeft size={16} /> Prev</Button>
                <span className="text-sm text-muted-foreground">Page {pageNumber} / {numPages}</span>
                <Button
                  variant="outline" size="sm"
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                >Next <ChevronRight size={16} /></Button>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-3">
          💡 Tip: Select text in the PDF to save a highlight, share it, or generate a quiz from it.
        </p>
      </div>
    </div>
  );
}
