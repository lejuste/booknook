/**
 * Seeds library_entries with books from Open Library API.
 * Requires: seed-test-users run first (for profiles), supabase running.
 *
 * Run: npm run seed:library
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const BOOKS_TO_SEED = [
  {
    workId: "OL27448W",
    editionId: "OL51711484M",
    pagesRead: 400,
    position: 0,
  },
  {
    workId: "OL29226517W",
    editionId: "OL39767438M",
    pagesRead: 250,
    position: 1,
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
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  const userA = users?.find((u) => u.email === "a@test.com");

  if (usersError || !userA) {
    console.error("User a@test.com not found. Run 'npm run seed:test-users' first.");
    process.exit(1);
  }

  const userId = userA.id;
  console.log("Seeding library for user:", userId);

  for (const book of BOOKS_TO_SEED) {
    const [workRes, editionRes] = await Promise.all([
      fetchJson<{ title: string; authors?: Array<{ author: { key: string } }> }>(
        `https://openlibrary.org/works/${book.workId}.json`
      ),
      fetchJson<{ title: string; number_of_pages?: number; pagination?: string; key: string }>(
        `https://openlibrary.org/books/${book.editionId}.json`
      ),
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
      (editionRes.pagination ? parseInt(editionRes.pagination.match(/\d+/)?.[0] ?? "0", 10) : 0);
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
        pages_read: book.pagesRead,
        friends_reading: 0,
        position: book.position,
      },
      {
        onConflict: "user_id,open_library_work_id",
      }
    );

    if (error) {
      if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
        console.log("Entry exists, updating:", editionRes.title ?? workRes.title);
      } else {
        console.error("Insert error:", error);
        process.exit(1);
      }
    } else {
      console.log("Seeded:", editionRes.title ?? workRes.title);
    }
  }

  console.log("Library seed complete.");
}

main();
