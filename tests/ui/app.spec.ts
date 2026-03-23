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

  await expect(page.locator("#nav-setup")).toHaveText(/Setup/);
  await page.locator("#language-select").selectOption("nl");
  await expect(page.locator("#nav-setup")).toHaveText(/Instellen/);

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

  await expect(page.locator("#submission-status .list-row")).toHaveCount(3);
  await page.locator("#submission-status .list-row").nth(2).locator("button").click();

  await expect(page.locator("#submission-status .list-row")).toHaveCount(2);
  await expect(page.locator("#start-reveal")).toBeEnabled();
  await expect(page.locator("#share-url")).toHaveValue(/#v=player&g=/);
});
