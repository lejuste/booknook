"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMarginalia } from "./actions";

type AddCommentFormProps = {
  entryId: string;
  openLibraryWorkId: string;
  pagesRead: number;
  totalPages: number;
};

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

export function AddCommentForm({
  entryId,
  openLibraryWorkId,
  pagesRead,
  totalPages,
}: AddCommentFormProps) {
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(pagesRead);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (totalPages <= 0 || pagesRead <= 0) {
    return null;
  }

  const pageOptions = Array.from({ length: pagesRead }, (_, i) => i + 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    const result = await addMarginalia(entryId, openLibraryWorkId, pageNumber, body);
    if (result.ok) {
      setStatus("success");
      setBody("");
      setPageNumber(pagesRead);
      router.refresh();
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900">
        <PencilIcon />
        Add a comment
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="add-comment-page" className="mb-1 block text-xs font-medium text-stone-600">
            Page
          </label>
          <select
            id="add-comment-page"
            value={pageNumber}
            onChange={(e) => setPageNumber(Number(e.target.value))}
            className="w-full max-w-[6rem] rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={status === "submitting"}
          >
            {pageOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="add-comment-body" className="mb-1 block text-xs font-medium text-stone-600">
            Comment
          </label>
          <textarea
            id="add-comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your thought on this page..."
            rows={3}
            maxLength={2000}
            className="w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
            disabled={status === "submitting"}
            required
          />
        </div>
        {status === "error" && (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}
        {status === "success" && (
          <p className="text-sm text-amber-800" role="status">
            Comment added.
          </p>
        )}
        <button
          type="submit"
          disabled={status === "submitting" || !body.trim()}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {status === "submitting" ? "Saving…" : "Save comment"}
        </button>
      </form>
    </div>
  );
}
