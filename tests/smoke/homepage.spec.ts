import { expect, test } from "@playwright/test";
import {
  collectUnexpectedErrors,
  installMocks,
  mockTransport,
} from "./fixtures";

test.beforeEach(async ({ page }) => {
  await installMocks(page);
});

test("homepage renders mocked site info, status cards and node list", async ({
  page,
}) => {
  const errors = collectUnexpectedErrors(page);
  await page.goto("/");

  // Site name comes from the mocked /api/public payload.
  await expect(page.getByText("Komari Smoke").first()).toBeVisible();

  // Node list arrives through the mocked JSON-RPC transport.
  const tokyo = page.locator(".km-node-name", { hasText: "tokyo-1" });
  const frankfurt = page.locator(".km-node-name", { hasText: "frankfurt-1" });
  await expect(tokyo).toBeVisible();
  await expect(frankfurt).toBeVisible();

  // Online count and summary come from the mocked latest-status data.
  await expect(page.getByText("1 / 2").first()).toBeVisible();
  await expect(page.getByText("2 servers total, 1 online")).toBeVisible();

  // The preferred WebSocket JSON-RPC transport carries the traffic.
  await expect
    .poll(() => mockTransport.wsMessages, { timeout: 10_000 })
    .toBeGreaterThan(0);

  expect(errors).toEqual([]);
});

test("search filters the node list and reports the result count", async ({
  page,
}) => {
  const errors = collectUnexpectedErrors(page);
  await page.goto("/");
  await expect(
    page.locator(".km-node-name", { hasText: "frankfurt-1" }),
  ).toBeVisible();

  await page
    .getByPlaceholder("Search nodes by name, region, OS...")
    .fill("tokyo");

  await expect(
    page.locator(".km-node-name", { hasText: "frankfurt-1" }),
  ).toHaveCount(0);
  await expect(page.locator(".km-node-name", { hasText: "tokyo-1" })).toBeVisible();
  await expect(page.getByText("Found 1 server out of 2")).toBeVisible();

  // The clear button restores the full list.
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(
    page.locator(".km-node-name", { hasText: "frankfurt-1" }),
  ).toBeVisible();

  expect(errors).toEqual([]);
});

test("status settings popover toggles a summary card", async ({ page }) => {
  const errors = collectUnexpectedErrors(page);
  await page.goto("/");
  const summaryGrid = page.locator(".km-summary-card-grid");
  await expect(summaryGrid.getByText("1 / 2")).toBeVisible();

  await page.getByRole("button", { name: "Status Settings" }).click();
  const popover = page.locator("[data-radix-popper-content-wrapper]");
  await expect(popover.getByText("Status Settings")).toBeVisible();

  // Switch rows follow the status card order; index 1 is "Current Online".
  const onlineSwitch = popover.getByRole("switch").nth(1);
  await expect(onlineSwitch).toHaveAttribute("aria-checked", "true");
  await onlineSwitch.click();
  await expect(onlineSwitch).toHaveAttribute("aria-checked", "false");

  // The card disappears from the summary grid, the other cards stay.
  await expect(summaryGrid.getByText("1 / 2")).toHaveCount(0);
  await expect(summaryGrid.getByText("Current Time")).toBeVisible();

  // Close the popover with its trigger and confirm it is gone.
  await page.getByRole("button", { name: "Status Settings" }).click();
  await expect(popover).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("mobile viewport renders the node list without horizontal overflow", async ({
  page,
}) => {
  const errors = collectUnexpectedErrors(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");

  await expect(
    page.locator(".km-node-name", { hasText: "tokyo-1" }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder("Search nodes by name, region, OS..."),
  ).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  expect(errors).toEqual([]);
});
