import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { WordCard } from "@/components/WordCard";
import { curriculumQuery, dayByNumber, totalDays } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Speak15 — Your 15-minute daily speaking practice" },
      {
        name: "description",
        content:
          "Speak15 is a 30-day articulation coach: a 15-minute daily session with warm-ups, drills, vocabulary and spoken challenges.",
      },
      { property: "og:title", content: "Speak15 — Your 15-minute daily speaking practice" },
      {
        property: "og:description",
        content: "A 30-day speaking coach with daily drills, recordings and progress tracking.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(curriculumQuery),
  component: TodayPage,
});

function TodayPage() {
  const { data } = useSuspenseQuery(curriculumQuery);
  const { currentDay, completed, savedWords, saveWord, isSaved } = useProgress();
  const total = totalDays(data);
  const day = dayByNumber(data, currentDay);
  const pct = Math.round((completed.length / total) * 100);

  return (
    <AppShell>
      <div className="mt-8 grid gap-5 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="relative overflow-hidden glass-card rise-in p-7 ring-1 ring-background/70">
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-aqua/30 to-brand/20 blur-xl" />
            <div className="relative flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                Day {day.day} / {total}
              </span>
              <span className="rounded-full bg-aqua/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-aqua-deep">
                Week {day.week}
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {day.title}
            </h1>
            <p className="mt-2 text-sm font-semibold text-aqua-deep">{day.topic}</p>
            <p className="mt-3 max-w-md text-base text-muted-foreground">{day.objective}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-primary-foreground">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-success" />
                </span>
                <span className="font-display text-lg font-bold tabular-nums">
                  {day.estimated_minutes}:00
                </span>
                <span className="text-xs font-medium opacity-70">est. session</span>
              </div>
              <div className="rounded-xl bg-background px-4 py-2.5 ring-1 ring-border">
                <div className="text-xs font-medium text-muted-foreground">
                  30-day progress · {completed.length}/{total}
                </div>
                <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full gradient-brand" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            <Link
              to="/practice"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl gradient-brand px-6 py-4 font-display text-lg font-bold text-brand-foreground shadow-lg shadow-brand/30 transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <span className="grid size-8 place-items-center rounded-full bg-background/20">
                <Play className="size-4" />
              </span>
              Start Today's Practice
            </Link>
          </div>
        </section>

        <section className="lg:col-span-5">
          <div className="h-full glass-card rise-in p-6 ring-1 ring-background/70">
            <h2 className="font-display text-lg font-bold">Today's session</h2>
            <ol className="mt-4 space-y-2.5">
              {[
                ["Warm-up", `${day.warmup.duration_seconds}s`],
                ["Articulation", day.articulation_exercise.focus_sound],
                ["Mini lesson", day.mini_lesson.title],
                ["Vocabulary", `${day.vocabulary.length} words`],
                ["Speaking challenge", `${day.speaking_prompt.response_seconds}s`],
                ["AI conversation", `${day.conversation.follow_up_questions.length + 1} questions`],
                ["Feedback & retry", "scorecard"],
              ].map(([name, meta], i) => (
                <li
                  key={name}
                  className="flex items-center gap-3 rounded-xl bg-background/70 px-3 py-2.5 ring-1 ring-border"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold">{name}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">{meta}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-background/70 px-3 py-2.5 text-sm ring-1 ring-border">
              <span className="text-muted-foreground">Saved words</span>
              <Link to="/words" className="font-bold text-brand">
                {savedWords.length} →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-5 glass-card rise-in p-6 ring-1 ring-background/70">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Today's vocabulary</h2>
          <span className="text-xs font-semibold text-muted-foreground">tap a word to hear it</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {day.vocabulary.map((w) => (
            <WordCard
              key={w.word}
              word={w}
              saved={isSaved(w.word)}
              onSave={() => saveWord(w, day.day)}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
