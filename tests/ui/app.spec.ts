import { expect, test } from "@playwright/test";

const STORAGE_KEY = "ryf:game";

function createStoredGame(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    gameId: "game_test_1",
    title: "Test Night",
    createdAt: "2026-03-23T10:00:00.000Z",
    finalizedAt: "2026-03-23T10:05:00.000Z",
    players: [
      { id: "p1", name: "Laure" },
      { id: "p2", name: "Katy" },
    ],
    questions: [{ id: "q1", text: "Best snack curator", presenterId: "p1" }],
    submissions: {},
    settings: { scoring: "weighted", reveal: "rounds" },
    ...overrides,
  };
}

test("navigates between views and toggles language", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("#language-select");
  await expect(page.locator("#language-select option")).toHaveCount(2);
  await expect(page.locator("#language-select")).toContainText("🇬🇧");
  await expect(page.locator("#language-select")).toContainText("🇳🇱");

  await expect(page.locator("#hero-start")).toHaveText(/Start a new game/);
  await expect(page.locator("#nav-setup")).toHaveText(/Start/);
  await page.locator("#language-select").selectOption("nl");
  await expect(page.locator("#nav-setup")).toHaveText(/Start/);

  await page.click("#nav-host");
  await expect(page.locator("#view-host")).toBeVisible();
  await page.click("#nav-inspiration");
  await expect(page.locator("#view-inspiration")).toBeVisible();
});

test("locks a game and shows a share link", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("#language-select");
  await expect(page.locator("#language-select option")).toHaveCount(2);

  for (let i = 0; i < 3; i += 1) {
    await page.click("#add-player");
  }
  const playerInputs = page.locator("#players-list input");
  await playerInputs.nth(0).fill("Laure");
  await playerInputs.nth(1).fill("Katy");
  await playerInputs.nth(2).fill("Roy");

  for (let i = 0; i < 2; i += 1) {
    await page.click("#add-question");
  }
  const questionInputs = page.locator("#questions-list input");
  await questionInputs.nth(0).fill("Best snack curator");
  await questionInputs.nth(1).fill("Most likely to start a dance party");

  await page.click("#finalize-game");
  await expect(page.locator("#finalized-panel")).toBeVisible();
  await expect(page.locator("#share-url")).toHaveValue(/#v=player/);
  await expect(page.locator("#setup-budget")).toContainText("Player link size:");
  await expect(page.locator("#finalized-panel")).toContainText(/What happens next/);
});

test("invalid shared links fail closed with a visible error", async ({ page }) => {
  await page.addInitScript(({ storageKey, storedGame }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(storedGame));
  }, { storageKey: STORAGE_KEY, storedGame: createStoredGame({ title: "Local Draft That Must Not Load" }) });

  await page.goto("/#v=player&g=not-valid-base64");

  await expect(page.locator("#app-error")).toContainText("invalid or expired");
  await expect(page.locator("#view-setup")).toBeVisible();
  await expect(page.locator("#view-player")).toBeHidden();
  await expect(page.locator("#game-title")).toHaveValue("");
});

test("finalized games restore share data after reload", async ({ page }) => {
  await page.addInitScript(({ storageKey, storedGame }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(storedGame));
  }, { storageKey: STORAGE_KEY, storedGame: createStoredGame() });

  await page.goto("/");

  await expect(page.locator("#share-url")).toHaveValue(/#v=player&g=/);
  await expect(page.locator("#game-code")).not.toHaveValue("");
});

test("host can remove a finalized no-show player and continue", async ({ page }) => {
  await page.addInitScript(({ storageKey, storedGame }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(storedGame));
  }, {
    storageKey: STORAGE_KEY,
    storedGame: createStoredGame({
      players: [
        { id: "p1", name: "Laure" },
        { id: "p2", name: "Katy" },
        { id: "p3", name: "Marieke" },
      ],
      submissions: {
        p1: {
          playerId: "p1",
          byQuestion: { q1: ["p1", "p2", "p3"] },
        },
        p2: {
          playerId: "p2",
          byQuestion: { q1: ["p2", "p1", "p3"] },
        },
      },
    }),
  });

  await page.goto("/");
  await page.click("#nav-host");

  await expect(page.locator("#submission-missing")).toContainText("Marieke");
  await expect(page.locator("#submission-missing-copy")).toContainText("remove them before reveal");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#submission-missing .status-row").nth(0).locator("button").click();

  await expect(page.locator("#submission-missing")).toContainText("Nobody is missing");
  await expect(page.locator("#submission-received .status-row")).toHaveCount(2);
  await expect(page.locator("#start-reveal")).toBeEnabled();
  await expect(page.locator("#share-url")).toHaveValue(/#v=player&g=/);
});

test("player end state clearly shows the send-back steps", async ({ page }) => {
  await page.addInitScript(({ storageKey, storedGame }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(storedGame));
  }, {
    storageKey: STORAGE_KEY,
    storedGame: createStoredGame({
      players: [
        { id: "p1", name: "Laure" },
        { id: "p2", name: "Katy" },
        { id: "p3", name: "Roy" },
      ],
      questions: [{ id: "q1", text: "Best snack curator", presenterId: "p1" }],
    }),
  });

  await page.goto("/#v=player");
  await page.selectOption("#player-select", "p1");
  await page.click("#player-confirm");
  await page.click("#player-finish");

  await expect(page.locator("#player-step-submit")).toBeVisible();
  await expect(page.locator("#player-step-submit")).toContainText("What to do now");
  await expect(page.locator("#player-step-submit")).toContainText("Copy your player code");
  await expect(page.locator("#player-step-submit")).toContainText("Send it back to the host");
});

test("player links hide host marketing panels", async ({ page }) => {
  await page.addInitScript(({ storageKey, storedGame }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(storedGame));
  }, {
    storageKey: STORAGE_KEY,
    storedGame: createStoredGame(),
  });

  await page.goto("/#v=player");

  await expect(page.locator("#view-player")).toBeVisible();
  await expect(page.locator("#hero-actions")).toBeHidden();
  await expect(page.locator("#demo-card")).toBeHidden();
  await expect(page.locator("#overview-card")).toBeHidden();
});

test("demo reveal does not overwrite the host draft in local storage", async ({ page }) => {
  await page.addInitScript(({ storageKey, storedGame }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(storedGame));
  }, {
    storageKey: STORAGE_KEY,
    storedGame: createStoredGame({
      title: "Keep My Draft",
      players: [{ id: "p1", name: "Laure" }, { id: "p2", name: "Katy" }, { id: "p3", name: "Roy" }],
      questions: [{ id: "q1", text: "Best snack curator", presenterId: "p1" }],
    }),
  });

  await page.goto("/");
  const demoHref = await page.locator("#demo-reveal-link").getAttribute("href");
  if (!demoHref) throw new Error("Missing demo reveal href.");

  await page.goto(demoHref);
  await expect(page.locator("#view-reveal")).toBeVisible();

  await page.goto("/");
  await expect(page.locator("#game-title")).toHaveValue("Keep My Draft");
  await expect(page.locator("#players-list input")).toHaveCount(3);
});

test("compact player links and player codes still complete the full host flow", async ({ browser }) => {
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();

  await hostPage.goto("/");
  for (let i = 0; i < 3; i += 1) {
    await hostPage.click("#add-player");
  }
  const playerInputs = hostPage.locator("#players-list input");
  await playerInputs.nth(0).fill("Laure");
  await playerInputs.nth(1).fill("Katy");
  await playerInputs.nth(2).fill("Roy");

  for (let i = 0; i < 2; i += 1) {
    await hostPage.click("#add-question");
  }
  const questionInputs = hostPage.locator("#questions-list input");
  await questionInputs.nth(0).fill("Best snack curator");
  await questionInputs.nth(1).fill("Most likely to start a dance party");

  await hostPage.click("#finalize-game");
  await expect(hostPage.locator("#share-url")).toHaveValue(/#v=player&g=/);
  const shareUrl = await hostPage.locator("#share-url").inputValue();
  expect(shareUrl.length).toBeLessThan(600);

  const playerPage = await hostContext.newPage();
  const shareHash = new URL(shareUrl).hash;
  await playerPage.goto("/");
  await playerPage.evaluate((hash) => {
    window.location.hash = hash;
  }, shareHash);
  await expect(playerPage.locator("#view-player")).toBeVisible();
  await playerPage.selectOption("#player-select", { index: 1 });
  await playerPage.click("#player-confirm");
  await playerPage.click("#next-question");
  await playerPage.click("#player-finish");

  await expect(playerPage.locator("#submission-line")).not.toHaveValue("");
  const playerCode = await playerPage.locator("#submission-line").inputValue();
  expect(playerCode.length).toBeLessThan(80);

  await hostPage.click("#nav-host");
  await hostPage.locator("#import-text").fill(playerCode);
  await hostPage.click("#import-submit");

  await expect(hostPage.locator("#submission-received")).toContainText("Laure");
  await hostContext.close();
});

test("reveal pacing skips round tallies, avoids late subtotals, and supports keyboard navigation", async ({ page }) => {
  await page.addInitScript(({ storageKey, storedGame }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(storedGame));
  }, {
    storageKey: STORAGE_KEY,
    storedGame: createStoredGame({
      players: [
        { id: "p1", name: "Laure" },
        { id: "p2", name: "Katy" },
        { id: "p3", name: "Roy" },
      ],
      questions: [
        { id: "q1", text: "Best snack curator", presenterId: "p1" },
        { id: "q2", text: "Most likely to start a dance party", presenterId: "p2" },
        { id: "q3", text: "Who starts the latest group chat drama", presenterId: "p3" },
        { id: "q4", text: "Who would forget the snacks", presenterId: "p1" },
      ],
      submissions: {
        p1: {
          playerId: "p1",
          byQuestion: {
            q1: ["p1", "p2", "p3"],
            q2: ["p2", "p1", "p3"],
            q3: ["p3", "p1", "p2"],
            q4: ["p2", "p3", "p1"],
          },
        },
        p2: {
          playerId: "p2",
          byQuestion: {
            q1: ["p2", "p1", "p3"],
            q2: ["p2", "p3", "p1"],
            q3: ["p3", "p2", "p1"],
            q4: ["p1", "p3", "p2"],
          },
        },
        p3: {
          playerId: "p3",
          byQuestion: {
            q1: ["p1", "p3", "p2"],
            q2: ["p3", "p2", "p1"],
            q3: ["p2", "p3", "p1"],
            q4: ["p3", "p1", "p2"],
          },
        },
      },
    }),
  });

  await page.goto("/#v=reveal");
  await expect(page.locator("#reveal-suspense-toggle")).toBeVisible();
  await page.click("#reveal-skip-fullscreen");
  await expect(page.locator("#reveal-phase-label")).toContainText("Round intro");
  await expect(page.locator("#reveal-key-hint")).toContainText("[Left/Backspace]");

  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press("ArrowRight");
  }
  await expect(page.locator("#reveal-total-panel")).toBeVisible();
  await expect(page.locator("#reveal-phase-label")).toContainText("Standings");

  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#reveal-ranking-panel")).toBeVisible();

  await page.keyboard.press("Space");
  await expect(page.locator("#reveal-total-panel")).toBeVisible();

  for (let i = 0; i < 9; i += 1) {
    await page.keyboard.press("ArrowRight");
  }
  await expect(page.locator("#reveal-total-panel")).toBeVisible();
  await expect(page.locator("#reveal-phase-label")).toContainText("Standings");

  for (let i = 0; i < 9; i += 1) {
    await page.keyboard.press("ArrowRight");
  }
  await expect(page.locator("#reveal-total-panel")).toBeHidden();
  await expect(page.locator("#reveal-phase-label")).not.toContainText("Standings");

  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press("ArrowRight");
  }
  await expect(page.locator("#reveal-finaleintro-panel")).toBeVisible();
  await page.keyboard.press("Backspace");
  await expect(page.locator("#reveal-ranking-panel")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#reveal-end-panel")).toBeVisible();
  await expect(page.locator("#reveal-end-panel")).toContainText("Mini awards");
});
