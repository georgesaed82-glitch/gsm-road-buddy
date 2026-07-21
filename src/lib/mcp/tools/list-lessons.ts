import { defineTool } from "@lovable.dev/mcp-js";
import { drivingLessons } from "@/data/drivingLessons";

export default defineTool({
  name: "list_lessons",
  title: "List driving lessons",
  description:
    "List every published GSM Driving School practical driving-strategy lesson (slug, title, Highway Code rule reference, short summary). Public information.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const rows = drivingLessons.map((l) => ({
      slug: l.slug,
      title: l.title,
      rule: l.rule ?? null,
      summary: l.summary ?? null,
      objective: l.objective,
      category: l.category,
      url: `https://www.gsmdrivingschool.com/driving-strategy/${l.slug}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { lessons: rows },
    };
  },
});