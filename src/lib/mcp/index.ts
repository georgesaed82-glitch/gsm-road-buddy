import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listAreasTool from "./tools/list-areas";
import listLessonsTool from "./tools/list-lessons";
import contactInfoTool from "./tools/contact-info";
import listMyBookingsTool from "./tools/list-my-bookings";

// OAuth issuer must be the direct Supabase host — the `.lovable.cloud` proxy
// publishes a different `issuer` in its discovery document and mcp-js would
// reject tokens. The project ref is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "gsm-driving-school",
  title: "GSM Driving School",
  version: "0.1.0",
  instructions:
    "Tools for GSM Driving School. Use `whoami` to check who the caller is, `list_areas` and `contact_info` for public coverage/contact info, `list_lessons` for the practical driving-lesson catalog, and `list_my_bookings` to read the signed-in learner's own lesson bookings.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listAreasTool, listLessonsTool, contactInfoTool, listMyBookingsTool],
});