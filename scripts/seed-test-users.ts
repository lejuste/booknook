/**
 * Seeds test users for integration tests using the Supabase Admin API.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (never use in client code).
 *
 * Run: npm run seed:test-users
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const TEST_USERS = [
  { email: "a@test.com", password: "Welcome1!" },
  { email: "b@test.com", password: "Welcome1!" },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const user of TEST_USERS) {
    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (
        msg.includes("already") ||
        msg.includes("already been registered") ||
        msg.includes("already exists")
      ) {
        console.log(`Test user ${user.email} already exists, skipping.`);
        continue;
      }
      console.error(`Failed to create test user ${user.email}:`, error.message);
      process.exit(1);
    }

    console.log(`Created test user: ${user.email}`);
  }
}

main();
