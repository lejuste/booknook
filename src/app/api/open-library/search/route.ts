import { NextRequest, NextResponse } from "next/server";
import { searchOpenLibrary } from "@/lib/open-library";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const pageParam = request.nextUrl.searchParams.get("page");
  const limitParam = request.nextUrl.searchParams.get("limit");

  if (!q || q.trim().length === 0) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const limit = limitParam ? Math.min(20, Math.max(1, parseInt(limitParam, 10))) : 10;

  try {
    const result = await searchOpenLibrary(q.trim(), { page, limit });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Open Library search error:", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 502 }
    );
  }
}
