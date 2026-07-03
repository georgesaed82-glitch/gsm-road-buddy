import { createFileRoute } from "@tanstack/react-router";
import { OfficialSignImage, SIGN_IMAGE_SIZES, type SignImageVariant } from "@/components/OfficialSignImage";
import { signs } from "@/data/signs";
import { SignVisual } from "@/components/SignVisual";

// Test fixture used by the visual-regression Playwright suite.
// Renders every OfficialSignImage variant with a stable sample sign so
// screenshots can be diffed across viewports and browsers.

const SAMPLE_ID = "w-bend-right";
const VARIANTS: SignImageVariant[] = ["thumb", "card", "feedback", "detail", "hero"];

function DevSignVariants() {
  const sample = signs.find((s) => s.id === SAMPLE_ID) ?? signs[0];
  return (
    <main className="min-h-screen bg-white p-6">
      <h1 className="text-lg font-semibold mb-4">OfficialSignImage variants — {sample.name}</h1>
      <div
        className="flex flex-wrap items-start gap-8"
        data-testid="variant-grid"
      >
        {VARIANTS.map((v) => (
          <div
            key={v}
            data-testid={`variant-${v}`}
            data-variant={v}
            data-expected-size={SIGN_IMAGE_SIZES[v]}
            className="flex flex-col items-center gap-2"
          >
            <OfficialSignImage sign={sample} variant={v} />
            <div className="text-xs text-gray-600">
              {v} · {SIGN_IMAGE_SIZES[v]}px
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-start gap-6" data-testid="new-direction-signs">
        {signs
          .filter((s) => ["d-count-300","d-count-200","d-count-100","d-roundabout-ads","d-route-lanes"].includes(s.id))
          .map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2" data-sign-id={s.id}>
              <SignVisual variant={s.variant} size={160} />
              <div className="text-xs text-gray-600 max-w-[220px] text-center">{s.name}</div>
            </div>
          ))}
      </div>
    </main>
  );
}

export const Route = createFileRoute("/dev/sign-variants")({
  component: DevSignVariants,
  head: () => ({
    meta: [
      { title: "Sign variants (dev)" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});