import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { PortalShell } from "@/components/PortalShell";
import hazardHowItWorksAsset from "@/assets/hazard-how-it-works.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { hazardClips, type HazardClip } from "@/data/hazardClips";
import { Eye, Play, RotateCw, Flag, Settings2, Smartphone, Camera } from "lucide-react";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";

type HapticsSettings = { enabled: boolean; intensity: "low" | "medium" | "high" };
const HAPTICS_STORAGE_KEY = "gsm.haptics.settings";
const DEFAULT_HAPTICS: HapticsSettings = { enabled: true, intensity: "medium" };

function loadHaptics(): HapticsSettings {
  if (typeof window === "undefined") return DEFAULT_HAPTICS;
  try {
    const raw = window.localStorage.getItem(HAPTICS_STORAGE_KEY);
    if (!raw) return DEFAULT_HAPTICS;
    const parsed = JSON.parse(raw) as Partial<HapticsSettings>;
    return {
      enabled: parsed.enabled ?? DEFAULT_HAPTICS.enabled,
      intensity: (parsed.intensity as HapticsSettings["intensity"]) ?? DEFAULT_HAPTICS.intensity,
    };
  } catch {
    return DEFAULT_HAPTICS;
  }
}

function useHapticsSettings() {
  const [settings, setSettings] = useState<HapticsSettings>(DEFAULT_HAPTICS);
  useEffect(() => {
    setSettings(loadHaptics());
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === HAPTICS_STORAGE_KEY) setSettings(loadHaptics());
    };
    const onLocal = () => setSettings(loadHaptics());
    window.addEventListener("storage", onStorage);
    window.addEventListener("gsm:haptics-changed", onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("gsm:haptics-changed", onLocal);
    };
  }, []);
  const update = (next: HapticsSettings) => {
    setSettings(next);
    try {
      window.localStorage.setItem(HAPTICS_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("gsm:haptics-changed"));
    } catch { /* ignore */ }
  };
  return [settings, update] as const;
}

function triggerHaptic(tone: "good" | "warn" | "bad", settings: HapticsSettings) {
  if (!settings.enabled) return;
  try {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    const scale = settings.intensity === "low" ? 0.5 : settings.intensity === "high" ? 1.6 : 1;
    const base =
      tone === "good" ? [18]
      : tone === "warn" ? [12, 60, 12]
      : [50, 40, 50];
    navigator.vibrate(base.map((n, i) => (i % 2 === 0 ? Math.round(n * scale) : n)));
  } catch { /* ignore */ }
}

export const Route = createFileRoute("/_authenticated/hazard-perception")({
  head: () => ({ meta: [{ title: "Hazard perception · GSM" }] }),
  component: HazardPage,
});

function HazardPage() {
  const [active, setActive] = useState<HazardClip | null>(null);

  const { data: clipVideos = {} } = useQuery({
    queryKey: ["hazard_clip_videos_signed"],
    queryFn: async () => {
      const { data: rows } = await supabase.from("hazard_clip_videos").select("clip_slug, video_path, poster_path");
      const map: Record<string, { videoUrl?: string; posterUrl?: string }> = {};
      await Promise.all(
        (rows ?? []).map(async (r) => {
          const { data: signed } = await supabase.storage
            .from("hazard-clips")
            .createSignedUrl(r.video_path, 3600);
          let posterUrl: string | undefined;
          if (r.poster_path) {
            const { data: ps } = await supabase.storage
              .from("hazard-clips")
              .createSignedUrl(r.poster_path, 3600);
            posterUrl = ps?.signedUrl;
          }
          map[r.clip_slug] = { videoUrl: signed?.signedUrl, posterUrl };
        }),
      );
      return map;
    },
    staleTime: 1000 * 60 * 30,
  });

  const enrich = (c: HazardClip): HazardClip => {
    const live = clipVideos[c.slug];
    if (!live?.videoUrl) return c;
    return { ...c, videoUrl: live.videoUrl, posterUrl: live.posterUrl ?? c.posterUrl };
  };

  const { data: attempts = [] } = useQuery({
    queryKey: ["hazard_attempts"],
    queryFn: async () => {
      const { data } = await supabase.from("hazard_perception_attempts").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const avg = attempts.length ? (attempts.reduce((s, a) => s + a.score, 0) / attempts.length).toFixed(1) : "—";
  const best = attempts.reduce((m, a) => Math.max(m, a.score), 0);

  if (active) return <PortalShell eyebrow="Hazard perception" title={active.title}><ClipPractice clip={enrich(active)} onExit={() => setActive(null)} /></PortalShell>;

  return (
    <PortalShell eyebrow="Practice on real West London clips" title="Hazard perception">
      {/* 0 · How it works — reference card at top */}
      <figure className="mb-8 overflow-hidden border border-border bg-card">
        <img
          src={hazardHowItWorksAsset.url}
          alt="How hazard perception works: 30–45 second West London clips, click when you spot a developing hazard, score 5 for early clicks, 0 for a miss."
          className="block h-auto w-full"
          loading="eager"
        />
      </figure>

      {/* 1 · Interactive tutorial */}
      <HazardTutorial />

      {/* 2 · Supporting explainer */}
      <div className="mt-12">
        <HazardExplainer />
      </div>

      {/* 3 · Coming-soon banner + stats immediately before the clip library */}
      <div className="mt-12 overflow-hidden border-2 border-accent bg-gradient-to-r from-primary via-primary to-primary/80 p-6 text-primary-foreground shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-accent">Status update</div>
              <div className="mt-1 font-display text-2xl leading-tight sm:text-3xl">
                Hazard perception from GSM — coming soon
              </div>
              <p className="mt-2 max-w-2xl text-sm opacity-90">
                We're currently building the library from <span className="font-semibold text-accent">real dashcam recordings of live driving situations</span> around West London — Notting Hill, Holland Park, Kensington and beyond. Every clip is a genuine hazard filmed on the road, not stock footage.
              </p>
            </div>
          </div>
          <div className="flex-none rounded-none border border-accent/60 bg-primary-foreground/5 px-4 py-2 text-center">
            <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">Progress</div>
            <div className="mt-1 font-display text-lg">Filming now</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Clips practised" value={String(attempts.length)} />
        <Stat label="Average score" value={`${avg} / 5`} accent />
        <Stat label="Personal best" value={`${best} / 5`} />
      </div>

      <div className="mt-6">
        <OfflineDownloadButton
          sectionKey="hazard-perception"
          label="hazard perception clips"
          urls={[
            "/hazard-perception",
            ...hazardClips.flatMap((c) => [c.videoUrl, c.posterUrl].filter((u): u is string => !!u)),
          ]}
        />
      </div>

      <HapticsSettingsPanel />

      <div className="mt-8 border-l-4 border-accent bg-card p-5">
        <h2 className="font-display text-xl">How it works</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Each clip is a 30–45 second drive recorded around West London. Watch carefully and click the moment you spot a <span className="text-foreground">developing hazard</span>. Score 5 for early, drop to 0 if you miss it. Real DVSA test has 14 clips — practise here to sharpen your timing.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          New clips are being filmed around Notting Hill, Holland Park and Kensington — they'll appear here as soon as they're uploaded.
        </p>
      </div>

      <h2 className="mt-12 font-display text-2xl">Clip library</h2>
      <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
        {hazardClips.map((raw) => {
          const c = enrich(raw);
          const myAttempts = attempts.filter((a) => a.clip_slug === c.slug);
          const bestScore = myAttempts.reduce((m, a) => Math.max(m, a.score), 0);
          return (
            <button key={c.slug} onClick={() => setActive(raw)} className="group flex flex-col bg-card p-5 text-left transition-colors hover:bg-secondary">
              <div className="aspect-video bg-primary text-primary-foreground">
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Play className="h-8 w-8 text-accent transition-transform group-hover:scale-110" />
                  <span className="text-[10px] uppercase tracking-[0.22em] opacity-60">{c.durationSeconds}s · {c.difficulty}</span>
                </div>
              </div>
              <h3 className="mt-4 font-display text-lg text-foreground">{c.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.scenario}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <Badge variant="outline">{c.difficulty}</Badge>
                {myAttempts.length > 0 && (
                  <span className="text-muted-foreground">Best: <span className="font-medium text-foreground">{bestScore}/5</span></span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </PortalShell>
  );
}

function ClipPractice({ clip, onExit }: { clip: HazardClip; onExit: () => void }) {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [clicked, setClicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Developing hazard window: clip-specific, between 55–75% through
  const hazardStart = clip.durationSeconds * 0.55;
  const hazardWindow = clip.durationSeconds * 0.2;

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      setElapsed(t);
      if (t >= clip.durationSeconds) { setRunning(false); setDone(true); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, clip.durationSeconds]);

  const save = useMutation({
    mutationFn: async (payload: { score: number; reaction_ms: number | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("hazard_perception_attempts").insert({
        user_id: user.id,
        clip_slug: clip.slug,
        score: payload.score,
        reaction_ms: payload.reaction_ms,
      });
      queryClient.invalidateQueries({ queryKey: ["hazard_attempts"] });
    },
  });

  const computeScore = (clickTime: number | null) => {
    if (clickTime === null) return 0;
    const diff = clickTime - hazardStart;
    if (diff < 0) return 0; // clicked before hazard started developing
    if (diff > hazardWindow) return 0; // too late
    // Earlier in the window = higher score
    return Math.max(1, Math.round(5 - (diff / hazardWindow) * 4));
  };

  const score = clicked !== null ? computeScore(clicked) : 0;

  const onClickClip = () => {
    if (!running || clicked !== null) return;
    setClicked(elapsed);
    const s = computeScore(elapsed);
    save.mutate({ score: s, reaction_ms: Math.round(elapsed * 1000) });
  };

  const restart = () => { setRunning(false); setElapsed(0); setClicked(null); setDone(false); };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div>
        <button onClick={onExit} className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">← Back to clips</button>
        <div
          onClick={onClickClip}
          className={`relative mt-4 aspect-video w-full overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 ${running && clicked === null ? "cursor-crosshair" : ""}`}
        >
          {clip.videoUrl && running && (
            <video
              src={clip.videoUrl}
              poster={clip.posterUrl}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {/* Simulated dashcam */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!running && !done && (
              <button onClick={() => setRunning(true)} className="flex flex-col items-center gap-3 text-primary-foreground">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
                  <Play className="h-9 w-9 text-accent-foreground" />
                </div>
                <span className="text-sm uppercase tracking-[0.2em] opacity-80">{clip.videoUrl ? "Start clip" : "Start clip (preview)"}</span>
                {!clip.videoUrl && <span className="mt-1 text-[10px] uppercase tracking-[0.2em] opacity-60">Real footage coming soon</span>}
              </button>
            )}
            {running && !clip.videoUrl && (
              <div className="text-center text-primary-foreground/80">
                <Eye className="mx-auto h-10 w-10 text-accent" />
                <div className="mt-3 text-xs uppercase tracking-[0.22em]">Watch the road</div>
                <div className="mt-2 max-w-xs text-sm opacity-80">{clip.scenario}</div>
              </div>
            )}
            {done && (
              <div className="relative z-10 rounded bg-primary/80 p-4 text-center text-primary-foreground backdrop-blur-sm">
                <div className="text-[11px] uppercase tracking-[0.22em] opacity-60">You scored</div>
                <div className="mt-2 font-display text-7xl">{score}<span className="text-3xl opacity-60">/5</span></div>
                <div className="mt-2 text-sm opacity-80">Hazard: {clip.developingHazard}</div>
              </div>
            )}
          </div>
          {/* progress bar */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-primary-foreground/10">
            <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${(elapsed / clip.durationSeconds) * 100}%` }} />
          </div>
          {clicked !== null && !done && (
            <div className="absolute right-3 top-3 bg-accent px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent-foreground">
              Marked
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <Button onClick={restart} variant="outline" className="rounded-none">
            <RotateCw className="mr-2 h-3.5 w-3.5" /> Try again
          </Button>
          <Button onClick={onExit} className="rounded-none">Pick another clip</Button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="border border-border bg-card p-5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">This clip</div>
          <div className="mt-3 space-y-2 text-sm">
            <Row k="Difficulty" v={clip.difficulty} />
            <Row k="Length" v={`${clip.durationSeconds}s`} />
            <Row k="Look for" v={clip.developingHazard} />
          </div>
        </div>
        <div className="border border-border bg-primary p-5 text-primary-foreground">
          <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">Tip</div>
          <p className="mt-2 text-sm opacity-90">
            Click once. The earlier within the developing-hazard window you click, the higher your score. Clicking continuously gets you zero on the real test.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`border border-border p-5 ${accent ? "bg-accent text-accent-foreground" : "bg-card"}`}>
      <div className={`text-[11px] uppercase tracking-[0.18em] ${accent ? "opacity-80" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-3 font-display text-3xl">{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium text-foreground">{v}</span>
    </div>
  );
}

function HazardExplainer() {
  // Animation cycle: countdown 5→0, then hazard develops, then flags plant on clicks
  const CYCLE = 9000; // ms total loop
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(true);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    const tick = () => {
      const now = performance.now();
      const elapsed = (now - startRef.current) % CYCLE;
      setT(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running]);

  // Timeline (ms):
  // 0-3000 : countdown 5..1
  // 3000-3800 : "GO — scan the scene"
  // 3800-5200 : pedestrian appears at kerb (potential hazard)
  // 5200-5400 : click 1 (spotted)
  // 6200-6400 : click 2 (developing)
  // 7000-7200 : click 3 (committed)
  // 7200-9000 : show score 5/5
  const countdownNumber = t < 3000 ? 5 - Math.floor(t / 600) : null; // 5,4,3,2,1
  const pedProgress = t < 3800 ? 0 : Math.min(1, (t - 3800) / 3400); // 0→1 across road
  const click1 = t >= 5200;
  const click2 = t >= 6200;
  const click3 = t >= 7000;
  const showScore = t >= 7200;

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl">Understanding hazard perception</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        A hazard is anything on the road that makes you take action. Learn to spot it early, click it right, and you'll score full marks every time.
      </p>

      {/* The three S's — big and bold */}
      <div className="mt-6 border-2 border-accent bg-card p-6">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">The three S's</div>
        <p className="mt-2 text-sm text-muted-foreground">A hazard is anything that makes you…</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { s: "Slow", d: "Ease off the accelerator or brake — speed must drop." },
            { s: "Stop", d: "Come to a complete stop to avoid a collision." },
            { s: "Swerve", d: "Change direction or lane to steer around danger." },
          ].map((x) => (
            <div key={x.s} className="border border-border bg-background p-4">
              <div className="font-display text-4xl font-bold text-accent sm:text-5xl">{x.s}</div>
              <div className="mt-2 text-xs text-muted-foreground">{x.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated countdown + hazard demo */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Live demo</div>
          <div className="relative mt-2 aspect-video w-full overflow-hidden border border-border bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900">
            {/* Road */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-800">
              {/* lane divider dashes */}
              <div className="absolute left-1/2 top-1/2 h-1 w-full -translate-x-1/2 -translate-y-1/2 bg-[repeating-linear-gradient(to_right,#facc15_0_20px,transparent_20px_40px)] opacity-80" />
              {/* kerbs */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-slate-500" />
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-slate-500" />
            </div>
            {/* Sky area label */}
            <div className="absolute left-3 top-3 text-[10px] uppercase tracking-[0.22em] text-white/60">
              Built-up area · 30 mph
            </div>

            {/* Countdown */}
            {countdownNumber !== null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div key={countdownNumber} className="animate-in fade-in zoom-in-50 duration-300 font-display text-[8rem] leading-none text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
                  {countdownNumber}
                </div>
              </div>
            )}
            {t >= 3000 && t < 3800 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded bg-accent px-4 py-2 font-display text-xl text-accent-foreground">Scan the scene</div>
              </div>
            )}

            {/* Pedestrian crossing the road (the hazard) */}
            {t >= 3800 && (
              <div
                className="absolute bottom-[18%]"
                style={{
                  left: `${20 + pedProgress * 55}%`,
                  transition: "left 60ms linear",
                }}
              >
                <div className="flex flex-col items-center">
                  {/* head */}
                  <div className="h-3 w-3 rounded-full bg-orange-300" />
                  {/* body */}
                  <div className="mt-0.5 h-4 w-2 bg-red-500" />
                  {/* legs */}
                  <div className="mt-0.5 h-3 w-3 bg-blue-600" style={{ clipPath: "polygon(0 0, 40% 0, 40% 100%, 60% 100%, 60% 0, 100% 0, 100% 100%, 0 100%)" }} />
                </div>
              </div>
            )}

            {/* Click flags (planted where the driver clicked) */}
            {click1 && <ClickFlag x="26%" y="60%" label="Click 1" delay={0} />}
            {click2 && <ClickFlag x="46%" y="60%" label="Click 2" delay={0} />}
            {click3 && <ClickFlag x="66%" y="60%" label="Click 3" delay={0} />}

            {/* Score badge */}
            {showScore && (
              <div className="absolute right-3 top-3 animate-in fade-in slide-in-from-top-2 duration-500 border-2 border-accent bg-primary px-3 py-2 text-primary-foreground">
                <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">You scored</div>
                <div className="font-display text-3xl">5<span className="text-base opacity-60">/5</span></div>
              </div>
            )}

            {/* Timeline strip */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
              <div className="h-full bg-accent" style={{ width: `${(t / CYCLE) * 100}%` }} />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <button
              onClick={() => setRunning((r) => !r)}
              className="border border-border px-3 py-1 uppercase tracking-wider hover:bg-secondary"
            >
              {running ? "Pause" : "Play"} demo
            </button>
            <span>Watch the countdown → scan → click once, twice, three times as the hazard develops.</span>
          </div>
        </div>

        {/* Explanation cards */}
        <div className="space-y-4">
          <div className="border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">1 · Use the countdown</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Before every clip a countdown appears (<span className="font-mono">5 · 4 · 3 · 2 · 1</span>). Read the road type — <span className="text-foreground">built-up area, dual carriageway, country lane</span> — and predict what the main hazard could be.
            </p>
          </div>
          <div className="border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">2 · The 1-2-3 click rule</div>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li><span className="text-foreground">Click 1</span> — the moment you first spot the hazard.</li>
              <li><span className="text-foreground">Click 2</span> — when you get near it / it develops.</li>
              <li><span className="text-foreground">Click 3</span> — just before you pass it.</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Three well-spaced clicks guarantee a <span className="text-foreground">5, 4, 3, 2 or 1</span>. Clicking rapidly (spamming) triggers the DVSA cheat detector and gives you <span className="text-foreground">0/5</span>.
            </p>
          </div>
          <div className="border border-border bg-primary p-5 text-primary-foreground">
            <div className="text-[11px] uppercase tracking-[0.22em] opacity-70">3 · Scan like a driver</div>
            <p className="mt-2 text-sm opacity-90">
              Avoid <span className="font-medium">tunnel vision</span>. Sweep left, right, and stretch your eyes far ahead. Anything that could make you <span className="font-medium">slow, stop, or swerve</span> is a hazard in development.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClickFlag({ x, y, label, delay, tone = "good" }: { x: string; y: string; label: string; delay: number; tone?: "good" | "warn" | "bad" }) {
  const bg = tone === "good" ? "bg-accent text-accent-foreground" : tone === "warn" ? "bg-yellow-500 text-black" : "bg-destructive text-destructive-foreground";
  const line = tone === "good" ? "bg-accent" : tone === "warn" ? "bg-yellow-500" : "bg-destructive";
  return (
    <div
      className="absolute animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ left: x, bottom: y, animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center">
        <div className={`flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${bg}`}>
          <Flag className="h-3 w-3" />
          {label}
        </div>
        <div className={`h-6 w-px ${line}`} />
      </div>
    </div>
  );
}

type TutorialPhase = "idle" | "countdown" | "scan" | "hazard" | "done";

function HazardTutorial() {
  const [phase, setPhase] = useState<TutorialPhase>("idle");
  const [haptics] = useHapticsSettings();
  const [countdown, setCountdown] = useState(5);
  const [t, setT] = useState(0); // seconds since hazard started developing
  const [clicks, setClicks] = useState<
    { pct: number; time: number; windowIndex: number; verdict: "perfect" | "early" | "late" | "miss" }[]
  >([]);
  const [toast, setToast] = useState<{ tone: "good" | "warn" | "bad"; text: string } | null>(null);
  const [tooEarly, setTooEarly] = useState(false);
  const [spam, setSpam] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  const HAZARD_DURATION = 5; // seconds pedestrian is crossing
  const WINDOWS = [
    { label: "Click 1 — Spot it", min: 0.2, max: 1.6 },
    { label: "Click 2 — Developing", min: 1.8, max: 3.2 },
    { label: "Click 3 — Committed", min: 3.4, max: 4.8 },
  ];

  // DVSA-style scoring strip: 9 segments across the hazard window.
  // The score value at each timeline moment. Reads: 0 0 5 4 3 2 1 0 0
  const SCORE_SEGMENTS = [0, 0, 5, 4, 3, 2, 1, 0, 0] as const;
  const scoreAt = (time: number) => {
    if (time < 0 || time > HAZARD_DURATION) return 0;
    const idx = Math.min(
      SCORE_SEGMENTS.length - 1,
      Math.floor((time / HAZARD_DURATION) * SCORE_SEGMENTS.length),
    );
    return SCORE_SEGMENTS[idx];
  };

  const showToast = (tone: "good" | "warn" | "bad", text: string) => {
    setToast({ tone, text });
    triggerHaptic(tone, haptics);
    window.setTimeout(() => {
      setToast((cur) => (cur && cur.text === text ? null : cur));
    }, 1400);
  };

  // Countdown effect
  useEffect(() => {
    if (phase !== "countdown") return;
    setCountdown(5);
    const id = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(id);
          setPhase("scan");
          setTimeout(() => setPhase("hazard"), 900);
          return 0;
        }
        return n - 1;
      });
    }, 700);
    return () => clearInterval(id);
  }, [phase]);

  // Hazard timer
  useEffect(() => {
    if (phase !== "hazard") return;
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      setT(elapsed);
      if (elapsed >= HAZARD_DURATION) {
        setPhase("done");
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  const reset = () => {
    setPhase("idle");
    setCountdown(5);
    setT(0);
    setClicks([]);
    setTooEarly(false);
    setSpam(false);
    setToast(null);
  };

  const start = () => {
    reset();
    setTimeout(() => setPhase("countdown"), 60);
  };

  const handleClick = () => {
    if (phase === "countdown" || phase === "scan") {
      setTooEarly(true);
      setTimeout(() => setTooEarly(false), 900);
      showToast("bad", "Too early — wait for the countdown to finish and the hazard to appear.");
      return;
    }
    if (phase !== "hazard") return;
    // spam detection: > 3 clicks within window
    if (clicks.length >= 3) {
      setSpam(true);
      showToast("bad", "Rapid clicking flags the cheat detector — one click per moment only.");
      return;
    }
    // register click — evaluate timing
    // pct matches whichever is the visible hazard at this moment (ball first, then child)
    const currentPct = t < 1.5
      ? 24 + Math.min(1, Math.max(0, (t - 0.6) / (HAZARD_DURATION - 0.6))) * 42
      : 20 + Math.min(1, (t - 1.5) / (HAZARD_DURATION - 1.5)) * 46;
    const pct = currentPct;
    const nextIdx = clicks.length; // 0,1,2 — the click number they're on
    const target = WINDOWS[nextIdx];
    let verdict: "perfect" | "early" | "late" | "miss" = "miss";
    let windowIndex = -1;
    if (t >= target.min && t <= target.max) {
      verdict = "perfect";
      windowIndex = nextIdx;
      const label = ["spotted it", "caught it developing", "timed the pass"][nextIdx];
      showToast("good", `Click ${nextIdx + 1} — perfect timing. You ${label}.`);
    } else if (t < target.min) {
      verdict = "early";
      windowIndex = nextIdx;
      const gap = (target.min - t).toFixed(1);
      showToast(
        "warn",
        `Click ${nextIdx + 1} landed ${gap}s early — wait until the hazard actually develops before clicking.`,
      );
    } else {
      // late — check whether it slipped into the next window
      const nextTarget = WINDOWS[nextIdx + 1];
      if (nextTarget && t >= nextTarget.min && t <= nextTarget.max) {
        verdict = "late";
        windowIndex = nextIdx + 1;
        showToast(
          "warn",
          `You skipped click ${nextIdx + 1} — you're now on click ${nextIdx + 2}. Click sooner next time.`,
        );
      } else {
        verdict = "miss";
        showToast(
          "bad",
          `Missed the window. The hazard was already developing — click the moment you spot movement.`,
        );
      }
    }
    setClicks((c) => [...c, { pct, time: t, windowIndex, verdict }]);
  };

  // Compute score based on which windows were successfully hit
  const hitWindows = new Set(clicks.filter((c) => c.verdict !== "miss").map((c) => c.windowIndex));
  const score = spam
    ? 0
    : Math.min(5, [3, 1, 1].reduce((sum, pts, i) => sum + (hitWindows.has(i) ? pts : 0), 0));

  // Build improvement tips
  const tips: string[] = [];
  if (spam) tips.push("Only click on the actual hazard moments — never spam. The examiner's system detects rhythmic or rapid clicks and zeros the clip.");
  if (clicks.length === 0) tips.push("You didn't click at all. Watch for the pedestrian stepping toward the road — click the second you spot them.");
  if (clicks.some((c) => c.verdict === "early")) tips.push("Early clicks: wait until the hazard is actually developing — a person on the pavement standing still isn't developing yet. The moment they move toward the road, click.");
  if (clicks.some((c) => c.verdict === "miss")) tips.push("Missed clicks: keep your eyes stretched down the road, not just centre-screen. Scan left/right for anything about to make you slow, stop, or swerve.");
  if (!hitWindows.has(0) && !spam) tips.push("You missed the earliest window — that's worth 3 points. Click the instant you first spot the hazard, even if it hasn't fully developed.");
  if (score > 0 && score < 5) tips.push("For a full 5/5, follow the 1-2-3 rule: click when you spot it, click when it develops, click just before you pass it.");
  if (score === 5) tips.push("Textbook timing — three spaced clicks across the developing hazard.");

  const pedProgress = phase === "hazard" ? Math.min(1, t / HAZARD_DURATION) : phase === "done" ? 1 : 0;
  const currentWindow = WINDOWS.findIndex((w) => t >= w.min && t <= w.max);

  // Realistic scene animation values
  const ballAppearT = 0.6;
  const ballProgress = t < ballAppearT ? 0 : Math.min(1, (t - ballAppearT) / (HAZARD_DURATION - ballAppearT));
  const ballX = 24 + ballProgress * 42; // % across screen (behind parked cars → mid-road)
  const ballBounceOffset = t > ballAppearT ? Math.abs(Math.sin((t - ballAppearT) * 6)) * 14 : 0;

  const childAppearT = 1.5;
  const childProgress = t < childAppearT ? 0 : Math.min(1, (t - childAppearT) / (HAZARD_DURATION - childAppearT));
  const childX = 20 + childProgress * 46; // % across screen
  const childRun = childProgress > 0 ? Math.sin((t - childAppearT) * 14) : 0;

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Interactive tutorial</div>
          <h2 className="mt-1 font-display text-2xl">Try it yourself</h2>
        </div>
        <button
          onClick={phase === "idle" ? start : reset}
          className="border border-border bg-card px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-secondary"
        >
          {phase === "idle" ? "Start tutorial" : "Reset"}
        </button>
      </div>

      {/* Steps strip */}
      <ol className="mt-4 grid gap-2 sm:grid-cols-4">
        {[
          { k: "countdown", label: "1. Countdown", desc: "Read the road" },
          { k: "scan", label: "2. Scan", desc: "Predict the hazard" },
          { k: "hazard", label: "3. Click 1·2·3", desc: "Spot → develop → pass" },
          { k: "done", label: "4. Score", desc: "See your marks" },
        ].map((s) => {
          const active = phase === s.k;
          const passed =
            (s.k === "countdown" && ["scan", "hazard", "done"].includes(phase)) ||
            (s.k === "scan" && ["hazard", "done"].includes(phase)) ||
            (s.k === "hazard" && phase === "done");
          return (
            <li
              key={s.k}
              className={`border p-3 transition-colors ${active ? "border-accent bg-accent/10" : passed ? "border-border bg-card" : "border-border bg-background"}`}
            >
              <div className={`text-[11px] uppercase tracking-wider ${active ? "text-accent" : "text-muted-foreground"}`}>{s.label}</div>
              <div className="mt-1 text-sm text-foreground">{s.desc}</div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Stage */}
        <div>
          <div
            onClick={handleClick}
            className={`relative aspect-video w-full overflow-hidden border border-border bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 select-none ${phase === "hazard" ? "cursor-crosshair" : ""}`}
          >
            {/* Driver's POV — SVG-based perspective scene */}
            <svg viewBox="0 0 1000 562" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="skyGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="60%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#fde68a" />
                </linearGradient>
                <linearGradient id="roadGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4b5563" />
                  <stop offset="100%" stopColor="#1f2937" />
                </linearGradient>
                <linearGradient id="bonnetGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="70%" stopColor="#020617" />
                  <stop offset="100%" stopColor="#000000" />
                </linearGradient>
                <radialGradient id="sun" cx="0.75" cy="0.15" r="0.25">
                  <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Sky */}
              <rect x="0" y="0" width="1000" height="320" fill="url(#skyGrad)" />
              <rect x="0" y="0" width="1000" height="320" fill="url(#sun)" />

              {/* Distant hills / haze */}
              <path d="M0 300 Q 200 260 400 285 T 800 275 T 1000 290 L 1000 320 L 0 320 Z" fill="#94a3b8" opacity="0.55" />

              {/* Buildings row (left side, terraced houses) */}
              <g opacity="0.95">
                {[0, 90, 180, 270].map((x, i) => (
                  <g key={`bl${i}`} transform={`translate(${x} 0)`}>
                    <rect x="0" y="200" width="90" height="100" fill={i % 2 === 0 ? "#b45309" : "#c2410c"} />
                    <polygon points="0,200 45,170 90,200" fill="#78350f" />
                    <rect x="15" y="220" width="18" height="22" fill="#1e293b" />
                    <rect x="55" y="220" width="18" height="22" fill="#1e293b" />
                    <rect x="35" y="260" width="20" height="40" fill="#0f172a" />
                  </g>
                ))}
              </g>
              {/* Buildings row (right side) */}
              <g opacity="0.95">
                {[640, 730, 820, 910].map((x, i) => (
                  <g key={`br${i}`} transform={`translate(${x} 0)`}>
                    <rect x="0" y="205" width="85" height="95" fill={i % 2 === 0 ? "#a16207" : "#b45309"} />
                    <polygon points="0,205 42,178 85,205" fill="#78350f" />
                    <rect x="14" y="222" width="16" height="20" fill="#1e293b" />
                    <rect x="50" y="222" width="16" height="20" fill="#1e293b" />
                    <rect x="32" y="255" width="20" height="45" fill="#0f172a" />
                  </g>
                ))}
              </g>

              {/* Pavement / kerb slabs */}
              <polygon points="0,320 380,320 300,470 0,470" fill="#94a3b8" />
              <polygon points="620,320 1000,320 1000,470 700,470" fill="#94a3b8" />
              {/* Kerb edge lines */}
              <line x1="380" y1="320" x2="300" y2="470" stroke="#475569" strokeWidth="2" />
              <line x1="620" y1="320" x2="700" y2="470" stroke="#475569" strokeWidth="2" />

              {/* Road (perspective trapezoid to vanishing point) */}
              <polygon points="380,320 620,320 900,562 100,562" fill="url(#roadGrad)" />

              {/* Centre dashed line, perspective — a few dashes receding to the horizon */}
              {[
                { y1: 340, y2: 360, w1: 4, w2: 6 },
                { y1: 380, y2: 410, w1: 7, w2: 10 },
                { y1: 435, y2: 475, w1: 12, w2: 18 },
                { y1: 500, y2: 555, w1: 22, w2: 32 },
              ].map((d, i) => (
                <polygon
                  key={i}
                  points={`${500 - d.w1 / 2},${d.y1} ${500 + d.w1 / 2},${d.y1} ${500 + d.w2 / 2},${d.y2} ${500 - d.w2 / 2},${d.y2}`}
                  fill="#fde047"
                />
              ))}

              {/* Road edge lines */}
              <line x1="380" y1="320" x2="100" y2="562" stroke="#e5e7eb" strokeWidth="3" opacity="0.85" />
              <line x1="620" y1="320" x2="900" y2="562" stroke="#e5e7eb" strokeWidth="3" opacity="0.85" />

              {/* Parked cars on the LEFT kerb — occlude the ball's origin */}
              <g transform="translate(120 355)">
                {/* red hatchback */}
                <rect x="0" y="20" width="120" height="34" rx="6" fill="#b91c1c" />
                <path d="M15 20 Q 30 0 60 0 L 95 0 Q 108 4 112 20 Z" fill="#7f1d1d" />
                <rect x="18" y="8" width="35" height="14" fill="#0ea5e9" opacity="0.6" />
                <rect x="60" y="8" width="35" height="14" fill="#0ea5e9" opacity="0.6" />
                <circle cx="25" cy="56" r="9" fill="#0f172a" />
                <circle cx="95" cy="56" r="9" fill="#0f172a" />
              </g>
              <g transform="translate(50 400)">
                {/* white van (further back visually? actually larger + closer) */}
                <rect x="0" y="10" width="150" height="52" rx="4" fill="#f1f5f9" />
                <rect x="8" y="18" width="30" height="20" fill="#0ea5e9" opacity="0.6" />
                <rect x="120" y="18" width="22" height="16" fill="#0ea5e9" opacity="0.6" />
                <circle cx="30" cy="66" r="10" fill="#0f172a" />
                <circle cx="125" cy="66" r="10" fill="#0f172a" />
              </g>

              {/* Ball emerging from behind the parked cars */}
              {(phase === "hazard" || phase === "done") && t >= ballAppearT && (
                <g transform={`translate(${ballX * 10} ${455 - ballBounceOffset})`}>
                  <ellipse cx="0" cy="14" rx="14" ry="4" fill="#000" opacity="0.35" />
                  <circle cx="0" cy="0" r="12" fill="#ef4444" />
                  <path d="M-12 0 A 12 12 0 0 1 12 0" fill="none" stroke="#fff" strokeWidth="2" />
                  <circle cx="0" cy="0" r="4" fill="#fff" />
                </g>
              )}

              {/* Child chasing the ball */}
              {(phase === "hazard" || phase === "done") && t >= childAppearT && (
                <g transform={`translate(${childX * 10} 430)`}>
                  {/* shadow */}
                  <ellipse cx="0" cy="45" rx="12" ry="3" fill="#000" opacity="0.35" />
                  {/* legs (running) */}
                  <line x1="0" y1="30" x2={-6 + childRun} y2="44" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                  <line x1="0" y1="30" x2={6 - childRun} y2="44" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                  {/* body / t-shirt */}
                  <rect x="-8" y="10" width="16" height="22" rx="3" fill="#22c55e" />
                  {/* arms (swinging) */}
                  <line x1="-8" y1="14" x2={-14 - childRun} y2="26" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                  <line x1="8" y1="14" x2={14 + childRun} y2="26" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                  {/* head */}
                  <circle cx="0" cy="4" r="7" fill="#fcd34d" />
                  {/* hair */}
                  <path d="M-7 2 Q 0 -5 7 2 L 5 -1 L 0 -3 L -5 -1 Z" fill="#78350f" />
                </g>
              )}

              {/* Driver's bonnet (foreground) */}
              <path d="M 0 562 L 0 510 Q 500 460 1000 510 L 1000 562 Z" fill="url(#bonnetGrad)" />
              {/* windscreen wiper hint */}
              <path d="M 260 505 Q 380 480 500 490" fill="none" stroke="#334155" strokeWidth="3" opacity="0.6" />
              {/* bonnet reflection */}
              <path d="M 100 520 Q 500 495 900 520" fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.7" />
              {/* wing mirrors */}
              <rect x="60" y="500" width="30" height="12" rx="3" fill="#0f172a" />
              <rect x="910" y="500" width="30" height="12" rx="3" fill="#0f172a" />
            </svg>

            <div className="absolute left-3 top-3 text-[10px] uppercase tracking-[0.22em] text-slate-800/70">Residential · 30 mph</div>

            {phase === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white/90">
                <Eye className="h-10 w-10 text-accent" />
                <div className="mt-3 font-display text-xl">Ready when you are</div>
                <div className="mt-1 max-w-xs text-xs text-white/60">Press Start tutorial. Watch the countdown, then click the pedestrian three times as they cross.</div>
              </div>
            )}

            {phase === "countdown" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div key={countdown} className="animate-in fade-in zoom-in-50 duration-300 font-display text-[8rem] leading-none text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
                  {countdown}
                </div>
              </div>
            )}

            {phase === "scan" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-in fade-in duration-300 rounded bg-accent px-4 py-2 font-display text-xl text-accent-foreground">Scan the scene…</div>
              </div>
            )}

            {(phase === "hazard" || phase === "done") && (
              <div
                className="absolute bottom-[18%]"
                style={{ left: `${20 + pedProgress * 55}%`, transition: "left 60ms linear" }}
              >
                {/* pedestrian marker retired — the child + ball are now drawn inside the SVG */}
              </div>
            )}

            {/* User's actual click flags */}
            {clicks.map((c, i) => (
              <ClickFlag
                key={i}
                x={`${c.pct}%`}
                y="42%"
                label={`Click ${i + 1}`}
                tone={c.verdict === "perfect" ? "good" : c.verdict === "early" ? "warn" : "bad"}
                delay={0}
              />
            ))}

            {/* Live click prompt */}
            {phase === "hazard" && currentWindow >= 0 && clicks.length === currentWindow && (
              <div className="absolute left-1/2 top-4 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300 rounded-full border border-accent bg-primary/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                {WINDOWS[currentWindow].label} — click now
              </div>
            )}

            {/* Feedback banners */}
            {tooEarly && (
              <div className="absolute left-1/2 top-4 -translate-x-1/2 animate-in fade-in duration-200 rounded-full bg-destructive px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-destructive-foreground">
                Too early — wait for the hazard
              </div>
            )}
            {toast && phase === "hazard" && (
              <div
                className={`absolute inset-x-4 top-4 animate-in fade-in slide-in-from-top-2 duration-200 rounded px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider shadow-lg ${
                  toast.tone === "good"
                    ? "bg-accent text-accent-foreground"
                    : toast.tone === "warn"
                      ? "bg-yellow-500 text-black"
                      : "bg-destructive text-destructive-foreground"
                }`}
              >
                {toast.text}
              </div>
            )}
            {spam && (
              <div className="absolute inset-x-4 top-4 animate-in fade-in duration-200 rounded bg-destructive px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-destructive-foreground">
                Too many clicks — DVSA cheat detector triggered · 0/5
              </div>
            )}

            {/* Score */}
            {phase === "done" && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/70 backdrop-blur-sm">
                <div className="animate-in fade-in zoom-in-90 duration-500 border-2 border-accent bg-primary p-5 text-center text-primary-foreground">
                  <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">You scored</div>
                  <div className="mt-1 font-display text-6xl">{score}<span className="text-2xl opacity-60">/5</span></div>
                  <div className="mt-2 text-xs opacity-80">{score === 5 ? "Perfect timing." : score >= 3 ? "Good — try clicking earlier." : "Click the moment you spot the hazard."}</div>
                </div>
              </div>
            )}

            {/* Progress bar during hazard */}
            {(phase === "hazard" || phase === "done") && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                <div className="h-full bg-accent" style={{ width: `${pedProgress * 100}%` }} />
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            You're driving through a residential 30. Watch the parked cars on the left. A <span className="text-foreground">ball</span> will bounce out, followed by a <span className="text-foreground">child</span> chasing it. Click once when you first spot the ball, once as the child appears, and once just before they cross. Rapid-clicking will fail you.
          </p>

          {phase === "done" && (
            <div className="mt-4 border border-border bg-card p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Why you scored {score}/5</div>

              {/* DVSA-style score strip replay */}
              <div className="mt-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">DVSA score strip</div>
                  <div className="text-[10px] text-muted-foreground">Read left → right as the hazard unfolds</div>
                </div>
                <div className="relative">
                  <div className="grid grid-cols-9 gap-1">
                    {SCORE_SEGMENTS.map((s, i) => {
                      const clickInSeg = clicks.find((c) => {
                        const segIdx = Math.min(
                          SCORE_SEGMENTS.length - 1,
                          Math.floor((c.time / HAZARD_DURATION) * SCORE_SEGMENTS.length),
                        );
                        return segIdx === i;
                      });
                      const tone =
                        s === 5 ? "bg-emerald-500 text-white"
                        : s === 4 ? "bg-emerald-400 text-black"
                        : s === 3 ? "bg-yellow-400 text-black"
                        : s === 2 ? "bg-orange-400 text-black"
                        : s === 1 ? "bg-orange-500 text-white"
                        : "bg-muted text-muted-foreground";
                      return (
                        <div key={i} className="relative">
                          <div className={`flex h-10 items-center justify-center font-mono text-sm font-bold ${tone} ${clickInSeg ? "ring-2 ring-offset-2 ring-offset-card ring-foreground" : ""}`}>
                            {s}
                          </div>
                          {clickInSeg && (
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-wider text-foreground">
                              ▲ Click {clicks.indexOf(clickInSeg) + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 grid grid-cols-9 gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
                    <span className="col-span-2 text-left">Too early</span>
                    <span className="col-span-5 text-center text-accent">Hazard developing</span>
                    <span className="col-span-2 text-right">Too late</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  This is the pattern the DVSA scoring engine uses on every clip: <span className="font-mono text-foreground">0 0 5 4 3 2 1 0 0</span>. Click in a <span className="text-foreground">0</span> band and you score nothing. Click as the hazard first develops → <span className="text-foreground">5</span>. Every fraction of a second later loses a point.
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Per-click breakdown</div>
              <ul className="mt-3 space-y-2">
                {WINDOWS.map((w, i) => {
                  const hit = clicks.find((c) => c.windowIndex === i);
                  const good = hit && hit.verdict !== "miss";
                  const pts = [3, 1, 1][i];
                  return (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold ${
                          good ? "bg-accent text-accent-foreground" : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {good ? "✓" : "×"}
                      </span>
                      <div>
                        <div className="font-medium text-foreground">
                          {w.label} · {good ? `+${pts}` : "0"} pts
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {good
                            ? `Clicked at ${hit!.time.toFixed(1)}s — inside the ${w.min.toFixed(1)}–${w.max.toFixed(1)}s window.`
                            : hit
                              ? hit.verdict === "early"
                                ? `Clicked at ${hit.time.toFixed(1)}s — ${(w.min - hit.time).toFixed(1)}s too early.`
                                : `Clicked at ${hit.time.toFixed(1)}s — outside the window.`
                              : "You didn't click during this window — 0 points."}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {tips.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">How to improve</div>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-accent">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live stats panel */}
        <aside className="space-y-4">
          <div className="border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Live status</div>
            <div className="mt-3 space-y-2 text-sm">
              <Row k="Phase" v={phase === "idle" ? "Not started" : phase === "countdown" ? `Countdown ${countdown}` : phase === "scan" ? "Scanning" : phase === "hazard" ? "Hazard live" : "Complete"} />
              <Row k="Clicks" v={`${clicks.length} / 3`} />
              <Row k="Score" v={phase === "done" ? `${score} / 5` : "—"} />
            </div>
          </div>

          <div className="border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Click timing</div>
            <ul className="mt-3 space-y-2">
              {WINDOWS.map((w, i) => {
                const registered = clicks[i];
                const active = phase === "hazard" && currentWindow === i && !registered;
                return (
                  <li
                    key={i}
                    className={`flex items-center justify-between border px-3 py-2 text-sm transition-colors ${
                      registered ? "border-accent bg-accent/10 text-foreground" : active ? "border-accent bg-background text-foreground" : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Flag className={`h-3.5 w-3.5 ${registered || active ? "text-accent" : "text-muted-foreground"}`} />
                      {w.label}
                    </span>
                    <span className="font-mono text-xs">
                      {registered ? `${registered.time.toFixed(1)}s` : active ? "now" : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function HapticsSettingsPanel() {
  const [settings, setSettings] = useHapticsSettings();
  const [open, setOpen] = useState(false);
  const supported = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

  const test = (tone: "good" | "warn" | "bad") => triggerHaptic(tone, settings);

  return (
    <div className="mt-6 border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-secondary"
      >
        <span className="flex items-center gap-3">
          <Settings2 className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium">Feedback settings</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Haptics {settings.enabled ? `on · ${settings.intensity}` : "off"}
          </span>
        </span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="border-t border-border p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-secondary">
                <Smartphone className="h-4 w-4 text-accent" />
              </div>
              <div>
                <div className="text-sm font-medium">Mobile haptics</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Short vibrations confirm each click during the tutorial.{" "}
                  {supported ? "Your device supports vibration." : <span className="text-destructive">This browser doesn't support vibration.</span>}
                </p>
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 self-start">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{settings.enabled ? "On" : "Off"}</span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.enabled}
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.enabled ? "bg-accent" : "bg-muted"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${settings.enabled ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </label>
          </div>

          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Intensity</div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((level) => {
                const active = settings.intensity === level;
                return (
                  <button
                    key={level}
                    disabled={!settings.enabled}
                    onClick={() => {
                      setSettings({ ...settings, intensity: level });
                      // give an immediate preview
                      setTimeout(() => triggerHaptic("good", { enabled: true, intensity: level }), 50);
                    }}
                    className={`border px-3 py-2 text-sm capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Low = subtle tap · Medium = default · High = firmer buzz (great in noisy environments).
            </p>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Test the feedback</div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button onClick={() => test("good")} disabled={!settings.enabled} className="border border-accent bg-accent/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground disabled:cursor-not-allowed disabled:opacity-40">Good</button>
              <button onClick={() => test("warn")} disabled={!settings.enabled} className="border border-yellow-500 bg-yellow-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground disabled:cursor-not-allowed disabled:opacity-40">Warn</button>
              <button onClick={() => test("bad")} disabled={!settings.enabled} className="border border-destructive bg-destructive/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground disabled:cursor-not-allowed disabled:opacity-40">Bad</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
