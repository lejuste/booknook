"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AddMarginaliaResult = { ok: true } | { ok: false; error: string };

export async function addMarginalia(
  entryId: string,
  openLibraryWorkId: string,
  pageNumber: number,
  body: string
): Promise<AddMarginaliaResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to add a comment." };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Comment cannot be empty." };
  }
  if (pageNumber < 1) {
    return { ok: false, error: "Invalid page number." };
  }

  const { data: entry, error: entryError } = await supabase
    .from("library_entries")
    .select("id, pages_read, open_library_work_id")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .single();

  if (entryError || !entry) {
    return { ok: false, error: "Book not found." };
  }
  if (entry.open_library_work_id !== openLibraryWorkId) {
    return { ok: false, error: "Book does not match." };
  }

  const pagesRead = entry.pages_read ?? 0;
  if (pageNumber > pagesRead) {
    return {
      ok: false,
      error: `You can only add comments on pages you've read (up to page ${pagesRead}).`,
    };
  }

  const { error: insertError } = await supabase.from("marginalia").insert({
    open_library_work_id: openLibraryWorkId,
    user_id: user.id,
    page_number: pageNumber,
    body: trimmed,
  });

  if (insertError) {
    console.error("[addMarginalia]", insertError.message);
    return { ok: false, error: "Failed to save comment. Please try again." };
  }

  revalidatePath(`/book/${entryId}`);
  return { ok: true };
}

export type UpdatePagesReadResult = { ok: true } | { ok: false; error: string };

export async function updatePagesRead(
  entryId: string,
  pagesRead: number
): Promise<UpdatePagesReadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to update progress." };
  }

  if (pagesRead < 0 || !Number.isInteger(pagesRead)) {
    return { ok: false, error: "Invalid page number." };
  }

  const { data: entry, error: entryError } = await supabase
    .from("library_entries")
    .select("id, total_pages")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .single();

  if (entryError || !entry) {
    return { ok: false, error: "Book not found." };
  }

  const totalPages = entry.total_pages ?? 0;
  const clamped = Math.max(0, Math.min(pagesRead, totalPages || 99999));
  const status = totalPages > 0 && clamped >= totalPages ? "completed" : "reading";

  const { error: updateError } = await supabase
    .from("library_entries")
    .update({ pages_read: clamped, status })
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[updatePagesRead]", updateError.message);
    return { ok: false, error: "Failed to update progress. Please try again." };
  }

  revalidatePath(`/book/${entryId}`);
  revalidatePath("/");
  return { ok: true };
}
