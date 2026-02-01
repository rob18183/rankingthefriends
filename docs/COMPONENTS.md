## UI Architecture Notes

This project is a **single-page, DOM-driven** app rather than a component framework.
The UI is organized around sections in `index.html` and rendered by helper functions in `app.ts`.

### Key sections
- **Header + navigation**: app intro, language selector, and view buttons.
- **Setup view**: players/questions editors, scoring selector, lock/share panel.
- **Player view**: identity selection, ranking flow, and code export.
- **Host view**: submission import, status list, reveal link + QR.
- **Reveal view**: fullscreen prompt and slideshow steps.
- **Inspiration view**: question categories with add-to-game actions.

### State ownership (current)
- `app.ts` owns a single `state` object with the game, view, language, and reveal state.
- `game-logic.ts` exposes pure helpers for consensus ranking and scoring.

### Why this matters
- Treat DOM IDs as a public contract between `index.html` and `app.ts`.
- Changes to IDs or view structure should be mirrored in `app.ts` render/update helpers.
