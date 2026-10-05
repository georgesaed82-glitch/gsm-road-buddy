import { BUSINESS, LESSON_HOURS } from "@/lib/business";
import { publicAreas } from "@/data/areas";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { installGlobalErrorHandlers } from "../lib/lovable-error-reporting";
import { initSentryOnce } from "../lib/sentry";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { NativeAppLanguageButton } from "../components/NativeAppLanguageButton";
import { useIsNativeApp } from "../lib/isNativeApp";
import { PageViewTracker } from "../components/PageViewTracker";
import { PWAInstallTracker } from "../components/PWAInstallTracker";
import { PageSeoOverride } from "../components/PageSeoOverride";
import { registerServiceWorker } from "../lib/register-sw";
import { ThemeProvider } from "../components/ThemeProvider";
import { getSiteRating, type SiteRatingValue } from "../lib/cms.functions";
import { Toaster } from "../components/ui/sonner";
import { useIsPortal } from "../hooks/useIsPortal";
import { BackToTop } from "../components/BackToTop";
import { HomeButton } from "../components/HomeButton";
import { BottomTabBar } from "../components/BottomTabBar";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useRouterState } from "@tanstack/react-router";
import { PreviewErrorBoundary } from "../components/PreviewErrorBoundary";

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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
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
      return { rating: { rating: 5.0, review_count: 147, show: true } };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, maximum-scale=1",
      },
      { title: "GSM Driving School — Notting Hill & West London" },
      {
        name: "description",
        content: `DVSA-approved driving lessons in Notting Hill, Kensington & West London. Manual & automatic. Rated ${(loaderData?.rating.rating ?? 5).toFixed(1)} from ${loaderData?.rating.review_count ?? 147} Google reviews.`,
      },
      { name: "author", content: "GSM Driving School" },
      { property: "og:title", content: "GSM Driving School — Notting Hill & West London" },
      {
        property: "og:description",
        content: `DVSA-approved driving lessons in Notting Hill, Kensington & West London. Manual & automatic. Rated ${(loaderData?.rating.rating ?? 5).toFixed(1)} from ${loaderData?.rating.review_count ?? 147} Google reviews.`,
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GSM Driving School" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GSM Driving School — Notting Hill & West London" },
      {
        name: "twitter:description",
        content: `DVSA-approved manual and automatic driving lessons across West London. Rated ${(loaderData?.rating.rating ?? 5).toFixed(1)} from ${loaderData?.rating.review_count ?? 147} five-star Google reviews.`,
      },
      { name: "theme-color", content: "#1f3a2e" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "GSM Driving" },
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
        href: "/__l5e/assets-v1/7526de4a-499d-4b8f-bcd5-30e94b82edad/apple-touch-icon-v2.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/__l5e/assets-v1/5db92e81-b523-4022-a421-a8de1ed9bc76/icon-192-v2.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/__l5e/assets-v1/60df6c50-a56f-4b12-8bc2-6d1f4c55ed4c/icon-512-v2.png",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DrivingSchool",
          "@id": `${BUSINESS.url}/#school`,
          name: BUSINESS.name,
          alternateName: BUSINESS.legalName,
          url: BUSINESS.url,
          telephone: `+${BUSINESS.phoneIntl}`,
          email: BUSINESS.email,
          description:
            "Manual and automatic driving lessons in West London since 2005 — Notting Hill, High Street Kensington, Holland Park, North Kensington, Bayswater and Shepherd's Bush.",
          priceRange: "££",
          foundingDate: String(BUSINESS.foundingYear),
          address: {
            "@type": "PostalAddress",
            streetAddress: BUSINESS.street,
            addressLocality: BUSINESS.locality,
            postalCode: BUSINESS.postcode,
            addressCountry: "GB",
          },
          geo: { "@type": "GeoCoordinates", ...BUSINESS.geo },
          areaServed: publicAreas.flatMap((a) => [a.area, a.postcode]).map((name) => ({ "@type": "Place", name })),
          openingHoursSpecification: LESSON_HOURS.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [...h.days],
            opens: h.opens,
            closes: h.closes,
          })),
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (loaderData?.rating.rating ?? 5).toFixed(1),
            reviewCount: String(loaderData?.rating.review_count ?? 147),
          },
          sameAs: [...BUSINESS.sameAs],
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
  const isNative = useIsNativeApp();

  useEffect(() => {
    function handleExternalClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("sms:")) {
        // Inside an embedded frame (e.g. the editor preview) the browser blocks
        // tel:/mailto: navigation in the frame, so hand it to a new window the
        // same way WhatsApp links open. On the real site the default works.
        let framed = false;
        try {
          framed = window.self !== window.top;
        } catch {
          framed = true;
        }
        if (framed) {
          e.preventDefault();
          const w = window.open(href, "_blank");
          if (!w) {
            try {
              window.top!.location.href = href;
            } catch {
              window.location.href = href;
            }
          }
        }
        return;
      }

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
      <PreviewErrorBoundary>
        <div className="flex min-h-screen flex-col" suppressHydrationWarning>
          <ThemeProvider />
          <MaintenanceGate>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Skip to main content
            </a>
            {!isNative && <Header showTabs={!isPortal} />}
            <NativeAppLanguageButton />
            <main
              id="main-content"
              className={`flex-1 ${!isPortal && isNative ? "pb-[calc(env(safe-area-inset-bottom,0px)+76px)]" : ""}`}
              tabIndex={-1}
              suppressHydrationWarning
            >
              <Outlet />
            </main>
            {!isPortal && !isNative && <Footer />}
            {/* AI chat removed from public site */}
            <BackToTop />
            {isPortal && <HomeButton />}
            {!isPortal && isNative && <BottomTabBar />}
            <Toaster />
            <PageViewTracker />
            <PWAInstallTracker />
            <PageSeoOverride />
          </MaintenanceGate>
        </div>
      </PreviewErrorBoundary>
    </QueryClientProvider>
  );
}
