import { expect, test } from "@playwright/test";

const TEST_USER = {
  email: "a@test.com",
  password: "Welcome1!",
};

function getSubmitButton(page: import("@playwright/test").Page) {
  return page.locator('form button[type="submit"]');
}

test.describe("Auth", () => {
  test("login with seeded user redirects to home and shows user email", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await getSubmitButton(page).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(page.getByText(/Signed in as/)).toBeVisible();
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
  });

  test("sign out returns to unauthenticated state", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await getSubmitButton(page).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(page.getByText(/Signed in as/)).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("nonexistent@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await getSubmitButton(page).click();

    await expect(page.getByText(/Invalid login credentials|Invalid/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page).toHaveURL("/login");
  });
});
