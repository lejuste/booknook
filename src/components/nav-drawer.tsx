"use client";

type NavDrawerProps = {
  title: string;
  children?: React.ReactNode;
};

export function NavDrawer({ title, children }: NavDrawerProps) {
  return (
    <header className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-scheme-border/50 bg-scheme-bg-muted/95 px-4 py-4 backdrop-blur-sm">
      <div />
      <h1 className="text-center text-lg font-bold text-stone-900">{title}</h1>
      <div className="flex justify-end">{children}</div>
    </header>
  );
}
