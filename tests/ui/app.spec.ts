import { expect, test } from "@playwright/test";

test("navigates between views and toggles language", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("#language-select option");

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
  await page.waitForSelector("#language-select option");

  for (let i = 0; i < 3; i += 1) {
    await page.click("#add-player");
  }
  const playerInputs = page.locator("#players-list input");
  await playerInputs.nth(0).fill("Ava");
  await playerInputs.nth(1).fill("Ben");
  await playerInputs.nth(2).fill("Carla");

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
