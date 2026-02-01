# Code Review Notes

This document summarizes a full code review of the current repository, with a focus on reliability,
maintainability, and deployment risk.

## Strengths
- **Clear separation of concerns**: pure scoring logic is isolated in `game-logic.ts`.
- **Hash-based sharing** avoids backend dependencies and simplifies deployment.
- **Strong UX flow**: setup → player → host → reveal is consistent and easy to follow.
- **Internationalization** is centralized and works through `data-i18n` bindings.

## Weaknesses & risks

### Deployment + build
- **Bundler required**: The app depends on npm packages (`qrcode`) and TypeScript, so the repo root
  cannot be served directly as a static site. Deployments must serve the built `dist/` output.
- **Base path assumptions**: asset paths need to work in both GitHub Pages subpaths and local
  preview; relative base paths reduce that risk.

### UI robustness
- **Single-file UI module**: `app.ts` handles state, rendering, translations, and encoding. This
  makes the file large and increases the risk of accidental regressions.
- **DOM contract fragility**: `getElementById` casts assume all IDs exist; missing IDs would cause
  runtime failures without clear error messages.

### Data validation
- **Minimal import validation**: imported submissions are not deeply validated (e.g. full ranking
  permutation checks). Malformed data could lead to inconsistent scoring or UI errors.
- **No size guardrails**: very large player/question sets can generate oversized hashes; there is
  no current user-facing warning for hash length limits.

### Testing gaps
- **No UI automation**: automated tests focus on logic; DOM flows and i18n are manual only.
- **Environment sensitivity**: the test runner depends on `tsx` being installed, which can fail in
  minimal environments or CI without a proper install step.

### Security + privacy
- **Obfuscation only**: player codes are compressed and base64url-encoded, which is not encryption.
  Users should not expect confidentiality.

## Recommendations (prioritized)
1. **Keep deployments on `dist/`** and ensure GitHub Pages uses the Actions workflow.
2. **Add lightweight hash-length warnings** before locking a game to avoid broken share links.
3. **Add minimal data validation** for imported rankings (unique IDs, expected length).
4. **Split `app.ts`** into smaller modules if the UI grows further.
5. **Add basic UI smoke tests** (e.g., Playwright) for navigation and i18n toggling.
