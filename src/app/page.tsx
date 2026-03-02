import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookCard } from "@/components/book-card";
import { NavDrawer } from "@/components/nav-drawer";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let library: Array<{
    id: string;
    title: string;
    author: string;
    coverUrl: string | null;
    totalPages: number;
    pagesRead: number;
    friendsReading: number;
    openLibraryUrl: string | null;
  }> = [];

  if (user) {
    const { data } = await supabase
      .from("library_entries")
      .select("id, title, author, cover_url, total_pages, pages_read, friends_reading, open_library_url")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    library =
      data?.map((row) => ({
        id: row.id,
        title: row.title,
        author: row.author,
        coverUrl: row.cover_url,
        totalPages: row.total_pages ?? 0,
        pagesRead: row.pages_read ?? 0,
        friendsReading: row.friends_reading ?? 0,
        openLibraryUrl: row.open_library_url,
      })) ?? [];
  }

  return (
    <main className="min-h-screen bg-stone-50/95">
      <NavDrawer title="My Library">
        {user ? (
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200"
            >
              Sign out
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800 active:bg-amber-900"
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
        ) : library.length === 0 ? ( // no books in library
          <p className="py-12 text-center text-stone-500">
            Your library is empty. Add books to get started.
          </p>
        ) : ( // books in library
          <ul className="flex flex-col gap-4" role="list">
            {library.map((book) => (
              <li key={book.id}>
                <BookCard
                  title={book.title}
                  author={book.author}
                  coverUrl={book.coverUrl ?? ""}
                  totalPages={book.totalPages}
                  pagesRead={book.pagesRead}
                  friendsReading={book.friendsReading}
                  openLibraryUrl={book.openLibraryUrl}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
