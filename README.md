# Arandu project website · V4

**V4 (November 22, 2026)** is a copy of V3 with a new **Trailer** section right below the hero (after the tag strip), playing the 90-second English trailer. The earlier versions stay in [`../WebSite`](../WebSite/README.md), [`../WebSite_V2`](../WebSite_V2/README.md) and [`../WebSite_V3`](../WebSite_V3/README.md).

Changes from V3:

- New `#trailer` section, a "Trailer" link in the nav and a "Watch the trailer" button in the hero; the scroll cue now points to the trailer.
- `assets/arandu-trailer-en.mp4` (H.264/AAC, 1080p30, 90 s, web-optimized with fast start, about 14 MB) and `assets/arandu-trailer-poster.jpg`. Source: `C:/Projects/AI/TrailerProject` (`AranduTrailerEN`).
- Text fixes requested by the student: the hero and Problem section now say Arandu makes it **easy** to add AI agents (adding one is hard), the Context section defines an AI agent, the Samples section explains what a sample is before describing them ("ready to open and test"), and ThroneRoom's advisor "tries to fool you".
- Real API status updated with the student's report (Nov 22): ThroneRoom was played and tested with both the real **Gemini and Groq** APIs. The Status, badges and Next steps no longer list Groq as pending; a third API is still open. Dated timeline entries were kept as they were.
- Trailer styles appended at the end of `styles.css`; `script.js` is unchanged.

To publish V4, replace the repository root files with the files from this folder, including `assets/`.

The text below describes V3 and V2 and still applies.

---

## V3 notes

**V3 (November 17, 2026)** is a copy of V2 without the perpetual left-to-right "wave" animations, at the student's request. Removed: the light streak along the top of each section, the shine on kicker and number badges, the shimmer on stat, test and commit tiles, the shine on the kingdom bars, the scan across the commit chart, the sweep in the guiding question, the pulse travelling along the agent loop and the moving footer gradient (now static). The second ticker row now moves in the same direction as the first. Content, `index.html` and `script.js` are the same as V2; only `styles.css` changed. V2 stays in [`../WebSite_V2`](../WebSite_V2/README.md).

The text below describes V2 and still applies.

---

Second version of the static site that presents and tracks the Arandu project for the Applied AI Lab course (Laboratório de IA Aplicada), Master's in Software Engineering, UNIPAMPA. Author: Lucas de Medeiros Ferreira.

The first version stays untouched in [`../WebSite`](../WebSite/README.md). V2 was created on November 17, 2026, at the student's request:

1. Content updated with the 19 commits on the local `main` branch of `C:/Projects/Arandu` after `68bd0ed`, from `651dbb9` (Nov 11) to HEAD `194ab29` (Nov 16).
2. Full visual rework with animations in every section.
3. Base colors changed to neon lilac and blue on a dark background.
4. The whole site is in English.

Repository: **[lucasper/liaa-lucas-de-medeiros-ferreira.github.io](https://github.com/lucasper/liaa-lucas-de-medeiros-ferreira.github.io)** · Live site: **https://lucasper.github.io/liaa-lucas-de-medeiros-ferreira.github.io/**. To publish V2, replace the repository root files with the files from this folder.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Content: context, problem, solution, samples, what's new, progress, status and roadmap |
| `styles.css` | Neon lilac/blue theme, animations and responsive layout |
| `script.js` | Particle network, typed motto, terminal flow, scroll reveal, counters, spotlight and tilt, tabs, timeline progress and filters |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

No build step. Serve the folder (for example `python -m http.server --directory WebSite_V2`) or open `index.html` in a browser to preview.

Motion is always on, by the student's request: the site ignores the system "reduce motion" setting. Animations change only `transform` and `opacity`, and the particle network uses pre-rendered glow sprites, so they run smoothly on PCs and phones. Phones get fewer particles and no pointer effects.

The Progress section has two views. **By delivery** keeps the class updates. **By commit** is built by `script.js` from the `COMMITS` list (hash, date, area, title, files, lines added and removed, explanation): stats, a per-day activity chart with the class dates marked, area filters and a commit log grouped by delivery. Add new commits to that list after each update.

## The 19 commits, by front

| Front | Commits |
| --- | --- |
| Performance (4) | `8759b87` thread-pool orchestration · `412dce8` gate hot path · `1db9abc` compiled JSON schemas · `273d544` context measurement reuse |
| Reliability (7) | `3d7c666` tombstones, rebinding, epoch closure · `ca699bc` operation reconciliation · `d932478` gate callbacks, durable journal · `ddcd458` failure classification · `1f71fe5` mutation fairness · `add533c` OperationLedger · `40de542` review fixes |
| Adapters (2) | `f0eb74f` shared BoundedHttpClient · `521863a` Groq in ThroneRoom with retry |
| Diagnostics (3) | `5e62495` debug mode for recovery/journal/reconciliation · `6ac5285` Arandu vs provider timing · `194ab29` AdapterBenchmark sample |
| Process (3) | `651dbb9` review task plans · `b6e1efc` context engineering rework · `1915718` CLAUDE.md |

## Sources and limits

Facts come from the commit list and `.docs/ProjectContext.md` (inspected Nov 16) in `C:/Projects/Arandu`, the AdapterBenchmark README and the progress records in `AranduContext/Contexto`. Test counts are the latest records in those documents; they were not re-run for the site. The thread-pool frame figure (2.560 ms vs 0.175 ms) is a local Play Mode measurement. The real Gemini test is reported by the student. Real Groq calls, a live AdapterBenchmark run, player and device runs are not validated yet. The academic schedule is kept unchanged.

## Updating the progress

- Add a new `<li class="tl">` entry to the timeline and move the `tl-current` class to it.
- Update the What's new, Status and footer dates.
- Keep the Roadmap milestones unchanged unless the student changes them; move `ms-now` to the current milestone.
