import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Flame } from "lucide-react";
import { useProgress } from "@/lib/progress";

const NAV = [
  { to: "/", label: "Today" },
  { to: "/practice", label: "Practice" },
  { to: "/words", label: "My Words" },
  { to: "/progress", label: "Progress" },
  { to: "/conversation", label: "Conversation" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { streak } = useProgress();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-100 to-cyan-50 text-ink">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rotate-12 rounded-[2.5rem] bg-aqua/30 blur-2xl floaty" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 -rotate-12 rounded-[2.5rem] bg-brand/25 blur-2xl floaty-slow" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rotate-6 rounded-[2.5rem] bg-aqua/20 blur-2xl floaty" />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl gradient-brand font-display text-base font-bold text-brand-foreground shadow-lg shadow-brand/30">
              S
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Speak15</span>
          </Link>

          <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-full bg-background/60 p-1 ring-1 ring-background/70 backdrop-blur-md md:order-none md:w-auto">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors"
                activeProps={{ className: "bg-background text-foreground font-semibold shadow-sm" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 rounded-full bg-background/60 px-3 py-1.5 ring-1 ring-background/70 backdrop-blur-md">
            <Flame className="size-4 text-brand" />
            <span className="text-sm font-bold tabular-nums">{streak} day streak</span>
          </div>
        </header>

        <main className="pb-14">{children}</main>
      </div>
    </div>
  );
}
