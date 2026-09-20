import { Volume2, Plus, Check } from "lucide-react";
import type { VocabWord } from "@/lib/curriculum";

export function speakWord(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(word);
  utter.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function WordCard({
  word,
  saved,
  onSave,
  footer,
}: {
  word: VocabWord;
  saved?: boolean;
  onSave?: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand/5 to-aqua/5 p-5 ring-1 ring-brand/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-2xl font-bold">{word.word}</span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {word.pronunciation}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{word.meaning}</p>
          <p className="mt-3 text-sm italic text-muted-foreground">“{word.example_sentence}”</p>
        </div>
        <button
          onClick={() => speakWord(word.word)}
          aria-label={`Hear ${word.word}`}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-background ring-1 ring-border"
        >
          <Volume2 className="size-4" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {word.similar_words.map((s) => (
          <span
            key={s}
            className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border"
          >
            {s}
          </span>
        ))}
        {onSave && (
          <button
            onClick={onSave}
            disabled={saved}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
          >
            {saved ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
            {saved ? "Saved" : "Save Word"}
          </button>
        )}
        {footer}
      </div>
    </div>
  );
}
