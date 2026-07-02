import { createServerFn } from "@tanstack/react-start";
import { verifyAdminPasswordServer } from "./portal-access.functions";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/microsoft_outlook";

export const sendOutlookMail = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      password: string;
      to: string;
      subject: string;
      body: string;
      html?: boolean;
    }) => d,
  )
  .handler(async ({ data }) => {
    if (!(await verifyAdminPasswordServer(data.password))) {
      throw new Response("Unauthorized", { status: 401 });
    }
    const lovableKey = process.env.LOVABLE_API_KEY;
    const outlookKey = process.env.MICROSOFT_OUTLOOK_API_KEY;
    if (!lovableKey || !outlookKey) {
      throw new Error(
        "Outlook mail is not configured. Please reconnect the Microsoft Outlook connector in Settings.",
      );
    }
    const to = (data.to || "").trim();
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      throw new Error("A valid recipient email is required.");
    }
    const res = await fetch(`${GATEWAY_URL}/me/sendMail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": outlookKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: data.subject,
          body: {
            contentType: data.html ? "HTML" : "Text",
            content: data.body,
          },
          toRecipients: [{ emailAddress: { address: to } }],
        },
        saveToSentItems: true,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Outlook send failed (${res.status}): ${text.slice(0, 400) || res.statusText}`,
      );
    }
    return { ok: true as const };
  });