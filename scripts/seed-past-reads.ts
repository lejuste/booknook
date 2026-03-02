/**
 * Seeds library_entries with past read (completed) books from Open Library API.
 * Adds Scythe and The Holy Bible as completed books for the test user.
 *
 * Requires: seed-test-users run first, supabase running, migrations applied.
 *
 * Run: npm run seed:past-reads
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const PAST_READ_BOOKS = [
  {
    workId: "OL17876096W",
    editionId: "OL26855942M",
    position: 10,
  },
  {
    workId: "OL17732W",
    editionId: "OL43723042M",
    position: 11,
  },
];

const USER_AGENT = "Booknook (reading app; contact: dev@booknook.app)";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`Open Library API error ${res.status}: ${url}`);
  return res.json();
}

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

  const { data: { users }, error: usersError } =
    await supabase.auth.admin.listUsers();
  const userA = users?.find((u) => u.email === "a@test.com");

  if (usersError || !userA) {
    console.error(
      "User a@test.com not found. Run 'npm run seed:test-users' first."
    );
    process.exit(1);
  }

  const userId = userA.id;
  console.log("Seeding past read books for user:", userId);

  // Update profile with sample data for demo
  await supabase
    .from("profiles")
    .update({
      full_name: "Alex Morgan",
      tagline: "Avid reader & note-taker",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  for (const book of PAST_READ_BOOKS) {
    const [workRes, editionRes] = await Promise.all([
      fetchJson<{ title: string; authors?: Array<{ author: { key: string } }> }>(
        `https://openlibrary.org/works/${book.workId}.json`
      ),
      fetchJson<{
        title: string;
        number_of_pages?: number;
        pagination?: string;
        key: string;
      }>(`https://openlibrary.org/books/${book.editionId}.json`),
    ]);

    let author = "Unknown";
    if (workRes.authors?.[0]?.author?.key) {
      try {
        const authorRes = await fetchJson<{ name: string }>(
          `https://openlibrary.org${workRes.authors[0].author.key}.json`
        );
        author = authorRes.name ?? author;
      } catch {
        // keep Unknown
      }
    }

    const totalPages =
      editionRes.number_of_pages ??
      (editionRes.pagination
        ? parseInt(editionRes.pagination.match(/\d+/)?.[0] ?? "0", 10)
        : 0);
    const coverUrl = `https://covers.openlibrary.org/b/olid/${book.editionId}-M.jpg`;
    const openLibraryUrl = `https://openlibrary.org/works/${book.workId}?edition=key%3A/books/${book.editionId}`;

    const { error } = await supabase.from("library_entries").upsert(
      {
        user_id: userId,
        open_library_work_id: book.workId,
        open_library_edition_id: book.editionId,
        open_library_url: openLibraryUrl,
        title: editionRes.title ?? workRes.title,
        author,
        total_pages: totalPages,
        cover_url: coverUrl,
        pages_read: totalPages,
        friends_reading: 0,
        position: book.position,
        status: "completed",
      },
      { onConflict: "user_id,open_library_work_id" }
    );

    if (error) {
      if (
        error.message?.includes("unique") ||
        error.message?.includes("duplicate")
      ) {
        console.log(
          "Entry exists, updating:",
          editionRes.title ?? workRes.title
        );
      } else if (error.message?.includes("status") && error.code === "PGRST204") {
        console.error(
          "Schema error: 'status' column not found. Ensure migrations are applied to the DB you're seeding.\n" +
            "  - For remote: run 'npm run supabase:db:push'\n" +
            "  - For local: run 'supabase db reset' (or ensure migrations are applied)"
        );
        process.exit(1);
      } else {
        console.error("Insert error:", error);
        process.exit(1);
      }
    } else {
      console.log("Seeded (completed):", editionRes.title ?? workRes.title);
    }
  }

  console.log("Past reads seed complete.");
}

main();
