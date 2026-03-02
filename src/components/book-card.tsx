"use client";

import { useState } from "react";

type BookCardProps = {
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  pagesRead?: number;
  friendsReading: number;
  openLibraryUrl?: string | null;
  status?: "reading" | "completed";
};

function BookmarkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FriendsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function BookCard({
  title,
  author,
  coverUrl,
  totalPages,
  pagesRead = 0,
  friendsReading,
  openLibraryUrl,
  status,
}: BookCardProps) {
  const [coverError, setCoverError] = useState(false);
  const progress = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0;
  const isNotStarted = pagesRead === 0;

  const Wrapper = openLibraryUrl ? "a" : "article";
  const wrapperProps = openLibraryUrl
    ? { href: openLibraryUrl, target: "_blank", rel: "noopener noreferrer", className: "flex gap-4 rounded-2xl bg-stone-100/80 p-4 shadow-sm block hover:bg-stone-100 transition-colors" }
    : { className: "flex gap-4 rounded-2xl bg-stone-100/80 p-4 shadow-sm" };

  return (
    <Wrapper {...wrapperProps}>
      <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-200 sm:h-32 sm:w-24">
        {coverError ? (
          <div className="flex h-full w-full items-center justify-center bg-stone-300 text-2xl text-stone-500">
            📖
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={coverUrl}
            alt={`${title} cover`}
            className="h-full w-full object-cover"
            onError={() => setCoverError(true)}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-stone-900 line-clamp-2">{title}</h3>
        {status && (
          <span
            className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              status === "completed"
                ? "bg-amber-100 text-amber-800"
                : "bg-stone-200 text-stone-700"
            }`}
          >
            {status === "completed" ? "Completed" : "Reading"}
          </span>
        )}
        <p className="mt-0.5 text-sm text-stone-600">{author}</p>

        <div className="mt-3">
          {isNotStarted ? (
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <BookmarkIcon />
              <span>Not started</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-stone-600">
                  Page {pagesRead} of {totalPages}
                </span>
                <span className="text-sm font-medium text-stone-700">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-amber-800/60 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-stone-600">
          <FriendsIcon />
          <span>
            {friendsReading} {friendsReading === 1 ? "friend" : "friends"} reading
          </span>
        </div>
      </div>
    </Wrapper>
  );
}
