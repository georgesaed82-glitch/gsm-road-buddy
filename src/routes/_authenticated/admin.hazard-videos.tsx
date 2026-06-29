import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { hazardClips, type HazardClip } from "@/data/hazardClips";
import { toast } from "sonner";
import { Upload, Trash2, RefreshCcw, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hazard-videos")({
  head: () => ({ meta: [{ title: "Hazard videos · Admin" }] }),
  component: HazardVideosAdmin,
});

const BUCKET = "hazard-clips";
const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

type ClipVideoRow = {
  clip_slug: string;
  video_path: string;
  poster_path: string | null;
  updated_at: string;
};

function HazardVideosAdmin() {
  const queryClient = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-hazard-videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hazard_clip_videos").select("*");
      if (error) throw error;
      return (data ?? []) as ClipVideoRow[];
    },
  });

  const rowBySlug = new Map(rows.map((r) => [r.clip_slug, r]));
  const uploadedCount = rows.length;

  return (
    <AdminShell eyebrow="Library" title="Hazard perception videos">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Clip slots" value={String(hazardClips.length)} />
        <Stat label="Videos uploaded" value={`${uploadedCount} / ${hazardClips.length}`} accent />
        <Stat label="Storage" value="Private bucket" />
      </div>

      <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
        Upload an MP4 (H.264 recommended, under 200 MB) for each clip slot below. Learners see a "coming soon" placeholder until a video is uploaded. You can replace or remove a video at any time.
      </p>

      <div className="mt-8 grid gap-4">
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {hazardClips.map((clip) => (
          <ClipRow
            key={clip.slug}
            clip={clip}
            row={rowBySlug.get(clip.slug)}
            onChanged={() => queryClient.invalidateQueries({ queryKey: ["admin-hazard-videos"] })}
          />
        ))}
      </div>
    </AdminShell>
  );
}

function ClipRow({ clip, row, onChanged }: { clip: HazardClip; row?: ClipVideoRow; onChanged: () => void }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!row?.video_path) {
      setSignedUrl(null);
      return;
    }
    supabase.storage.from(BUCKET).createSignedUrl(row.video_path, 3600).then(({ data }) => {
      if (!cancelled && data?.signedUrl) setSignedUrl(data.signedUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [row?.video_path]);

  const onPick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file (MP4 recommended).");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File is over 200 MB. Compress it and try again.");
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${clip.slug}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      setProgress(80);

      const { data: userData } = await supabase.auth.getUser();
      const { error: rowErr } = await supabase.from("hazard_clip_videos").upsert({
        clip_slug: clip.slug,
        video_path: path,
        updated_by: userData.user?.id ?? null,
        updated_at: new Date().toISOString(),
      });
      if (rowErr) throw rowErr;

      // Best-effort: remove the previous file
      if (row?.video_path && row.video_path !== path) {
        await supabase.storage.from(BUCKET).remove([row.video_path]);
      }

      setProgress(100);
      toast.success(`Uploaded video for "${clip.title}"`);
      onChanged();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const onRemove = async () => {
    if (!row) return;
    if (!confirm(`Remove the video for "${clip.title}"? Learners will see the placeholder again.`)) return;
    try {
      await supabase.storage.from(BUCKET).remove([row.video_path]);
      const { error } = await supabase.from("hazard_clip_videos").delete().eq("clip_slug", clip.slug);
      if (error) throw error;
      toast.success("Video removed");
      onChanged();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Remove failed";
      toast.error(msg);
    }
  };

  const hasVideo = Boolean(row?.video_path);

  return (
    <div className="grid gap-4 border border-border bg-card p-4 md:grid-cols-[260px_1fr] md:p-5">
      <div className="aspect-video w-full overflow-hidden bg-primary/90">
        {signedUrl ? (
          <video src={signedUrl} controls preload="metadata" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-primary-foreground/80">
            <span className="text-[10px] uppercase tracking-[0.22em] opacity-70">No video yet</span>
            <span className="text-xs opacity-60">{clip.durationSeconds}s · {clip.difficulty}</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg text-foreground">{clip.title}</h3>
          {hasVideo ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Live
            </Badge>
          ) : (
            <Badge variant="outline">Empty</Badge>
          )}
          <Badge variant="outline">{clip.difficulty}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{clip.scenario}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Developing hazard: <span className="text-foreground">{clip.developingHazard}</span>
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          Slug: {clip.slug}
          {row?.updated_at && <> · Updated {new Date(row.updated_at).toLocaleDateString("en-GB")}</>}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/*"
            className="hidden"
            onChange={onFile}
          />
          <Button onClick={onPick} disabled={uploading} className="rounded-none">
            {hasVideo ? <RefreshCcw className="mr-2 h-3.5 w-3.5" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : hasVideo ? "Replace video" : "Upload MP4"}
          </Button>
          {hasVideo && !uploading && (
            <Button onClick={onRemove} variant="outline" className="rounded-none">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove
            </Button>
          )}
          {uploading && (
            <div className="h-1.5 w-32 overflow-hidden bg-secondary">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
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