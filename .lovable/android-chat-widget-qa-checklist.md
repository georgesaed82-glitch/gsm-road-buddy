# Android Chrome QA Checklist — Chat Widget

Use this after any update to the chat widget (`src/components/AIChatWidget.tsx`) or global layout changes.

Test on a real Android device or Chrome DevTools at **390×844 @ 2.75× DPR** (or your target device).

## 1. No Zoom on Input Focus
- [ ] Tap the chat input. Chrome does **not** zoom in (`visualViewport.scale` stays `1`).
- [ ] Check input `font-size` is **16px** (`text-base` in Tailwind).  
  Fix: `<textarea className="text-base" … />` prevents auto-zoom.
- [ ] Verify after sending a message and refocusing the input.

## 2. Safe-Area / Viewport Behavior
- [ ] Open the chat panel on a device with gesture navigation / curved edges. Panel avoids system edges.
- [ ] Inspect the composer bar: `padding-bottom: env(safe-area-inset-bottom)` is applied.
- [ ] Panel sits at **12px inset** from edges (`inset-x-3 bottom-3 top-3`) on mobile.
- [ ] Rotate landscape → portrait; panel still fills correctly and doesn't overflow.
- [ ] Address bar appears/disappears on scroll; panel layout stays stable (no jarring resize).

## 3. Tap Targets (Material / WCAG 2.1 minimum 48dp)
- [ ] Floating bubble: **≥56px** (w-14 h-14).
- [ ] Close button: **≥48dp** touch target.
- [ ] Send button: **≥48dp** on mobile.
- [ ] Suggestion chips: **≥48dp height**, large padding, easy to tap.
- [ ] No tiny links or overlapping tap targets in the chat panel.

## 4. Open / Close Behavior
- [ ] Tap the floating bubble → panel opens smoothly.
- [ ] Tap the close button → panel closes.
- [ ] Repeat open/close 5 times; no layout shift, no double scrollbar, no body scroll lock stuck.
- [ ] With panel open, background page stays at the same scroll position.
- [ ] Swipe up/down inside chat panel does **not** scroll the underlying page.

## 5. Animations & Performance
- [ ] Open/close animation is smooth at 60fps on mid-range Android phone.
- [ ] No jank when messages stream in.
- [ ] Use `transform` and `opacity` animations only; no width/height/layout changes.
- [ ] Reduced-motion preference: if `prefers-reduced-motion: reduce` is enabled, animations are disabled or minimal.

## 6. Keyboard Handling
- [ ] Tap input → keyboard opens, composer stays above keyboard.
- [ ] Send a message while keyboard open → keyboard stays open.
- [ ] Close panel with keyboard open → keyboard dismisses and panel closes.
- [ ] No blank white gap between keyboard and composer.
- [ ] Resize behavior is correct with Chrome's on-screen keyboard.

## 7. Scroll & Overflow
- [ ] Message list scrolls independently inside the panel.
- [ ] Long AI response scrolls naturally; user can read the whole message.
- [ ] Suggestion chips scroll horizontally if needed, or wrap cleanly.
- [ ] No body scroll freeze after closing the widget.
- [ ] Momentum scrolling works inside the chat panel.

## 8. Text & Visibility
- [ ] `text-base` on input is confirmed in dev tools.
- [ ] Greeting text and suggestions are readable at system font size.
- [ ] No text clipped by system bars or device edges.
- [ ] Dark/light mode renders correctly (if supported).

## 9. Fast Path / Quick Actions
- [ ] Tap "Book a lesson" suggestion → opens WhatsApp/email with prefilled message.
- [ ] Tap "Ask a theory question" → AI responds with theory content.
- [ ] Tap "Coverage areas" → response lists the W/SW postcodes.

## 10. Accessibility (bonus)
- [ ] TalkBack labels the floating bubble as "Open chat" and close as "Close chat".
- [ ] Tap targets are discoverable and large enough.
- [ ] Larger text / display size settings don't break the layout badly.

## Quick DevTools Checks
```css
/* Verify these styles on mobile */
.ai-chat-bubble { width: 56px; height: 56px; }
.ai-chat-panel { inset: 12px 12px 12px; }
.ai-chat-composer { padding-bottom: env(safe-area-inset-bottom); }
.ai-chat-input { font-size: 16px; }
```

## Notes / Issues
- [ ] Record Android version, device model, Chrome version, and any found issues below.
- [ ] Date tested: _______________

---
