# Ranking Your Friends

A playful party game: pick juicy questions, rank each other, and reveal the funniest results round by round.

## How it works
1. **Setup**: create a game with players and questions, then lock it.
2. **Players**: open the link, rank everyone, and copy a short **secret code**.
3. **Collect**: host pastes all codes and generates a **Game Night link + QR**.
4. **Reveal**: open the Game Night link on the big screen for a fullscreen slideshow.

## Scoring
- Each player assigns **N..1 points** per question (top rank gets N, last gets 1).
- Points are **summed across all players**.
- Reveal shows **Round score** and **Total score** after each question.

## Development
```
npm install
npm run dev
```

## Production build
```
npm run build
npm run preview
```

## GitHub Pages deployment
This project is configured for GitHub Pages via GitHub Actions. The production build outputs to `dist/`, which is generated during CI and not committed to the repo. To publish:
1. Push to `main`.
2. In GitHub, set **Settings → Pages → Source** to **GitHub Actions**.
3. The workflow builds the site and deploys the `dist/` folder.

If you are temporarily serving the repository root as a static site, the QR code library is loaded from a CDN, so the app still works without a bundled `dist/` output.

## Documentation
- `docs/SPEC.md` – detailed product + flow spec
- `docs/LOGIC.md` – scoring + encoding logic
- `docs/WIREFLOW.md` – UI flow and steps
- `docs/LAYOUT.md` – low‑fidelity layouts
- `docs/COMPONENTS.md` – component responsibilities
- `docs/CONCEPT.md` – high‑level concept summary
- `docs/PROJECT_STRUCTURE.md` – repo layout guide
- `docs/TESTING.md` – testing checklist
- `docs/I18N.md` – multi-language support guide

## Contributing
See `CONTRIBUTING.md` for setup, workflow, and code style guidance.

## Security
Please review `SECURITY.md` for vulnerability reporting details.

## Notes
- No accounts or backend.
- Data is embedded in URL hashes (compressed), with localStorage backup.
