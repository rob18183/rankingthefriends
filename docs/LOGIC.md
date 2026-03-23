## Core Logic Reference

### URL-hash encoding
- The app stores game setup or reveal state in the URL hash.
- Encode steps:
  1. convert current state into a compact wire format
  2. UTF-8 to bytes
  3. `deflate-raw` when available
  4. base64url encode
- The encoded payload is stored in the URL hash and backed up in localStorage on the host device.

### Submission codes
- Player submissions use a compact payload format rather than verbose JSON objects.
- Player and question references are encoded by numeric position where possible.
- Submissions include a short game fingerprint instead of a full `gameId`.

### Consensus ranking
- For each question, the consensus order is built from the average position across submissions.
- Lower average position means a higher consensus rank.

### Scoring
- **Simple**: 1 point per exact match against the consensus positions.
- **Weighted**: total distance from consensus order is subtracted from the maximum possible distance.

### Totals and sorting
- Scores are summed across questions.
- Leaderboards are sorted by points descending, then player name ascending for stable ordering.

### Validation
- Players and questions must be present before locking.
- Player names must be unique case-insensitively.
- Imported submissions are validated for format, game fingerprint, and duplicate submissions.
- The app assumes rankings are complete lists because the UI only allows reordering existing players.

### Reveal sequencing
- Reveal now favors pacing over constant bookkeeping.
- Question flow is:
  1. presenter prompt
  2. question
  3. ranking reveal
  4. occasional subtotal checkpoint earlier in the game
  5. finale intro
  6. final standings and awards
