import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { listSiteSettings, upsertSiteSetting } from "@/lib/cms.functions";
export const Route = createFileRoute("/_authenticated/admin/site-settings")({
  head: () => ({ meta: [{ title: "Site settings · Admin" }] }),
  component: SiteSettingsPage,
});

type BusinessValue = {
  name?: string; tagline?: string; phone?: string; phone_intl?: string; email?: string; address?: string;
};
type HoursValue = Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", string>;
type SocialValue = { facebook?: string; instagram?: string; tiktok?: string; youtube?: string };
type FooterValue = { copy?: string; disclaimer?: string };

function SiteSettingsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listSiteSettings);
  const saveFn = useServerFn(upsertSiteSetting);
  const { data: rows = [] } = useQuery({ queryKey: ["site-settings"], queryFn: () => listFn() });

  const [business, setBusiness] = useState<BusinessValue>({});
  const [hours, setHours] = useState<HoursValue>({ mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "" });
  const [social, setSocial] = useState<SocialValue>({});
  const [footer, setFooter] = useState<FooterValue>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const map = new Map(rows.map((r) => [r.key, r.value]));
    setBusiness((map.get("business") ?? {}) as BusinessValue);
    const h = (map.get("opening_hours") as Partial<HoursValue>) ?? {};
    setHours({ mon: h.mon ?? "", tue: h.tue ?? "", wed: h.wed ?? "", thu: h.thu ?? "", fri: h.fri ?? "", sat: h.sat ?? "", sun: h.sun ?? "" });
    setSocial((map.get("social") ?? {}) as SocialValue);
    setFooter((map.get("footer") ?? {}) as FooterValue);
  }, [rows]);

  const save = async (key: string, value: object) => {
if (!password) return toast.error("Admin password missing. Sign in via /auth?admin=1.");
    setSaving(key);
    try {
      await saveFn({ data: { password, key, value: value as Record<string, never> } });
      toast.success("Saved");
      await qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminShell eyebrow="Admin" title="Site settings">
      <div className="grid gap-6">
        <Card>
          <CardHeader><h2 className="font-display text-xl">Business & contact</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Business name</Label><Input className="mt-1" value={business.name ?? ""} onChange={(e) => setBusiness({ ...business, name: e.target.value })} /></div>
              <div><Label>Tagline</Label><Input className="mt-1" value={business.tagline ?? ""} onChange={(e) => setBusiness({ ...business, tagline: e.target.value })} /></div>
              <div><Label>Phone (display)</Label><Input className="mt-1" value={business.phone ?? ""} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} /></div>
              <div><Label>Phone (WhatsApp intl, no +)</Label><Input className="mt-1" value={business.phone_intl ?? ""} onChange={(e) => setBusiness({ ...business, phone_intl: e.target.value })} /></div>
              <div><Label>Email</Label><Input className="mt-1" value={business.email ?? ""} onChange={(e) => setBusiness({ ...business, email: e.target.value })} /></div>
              <div><Label>Address</Label><Input className="mt-1" value={business.address ?? ""} onChange={(e) => setBusiness({ ...business, address: e.target.value })} /></div>
            </div>
            <Button onClick={() => save("business", business)} disabled={saving === "business"}><Save className="mr-2 h-4 w-4" />{saving === "business" ? "Saving…" : "Save business"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-display text-xl">Opening hours</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(hours) as Array<keyof HoursValue>).map((d) => (
                <div key={d}><Label className="capitalize">{d}</Label><Input className="mt-1" value={hours[d]} onChange={(e) => setHours({ ...hours, [d]: e.target.value })} /></div>
              ))}
            </div>
            <Button onClick={() => save("opening_hours", hours)} disabled={saving === "opening_hours"}><Save className="mr-2 h-4 w-4" />{saving === "opening_hours" ? "Saving…" : "Save hours"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-display text-xl">Social links</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Facebook URL</Label><Input className="mt-1" value={social.facebook ?? ""} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} /></div>
              <div><Label>Instagram URL</Label><Input className="mt-1" value={social.instagram ?? ""} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} /></div>
              <div><Label>TikTok URL</Label><Input className="mt-1" value={social.tiktok ?? ""} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} /></div>
              <div><Label>YouTube URL</Label><Input className="mt-1" value={social.youtube ?? ""} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} /></div>
            </div>
            <Button onClick={() => save("social", social)} disabled={saving === "social"}><Save className="mr-2 h-4 w-4" />{saving === "social" ? "Saving…" : "Save social"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-display text-xl">Footer</h2></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Footer copy line</Label><Textarea className="mt-1" value={footer.copy ?? ""} onChange={(e) => setFooter({ ...footer, copy: e.target.value })} /></div>
            <div><Label>Disclaimer</Label><Textarea className="mt-1" value={footer.disclaimer ?? ""} onChange={(e) => setFooter({ ...footer, disclaimer: e.target.value })} /></div>
            <Button onClick={() => save("footer", footer)} disabled={saving === "footer"}><Save className="mr-2 h-4 w-4" />{saving === "footer" ? "Saving…" : "Save footer"}</Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}