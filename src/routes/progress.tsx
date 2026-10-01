import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Speak15" },
      { name: "description", content: "Track your 30-day completion, streak, speaking time and skill scores." },
      { property: "og:title", content: "Progress — Speak15" },
      { property: "og:description", content: "Your speaking stats across the 30-day plan." },
    ],
  }),
  component: ProgressPage,
});

function avg(nums: number[]) {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
}

function ProgressPage() {
  const { completed, streak, savedWords } = useProgress();
  const done = new Set(completed.map((c) => c.day));
  const minutes = Math.round(completed.reduce((a, c) => a + c.seconds, 0) / 60);
  const skills = [
    { label: "Clarity", value: avg(completed.map((c) => c.clarity)) },
    { label: "Pacing", value: avg(completed.map((c) => c.pacing)) },
    { label: "Vocabulary", value: avg(completed.map((c) => c.vocabulary)) },
    { label: "Professional communication", value: avg(completed.map((c) => c.professional)) },
    { label: "Low filler words", value: completed.length ? Math.max(0, 100 - avg(completed.map((c) => c.fillers)) * 15) : 0 },
  ];
  const weeks = [1, 2, 3, 4].map((w) => {
    const days = Array.from({ length: w === 4 ? 9 : 7 }, (_, i) => (w - 1) * 7 + i + 1).filter((d) => d <= 30);
    return { w, pct: Math.round((days.filter((d) => done.has(d)).length / days.length) * 100) };
  });

  return (
    <AppShell>
      <h1 className="mt-8 font-display text-4xl font-bold tracking-tight">Progress</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Days done", `${completed.length}/30`],
          ["Streak", `${streak} days`],
          ["Speaking time", `${minutes} min`],
          ["Saved words", String(savedWords.length)],
        ].map(([l, v]) => (
          <div key={l} className="glass-card rise-in p-5">
            <div className="font-display text-3xl font-bold text-brand">{v}</div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <section className="glass-card p-6 lg:col-span-7">
          <h2 className="font-display text-lg font-bold">30-day completion</h2>
          <div className="mt-4 grid grid-cols-10 gap-1.5">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
              <span
                key={d}
                title={`Day ${d}`}
                className={`grid aspect-square place-items-center rounded-md text-[10px] font-bold ${done.has(d) ? "gradient-brand text-brand-foreground" : "bg-background/70 text-muted-foreground ring-1 ring-border"}`}
              >
                {d}
              </span>
            ))}
          </div>
          <h2 className="mt-7 font-display text-lg font-bold">Weekly progress</h2>
          <div className="mt-4 flex h-32 items-end gap-4">
            {weeks.map(({ w, pct }) => (
              <div key={w} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end overflow-hidden rounded-xl bg-muted">
                  <div className="w-full rounded-xl gradient-brand transition-[height] duration-700" style={{ height: `${pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Week {w}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-6 lg:col-span-5">
          <h2 className="font-display text-lg font-bold">Skills</h2>
          <div className="mt-4 space-y-4">
            {skills.map((s) => (
              <div key={s.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="font-bold tabular-nums text-brand">{s.value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full gradient-brand transition-[width] duration-700" style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          {completed.length === 0 && (
            <p className="mt-5 text-sm text-muted-foreground">Complete your first session to see scores.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
