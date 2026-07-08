import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { theoryCategories } from "@/data/theory";
import { signs } from "@/data/signs";
import { roadMarkings } from "@/data/roadMarkings";
import { policeSignals } from "@/data/policeSignals";
import { drivingClips } from "@/components/driving-clips/clips";

// Static index of Highway Code essentials sections. Each `id` matches the
// anchor `id` added to the corresponding <Panel> in HighwayCodeEssentials.
const essentialsSections = [
  { id: "road-studs", title: "Road studs (Rule 132)", keywords: "red amber white green studs cats eyes central reservation hard shoulder slip road" },
  { id: "hierarchy", title: "Hierarchy of road users (Rules H1–H3)", keywords: "H1 H2 H3 hierarchy pedestrian cyclist priority junction" },
  { id: "stopping-distances", title: "Stopping distances (Rule 126)", keywords: "stopping distance thinking braking two second rule wet dry ice mph" },
  { id: "traffic-lights", title: "Traffic lights & crossings (Rules 175, 195–199)", keywords: "traffic light red amber green flashing pelican puffin toucan filter" },
  { id: "zebra-crossings", title: "Zebra crossings (Rules 19, 195, H2)", keywords: "zebra crossing belisha beacon zig zag pedestrian give way" },
  { id: "yellow-box", title: "Yellow box junctions (Rule 174)", keywords: "yellow box junction turning right exit clear" },
  { id: "nearside-offside", title: "Turning right — nearside vs offside (Rules 176–181)", keywords: "turning right nearside offside crossroads oncoming traffic" },
  { id: "rule-181", title: "More Rule 181 scenarios", keywords: "rule 181 turning right junction" },
  { id: "smart-motorway", title: "Smart motorway gantry signs (Rules 258, 261)", keywords: "smart motorway gantry red x variable speed all lanes running hard shoulder" },
  { id: "speed-limits", title: "Vehicle speed limits (Rule 124)", keywords: "speed limit national mph car van motorbike bus lorry dual carriageway motorway" },
];

type Hit = { href: string; title: string; snippet: string; group: string; score: number };

function scoreMatch(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (!n) return 0;
  const tokens = n.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const t of tokens) {
    const i = h.indexOf(t);
    if (i === -1) return 0;
    // Word-boundary matches score higher; earlier matches score higher.
    const boundary = i === 0 || /[^a-z0-9]/.test(h[i - 1]);
    score += boundary ? 3 : 1;
    score += Math.max(0, 2 - i / 40);
  }
  return score;
}

export function PortalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd/Ctrl + K opens the search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return null;
    const hits: Hit[] = [];

    for (const s of essentialsSections) {
      const sc = scoreMatch(`${s.title} ${s.keywords}`, q);
      if (sc > 0) hits.push({ href: `/highway-code#${s.id}`, title: s.title, snippet: "Highway Code essentials", group: "Highway Code", score: sc });
    }
    for (const c of theoryCategories) {
      const sc = scoreMatch(`${c.title} ${c.description} ${c.topics.join(" ")} ${c.keyPoints.join(" ")}`, q);
      if (sc > 0) hits.push({ href: `/highway-code#topic-${c.slug}`, title: c.title, snippet: c.description, group: "DVSA topics", score: sc });
    }
    for (const s of signs) {
      const sc = scoreMatch(`${s.name} ${s.meaning} ${s.category}`, q);
      if (sc > 0) hits.push({ href: `/road-signs?q=${encodeURIComponent(s.name)}`, title: s.name, snippet: s.meaning, group: "Road signs", score: sc });
    }
    for (const m of roadMarkings) {
      const sc = scoreMatch(`${m.name} ${m.meaning}`, q);
      if (sc > 0) hits.push({ href: `/road-markings?q=${encodeURIComponent(m.name)}`, title: m.name, snippet: m.meaning, group: "Road markings", score: sc });
    }
    for (const p of policeSignals) {
      const sc = scoreMatch(`${p.name} ${p.meaning}`, q);
      if (sc > 0) hits.push({ href: `/police-signals?q=${encodeURIComponent(p.name)}`, title: p.name, snippet: p.meaning, group: "Arm signals", score: sc });
    }
    for (const c of drivingClips) {
      const sc = scoreMatch(`${c.title} ${c.rule} ${c.summary} ${c.beats.map((b) => b.label + " " + b.detail).join(" ")}`, q);
      if (sc > 0) hits.push({ href: `/driving-clips#${c.slug}`, title: c.title, snippet: c.summary, group: "Practical strategy videos", score: sc });
    }

    hits.sort((a, b) => b.score - a.score);
    const byGroup = new Map<string, Hit[]>();
    for (const h of hits.slice(0, 40)) {
      const arr = byGroup.get(h.group) ?? [];
      arr.push(h);
      byGroup.set(h.group, arr);
    }
    return byGroup;
  }, [q]);

  const go = (href: string) => {
    setOpen(false);
    // Split off hash if present so scroll works after navigation.
    const [pathAndQuery, hash] = href.split("#");
    const [path, query] = pathAndQuery.split("?");
    navigate({ to: path, search: query ? Object.fromEntries(new URLSearchParams(query)) as never : undefined, hash });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 border border-border bg-background px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Search GSM Plus"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1">Search Highway Code, signs…</span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Try: roundabout, amber light, bus lane, stopping distance, zebra…"
          value={q}
          onValueChange={setQ}
        />
        <CommandList>
          {results && results.size === 0 && (
            <CommandEmpty>No matches. Try a different word.</CommandEmpty>
          )}
          {!results && (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">What can I look up?</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Highway Code sections (e.g. <em>zebra</em>, <em>road studs</em>, <em>stopping distance</em>)</li>
                <li>Any of the 14 DVSA theory topics</li>
                <li>Road signs by name or meaning (<em>no entry</em>, <em>national speed limit</em>)</li>
                <li>Road markings and police / arm signals</li>
              </ul>
            </div>
          )}
          {results &&
            Array.from(results.entries()).map(([group, hits]) => (
              <CommandGroup key={group} heading={group}>
                {hits.map((h) => (
                  <CommandItem
                    key={`${group}-${h.href}`}
                    value={`${group}-${h.title}-${h.href}`}
                    onSelect={() => go(h.href)}
                    className="flex flex-col items-start gap-0.5"
                  >
                    <span className="font-medium">{h.title}</span>
                    {h.snippet && (
                      <span className="line-clamp-1 text-xs text-muted-foreground">{h.snippet}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}