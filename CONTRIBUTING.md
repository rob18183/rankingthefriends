# Contributing Guide

Thanks for helping improve **Ranking Your Friends**!

## Quick start
1. Install dependencies: `npm install`
2. Run the app locally: `npm run dev`
3. Run a production build (also used as a smoke test): `npm run test`

## Project structure
See `docs/PROJECT_STRUCTURE.md` for a tour of the repo layout and file responsibilities.

## Internationalization (i18n)
This project uses a simple key-based translation map in `app.js`.

When adding or updating UI text:
1. Add a translation key under the `translations` object for **all** supported languages.
2. For static HTML text, add `data-i18n` (or `data-i18n-placeholder`) attributes in `index.html`.
3. For dynamic strings in JavaScript, use the `t("path.to.key")` helper.
4. Avoid hard-coded UI strings outside the translations object.

## Code style
- Keep the app dependency-free where possible.
- Prefer small, composable functions in `app.js`.
- Use explicit, user-friendly error messages and keep them in translations.

## Pull requests
- Keep PRs focused and well-described.
- Include screenshots when you change user-facing UI.
- Mention any manual testing you performed.

## Security
Please report security issues privately. See `SECURITY.md` for details.

## Code of conduct
By participating, you agree to follow `CODE_OF_CONDUCT.md`.
