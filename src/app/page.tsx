import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookCard } from "@/components/book-card";
import { NavDrawer } from "@/components/nav-drawer";
import { AddBookButton } from "@/components/add-book-button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  // Load session from cookies so RLS has auth.uid() for the library query
  await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();

  type LibraryEntry = {
    id: string;
    title: string;
    author: string;
    coverUrl: string | null;
    totalPages: number;
    pagesRead: number;
    friendsReading: number;
    openLibraryUrl: string | null;
    status: "reading" | "completed";
  };

  let inProgress: LibraryEntry[] = [];
  let profile: { avatar_url: string | null; full_name: string | null } | null = null;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("id", user.id)
      .single();
    profile = profileData ?? null;

    const { data, error } = await supabase
      .from("library_entries")
      .select("id, title, author, cover_url, total_pages, pages_read, friends_reading, open_library_url, status")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (error) {
      console.error("[Library] Failed to load library_entries:", error.message, error.code);
    }

    const entries: LibraryEntry[] =
      data?.map((row) => ({
        id: row.id,
        title: row.title,
        author: row.author,
        coverUrl: row.cover_url,
        totalPages: row.total_pages ?? 0,
        pagesRead: row.pages_read ?? 0,
        friendsReading: row.friends_reading ?? 0,
        openLibraryUrl: row.open_library_url,
        status: (row.status as "reading" | "completed") ?? "reading",
      })) ?? [];

    inProgress = entries.filter((e) => e.status !== "completed");
  }

  return (
    <main className="min-h-screen bg-scheme-bg-muted/95">
      <NavDrawer title="My Library">
        {user ? (
          <Link
            href="/profile"
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-scheme-border/60 ring-1 ring-scheme-border/80 hover:ring-scheme-border"
            title="Profile"
            aria-label="Go to profile"
          >
            {profile?.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-scheme-primary" aria-hidden>
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-scheme-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-scheme-primary-hover active:bg-scheme-primary-hover/90"
          >
            Sign in
          </Link>
        )}
      </NavDrawer>

      <div className="mx-auto max-w-xl px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {!user ? ( // not logged in
          <p className="py-12 text-center text-stone-500">
            Sign in to view your library.
          </p>
        ) : inProgress.length === 0 ? ( // no books in library
          <div className="py-12 text-center">
            <p className="mb-4 text-stone-500">
              Your library is empty. Add books to get started.
            </p>
            <p className="mb-4 text-xs text-stone-400">
              Using seeded data? Sign in as a@test.com (password: Welcome1!) to see the demo library.
            </p>
            <AddBookButton />
          </div>
        ) : ( // books in library
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <AddBookButton />
            </div>
            <ul className="flex flex-col gap-4" role="list">
              {inProgress.map((book) => (
                <li key={book.id}>
                  <BookCard
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    coverUrl={book.coverUrl ?? ""}
                    totalPages={book.totalPages}
                    pagesRead={book.pagesRead}
                    friendsReading={book.friendsReading}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
