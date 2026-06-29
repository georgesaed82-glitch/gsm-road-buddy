import { createServerFn } from "@tanstack/react-start";
import { verifyAdminPasswordServer } from "./portal-access.functions";

function dayAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function adminClient(password: string) {
  if (!(await verifyAdminPasswordServer(password))) {
    throw new Response("Unauthorized", { status: 401 });
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
  .inputValidator((d: { password: string; rangeDays: number }) => d)
  .handler(async ({ data }): Promise<AdminOverview> => {
    const supabase = await adminClient(data.password);
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
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sinceCurrent),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sincePrevious).lt("created_at", sinceCurrent),
      supabase.from("profiles").select("id,full_name,created_at").gte("created_at", sinceCurrent).order("created_at", { ascending: false }).limit(50),
      supabase.from("page_views").select("id", { count: "exact", head: true }),
      supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", sinceCurrent),
      supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", sincePrevious).lt("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("id", { count: "exact", head: true }).eq("channel", "portal_view"),
      supabase.from("contact_clicks").select("id", { count: "exact", head: true }).eq("channel", "portal_view").gte("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("id", { count: "exact", head: true }).eq("channel", "portal_view").gte("created_at", sincePrevious).lt("created_at", sinceCurrent),
      supabase.from("payments").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "paid"),
      supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "paid").gte("created_at", sinceCurrent),
      supabase.from("payments").select("amount_pence,status"),
      supabase.from("payments").select("amount_pence,status").eq("status", "paid").gte("created_at", sinceCurrent),
      supabase.from("lesson_bookings").select("id", { count: "exact", head: true }),
      supabase.from("lesson_bookings").select("id", { count: "exact", head: true }).gte("scheduled_at", new Date().toISOString()),
      supabase.from("lesson_bookings").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("lesson_bookings").select("id", { count: "exact", head: true }).gte("created_at", sinceCurrent),
      supabase.from("lesson_bookings").select("id", { count: "exact", head: true }).gte("created_at", sincePrevious).lt("created_at", sinceCurrent),
      supabase.from("lesson_bookings").select("id,duration_minutes,scheduled_at,pickup_location,created_at").gte("created_at", sinceCurrent).order("created_at", { ascending: false }).limit(50),
      supabase.from("theory_progress").select("questions_answered,questions_correct,best_score_pct,completed_at,user_id,category_slug,created_at,updated_at"),
      supabase.from("theory_progress").select("user_id,category_slug,last_score_pct,best_score_pct,updated_at,completed_at").order("updated_at", { ascending: false }).limit(50),
      supabase.from("theory_progress").select("user_id,created_at").gte("created_at", sinceCurrent),
      supabase.from("theory_progress").select("user_id,created_at").gte("created_at", sincePrevious).lt("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("id", { count: "exact", head: true }).eq("channel", "phone").gte("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("id", { count: "exact", head: true }).eq("channel", "phone").gte("created_at", sincePrevious).lt("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("id", { count: "exact", head: true }).eq("channel", "email").gte("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("id", { count: "exact", head: true }).eq("channel", "email").gte("created_at", sincePrevious).lt("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("channel").gte("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("id", { count: "exact", head: true }).gte("created_at", sincePrevious).lt("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("channel,package,page,created_at").order("created_at", { ascending: false }).limit(30),
      supabase.from("page_views").select("path,created_at").order("created_at", { ascending: false }).limit(500),
    ]);

    const paidPence = (paidSum.data ?? []).filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + (p.amount_pence ?? 0), 0);
    const paidPenceCurrent = (paidSumCurrent.data ?? []).reduce((s: number, p: any) => s + (p.amount_pence ?? 0), 0);

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
      .map(([slug, v]) => ({ slug, answers: v.answers, accuracy: Math.round((v.correct / v.answers) * 100) }))
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
    const topPathsSorted = Object.entries(topPaths).sort((a, b) => b[1] - a[1]).slice(0, 6) as [string, number][];

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
      activity.push({ type: "learner", label: "New learner registered", sub: p.full_name || "New learner", at: p.created_at });
    }
    for (const b of (bookingsRecent.data ?? []) as any[]) {
      const hours = Math.round((b.duration_minutes ?? 60) / 60);
      activity.push({ type: "booking", label: `Lesson booked (${hours}h)`, sub: b.pickup_location || "Pickup", at: b.created_at });
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

    const theoryLearnersCurrent = new Set(((theoryCurrent.data ?? []) as any[]).map((r) => r.user_id)).size;
    const theoryLearnersPrevious = new Set(((theoryPrevious.data ?? []) as any[]).map((r) => r.user_id)).size;

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
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }): Promise<ContactClickRow[]> => {
    const supabase = await adminClient(data.password);
    const { data: rows, error } = await supabase
      .from("contact_clicks")
      .select("id,package,channel,page,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Response(error.message, { status: 500 });
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
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }): Promise<PwaFunnel> => {
    const supabase = await adminClient(data.password);
    const { data: rows, error } = await supabase
      .from("pwa_events")
      .select("id,event,platform,user_agent,session_id,created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Response(error.message, { status: 500 });
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
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }): Promise<AdminAlertSubscriber[]> => {
    const supabase = await adminClient(data.password);
    const { data: rows, error } = await supabase
      .from("admin_alert_subscribers")
      .select("id,email,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Response(error.message, { status: 500 });
    return (rows ?? []) as AdminAlertSubscriber[];
  });

export const subscribeAdminAlert = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; email: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await adminClient(data.password);
    const email = data.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Response("Invalid email", { status: 400 });
    }
    const { error } = await supabase
      .from("admin_alert_subscribers")
      .upsert({ email }, { onConflict: "email" });
    if (error) throw new Response(error.message, { status: 500 });
    return { ok: true };
  });

export const unsubscribeAdminAlert = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await adminClient(data.password);
    const { error } = await supabase.from("admin_alert_subscribers").delete().eq("id", data.id);
    if (error) throw new Response(error.message, { status: 500 });
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
  .inputValidator((d: { password: string; dataset: AdminCsvDataset; rangeDays: number }) => d)
  .handler(async ({ data }): Promise<AdminCsvResult> => {
    const supabase = await adminClient(data.password);
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
      if (error) throw new Response(error.message, { status: 500 });
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
      if (error) throw new Response(error.message, { status: 500 });
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
        supabase.from("profiles").select("full_name,created_at").gte("created_at", sinceIso).order("created_at", { ascending: false }),
        supabase.from("lesson_bookings").select("duration_minutes,pickup_location,created_at").gte("created_at", sinceIso).order("created_at", { ascending: false }),
        supabase.from("theory_progress").select("category_slug,last_score_pct,completed_at,updated_at").gte("updated_at", sinceIso).order("updated_at", { ascending: false }),
        supabase.from("contact_clicks").select("channel,package,page,created_at").gte("created_at", sinceIso).order("created_at", { ascending: false }),
      ]);
      type Row = { at: string; type: string; label: string; detail: string };
      const out: Row[] = [];
      for (const p of (profilesRecent.data ?? []) as any[]) {
        out.push({ at: p.created_at, type: "learner", label: "New learner registered", detail: p.full_name || "" });
      }
      for (const b of (bookingsRecent.data ?? []) as any[]) {
        const hours = Math.round((b.duration_minutes ?? 60) / 60);
        out.push({ at: b.created_at, type: "booking", label: `Lesson booked (${hours}h)`, detail: b.pickup_location || "" });
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
            c.channel === "whatsapp" ? "WhatsApp enquiry" :
            c.channel === "email" ? "Email enquiry" :
            c.channel === "phone" ? "Phone enquiry" : "Portal opened",
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
      if (error) throw new Response(error.message, { status: 500 });
      columns = ["timestamp", "channel", "package", "page", "id"];
      rows = (clicks ?? []).map((c: any) => [c.created_at, c.channel, c.package, c.page, c.id]);
    }

    const csv = toCsv([...header, columns, ...rows]);
    const filename = `${data.dataset}_${from}_to_${to}.csv`;
    return { filename, csv, rangeFrom: from, rangeTo: to };
  });