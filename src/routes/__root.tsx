import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { installGlobalErrorHandlers } from "../lib/lovable-error-reporting";
import { initSentryOnce } from "../lib/sentry";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AIChatWidget } from "../components/AIChatWidget";
import { PageViewTracker } from "../components/PageViewTracker";
import { PWAInstallTracker } from "../components/PWAInstallTracker";
import { PageSeoOverride } from "../components/PageSeoOverride";
import { registerServiceWorker } from "../lib/register-sw";
import { ThemeProvider } from "../components/ThemeProvider";
import { getSiteRating, type SiteRatingValue } from "../lib/cms.functions";
import { Toaster } from "../components/ui/sonner";
import { useIsPortal } from "../hooks/useIsPortal";
import { BackToTop } from "../components/BackToTop";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useRouterState } from "@tanstack/react-router";

/**
 * Temporary site-wide access gate. While `MAINTENANCE_MODE` is true, only
 * signed-in admins can view the app. Everyone else sees a maintenance
 * screen with a link to the admin sign-in. Flip the flag to `false` to
 * re-open the site.
 */
const MAINTENANCE_MODE = false;
const MAINTENANCE_ALLOWED_PATHS = ["/auth", "/reset-password"];

function MaintenanceGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin, isLoading } = useIsAdmin();
  const isAllowedPath = MAINTENANCE_ALLOWED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!MAINTENANCE_MODE || isAllowedPath || isAdmin) return <>{children}</>;
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="font-display text-xs uppercase tracking-[0.24em] text-accent">
          GSM Driving School
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
          We'll be back shortly
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The site is temporarily offline for maintenance and final testing.
          Please check back soon — we appreciate your patience.
        </p>
        <div className="mt-6">
          <Link
            to="/auth"
            search={{ admin: 1 }}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Staff sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async (): Promise<{ rating: SiteRatingValue }> => {
    try {
      const rating = await getSiteRating();
      return { rating };
    } catch {
      return { rating: { rating: 5.0, review_count: 143, show: true } };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GSM Driving School — Notting Hill & West London" },
      {
        name: "description",
        content: `DVSA-approved driving lessons in Notting Hill, Kensington & West London. Manual & automatic. Rated ${(loaderData?.rating.rating ?? 5).toFixed(1)} from ${loaderData?.rating.review_count ?? 143} Google reviews.`,
      },
      { name: "author", content: "GSM Driving School" },
      { property: "og:title", content: "GSM Driving School — Notting Hill & West London" },
      {
        property: "og:description",
        content: `DVSA-approved driving lessons in Notting Hill, Kensington & West London. Manual & automatic. Rated ${(loaderData?.rating.rating ?? 5).toFixed(1)} from ${loaderData?.rating.review_count ?? 143} Google reviews.`,
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GSM Driving School" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GSM Driving School — Notting Hill & West London" },
      {
        name: "twitter:description",
        content: `DVSA-approved manual and automatic driving lessons across West London. Rated ${(loaderData?.rating.rating ?? 5).toFixed(1)} from ${loaderData?.rating.review_count ?? 143} five-star Google reviews.`,
      },
      { name: "theme-color", content: "#1f3a2e" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "GSM" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/__l5e/assets-v1/894d4e75-3524-4881-922b-98445d0f5119/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/__l5e/assets-v1/77777731-ccc0-492e-a907-aa63024328b5/icon-192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/__l5e/assets-v1/c17592c7-8f19-482d-af80-8cb97e485da7/icon-512.png",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DrivingSchool",
          "@id": "https://www.gsmdrivingschool.com/#school",
          name: "GSM Driving School",
          alternateName: "George's School of Motoring",
          url: "https://www.gsmdrivingschool.com",
          telephone: "+447961585231",
          email: "gsmdrivingschool@outlook.com",
          description:
            "DVSA-approved driving school in West London. Manual and automatic driving lessons in Notting Hill, Kensington, Holland Park, Bayswater, Shepherd's Bush, Chiswick and Fulham.",
          priceRange: "££",
          foundingDate: "2005",
          address: {
            "@type": "PostalAddress",
            streetAddress: "71 Sandbourne House, Dartmouth Close",
            addressLocality: "London",
            postalCode: "W11 1DS",
            addressCountry: "GB",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 51.5121,
            longitude: -0.2098,
          },
          areaServed: [
            "W2",
            "W3",
            "W4",
            "W6",
            "W8",
            "W10",
            "W11",
            "W12",
            "W14",
            "SW6",
            "Notting Hill",
            "Holland Park",
            "Kensington",
            "Bayswater",
            "Shepherd's Bush",
            "Chiswick",
            "Fulham",
          ].map((a) => ({ "@type": "Place", name: a })),
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Friday"],
              opens: "07:00",
              closes: "20:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Tuesday", "Wednesday"],
              opens: "07:00",
              closes: "21:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Thursday",
              opens: "07:00",
              closes: "20:30",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "07:00",
              closes: "18:00",
            },
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (loaderData?.rating.rating ?? 5).toFixed(1),
            reviewCount: String(loaderData?.rating.review_count ?? 143),
          },
          sameAs: [
            "https://www.instagram.com/gsm_driving_school_",
            "https://www.facebook.com/share/1HySrwY5AA/?mibextid=wwXIfr",
            "https://maps.google.com/?cid=12315071950298926858",
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const routerIsPortal = useIsPortal();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const isPortal = hydrated && routerIsPortal;

  useEffect(() => {
    function handleExternalClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin === window.location.origin) return;

      e.preventDefault();

      const openedWindow = window.open(url.href, "_blank");
      if (openedWindow) {
        openedWindow.opener = null;
        openedWindow.focus();
        return;
      }

      try {
        window.top?.location.assign(url.href);
      } catch {
        window.location.assign(url.href);
      }
    }

    document.addEventListener("click", handleExternalClick, { capture: true });
    return () => document.removeEventListener("click", handleExternalClick, { capture: true });
  }, []);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    installGlobalErrorHandlers();
    void initSentryOnce();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col" suppressHydrationWarning>
        <ThemeProvider />
        <MaintenanceGate>
          <Header />
          <main className="flex-1" suppressHydrationWarning>
            <Outlet />
          </main>
          {!isPortal && <Footer />}
          {!isPortal && <AIChatWidget />}
          {isPortal && <BackToTop />}
          <Toaster />
          <PageViewTracker />
          <PWAInstallTracker />
          <PageSeoOverride />
        </MaintenanceGate>
      </div>
    </QueryClientProvider>
  );
}
