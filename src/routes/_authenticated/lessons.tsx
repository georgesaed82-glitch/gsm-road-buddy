import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PortalShell } from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/lessons")({
  head: () => ({ meta: [{ title: "Lessons & progress · GSM" }] }),
  component: LessonsPage,
});

const skillMilestones = [
  { name: "Cockpit drill & controls", target: 1 },
  { name: "Moving off & stopping", target: 2 },
  { name: "Junctions (left & right)", target: 4 },
  { name: "Roundabouts", target: 6 },
  { name: "Bay parking", target: 8 },
  { name: "Parallel parking", target: 10 },
  { name: "Pull up on the right", target: 11 },
  { name: "Forward bay park", target: 12 },
  { name: "Independent driving", target: 14 },
  { name: "Mock test routes", target: 18 },
];

function LessonsPage() {
  const { data: bookings = [] } = useQuery({
    queryKey: ["all-bookings"],
    queryFn: async () => {
      const { data } = await supabase.from("lesson_bookings").select("*").order("scheduled_at", { ascending: false });
      return data ?? [];
    },
  });

  const completed = bookings.filter((b) => b.status === "completed").length;
  const upcoming = bookings.filter((b) => new Date(b.scheduled_at) > new Date() && b.status === "scheduled");
  const history = bookings.filter((b) => b.status === "completed" || new Date(b.scheduled_at) <= new Date());
  const allSkills = new Set<string>(bookings.flatMap((b) => b.skills_covered ?? []));

  return (
    <PortalShell eyebrow="Your journey" title="Lessons & progress">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="font-display text-2xl">Skills roadmap</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Standard DVSA syllabus. Each milestone unlocks as your instructor marks it after a lesson.
          </p>
          <ol className="mt-6 border border-border bg-card">
            {skillMilestones.map((m, i) => {
              const reached = allSkills.has(m.name) || completed >= m.target;
              return (
                <li key={m.name} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    reached ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                  }`}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>{m.name}</div>
                    <div className="text-xs text-muted-foreground">Typically by lesson {m.target}</div>
                  </div>
                  {reached && <Badge className="bg-success text-success-foreground">Mastered</Badge>}
                </li>
              );
            })}
          </ol>

          <h2 className="mt-12 font-display text-2xl">Lesson history</h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Your completed lessons will appear here with your instructor's notes.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border border border-border bg-card">
              {history.map((b) => (
                <li key={b.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-foreground">
                        {new Date(b.scheduled_at).toLocaleDateString("en-GB", { dateStyle: "full" })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.instructor_name} · {b.duration_minutes} minutes
                      </div>
                    </div>
                    {b.rating && (
                      <div className="flex text-accent">
                        {Array.from({ length: b.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent" />)}
                      </div>
                    )}
                  </div>
                  {b.skills_covered && b.skills_covered.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {b.skills_covered.map((s: string) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                  {b.instructor_notes && (
                    <p className="mt-3 border-l-2 border-accent pl-3 text-sm italic text-muted-foreground">
                      "{b.instructor_notes}"
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-5">
          <div className="border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Snapshot</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="Completed" value={String(completed)} />
              <Stat label="Upcoming" value={String(upcoming.length)} />
              <Stat label="Skills" value={String(allSkills.size)} />
              <Stat label="Total" value={String(bookings.length)} />
            </div>
          </div>
          <div className="border border-border bg-primary p-5 text-primary-foreground">
            <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">Next milestone</div>
            <div className="mt-2 font-display text-xl">Mock test ready</div>
            <p className="mt-2 text-sm opacity-80">
              Most learners reach this around 20 hours. Your instructor will book a 90-minute mock when you're close.
            </p>
          </div>
        </aside>
      </div>
    </PortalShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl text-foreground">{value}</div>
    </div>
  );
}
