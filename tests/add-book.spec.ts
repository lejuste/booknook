import { expect, test } from "@playwright/test";

const USER_A = { email: "a@test.com", password: "Welcome1!" };

function getSubmitButton(page: import("@playwright/test").Page) {
  return page.locator('form button[type="submit"]');
}

test.describe("Add Book", () => {
  test("user a can search for sarah j maas and add a book to the library", async ({
    page,
  }) => {
    // Login as user a
    await page.goto("/login");
    await page.getByLabel("Email").fill(USER_A.email);
    await page.getByLabel("Password").fill(USER_A.password);
    await getSubmitButton(page).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

    // Click Add Book
    await page.getByRole("button", { name: "Add Book" }).click();

    // Search for sarah j maas (author Sarah J. Maas)
    await page
      .getByPlaceholder("Search by title, author...")
      .fill("sarah j maas");
    await page.getByRole("button", { name: "Search" }).click();

    // Wait for search results
    const firstBookButton = page.locator('ul[role="list"] button').first();
    await expect(firstBookButton).toBeVisible({ timeout: 10_000 });

    // Capture the title of the first result to assert it appears later
    const firstBookTitle = (await firstBookButton.locator("span.font-medium").first().textContent())?.trim();
    expect(firstBookTitle).toBeTruthy();

    // Select the first book
    await firstBookButton.click();

    // Fill current page and add to library
    await page.getByLabel("What page are you on?").fill("1");
    await page.getByRole("button", { name: "Add to library" }).click();

    // Wait for modal to close (Add to library becomes not visible) and book to appear
    await expect(page.getByRole("button", { name: "Add to library" })).not.toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(firstBookTitle!, { exact: false })).toBeVisible({
      timeout: 5_000,
    });
  });
});
