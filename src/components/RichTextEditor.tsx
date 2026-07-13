import { useRef, useState } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Quote, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
};

/**
 * Lightweight markdown editor: toolbar inserts markdown syntax, preview
 * renders via the site's Markdown component so admins see final formatting.
 */
export function RichTextEditor({ value, onChange, rows = 8, placeholder, className }: Props) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const prefixLines = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const sel = value.slice(start, end) || "line";
    const after = value.slice(end);
    const prefixed = sel
      .split("\n")
      .map((l) => `${prefix}${l}`)
      .join("\n");
    onChange(before + prefixed + after);
  };

  const insertLink = () => {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    wrap("[", `](${url})`);
  };

  const btn = (icon: React.ReactNode, label: string, onClick: () => void) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded border border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground"
    >
      {icon}
    </button>
  );

  return (
    <div className={cn("overflow-hidden border border-border bg-background", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 px-2 py-1">
        {btn(<Bold className="h-4 w-4" />, "Bold", () => wrap("**"))}
        {btn(<Italic className="h-4 w-4" />, "Italic", () => wrap("_"))}
        {btn(<Heading2 className="h-4 w-4" />, "Heading 2", () => prefixLines("## "))}
        {btn(<Heading3 className="h-4 w-4" />, "Heading 3", () => prefixLines("### "))}
        {btn(<List className="h-4 w-4" />, "Bullet list", () => prefixLines("- "))}
        {btn(<ListOrdered className="h-4 w-4" />, "Numbered list", () => prefixLines("1. "))}
        {btn(<Quote className="h-4 w-4" />, "Quote", () => prefixLines("> "))}
        {btn(<Link2 className="h-4 w-4" />, "Link", insertLink)}
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "edit" ? "default" : "ghost"}
            onClick={() => setMode("edit")}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "preview" ? "default" : "ghost"}
            onClick={() => setMode("preview")}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
        </div>
      </div>
      {mode === "edit" ? (
        <Textarea
          ref={ref}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-none border-0 font-mono text-sm focus-visible:ring-0"
        />
      ) : (
        <div className="min-h-[8rem] px-3 py-2">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}