# Workflow recovery

- [x] Fix Ubuntu 26.04 / WebKit ICU incompatibility and isolate browser caches; run #302 passed all browsers.
- [x] Inspect recent failed workflows and group repeats by root cause: runs #294–#301 share the WebKit ICU launch failure; other active checks are green.
- [x] Apply minimal fixes for each distinct remaining cause without weakening tests or changing website behaviour; no additional recent cause found.
- [x] Rerun affected checks and report verified results, unresolved items, and any input needed; runs #302 and #303 passed Chromium, Firefox and WebKit, including a warm-cache WebKit run.
- [x] Do not publish.
