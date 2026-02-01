# TypeScript Status

The project is fully TypeScript today (`app.ts`, `game-logic.ts`, and tests). The migration plan
in earlier drafts is no longer applicable.

## Current expectations
- Keep UI logic in `app.ts` and pure game logic in `game-logic.ts`.
- Use `npm run typecheck` for strict type validation.
- Add new tests in `tests/` using the existing Node test runner + `tsx`.

## If you refactor
- Prefer smaller helper functions over new files unless there is a clear ownership boundary.
- Update docs in `docs/` when core logic or UI flow changes.
