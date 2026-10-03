import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ConversationPanel } from "@/components/ConversationPanel";
import { curriculumQuery, dayByNumber } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/conversation")({
  head: () => ({
    meta: [
      { title: "Conversation Practice — Speak30" },
      { name: "description", content: "Answer spoken questions and get follow-ups from your speaking coach." },
      { property: "og:title", content: "Conversation Practice — Speak30" },
      { property: "og:description", content: "Speak, then get follow-up questions from your coach." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(curriculumQuery),
  component: ConversationPage,
});

function ConversationPage() {
  const { data } = useSuspenseQuery(curriculumQuery);
  const { currentDay } = useProgress();
  const day = dayByNumber(data, currentDay);
  return (
    <AppShell>
      <div className="mx-auto mt-8 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Day {day.day} topic</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">{day.topic}</h1>
        <div className="mt-6 glass-card p-2">
          <ConversationPanel key={day.day} conversation={day.conversation} />
        </div>
      </div>
    </AppShell>
  );
}
