import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Markdown } from "@/components/Markdown";
import { listPublishedFaqs } from "@/lib/blog.functions";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | GSM Driving School" },
      {
        name: "description",
        content:
          "Answers to the most common questions about lessons, pricing, tests and driving with GSM Driving School.",
      },
      { property: "og:title", content: "FAQ | GSM Driving School" },
      {
        property: "og:description",
        content: "Answers about lessons, pricing and driving tests with GSM.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.gsmdrivingschool.com/faq" }],
  }),
  component: FaqPage,
  loader: async ({ context }) => {
    const faqs = await context.queryClient.fetchQuery({
      queryKey: ["faqs-public"],
      queryFn: () => listPublishedFaqs(),
    });
    return { faqs };
  },
});

function FaqPage() {
  const listFn = useServerFn(listPublishedFaqs);
  const { data: faqs = [] } = useQuery({
    queryKey: ["faqs-public"],
    queryFn: () => listFn(),
  });
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? faqs.filter(
          (f) =>
            f.question.toLowerCase().includes(needle) ||
            f.answer.toLowerCase().includes(needle),
        )
      : faqs;
    const map = new Map<string, typeof faqs>();
    for (const f of list) {
      const key = f.category || "General";
      const arr = map.get(key) ?? [];
      arr.push(f);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [faqs, q]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">FAQ</span>
      </nav>
      <h1 className="font-display text-3xl md:text-4xl">Frequently asked questions</h1>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search questions…"
        className="mt-6"
      />

      {grouped.length === 0 && (
        <p className="mt-8 text-muted-foreground">No questions match your search.</p>
      )}

      {grouped.map(([category, items]) => (
        <section key={category} className="mt-8">
          <h2 className="font-display text-xl text-foreground">{category}</h2>
          <Accordion type="multiple" className="mt-2">
            {items.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                <AccordionContent>
                  <Markdown>{f.answer}</Markdown>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  );
}