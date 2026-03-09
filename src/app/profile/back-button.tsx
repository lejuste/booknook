"use client";

import { useRouter } from "next/navigation";

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm text-scheme-primary-hover hover:text-stone-900"
    >
      <BackIcon />
      Back
    </button>
  );
}
