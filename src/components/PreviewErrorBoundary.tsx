import { Component, type ErrorInfo, type ReactNode } from "react";

import { reportLovableError } from "@/lib/lovable-error-reporting";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
  source: "render" | "runtime" | null;
};

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

function isRecoverableReactNoise(error: Error) {
  const message = error.message || "";
  return (
    message.includes("Hydration failed because") ||
    message.includes("Minified React error #418") ||
    message.includes("Minified React error #423")
  );
}

export class PreviewErrorBoundary extends Component<Props, State> {
  state: State = { error: null, source: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: toError(error), source: "render" };
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    reportLovableError(error, {
      boundary: "preview_error_boundary",
      componentStack: info.componentStack,
      mechanism: "react_error_boundary",
    });
  }

  handleWindowError = (event: ErrorEvent) => {
    const error = toError(event.error ?? event.message);
    if (isRecoverableReactNoise(error)) return;
    this.setState({ error, source: "runtime" });
    reportLovableError(error, { boundary: "preview_error_boundary", mechanism: "onerror" });
  };

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = toError(event.reason);
    if (isRecoverableReactNoise(error)) return;
    this.setState({ error, source: "runtime" });
    reportLovableError(error, {
      boundary: "preview_error_boundary",
      mechanism: "unhandledrejection",
    });
  };

  reset = () => {
    this.setState({ error: null, source: null });
  };

  render() {
    const { error, source } = this.state;
    if (!error) return this.props.children;

    return (
      <main className="min-h-screen bg-background px-5 py-16 text-foreground">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            GSM Driving School
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-primary">
            The preview hit a runtime error
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The page has been kept open so the error can be diagnosed instead of the screen
            disappearing. Please try again, or refresh the page if the problem continues.
          </p>
          <pre className="mt-5 max-h-56 overflow-auto rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
            {source ? `${source}: ` : ""}
            {error.message}
          </pre>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={this.reset}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-primary"
            >
              Refresh page
            </button>
            <a
              href="/"
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-primary"
            >
              Go home
            </a>
          </div>
        </div>
      </main>
    );
  }
}