/**
 * Seeds the database for development and tests.
 * 1. Test users (a@test.com, b@test.com)
 * 2. Library books (current reads: LOTR, Fourth Wing)
 * 3. Past reads (Scythe, The Holy Bible) + profile demo data
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local, supabase running.
 * Run: npm run seed
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const TEST_USERS = [
  { email: "a@test.com", password: "Welcome1!" },
  { email: "b@test.com", password: "Welcome1!" },
];

const LIBRARY_BOOKS = [
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

const PAST_READ_BOOKS = [
  { workId: "OL17876096W", editionId: "OL26855942M", position: 10 },
  { workId: "OL17732W", editionId: "OL43723042M", position: 11 },
];

const USER_AGENT = "Booknook (reading app; contact: dev@booknook.app)";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`Open Library API error ${res.status}: ${url}`);
  return res.json();
}

async function seedTestUsers(supabase: ReturnType<typeof createClient>) {
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

async function seedLibraryEntry(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  book: {
    workId: string;
    editionId: string;
    pagesRead?: number;
    totalPages?: number;
    position: number;
    status?: "completed";
  }
) {
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
    book.totalPages ??
    editionRes.number_of_pages ??
    (editionRes.pagination
      ? parseInt(editionRes.pagination.match(/\d+/)?.[0] ?? "0", 10)
      : 0);
  const pagesRead = book.pagesRead ?? totalPages;
  const coverUrl = `https://covers.openlibrary.org/b/olid/${book.editionId}-M.jpg`;
  const openLibraryUrl = `https://openlibrary.org/works/${book.workId}?edition=key%3A/books/${book.editionId}`;

  const entry: Record<string, unknown> = {
    user_id: userId,
    open_library_work_id: book.workId,
    open_library_edition_id: book.editionId,
    open_library_url: openLibraryUrl,
    title: editionRes.title ?? workRes.title,
    author,
    total_pages: totalPages,
    cover_url: coverUrl,
    pages_read: pagesRead,
    friends_reading: 0,
    position: book.position,
  };
  if (book.status) entry.status = book.status;

  const { error } = await supabase.from("library_entries").upsert(entry, {
    onConflict: "user_id,open_library_work_id",
  });

  if (error) {
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return;
    }
    if (error.message?.includes("status") && error.code === "PGRST204") {
      console.error(
        "Schema error: 'status' column not found. Ensure migrations are applied.\n" +
          "  - For remote: run 'npm run supabase:db:push'\n" +
          "  - For local: run 'supabase db reset'"
      );
      process.exit(1);
    }
    throw error;
  }
  return editionRes.title ?? workRes.title;
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

  // 1. Test users
  console.log("Seeding test users...");
  await seedTestUsers(supabase);

  // 2. Get user A for library/past-reads
  const {
    data: { users },
    error: usersError,
  } = await supabase.auth.admin.listUsers();
  const userA = users?.find((u) => u.email === "a@test.com");

  if (usersError || !userA) {
    console.error("User a@test.com not found after seeding users.");
    process.exit(1);
  }

  const userId = userA.id;

  // 3. Library (current reads)
  console.log("Seeding library...");
  for (const book of LIBRARY_BOOKS) {
    const title = await seedLibraryEntry(supabase, userId, book);
    if (title) console.log("  Seeded:", title);
  }

  // 4. Profile demo data
  await supabase
    .from("profiles")
    .update({
      full_name: "Alex Morgan",
      tagline: "Avid reader & note-taker",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // 5. Past reads (completed)
  console.log("Seeding past reads...");
  for (const book of PAST_READ_BOOKS) {
    const title = await seedLibraryEntry(supabase, userId, {
      ...book,
      status: "completed",
    });
    if (title) console.log("  Seeded (completed):", title);
  }

  // 6. User B: same first book (for "friends reading" on timeline)
  const userB = users?.find((u) => u.email === "b@test.com");
  const firstWorkId = LIBRARY_BOOKS[0].workId;
  if (userB) {
    await supabase
      .from("profiles")
      .update({
        full_name: "Blake Chen",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userB.id);

    const title = await seedLibraryEntry(supabase, userB.id, {
      workId: firstWorkId,
      editionId: LIBRARY_BOOKS[0].editionId,
      pagesRead: 120,
      position: 0,
    });
    if (title) console.log("  Seeded for user B (friend):", title);

    // Update friends_reading on both users' entries for this work
    await supabase
      .from("library_entries")
      .update({ friends_reading: 1 })
      .eq("open_library_work_id", firstWorkId);
  }

  // 7. Marginalia (comments) on first book - only visible after you pass that page
  if (userB) {
    const marginaliaRows = [
      { open_library_work_id: firstWorkId, user_id: userId, page_number: 78, body: "This foreshadowing is so subtle. I love how the author plants these seeds early." },
      { open_library_work_id: firstWorkId, user_id: userB.id, page_number: 95, body: "The dialogue here really crackles." },
      { open_library_work_id: firstWorkId, user_id: userId, page_number: 134, body: "Had to re-read this paragraph three times—so dense and rewarding." },
      { open_library_work_id: firstWorkId, user_id: userB.id, page_number: 156, body: "That twist! Did not see it coming." },
    ];
    for (const row of marginaliaRows) {
      const { error } = await supabase.from("marginalia").insert(row);
      if (error) {
        // Table may not exist yet (migration not applied)
        if (error.code !== "42P01") console.warn("Marginalia seed:", error.message);
        break;
      }
    }
    console.log("  Seeded marginalia for first book.");
  }

  console.log("Seed complete.");
}

main();
