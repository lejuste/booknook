/**
 * Open Library API helpers
 * @see https://openlibrary.org/developers/api
 */

const OL_BASE = "https://openlibrary.org";
const COVERS_BASE = "https://covers.openlibrary.org";

/** User-Agent per Open Library usage guidelines */
const USER_AGENT = "Booknook (reading app)";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Open Library API error: ${res.status}`);
  return res.json();
}

export interface OLWork {
  key: string;
  title: string;
  authors?: Array<{ author: { key: string } }>;
}

export interface OLEdition {
  key: string;
  title: string;
  number_of_pages?: number;
  pagination?: string;
  covers?: number[];
}

export interface OLAuthor {
  name: string;
}

/** Get cover URL for an edition (olid) or cover ID */
export function getCoverUrl(editionId: string, size: "S" | "M" | "L" = "M"): string {
  const olid = editionId.startsWith("OL") ? editionId : `OL${editionId}M`;
  return `${COVERS_BASE}/b/olid/${olid}-${size}.jpg`;
}

/** Fetch work by ID (e.g. OL27448W) */
export async function fetchWork(workId: string): Promise<OLWork> {
  const key = workId.startsWith("/works/") ? workId : `/works/${workId}`;
  return fetchJson<OLWork>(`${OL_BASE}${key}.json`);
}

/** Fetch edition by ID (e.g. OL51711484M) */
export async function fetchEdition(editionId: string): Promise<OLEdition> {
  const key = editionId.startsWith("/books/") ? editionId : `/books/${editionId}.json`;
  const url = key.endsWith(".json") ? `${OL_BASE}${key}` : `${OL_BASE}${key}.json`;
  return fetchJson<OLEdition>(url);
}

/** Fetch author by ID (e.g. OL26320A) */
export async function fetchAuthor(authorId: string): Promise<OLAuthor> {
  const key = authorId.startsWith("/authors/") ? authorId : `/authors/${authorId}`;
  return fetchJson<OLAuthor>(`${OL_BASE}${key}.json`);
}

/** Search result from Open Library Search API */
export interface OLSearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  edition_count?: number;
  first_publish_year?: number;
  editions?: {
    numFound: number;
    docs: Array<{ key: string; number_of_pages?: number }>;
  };
}

export interface OLSearchResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OLSearchDoc[];
}

/**
 * Search Open Library for books.
 * @see https://openlibrary.org/dev/docs/api/search
 */
export async function searchOpenLibrary(
  query: string,
  options?: { page?: number; limit?: number }
): Promise<OLSearchResponse> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(limit),
    fields: "key,title,author_name,cover_i,editions,editions.key,editions.number_of_pages",
  });
  const url = `${OL_BASE}/search.json?${params}`;
  return fetchJson<OLSearchResponse>(url);
}

/** Get cover URL from cover ID (from search) or olid */
export function getCoverUrlFromId(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `${COVERS_BASE}/b/id/${coverId}-${size}.jpg`;
}

/** Parse page count from pagination string like "1137p." or "512" */
function parsePageCount(edition: OLEdition): number {
  if (edition.number_of_pages) return edition.number_of_pages;
  if (edition.pagination) {
    const m = edition.pagination.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }
  return 0;
}

export interface BookMetadata {
  title: string;
  author: string;
  totalPages: number;
  coverUrl: string;
  workId: string;
  editionId: string;
  openLibraryUrl: string;
}

/** Fetch full book metadata from Open Library */
export async function fetchBookMetadata(
  workId: string,
  editionId: string
): Promise<BookMetadata> {
  const [work, edition] = await Promise.all([
    fetchWork(workId),
    fetchEdition(editionId),
  ]);

  let author = "Unknown";
  if (work.authors?.[0]?.author?.key) {
    try {
      const authorData = await fetchAuthor(work.authors[0].author.key.replace("/authors/", ""));
      author = authorData.name ?? author;
    } catch {
      // keep Unknown
    }
  }

  const totalPages = parsePageCount(edition);
  const coverUrl = getCoverUrl(editionId);
  const openLibraryUrl = `https://openlibrary.org${work.key}?edition=key%3A${edition.key}`;

  return {
    title: edition.title ?? work.title,
    author,
    totalPages,
    coverUrl,
    workId: work.key.replace("/works/", ""),
    editionId: edition.key.replace("/books/", ""),
    openLibraryUrl,
  };
}
