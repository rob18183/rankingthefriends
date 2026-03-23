# Project Structure

```
.
├── app.ts                # Client-side UI logic, state, translations, encoding
├── game-logic.ts         # Scoring and reveal sequencing helpers
├── index.html            # Single-page app markup
├── styles.css            # App styling
├── tests/                # Node and Playwright test suites
├── docs/                 # Product, architecture, and roadmap notes
│   └── README.md         # Documentation index
├── package.json          # Scripts and dependencies
└── README.md             # Project overview
```

## Key files

- **app.ts**: main application logic, DOM rendering, i18n, and shared payload encoding
- **game-logic.ts**: consensus ranking, scoring, and reveal sequencing helpers
- **index.html**: DOM structure wired to `app.ts`
- **styles.css**: layout and component styling
- **tests/app-init.test.ts**: app bootstrap and high-risk behavior tests
- **tests/game-logic.test.js**: logic-level scoring and sequencing tests
- **tests/ui/**: browser coverage with Playwright
