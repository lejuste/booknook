import Link from "next/link";

export default function BookNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-scheme-bg-muted/95 px-4">
      <h1 className="text-xl font-bold text-stone-900">Book not found</h1>
      <p className="text-stone-600">This book may have been removed or you don’t have access to it.</p>
      <Link
        href="/"
        className="rounded-xl bg-scheme-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-scheme-primary-hover"
      >
        Back to Library
      </Link>
    </main>
  );
}
