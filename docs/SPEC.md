## Ranking Your Friends - Detailed Spec (minimal, URL-hash first)

### 1) Goals
- A simple, account-free web app for a party game night.
- Facilitator sets up players + questions, then shares a URL-hash link to players.
- Players submit rankings via a short secret code; host generates a reveal link + QR.

### 2) Roles
- **Facilitator**: creates a game, shares links, collects player codes, presents results.
- **Player**: opens the shared link, selects their name, ranks all players for each question, copies a code.

### 3) Core game rules
- Questions: any count (selected/entered by facilitator).
- For each question, **every player ranks all players** (full ranking, no ties, no skips).
- Scoring: **simple** or **weighted**, based on how close each player's ranking is to the group consensus.
- Reveal: **slideshow** per question (prompt → question → ranking → round score → totals).
- Names are **select-only** (no free text) to avoid mismatches.

### 4) Primary flows
#### 4.1 Facilitator - Create & Lock
1. Create game (title, players list, questions list).
2. Facilitator **locks** the game (setup becomes read-only).
3. App encodes the game setup into the **URL hash** and writes a localStorage backup.
4. Facilitator shares link with friends.

#### 4.2 Player - Fill & Send Code
1. Player opens the link.
2. Player selects their name (locked to a single player id).
3. For each question, player ranks all players (drag-and-drop list).
4. Player copies a **secret code** line in the form `name:code` and sends it to the host.

#### 4.3 Facilitator - Collect & Present
1. Facilitator loads their original setup (from URL hash or localStorage).
2. Pastes each player’s `name:code` line.
3. When all players have submitted, facilitator generates a **Game Night link** for reveal.
4. Reveal runs as a guided fullscreen slideshow.

### 5) URL-hash storage model
- Store game state in the URL hash, compressed in-browser using `deflate-raw`,
  then base64url-encoded.
- Maintain a localStorage backup in case the hash is missing.

### 6) Data model (JSON)
#### 6.1 Game (facilitator state)
```
{
  "version": 1,
  "gameId": "uuid",
  "title": "string",
  "createdAt": "ISO-8601",
  "players": [{ "id": "p1", "name": "Alice" }],
  "questions": [{ "id": "q1", "text": "..." }],
  "submissions": {
    "p1": { "byQuestion": { "q1": ["p3","p2","p1"] } }
  },
  "settings": {
    "scoring": "simple",
    "reveal": "rounds"
  }
}
```

#### 6.2 Player submission (encoded into `name:code`)
```
{
  "version": 1,
  "gameId": "uuid",
  "playerId": "p1",
  "submittedAt": "ISO-8601",
  "byQuestion": {
    "q1": ["p3","p2","p1"]
  }
}
```

### 7) Validation rules
- Player must choose a **valid playerId** from the setup list.
- The player UI always starts with a full ranking list and only allows reordering, so each
  question remains a complete list of playerIds when exported.
- The app **does not re-validate ranking permutations** when importing codes.
- Reject import if:
  - line format is invalid.
  - `gameId` mismatch.
  - `playerId` mismatch or already submitted.
  - payload cannot be decoded.
- Show clear, blocking error messages (no conflict resolution workflow needed).

### 8) Scoring algorithm
For a question with `N` players:
1. Build a **consensus ranking** by averaging each player's rank position across all submissions
   (lower average = higher consensus rank).
2. **Weighted** scoring: for each submission, compute the total distance from consensus positions
   and award `maxDistance - distance` points (clamped at 0).
3. **Simple** scoring: for each submission, award 1 point for each player placed in the exact
   same position as the consensus order.
4. Tie handling: keep stable order by player name (documented).

### 9) Presentation / Reveal
- Fullscreen slideshow per question:
  1. **Presenter prompt**
  2. **Question** (large text)
  3. **Ranking reveal** (last → first)
  4. **Round score**
  5. **Total score**

### 10) Minimal UI surfaces
- **Setup**: game title, players list, question list, lock game, share link.
- **Player**: name select → ranking UI → secret code.
- **Host**: paste codes, completion status, generate reveal link + QR.

### 11) Privacy / lightweight obfuscation
- Player codes are compressed and base64url-encoded (not strong encryption).

### 12) Non-goals (for now)
- No accounts, no backend, no multiplayer sync.
- No partial rankings or ties.
- No advanced conflict resolution.
