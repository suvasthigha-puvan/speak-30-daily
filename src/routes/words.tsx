import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Mic } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { WordCard } from "@/components/WordCard";
import { Recorder } from "@/components/Recorder";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/words")({
  head: () => ({
    meta: [
      { title: "My Words — Speak15" },
      { name: "description", content: "Your saved vocabulary, with speaking prompts to put each word to use." },
      { property: "og:title", content: "My Words — Speak15" },
      { property: "og:description", content: "Practise your saved words out loud." },
    ],
  }),
  component: WordsPage,
});

function WordsPage() {
  const { savedWords, removeWord, practiceWord } = useProgress();
  const [active, setActive] = useState<string | null>(null);
  const activeWord = savedWords.find((w) => w.word === active);

  return (
    <AppShell>
      <h1 className="mt-8 font-display text-4xl font-bold tracking-tight">My Words</h1>
      <p className="mt-2 text-muted-foreground">{savedWords.length} saved · pick one and say it in a sentence.</p>

      {savedWords.length === 0 ? (
        <div className="mt-6 glass-card p-8 text-center">
          <p className="text-muted-foreground">No saved words yet. Save words during today's practice.</p>
          <Link to="/" className="mt-4 inline-block rounded-full gradient-brand px-5 py-2.5 text-sm font-bold text-brand-foreground">
            Go to today
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {savedWords.map((w) => (
              <WordCard
                key={w.word}
                word={w}
                footer={
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Practised {w.practiced}×</span>
                    <button onClick={() => setActive(w.word)} className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-primary-foreground">
                      <Mic className="size-3.5" /> Practise
                    </button>
                    <button onClick={() => removeWord(w.word)} aria-label="Remove" className="grid size-8 place-items-center rounded-full bg-background ring-1 ring-border">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                }
              />
            ))}
          </div>
          <div className="lg:col-span-5">
            <div className="sticky top-6 glass-card p-6">
              {activeWord ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand">Speaking prompt</p>
                  <p className="mt-2 text-lg font-semibold">
                    Use “{activeWord.word}” in two sentences about your work or day.
                  </p>
                  <div className="mt-6">
                    <Recorder key={activeWord.word} label="Your take" maxSeconds={30} onSubmit={() => practiceWord(activeWord.word)} />
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Choose “Practise” on a word to get a speaking prompt.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
