import { execSync } from "child_process";
import path from "path";

async function globalSetup() {
  const root = path.resolve(__dirname, "..");
  try {
    execSync("npm run seed:test-users", {
      cwd: root,
      stdio: "inherit",
    });
  } catch {
    console.warn("Seed script failed or test user already exists, continuing...");
  }
  try {
    execSync("npm run seed:library", {
      cwd: root,
      stdio: "inherit",
    });
  } catch {
    console.warn("Library seed failed, continuing...");
  }
}

export default globalSetup;
