# Desktop Chrome & Safari QA Checklist — Chat Widget

Use this after any update to the chat widget (`src/components/AIChatWidget.tsx`) or global layout changes.

Test on a real desktop machine or browser DevTools at **1280×720 and 1920×1080**.

## 1. No Zoom on Input Focus
- [ ] Click the chat input. Chrome/Safari do **not** zoom in (`visualViewport.scale` stays `1`).
- [ ] Check input `font-size` is **16px** (`text-base` in Tailwind).  
  Fix: `<textarea className="text-base" … />` prevents auto-zoom.
- [ ] Verify after sending a message and refocusing the input.

## 2. Layout & Positioning
- [ ] Floating bubble sits in the **bottom-right corner**, clear of page content and footer.
- [ ] Bubble does not overlap critical CTAs, cookie banners, or accessibility widgets.
- [ ] Chat panel opens at a sensible size on desktop (max ~380px wide, max 80vh tall).
- [ ] Panel is not clipped by viewport edges at 1280×720 or smaller.
- [ ] Scrollbar appears only in the message list, not the whole page.
- [ ] Panel stays within the viewport when the browser is resized.

## 3. Click Targets (Mouse + Touchpad)
- [ ] Floating bubble: **≥48px** (desktop: 56px is ideal).
- [ ] Close button: clearly visible, min **36px** target (44px ideal).
- [ ] Send button: min **44px** target.
- [ ] Suggestion chips: clickable without mis-clicking neighboring chips.
- [ ] Links inside AI responses (WhatsApp, email, areas) are clickable and open correctly.

## 4. Open / Close Behavior
- [ ] Click the floating bubble → panel opens smoothly.
- [ ] Click the close button → panel closes.
- [ ] Repeat open/close 5 times; no layout shift, no double scrollbar, no page scroll freeze.
- [ ] With panel open, background page stays at the same scroll position.
- [ ] Press `Escape` key → panel closes (optional but recommended).
- [ ] Click outside the panel → panel closes (optional but recommended).

## 5. Animations & Performance
- [ ] Open/close animation is smooth at 60fps.
- [ ] No jank when messages stream in on longer AI responses.
- [ ] Use `transform` and `opacity` animations only; no width/height/layout changes.
- [ ] Reduced-motion preference: if `prefers-reduced-motion: reduce` is enabled, animations are minimal or disabled.
- [ ] No fan spin / high CPU usage while the widget is idle.

## 6. Keyboard Handling
- [ ] Tab navigation reaches the floating bubble, then close/send/input inside the panel.
- [ ] `Enter` in the textarea sends a message (unless `Shift+Enter` is used for newline).
- [ ] `Shift+Enter` inserts a newline without sending.
- [ ] Typing and sending while the panel is open works without focus loss.

## 7. Scroll & Overflow
- [ ] Message list scrolls independently inside the panel.
- [ ] Long AI response scrolls naturally; user can read the whole message.
- [ ] Suggestion chips wrap cleanly or scroll horizontally if needed.
- [ ] No page scroll freeze after closing the widget.
- [ ] Mouse wheel/trackpad scrolling works inside the chat panel.

## 8. Text & Visibility
- [ ] `text-base` on input is confirmed in dev tools.
- [ ] Greeting text and suggestions are readable at the default browser zoom (100%).
- [ ] Text is not clipped by the panel header or composer bar.
- [ ] Dark/light mode renders correctly (if supported).
- [ ] Font is Arial (or whatever the current site font is) and looks professional.

## 9. Fast Path / Quick Actions
- [ ] Click "Book a lesson" suggestion → opens WhatsApp/email with prefilled message.
- [ ] Click "Ask a theory question" → AI responds with theory content.
- [ ] Click "Coverage areas" → response lists the W/SW postcodes.
- [ ] Links in the AI response are correct and open in a new tab where appropriate.

## 10. Browser-Specific Checks

### Chrome
- [ ] No console errors when opening, sending, or closing the widget.
- [ ] Network tab shows `/api/chat` request returns a streaming response.
- [ ] No extension (ad blocker, grammar checker) breaks the widget UI.
- [ ] Responsive mode at 768px wide still shows a usable panel.

### Safari
- [ ] No console errors or WebKit warnings.
- [ ] Smooth scrolling inside the message list.
- [ ] No rendering glitch on the bubble shadow or panel border radius.
- [ ] Panel border and background look correct (no missing backdrop/filter effects).

## Quick DevTools Checks
```css
/* Verify these styles on desktop */
.ai-chat-bubble { width: 56px; height: 56px; }
.ai-chat-panel { max-width: 380px; max-height: 80vh; }
.ai-chat-input { font-size: 16px; }
```

## Notes / Issues
- [ ] Record browser version, OS, screen resolution, and any found issues below.
- [ ] Date tested: _______________

---
