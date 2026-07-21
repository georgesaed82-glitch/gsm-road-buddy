import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_my_bookings",
  title: "List my lesson bookings",
  description:
    "List the signed-in GSM Plus learner's own lesson bookings (scheduled_at, duration, instructor, status). Row-level security scopes results to the caller.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("lesson_bookings")
      .select("id, scheduled_at, duration_minutes, instructor_name, status, pickup_location")
      .order("scheduled_at", { ascending: false })
      .limit(50);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const bookings = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(bookings, null, 2) }],
      structuredContent: { bookings },
    };
  },
});