import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { hazardClips, type HazardClip } from "@/data/hazardClips";
import { Eye, Play, RotateCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/hazard-perception")({
  head: () => ({ meta: [{ title: "Hazard perception · GSM" }] }),
  component: HazardPage,
});

function HazardPage() {
  const [active, setActive] = useState<HazardClip | null>(null);

  const { data: attempts = [] } = useQuery({
    queryKey: ["hazard_attempts"],
    queryFn: async () => {
      const { data } = await supabase.from("hazard_perception_attempts").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const avg = attempts.length ? (attempts.reduce((s, a) => s + a.score, 0) / attempts.length).toFixed(1) : "—";
  const best = attempts.reduce((m, a) => Math.max(m, a.score), 0);

  if (active) return <PortalShell eyebrow="Hazard perception" title={active.title}><ClipPractice clip={active} onExit={() => setActive(null)} /></PortalShell>;

  return (
    <PortalShell eyebrow="Practice on real West London clips" title="Hazard perception">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Clips practised" value={String(attempts.length)} />
        <Stat label="Average score" value={`${avg} / 5`} accent />
        <Stat label="Personal best" value={`${best} / 5`} />
      </div>

      <div className="mt-10 border-l-4 border-accent bg-card p-5">
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
        {hazardClips.map((c) => {
          const myAttempts = attempts.filter((a) => a.clip_slug === c.slug);
          const bestScore = myAttempts.reduce((m, a) => Math.max(m, a.score), 0);
          return (
            <button key={c.slug} onClick={() => setActive(c)} className="group flex flex-col bg-card p-5 text-left transition-colors hover:bg-secondary">
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
