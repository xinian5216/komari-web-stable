import { expect, test } from "@playwright/test";
import { collectUnexpectedErrors, installMocks } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await installMocks(page);
});

test("login dialog opens with username and password fields and closes on Escape", async ({
  page,
}) => {
  const errors = collectUnexpectedErrors(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Login", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText("Log in to the Komari control panel."),
  ).toBeVisible();
  await expect(dialog.locator("input[name='username']")).toBeVisible();
  await expect(dialog.locator("input[name='password']")).toBeVisible();

  // The submit button stays disabled until the controlled form is valid.
  const submit = dialog.getByRole("button", { name: "Login", exact: true });
  await expect(submit).toBeDisabled();
  await dialog.locator("input[name='username']").fill("smoke-user");
  await dialog.locator("input[name='password']").fill("smoke-pass");
  await expect(submit).toBeEnabled();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  expect(errors).toEqual([]);
});

test("theme dropdown switches appearance to dark and back to light", async ({
  page,
}) => {
  const errors = collectUnexpectedErrors(page);
  await page.goto("/");

  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Appearance" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();
  await expect(html).toHaveClass(/dark/);
  expect(
    await page.evaluate(() => localStorage.getItem("appearance")),
  ).toBe("dark");

  await page.getByRole("button", { name: "Appearance" }).click();
  await page.getByRole("menuitem", { name: "Light" }).click();
  await expect(html).not.toHaveClass(/dark/);

  expect(errors).toEqual([]);
});

test("language dropdown switches the UI to Chinese", async ({ page }) => {
  const errors = collectUnexpectedErrors(page);
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Login", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Language" }).click();
  await page.getByRole("menuitem", { name: "简体中文 (zh)" }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("button", { name: "登录" })).toBeVisible();
  await expect(
    page.getByPlaceholder("搜索节点名称、地区、系统..."),
  ).toBeVisible();

  expect(errors).toEqual([]);
});
