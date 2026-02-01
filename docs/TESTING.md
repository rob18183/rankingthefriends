# Testing Guide

## Automated checks
Run the production build plus automated logic tests:

```
npm run test
```

## Agent development checklist (manual)
Use this walkthrough after any UI or logic change. It is intentionally explicit so agents can follow
the same repeatable flow every time.

### Setup & navigation
1. Start the dev server and open the app.
2. Confirm the nav buttons switch between Setup, Collect Codes, and Inspiration.
3. Toggle the language selector between English and Nederlands and confirm every label updates.

### Setup flow
1. Add at least 3 players.
2. Add at least 2 questions (try 1 custom + 1 suggested question).
3. Reorder players using drag-and-drop and verify the order updates.
4. Lock the game and confirm the share link + game code appear.
5. Refresh the page and confirm the game state persists (localStorage + hash).

### Player flow
1. Open the Player view (via hash or nav).
2. Select a player name and verify the Start button enables.
3. Rank players for each question, using both drag-and-drop and the up/down controls.
4. Finish and copy the secret code; confirm the UI indicates the submission is ready.

### Host flow
1. Paste at least two player codes (one per line) and import them.
2. Confirm submission status updates and the Reveal button enables.
3. Generate the game night link and confirm the QR code renders.

### Reveal flow
1. Open the reveal link and confirm the fullscreen prompt.
2. Choose both scoring modes and verify the score explanation text updates.
3. Step through at least one full question reveal (prompt → question → reveal → round score).
4. Go back one step to ensure the Back button works.

### Regression checks
- Verify the language selector still works after the game is locked.
- Confirm no console errors appear during the full flow.
