# Arandu project website · V5

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
