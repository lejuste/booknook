"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePagesRead } from "./actions";

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-amber-700" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

type PageProgressSliderProps = {
  entryId: string;
  pagesRead: number;
  totalPages: number;
};

export function PageProgressSlider({
  entryId,
  pagesRead: initialPagesRead,
  totalPages,
}: PageProgressSliderProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialPagesRead);
  const [isSaving, setIsSaving] = useState(false);
  const lastSaved = useRef(initialPagesRead);

  useEffect(() => {
    setValue(initialPagesRead);
    lastSaved.current = initialPagesRead;
  }, [initialPagesRead]);

  const progress = totalPages > 0 ? Math.round((value / totalPages) * 100) : 0;
  const min = 0;
  const max = Math.max(0, totalPages);

  async function handleChangeEnd() {
    const toSave = Math.round(Number(value));
    if (toSave === lastSaved.current || isSaving) return;
    lastSaved.current = toSave;
    setIsSaving(true);
    const result = await updatePagesRead(entryId, toSave);
    setIsSaving(false);
    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl bg-stone-100/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-stone-800">
          <CheckIcon />
          You&apos;re on page {value}
        </span>
        {isSaving && (
          <span className="text-xs text-stone-500">Saving…</span>
        )}
      </div>

      <div className="mt-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onMouseUp={handleChangeEnd}
          onTouchEnd={handleChangeEnd}
          disabled={max <= 0}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-amber-800 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-amber-800"
          aria-label="Current page"
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-xs text-stone-600">
        <span>{progress}% complete</span>
        <span>{totalPages} pages</span>
      </div>

      {/* Visual progress bar */}
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-amber-800/60 transition-all duration-150"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
