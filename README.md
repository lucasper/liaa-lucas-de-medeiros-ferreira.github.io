# Arandu project website · V7

**V7 (November 24, 2026)** is a copy of V6 with smooth page and language transitions and an updated roadmap. V6 and the earlier versions stay in their own folders.

Changes from V6:

- **Page transitions** (`lang.js`, `styles.css` "V7 · Page transitions"). A link to another page of the site (the Benchmark tab, the report buttons, the links back to the home page) fades the content out under a dark curtain, then the next page fades in with a short upward slide. The top bar stays above the curtain, so it does not blink. Links inside the same page still just scroll. Without JavaScript the links work as before, with no animation.
- **Language switch transition.** The active highlight is now a thumb that slides from Eng to PT-BR (or back). The page content slides and blurs out in the same direction, the nav labels fade, and the other language's page slides in from the other side. The section being read (`#id`) is kept, as in V6. `lang.js` passes the kind of transition to the next page in `sessionStorage` (key `arandu-transition`), read before the first paint.
- **Reduced motion.** With the system's "reduce motion" setting on, the slide and blur are dropped and only the fade stays.
- **Back/forward cache.** A page restored with the browser's Back button is shown at once, not faded out.
- **Roadmap** (`index.html`, `index.pt-br.html`). We are now in the Evaluation milestone (NOV W4): it is the highlighted one, Refinement is marked done (✓) and the progress beam reaches Evaluation. The "Next steps" box now says the benchmark is done (with a link to the Benchmark page) and lists the four fixes the benchmark pointed to, each linking to its evidence: Gemini adapter rejecting the StructuredOutput schema (`maxLength`), no context summary accepted (0 of 30), Groq waiting only after a 429 (about 91% of Groq turn time), and one unreadable Groq tool call. Then the same scenarios run again to confirm the fixes; the third API is still to be chosen. Facts come from the V5 benchmark report (findings and conclusions sections).
- The "this week" roadmap label now reads "esta semana" on the PT-BR page (it showed in English in V6).
- Footer date and note updated on both home pages.

To publish V7, replace the repository root files with the files from this folder (same file set as V6; `lang.js`, `styles.css`, `index.html` and `index.pt-br.html` changed). V7 was published to GitHub Pages on November 24, 2026 (commit `6de0315`), replacing V6 at the repository root.

Visual fixes (November 24, 2026, after the first V7 publication, requested by the student):

- **Roadmap.** The progress beam was removed. The four finished milestones (SEP W4, OCT W3, NOV W1, NOV W3) show a ✓. Evaluation (NOV W4) stays highlighted as the current step, without a ✓, because its fixes are still open.
- **Evaluation card outline.** The "this week" label was drawn with `.ms-now::after`, the same layer the spotlight cards use for their hover border, so hovering showed a second, shifted frame and the label never appeared. The label is now its own element (`.ms-flag`), so hover shows one border and the label reads "this week" / "esta semana".
- **Top bar.** Above 1360 px the nav links used wider padding and no longer fit in the 1160 px bar, so the Benchmark tab wrapped onto two lines and pushed the language switch off the edge (worst on the PT-BR pages). The compact link size now applies at every width and links never wrap. All four pages were checked at 1225 px and 1380 px.
- **AdapterBenchmark pipeline** (home page, What's new → AdapterBenchmark tab). The connector line ran across the semi-transparent stage cards and under their text. The stages are now opaque, so the line and arrows only show in the gaps.
- The four pages load `styles.css?v=7.1` and `lang.js?v=7.1`, so browsers fetch the new files instead of a cached copy.

The text below describes V6 and still applies.

---

## V6 notes

**V6 (November 24, 2026)** is a copy of V5 with an **Eng / PT-BR language switch** at the top of every page, a full Brazilian Portuguese version of the site, and the re-recorded trailers. V5 and the earlier versions stay in their own folders.

Changes from V5:

- `lang.js` (new, loaded in `<head>`): the switch in the top bar. Each language is its own page: `index.html` / `index.pt-br.html` and `benchmark.html` / `benchmark.pt-br.html`, linked with `<link rel="alternate" hreflang>`. The switch is plain links, so it works without JavaScript. With JavaScript, switching keeps the section being read (`#id`) and the choice is remembered in the browser (`localStorage` key `arandu-lang`); a remembered choice redirects before the page paints.
- `index.pt-br.html` and `benchmark.pt-br.html`: the full text in Brazilian Portuguese. Arandu's part names and technical terms stay as they are (Core, ModelAdapter, Integration, Editor, Agent, Session, Skill, Tool, Context, Adapter, samples, tool call, retry, backoff, jitter, rate limit, receipt, debug mode, context compaction, thread pool, Edit Mode, Play Mode, scenario names, status codes and file names). Commit titles in the commit view stay as the original git messages; their explanations are translated.
- `script.js` and `benchmark.js`: text they generate (concept panel, commit view, scenario cards, failure table, scorecard, chart axes, legends and tooltips) comes from `tr(en, pt)`, chosen by `<html lang>`. Numbers and dates use the `pt-BR` locale on the PT pages.
- Trailer: `assets/arandu-trailer-en.mp4` (new English narration) and `assets/arandu-trailer-pt-br.mp4` (Brazilian Portuguese), both 90 s, H.264, CRF 23, faststart. The PT page plays the PT-BR video. Posters are subtitle-free stills from the same compositions (`arandu-trailer-poster.jpg`, `arandu-trailer-poster-pt-br.jpg`). The narration is now generated locally with Qwen3-TTS (see `C:/Projects/AI/TrailerProject`).
- `styles.css`: the switch style; the nav collapses into the menu at 1220 px (PT labels are longer) and links get tighter padding up to 1360 px.
- Footer date updated on the home page.

To publish V6, replace the repository root files with the files from this folder, including `assets/`, `data/`, `tools/` and the new `lang.js`, `index.pt-br.html` and `benchmark.pt-br.html`.

The text below describes V5 and still applies.

---

## V5 notes

**V5 (November 23, 2026)** is a copy of V4 with a new **Benchmark** tab (`benchmark.html`): a report on the first live run of the AdapterBenchmark sample, with interactive, animated charts. The earlier versions stay in [`../WebSite`](../WebSite/README.md), [`../WebSite_V2`](../WebSite_V2/README.md), [`../WebSite_V3`](../WebSite_V3/README.md) and [`../WebSite_V4`](../WebSite_V4/README.md).

Changes from V4:

- New page `benchmark.html` with `benchmark.css` and `benchmark.js`, in the same neon lilac and blue style and with the same motion layer (word reveals, scroll reveals, counters, spotlight and tilt, particle network).
- `index.html`: a highlighted **Benchmark** tab in the nav, a "Benchmark report" button in the hero, and the footer date. It also loads `benchmark.css` for the tab style. Nothing else changed; `script.js` and `styles.css` are the same as V4.
- `data/benchmark-data.js`: compact data generated from the benchmark exports (one row per turn, one row per model call, precomputed statistics).
- `tools/analyze_benchmark.py`: the script that generates the data file.

To publish V5, replace the repository root files with the files from this folder, including `assets/`, `data/` and `tools/`.

## The report

Source data: the 12 files exported by AdapterBenchmark on November 23, 2026 (local time, UTC−4), stamped `20261124-005339` (UTC), in `%USERPROFILE%/AppData/LocalLow/DefaultCompany/AranduUnity/AdapterBenchmarkResults`. Three models, ten scenarios, five repeats, 285 turns:

| Adapter | Model | Turns passed | Retries |
| --- | --- | --- | --- |
| Gemini | `gemini-3.5-flash-lite` | 89/95 | 2 |
| Groq | `openai/gpt-oss-120b` | 94/95 | 51 |
| Groq | `openai/gpt-oss-20b` | 93/95 | 37 |

Sections: key findings, the benchmark (glossary, setup, scenarios), reading the numbers (method), reliability, speed, where the time goes, rate limits and retries, plugin features, provider view, conclusions (scorecard, recommendations, limits, sources).

Charts (Apache ECharts 5.5.1 from jsDelivr; each chart starts its entrance animation when it scrolls into view):

| Chart | Interaction |
| --- | --- |
| Pass-rate heatmap (scenario × model) | Cells pop in; click a cell to list its turns |
| Turn time box plots with every turn as a dot (log scale) | Toggle total time / without rate-limit waits; dots move to their new place |
| Sorted turns (cumulative share) and simple-scenario medians | Toggle total / no waits |
| Time split per model (Arandu & Unity, network, provider, rate-limit wait) | Scenario picker, share / seconds toggle |
| Arandu & Unity time per turn and its parts | Hover for each turn |
| Whole session timeline | "Replay the session" button |
| Rate-limit wait vs. request size; wait asked vs. wait done | Hover |
| Feature charts: tool calls, context size, summaries, skill switch, cancellation | Context toggle (history size / estimated vs. measured tokens) |
| Output speed and HTTP vs. provider time | Hover |

Data cleaning (student's report, Nov 23): Unity was minimized a few times during the Gemini run, which paused the Editor. The four Gemini turns that ran while minimized (Unity hand-back about 100 ms instead of about 4 ms: SkillSwitch r4 t2, ContextPressure r1 t5, r3 t6, r3 t7) are flagged `paused` and left out of all timing statistics; their pass/fail results are kept. The 31.5 minutes of pauses between turns are removed from the session clock, so Gemini's active run time is 10.2 min. The rule lives in `tools/analyze_benchmark.py` (`PAUSE_FRAME_MS`).

Method notes: medians and p90 instead of means; 95% Wilson intervals for pass rates; pass^5 (all repeats passed) from τ-bench; Cliff's delta for model comparisons; rate-limit waits separated from model time. Chart colors were checked with the dataviz palette validator against the dark chart surface.

## Regenerating the data

```
python -I tools/analyze_benchmark.py "<AdapterBenchmarkResults folder>" data/benchmark-data.js
```

The script also writes `data/benchmark-data.js.json` (same content as plain JSON); delete it if you do not want to publish it. Text in `benchmark.html` quotes figures from this run; review it if you regenerate with new data.

## Sources and limits

Facts come from the exported files and from the Arandu repository (HEAD `d56c513`): the AdapterBenchmark README, `ScenarioCatalog.cs`, `CaptureReader.cs`, `GeminiProtocol.cs`, `BoundedHttpClient.cs` and `.docs/UnityIntegration/DeveloperSetup.md`. The product tests were not re-run. Groq's rate limits are quoted from its public documentation; this account's limits were not checked. Provider processing times are the providers' own statements.

The text below describes V4 and still applies.

---

## V4 notes

**V4 (November 22, 2026)** is a copy of V3 with a new **Trailer** section right below the hero (after the tag strip), playing the 90-second English trailer.

- New `#trailer` section, a "Trailer" link in the nav and a "Watch the trailer" button in the hero; the scroll cue now points to the trailer.
- `assets/arandu-trailer-en.mp4` (H.264/AAC, 1080p30, 90 s, web-optimized with fast start, about 14 MB) and `assets/arandu-trailer-poster.jpg`. Source: `C:/Projects/AI/TrailerProject` (`AranduTrailerEN`).
- Text fixes requested by the student: Arandu makes it **easy** to add AI agents, the Context section defines an AI agent, the Samples section explains what a sample is, and ThroneRoom's advisor "tries to fool you".
- Real API status: ThroneRoom was played and tested with both the real **Gemini and Groq** APIs (student's report, Nov 22).

See [`../WebSite_V4/README.md`](../WebSite_V4/README.md) for the full V4, V3 and V2 notes (files, motion rules, commit view and how to update the progress).
