# Arandu project website

Static site that presents and tracks the Arandu project for the Applied AI Lab course (Laboratório de IA Aplicada), Master's in Software Engineering, UNIPAMPA. Author: Lucas de Medeiros Ferreira.

Suggested repository name, following the course format `<COURSE>-<STUDENT>.github.io`: **`liaa-lucas.github.io`**.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | All page content: context, problem, solution, sample, progress, status and roadmap |
| `styles.css` | Visual design and responsive layout |
| `script.js` | Scroll reveal, active menu, hero animation, concept tabs and timeline filters |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

No build step. Open `index.html` in a browser to preview.

## Publishing on GitHub Pages

A repository named `<name>.github.io` is served at `https://<name>.github.io` only when `<name>` is the GitHub account or organization that owns it. Two options:

1. Create an account or organization called `liaa-lucas` and a repository `liaa-lucas.github.io` inside it.
2. Or create a repository `liaa-lucas.github.io` in your own account. It will be served at `https://<your-user>.github.io/liaa-lucas.github.io/`.

Then push these files to the `main` branch and enable **Settings → Pages → Deploy from a branch → main / root**.

## Updating the progress

- Add a new `<li class="tl">` entry to the timeline in the **Progress** section after each class update.
- Update the **Status** section and the date in the footer.
- Keep the academic schedule (Roadmap section) unchanged unless the student changes it.

Facts on the page come from `C:/Projects/Arandu` (README, HEAD `68bd0ed`, Nov 10, 2026) and the progress records in `AranduContext/Contexto`. Measurements are local and simulated. Real API calls, player and device runs are not validated yet.
