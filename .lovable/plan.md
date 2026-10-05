# Search and AI visibility plan for GSM Driving School

The aim is to help Google, Bing and AI assistants clearly understand who GSM is, where you teach and how to book. Nothing will be published and nothing will be posted to YouTube or social media until you approve it. No one can promise rankings or AI recommendations.

## What I found

- Good foundations are already in place: each page has its own title, there's a sitemap and robots file, business details are marked up for Google, there are area pages, and the YouTube channel is linked.
- **Details don't match everywhere:**
  - The AI summary file still says 143 reviews.
  - It lists Chiswick and Fulham, but leaves out North Kensington.
  - The area lists differ between pages.
  - Opening hours and postcodes need checking against one source.
- **North Kensington (W10)** has no page of its own. It currently only points to Contact.
- **Videos:** no GSM videos are shown on lesson or area pages yet, because I don't have real video links.
- **Missing pages:** the sitemap still lists the Downloads page, which is no longer promoted.
- **Instructor details** can't be checked from the site alone.

## Proposed website changes (after your approval)

1. **One master list of business details.** Name, phone, email, address, opening hours, prices, areas, "Established 2005" and "20+ years" all come from one place. The pages, Google markup and the AI summary file then all read from it, so they can't drift apart.
2. **Titles, descriptions and headings.** Natural wording on Home, Lessons, Prices, Areas, Reviews, Instructors, About, Contact and Videos. One main heading per page, with no keyword stuffing.
3. **Area pages.**
   - Refresh Notting Hill (W11), High Street Kensington (W8), Holland Park (W14), Shepherd's Bush (W12) and Bayswater (W2) with genuinely local content: real pickup points and practice roads.
   - Add a proper North Kensington (W10) page.
   - Keep Chiswick and Fulham only if you still teach there.
   - No copy-and-paste duplicate pages.
4. **Videos on pages.**
   - Show real GSM videos on the matching lesson and area pages, such as parking, roundabouts and junctions.
   - Each video gets a short summary, plus captions and a transcript where YouTube has them.
   - Videos only play when tapped, never automatically.
   - This needs the video links from you.
5. **Social and YouTube links.** Link only the profiles you confirm are yours (YouTube, Facebook, Instagram, plus any others you confirm), both in the site footer and in the details read by Google.
6. **Instructors.** Show only the qualifications you confirm, such as an approved driving instructor (ADI) badge.
7. **Speed and navigation on phones.**
   - Lighter images and less code loaded on first view.
   - Keep the simple menu, and make sure every page is reachable within two taps.
8. **Search engine and AI access.**
   - Update the sitemap: remove pages you no longer promote and add the North Kensington page.
   - Keep private pages blocked.
   - Explicitly allow the main search and AI crawlers (Google, Bing, OpenAI, Anthropic, Perplexity) on public pages.
   - Refresh the AI summary file with the correct details.

## YouTube recommendations (advice only; I won't post anything)

- **Titles:** start with the skill, then the place, e.g. "How to Do a Bay Park — Driving Lesson Tips | GSM West London".
- **Descriptions:** add a first line with the website and WhatsApp link, chapter timestamps, and a short "Lessons in Notting Hill, Kensington & West London since 2005".
- **Playlists:** Parking, Junctions & Roundabouts, Test Tips, Nervous Beginners.
- **Channel links:** website, WhatsApp, Google Business Profile.
- Add a pinned comment linking to the lessons page, and upload accurate captions to every video.

## Google Business Profile, Bing Places and Search Console

- I can't see any of these without your access. If you want, I can connect Google Business Profile and Search Console here. You'd approve each step.
- **Bing Places and Bing Webmaster Tools:** you sign in yourself (or import from Google). Then submit the sitemap.
- **Checks once connected:** whether pages are indexed, the sitemap status, any errors, and whether your name, address, phone, hours and categories match the website. The main category should be "Driving school".

## Earning genuine reviews and links

- Send a review link after each test pass, with a short WhatsApp template. Never offer incentives or write reviews yourself.
- Reply to every Google review.
- Get listed in genuine local places: Yell, Thomson Local, Apple Maps, Bing Places, local community groups and your own instructor association page, all with exactly the same details.
- Share useful videos with local schools, colleges and residents' newsletters. Never buy links.

## How we'll measure progress

- **Search Console:** search appearances, clicks and average position for "driving lessons Notting Hill" and similar searches, per page.
- **Google Business Profile:** calls, website clicks and direction requests.
- **YouTube Studio:** views, clicks to the website and traffic sources.
- **Website:** the existing tracking of WhatsApp, phone and email taps from each page, reviewed monthly.
- **AI assistants:** a simple monthly check asking ChatGPT, Claude, Gemini and Perplexity for "driving lessons in Notting Hill", noting whether GSM is mentioned.

## What I need from you

- Your real opening hours, and whether you still cover Chiswick and Fulham.
- Instructor names and confirmed qualifications.
- Any social accounts other than YouTube, Facebook and Instagram that should be linked.
- The YouTube video links to use on each page.
- Whether to connect Google Business Profile and Search Console here.

## Technical details

- Create a shared business-details module used by the root page's Google markup, the footer, the contact page and `llms.txt`. Keep `sameAs` limited to the confirmed profiles.
- Add a `VideoObject` description (name, description, thumbnail, upload date, embed URL) only for real video links, plus `BreadcrumbList` on the area pages.
- Add a W10 area page. Remove `/downloads` from the sitemap. Add explicit `Allow` lines to robots.txt for Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot and PerplexityBot.
- Use click-to-load YouTube embeds (`youtube-nocookie`, poster image first) to keep pages fast.
