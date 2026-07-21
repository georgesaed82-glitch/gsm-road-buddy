import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "whoami",
  title: "Who am I",
  description:
    "Return the identity of the signed-in GSM Driving School user calling this MCP server (user id, email, and any admin role).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [{ type: "text", text: "Not authenticated." }],
        isError: true,
      };
    }
    const claims = ctx.getClaims() ?? {};
    const info = {
      userId: ctx.getUserId(),
      email: ctx.getUserEmail() ?? null,
      clientId: ctx.getClientId() ?? null,
      role: (claims as Record<string, unknown>).role ?? null,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});