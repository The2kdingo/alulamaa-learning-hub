import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileText, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — AlUlamaa Academy" }],
  }),
  component: AdminPage,
});

const subjects = ["Quranic Studies", "Hadith", "Fiqh", "Aqidah", "Seerah", "Arabic", "Tafseer", "Islamic History"];

function AdminPage() {
  const { isAdmin, loading } = useUserRole();
  const [users, setUsers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, lessons: 0, quizzes: 0, attempts: 0 });
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ subject: subjects[0], title: "", description: "", file: null as File | null });
  const [announcement, setAnnouncement] = useState({ title: "", body: "" });

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    const [{ data: profilesData }, { data: lessonsData }, { count: quizCount }, { count: attemptsCount }] =
      await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }),
        supabase.from("lessons").select("*").order("created_at", { ascending: false }),
        supabase.from("quizzes").select("id", { count: "exact", head: true }),
        supabase.from("public_quiz_attempts").select("id", { count: "exact", head: true }),
      ]);
    setUsers(profilesData ?? []);
    setLessons(lessonsData ?? []);
    setStats({
      users: profilesData?.length ?? 0,
      lessons: lessonsData?.length ?? 0,
      quizzes: quizCount ?? 0,
      attempts: attemptsCount ?? 0,
    });
  };

  const handleUpload = async () => {
    if (!form.file || !form.title) {
      toast.error("Title and PDF file are required");
      return;
    }
    setUploading(true);
    try {
      const path = `${form.subject}/${Date.now()}-${form.file.name}`;
      const { error: uploadErr } = await supabase.storage.from("lesson-pdfs").upload(path, form.file);
      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase.from("lessons").insert({
        subject: form.subject,
        title: form.title,
        description: form.description || null,
        pdf_path: path,
      });
      if (insertErr) throw insertErr;
      toast.success("Lesson uploaded!");
      setForm({ subject: subjects[0], title: "", description: "", file: null });
      loadData();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteLesson = async (id: string, path: string) => {
    if (!confirm("Delete this lesson?")) return;
    await supabase.storage.from("lesson-pdfs").remove([path]);
    await supabase.from("lessons").delete().eq("id", id);
    toast.success("Deleted");
    loadData();
  };

  const sendAnnouncement = async () => {
    if (!announcement.title) return toast.error("Title required");
    const { error } = await supabase.from("announcements").insert({
      title: announcement.title,
      body: announcement.body,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Announcement sent!");
      setAnnouncement({ title: "", body: "" });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar /><div className="p-12 text-center text-muted-foreground">Loading…</div></div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-md mx-auto mt-20 p-8 text-center glass rounded-2xl">
        <h2 className="text-xl font-heading font-bold mb-2">Admin Only</h2>
        <p className="text-muted-foreground mb-4">You don't have admin access. Sign in with the admin account to manage content.</p>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage lessons, users, and announcements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Users", value: stats.users },
            { label: "Lessons", value: stats.lessons },
            { label: "Quizzes", value: stats.quizzes },
            { label: "Quiz Attempts", value: stats.attempts },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Upload Lesson */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2"><Upload size={18} /> Upload Lesson PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Subject</Label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
              >
                {subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>PDF File</Label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
              className="mt-1.5 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary"
            />
          </div>
          <Button onClick={handleUpload} disabled={uploading} variant="hero" className="w-full">
            {uploading ? "Uploading…" : "Upload Lesson"}
          </Button>
        </div>

        {/* Existing lessons */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2"><FileText size={18} /> Lessons ({lessons.length})</h2>
          {lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lessons yet.</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((l) => (
                <div key={l.id} className="flex items-center justify-between bg-background/40 rounded-lg p-3">
                  <div>
                    <p className="font-medium text-foreground">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.subject}</p>
                  </div>
                  <button onClick={() => deleteLesson(l.id, l.pdf_path)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcement */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg">📢 Send Announcement</h2>
          <Input
            placeholder="Title"
            value={announcement.title}
            onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
          />
          <textarea
            placeholder="Message..."
            value={announcement.body}
            onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm resize-none"
          />
          <Button onClick={sendAnnouncement} variant="hero" className="w-full">Send to All Users</Button>
        </div>

        {/* Users */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">Users ({users.length})</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex justify-between text-sm py-2 border-b border-border/30">
                <span className="text-foreground">{u.full_name || "—"}</span>
                <span className="text-muted-foreground">{u.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
