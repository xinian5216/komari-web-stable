import { expect, test } from "@playwright/test";
import { collectUnexpectedErrors, installAdminMocks } from "./fixtures";

/**
 * Regression tests for the admin server-list detail drawer.
 *
 * Root cause under test: `DrawerContent` rendered a bare `{" "}` text node as a
 * direct child of `DrawerPortal`. Radix `DialogPortal` maps every child through
 * `PortalPrimitive asChild`, so the whitespace string reached Radix `Slot`
 * alone and threw
 * "Primitive.div failed to slot onto its children. Expected a single React
 * element child or `Slottable`."
 * The whole admin page then fell into the ErrorBoundary.
 *
 * These specs drive the real component tree against a production build with
 * mocked `/admin` endpoints (see `installAdminMocks`); no backend is required.
 */

const ONLINE_UUID = "11111111-1111-4111-8111-111111111111";
const OFFLINE_UUID = "22222222-2222-4222-8222-222222222222";

test.beforeEach(async ({ page }) => {
  await installAdminMocks(page);
});

async function openAdmin(page: import("@playwright/test").Page) {
  // /admin redirects to the dashboard; the server list lives at /admin/servers.
  await page.goto("/admin/servers");
  // The node table renders once the mocked client list arrives.
  await expect(page.getByText("tokyo-1", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("frankfurt-1", { exact: true }).first(),
  ).toBeVisible();
}

async function openNodeDrawer(
  page: import("@playwright/test").Page,
  name: string,
) {
  await page.getByText(name, { exact: true }).first().click();
  const drawer = page.locator('[data-slot="drawer-content"]');
  await expect(drawer).toBeVisible();
  return drawer;
}

test("clicking a server name opens its detail drawer on the right (desktop)", async ({
  page,
}) => {
  const errors = collectUnexpectedErrors(page);
  await openAdmin(page);

  const drawer = await openNodeDrawer(page, "tokyo-1");

  // Desktop direction: the drawer is anchored to the right edge.
  await expect(drawer).toHaveAttribute("data-vaul-drawer-direction", "right");

  // Node identity and machine details come from the clicked row.
  await expect(drawer.getByText("tokyo-1", { exact: true })).toBeVisible();
  await expect(drawer.getByText("Machine details")).toBeVisible();
  await expect(page.locator("#detail-os")).toHaveText("Debian 12");
  await expect(page.locator("#detail-cpu_name")).toHaveText("AMD EPYC 9354P");
  await expect(page.locator("#detail-ipv4")).toHaveText("203.0.113.10");
  await expect(page.locator("#detail-uuid")).toHaveText(ONLINE_UUID);

  // Modal overlay is present while the drawer is open.
  await expect(page.locator('[data-slot="drawer-overlay"]')).toBeVisible();

  // The Finish button closes the drawer.
  await drawer.getByRole("button", { name: "Finish" }).click();
  await expect(drawer).toBeHidden();

  expect(errors).toEqual([]);
});

test("a second server opens its own drawer and closes with Escape", async ({
  page,
}) => {
  const errors = collectUnexpectedErrors(page);
  await openAdmin(page);

  const drawer = await openNodeDrawer(page, "frankfurt-1");

  await expect(drawer.getByText("frankfurt-1", { exact: true })).toBeVisible();
  await expect(page.locator("#detail-os")).toHaveText("Ubuntu 24.04");
  await expect(page.locator("#detail-cpu_name")).toHaveText(
    "Intel Xeon Gold 5418N",
  );
  await expect(page.locator("#detail-ipv4")).toHaveText("198.51.100.20");
  await expect(page.locator("#detail-uuid")).toHaveText(OFFLINE_UUID);

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();

  expect(errors).toEqual([]);
});

test("mobile viewport opens the drawer from the bottom", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = collectUnexpectedErrors(page);
  await openAdmin(page);

  const drawer = await openNodeDrawer(page, "tokyo-1");

  await expect(drawer).toHaveAttribute("data-vaul-drawer-direction", "bottom");
  await expect(page.locator("#detail-os")).toHaveText("Debian 12");

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();

  expect(errors).toEqual([]);
});

test("dark theme keeps the drawer usable with overlay and scroll lock", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("appearance", "dark");
  });
  const errors = collectUnexpectedErrors(page);
  await openAdmin(page);

  await expect(page.locator("html")).toHaveClass(/dark/);

  const drawer = await openNodeDrawer(page, "tokyo-1");
  await expect(drawer.getByText("tokyo-1", { exact: true })).toBeVisible();
  await expect(page.locator('[data-slot="drawer-overlay"]')).toBeVisible();

  // The modal drawer locks background scrolling while open.
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await drawer.getByRole("button", { name: "Finish" }).click();
  await expect(drawer).toBeHidden();

  expect(errors).toEqual([]);
});

test("the Slot regression never reaches the page", async ({ page }) => {
  // Guard the exact failure signature: any render of the drawer that reaches
  // Radix Slot with a non-element child throws this message.
  const errors = collectUnexpectedErrors(page);
  await openAdmin(page);
  await openNodeDrawer(page, "tokyo-1");
  await page.keyboard.press("Escape");
  await openNodeDrawer(page, "frankfurt-1");
  await page.keyboard.press("Escape");

  expect(errors.join("\n")).not.toContain("failed to slot onto its children");
  expect(errors).toEqual([]);
});
