import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Image as ImageIcon,
  Film,
  FileText,
  Loader2,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import {
  listMediaAssets,
  uploadMediaAsset,
  deleteMediaAsset,
  type MediaAsset,
} from "@/lib/media-library.functions";

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: MediaLibraryPage,
});

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result ?? "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

function formatBytes(n: number) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function typeIcon(mime: string | null) {
  if (!mime) return ImageIcon;
  if (mime.startsWith("video/")) return Film;
  if (mime.startsWith("image/")) return ImageIcon;
  return FileText;
}

function MediaLibraryPage() {
  const qc = useQueryClient();
  const list = useServerFn(listMediaAssets);
  const upload = useServerFn(uploadMediaAsset);
  const del = useServerFn(deleteMediaAsset);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "images" | "video" | "other">("all");
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-media-library"],
    queryFn: () => list({ data: {} }),
  });

  const deleteMut = useMutation({
    mutationFn: (path: string) => del({ data: { path } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-media-library"] }),
  });

  const filtered = useMemo<MediaAsset[]>(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((a) => {
      if (q && !a.name.toLowerCase().includes(q) && !a.path.toLowerCase().includes(q))
        return false;
      if (filter === "images") return (a.mime ?? "").startsWith("image/");
      if (filter === "video") return (a.mime ?? "").startsWith("video/");
      if (filter === "other")
        return !((a.mime ?? "").startsWith("image/") || (a.mime ?? "").startsWith("video/"));
      return true;
    });
  }, [data, query, filter]);

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const arr = Array.from(files);
    setUploading({ done: 0, total: arr.length });
    try {
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        const base64 = await fileToBase64(f);
        await upload({
          data: {
            filename: f.name,
            content_type: f.type || "application/octet-stream",
            base64,
          },
        });
        setUploading({ done: i + 1, total: arr.length });
      }
      await qc.invalidateQueries({ queryKey: ["admin-media-library"] });
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <AdminShell eyebrow="Website & content" title="Media library">
      <p className="-mt-3 mb-6 max-w-2xl text-sm text-muted-foreground">
        Upload, browse and delete every image, video and file used across the website and app. Any
        URL you copy here can be pasted into the Homepage sections, Lessons or Blog editors.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!!uploading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading {uploading.done}/{uploading.total}…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload files
            </>
          )}
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filename or path"
              className="w-56 rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm"
            />
          </div>
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            {(["all", "images", "video", "other"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1.5 text-xs font-medium capitalize ${
                  filter === k
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load media: {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading media…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No files match. Upload something to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((a) => {
            const Icon = typeIcon(a.mime);
            const isImage = (a.mime ?? "").startsWith("image/");
            const isVideo = (a.mime ?? "").startsWith("video/");
            return (
              <div
                key={a.path}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm"
              >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted/40">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.url}
                      alt={a.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : isVideo ? (
                    <video
                      src={a.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground" title={a.name}>
                      {a.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(a.size)} · {a.mime ?? "file"}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => copyUrl(a.url)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium hover:bg-accent/5"
                      title="Copy URL"
                    >
                      {copied === a.url ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy URL
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${a.name}"? This cannot be undone.`)) {
                          deleteMut.mutate(a.path);
                        }
                      }}
                      disabled={deleteMut.isPending}
                      className="rounded-md border border-destructive/40 bg-background px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">Note:</strong> alt text, tags and version history are
        coming in Phase 2. For now, use short descriptive filenames — the filename is what search
        engines and screen readers see.
      </div>
    </AdminShell>
  );
}