## Ranking Your Friends - Core Logic Spec

### 1) URL-hash encoding
- **Goal**: store setup or full `GameState` in URL hash, compressed + base64url.
- **Encode steps**:
  1. `JSON.stringify(gameState)`
  2. UTF-8 to bytes
  3. `deflate-raw` (level default)
  4. base64url encode
  5. prefix with `#g=`
- **Decode steps**: reverse the above; validate `version`.
- **Backup**: store raw JSON in `localStorage["ryf:game"]`.

### 2) Size guardrails
- Warn if hash length > 8,000 chars (suggest reducing questions/players).
- If hash > 16,000 chars: block save and show error.

### 3) Derived helpers
#### 3.1 Points per rank (for consensus)
```
pointsForRank(rankIndex, totalPlayers) = totalPlayers - rankIndex
// rankIndex is 0-based (0 => top rank)
```

#### 3.2 Build consensus ranking
Input: all submissions for that question  
Output: map `{ playerId: points }` and a sorted order
```
for each submission:
  for i in 0..N-1:
    consensusPoints[ranking[i]] += pointsForRank(i, N)

consensusOrder = players sorted by consensusPoints desc, then name asc
```

#### 3.3 Score a single submission (guess score)
Input: `ranking` (player ids ordered), `consensusOrder`  
Output: `score` (higher is better)
```
distance = sum(abs(rankIndex - consensusIndex)) for each player
maxDistance = sum(abs(i - (N - 1 - i))) for i in 0..N-1
score = max(0, maxDistance - distance)
```

#### 3.4 Score a round (question)
Input: all submissions for that question  
Output: `{ playerId: totalPoints }` where `playerId` is the submitter
```
for each submission:
  totals[submission.playerId] += scoreSubmission(submission.ranking, consensusOrder)
```

#### 3.5 Overall totals
Input: round scores  
Output: `{ playerId: totalPoints }` across all questions

#### 3.6 Ranking
- Sort by `points desc`, then by `player.name asc` for stability.
- Assign ranks sequentially (no shared ranks).

### 4) Validation rules (logic)
- **Setup**:
  - `players.length >= 2`
  - `questions.length >= 1`
  - Player names unique, non-empty.
  - Question text non-empty.
- **Submission**:
  - `playerId` exists in setup.
  - `byQuestion` contains all `questionId` keys.
  - Each ranking list is a **permutation** of all player ids.
  - Reject duplicates or missing player ids.
- **Import**:
  - `gameId` must match.
  - `version` supported.
  - `playerId` not already submitted.

### 5) Reveal sequencing
- Questions are revealed in the setup order.
- For each round:
  1. Presenter prompt.
  2. Question text.
  3. Ranking reveal (last → first).
  4. Round score.
  5. Total score.

### 6) Obfuscation (current)
- Player codes are compressed and base64url-encoded.
- This is best-effort privacy, not hard security.
