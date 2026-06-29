# iOS Safari QA Checklist — Chat Widget

Use this after any update to the chat widget (`src/components/AIChatWidget.tsx`) or global layout changes.

Test on a real iOS device or Safari responsive mode at **390×844 @ 3× DPR**.

## 1. No Zoom on Input Focus
- [ ] Tap the chat input. Safari does **not** zoom in (`visualViewport.scale` stays `1`).
- [ ] Check input `font-size` is **16px** (`text-base` in Tailwind).  
  Fix: `<textarea className="text-base" … />` prevents auto-zoom.
- [ ] Verify after sending a message and refocusing the input.

## 2. Safe-Area Layout
- [ ] Open the chat panel on an iPhone with a home indicator / notch. Panel avoids the notch/safe area.
- [ ] Inspect the composer bar: `padding-bottom: env(safe-area-inset-bottom)` is applied.
- [ ] Panel sits at **12px inset** from edges (`inset-x-3 bottom-3 top-3`) on mobile.
- [ ] Rotate landscape → portrait; panel still fills correctly and doesn't overflow.

## 3. Tap Targets (Apple 44pt minimum)
- [ ] Floating bubble: **≥56px** (w-14 h-14).
- [ ] Close button: **≥36px** touch target (aim 44px).
- [ ] Send button: **≥44px** on mobile (w-11 h-11 minimum).
- [ ] Suggestion chips: **≥44px height**, large padding, easy to tap without mis-tapping.
- [ ] No tiny links or overlapping tap targets in the chat panel.

## 4. Open / Close Behavior
- [ ] Tap the floating bubble → panel opens smoothly.
- [ ] Tap the close button → panel closes.
- [ ] Repeat open/close 5 times; no layout shift, no double scrollbar, no body scroll lock stuck.
- [ ] With panel open, background page stays at the same scroll position.
- [ ] Swipe up/down inside chat panel does **not** scroll the underlying page.

## 5. Animations & Performance
- [ ] Open/close animation is smooth at 60fps on mid-range iPhone.
- [ ] No jank when messages stream in.
- [ ] Use `transform` and `opacity` animations only; no width/height/layout changes.
- [ ] Reduced-motion preference: if `prefers-reduced-motion: reduce` is enabled, animations are disabled or minimal.

## 6. Keyboard Handling
- [ ] Tap input → keyboard opens, composer stays above keyboard.
- [ ] Send a message while keyboard open → keyboard stays open.
- [ ] Close panel with keyboard open → keyboard dismisses and panel closes.
- [ ] No blank white gap between keyboard and composer.

## 7. Scroll & Overflow
- [ ] Message list scrolls independently inside the panel.
- [ ] Long AI response scrolls naturally; user can read the whole message.
- [ ] Suggestion chips scroll horizontally if needed, or wrap cleanly.
- [ ] No body scroll freeze after closing the widget.

## 8. Text & Visibility
- [ ] `text-base` on input is confirmed in dev tools.
- [ ] Greeting text and suggestions are readable at 16px system font size.
- [ ] No text clipped by safe area or notch.
- [ ] Dark/light mode renders correctly (if supported).

## 9. Fast Path / Quick Actions
- [ ] Tap "Book a lesson" suggestion → opens WhatsApp/email with prefilled message.
- [ ] Tap "Ask a theory question" → AI responds with theory content.
- [ ] Tap "Coverage areas" → response lists the W/SW postcodes.

## 10. Accessibility (bonus)
- [ ] VoiceOver labels the floating bubble as "Open chat" and close as "Close chat".
- [ ] Tap targets are discoverable and large enough.
- [ ] Dynamic Type text sizes don't break the layout badly.

## Quick DevTools Checks
```css
/* Verify these styles on mobile */
.ai-chat-bubble { width: 56px; height: 56px; }
.ai-chat-panel { inset: 12px 12px 12px; }
.ai-chat-composer { padding-bottom: env(safe-area-inset-bottom); }
.ai-chat-input { font-size: 16px; }
```

## Notes / Issues
- [ ] Record iOS version, device model, and any found issues below.
- [ ] Date tested: _______________

---
