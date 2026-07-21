import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Copy, Bot, RefreshCw, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect an AI Assistant | GSM Driving School" },
      {
        name: "description",
        content:
          "Connect ChatGPT or Claude to GSM Driving School via MCP to ask about lessons, areas, bookings, and contact details.",
      },
      { property: "og:title", content: "Connect an AI Assistant | GSM Driving School" },
      {
        property: "og:description",
        content:
          "Connect ChatGPT or Claude to GSM Driving School via MCP to ask about lessons, areas, bookings, and contact details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConnectPage,
});

function useCopy() {
  const [copied, setCopied] = useState(false);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return { copied, copy };
}

function ConnectPage() {
  const mcpUrl = typeof window !== "undefined" ? new URL("/mcp", window.location.origin).toString() : "https://www.gsmdrivingschool.com/mcp";
  const { copied, copy } = useCopy();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Connect an AI Assistant
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Link ChatGPT or Claude to GSM Driving School so you can ask about
          lessons, coverage areas, and bookings using your account.
        </p>
      </div>

      <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Bot className="h-5 w-5 text-accent" />
            MCP Server URL
          </CardTitle>
          <CardDescription>
            Copy this address and paste it into ChatGPT or Claude.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 rounded-md bg-muted px-4 py-3 text-xs font-mono break-all text-foreground">
              {mcpUrl}
            </code>
            <Button
              onClick={() => copy(mcpUrl)}
              className="shrink-0 gap-2"
              variant={copied ? "default" : "outline"}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy URL
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">ChatGPT</CardTitle>
            <CardDescription>Connect from the ChatGPT website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
              <li>
                Open{" "}
                <a
                  href="https://chatgpt.com/#settings/Connectors/Advanced"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                >
                  ChatGPT Connectors <ExternalLink className="h-3 w-3" />
                </a>{" "}
                and enable Developer mode.
              </li>
              <li>In the chat composer, turn on Developer mode.</li>
              <li>Click "Add sources", then "Connect more".</li>
              <li>Name the connector (e.g. "GSM Driving School") and paste the MCP URL above.</li>
              <li>Start a new chat and ask ChatGPT to use GSM Driving School.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Claude</CardTitle>
            <CardDescription>Connect from the Claude website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
              <li>
                Open{" "}
                <a
                  href="https://claude.ai/customize/connectors?modal=add-custom-connector"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                >
                  Claude Connectors <ExternalLink className="h-3 w-3" />
                </a>
                .
              </li>
              <li>Name the connector (e.g. "GSM Driving School") and paste the MCP URL above.</li>
              <li>Enable the connector from the chat composer.</li>
              <li>Start a new chat and ask Claude to use GSM Driving School.</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <RefreshCw className="h-5 w-5 text-accent" />
            Refresh after the app changes
          </CardTitle>
          <CardDescription>
            AI assistants cache the tool list. After I publish an update, refresh the connection to get the latest tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-display text-sm font-semibold">ChatGPT</h3>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Open the app preferences and pick this connector under "Enabled apps".</li>
              <li>Next to "Information", click "Refresh".</li>
              <li>If the URL changed, paste the latest URL from above.</li>
              <li>Start a new chat and ask ChatGPT to use the app.</li>
            </ol>
          </div>
          <div>
            <h3 className="mb-2 font-display text-sm font-semibold">Claude</h3>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Open the Connectors page and select this connector.</li>
              <li>Refresh or update the connector's tools.</li>
              <li>If the URL changed, paste the latest URL from above.</li>
              <li>Ask Claude to use the app again.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        The connection is protected by OAuth — you sign in as a real GSM user,
        and the assistant only sees what your account can see.
      </p>
    </div>
  );
}
