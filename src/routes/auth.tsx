import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Loader2, Chrome } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | GSM Driving School" },
      {
        name: "description",
        content: "Sign in or create an account with GSM Driving School to book lessons.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (activeTab === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) {
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Welcome to GSM Driving</CardTitle>
          <CardDescription>Sign in to book lessons and track your progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <AuthForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSubmit={handleEmailAuth}
                loading={loading}
                submitLabel="Sign in"
              />
            </TabsContent>
            <TabsContent value="signup">
              <AuthForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSubmit={handleEmailAuth}
                loading={loading}
                submitLabel="Create account"
              />
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>

          {error && (
            <p className="mt-4 text-center text-sm text-destructive">{error}</p>
          )}
          {message && (
            <p className="mt-4 text-center text-sm text-success">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  loading,
  submitLabel,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
