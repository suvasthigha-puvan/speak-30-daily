import { useCallback, useEffect, useState } from "react";
import type { VocabWord } from "./curriculum";

export type SessionResult = {
  day: number;
  completedAt: string;
  seconds: number;
  clarity: number;
  pacing: number;
  fillers: number;
  vocabulary: number;
  professional: number;
};

export type SavedWord = VocabWord & { savedAt: string; day: number; practiced: number };

export type ProgressState = {
  completed: SessionResult[];
  savedWords: SavedWord[];
  streak: number;
  lastDayDone: string | null;
};

const KEY = "speak15.progress.v1";

const empty: ProgressState = { completed: [], savedWords: [], streak: 0, lastDayDone: null };

function read(): ProgressState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...empty, ...(JSON.parse(raw) as ProgressState) } : empty;
  } catch {
    return empty;
  }
}

function write(state: ProgressState) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("speak15:progress"));
}

function dateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(empty);

  useEffect(() => {
    const sync = () => setState(read());
    sync();
    window.addEventListener("speak15:progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("speak15:progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const completeSession = useCallback((result: Omit<SessionResult, "completedAt">) => {
    const prev = read();
    const today = dateKey();
    const yesterday = dateKey(new Date(Date.now() - 86_400_000));
    const streak =
      prev.lastDayDone === today
        ? prev.streak
        : prev.lastDayDone === yesterday
          ? prev.streak + 1
          : 1;
    write({
      ...prev,
      streak,
      lastDayDone: today,
      completed: [...prev.completed.filter((c) => c.day !== result.day), { ...result, completedAt: new Date().toISOString() }],
    });
  }, []);

  const saveWord = useCallback((word: VocabWord, day: number) => {
    const prev = read();
    if (prev.savedWords.some((w) => w.word === word.word)) return;
    write({
      ...prev,
      savedWords: [{ ...word, day, savedAt: new Date().toISOString(), practiced: 0 }, ...prev.savedWords],
    });
  }, []);

  const removeWord = useCallback((word: string) => {
    const prev = read();
    write({ ...prev, savedWords: prev.savedWords.filter((w) => w.word !== word) });
  }, []);

  const practiceWord = useCallback((word: string) => {
    const prev = read();
    write({
      ...prev,
      savedWords: prev.savedWords.map((w) => (w.word === word ? { ...w, practiced: w.practiced + 1 } : w)),
    });
  }, []);

  const currentDay = Math.min(state.completed.length + 1, 30);
  const isSaved = (word: string) => state.savedWords.some((w) => w.word === word);

  return { ...state, currentDay, isSaved, completeSession, saveWord, removeWord, practiceWord };
}
