import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "contact_info",
  title: "GSM contact details",
  description:
    "Return GSM Driving School's public contact information (phone, WhatsApp, website) so an assistant can pass it to a learner.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      businessName: "GSM Driving School",
      phoneDisplay: "+44 7961 585231",
      phoneTel: "tel:+447961585231",
      whatsapp: "https://wa.me/447961585231",
      website: "https://www.gsmdrivingschool.com",
      coverage: "West London — W2, W3, W4, SW6, W8, W10, W11, W12, W14",
    };
    return {
      content: [
        {
          type: "text",
          text: `${info.businessName}\nPhone: ${info.phoneDisplay}\nWhatsApp: ${info.whatsapp}\nWebsite: ${info.website}\nCoverage: ${info.coverage}`,
        },
      ],
      structuredContent: info,
    };
  },
});