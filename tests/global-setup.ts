import { execSync } from "child_process";
import path from "path";

async function globalSetup() {
  const root = path.resolve(__dirname, "..");
  try {
    execSync("npm run seed", {
      cwd: root,
      stdio: "inherit",
    });
  } catch {
    console.warn("Seed script failed (test user/data may already exist), continuing...");
  }
}

export default globalSetup;
