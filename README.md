# Ranking Your Friends

Ranking Your Friends is a local-first party game for a host and a group of friends.

1. The host creates a game with players and questions.
2. Each player opens a private player link and ranks the group.
3. Each player sends back one short player code.
4. The host imports those codes and opens a big-screen reveal.

There are no accounts, no backend, and no real-time sync. Shared state is packed into compact URL hashes and copied codes, with `localStorage` used as a host-side backup.

## Features

- Host-first setup flow with English and Dutch UI
- Local/offline-friendly sharing through player links and player codes
- Compact encoding to keep links and codes short
- Big-screen reveal mode with keyboard shortcuts for presenting
- Finalized no-show removal
- Automated node tests, TypeScript checks, and Playwright coverage

## Quick start

```bash
npm install
npm run dev
```

Open the local Vite URL and create a game, or use the built-in demo/reveal flow.

## Scripts

```bash
npm run dev        # local development server
npm run build      # production bundle
npm run preview    # preview built bundle
npm test           # build + node test suite
npm run typecheck  # TypeScript checks
npm run test:ui    # Playwright browser tests
npm run verify     # full local verification pass
```

If this is your first Playwright run on the machine:

```bash
npx playwright install chromium
```

## Product flow

### Host

1. Add players and questions in Setup.
2. Lock the game to generate a player link and backup game code.
3. Send the player link to the group.
4. Collect one player code at a time.
5. Open the reveal link on the big screen.

### Player

1. Open the player link.
2. Pick your fixed player name.
3. Rank everyone for each question.
4. Copy the generated player code and send it back to the host.

### Reveal

Reveal mode is presentation-oriented. It moves through:

1. Presenter prompt
2. Question
3. Ranking reveal
4. Occasional subtotal checkpoints earlier in the game
5. Finale intro
6. Final standings and awards

Reveal keyboard shortcuts:

- `Right Arrow` or `Space`: next
- `Left Arrow` or `Backspace`: back

## Project structure

- [README.md](/data/repos/rankingthefriends/README.md): project overview and setup
- [docs/README.md](/data/repos/rankingthefriends/docs/README.md): documentation index
- [app.ts](/data/repos/rankingthefriends/app.ts): app state, rendering, i18n, encoding
- [game-logic.ts](/data/repos/rankingthefriends/game-logic.ts): scoring and reveal sequencing
- [tests/](/data/repos/rankingthefriends/tests): node and Playwright coverage

## Deployment

This app must be served from the built `dist/` output. Serving repository source files directly will not execute the TypeScript entrypoint in the browser.

For GitHub Pages, the Vite base path must match the repository subpath:

```ts
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/rankingthefriends/" : "/",
}));
```

The existing GitHub Actions workflow should build and publish `dist/`. If deploying manually:

1. Run `npm run build`.
2. Publish the contents of `dist/`.

## Documentation

Start with [docs/README.md](/data/repos/rankingthefriends/docs/README.md). The docs directory includes product notes, architecture references, testing instructions, and roadmap documents.

## Current quality bar

As of March 23, 2026:

- `npm test` passes
- `npm run typecheck` passes
- `npm run test:ui` passes
