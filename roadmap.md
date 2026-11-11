# Workflow recovery

- [x] Fix Ubuntu 26.04 / WebKit ICU incompatibility and isolate browser caches; run #302 passed all browsers.
- [x] Inspect recent failed workflows and group repeats by root cause: runs #294–#301 share the WebKit ICU launch failure; other active checks are green.
- [x] Apply minimal fixes for each distinct remaining cause without weakening tests or changing website behaviour; no additional recent cause found.
- [x] Rerun affected checks and report verified results, unresolved items, and any input needed; runs #302 and #303 passed Chromium, Firefox and WebKit, including a warm-cache WebKit run.
- [x] Do not publish.

# Homepage TikTok showcase

- [x] Match the uploaded desktop reference around the live TikTok embed using existing GSM artwork.
- [x] Hide side decorations and centre the embed on phones; change no other section.
- [x] Verify phone and desktop preview, Analytics/consent preservation, and leave unpublished.

# Shared homepage and Videos TikTok showcase

- [x] Reuse the agreed GSM branded showcase on both pages with the same live embed and responsive behaviour.
- [x] Centre the requested explanatory sentence at the bottom of both TikTok sections.
- [x] Verify both pages on phone and desktop, run relevant checks, and leave unpublished.

# Desktop TikTok embed refinement

- [x] Enlarge the shared laptop/desktop TikTok embed about 40% and reduce/bring in both side branding columns.
- [x] Move the explanatory sentence below the heading on laptop/desktop only; retain the existing mobile order and sizing.
- [x] Check homepage and Videos page at phone, laptop and desktop widths; run regression checks and leave unpublished.

# Videos-only TikTok gallery

- [x] Resolve ten supplied short links to ten distinct GSM video IDs and verify official oEmbed support.
- [x] Add genuine TikTok covers, responsive thumbnails, one official muted player at a time, and per-video TikTok fallbacks to the Videos page only.
- [x] Test all ten official players in Chromium: link 7 played muted once; links 1–6 and 8–10 returned TikTok's server error, and link 7 also failed on a later attempt.
- [x] Verify single-player behaviour and phone/desktop layouts in Chromium and Firefox; WebKit repeatedly closed, so its checks remain unverified.
- [x] Confirm the homepage and YouTube destinations remain unchanged; run checks and leave unpublished.
- [ ] Re-test reliable TikTok playback and WebKit when the external player and browser runner cooperate.
