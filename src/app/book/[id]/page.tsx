import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { BookTimeline } from "./book-timeline";

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" />
      <path d="M12 22v-2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
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
        <div className="mx-auto flex max-w-xl items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
            >
              <BackIcon />
              Back to Library
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                <BookIcon />
                {entry.status === "completed" ? "COMPLETED" : "CURRENTLY READING"}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-stone-900">
              {entry.title}
            </h1>
            <p className="text-stone-600">by {entry.author}</p>
            {friendsCount > 0 && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-600">
                <PeopleIcon />
                {friendsCount} {friendsCount === 1 ? "friend" : "friends"} reading
              </p>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
            aria-label="Settings"
          >
            <CogIcon />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
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
