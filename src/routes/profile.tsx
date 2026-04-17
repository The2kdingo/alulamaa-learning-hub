import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, BookOpen, Award, Clock } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — AlUlamaa Academy" },
      { name: "description", content: "Manage your AlUlamaa Academy profile and track your learning progress." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (data) {
      setProfile({
        full_name: data.full_name ?? "",
        email: data.email ?? "",
        bio: data.bio ?? "",
        avatar_url: data.avatar_url ?? "",
      });
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    const ext = file.name.split(".").pop();
    const path = `${session.user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error("Upload failed — make sure the 'profile-pictures' bucket exists.");
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("profile-pictures").getPublicUrl(path);
    setProfile((p) => ({ ...p, avatar_url: publicUrl }));
    toast.success("Photo uploaded!");
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      })
      .eq("id", session.user.id);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated successfully!");
  };

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6 text-center">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-muted mx-auto border-4 border-primary/20">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center text-3xl text-primary-foreground font-heading font-bold">
                  {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
              <Camera size={16} className="text-primary-foreground" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <h2 className="mt-4 text-xl font-heading font-bold text-foreground">{profile.full_name || "Student"}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Courses", value: "0", icon: BookOpen },
            { label: "Hours", value: "0", icon: Clock },
            { label: "Quizzes", value: "0", icon: Award },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <Icon size={20} className="text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Profile Form */}
        <div className="glass rounded-2xl p-6 md:p-8 space-y-5">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Profile Details</h3>

          <div>
            <Label className="text-foreground">Full Name</Label>
            <Input
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="mt-1.5 bg-background/50"
            />
          </div>

          <div>
            <Label className="text-foreground">Email</Label>
            <Input value={profile.email} disabled className="mt-1.5 bg-background/30 opacity-70" />
          </div>

          <div>
            <Label className="text-foreground">Bio</Label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              placeholder="Tell us about yourself..."
              className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <Button onClick={handleSave} variant="hero" size="lg" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
