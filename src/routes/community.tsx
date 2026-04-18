import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Megaphone, MessageCircle, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — AlUlamaa Academy" },
      { name: "description", content: "Read announcements and share your reflections with the community." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const [tab, setTab] = useState<"feed" | "announcements">("feed");
  const [posts, setPosts] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [postContent, setPostContent] = useState("");
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setMe(session?.user.id ?? null));
    load();
  }, []);

  const load = async () => {
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from("community_posts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setPosts(p ?? []);
    setAnnouncements(a ?? []);
  };

  const submitPost = async () => {
    if (!postContent.trim()) return;
    if (!me) { toast.error("Sign in to post"); return; }
    const { error } = await supabase.from("community_posts").insert({ user_id: me, content: postContent.trim() });
    if (error) toast.error(error.message);
    else { setPostContent(""); toast.success("Posted!"); load(); }
  };

  const deletePost = async (id: string) => {
    await supabase.from("community_posts").delete().eq("id", id);
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Community</h1>
        <p className="text-muted-foreground mb-5">Share thoughts and read announcements</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("feed")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "feed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <MessageCircle size={16} /> Feed
          </button>
          <button
            onClick={() => setTab("announcements")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "announcements" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <Megaphone size={16} /> Announcements
          </button>
        </div>

        {tab === "feed" && (
          <>
            <div className="glass rounded-2xl p-4 mb-5 space-y-2">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={3}
                placeholder="Share a thought, reflection, or question..."
                className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm resize-none"
              />
              <Button onClick={submitPost} variant="hero" size="sm"><Send size={14} /> Post</Button>
            </div>
            <div className="space-y-3">
              {posts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Be the first to share something!</p>
              ) : posts.map((p) => (
                <div key={p.id} className="glass rounded-xl p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{p.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</span>
                    {p.user_id === me && (
                      <button onClick={() => deletePost(p.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "announcements" && (
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No announcements yet.</p>
            ) : announcements.map((a) => (
              <div key={a.id} className="glass rounded-xl p-4 border-l-4 border-primary">
                <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                  <Megaphone size={16} className="text-primary" /> {a.title}
                </h3>
                {a.body && <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{a.body}</p>}
                <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
