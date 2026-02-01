# Testing Guide

## Automated checks
Run the production build plus automated logic tests:

```
npm run test
```

## UI tests (Playwright)
Run the Playwright UI smoke tests against a local Vite server:

```
npx playwright install chromium
npx playwright test
```

## Manual checklist
Use this walkthrough after any UI or logic change.

### Setup & navigation
1. Start the dev server and open the app.
2. Confirm the nav buttons switch between Setup, Collect Codes, and Inspiration.
3. Toggle the language selector between English and Nederlands and confirm labels update.

### Setup flow
1. Add at least 3 players.
2. Add at least 2 questions (try one custom + one suggested question).
3. Lock the game and confirm the share link + game code appear.
4. Refresh and confirm the state persists (localStorage + hash).

### Player flow
1. Open the Player view (via hash or nav).
2. Select a player name and verify the Start button enables.
3. Rank players for each question using the up/down controls.
4. Finish and copy the secret code; confirm the UI indicates the submission is ready.

### Host flow
1. Paste at least two player codes (one per line) and import them.
2. Confirm submission status updates and the Reveal button enables.
3. Generate the game night link and confirm the QR code renders.

### Reveal flow
1. Open the reveal link and confirm the fullscreen prompt.
2. Step through a full question reveal (prompt → question → reveal → round score).
3. Use Back to ensure navigation works.

### Regression checks
- Verify the language selector still works after the game is locked.
- Confirm no console errors appear during the full flow.
