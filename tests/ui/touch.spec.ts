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

  const rankingItems = page.locator("#player-questions .ranking-item");
  await expect(rankingItems).toHaveCount(3);
  await expect(rankingItems.nth(0)).toContainText("Laure");
  await expect(rankingItems.nth(2)).toContainText("Roy");

  const sourceBox = await rankingItems.nth(2).boundingBox();
  const targetBox = await rankingItems.nth(0).boundingBox();
  if (!sourceBox || !targetBox) {
    throw new Error("Missing ranking item bounds for touch drag test.");
  }

  await page.evaluate(({ start, end }) => {
    const source = document.querySelector('[data-player-id="p3"]');
    if (!(source instanceof HTMLElement)) {
      throw new Error("Could not find touch source element.");
    }

    const touchPoint = (x: number, y: number) =>
      new Touch({
        identifier: 1,
        target: source,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
        radiusX: 4,
        radiusY: 4,
        force: 0.5,
      });

    const startTouch = touchPoint(start.x, start.y);
    source.dispatchEvent(
      new TouchEvent("touchstart", {
        bubbles: true,
        cancelable: true,
        touches: [startTouch],
        targetTouches: [startTouch],
        changedTouches: [startTouch],
      }),
    );

    const moveTouch = touchPoint(end.x, end.y);
    source.dispatchEvent(
      new TouchEvent("touchmove", {
        bubbles: true,
        cancelable: true,
        touches: [moveTouch],
        targetTouches: [moveTouch],
        changedTouches: [moveTouch],
      }),
    );

    source.dispatchEvent(
      new TouchEvent("touchend", {
        bubbles: true,
        cancelable: true,
        touches: [],
        targetTouches: [],
        changedTouches: [moveTouch],
      }),
    );
  }, {
    start: {
      x: sourceBox.x + sourceBox.width / 2,
      y: sourceBox.y + sourceBox.height / 2,
    },
    end: {
      x: targetBox.x + targetBox.width / 2,
      y: targetBox.y + targetBox.height / 2,
    },
  });

  await expect(page.locator("#player-questions .ranking-item").nth(0)).toContainText("Roy");
  await expect(page.locator("#player-questions .ranking-item").nth(1)).toContainText("Laure");
  await expect(page.locator("#player-questions .ranking-item").nth(2)).toContainText("Katy");
});
