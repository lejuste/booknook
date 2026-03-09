"use client";

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1w ago";
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1mo ago";
  return `${months}mo ago`;
}

export type MarginaliaItem = {
  id: string;
  pageNumber: number;
  body: string;
  createdAt: string;
  authorName: string;
  authorAvatarUrl: string | null;
};

export type FriendProgress = {
  userId: string;
  pagesRead: number;
  displayName: string;
  avatarUrl: string | null;
};

type BookTimelineProps = {
  totalPages: number;
  pagesRead: number;
  marginalia: MarginaliaItem[];
  friendsProgress: FriendProgress[];
};

export function BookTimeline({
  totalPages,
  pagesRead,
  marginalia,
  friendsProgress,
}: BookTimelineProps) {
  if (totalPages <= 0) {
    return (
      <p className="py-8 text-center text-sm text-stone-500">
        No page data for this book. Add progress to see the timeline.
      </p>
    );
  }

  // Build a sorted list of timeline nodes: page markers, marginalia, "You're here", friend avatars
  type TimelineNode =
    | { type: "page"; page: number }
    | { type: "marginalia"; item: MarginaliaItem }
    | { type: "you"; page: number }
    | { type: "friend"; friend: FriendProgress };

  const nodes: TimelineNode[] = [];

  const pageStep = totalPages <= 100 ? 25 : totalPages <= 500 ? 50 : 100;
  for (let p = pageStep; p < totalPages; p += pageStep) {
    nodes.push({ type: "page", page: p });
  }
  for (const item of marginalia) {
    nodes.push({ type: "marginalia", item });
  }
  nodes.push({ type: "you", page: pagesRead });
  for (const friend of friendsProgress) {
    nodes.push({ type: "friend", friend });
  }

  // Sort by "position" (page number; "you" and friends use pagesRead)
  nodes.sort((a, b) => {
    const pageA =
      a.type === "page"
        ? a.page
        : a.type === "marginalia"
          ? a.item.pageNumber
          : a.type === "you"
            ? a.page
            : a.friend.pagesRead;
    const pageB =
      b.type === "page"
        ? b.page
        : b.type === "marginalia"
          ? b.item.pageNumber
          : b.type === "you"
            ? b.page
            : b.friend.pagesRead;
    if (pageA !== pageB) return pageA - pageB;
    // Stable order: page markers first, then marginalia, then you, then friends
    const order = (n: TimelineNode) =>
      n.type === "page" ? 0 : n.type === "marginalia" ? 1 : n.type === "you" ? 2 : 3;
    return order(a) - order(b);
  });

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div
        className="absolute left-[19px] top-0 bottom-0 w-px bg-scheme-border/80"
        aria-hidden
      />

      <ul className="relative flex flex-col gap-0" role="list">
        {nodes.map((node) => {
          if (node.type === "page") {
            return (
              <li
                key={`page-${node.page}`}
                className="flex items-center gap-4 py-2"
              >
                <div className="flex h-8 w-10 shrink-0 items-center justify-center">
                  <span className="text-xs font-medium text-stone-400">
                    {node.page}
                  </span>
                </div>
                <div className="h-px flex-1 bg-stone-200/60" aria-hidden />
              </li>
            );
          }

          if (node.type === "marginalia") {
            const { item } = node;
            return (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <div className="flex h-8 w-10 shrink-0 items-center justify-center">
                  <span className="text-xs font-medium text-stone-400">
                    {item.pageNumber}
                  </span>
                </div>
                <div className="h-px w-6 shrink-0 bg-stone-200/60" aria-hidden />
                <div className="min-w-0 flex-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <div className="h-6 w-6 overflow-hidden rounded-full bg-stone-200 ring-1 ring-stone-200/80">
                      {item.authorAvatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.authorAvatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-stone-500" title={item.authorName}>
                          {item.authorName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-700">
                    <span className="italic">{item.body}</span>
                  </p>
                </div>
              </li>
            );
          }

          if (node.type === "you") {
            return (
              <li key="you-here" className="flex gap-4 py-4">
                <div className="flex w-10 shrink-0 flex-col items-center">
                  <div
                    className="h-4 w-4 rounded-full bg-scheme-primary"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-1 items-center">
                  <span className="rounded-md bg-scheme-accent-soft/70 px-2.5 py-1 text-xs font-medium text-scheme-primary-hover">
                    You&apos;re here
                  </span>
                </div>
              </li>
            );
          }

          // friend
          const { friend } = node;
          return (
            <li
              key={`friend-${friend.userId}`}
              className="flex items-center gap-4 py-2"
            >
              <div className="flex h-8 w-10 shrink-0 items-center justify-center">
                <span className="text-xs font-medium text-stone-400">
                  {friend.pagesRead}
                </span>
              </div>
              <div className="h-px w-6 shrink-0 bg-stone-200/60" aria-hidden />
              <div className="flex flex-1 items-center">
                <div
                  className="h-8 w-8 overflow-hidden rounded-full bg-stone-200 ring-2 ring-white"
                  title={`${friend.displayName} – p.${friend.pagesRead}`}
                >
                  {friend.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={friend.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-medium text-stone-500">
                      {friend.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
