"use client";

import Link from "next/link";
import { useState } from "react";

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

type NavDrawerProps = {
  title: string;
  children: React.ReactNode;
};

export function NavDrawer({ title, children }: NavDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-stone-200/80 bg-stone-50/95 px-4 py-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex -m-2 w-10 justify-start p-2 text-stone-800 hover:text-stone-600 touch-manipulation"
          aria-label="Open menu"
        >
          <HamburgerIcon />
        </button>
        <h1 className="text-center text-lg font-bold text-stone-900">{title}</h1>
        <div className="flex justify-end">{children}</div>
      </header>

      {/* Backdrop */}
      <div
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-stone-900/20 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        aria-label="Navigation menu"
        aria-hidden={!open}
        className={`fixed left-0 top-0 z-50 h-full w-72 max-w-[85vw] border-r border-stone-200 bg-stone-50 shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
          <span className="font-semibold text-stone-900">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-stone-700 hover:bg-stone-200/80"
          >
            <BookIcon />
            <span>My Library</span>
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-stone-700 hover:bg-stone-200/80"
          >
            <UserIcon />
            <span>Profile</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
