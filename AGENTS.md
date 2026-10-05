<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Homepage CI (`tests/section-order/check.ts`) asserts the current public web homepage anchor order (top → videos → local-areas → gsm-buddy → get-in-touch) and absence of removed promotions; update it whenever the public homepage structure intentionally changes. Why: stale expectations caused hundreds of failure emails.
- Site settings merge ignores blank saved values over confirmed defaults (`mergeNonEmpty` in useSiteSettings). Why: empty CMS social fields previously blanked confirmed links.
