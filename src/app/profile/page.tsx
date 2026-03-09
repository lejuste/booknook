import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NavDrawer } from "@/components/nav-drawer";
import { BookCard } from "@/components/book-card";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, tagline")
    .eq("id", user.id)
    .single();

  const { data: libraryEntries } = await supabase
    .from("library_entries")
    .select("id, title, author, cover_url, total_pages, pages_read, friends_reading, open_library_url, status")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const booksRead = libraryEntries?.filter((e) => e.status === "completed").length ?? 0;
  const entries = libraryEntries ?? [];
  const recentInProgress = entries.filter((e) => e.status !== "completed").slice(0, 6);
  const recentCompleted = entries.filter((e) => e.status === "completed").slice(0, 6);

  return (
    <main className="min-h-screen bg-stone-50/95">
      <NavDrawer title="Profile">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200"
          >
            Sign out
          </button>
        </form>
      </NavDrawer>

      <div className="mx-auto max-w-xl px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Profile section */}
        <section className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-stone-200">
              {profile?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-stone-400">
                  👤
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-stone-900">
                {profile?.full_name ?? "Reader"}
              </h2>
              <p className="mt-0.5 text-sm text-stone-600">
                {profile?.tagline ?? "Avid reader & note-taker"}
              </p>
              <Link
                href="/profile/edit"
                className="mt-3 inline-block rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-900 active:bg-amber-950"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </section>

        {/* Reading stats */}
        <section className="mb-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-600">
            Reading Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon="📖" label="Books Read" value={String(booksRead)} />
            <StatCard icon="📅" label="Days Streak" value="0" />
          </div>
        </section>

        {/* Reading activity */}
        <section className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
            <span>Reading Activity</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </h3>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-800">This Week</span>
              <span className="text-stone-600">0 hours</span>
            </div>
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-amber-600 transition-all"
                  style={{ width: "0%" }}
                />
              </div>
              <p className="mt-1 text-xs text-stone-500">0% of 7 hour goal</p>
            </div>
          </div>
        </section>

        {/* Recent books */}
        <section className="flex flex-col gap-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            Recent Books
          </h3>
          {recentInProgress.length === 0 && recentCompleted.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-stone-500 shadow-sm">
              No books yet. Add books to your library to see them here.
            </div>
          ) : (
            <>
              {recentInProgress.length > 0 && (
                <div>
                  <h4 className="mb-4 text-xs font-medium uppercase tracking-wider text-stone-500">
                    In Progress
                  </h4>
                  <ul className="flex flex-col gap-4" role="list">
                    {recentInProgress.map((book) => (
                      <li key={book.id}>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <BookCard
                            id={book.id}
                            title={book.title}
                            author={book.author}
                            coverUrl={book.cover_url ?? ""}
                            totalPages={book.total_pages ?? 0}
                            pagesRead={book.pages_read ?? 0}
                            friendsReading={book.friends_reading ?? 0}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recentCompleted.length > 0 && (
                <div>
                  <h4 className="mb-4 text-xs font-medium uppercase tracking-wider text-stone-500">
                    Completed
                  </h4>
                  <ul className="flex flex-col gap-4" role="list">
                    {recentCompleted.map((book) => (
                      <li key={book.id}>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <BookCard
                            id={book.id}
                            title={book.title}
                            author={book.author}
                            coverUrl={book.cover_url ?? ""}
                            totalPages={book.total_pages ?? 0}
                            pagesRead={book.pages_read ?? 0}
                            friendsReading={book.friends_reading ?? 0}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-stone-600">
        <span className="text-lg" aria-hidden>
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-bold text-stone-900">{value}</span>
    </div>
  );
}
