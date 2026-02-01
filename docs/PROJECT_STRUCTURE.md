# Project Structure

```
.
├── app.ts                # Client-side UI logic, state, and translations
├── game-logic.ts         # Scoring + reveal logic
├── index.html            # Single-page app markup
├── styles.css            # App styling
├── tests/                # Logic + UI smoke tests
├── docs/                 # Product + architecture documentation
├── package.json          # Scripts and dependencies
└── README.md             # Project overview
```

## Key files
- **app.ts**: Main application logic (rendering, state, i18n, hash encoding).
- **game-logic.ts**: Consensus ranking, scoring, and reveal sequencing helpers.
- **index.html**: DOM structure wired to `app.ts`.
- **styles.css**: Global layout and component styling.
