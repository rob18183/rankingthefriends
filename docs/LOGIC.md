## Core Logic Reference

### URL-hash encoding
- The app stores game setup or the full game state in the URL hash.
- Encode steps:
  1. `JSON.stringify(game)`
  2. UTF-8 → bytes
  3. `deflate-raw` (when available)
  4. base64url encode
- The encoded payload is stored under `#g=...` and backed up in localStorage.

### Consensus ranking
- For each question, the consensus order is built from the **average position** across submissions.
- Lower average position = higher consensus rank.

### Scoring
- **Simple**: 1 point per exact match against the consensus positions.
- **Weighted**: total distance from consensus order is subtracted from the maximum possible distance.

### Totals + sorting
- Round scores are summed across questions.
- Leaderboards are sorted by points (desc), then player name (asc) for stable ordering.

### Validation (current behavior)
- Players and questions must be present before locking.
- Player names must be unique.
- Imported submissions are validated for format, gameId, and duplicate submissions.
- The app assumes rankings are complete lists (enforced by the UI).
