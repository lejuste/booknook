"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { fetchBookMetadata } from "@/lib/open-library";

export type AddBookResult = { success: true } | { success: false; error: string };

export async function addBookToLibrary(
  workId: string,
  editionId: string,
  pagesRead: number
): Promise<AddBookResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to add books." };
  }

  const workIdClean = workId.replace(/^\/works\//, "");
  const editionIdClean = editionId.replace(/^\/books\//, "").replace(/\.json$/, "");

  try {
    const metadata = await fetchBookMetadata(workIdClean, editionIdClean);
    const pagesReadClamped = Math.max(0, Math.min(pagesRead, metadata.totalPages || 99999));

    const { data: maxPos } = await supabase
      .from("library_entries")
      .select("position")
      .eq("user_id", user.id)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const nextPosition = (maxPos?.position ?? -1) + 1;

    const { error } = await supabase.from("library_entries").insert({
      user_id: user.id,
      open_library_work_id: workIdClean,
      open_library_edition_id: editionIdClean,
      open_library_url: metadata.openLibraryUrl,
      title: metadata.title,
      author: metadata.author,
      total_pages: metadata.totalPages,
      cover_url: metadata.coverUrl,
      pages_read: pagesReadClamped,
      friends_reading: 0,
      position: nextPosition,
      status: "reading",
    });

    if (error) {
      if (error.code === "23505" || error.message?.includes("unique")) {
        return { success: false, error: "This book is already in your library." };
      }
      console.error("Add book error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Add book error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add book.",
    };
  }
}
