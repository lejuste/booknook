import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CurrentBook } from "@/components/current-book";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <h1 className="text-xl font-bold text-stone-900">Booknook</h1>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-600 sm:inline">
              {user.email}
            </span>
            <form action="/auth/signout" method="POST">
              <SignOutButton />
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Sign in
          </Link>
        )}
      </header>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-semibold text-stone-800 sm:text-3xl">
          Your current read
        </h2>
        <div className="flex justify-center">
          <CurrentBook />
        </div>
      </div>
    </main>
  );
}

function SignOutButton() {
  return (
    <button
      type="submit"
      className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
    >
      Sign out
    </button>
  );
}
