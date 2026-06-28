import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Learner portal coming soon | GSM Driving School" },
      {
        name: "description",
        content: "The GSM Driving School learner portal is coming soon. Manage lessons, payments, and progress online.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Learner portal</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-2">Coming soon</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We're building a place for you to book lessons, track your progress, and manage payments online.
          </p>
          <p className="text-sm text-muted-foreground">
            For now, please call, WhatsApp, or email us to book your lessons.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to the site
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
