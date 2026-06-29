import { createServerFn } from "@tanstack/react-start";

const ADMIN_PASSWORD = "7777"; // shared admin gate; can be overridden via env

function dayAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function adminClient(password: string) {
  const expected = process.env.ADMIN_PASSWORD || ADMIN_PASSWORD;
  if (!password || password !== expected) {
    throw new Response("Unauthorized", { status: 401 });
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type AdminOverview = {
  students: number;
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
  clicksByChannel: Record<string, number>;
  contactClicksCurrentTotal: number;
  contactClicksPreviousTotal: number;
  topPathsSorted: [string, number][];
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
      theoryRows,
      contactClicksCurrent,
      contactClicksPrevious,
      recentPageViews,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
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
      supabase.from("theory_progress").select("questions_answered,questions_correct,best_score_pct,completed_at,user_id"),
      supabase.from("contact_clicks").select("channel").gte("created_at", sinceCurrent),
      supabase.from("contact_clicks").select("id", { count: "exact", head: true }).gte("created_at", sincePrevious).lt("created_at", sinceCurrent),
      supabase.from("page_views").select("path,created_at").order("created_at", { ascending: false }).limit(500),
    ]);

    const paidPence = (paidSum.data ?? []).filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + (p.amount_pence ?? 0), 0);
    const paidPenceCurrent = (paidSumCurrent.data ?? []).reduce((s: number, p: any) => s + (p.amount_pence ?? 0), 0);

    const theory = theoryRows.data ?? [];
    const totalAnswered = theory.reduce((s: number, r: any) => s + (r.questions_answered ?? 0), 0);
    const totalCorrect = theory.reduce((s: number, r: any) => s + (r.questions_correct ?? 0), 0);
    const topicsPassed = theory.filter((r: any) => (r.best_score_pct ?? 0) >= 86).length;
    const theoryLearners = new Set(theory.map((r: any) => r.user_id)).size;

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

    return {
      students: profiles.count ?? 0,
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
      clicksByChannel,
      contactClicksCurrentTotal: (contactClicksCurrent.data ?? []).length,
      contactClicksPreviousTotal: contactClicksPrevious.count ?? 0,
      topPathsSorted,
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
