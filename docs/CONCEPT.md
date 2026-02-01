## Ranking Your Friends (concept summary)

### Core game loop
1. **Setup**: enter players and questions, then lock the game.
2. **Rank**: each player ranks every player for each question.
3. **Collect**: players send a short secret code to the host.
4. **Reveal**: host opens a slideshow-style reveal link for the group.

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
- Game setup and reveal links are encoded in the URL hash.
- LocalStorage provides a backup for the host device.

### Non-goals
- No accounts, backend, or real-time sync.
