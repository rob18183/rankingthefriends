# Testing Guide

## Automated checks

Run the production build plus automated node-based tests:

```bash
npm test
```

Run TypeScript checks:

```bash
npm run typecheck
```

## UI tests

Run the Playwright browser suite:

```bash
npx playwright install chromium
npm run test:ui
```

Run the full local verification pass:

```bash
npm run verify
```

## What is covered today

### Node test suite

- app bootstrapping and navigation behavior
- invalid shared hash handling
- finalized game reload and backup restoration
- one-code-at-a-time submission import
- finalized no-show removal
- setup validation for duplicate names
- scoring and reveal-state helpers

### Playwright suite

- navigation and language switching
- lock/share setup flow
- invalid link error state
- finalized reload behavior
- no-show removal
- player end-state guidance
- player-link minimal UI
- demo isolation from host draft data
- compact link/code end-to-end flow
- mobile touch reorder behavior
- reveal pacing and keyboard navigation

## Manual checklist

Use this walkthrough after any UI or logic change.

### Setup and navigation
1. Start the dev server and open the app.
2. Confirm the nav buttons switch between Setup, Collect Codes, and Inspiration.
3. Toggle the language selector between English and Nederlands and confirm labels update.

### Setup flow
1. Add at least 3 players.
2. Add at least 2 questions, including one custom and one suggested question.
3. Lock the game and confirm the player link and backup game code appear.
4. Refresh and confirm the state persists through localStorage and the URL hash.
5. Confirm the live size budget indicator updates as players and questions change.

### Player flow
1. Open the Player view through the shared link.
2. Select a player name and verify the Start button enables.
3. Rank players for each question using touch drag or the fallback controls.
4. Finish and copy the player code, then confirm the UI shows the send-back step clearly.

### Host flow
1. Add at least two player codes one at a time.
2. Confirm submission status updates and the Reveal button enables.
3. Remove a missing player if needed and confirm the game recalculates cleanly.
4. Generate the reveal link and confirm the QR code renders.

### Reveal flow
1. Open the reveal link and confirm the fullscreen prompt.
2. Step through multiple questions and confirm subtotals only appear earlier in the game.
3. Confirm the finale intro appears before the final standings.
4. Use keyboard navigation with `Left` or `Backspace` and `Right` or `Space`.

### Regression checks
- Verify the language selector still works after the game is locked.
- Confirm player and demo links do not overwrite the host draft in local storage.
- Confirm no console errors appear during the full flow.

## Current gaps

- Browser coverage is Chromium-only.
- There is no automated visual regression coverage.
- Real-device mobile testing is still worth doing for touch ranking despite the mobile Playwright test.
