import { expect, test } from "@playwright/test";

const USER_A = { email: "a@test.com", password: "Welcome1!" };
const USER_B = { email: "b@test.com", password: "Welcome1!" };

function getSubmitButton(page: import("@playwright/test").Page) {
  return page.locator('form button[type="submit"]');
}

test.describe("Auth", () => {
  test("a@test.com sees seeded library after login", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(USER_A.email);
    await page.getByLabel("Password").fill(USER_A.password);
    await getSubmitButton(page).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    await expect(page.getByText("The Lord of the Rings")).toBeVisible();
    await expect(page.getByText("Fourth Wing")).toBeVisible();
  });

  test("b@test.com sees empty library after login", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(USER_B.email);
    await page.getByLabel("Password").fill(USER_B.password);
    await getSubmitButton(page).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    await expect(page.getByText("Your library is empty. Add books to get started.")).toBeVisible();
  });

  test("sign out returns to unauthenticated state", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(USER_A.email);
    await page.getByLabel("Password").fill(USER_A.password);
    await getSubmitButton(page).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

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
