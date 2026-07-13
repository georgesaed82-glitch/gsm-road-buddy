import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Palette,
  Settings,
  Home as HomeIcon,
  ListTree,
  Search,
  Newspaper,
  ImagePlus,
  GraduationCap,
  BookOpen,
  Video,
  Film,
  Image as ImageIcon,
  Route as RouteIcon,
  Hand,
  SignpostBig,
  Sparkles,
  FileDown,
  Users,
  Tag,
  HelpCircle,
  MapPin,
  Star,
  Camera,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/website")({
  component: WebsiteContentHub,
});

type Card = { to: string; label: string; desc: string; icon: LucideIcon; highlight?: boolean };
type Section = { title: string; blurb: string; cards: Card[] };

const sections: Section[] = [
  {
    title: "Design & structure",
    blurb: "Look and feel, layout, menus and search-engine metadata.",
    cards: [
      {
        to: "/admin/theme",
        label: "Theme & branding",
        desc: "Colours, fonts, buttons and card styles.",
        icon: Palette,
      },
      {
        to: "/admin/site-settings",
        label: "Site settings",
        desc: "Rating, contact details and global toggles.",
        icon: Settings,
      },
      {
        to: "/admin/navigation",
        label: "Navigation menus",
        desc: "Header, footer and portal menu items.",
        icon: ListTree,
      },
      {
        to: "/admin/seo",
        label: "Page SEO",
        desc: "Titles, descriptions and social share images per page.",
        icon: Search,
      },
    ],
  },
  {
    title: "Pages & content",
    blurb: "Edit the homepage sections and the rest of the public website.",
    cards: [
      {
        to: "/admin/home",
        label: "Homepage sections",
        desc: "Reorder, hide, duplicate and edit every homepage block.",
        icon: HomeIcon,
        highlight: true,
      },
      {
        to: "/admin/blocks",
        label: "George's methods & reviews",
        desc: "The featured teaching cards and testimonial blocks.",
        icon: Sparkles,
      },
      {
        to: "/admin/content",
        label: "Signs, markings & Highway Code",
        desc: "Override wording for any built-in learner content.",
        icon: SignpostBig,
      },
      {
        to: "/admin/legal",
        label: "Legal pages",
        desc: "Terms, privacy, cookies and other statutory pages.",
        icon: Newspaper,
      },
      {
        to: "/admin/blog",
        label: "Blog & articles",
        desc: "Long-form posts and category pages.",
        icon: Newspaper,
      },
      {
        to: "/admin/faqs",
        label: "FAQs",
        desc: "Questions and answers grouped by topic.",
        icon: HelpCircle,
      },
    ],
  },
  {
    title: "Media",
    blurb: "Pictures, video, GIFs, MP4 animations and downloadable resources.",
    cards: [
      {
        to: "/admin/media",
        label: "Media library",
        desc: "Upload, browse, copy URLs and delete every uploaded file.",
        icon: ImagePlus,
        highlight: true,
      },
      {
        to: "/admin/downloads",
        label: "Downloads",
        desc: "PDFs, worksheets and lesson resources.",
        icon: FileDown,
      },
      {
        to: "/admin/student-passes",
        label: "Student pass photos",
        desc: "Success stories displayed on the homepage.",
        icon: Camera,
      },
    ],
  },
  {
    title: "Training content",
    blurb: "Driving strategies, theory questions, animations and practical clips.",
    cards: [
      {
        to: "/admin/lessons",
        label: "Lessons CMS",
        desc: "Driving strategies and lesson plans.",
        icon: GraduationCap,
        highlight: true,
      },
      {
        to: "/admin/theory",
        label: "Theory questions CMS",
        desc: "Mock-test questions, answers and explanations.",
        icon: BookOpen,
      },
      {
        to: "/admin/hazard-clips",
        label: "Practical animations",
        desc: "The interactive strategy animations.",
        icon: Video,
      },
      {
        to: "/admin/hazard-videos",
        label: "Hazard perception CMS",
        desc: "Hazard-perception mock clips.",
        icon: Film,
      },
      {
        to: "/admin/road-signs",
        label: "Road signs library",
        desc: "UK road-sign catalogue and quiz images.",
        icon: ImageIcon,
      },
      {
        to: "/admin/road-markings",
        label: "Road markings library",
        desc: "Painted markings and their meanings.",
        icon: RouteIcon,
      },
      {
        to: "/admin/police-signals",
        label: "Arm signals library",
        desc: "Police and driver hand signals.",
        icon: Hand,
      },
    ],
  },
  {
    title: "Business",
    blurb: "Instructors, pricing, reviews and coverage areas.",
    cards: [
      {
        to: "/admin/instructors",
        label: "Instructors",
        desc: "Team profiles shown across the site.",
        icon: Users,
      },
      {
        to: "/admin/pricing",
        label: "Pricing packages",
        desc: "Lesson packages and their pricing.",
        icon: Tag,
      },
      {
        to: "/admin/reviews",
        label: "Reviews",
        desc: "Testimonials shown on the site.",
        icon: Star,
      },
      {
        to: "/admin/areas",
        label: "Areas covered",
        desc: "Location pages and their metadata.",
        icon: MapPin,
      },
    ],
  },
];

function WebsiteContentHub() {
  return (
    <AdminShell eyebrow="Admin" title="Website & Content Manager">
      <p className="-mt-3 mb-8 max-w-2xl text-sm text-muted-foreground">
        One place to edit every part of the public website, the training content and the media
        used across GSM Plus. Changes save immediately in each editor — the public site only
        updates when you press <strong className="text-foreground">Publish</strong> from the
        deploy panel.
      </p>

      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.title}>
            <div className="mb-4">
              <h2 className="font-display text-xl text-foreground">{s.title}</h2>
              <p className="text-xs text-muted-foreground">{s.blurb}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {s.cards.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.to}
                    to={c.to}
                    className={`group relative flex items-start gap-3 rounded-lg border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md ${
                      c.highlight
                        ? "border-accent/40 bg-accent/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        c.highlight
                          ? "bg-accent/15 text-accent"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-base text-foreground">{c.label}</div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}