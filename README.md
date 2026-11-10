# Arandu project website

Static site that presents and tracks the Arandu project for the Applied AI Lab course (Laboratório de IA Aplicada), Master's in Software Engineering, UNIPAMPA. Author: Lucas de Medeiros Ferreira.

Repository, following the course format `<COURSE>-<STUDENT>.github.io`: **[lucasper/liaa-lucas-de-medeiros-ferreira.github.io](https://github.com/lucasper/liaa-lucas-de-medeiros-ferreira.github.io)**.

Live site: **https://lucasper.github.io/liaa-lucas-de-medeiros-ferreira.github.io/**

## Files

| File | Purpose |
| --- | --- |
| `index.html` | All page content: context, problem, solution, sample, progress, status and roadmap |
| `styles.css` | Visual design and responsive layout |
| `script.js` | Scroll reveal, active menu, hero animation, concept tabs and timeline filters |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

No build step. Open `index.html` in a browser to preview.

## Publishing on GitHub Pages

The repository belongs to the personal account `lucasper`, so GitHub serves it as a project site under `https://lucasper.github.io/<repository-name>/`.

1. Keep the files at the root of the `main` branch.
2. Enable **Settings → Pages → Deploy from a branch → main / (root)**.
3. Wait for the **pages build and deployment** workflow in the **Actions** tab to finish.

For the shorter address `https://liaa-lucas-de-medeiros-ferreira.github.io`, transfer the repository to an organization with exactly that name.

## Updating the progress

- Add a new `<li class="tl">` entry to the timeline in the **Progress** section after each class update.
- Update the **Status** section and the date in the footer.
- Keep the academic schedule (Roadmap section) unchanged unless the student changes it.

Facts on the page come from `C:/Projects/Arandu` (README, HEAD `68bd0ed`, Nov 10, 2026) and the progress records in `AranduContext/Contexto`. Measurements are local and simulated. The student reports having tested the real Gemini API in the ThroneRoom sample. Real Groq calls, player and device runs are not validated yet. Next steps: experiments on Gemini, Groq and one more API, with reports built from `ARANDU_DIAGNOSTICS` data.
