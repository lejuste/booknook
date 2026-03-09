"use client";

import { useState, useCallback } from "react";
import { addBookToLibrary } from "@/app/actions/library";
import { getCoverUrlFromId } from "@/lib/open-library";
import type { OLSearchDoc } from "@/lib/open-library";

const PAGE_SIZE = 10;

type SearchResult = {
  key: string;
  title: string;
  author: string;
  coverUrl: string;
  coverId?: number;
  workKey: string;
  editionKey: string;
  totalPages: number;
};

function parseSearchDoc(doc: OLSearchDoc): SearchResult | null {
  const workKey = doc.key?.startsWith("/works/") ? doc.key : `/works/${doc.key}`;
  const edition = doc.editions?.docs?.[0];
  const editionKey = edition?.key ?? "";

  if (!editionKey) return null;

  const editionId = editionKey.replace(/^\/books\//, "").replace(/\.json$/, "");
  const coverUrl = doc.cover_i
    ? getCoverUrlFromId(doc.cover_i)
    : `https://covers.openlibrary.org/b/olid/${editionId}-M.jpg`;
  const totalPages = edition?.number_of_pages ?? 0;

  return {
    key: doc.key,
    title: doc.title ?? "Unknown",
    author: Array.isArray(doc.author_name) ? doc.author_name.join(", ") : "Unknown",
    coverUrl,
    coverId: doc.cover_i,
    workKey,
    editionKey,
    totalPages,
  };
}

type AddBookModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<SearchResult | null>(null);
  const [pageInput, setPageInput] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const runSearch = useCallback(async (q: string, p: number = 1) => {
    if (!q.trim()) {
      setResults([]);
      setTotalFound(0);
      return;
    }
    setLoading(true);
    setAddError(null);
    try {
      const params = new URLSearchParams({ q: q.trim(), page: String(p), limit: String(PAGE_SIZE) });
      const res = await fetch(`/api/open-library/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const parsed = (data.docs ?? [])
        .map((d: OLSearchDoc) => parseSearchDoc(d))
        .filter((r: SearchResult | null): r is SearchResult => r != null);
      setResults(parsed);
      setTotalFound(data.numFound ?? 0);
      setPage(p);
    } catch {
      setResults([]);
      setTotalFound(0);
      setAddError("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const maxPage = Math.ceil(totalFound / PAGE_SIZE);
    if (newPage > maxPage) return;
    runSearch(query, newPage);
  };

  const handleSelectBook = (book: SearchResult) => {
    setSelectedBook(book);
    setPageInput(book.totalPages > 0 ? "1" : "0");
    setAddError(null);
  };

  const handleBack = () => {
    setSelectedBook(null);
    setPageInput("");
    setAddError(null);
  };

  const handleAdd = async () => {
    if (!selectedBook) return;
    const pageNum = parseInt(pageInput, 10);
    if (isNaN(pageNum) || pageNum < 0) {
      setAddError("Please enter a valid page number.");
      return;
    }
    setAdding(true);
    setAddError(null);
    const result = await addBookToLibrary(selectedBook.workKey, selectedBook.editionKey, pageNum);
    setAdding(false);
    if (result.success) {
      onClose();
    } else {
      setAddError(result.error);
    }
  };

  const handleClose = () => {
    onClose();
    setQuery("");
    setResults([]);
    setTotalFound(0);
    setPage(1);
    setSelectedBook(null);
    setPageInput("");
    setAddError(null);
  };

  if (!isOpen) return null;

  const maxPage = Math.ceil(totalFound / PAGE_SIZE);
  const hasPrev = page > 1;
  const hasNext = page < maxPage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-book-title"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-scheme-bg/50 shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-scheme-border/50 px-4 py-3">
          <h2 id="add-book-title" className="text-lg font-semibold text-stone-900">
            {selectedBook ? "Add book" : "Search for a book"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {selectedBook ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedBook.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-stone-900">{selectedBook.title}</h3>
                  <p className="text-sm text-stone-600">{selectedBook.author}</p>
                  {selectedBook.totalPages > 0 && (
                    <p className="mt-1 text-sm text-stone-500">
                      {selectedBook.totalPages} pages
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="page-input" className="block text-sm font-medium text-stone-700">
                  What page are you on?
                </label>
                <input
                  id="page-input"
                  type="number"
                  min={0}
                  max={selectedBook.totalPages || 99999}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-scheme-primary focus:outline-none focus:ring-1 focus:ring-scheme-primary"
                  placeholder="e.g. 42"
                />
              </div>
              {addError && (
                <p className="text-sm text-red-600" role="alert">
                  {addError}
                </p>
              )}
            </div>
          ) : (
            <>
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, author..."
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-scheme-primary focus:outline-none focus:ring-1 focus:ring-scheme-primary"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-scheme-primary px-4 py-2 text-sm font-medium text-white hover:bg-scheme-primary-hover disabled:opacity-60"
                  >
                    {loading ? "Searching…" : "Search"}
                  </button>
                </div>
              </form>
              {addError && (
                <p className="mb-3 text-sm text-red-600" role="alert">
                  {addError}
                </p>
              )}
              {loading ? (
                <p className="py-8 text-center text-stone-500">Loading…</p>
              ) : results.length === 0 ? (
                query.trim() ? (
                  <p className="py-8 text-center text-stone-500">No books found.</p>
                ) : (
                  <p className="py-8 text-center text-stone-500">
                    Enter a title or author to search Open Library.
                  </p>
                )
              ) : (
                <ul className="space-y-2" role="list">
                  {results.map((book) => (
                    <li key={`${book.workKey}-${book.editionKey}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectBook(book)}
                        className="flex w-full gap-3 rounded-lg border border-scheme-border/50 bg-white p-3 text-left hover:border-scheme-border hover:bg-scheme-bg/70"
                      >
                        <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-stone-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={book.coverUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-stone-900 line-clamp-2">
                            {book.title}
                          </span>
                          <span className="text-sm text-stone-600">{book.author}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!loading && results.length > 0 && totalFound > PAGE_SIZE && (
                <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                  <span className="text-sm text-stone-600">
                    Page {page} of {maxPage} ({totalFound} results)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!hasPrev}
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!hasNext}
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-scheme-border/50 px-4 py-3">
          {selectedBook ? (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding}
                className="rounded-lg bg-scheme-primary px-4 py-2 text-sm font-medium text-white hover:bg-scheme-primary-hover disabled:opacity-60"
              >
                {adding ? "Adding…" : "Add to library"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
