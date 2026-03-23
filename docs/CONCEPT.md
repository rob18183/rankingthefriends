## Ranking Your Friends (concept summary)

### Core game loop
1. **Setup**: enter players and questions, then lock the game.
2. **Rank**: each player opens a private player link and ranks every player for each question.
3. **Collect**: each player sends one short player code back to the host.
4. **Reveal**: the host opens a big-screen reveal link for the group.

### Scoring (current)
- The app supports **simple** and **weighted** scoring modes.
- **Simple**: 1 point for each exact position match vs. the consensus order.
- **Weighted**: more points when a player’s ranking is closer to the consensus order.

### Data model (high level)
- **Game**: title, players, questions, settings, submissions.
- **Player**: `{ id, name }`
- **Question**: `{ id, text, presenterId }`
- **Submission**: `{ playerId, byQuestion }` (ranked lists for each question).

### Storage + sharing
- Game setup and reveal links are encoded into compact URL hashes.
- Player submissions are encoded into short copied codes.
- LocalStorage provides a backup for the host device.

### Non-goals
- No accounts, backend, or real-time sync.
