import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const CORRECT_PHONE_DISPLAY = "+44 7961 585231";
const CORRECT_WHATSAPP_URL = "https://wa.me/447961585231";

function fixPhoneNumbers(content: string) {
  return content
    .replace(/https:\/\/wa\.me\/447956195602/g, CORRECT_WHATSAPP_URL)
    .replace(/wa\.me\/447956195602/g, "wa.me/447961585231")
    .replace(/\+44\s*7956\s*195602/g, CORRECT_PHONE_DISPLAY)
    .replace(/07956\s*195602/g, "07961 585231")
    .replace(/447956195602/g, "447961585231");
}

const SUGGESTIONS = [
  "What areas do you cover?",
  "Manual or automatic?",
  "Ask me a theory question",
  "Help me book a lesson",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm George's AI assistant 👋 I can answer questions about lessons, run a theory practice quiz, or help you book. What can I help with?",
};

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setMessages((current) => current.map((message) => ({ ...message, content: fixPhoneNumbers(message.content) })));
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const cleanMessages = messages.map((message) => ({ ...message, content: fixPhoneNumbers(message.content) }));
    const next: Msg[] = [...cleanMessages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: ac.signal,
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "Sorry, something went wrong.");
        setMessages((m) => [...m, { role: "assistant", content: fixPhoneNumbers(errText || `Sorry, I had trouble responding. Please WhatsApp George on ${CORRECT_PHONE_DISPLAY}.`) }]);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;
          const data = trimmedLine.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: fixPhoneNumbers(copy[copy.length - 1].content + delta) };
                return copy;
              });
            }
          } catch {
            // skip non-JSON lines
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMessages((m) => [...m, { role: "assistant", content: `Connection issue. Please try again or WhatsApp George on ${CORRECT_PHONE_DISPLAY}.` }]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-red-600 text-white shadow-xl transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:px-5 sm:py-3"
        >
          <MessageCircle className="h-6 w-6 sm:h-5 sm:w-5" />
          <span className="hidden text-sm font-medium sm:inline">Ask GSM</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-3 bottom-3 top-3 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:max-h-[80vh] sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-border bg-red-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">GSM Assistant</p>
              <p className="text-xs opacity-80">Replies in seconds · powered by AI</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[90%] whitespace-pre-wrap text-sm leading-relaxed text-foreground"
                  }
                >
                  {m.content || (loading && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> thinking…
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-muted px-3.5 py-2 text-sm text-foreground transition-colors hover:bg-accent active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t border-border bg-background px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask about lessons, theory, booking…"
              className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary sm:text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10"
            >
              <Send className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}