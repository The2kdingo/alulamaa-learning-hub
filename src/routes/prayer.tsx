import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Compass, MapPin, Calendar, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "Prayer Times & Qibla — AlUlamaa Academy" },
      { name: "description", content: "Daily prayer times, Qibla direction, and Hijri calendar." },
    ],
  }),
  component: PrayerPage,
});

const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

function PrayerPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState<string>("");
  const [times, setTimes] = useState<Record<string, string> | null>(null);
  const [hijri, setHijri] = useState<string>("");
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Load saved settings
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { askLocation(); return; }
      const { data } = await supabase.from("prayer_settings").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data?.latitude && data?.longitude) {
        setCoords({ lat: data.latitude, lng: data.longitude });
        setCity(data.city || "");
        setNotifEnabled(data.notifications_enabled ?? false);
      } else {
        askLocation();
      }
    })();
  }, []);

  const askLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        // reverse geocode (free, no key)
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${c.lat}&lon=${c.lng}&format=json`);
          const j = await r.json();
          const cityName = j.address?.city || j.address?.town || j.address?.village || j.address?.state || "Your location";
          setCity(cityName);
        } catch {}
        // save settings if logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from("prayer_settings").upsert({
            user_id: session.user.id,
            latitude: c.lat,
            longitude: c.lng,
            city,
          });
        }
      },
      () => toast.error("Could not get location"),
    );
  };

  // Fetch prayer times via Aladhan
  useEffect(() => {
    if (!coords) return;
    (async () => {
      try {
        const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
        const r = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.lat}&longitude=${coords.lng}&method=2`);
        const j = await r.json();
        setTimes(j.data.timings);
        const h = j.data.date.hijri;
        setHijri(`${h.day} ${h.month.en} ${h.year} AH`);
      } catch {
        toast.error("Failed to load prayer times");
      }
    })();
  }, [coords]);

  // Compute Qibla bearing (from coordinates, Kaaba lat/lng = 21.4225, 39.8262)
  useEffect(() => {
    if (!coords) return;
    const φ1 = (coords.lat * Math.PI) / 180;
    const φ2 = (21.4225 * Math.PI) / 180;
    const Δλ = ((39.8262 - coords.lng) * Math.PI) / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    setQiblaBearing(((θ * 180) / Math.PI + 360) % 360);
  }, [coords]);

  // Compass heading
  useEffect(() => {
    const handler = (e: any) => {
      if (typeof e.alpha === "number") setHeading(360 - e.alpha);
    };
    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, []);

  const toggleNotifications = async () => {
    if (!notifEnabled) {
      if (!("Notification" in window)) { toast.error("Notifications not supported"); return; }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { toast.error("Permission denied"); return; }
      toast.success("Notifications enabled (works while app is open)");
    }
    const next = !notifEnabled;
    setNotifEnabled(next);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from("prayer_settings").upsert({
        user_id: session.user.id,
        notifications_enabled: next,
        latitude: coords?.lat,
        longitude: coords?.lng,
        city,
      });
    }
  };

  // Notify on prayer time
  useEffect(() => {
    if (!notifEnabled || !times) return;
    const check = setInterval(() => {
      const n = new Date();
      const hhmm = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
      PRAYERS.forEach((p) => {
        if (times[p]?.startsWith(hhmm)) {
          new Notification(`${p} time`, { body: `It's time for ${p} prayer.` });
        }
      });
    }, 30000);
    return () => clearInterval(check);
  }, [notifEnabled, times]);

  const arrow = qiblaBearing !== null ? qiblaBearing - heading : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Prayer & Qibla</h1>
            <p className="text-muted-foreground flex items-center gap-1 text-sm mt-1">
              <MapPin size={14} /> {city || "Set your location"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={askLocation}>Update Location</Button>
            <Button variant={notifEnabled ? "hero" : "outline"} size="sm" onClick={toggleNotifications}>
              {notifEnabled ? <Bell size={14} /> : <BellOff size={14} />} Adhan
            </Button>
          </div>
        </div>

        {/* Hijri calendar card */}
        <div className="glass rounded-2xl p-5 flex items-center gap-3">
          <Calendar size={24} className="text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-lg font-heading font-semibold text-foreground">
              {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-sm text-primary">{hijri || "Loading…"}</p>
          </div>
        </div>

        {/* Prayer times */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-heading font-semibold text-lg mb-3">Prayer Times</h2>
          {!times ? (
            <p className="text-muted-foreground text-sm">{coords ? "Loading…" : "Allow location to view prayer times."}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRAYERS.map((p) => (
                <div key={p} className="bg-background/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">{p}</p>
                  <p className="text-lg font-heading font-semibold text-foreground">{times[p]}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Qibla compass */}
        <div className="glass rounded-2xl p-5 text-center">
          <h2 className="font-heading font-semibold text-lg mb-3 flex items-center justify-center gap-2">
            <Compass size={18} className="text-primary" /> Qibla Direction
          </h2>
          {qiblaBearing === null ? (
            <p className="text-muted-foreground text-sm">Set location to view Qibla.</p>
          ) : (
            <>
              <div className="relative w-56 h-56 mx-auto rounded-full border-4 border-primary/30 bg-background/40 flex items-center justify-center">
                <div
                  className="absolute w-1.5 h-24 bg-primary rounded-full origin-bottom"
                  style={{
                    bottom: "50%",
                    transform: `translateX(-50%) rotate(${arrow}deg)`,
                    transformOrigin: "50% 100%",
                    left: "50%",
                  }}
                />
                <div className="text-xs text-muted-foreground absolute top-2">N</div>
                <div className="text-xs text-muted-foreground absolute bottom-2">S</div>
                <div className="text-xs text-muted-foreground absolute left-2">W</div>
                <div className="text-xs text-muted-foreground absolute right-2">E</div>
                <div className="absolute text-2xl">🕋</div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Bearing: <span className="text-foreground font-medium">{qiblaBearing.toFixed(1)}°</span> from North
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Compass requires a device with magnetometer. iOS may prompt for permission.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
