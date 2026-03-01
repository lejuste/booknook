"use client";

import { useState } from "react";

const DEFAULT_BOOK = {
  title: "Fourth Wing",
  author: "Rebecca Yarros",
  totalPages: 498,
  coverUrl: "https://covers.openlibrary.org/b/isbn/9781649374042-L.jpg",
};

export function CurrentBook() {
  const [page, setPage] = useState(1);
  const [coverError, setCoverError] = useState(false);
  const book = DEFAULT_BOOK;

  return (
    <div className="w-full max-w-md rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-stone-100 p-6 shadow-lg shadow-amber-900/5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber-800/80">
        Currently Reading
      </h2>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="flex-shrink-0">
          <div className="h-56 w-36 overflow-hidden rounded-lg shadow-md ring-1 ring-amber-200/50 sm:h-64 sm:w-40">
            {coverError ? (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-200 to-amber-300 text-4xl text-amber-800/60">
                📖
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={book.coverUrl}
                alt={`${book.title} cover`}
                className="h-full w-full object-cover"
                onError={() => setCoverError(true)}
              />
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-xl font-bold text-stone-900">{book.title}</h3>
            <p className="text-stone-600">{book.author}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="page-slider"
                className="text-sm font-medium text-stone-700"
              >
                Page {page} of {book.totalPages}
              </label>
              <span className="rounded-md bg-amber-100 px-2 py-1 text-sm font-medium text-amber-800">
                {Math.round((page / book.totalPages) * 100)}%
              </span>
            </div>
            <input
              id="page-slider"
              type="range"
              min={1}
              max={book.totalPages}
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-amber-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
