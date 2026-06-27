import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile · GSM Learner Portal" }] }),
  component: ProfilePage,
});

const schema = z.object({
  full_name: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  postcode: z.string().trim().max(12).optional().or(z.literal("")),
  license_number: z.string().trim().max(40).optional().or(z.literal("")),
  transmission: z.enum(["manual", "automatic"]),
  target_test_date: z.string().optional().or(z.literal("")),
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["profile-page"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { user, profile };
    },
  });

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    postcode: "",
    license_number: "",
    transmission: "manual" as "manual" | "automatic",
    target_test_date: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setForm({
        full_name: data.profile.full_name ?? "",
        phone: data.profile.phone ?? "",
        postcode: data.profile.postcode ?? "",
        license_number: data.profile.license_number ?? "",
        transmission: (data.profile.transmission as "manual" | "automatic") ?? "manual",
        target_test_date: data.profile.target_test_date ?? "",
      });
    }
  }, [data?.profile]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    if (!data?.user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: form.full_name || null,
      phone: form.phone || null,
      postcode: form.postcode || null,
      license_number: form.license_number || null,
      transmission: form.transmission,
      target_test_date: form.target_test_date || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated");
    queryClient.invalidateQueries({ queryKey: ["profile-page"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <PortalShell title="Your profile" eyebrow="Account">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <form onSubmit={onSave} className="grid max-w-2xl gap-6">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={data?.user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">
              To change your email, contact us at gsmdrivingschool@outlook.com.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                maxLength={30}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={form.postcode}
                onChange={(e) => setForm({ ...form, postcode: e.target.value.toUpperCase() })}
                maxLength={12}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="license_number">Provisional licence number</Label>
              <Input
                id="license_number"
                value={form.license_number}
                onChange={(e) => setForm({ ...form, license_number: e.target.value.toUpperCase() })}
                maxLength={40}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transmission">Transmission</Label>
              <select
                id="transmission"
                value={form.transmission}
                onChange={(e) => setForm({ ...form, transmission: e.target.value as "manual" | "automatic" })}
                className="h-10 border border-input bg-background px-3 text-sm"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="target_test_date">Target test date</Label>
            <Input
              id="target_test_date"
              type="date"
              value={form.target_test_date}
              onChange={(e) => setForm({ ...form, target_test_date: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </PortalShell>
  );
}