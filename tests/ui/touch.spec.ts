import { devices, expect, test } from "@playwright/test";

const STORAGE_KEY = "ryf:game";

test.use({ ...devices["Pixel 7"] });

function createStoredGame(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    gameId: "game_touch_1",
    title: "Touch Test Night",
    createdAt: "2026-03-23T10:00:00.000Z",
    finalizedAt: "2026-03-23T10:05:00.000Z",
    players: [
      { id: "p1", name: "Laure" },
      { id: "p2", name: "Katy" },
      { id: "p3", name: "Roy" },
    ],
    questions: [{ id: "q1", text: "Best snack curator", presenterId: "p1" }],
    submissions: {},
    settings: { scoring: "weighted", reveal: "rounds" },
    ...overrides,
  };
}

test("reorders rankings through touch drag on mobile", async ({ page }) => {
  await page.addInitScript(({ storageKey, storedGame }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(storedGame));
  }, {
    storageKey: STORAGE_KEY,
    storedGame: createStoredGame(),
  });

  await page.goto("/#v=player");
  await page.selectOption("#player-select", "p1");
  await page.click("#player-confirm");

  await expect(page.locator("#player-rank-hint")).toContainText("Drag a name");
  const rankingItems = page.locator("#player-questions .ranking-item");
  await expect(rankingItems).toHaveCount(3);
  await expect(rankingItems.nth(0)).toContainText("Laure");
  await expect(rankingItems.nth(2)).toContainText("Roy");
  await expect(rankingItems.nth(0).locator(".drag-handle")).toBeVisible();

  const sourceBox = await rankingItems.nth(2).boundingBox();
  const targetBox = await rankingItems.nth(0).boundingBox();
  if (!sourceBox || !targetBox) {
    throw new Error("Missing ranking item bounds for touch drag test.");
  }

  const start = {
    x: Math.round(sourceBox.x + sourceBox.width / 2),
    y: Math.round(sourceBox.y + sourceBox.height / 2),
  };
  const end = {
    x: Math.round(targetBox.x + targetBox.width / 2),
    y: Math.round(targetBox.y + targetBox.height / 2),
  };

  await rankingItems.nth(2).dispatchEvent("pointerdown", {
    pointerType: "touch",
    pointerId: 1,
    isPrimary: true,
    clientX: start.x,
    clientY: start.y,
    buttons: 1,
  });
  await rankingItems.nth(2).dispatchEvent("pointermove", {
    pointerType: "touch",
    pointerId: 1,
    isPrimary: true,
    clientX: end.x,
    clientY: end.y,
    buttons: 1,
  });
  await rankingItems.nth(2).dispatchEvent("pointerup", {
    pointerType: "touch",
    pointerId: 1,
    isPrimary: true,
    clientX: end.x,
    clientY: end.y,
    buttons: 0,
  });

  await expect(page.locator("#player-questions .ranking-item").nth(0)).toContainText("Roy");
  await expect(page.locator("#player-questions .ranking-item").nth(1)).toContainText("Laure");
  await expect(page.locator("#player-questions .ranking-item").nth(2)).toContainText("Katy");
});
