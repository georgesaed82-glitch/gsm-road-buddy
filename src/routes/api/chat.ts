import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are the friendly AI assistant for GSM Driving School (George's School of Motoring), a West London driving school established in 2005, run by instructor George.

Key facts:
- Location: 71 Sandbourne House, London W11 1DS (Notting Hill, Holland Park area)
- Coverage: W2, W3, W4, SW6, W8, W10, W11, W12, W14 — Notting Hill Gate, Holland Park, High Street Kensington, Bayswater
- Phone/WhatsApp: +44 7956 195602
- Email: gsmdrivingschool@outlook.com
- 143+ Google reviews, 5-star rated
- Manual and automatic lessons available
- 20+ years of experience
- Lesson lengths: 1, 1.5, or 2 hours (2 hours recommended for faster progress)

You can help visitors with:
1. General questions about lessons, packages, areas covered, transmission types
2. Theory test practice — ask DVSA-style multiple choice questions and explain answers
3. Booking help — collect name, postcode, transmission preference, and availability, then direct them to WhatsApp +44 7956 195602

Rules:
- Do NOT quote specific prices. Direct pricing questions to WhatsApp/email.
- Keep replies short, warm, and conversational (2-4 sentences typically).
- Use UK English. Be encouraging — many users are nervous learners.
- If asked to book, gather the details then say: "Brilliant — message these details to George on WhatsApp: https://wa.me/447956195602"
- If you don't know, say so and offer to connect them with George.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        let body: { messages?: Array<{ role: string; content: string }> };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
          return new Response("messages required", { status: 400 });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            stream: true,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages.slice(-20).map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: String(m.content ?? "").slice(0, 4000),
              })),
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          if (upstream.status === 429) {
            return new Response("Rate limit reached. Please try again in a moment.", { status: 429 });
          }
          if (upstream.status === 402) {
            return new Response("AI credits exhausted. Please contact George directly via WhatsApp.", { status: 402 });
          }
          return new Response(text || "AI gateway error", { status: upstream.status || 500 });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});