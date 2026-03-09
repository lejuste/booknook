import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { BookTimeline } from "./book-timeline";
import { AddCommentForm } from "./add-comment-form";
import { PageProgressSlider } from "./page-progress-slider";

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: entry, error: entryError } = await supabase
    .from("library_entries")
    .select("id, title, author, total_pages, pages_read, open_library_work_id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (entryError || !entry) {
    notFound();
  }

  const workId = entry.open_library_work_id;
  const pagesRead = entry.pages_read ?? 0;

  // Marginalia for this book: only comments on pages the user has passed (spoiler-safe)
  const { data: marginaliaRows } = await supabase
    .from("marginalia")
    .select(`
      id,
      page_number,
      body,
      created_at,
      user_id,
      profiles:user_id ( full_name, avatar_url )
    `)
    .eq("open_library_work_id", workId)
    .lte("page_number", pagesRead)
    .order("page_number", { ascending: true })
    .order("created_at", { ascending: true });

  type MarginaliaRow = {
    id: string;
    page_number: number;
    body: string;
    created_at: string;
    user_id: string;
    profiles: { full_name: string | null; avatar_url: string | null } | { full_name: string | null; avatar_url: string | null }[] | null;
  };

  const getProfile = (row: MarginaliaRow) => {
    const p = row.profiles;
    return Array.isArray(p) ? p[0] : p;
  };

  const marginalia = (marginaliaRows ?? []).map((row: MarginaliaRow) => {
    const profile = getProfile(row);
    return {
      id: row.id,
      pageNumber: row.page_number,
      body: row.body,
      createdAt: row.created_at,
      authorName: profile?.full_name ?? "Anonymous",
      authorAvatarUrl: profile?.avatar_url ?? null,
    };
  });

  // Other readers on the same book (for timeline avatars)
  const { data: otherEntries } = await supabase
    .from("library_entries")
    .select(`
      user_id,
      pages_read,
      profiles:user_id ( full_name, avatar_url )
    `)
    .eq("open_library_work_id", workId)
    .neq("user_id", user.id);

  type EntryRow = {
    user_id: string;
    pages_read: number;
    profiles: { full_name: string | null; avatar_url: string | null } | { full_name: string | null; avatar_url: string | null }[] | null;
  };

  const getEntryProfile = (row: EntryRow) => {
    const p = row.profiles;
    return Array.isArray(p) ? p[0] : p;
  };

  const friendsProgress =
    (otherEntries ?? []).map((row: EntryRow) => {
      const profile = getEntryProfile(row);
      return {
        userId: row.user_id,
        pagesRead: row.pages_read ?? 0,
        displayName: profile?.full_name ?? "Friend",
        avatarUrl: profile?.avatar_url ?? null,
      };
    }).filter((f) => f.pagesRead > 0);

  const friendsCount = friendsProgress.length;

  return (
    <main className="min-h-screen bg-stone-50/95">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-stone-50/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto max-w-xl">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
            >
              <BackIcon />
              Back to Library
            </Link>
            <hr className="my-3 border-stone-200" />
            <h1 className="text-xl font-bold text-stone-900">
              {entry.title}
            </h1>
            <p className="text-stone-600">by {entry.author}</p>
            {friendsCount > 0 && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-600">
                <span className="flex -space-x-2">
                  {friendsProgress.slice(0, 5).map((friend) => (
                    <span
                      key={friend.userId}
                      className="inline-flex h-6 w-6 shrink-0 overflow-hidden rounded-full bg-stone-200 ring-2 ring-stone-50/95"
                      title={friend.displayName}
                    >
                      {friend.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={friend.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-stone-500">
                          {friend.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                  ))}
                </span>
                {friendsCount} {friendsCount === 1 ? "friend" : "friends"} reading
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {(entry.total_pages ?? 0) > 0 && (
          <div className="mb-6">
            <PageProgressSlider
              entryId={entry.id}
              pagesRead={pagesRead}
              totalPages={entry.total_pages ?? 0}
            />
          </div>
        )}
        <div className="mb-6">
          <AddCommentForm
            entryId={entry.id}
            openLibraryWorkId={workId ?? ""}
            pagesRead={pagesRead}
            totalPages={entry.total_pages ?? 0}
          />
        </div>
        <BookTimeline
          totalPages={entry.total_pages ?? 0}
          pagesRead={pagesRead}
          marginalia={marginalia}
          friendsProgress={friendsProgress}
        />
      </div>
    </main>
  );
}
