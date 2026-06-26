import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Car, Award } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard | GSM Driving School" },
      {
        name: "description",
        content: "View your upcoming driving lessons, booking history, and progress.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here's your driving journey.</p>
        </div>
        <Button asChild>
          <Link to="/booking">Book a lesson</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hours remaining</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Package</p>
              <p className="text-lg font-bold">20-hour pass-ready</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display">Upcoming lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Driving lesson with Mark Johnson</p>
                  <p className="text-sm text-muted-foreground">Monday, 30 June 2026 · 10:00 AM</p>
                </div>
                <Button variant="outline" size="sm">Reschedule</Button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Driving lesson with Aisha Patel</p>
                  <p className="text-sm text-muted-foreground">Wednesday, 2 July 2026 · 2:00 PM</p>
                </div>
                <Button variant="outline" size="sm">Reschedule</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/booking">Book another lesson</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/contact">Contact support</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View lesson history
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
