# Ranking Your Friends

A playful party game: pick juicy questions, rank each other, and reveal the funniest results round by round.

## How it works
1. **Setup**: create a game with players and questions, then lock it.
2. **Players**: open the link, rank everyone, and copy a short **secret code**.
3. **Collect**: host pastes all codes and generates a **Game Night link + QR**.
4. **Reveal**: open the Game Night link on the big screen for a fullscreen slideshow.

## Scoring
- Each player assigns **N..1 points** per question (top rank gets N, last gets 1).
- Points are **summed across all players**.
- Reveal shows **Round score** and **Total score** after each question.

## Development
```
npm install
npm run dev
```

## Documentation
- `SPEC.md` – detailed product + flow spec
- `LOGIC.md` – scoring + encoding logic
- `WIREFLOW.md` – UI flow and steps
- `LAYOUT.md` – low‑fidelity layouts
- `COMPONENTS.md` – component responsibilities
- `CONCEPT.md` – high‑level concept summary

## Notes
- No accounts or backend.
- Data is embedded in URL hashes (compressed), with localStorage backup.
