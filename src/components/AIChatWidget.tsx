import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import gsmLogo from "@/assets/gsm-logo.jpeg.asset.json";

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

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const floatingButtonRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setMessages((current) => current.map((message) => ({ ...message, content: fixPhoneNumbers(message.content) })));
  }, []);

  // When the chat panel closes, return focus to the floating trigger button.
  useEffect(() => {
    if (!open) {
      const id = requestAnimationFrame(() => floatingButtonRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // Focus the input when the chat opens and keep keyboard interactions inside the panel.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const textarea = panel.querySelector<HTMLTextAreaElement>("textarea");
    textarea?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    panel.addEventListener("keydown", handleKeyDown);
    return () => panel.removeEventListener("keydown", handleKeyDown);
  }, [open]);

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
          ref={floatingButtonRef}
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-red-600 text-white shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:px-5 sm:py-3"
        >
          <MessageCircle className="h-6 w-6 shrink-0 sm:h-5 sm:w-5" />
          <span className="hidden text-sm font-medium sm:inline">Ask GSM</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="GSM AI assistant chat"
          className="fixed inset-x-2 bottom-2 top-2 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:max-h-[80vh] sm:w-[380px]"
        >
          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-red-600 px-3 py-3 text-white sm:px-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-white shadow-sm">
                <img src={gsmLogo.url} alt="" aria-hidden="true" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">GSM Assistant</p>
                <p className="truncate text-xs opacity-90">Replies in seconds · powered by AI</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-1"
            >
              <X className="h-5 w-5 shrink-0" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4"
          >
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${m.role} message`}
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-br-sm bg-red-600 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 sm:max-w-[75%]"
                      : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 sm:max-w-[80%]"
                  }
                >
                  {m.content || (loading && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> thinking…
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-3 pb-3 sm:px-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-muted px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
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
              aria-label="Type your message"
              style={{ fontSize: "16px" }}
              className="ai-chat-input max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-3 leading-snug outline-none focus:border-red-600 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 sm:px-4"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10"
            >
              <Send className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
