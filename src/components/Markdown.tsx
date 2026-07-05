import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const components: Components = {
  h1: ({ node: _n, ...p }) => <h1 className="mt-8 mb-4 font-display text-3xl text-foreground" {...p} />,
  h2: ({ node: _n, ...p }) => <h2 className="mt-8 mb-3 font-display text-2xl text-foreground" {...p} />,
  h3: ({ node: _n, ...p }) => <h3 className="mt-6 mb-2 font-display text-xl text-foreground" {...p} />,
  p: ({ node: _n, ...p }) => <p className="my-4 leading-relaxed text-foreground/90" {...p} />,
  a: ({ node: _n, ...p }) => (
    <a className="text-primary underline underline-offset-4 hover:opacity-80" {...p} />
  ),
  ul: ({ node: _n, ...p }) => <ul className="my-4 list-disc space-y-1 pl-6 text-foreground/90" {...p} />,
  ol: ({ node: _n, ...p }) => <ol className="my-4 list-decimal space-y-1 pl-6 text-foreground/90" {...p} />,
  blockquote: ({ node: _n, ...p }) => (
    <blockquote className="my-4 border-l-4 border-primary bg-secondary/40 px-4 py-2 italic" {...p} />
  ),
  code: ({ node: _n, className, children, ...p }) => (
    <code className={cn("rounded bg-secondary px-1.5 py-0.5 font-mono text-sm", className)} {...p}>
      {children}
    </code>
  ),
  pre: ({ node: _n, ...p }) => (
    <pre className="my-4 overflow-x-auto rounded border border-border bg-secondary p-3 text-sm" {...p} />
  ),
  img: ({ node: _n, ...p }) => (
    <img className="my-4 max-w-full border border-border" alt={p.alt ?? ""} {...p} />
  ),
  table: ({ node: _n, ...p }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...p} />
    </div>
  ),
  th: ({ node: _n, ...p }) => (
    <th className="border border-border bg-secondary px-3 py-2 text-left font-medium" {...p} />
  ),
  td: ({ node: _n, ...p }) => <td className="border border-border px-3 py-2" {...p} />,
};

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("max-w-none text-foreground", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}