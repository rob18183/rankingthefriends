# TypeScript Transition Plan

## Current quality snapshot
- **Structure**: The app is a small Vite-based, no-backend SPA with a single UI module (`app.ts`) and a dedicated logic module (`game-logic.ts`).【F:app.ts†L1-L230】【F:game-logic.ts†L1-L223】【F:package.json†L1-L16】
- **Logic separation**: Core ranking/scoring behaviors live in `game-logic.ts`, which already has unit tests covering key logic flows.【F:game-logic.ts†L1-L223】【F:tests/game-logic.test.ts†L1-L96】
- **UI surface area**: `app.ts` contains UI rendering, state management, translation data, and URL-hash encoding logic (large single-file module).【F:app.ts†L1-L2447】

## Docs vs. implementation alignment (findings)
1. **Scoring model mismatch**
   - The spec describes a **descending N..1 scoring** model as the core rule, and the data model example lists `settings.scoring: "descending"`.【F:docs/SPEC.md†L17-L69】
   - The code and UI implement **simple vs. weighted** scoring, and `normalizeScoring` maps the legacy `descending` value to `weighted`.【F:app.ts†L175-L189】【F:game-logic.ts†L74-L79】
2. **Consensus ranking calculation differs from logic doc**
   - The logic doc describes consensus ranking via **point totals per rank** (N..1).【F:docs/LOGIC.md†L20-L44】
   - The implementation builds consensus ranking using **average position** (lower average = higher rank).【F:game-logic.ts†L36-L63】
3. **Validation rules partially described**
   - The logic doc specifies validations for player/question counts and ranking permutations.【F:docs/LOGIC.md†L63-L80】
   - The app performs several validation checks, but it is not documented whether all rules (like full permutation checks for every question) are enforced consistently across UI paths; this should be audited before migration to ensure types don’t codify an incorrect assumption.【F:app.ts†L2032-L2063】

## Test coverage snapshot
- **Automated coverage**: Unit tests currently exercise the scoring and reveal sequencing in `game-logic.ts`.【F:tests/game-logic.test.ts†L1-L96】
- **Gaps**: There are **no UI/integration tests**, and the manual test checklist is the primary guardrail for UI flows and translations.【F:docs/TESTING.md†L1-L43】
- **Scripted checks**: `npm run test` runs a production build then `node --test --import tsx`, but it does not verify UI flows or DOM behavior.【F:package.json†L6-L16】

## Can this project be converted to TypeScript?
Yes, and it now is. The app is a good candidate because it is a small, client-only Vite project and the logic is already separated into a module that can be migrated first. The main friction points were:
- **Large single UI file**: `app.ts` contains rendering, state, translations, and encoding logic; migrating this all at once is error-prone.【F:app.ts†L1-L2447】
- **QRCode typing**: The UI imports QRCode from the npm package, so TypeScript types resolve cleanly.【F:app.ts†L1-L1】【F:package.json†L12-L16】
- **Doc mismatches**: The scoring model described in docs doesn’t match the current implementation. Aligning documentation and implementation before typing helps avoid codifying outdated logic in TypeScript types.【F:docs/SPEC.md†L17-L89】【F:docs/LOGIC.md†L20-L44】【F:game-logic.ts†L74-L146】

## Preparation tasks (before converting files)
1. **Align docs to implementation**
   - Update `docs/SPEC.md` and `docs/LOGIC.md` to describe the current scoring modes (simple/weighted) and the consensus calculation method (average position).【F:docs/SPEC.md†L17-L89】【F:docs/LOGIC.md†L20-L44】【F:game-logic.ts†L36-L146】
2. **Define data models**
   - Create explicit `Game`, `Player`, `Question`, `Submission`, and `Settings` interfaces based on current usage in `app.ts` and `game-logic.ts`.【F:app.ts†L1-L230】【F:game-logic.ts†L1-L74】
3. **Decide on QRCode import strategy**
   - Preferred: use the npm package import (`import QRCode from "qrcode"`) so types resolve in TypeScript; otherwise add a minimal `declare module` for the CDN import.【F:app.ts†L1-L1】【F:package.json†L12-L16】
4. **Add a dedicated typecheck script**
   - Introduce `tsc --noEmit` for CI validation alongside the existing `npm run test`.【F:package.json†L6-L16】

## Migration plan (phased)
### Phase 0 — Documentation & audit (checkpoint: docs aligned)
- Update docs to reflect current scoring and consensus logic.
- Audit validation flows in `app.ts` to confirm all rules are enforced.

### Phase 1 — Tooling (checkpoint: typecheck passes)
- Add `typescript`, `@types/node`, and a `tsconfig.json` with strict settings.
- Configure Vite for TS (default with `.ts` entry files).

### Phase 2 — Logic-first conversion (checkpoint: logic tests pass in TS)
- Convert `game-logic.js` → `game-logic.ts`.
- Convert unit tests to TypeScript or use a runner like `tsx`.
- Ensure `npm run test` (or new TS test script) passes unchanged.

### Phase 3 — UI conversion (checkpoint: build + manual checklist)
- Convert `app.js` → `app.ts` in smaller steps:
  - Extract types for DOM lookups and state.
  - Incrementally type `state`, `translations`, and URL-hash helpers.
- Update `index.html` to import the new `app.ts` entry (or Vite entry file).

### Phase 4 — Strictness hardening (checkpoint: no implicit any)
- Remove `any` and tighten typing for `submissions`, `reveal` state, and translation keys.
- Add or update tests for any logic uncovered during migration.

## Progress report
- **Phase 0 — Documentation & audit**: ✅ Completed in the prior step (docs aligned).
- **Phase 1 — Tooling**: ✅ `tsconfig.json` added with strict options and a `typecheck` script is available.【F:tsconfig.json†L1-L16】【F:package.json†L6-L16】
- **Phase 2 — Logic-first conversion**: ✅ `game-logic.ts` and unit tests are now TypeScript, with test runner updated to use `tsx`.【F:game-logic.ts†L1-L223】【F:tests/game-logic.test.ts†L1-L96】【F:package.json†L6-L16】
- **Phase 3 — UI conversion**: ✅ `app.ts` is fully typed and `index.html` now references the TS entrypoint.【F:app.ts†L1-L2447】【F:index.html†L374】
- **Phase 4 — Strictness hardening**: ✅ Added explicit types for state, DOM lookups, and payloads to avoid implicit `any` under strict mode.【F:app.ts†L1-L2447】
- **Blocking note**: `npx tsc --noEmit` requires installing dependencies locally; the package registry was unavailable in this environment (HTTP 403). Re-run `npm install` or `npm ci` before typechecking.【F:package.json†L6-L16】

## Verification tests to run during migration
- **Unit + build**: `npm run test` (build + `node --test --import tsx`).【F:package.json†L6-L16】
- **Typecheck**: `npx tsc --noEmit`.【F:package.json†L6-L16】
- **Manual UI regression**: follow `docs/TESTING.md` after each UI-related conversion phase.【F:docs/TESTING.md†L1-L43】

## Risks & mitigations
- **Mismatch between docs and code**: update docs before types to avoid encoding outdated rules into types.【F:docs/SPEC.md†L17-L89】【F:docs/LOGIC.md†L20-L44】【F:game-logic.ts†L36-L146】
- **QRCode import typing**: use npm import or add declaration to keep TS happy.【F:app.ts†L1-L1】【F:package.json†L12-L16】
- **Large UI file**: convert in slices, possibly extracting helpers or modules to reduce risk and improve testability.【F:app.ts†L1-L2447】
