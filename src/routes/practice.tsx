import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Recorder } from "@/components/Recorder";
import { WordCard } from "@/components/WordCard";
import { ConversationPanel } from "@/components/ConversationPanel";
import {
  curriculumQuery,
  dayByNumber,
  STEP_IDS,
  STEP_LABELS,
  totalDays,
} from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Daily Practice — Speak15" },
      {
        name: "description",
        content:
          "Move through today's warm-up, articulation drill, mini lesson, vocabulary, speaking challenge and feedback.",
      },
      { property: "og:title", content: "Daily Practice — Speak15" },
      {
        property: "og:description",
        content: "Your guided 15-minute speaking session, one step at a time.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(curriculumQuery),
  component: PracticePage,
});

function score(seconds: number, target: number) {
  const ratio = Math.min(seconds, target) / target;
  return Math.round(55 + ratio * 40);
}

function PracticePage() {
  const { data } = useSuspenseQuery(curriculumQuery);
  const { currentDay, isSaved, saveWord, completeSession } = useProgress();
  const navigate = useNavigate();
  const day = dayByNumber(data, currentDay);
  const total = totalDays(data);

  const [stepIndex, setStepIndex] = useState(0);
  const [spokenSeconds, setSpokenSeconds] = useState(0);
  const step = STEP_IDS[stepIndex];

  const scores = useMemo(() => {
    const base = score(spokenSeconds, day.speaking_prompt.response_seconds);
    return {
      clarity: Math.min(98, base + 4),
      pacing: Math.min(96, base),
      fillers: Math.max(0, 5 - Math.round(spokenSeconds / 15)),
      vocabulary: Math.min(95, base - 6),
      professional: Math.min(97, base + 1),
    };
  }, [spokenSeconds, day.speaking_prompt.response_seconds]);

  function finish() {
    completeSession({
      day: day.day,
      seconds: spokenSeconds,
      clarity: scores.clarity,
      pacing: scores.pacing,
      fillers: scores.fillers,
      vocabulary: scores.vocabulary,
      professional: scores.professional,
    });
    navigate({ to: "/progress" });
  }

  return (
    <AppShell>
      <div className="mt-8 glass-card p-6 ring-1 ring-background/70 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand">
              Day {day.day} / {total} · Step {stepIndex + 1} of {STEP_IDS.length}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {STEP_LABELS[step]}
            </h1>
          </div>
          <Link to="/" className="text-sm font-semibold text-muted-foreground">
            Exit session
          </Link>
        </div>

        <div className="mt-4 flex gap-1.5">
          {STEP_IDS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-brand" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {step === "warmup" && (
              <StepBody title={day.warmup.type.replaceAll("_", " ")} seconds={day.warmup.duration_seconds}>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {day.warmup.instructions}
                </p>
              </StepBody>
            )}

            {step === "articulation" && (
              <StepBody
                title={`Focus sound: ${day.articulation_exercise.focus_sound}`}
                seconds={day.articulation_exercise.duration_seconds}
              >
                <p className="rounded-2xl bg-brand/5 p-5 font-display text-2xl font-bold leading-snug ring-1 ring-brand/10">
                  “{day.articulation_exercise.drill_text}”
                </p>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {day.articulation_exercise.instructions}
                </p>
              </StepBody>
            )}

            {step === "lesson" && (
              <StepBody title={day.mini_lesson.title}>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {day.mini_lesson.content}
                </p>
                <ul className="mt-4 space-y-2">
                  {day.mini_lesson.key_points.map((p) => (
                    <li key={p} className="flex gap-3 rounded-xl bg-background/70 p-3 ring-1 ring-border">
                      <Sparkle className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span className="text-sm">{p}</span>
                    </li>
                  ))}
                </ul>
              </StepBody>
            )}

            {step === "vocabulary" && (
              <div className="space-y-3">
                {day.vocabulary.map((w) => (
                  <WordCard
                    key={w.word}
                    word={w}
                    saved={isSaved(w.word)}
                    onSave={() => saveWord(w, day.day)}
                  />
                ))}
                <div className="rounded-2xl bg-background/70 p-5 ring-1 ring-border">
                  <h3 className="font-display text-base font-bold">Useful phrases</h3>
                  <ul className="mt-3 space-y-2">
                    {day.phrases.map((p) => (
                      <li key={p} className="text-sm text-muted-foreground">
                        · {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {step === "challenge" && (
              <StepBody title="Your speaking prompt" seconds={day.speaking_prompt.response_seconds}>
                <p className="rounded-2xl bg-brand/5 p-5 text-lg font-semibold leading-snug ring-1 ring-brand/10">
                  {day.speaking_prompt.prompt}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Prep time: {day.speaking_prompt.prep_seconds}s
                </p>
                <ul className="mt-4 space-y-2">
                  {day.speaking_prompt.tips.map((t) => (
                    <li key={t} className="flex gap-3 rounded-xl bg-background/70 p-3 ring-1 ring-border">
                      <Sparkle className="mt-0.5 size-4 shrink-0 text-aqua-deep" />
                      <span className="text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
              </StepBody>
            )}

            {step === "conversation" && <ConversationPanel conversation={day.conversation} />}

            {step === "feedback" && (
              <StepBody title="Your scorecard">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Metric label="Clarity" value={`${scores.clarity}%`} />
                  <Metric label="Pacing" value={`${scores.pacing}%`} />
                  <Metric label="Filler words" value={String(scores.fillers)} />
                  <Metric label="Vocabulary" value={`${scores.vocabulary}%`} />
                  <Metric label="Professional tone" value={`${scores.professional}%`} />
                  <Metric label="Spoken" value={`${spokenSeconds}s`} />
                </div>
                <h3 className="mt-6 font-display text-base font-bold">Measured against</h3>
                <ul className="mt-2 space-y-1.5">
                  {day.feedback_criteria.map((c) => (
                    <li key={c} className="text-sm text-muted-foreground">
                      · {c.replaceAll("_", " ")}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-2xl bg-aqua/10 p-5 ring-1 ring-aqua/20">
                  <h3 className="font-display text-base font-bold">Want another take?</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{day.retry_instructions}</p>
                  <button
                    onClick={() => setStepIndex(STEP_IDS.indexOf("challenge"))}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-primary-foreground"
                  >
                    <RotateCcw className="size-4" /> Retry the challenge
                  </button>
                </div>
              </StepBody>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[2rem] bg-background/80 p-6 ring-1 ring-border">
              <Recorder
                label={STEP_LABELS[step]}
                maxSeconds={
                  step === "challenge"
                    ? day.speaking_prompt.response_seconds
                    : step === "articulation"
                      ? day.articulation_exercise.duration_seconds
                      : 120
                }
                onSubmit={(s) => {
                  if (step === "challenge") setSpokenSeconds((prev) => Math.max(prev, s));
                  setStepIndex((i) => Math.min(i + 1, STEP_IDS.length - 1));
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold ring-1 ring-border disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          {stepIndex < STEP_IDS.length - 1 ? (
            <button
              onClick={() => setStepIndex((i) => i + 1)}
              className="inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/30"
            >
              Next step <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              className="inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/30"
            >
              Complete day {day.day} <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StepBody({
  title,
  seconds,
  children,
}: {
  title: string;
  seconds?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl font-bold capitalize">{title}</h2>
        {seconds ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {seconds}s
          </span>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background p-4 text-center ring-1 ring-border">
      <div className="font-display text-2xl font-bold text-brand">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
