import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Search, Play, Loader2, Sparkles } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listAiVideos,
  recordAiVideoView,
  type AiVideoRow,
} from "@/lib/ai-videos.functions";

export const Route = createFileRoute("/_authenticated/ai-videos")({
  head: () => ({
    meta: [
      { title: "AI Video Library · GSM PLUS+" },
      {
        name: "description",
        content: "Approved AI-generated driving videos to accelerate your learning.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const listFn = useServerFn(listAiVideos);
  const viewFn = useServerFn(recordAiVideoView);

  const [search, setSearch] = useState("");
  const [transmission, setTransmission] = useState("any");
  const [difficulty, setDifficulty] = useState("any");
  const [tag, setTag] = useState("");
  const [playing, setPlaying] = useState<AiVideoRow | null>(null);

  const query = useMemo(
    () => ({
      scope: "public" as const,
      search: search.trim() || undefined,
      transmission: transmission === "any" ? undefined : (transmission as "any"),
      difficulty: difficulty === "any" ? undefined : (difficulty as "beginner"),
      tag: tag.trim() || undefined,
    }),
    [search, transmission, difficulty, tag],
  );

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["ai-videos-public", query],
    queryFn: () => listFn({ data: query }),
  });

  const openVideo = (v: AiVideoRow) => {
    setPlaying(v);
    viewFn({ data: { id: v.id } }).catch(() => {});
  };

  return (
    <PortalShell eyebrow="GSM PLUS+" title="AI Video Library">
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Curated, admin-approved AI videos matched to the GSM syllabus. Learn a
        skill visually, then practise it with your instructor.
      </p>

      <Card className="mb-6">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Search
            </Label>
            <div className="relative mt-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Roundabouts, mirrors, MSPSL…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Difficulty
            </Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="test_ready">Test-ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Transmission
            </Label>
            <Select value={transmission} onValueChange={setTransmission}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Tag
            </Label>
            <Input
              className="mt-1"
              placeholder="e.g. mirrors, junctions, parking"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading videos…
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
          <Sparkles className="mx-auto mb-2 h-5 w-5" />
          No videos match your filters yet. Try widening the search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => openVideo(v)}
              className="group overflow-hidden rounded-lg border border-border/60 bg-card text-left transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg"
            >
              <div className="relative aspect-video bg-muted">
                {v.poster_url ? (
                  <img src={v.poster_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Play className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                  <Play className="h-12 w-12 text-white opacity-0 transition group-hover:opacity-100" />
                </div>
              </div>
              <div className="p-3">
                <div className="line-clamp-2 text-sm font-medium">{v.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {v.transmission} · {v.difficulty}
                  {v.view_count ? ` · ${v.view_count} views` : ""}
                </div>
                {v.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {v.tags.slice(0, 4).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{playing?.title}</DialogTitle>
          </DialogHeader>
          {playing && (
            <div className="space-y-3">
              <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
                {playing.provider === "youtube" && playing.youtube_id ? (
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${playing.youtube_id}?autoplay=1`}
                    allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : playing.video_url ? (
                  <video
                    src={playing.video_url}
                    controls
                    autoPlay
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white">
                    Video unavailable
                  </div>
                )}
              </div>
              {playing.description && (
                <p className="text-sm text-muted-foreground">{playing.description}</p>
              )}
              {playing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {playing.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}