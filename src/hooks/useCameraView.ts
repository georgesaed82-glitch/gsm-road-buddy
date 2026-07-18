import { useState, useCallback } from "react";

// GSM camera views. Every lesson diagram is authored in the "overhead"
// coordinate space (viewBox 0 0 640 360). This hook returns a CSS
// transform + a semantic label so LessonShell can flip between angles
// without asking the lesson to re-draw itself.
//
// - overhead  : plain top-down (default, no transform)
// - driver    : tilt the plane so the horizon recedes (POV feel)
// - examiner  : off-set overhead / slight tilt from the passenger seat
export type CameraView = "overhead" | "driver" | "examiner";

export const CAMERA_LABEL: Record<CameraView, string> = {
  overhead: "Overhead",
  driver: "Driver POV",
  examiner: "Examiner",
};

export function cameraTransform(view: CameraView): string {
  switch (view) {
    case "driver":
      return "perspective(900px) rotateX(52deg) scale(1.05) translateY(4%)";
    case "examiner":
      return "perspective(1100px) rotateX(28deg) rotateZ(-4deg) scale(1.02)";
    case "overhead":
    default:
      return "none";
  }
}

export function useCameraView(initial: CameraView = "overhead") {
  const [view, setView] = useState<CameraView>(initial);
  const cycle = useCallback(() => {
    setView((v) => (v === "overhead" ? "driver" : v === "driver" ? "examiner" : "overhead"));
  }, []);
  return { view, setView, cycle, transform: cameraTransform(view), label: CAMERA_LABEL[view] };
}