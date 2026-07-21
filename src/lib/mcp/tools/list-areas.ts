import { defineTool } from "@lovable.dev/mcp-js";
import { areas } from "@/data/areas";

export default defineTool({
  name: "list_areas",
  title: "List coverage areas",
  description:
    "List every London area GSM Driving School covers, with the primary postcode, nearby postcodes and a short description. Public information.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const rows = areas.map((a) => ({
      slug: a.slug,
      area: a.area,
      postcode: a.postcode,
      nearbyPostcodes: a.nearbyPostcodes,
      intro: a.intro,
      url: `https://www.gsmdrivingschool.com/areas/${a.slug}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { areas: rows },
    };
  },
});