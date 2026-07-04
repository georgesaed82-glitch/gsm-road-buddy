import { createFileRoute } from "@tanstack/react-router";
import { OfficialSignImage, SIGN_IMAGE_SIZES, type SignImageVariant } from "@/components/OfficialSignImage";
import { signs } from "@/data/signs";

// Test fixture used by the visual-regression Playwright suite.
// Renders every OfficialSignImage variant with a stable sample sign so
// screenshots can be diffed across viewports and browsers.

const SAMPLE_ID = "w-bend-right";
const VARIANTS: SignImageVariant[] = ["thumb", "card", "feedback", "detail", "hero"];
const TEST_SIGN_IMAGE_SRC = "/sign-variant-fixture.svg";

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
            <OfficialSignImage
              sign={sample}
              variant={v}
              imageSrc={TEST_SIGN_IMAGE_SRC}
              loading="eager"
            />
            <div className="text-xs text-gray-600">
              {v} · {SIGN_IMAGE_SIZES[v]}px
            </div>
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