import { createServerFn } from "@tanstack/react-start";
import { verifyAdminPasswordServer } from "./portal-access.functions";

function dayAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const INTERNAL_HOSTS = new Set([
  "gsmdrivingschool.com",
  "www.gsmdrivingschool.com",
  "gsm-road-buddy.lovable.app",
  "id-preview--075fff9d-63c2-4fd4-8c7b-4bca170e1863.lovable.app",
  "project--075fff9d-63c2-4fd4-8c7b-4bca170e1863.lovable.app",
]);

export function classifyReferrer(ref: string | null | undefined): string {
  if (!ref) return "Direct";
  let host = "";
  try {
    host = new URL(ref).hostname.toLowerCase();
  } catch {
    return "Other";
  }
  if (INTERNAL_HOSTS.has(host) || host.endsWith(".gsmdrivingschool.com")) return "Internal";
  if (/(^|\.)google\./.test(host)) return "Google";
  if (/(^|\.)bing\./.test(host)) return "Bing";
  if (/(^|\.)duckduckgo\./.test(host)) return "DuckDuckGo";
  if (/(^|\.)yahoo\./.test(host)) return "Yahoo";
  if (/(^|\.)(facebook|fb)\./.test(host) || host === "l.facebook.com" || host === "m.facebook.com")
    return "Facebook";
  if (/(^|\.)instagram\./.test(host) || host === "l.instagram.com") return "Instagram";
  if (/(^|\.)tiktok\./.test(host)) return "TikTok";
  if (/(^|\.)(twitter|x)\./.test(host) || host === "t.co") return "Twitter / X";
  if (host.includes("whatsapp")) return "WhatsApp";
  if (/(^|\.)linkedin\./.test(host)) return "LinkedIn";
  if (/(^|\.)youtube\./.test(host) || host === "youtu.be") return "YouTube";
  if (/(^|\.)reddit\./.test(host)) return "Reddit";
  if (host === "lovable.app" || host.endsWith(".lovable.app")) return "Lovable";
  return host;
}

async function adminClient() {
  if (!(await verifyAdminPasswordServer())) {
    throw new Error("Unauthorized");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type AdminOverview = {
  students: number;
  studentsCurrent: number;
  studentsPrevious: number;
  pageViewsTotal: number;
  pageViewsCurrent: number;
  pageViewsPrevious: number;
  portalLogins: number;
  portalLoginsCurrent: number;
  portalLoginsPrevious: number;
  payments: number;
  paidPayments: number;
  paidPaymentsCurrent: number;
  paidPounds: number;
  paidPoundsCurrent: number;
  bookingsTotal: number;
  bookingsUpcoming: number;
  bookingsCompleted: number;
  bookingsCurrent: number;
  bookingsPrevious: number;
  totalAnswered: number;
  totalCorrect: number;
  theoryAccuracy: number;
  topicsPassed: number;
  theoryLearners: number;
  theoryLearnersCurrent: number;
  theoryLearnersPrevious: number;
  reviewsTotal: number;
  reviewsCurrent: number;
  reviewsPrevious: number;
  supportTicketsCurrent: number;
  supportTicketsPrevious: number;
  clicksByChannel: Record<string, number>;
  contactClicksCurrentTotal: number;
  contactClicksPreviousTotal: number;
  topPathsSorted: [string, number][];
  registrationsSeries: { date: string; count: number }[];
  theorySeries: { date: string; count: number }[];
  recentActivity: { type: string; label: string; sub: string; at: string }[];
  topicPerformance: { slug: string; accuracy: number; answers: number }[];
};

export const getAdminOverview = createServerFn({ method: "POST" })
  .inputValidator((d: { rangeDays: number }) => d)
  .handler(async ({ data }): Promise<AdminOverview> => {
    const supabase = await adminClient();
    const range = [7, 30, 90].includes(data.rangeDays) ? data.rangeDays : 30;
    const sinceCurrent = dayAgo(range);
    const sincePrevious = dayAgo(range * 2);

    const [
      profiles,
      profilesCurrent,
      profilesPrevious,
      profilesRecent,
      pageViewsTotal,
      pageViewsCurrent,
      pageViewsPrevious,
      portalLogins,
      portalLoginsCurrent,
      portalLoginsPrevious,
      payments,
      paidPayments,
      paidPaymentsCurrent,
      paidSum,
      paidSumCurrent,
      bookingsTotal,
      bookingsUpcoming,
      bookingsCompleted,
      bookingsCurrent,
      bookingsPrevious,
      bookingsRecent,
      theoryRows,
      theoryRecent,
      theoryCurrent,
      theoryPrevious,
      reviewsCurrent,
      reviewsPrevious,
      supportCurrent,
      supportPrevious,
      contactClicksCurrent,
      contactClicksPrevious,
      contactClicksRecent,
      recentPageViews,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sinceCurrent),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sincePrevious)
        .lt("created_at", sinceCurrent),
      supabase
        .from("profiles")
        .select("id,full_name,created_at")
        .gte("created_at", sinceCurrent)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("page_views").select("id", { count: "exact", head: true }),
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sinceCurrent),
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sincePrevious)
        .lt("created_at", sinceCurrent),
      supabase
        .from("contact_clicks")
        .select("id", { count: "exact", head: true })
        .eq("channel", "portal_view"),
      supabase
        .from("contact_clicks")
        .select("id", { count: "exact", head: true })
        .eq("channel", "portal_view")
        .gte("created_at", sinceCurrent),
      supabase
        .from("contact_clicks")
        .select("id", { count: "exact", head: true })
        .eq("channel", "portal_view")
        .gte("created_at", sincePrevious)
        .lt("created_at", sinceCurrent),
      supabase.from("payments").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "paid"),
      supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("created_at", sinceCurrent),
      supabase.from("payments").select("amount_pence,status"),
      supabase
        .from("payments")
        .select("amount_pence,status")
        .eq("status", "paid")
        .gte("created_at", sinceCurrent),
      supabase.from("lesson_bookings").select("id", { count: "exact", head: true }),
      supabase
        .from("lesson_bookings")
        .select("id", { count: "exact", head: true })
        .gte("scheduled_at", new Date().toISOString()),
      supabase
        .from("lesson_bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("lesson_bookings")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sinceCurrent),
      supabase
        .from("lesson_bookings")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sincePrevious)
        .lt("created_at", sinceCurrent),
      supabase
        .from("lesson_bookings")
        .select("id,duration_minutes,scheduled_at,pickup_location,created_at")
        .gte("created_at", sinceCurrent)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("theory_progress")
        .select(
          "questions_answered,questions_correct,best_score_pct,completed_at,user_id,category_slug,created_at,updated_at",
        ),
      supabase
        .from("theory_progress")
        .select("user_id,category_slug,last_score_pct,best_score_pct,updated_at,completed_at")
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase.from("theory_progress").select("user_id,created_at").gte("created_at", sinceCurrent),
      supabase
        .from("theory_progress")
        .select("user_id,created_at")
        .gte("created_at", sincePrevious)
        .lt("created_at", sinceCurrent),
      supabase
        .from("contact_clicks")
        .select("id", { count: "exact", head: true })
        .eq("channel", "phone")
        .gte("created_at", sinceCurrent),
      supabase
        .from("contact_clicks")
        .select("id", { count: "exact", head: true })
        .eq("channel", "phone")
        .gte("created_at", sincePrevious)
        .lt("created_at", sinceCurrent),
      supabase
        .from("contact_clicks")
        .select("id", { count: "exact", head: true })
        .eq("channel", "email")
        .gte("created_at", sinceCurrent),
      supabase
        .from("contact_clicks")
        .select("id", { count: "exact", head: true })
        .eq("channel", "email")
        .gte("created_at", sincePrevious)
        .lt("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("channel").gte("created_at", sinceCurrent),
      supabase
        .from("contact_clicks")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sincePrevious)
        .lt("created_at", sinceCurrent),
      supabase
        .from("contact_clicks")
        .select("channel,package,page,created_at")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("page_views")
        .select("path,created_at")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const paidPence = (paidSum.data ?? [])
      .filter((p: any) => p.status === "paid")
      .reduce((s: number, p: any) => s + (p.amount_pence ?? 0), 0);
    const paidPenceCurrent = (paidSumCurrent.data ?? []).reduce(
      (s: number, p: any) => s + (p.amount_pence ?? 0),
      0,
    );

    const theory = (theoryRows.data ?? []) as any[];
    const totalAnswered = theory.reduce((s: number, r: any) => s + (r.questions_answered ?? 0), 0);
    const totalCorrect = theory.reduce((s: number, r: any) => s + (r.questions_correct ?? 0), 0);
    const topicsPassed = theory.filter((r: any) => (r.best_score_pct ?? 0) >= 86).length;
    const theoryLearners = new Set(theory.map((r: any) => r.user_id)).size;

    const byTopic = new Map<string, { answers: number; correct: number }>();
    for (const r of theory) {
      const slug = r.category_slug || "unknown";
      const ans = r.questions_answered ?? 0;
      const cor = r.questions_correct ?? 0;
      const cur = byTopic.get(slug) ?? { answers: 0, correct: 0 };
      cur.answers += ans;
      cur.correct += cor;
      byTopic.set(slug, cur);
    }
    const topicPerformance = Array.from(byTopic.entries())
      .filter(([, v]) => v.answers > 0)
      .map(([slug, v]) => ({
        slug,
        answers: v.answers,
        accuracy: Math.round((v.correct / v.answers) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    const clicksByChannel: Record<string, number> = {};
    for (const c of contactClicksCurrent.data ?? []) {
      const ch = (c as any).channel ?? "unknown";
      clicksByChannel[ch] = (clicksByChannel[ch] ?? 0) + 1;
    }

    const topPaths: Record<string, number> = {};
    for (const v of recentPageViews.data ?? []) {
      const p = (v as any).path;
      if (p) topPaths[p] = (topPaths[p] ?? 0) + 1;
    }
    const topPathsSorted = Object.entries(topPaths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6) as [string, number][];

    const buildSeries = (rows: { created_at?: string | null }[]) => {
      const buckets: Record<string, number> = {};
      const today = new Date();
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      for (const r of rows) {
        if (!r.created_at) continue;
        const key = r.created_at.slice(0, 10);
        if (key in buckets) buckets[key] += 1;
      }
      return Object.entries(buckets).map(([date, count]) => ({ date, count }));
    };
    const registrationsSeries = buildSeries((profilesRecent.data ?? []) as any[]);
    const theorySeries = buildSeries((theoryCurrent.data ?? []) as any[]);

    type Activity = { type: string; label: string; sub: string; at: string };
    const activity: Activity[] = [];
    for (const p of (profilesRecent.data ?? []) as any[]) {
      activity.push({
        type: "learner",
        label: "New learner registered",
        sub: p.full_name || "New learner",
        at: p.created_at,
      });
    }
    for (const b of (bookingsRecent.data ?? []) as any[]) {
      const hours = Math.round((b.duration_minutes ?? 60) / 60);
      activity.push({
        type: "booking",
        label: `Lesson booked (${hours}h)`,
        sub: b.pickup_location || "Pickup",
        at: b.created_at,
      });
    }
    for (const t of (theoryRecent.data ?? []) as any[]) {
      if (!t.completed_at && (t.last_score_pct ?? 0) === 0) continue;
      activity.push({
        type: "mock",
        label: t.completed_at ? "Mock test completed" : "Theory topic updated",
        sub: (t.category_slug || "").replace(/-/g, " "),
        at: t.updated_at,
      });
    }
    for (const c of (contactClicksRecent.data ?? []) as any[]) {
      activity.push({
        type: "click",
        label:
          c.channel === "whatsapp"
            ? "WhatsApp enquiry"
            : c.channel === "email"
              ? "Email enquiry"
              : c.channel === "phone"
                ? "Phone enquiry"
                : "Portal opened",
        sub: c.package || c.page || "Website",
        at: c.created_at,
      });
    }
    activity.sort((a, b) => (a.at < b.at ? 1 : -1));
    const recentActivity = activity.slice(0, 12);

    const theoryLearnersCurrent = new Set(
      ((theoryCurrent.data ?? []) as any[]).map((r) => r.user_id),
    ).size;
    const theoryLearnersPrevious = new Set(
      ((theoryPrevious.data ?? []) as any[]).map((r) => r.user_id),
    ).size;

    return {
      students: profiles.count ?? 0,
      studentsCurrent: profilesCurrent.count ?? 0,
      studentsPrevious: profilesPrevious.count ?? 0,
      pageViewsTotal: pageViewsTotal.count ?? 0,
      pageViewsCurrent: pageViewsCurrent.count ?? 0,
      pageViewsPrevious: pageViewsPrevious.count ?? 0,
      portalLogins: portalLogins.count ?? 0,
      portalLoginsCurrent: portalLoginsCurrent.count ?? 0,
      portalLoginsPrevious: portalLoginsPrevious.count ?? 0,
      payments: payments.count ?? 0,
      paidPayments: paidPayments.count ?? 0,
      paidPaymentsCurrent: paidPaymentsCurrent.count ?? 0,
      paidPounds: paidPence / 100,
      paidPoundsCurrent: paidPenceCurrent / 100,
      bookingsTotal: bookingsTotal.count ?? 0,
      bookingsUpcoming: bookingsUpcoming.count ?? 0,
      bookingsCompleted: bookingsCompleted.count ?? 0,
      bookingsCurrent: bookingsCurrent.count ?? 0,
      bookingsPrevious: bookingsPrevious.count ?? 0,
      totalAnswered,
      totalCorrect,
      theoryAccuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
      topicsPassed,
      theoryLearners,
      theoryLearnersCurrent,
      theoryLearnersPrevious,
      reviewsTotal: 143,
      reviewsCurrent: reviewsCurrent.count ?? 0,
      reviewsPrevious: reviewsPrevious.count ?? 0,
      supportTicketsCurrent: supportCurrent.count ?? 0,
      supportTicketsPrevious: supportPrevious.count ?? 0,
      clicksByChannel,
      contactClicksCurrentTotal: (contactClicksCurrent.data ?? []).length,
      contactClicksPreviousTotal: contactClicksPrevious.count ?? 0,
      topPathsSorted,
      registrationsSeries,
      theorySeries,
      recentActivity,
      topicPerformance,
    };
  });

export type ContactClickRow = {
  id: string;
  package: string | null;
  channel: string;
  page: string | null;
  created_at: string;
};

export const getContactClicks = createServerFn({ method: "POST" })
  .inputValidator((d: Record<string, never>) => d)
  .handler(async ({ data }): Promise<ContactClickRow[]> => {
    const supabase = await adminClient();
    const { data: rows, error } = await supabase
      .from("contact_clicks")
      .select("id,package,channel,page,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (rows ?? []) as ContactClickRow[];
  });

export type AdminAlertSubscriber = { id: string; email: string; created_at: string };

export type PwaEventRow = {
  id: string;
  event: string;
  platform: string | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
};

export type PwaFunnel = {
  rows: PwaEventRow[];
  totals: Record<string, number>;
  uniqueSessions: Record<string, number>;
  byPlatform: Record<string, Record<string, number>>;
  promptToInstallRate: number;
  installsPerStandalone: number;
};

export const getPwaEvents = createServerFn({ method: "POST" })
  .inputValidator((d: Record<string, never>) => d)
  .handler(async ({ data }): Promise<PwaFunnel> => {
    const supabase = await adminClient();
    const { data: rows, error } = await supabase
      .from("pwa_events")
      .select("id,event,platform,user_agent,session_id,created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as PwaEventRow[];

    const totals: Record<string, number> = {};
    const sessionsByEvent: Record<string, Set<string>> = {};
    const byPlatform: Record<string, Record<string, number>> = {};
    for (const r of list) {
      totals[r.event] = (totals[r.event] ?? 0) + 1;
      const sid = r.session_id ?? r.id;
      (sessionsByEvent[r.event] ??= new Set()).add(sid);
      const plat = r.platform ?? "other";
      (byPlatform[plat] ??= {})[r.event] = (byPlatform[plat]?.[r.event] ?? 0) + 1;
    }
    const uniqueSessions: Record<string, number> = {};
    for (const k of Object.keys(sessionsByEvent)) uniqueSessions[k] = sessionsByEvent[k].size;

    const promptAvail = uniqueSessions["prompt_available"] ?? 0;
    const installs = uniqueSessions["installed"] ?? 0;
    const standalone = uniqueSessions["displayed_standalone"] ?? 0;
    return {
      rows: list.slice(0, 200),
      totals,
      uniqueSessions,
      byPlatform,
      promptToInstallRate: promptAvail === 0 ? 0 : installs / promptAvail,
      installsPerStandalone: standalone === 0 ? 0 : installs / standalone,
    };
  });

export const listAdminAlertSubscribers = createServerFn({ method: "POST" })
  .inputValidator((d: Record<string, never>) => d)
  .handler(async ({ data }): Promise<AdminAlertSubscriber[]> => {
    const supabase = await adminClient();
    const { data: rows, error } = await supabase
      .from("admin_alert_subscribers")
      .select("id,email,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as AdminAlertSubscriber[];
  });

export const subscribeAdminAlert = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await adminClient();
    const email = data.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error("Invalid email");
    }
    const { error } = await supabase
      .from("admin_alert_subscribers")
      .upsert({ email }, { onConflict: "email" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unsubscribeAdminAlert = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await adminClient();
    const { error } = await supabase.from("admin_alert_subscribers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type AdminCsvDataset =
  | "registrations"
  | "theory-users"
  | "recent-activity"
  | "contact-clicks";

export type AdminCsvResult = { filename: string; csv: string; rangeFrom: string; rangeTo: string };

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const exportAdminCsv = createServerFn({ method: "POST" })
  .inputValidator((d: { dataset: AdminCsvDataset; rangeDays: number }) => d)
  .handler(async ({ data }): Promise<AdminCsvResult> => {
    const supabase = await adminClient();
    const range = [7, 30, 90].includes(data.rangeDays) ? data.rangeDays : 30;
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - (range - 1));
    const sinceIso = new Date(toDate.getTime() - range * 24 * 60 * 60 * 1000).toISOString();
    const from = ymd(fromDate);
    const to = ymd(toDate);

    const header: (string | number)[][] = [
      ["Dataset", data.dataset],
      ["Range (days)", range],
      ["From", from],
      ["To", to],
      ["Exported (UTC)", new Date().toISOString()],
      [],
    ];

    let columns: string[] = [];
    let rows: (string | number | null | undefined)[][] = [];

    if (data.dataset === "registrations") {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id,full_name,created_at")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      const byDay: Record<string, number> = {};
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date(toDate);
        d.setDate(toDate.getDate() - i);
        byDay[ymd(d)] = 0;
      }
      for (const p of profiles ?? []) {
        const k = (p as any).created_at?.slice(0, 10);
        if (k && k in byDay) byDay[k] += 1;
      }
      columns = ["date", "registrations"];
      rows = Object.entries(byDay).map(([d, c]) => [d, c]);
    } else if (data.dataset === "theory-users") {
      const { data: theory, error } = await supabase
        .from("theory_progress")
        .select("user_id,created_at")
        .gte("created_at", sinceIso);
      if (error) throw new Error(error.message);
      const byDay: Record<string, Set<string>> = {};
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date(toDate);
        d.setDate(toDate.getDate() - i);
        byDay[ymd(d)] = new Set();
      }
      for (const r of theory ?? []) {
        const k = (r as any).created_at?.slice(0, 10);
        if (k && k in byDay) byDay[k].add((r as any).user_id);
      }
      columns = ["date", "unique_learners"];
      rows = Object.entries(byDay).map(([d, set]) => [d, set.size]);
    } else if (data.dataset === "recent-activity") {
      const [profilesRecent, bookingsRecent, theoryRecent, clicksRecent] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,created_at")
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false }),
        supabase
          .from("lesson_bookings")
          .select("duration_minutes,pickup_location,created_at")
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false }),
        supabase
          .from("theory_progress")
          .select("category_slug,last_score_pct,completed_at,updated_at")
          .gte("updated_at", sinceIso)
          .order("updated_at", { ascending: false }),
        supabase
          .from("contact_clicks")
          .select("channel,package,page,created_at")
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false }),
      ]);
      type Row = { at: string; type: string; label: string; detail: string };
      const out: Row[] = [];
      for (const p of (profilesRecent.data ?? []) as any[]) {
        out.push({
          at: p.created_at,
          type: "learner",
          label: "New learner registered",
          detail: p.full_name || "",
        });
      }
      for (const b of (bookingsRecent.data ?? []) as any[]) {
        const hours = Math.round((b.duration_minutes ?? 60) / 60);
        out.push({
          at: b.created_at,
          type: "booking",
          label: `Lesson booked (${hours}h)`,
          detail: b.pickup_location || "",
        });
      }
      for (const t of (theoryRecent.data ?? []) as any[]) {
        if (!t.completed_at && (t.last_score_pct ?? 0) === 0) continue;
        out.push({
          at: t.updated_at,
          type: "mock",
          label: t.completed_at ? "Mock test completed" : "Theory topic updated",
          detail: (t.category_slug || "").replace(/-/g, " "),
        });
      }
      for (const c of (clicksRecent.data ?? []) as any[]) {
        out.push({
          at: c.created_at,
          type: "click",
          label:
            c.channel === "whatsapp"
              ? "WhatsApp enquiry"
              : c.channel === "email"
                ? "Email enquiry"
                : c.channel === "phone"
                  ? "Phone enquiry"
                  : "Portal opened",
          detail: c.package || c.page || "",
        });
      }
      out.sort((a, b) => (a.at < b.at ? 1 : -1));
      columns = ["timestamp", "type", "label", "detail"];
      rows = out.map((r) => [r.at, r.type, r.label, r.detail]);
    } else if (data.dataset === "contact-clicks") {
      const { data: clicks, error } = await supabase
        .from("contact_clicks")
        .select("id,package,channel,page,created_at")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      columns = ["timestamp", "channel", "package", "page", "id"];
      rows = (clicks ?? []).map((c: any) => [c.created_at, c.channel, c.package, c.page, c.id]);
    }

    const csv = toCsv([...header, columns, ...rows]);
    const filename = `${data.dataset}_${from}_to_${to}.csv`;
    return { filename, csv, rangeFrom: from, rangeTo: to };
  });

export type TrafficStats = {
  rangeDays: number;
  totalViews: number;
  uniqueSessions: number;
  bySurface: { app: number; browser: number; unknown: number };
  byDevice: { ios: number; android: number; mobile: number; desktop: number; unknown: number };
  byPlatform: { platform: string; views: number; sessions: number }[];
  topPaths: { path: string; views: number; sessions: number }[];
  topPathsByPlatform: {
    path: string;
    app: number;
    browser: number;
    total: number;
  }[];
  bySource: { source: string; views: number; sessions: number }[];
  topReferrers: { referrer: string; source: string; views: number }[];
  series: { date: string; app: number; browser: number; total: number }[];
};

export type SectionBreakdown = {
  path: string;
  rangeDays: number;
  totalViews: number;
  uniqueSessions: number;
  bySurface: { app: number; browser: number; unknown: number };
  byDevice: { ios: number; android: number; mobile: number; desktop: number; unknown: number };
  byPlatform: { platform: string; views: number; sessions: number }[];
  bySource: { source: string; views: number; sessions: number }[];
  topReferrers: { referrer: string; source: string; views: number }[];
  series: { date: string; app: number; browser: number; total: number }[];
};

export const getSectionBreakdown = createServerFn({ method: "POST" })
  .inputValidator((d: { rangeDays: number; path: string }) => d)
  .handler(async ({ data }): Promise<SectionBreakdown> => {
    const supabase = await adminClient();
    const range = [1, 7, 30, 90].includes(data.rangeDays) ? data.rangeDays : 7;
    const sinceIso = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await supabase
      .from("page_views")
      .select("path,platform,session_id,user_agent,referrer,created_at")
      .eq("path", data.path)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(20000);
    if (error) throw new Error(error.message);

    type Row = {
      path: string;
      platform: string | null;
      session_id: string | null;
      user_agent: string | null;
      referrer: string | null;
      created_at: string;
    };
    const list = (rows ?? []) as Row[];

    const surfaceOf = (p: string | null, ua: string | null): "app" | "browser" | "unknown" => {
      if (p) {
        if (p.startsWith("app-")) return "app";
        if (p.startsWith("browser-")) return "browser";
      }
      if (ua) return "browser";
      return "unknown";
    };
    const deviceOf = (
      p: string | null,
      ua: string | null,
    ): "ios" | "android" | "mobile" | "desktop" | "unknown" => {
      if (p) {
        const d = p.split("-")[1];
        if (d === "ios" || d === "android" || d === "mobile" || d === "desktop") return d;
      }
      if (ua) {
        if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
        if (/Android/i.test(ua)) return "android";
        if (/Mobile/i.test(ua)) return "mobile";
        return "desktop";
      }
      return "unknown";
    };

    const bySurface = { app: 0, browser: 0, unknown: 0 };
    const byDevice = { ios: 0, android: 0, mobile: 0, desktop: 0, unknown: 0 };
    const platformCounts = new Map<string, { views: number; sessions: Set<string> }>();
    const sourceCounts = new Map<string, { views: number; sessions: Set<string> }>();
    const referrerCounts = new Map<string, { source: string; views: number }>();
    const sessions = new Set<string>();
    const dayBuckets: Record<string, { app: number; browser: number; total: number }> = {};
    const today = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dayBuckets[d.toISOString().slice(0, 10)] = { app: 0, browser: 0, total: 0 };
    }

    for (const r of list) {
      const surface = surfaceOf(r.platform, r.user_agent);
      const device = deviceOf(r.platform, r.user_agent);
      bySurface[surface] += 1;
      byDevice[device] += 1;
      const plat = r.platform || `${surface}-${device}`;
      const pRow = platformCounts.get(plat) ?? { views: 0, sessions: new Set<string>() };
      pRow.views += 1;
      if (r.session_id) pRow.sessions.add(r.session_id);
      platformCounts.set(plat, pRow);
      const src = classifyReferrer(r.referrer);
      const sRow = sourceCounts.get(src) ?? { views: 0, sessions: new Set<string>() };
      sRow.views += 1;
      if (r.session_id) sRow.sessions.add(r.session_id);
      sourceCounts.set(src, sRow);
      if (r.referrer) {
        let host = r.referrer;
        try {
          host = new URL(r.referrer).hostname.toLowerCase() || r.referrer;
        } catch {}
        const rRow = referrerCounts.get(host) ?? { source: src, views: 0 };
        rRow.views += 1;
        referrerCounts.set(host, rRow);
      }
      if (r.session_id) sessions.add(r.session_id);
      const key = r.created_at.slice(0, 10);
      if (key in dayBuckets) {
        dayBuckets[key].total += 1;
        if (surface === "app") dayBuckets[key].app += 1;
        else if (surface === "browser") dayBuckets[key].browser += 1;
      }
    }

    const byPlatform = Array.from(platformCounts.entries())
      .map(([platform, v]) => ({ platform, views: v.views, sessions: v.sessions.size }))
      .sort((a, b) => b.views - a.views);
    const bySource = Array.from(sourceCounts.entries())
      .map(([source, v]) => ({ source, views: v.views, sessions: v.sessions.size }))
      .sort((a, b) => b.views - a.views);
    const topReferrers = Array.from(referrerCounts.entries())
      .map(([referrer, v]) => ({ referrer, source: v.source, views: v.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    const series = Object.entries(dayBuckets).map(([date, v]) => ({ date, ...v }));

    return {
      path: data.path,
      rangeDays: range,
      totalViews: list.length,
      uniqueSessions: sessions.size,
      bySurface,
      byDevice,
      byPlatform,
      bySource,
      topReferrers,
      series,
    };
  });

export const getTrafficStats = createServerFn({ method: "POST" })
  .inputValidator((d: { rangeDays: number }) => d)
  .handler(async ({ data }): Promise<TrafficStats> => {
    const supabase = await adminClient();
    const range = [1, 7, 30, 90].includes(data.rangeDays) ? data.rangeDays : 7;
    const sinceIso = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await supabase
      .from("page_views")
      .select("path,platform,session_id,user_agent,referrer,created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(20000);
    if (error) throw new Error(error.message);

    type Row = {
      path: string;
      platform: string | null;
      session_id: string | null;
      user_agent: string | null;
      referrer: string | null;
      created_at: string;
    };
    const list = (rows ?? []) as Row[];

    const surfaceOf = (p: string | null, ua: string | null): "app" | "browser" | "unknown" => {
      if (p) {
        if (p.startsWith("app-")) return "app";
        if (p.startsWith("browser-")) return "browser";
      }
      if (ua) return "browser";
      return "unknown";
    };
    const deviceOf = (
      p: string | null,
      ua: string | null,
    ): "ios" | "android" | "mobile" | "desktop" | "unknown" => {
      if (p) {
        const d = p.split("-")[1];
        if (d === "ios" || d === "android" || d === "mobile" || d === "desktop") return d;
      }
      if (ua) {
        if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
        if (/Android/i.test(ua)) return "android";
        if (/Mobile/i.test(ua)) return "mobile";
        return "desktop";
      }
      return "unknown";
    };

    const bySurface = { app: 0, browser: 0, unknown: 0 };
    const byDevice = { ios: 0, android: 0, mobile: 0, desktop: 0, unknown: 0 };
    const platformCounts = new Map<string, { views: number; sessions: Set<string> }>();
    const pathCounts = new Map<
      string,
      { views: number; sessions: Set<string>; app: number; browser: number }
    >();
    const sourceCounts = new Map<string, { views: number; sessions: Set<string> }>();
    const referrerCounts = new Map<string, { source: string; views: number }>();
    const sessions = new Set<string>();
    const dayBuckets: Record<string, { app: number; browser: number; total: number }> = {};
    const today = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dayBuckets[d.toISOString().slice(0, 10)] = { app: 0, browser: 0, total: 0 };
    }

    for (const r of list) {
      const surface = surfaceOf(r.platform, r.user_agent);
      const device = deviceOf(r.platform, r.user_agent);
      bySurface[surface] += 1;
      byDevice[device] += 1;
      const plat = r.platform || `${surface}-${device}`;
      const pRow = platformCounts.get(plat) ?? { views: 0, sessions: new Set<string>() };
      pRow.views += 1;
      if (r.session_id) pRow.sessions.add(r.session_id);
      platformCounts.set(plat, pRow);

      const path = r.path || "(unknown)";
      const pathRow = pathCounts.get(path) ?? {
        views: 0,
        sessions: new Set<string>(),
        app: 0,
        browser: 0,
      };
      pathRow.views += 1;
      if (r.session_id) pathRow.sessions.add(r.session_id);
      if (surface === "app") pathRow.app += 1;
      else if (surface === "browser") pathRow.browser += 1;
      pathCounts.set(path, pathRow);

      const src = classifyReferrer(r.referrer);
      const sRow = sourceCounts.get(src) ?? { views: 0, sessions: new Set<string>() };
      sRow.views += 1;
      if (r.session_id) sRow.sessions.add(r.session_id);
      sourceCounts.set(src, sRow);
      if (r.referrer) {
        let host = r.referrer;
        try {
          host = new URL(r.referrer).hostname.toLowerCase() || r.referrer;
        } catch {}
        const rRow = referrerCounts.get(host) ?? { source: src, views: 0 };
        rRow.views += 1;
        referrerCounts.set(host, rRow);
      }

      if (r.session_id) sessions.add(r.session_id);

      const key = r.created_at.slice(0, 10);
      if (key in dayBuckets) {
        dayBuckets[key].total += 1;
        if (surface === "app") dayBuckets[key].app += 1;
        else if (surface === "browser") dayBuckets[key].browser += 1;
      }
    }

    const byPlatform = Array.from(platformCounts.entries())
      .map(([platform, v]) => ({ platform, views: v.views, sessions: v.sessions.size }))
      .sort((a, b) => b.views - a.views);

    const topPaths = Array.from(pathCounts.entries())
      .map(([path, v]) => ({ path, views: v.views, sessions: v.sessions.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);

    const topPathsByPlatform = Array.from(pathCounts.entries())
      .map(([path, v]) => ({ path, app: v.app, browser: v.browser, total: v.views }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    const bySource = Array.from(sourceCounts.entries())
      .map(([source, v]) => ({ source, views: v.views, sessions: v.sessions.size }))
      .sort((a, b) => b.views - a.views);
    const topReferrers = Array.from(referrerCounts.entries())
      .map(([referrer, v]) => ({ referrer, source: v.source, views: v.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const series = Object.entries(dayBuckets).map(([date, v]) => ({ date, ...v }));

    return {
      rangeDays: range,
      totalViews: list.length,
      uniqueSessions: sessions.size,
      bySurface,
      byDevice,
      byPlatform,
      topPaths,
      topPathsByPlatform,
      bySource,
      topReferrers,
      series,
    };
  });
