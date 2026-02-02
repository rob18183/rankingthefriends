# Ranking Your Friends

A playful party game: pick juicy questions, rank each other, and reveal the funniest results round by round.

## How it works
1. **Setup**: create a game with players and questions, then lock it.
2. **Players**: open the link, rank everyone, and copy a short **secret code**.
3. **Collect**: host pastes codes and generates a **Game Night link + QR**.
4. **Reveal**: open the Game Night link for a fullscreen slideshow.

## Quick start
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## GitHub Pages deployment
This app must be served from the **built output** (`dist/`).

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the project and deploys `dist/`
to GitHub Pages automatically.

Because GitHub Pages serves the site under a repository subpath: https://rob18183.github.io/rankingthefriends/ the Vite config must set the correct base path:

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/rankingthefriends/" : "/",
}));
```

Without this, asset URLs will resolve incorrectly and the deployed site may appear unstyled or broken.

1. Push to `main`.
2. In GitHub, set **Settings → Pages → Source** to **GitHub Actions**.

If you serve the repository root without building, the TypeScript entrypoint will not run in the
browser and the UI will be non-interactive. Always deploy the compiled `dist/` output instead.

## Documentation
See `docs/README.md` for architecture, logic, and testing notes.

## Notes
- No accounts or backend.
- Data is embedded in URL hashes (compressed), with localStorage backup.
