## Ranking Your Friends (web-app concept scaffold)

### Core game loop
1. **Setup**: enter player list and pick questions.
2. **Collect rankings**: each player submits a full ranking (1..N) of all players for each question.
3. **Score**: for each question, each player gives descending points to ranked positions (N..1). All players’ points are summed per person.
4. **Reveal**: present each question in a staged slideshow (prompt → question → ranking reveal → round score → totals).

### Key data model (for web app)
- **Game**
  - `id`, `title`, `createdAt`, `settings` (e.g. max players, points scheme)
- **Players**
  - list of `{ id, name }`
- **Questions**
  - list of `{ id, text, order }` (any count)
- **Rankings**
  - per player per question: ordered list of player ids (length N, unique)
  - e.g. `{ questionId, voterId, ranking: [playerId1, playerId2, ...] }`
- **Scores (derived)**
  - per question, per player: summed points
  - overall totals: sum across questions

### Scoring logic
- Each voter assigns **descending points by rank** (top rank gets N points, next gets N-1, ... last gets 1).
- For each question, points are **summed across all voters** to get the question scoreboard.
- Ties are resolved by **stable name order** for display.

### Import/export needs
- **Setup share**: URL hash contains game setup.
- **Player submission**: short `name:code` line (compressed) to send to host.
- **Reveal link**: URL hash contains full game state; share via link or QR.

### Web app concept (no accounts, in-browser)
- **Storage**: local state in memory + LocalStorage backup.
- **Screens**
  1. **Setup**: game name, players, questions, lock game.
  2. **Player**: select name, rank all questions, copy secret code.
  3. **Collect**: paste `name:code` lines, generate reveal link + QR.
  4. **Reveal**: fullscreen slideshow presentation.

### Open questions (to confirm before building)
- Optional tie handling (shared ranks)?
- Conflict resolution for late edits?
