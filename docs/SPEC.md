## Ranking Your Friends - Detailed Spec

### 1) Goals
- A simple, account-free web app for a party game night.
- The host sets up players and questions, then shares a player link.
- Players submit rankings via a short player code.
- The host imports those codes and generates a reveal link plus QR.

### 2) Roles
- **Host**: creates a game, shares links, collects player codes, presents results.
- **Player**: opens the shared link, selects their name, ranks all players for each question, and copies a code.

### 3) Core game rules
- Questions: any count selected or entered by the host.
- For each question, every player ranks all players with a full ordering, no ties, and no skips.
- Scoring: **simple** or **weighted**, based on how close each player's ranking is to the group consensus.
- Reveal: slideshow per question with prompt, question, ranking reveal, and occasional subtotal checkpoints before the finale.
- Names are select-only to avoid mismatches.

### 4) Primary flows

#### 4.1 Host - Create and lock
1. Create a game with title, players, and questions.
2. Lock the game so setup becomes read-only.
3. The app encodes the setup into the URL hash and writes a localStorage backup.
4. The host shares the player link with friends.

#### 4.2 Player - Fill and send code
1. Open the player link.
2. Select your name.
3. Rank all players for each question.
4. Copy one player code and send it back to the host.

#### 4.3 Host - Collect and present
1. Load the original setup from the URL hash or localStorage.
2. Add each player code one at a time.
3. Remove no-shows if the group needs to continue without them.
4. Generate the reveal link and QR code.
5. Run the reveal in fullscreen presentation mode.

### 5) Storage model
- Store setup and reveal state in the URL hash, compressed in-browser using `deflate-raw`, then base64url-encoded.
- Maintain a localStorage backup for the host device.
- Shared payloads use compact wire formats to keep links and codes short.

### 6) Data model (high level)

#### 6.1 Game (host state)
```
{
  "title": "string",
  "players": [{ "id": "p1", "name": "Alice" }],
  "questions": [{ "id": "q1", "text": "...", "presenterId": "p1" }],
  "submissions": {
    "p1": { "byQuestion": { "q1": ["p3", "p2", "p1"] } }
  },
  "settings": {
    "scoring": "simple"
  }
}
```

#### 6.2 Player submission (encoded into player code)
```
{
  "playerId": "p1",
  "gameFingerprint": "short hash",
  "byQuestion": {
    "q1": ["p3", "p2", "p1"]
  }
}
```

### 7) Validation rules
- The player must choose a valid `playerId` from the setup list.
- The player UI always starts with a full ranking list and only allows reordering, so each question remains a complete list when exported.
- Reject import if:
  - the code format is invalid
  - the payload cannot be decoded
  - the game fingerprint does not match
  - the player id is invalid or already submitted
- Show clear blocking error messages. There is no conflict-resolution workflow.

### 8) Scoring algorithm
For a question with `N` players:

1. Build a consensus ranking by averaging each player's rank position across all submissions.
2. **Weighted** scoring computes the total distance from consensus positions and awards `maxDistance - distance`, clamped at `0`.
3. **Simple** scoring awards `1` point for each exact position match against the consensus order.
4. Ties are kept stable by player name for deterministic output.

### 9) Presentation and reveal
- Fullscreen slideshow per question:
  1. presenter prompt
  2. question
  3. ranking reveal
  4. subtotal checkpoint for earlier questions only
- Finale:
  1. finale intro
  2. final standings and awards

### 10) Minimal UI surfaces
- **Setup**: game title, players list, question list, lock game, player link
- **Player**: name select, ranking UI, player code
- **Host**: one-code-at-a-time import, completion status, reveal link, QR

### 11) Privacy and lightweight obfuscation
- Player codes and links are compactly encoded but not strongly encrypted.

### 12) Non-goals
- No accounts, backend, or multiplayer sync
- No partial rankings or ties
- No advanced conflict resolution
