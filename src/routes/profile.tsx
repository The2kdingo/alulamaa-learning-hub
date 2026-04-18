import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { IslamicLoader } from "@/components/IslamicLoader";
import { toast } from "sonner";
import {
  Camera,
  BookOpen,
  Award,
  Clock,
  LogOut,
  Bell,
  Shield,
  Trash2,
  Lock,
  User as UserIcon,
  Settings as SettingsIcon,
} from "lucide-react";
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
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    bio: "",
    avatar_url: "",
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    prayerReminders: true,
    weeklyDigest: false,
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [stats, setStats] = useState({ courses: 0, hours: 0, quizzes: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id);
        loadStats(session.user.id);
      } else {
        setLoading(false);
      }
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

  const loadStats = async (userId: string) => {
    const [{ count: progressCount }, { count: attemptsCount }] = await Promise.all([
      supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("attempts").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    setStats({
      courses: progressCount ?? 0,
      hours: Math.round(((progressCount ?? 0) * 0.5) * 10) / 10,
      quizzes: attemptsCount ?? 0,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${session.user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error("Upload failed — make sure the 'profile-pictures' bucket exists.");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("profile-pictures").getPublicUrl(path);
    const cacheBusted = `${publicUrl}?t=${Date.now()}`;
    setProfile((p) => ({ ...p, avatar_url: cacheBusted }));
    await supabase.from("profiles").update({ avatar_url: cacheBusted }).eq("id", session.user.id);
    setUploading(false);
    toast.success("Photo updated!");
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
    else toast.success("Profile updated!");
  };

  const handlePasswordChange = async () => {
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordForm.next.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwordForm.next });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated!");
      setPasswordForm({ current: "", next: "", confirm: "" });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out. Until next time!");
    navigate({ to: "/" });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <IslamicLoader size="lg" label="Loading your profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="glass rounded-3xl p-6 md:p-8 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 gradient-hero opacity-90" />
          <div className="relative inline-block mt-8">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-muted mx-auto border-4 border-background shadow-elevated">
              {uploading ? (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <IslamicLoader size="sm" />
                </div>
              ) : profile.avatar_url ? (
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
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { label: "Lessons", value: stats.courses, icon: BookOpen },
            { label: "Hours", value: stats.hours, icon: Clock },
            { label: "Quizzes", value: stats.quizzes, icon: Award },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass rounded-2xl p-4 text-center hover:shadow-elevated transition-shadow">
              <Icon size={20} className="text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-2 w-full glass rounded-xl mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <UserIcon size={14} /> Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon size={14} /> Settings
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-5">
            <div className="glass rounded-2xl p-6 md:p-8 space-y-5">
              <h3 className="font-heading font-semibold text-lg text-foreground">Profile Details</h3>

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
                  className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>

              <Button
                onClick={handleSave}
                size="lg"
                className="w-full gradient-primary text-primary-foreground shadow-gold"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <IslamicLoader size="sm" /> Saving...
                  </span>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-5">
            {/* Notifications */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={18} className="text-primary" />
                <h3 className="font-heading font-semibold text-lg text-foreground">Notifications</h3>
              </div>

              {[
                { key: "emailNotifications" as const, label: "Email notifications", desc: "Receive updates about new lessons and announcements" },
                { key: "prayerReminders" as const, label: "Prayer reminders", desc: "Get notified for the five daily prayers" },
                { key: "weeklyDigest" as const, label: "Weekly digest", desc: "A summary of your weekly learning progress" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(v) => {
                      setSettings((s) => ({ ...s, [key]: v }));
                      toast.success(`${label} ${v ? "enabled" : "disabled"}`);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Password */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={18} className="text-primary" />
                <h3 className="font-heading font-semibold text-lg text-foreground">Change Password</h3>
              </div>

              <div>
                <Label className="text-foreground text-sm">New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  className="mt-1.5 bg-background/50"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="mt-1.5 bg-background/50"
                />
              </div>
              <Button onClick={handlePasswordChange} variant="outline" className="w-full">
                Update Password
              </Button>
            </div>

            {/* Account actions */}
            <div className="glass rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-primary" />
                <h3 className="font-heading font-semibold text-lg text-foreground">Account</h3>
              </div>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <LogOut size={16} /> Sign out
              </Button>

              <Button
                onClick={() => toast.error("Please contact support to delete your account.")}
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 size={16} /> Delete account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
