import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, RotateCcw, Rocket, Upload, Trash2, Copy as CopyIcon, RefreshCw } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getThemeSettings,
  saveThemeDraft,
  publishTheme,
  resetThemeDraft,
  listBrandAssets,
  uploadBrandAsset,
  deleteBrandAsset,
  type ThemeTokens,
  type BrandAsset,
} from "@/lib/theme.functions";

export const Route = createFileRoute("/_authenticated/admin/theme")({
  head: () => ({ meta: [{ title: "Theme & branding · Admin" }] }),
  component: AdminThemePage,
});

const DEFAULT_TOKENS: ThemeTokens = {
  brand: { name: "GSM Driving School", tagline: "", logoUrl: "", faviconUrl: "" },
  colors: {
    background: "oklch(0.97 0.01 95)",
    foreground: "oklch(0.25 0.03 155)",
    card: "oklch(0.99 0.005 95)",
    cardForeground: "oklch(0.25 0.03 155)",
    primary: "oklch(0.45 0.08 155)",
    primaryForeground: "oklch(0.97 0.01 95)",
    secondary: "oklch(0.94 0.02 95)",
    secondaryForeground: "oklch(0.25 0.03 155)",
    accent: "oklch(0.65 0.12 50)",
    accentForeground: "oklch(0.99 0.005 95)",
    muted: "oklch(0.93 0.01 95)",
    mutedForeground: "oklch(0.55 0.03 150)",
    destructive: "oklch(0.55 0.2 28)",
    border: "oklch(0.88 0.01 100)",
    ring: "oklch(0.45 0.08 155)",
  },
  typography: { headingFont: "Arial", bodyFont: "Arial", baseSize: "16px", headingWeight: "600" },
  buttons: { radius: "0px", weight: "600", shadow: "none", uppercase: false },
  layout: {
    radius: "0.75rem",
    containerMaxWidth: "1200px",
    sectionSpacing: "4rem",
    cardBorder: "1px",
    cardShadow: "none",
  },
  header: { sticky: true, transparent: false, showTagline: true },
  footer: { showSocial: true, showAreas: true, copyright: "© GSM Driving School" },
  mobile: { baseSize: "15px", sectionSpacing: "2.5rem" },
};

const GOOGLE_FONTS = [
  "Arial",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Nunito",
  "Raleway",
  "Playfair Display",
  "Merriweather",
  "Oswald",
  "Bebas Neue",
  "DM Sans",
  "Work Sans",
  "Space Grotesk",
  "Manrope",
  "Outfit",
  "Figtree",
  "Rubik",
  "Karla",
  "Cormorant Garamond",
  "Libre Baskerville",
  "Fira Sans",
];

const SHADOWS = [
  { label: "None", value: "none" },
  { label: "Small", value: "0 1px 2px rgba(0,0,0,0.06)" },
  { label: "Medium", value: "0 4px 12px rgba(0,0,0,0.10)" },
  { label: "Large", value: "0 12px 32px rgba(0,0,0,0.14)" },
  { label: "XL", value: "0 24px 60px rgba(0,0,0,0.18)" },
];

function mergeDeep(base: ThemeTokens, patch: Partial<ThemeTokens>): ThemeTokens {
  const out: ThemeTokens = { ...base } as ThemeTokens;
  for (const k of Object.keys(patch) as (keyof ThemeTokens)[]) {
    const v = patch[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      (out[k] as unknown) = { ...(base[k] as object), ...(v as object) };
    } else if (v !== undefined) {
      (out[k] as unknown) = v;
    }
  }
  return out;
}

function AdminThemePage() {
const qc = useQueryClient();
  const getSettingsFn = useServerFn(getThemeSettings);
  const saveDraftFn = useServerFn(saveThemeDraft);
  const publishFn = useServerFn(publishTheme);
  const resetFn = useServerFn(resetThemeDraft);
  const listAssetsFn = useServerFn(listBrandAssets);
  const uploadAssetFn = useServerFn(uploadBrandAsset);
  const deleteAssetFn = useServerFn(deleteBrandAsset);

  const settings = useQuery({
    queryKey: ["admin", "theme"],
    queryFn: () => getSettingsFn({ data: {} }),
    enabled: !!password,
  });

  const assets = useQuery({
    queryKey: ["admin", "brand-assets"],
    queryFn: () => listAssetsFn(),
  });

  const [tokens, setTokens] = useState<ThemeTokens>(DEFAULT_TOKENS);
  const [dirty, setDirty] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!settings.data) return;
    const base = mergeDeep(DEFAULT_TOKENS, settings.data.published);
    const withDraft = mergeDeep(base, settings.data.draft);
    setTokens(withDraft);
    setDirty(Object.keys(settings.data.draft ?? {}).length > 0);
  }, [settings.data]);

  // Push preview tokens into iframe whenever they change.
  useEffect(() => {
    const send = () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "gsm-theme-preview", tokens },
        "*",
      );
    };
    send();
    const handler = (ev: MessageEvent) => {
      if ((ev.data as { type?: string })?.type === "gsm-theme-preview-ready") send();
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [tokens]);

  const patch = (partial: Partial<ThemeTokens>) => {
    setTokens((t) => mergeDeep(t, partial));
    setDirty(true);
  };

  const onSaveDraft = async () => {
    try {
      await saveDraftFn({ data: { draft: tokens as unknown as Record<string, unknown> } });
      toast.success("Draft saved");
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["admin", "theme"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onPublish = async () => {
    try {
      // Save current UI state as draft first, then publish.
      await saveDraftFn({ data: { draft: tokens as unknown as Record<string, unknown> } });
      await publishFn({ data: {} });
      toast.success("Theme published — live site updated");
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["admin", "theme"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onReset = async () => {
    if (!confirm("Discard draft changes and return to the published theme?")) return;
    try {
      await resetFn({ data: {} });
      toast.success("Draft cleared");
      qc.invalidateQueries({ queryKey: ["admin", "theme"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminShell title="Theme & branding" eyebrow="Visual identity">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Editor column */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onSaveDraft} variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" /> Save draft
            </Button>
            <Button onClick={onPublish} size="sm">
              <Rocket className="mr-2 h-4 w-4" /> Publish
            </Button>
            <Button onClick={onReset} variant="ghost" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" /> Discard draft
            </Button>
            {dirty && (
              <span className="rounded-full bg-warning/15 px-3 py-1 text-xs text-warning-foreground">
                Unpublished changes
              </span>
            )}
          </div>

          <Tabs defaultValue="brand" className="w-full">
            <TabsList className="flex flex-wrap justify-start">
              <TabsTrigger value="brand">Brand</TabsTrigger>
              <TabsTrigger value="colors">Colours</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="header">Header</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="brand" className="space-y-4 pt-4">
              <FieldText label="Business name" value={tokens.brand.name} onChange={(v) => patch({ brand: { ...tokens.brand, name: v } })} />
              <FieldText label="Tagline" value={tokens.brand.tagline} onChange={(v) => patch({ brand: { ...tokens.brand, tagline: v } })} />
              <FieldImage
                label="Logo URL"
                value={tokens.brand.logoUrl}
                assets={assets.data ?? []}
                onChange={(v) => patch({ brand: { ...tokens.brand, logoUrl: v } })}
              />
              <FieldImage
                label="Favicon URL"
                value={tokens.brand.faviconUrl}
                assets={assets.data ?? []}
                onChange={(v) => patch({ brand: { ...tokens.brand, faviconUrl: v } })}
              />
            </TabsContent>

            <TabsContent value="colors" className="space-y-3 pt-4">
              {Object.entries(tokens.colors).map(([key, value]) => (
                <ColorField
                  key={key}
                  label={key}
                  value={value}
                  onChange={(v) => patch({ colors: { ...tokens.colors, [key]: v } })}
                />
              ))}
            </TabsContent>

            <TabsContent value="typography" className="space-y-4 pt-4">
              <FontField label="Heading font" value={tokens.typography.headingFont} onChange={(v) => patch({ typography: { ...tokens.typography, headingFont: v } })} />
              <FontField label="Body font" value={tokens.typography.bodyFont} onChange={(v) => patch({ typography: { ...tokens.typography, bodyFont: v } })} />
              <FieldText label="Base size (px)" value={tokens.typography.baseSize} onChange={(v) => patch({ typography: { ...tokens.typography, baseSize: v } })} />
              <FieldText label="Heading weight" value={tokens.typography.headingWeight} onChange={(v) => patch({ typography: { ...tokens.typography, headingWeight: v } })} />
            </TabsContent>

            <TabsContent value="buttons" className="space-y-4 pt-4">
              <FieldText label="Radius" value={tokens.buttons.radius} onChange={(v) => patch({ buttons: { ...tokens.buttons, radius: v } })} />
              <FieldText label="Font weight" value={tokens.buttons.weight} onChange={(v) => patch({ buttons: { ...tokens.buttons, weight: v } })} />
              <ShadowField label="Shadow" value={tokens.buttons.shadow} onChange={(v) => patch({ buttons: { ...tokens.buttons, shadow: v } })} />
              <SwitchField label="Uppercase labels" value={tokens.buttons.uppercase} onChange={(v) => patch({ buttons: { ...tokens.buttons, uppercase: v } })} />
            </TabsContent>

            <TabsContent value="layout" className="space-y-4 pt-4">
              <FieldText label="Card radius" value={tokens.layout.radius} onChange={(v) => patch({ layout: { ...tokens.layout, radius: v } })} />
              <FieldText label="Container max width" value={tokens.layout.containerMaxWidth} onChange={(v) => patch({ layout: { ...tokens.layout, containerMaxWidth: v } })} />
              <FieldText label="Section spacing" value={tokens.layout.sectionSpacing} onChange={(v) => patch({ layout: { ...tokens.layout, sectionSpacing: v } })} />
              <FieldText label="Card border width" value={tokens.layout.cardBorder} onChange={(v) => patch({ layout: { ...tokens.layout, cardBorder: v } })} />
              <ShadowField label="Card shadow" value={tokens.layout.cardShadow} onChange={(v) => patch({ layout: { ...tokens.layout, cardShadow: v } })} />
            </TabsContent>

            <TabsContent value="header" className="space-y-4 pt-4">
              <SwitchField label="Sticky header" value={tokens.header.sticky} onChange={(v) => patch({ header: { ...tokens.header, sticky: v } })} />
              <SwitchField label="Transparent when at top" value={tokens.header.transparent} onChange={(v) => patch({ header: { ...tokens.header, transparent: v } })} />
              <SwitchField label="Show tagline" value={tokens.header.showTagline} onChange={(v) => patch({ header: { ...tokens.header, showTagline: v } })} />
            </TabsContent>

            <TabsContent value="footer" className="space-y-4 pt-4">
              <SwitchField label="Show social links" value={tokens.footer.showSocial} onChange={(v) => patch({ footer: { ...tokens.footer, showSocial: v } })} />
              <SwitchField label="Show areas covered" value={tokens.footer.showAreas} onChange={(v) => patch({ footer: { ...tokens.footer, showAreas: v } })} />
              <FieldText label="Copyright text" value={tokens.footer.copyright} onChange={(v) => patch({ footer: { ...tokens.footer, copyright: v } })} />
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4 pt-4">
              <FieldText label="Mobile base font size" value={tokens.mobile.baseSize} onChange={(v) => patch({ mobile: { ...tokens.mobile, baseSize: v } })} />
              <FieldText label="Mobile section spacing" value={tokens.mobile.sectionSpacing} onChange={(v) => patch({ mobile: { ...tokens.mobile, sectionSpacing: v } })} />
            </TabsContent>

            <TabsContent value="assets" className="pt-4">
              <AssetsPanel
                assets={assets.data ?? []}
                onUpload={async (name, file) => {
                  const b64 = await fileToBase64(file);
                  await uploadAssetFn({
                    data: {
                      name,
                      filename: file.name,
                      content_type: file.type || "image/png",
                      base64: b64,
                    },
                  });
                  toast.success("Asset uploaded");
                  qc.invalidateQueries({ queryKey: ["admin", "brand-assets"] });
                }}
                onDelete={async (id) => {
                  if (!confirm("Delete asset?")) return;
                  await deleteAssetFn({ data: { id } });
                  qc.invalidateQueries({ queryKey: ["admin", "brand-assets"] });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Live preview column */}
        <div className="space-y-2 xl:sticky xl:top-6 xl:h-fit">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live preview</div>
            <Button size="sm" variant="ghost" onClick={() => iframeRef.current?.contentWindow?.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reload
            </Button>
          </div>
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <iframe
              ref={iframeRef}
              title="Theme live preview"
              src="/?theme_preview=1"
              className="h-[80vh] w-full"
            />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

// ---------- Field components ----------

function FieldText({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SwitchField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <Label className="cursor-pointer">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const previewStyle = useMemo(() => {
    // If it looks like a hex, use it directly; otherwise let CSS parse (oklch, rgb, etc.).
    return { background: value };
  }, [value]);
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-9 w-9 shrink-0 rounded border border-border"
        style={previewStyle}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 font-mono text-xs" />
      </div>
      <input
        type="color"
        className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent"
        onChange={(e) => onChange(e.target.value)}
        title="Pick a hex colour"
      />
    </div>
  );
}

function FontField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose font" />
        </SelectTrigger>
        <SelectContent>
          {GOOGLE_FONTS.map((f) => (
            <SelectItem key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ShadowField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SHADOWS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FieldImage({
  label,
  value,
  assets,
  onChange,
}: {
  label: string;
  value: string;
  assets: BrandAsset[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-12 w-12 rounded border border-border object-contain" />
        ) : (
          <div className="h-12 w-12 rounded border border-dashed border-border" />
        )}
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL" />
      </div>
      {assets.length > 0 && (
        <Select onValueChange={(v) => onChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="…or pick from assets library" />
          </SelectTrigger>
          <SelectContent>
            {assets.map((a) => (
              <SelectItem key={a.id} value={a.url}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function AssetsPanel({
  assets,
  onUpload,
  onDelete,
}: {
  assets: BrandAsset[];
  onUpload: (name: string, file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const effectiveName = name || file.name.replace(/\.[^.]+$/, "");
    setBusy(true);
    try {
      await onUpload(effectiveName, file);
      setName("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-dashed border-border p-4">
        <Label>Upload new asset</Label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            placeholder="Asset name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            disabled={busy}
            className="text-xs"
          />
          {busy && <span className="text-xs text-muted-foreground">Uploading…</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {assets.map((a) => (
          <div key={a.id} className="group relative rounded-md border border-border bg-card p-2">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt={a.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="mt-2 truncate text-xs">{a.name}</div>
            <div className="mt-1 flex justify-between gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(a.url).then(() => toast.success("URL copied"))}
                title="Copy URL"
              >
                <CopyIcon className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(a.id)} title="Delete">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {!assets.length && (
          <div className="col-span-full rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No assets uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}

// avoid unused import lint on Upload icon
void Upload;