import { queryOptions } from "@tanstack/react-query";

export type VocabWord = {
  word: string;
  meaning: string;
  pronunciation: string;
  example_sentence: string;
  similar_words: string[];
};

export type CurriculumDay = {
  day: number;
  week: number;
  title: string;
  topic: string;
  objective: string;
  estimated_minutes: number;
  warmup: { type: string; instructions: string; duration_seconds: number };
  articulation_exercise: {
    focus_sound: string;
    drill_text: string;
    instructions: string;
    duration_seconds: number;
  };
  mini_lesson: { title: string; content: string; key_points: string[] };
  vocabulary: VocabWord[];
  phrases: string[];
  speaking_prompt: {
    prompt: string;
    prep_seconds: number;
    response_seconds: number;
    tips: string[];
  };
  conversation: { opening_question: string; follow_up_questions: string[] };
  feedback_criteria: string[];
  retry_instructions: string;
};

export type Curriculum = {
  meta: { project: string; version: number; total_days: number; note?: string };
  days: CurriculumDay[];
};

/**
 * Single source of truth for course content.
 * Defaults to the bundled /data/curriculum.json, but can point at a raw
 * GitHub URL (VITE_CURRICULUM_URL) so content updates need no code changes.
 */
export const CURRICULUM_URL =
  (import.meta.env["VITE_CURRICULUM_URL"] as string | undefined) ?? "/data/curriculum.json";

async function fetchCurriculum(): Promise<Curriculum> {
  // Relative URLs can't be fetched during server rendering; read the bundled copy there.
  if (typeof window === "undefined" && CURRICULUM_URL.startsWith("/")) {
    const mod = await import("../../public/data/curriculum.json");
    const copy = JSON.parse(JSON.stringify(mod.default)) as Curriculum;
    copy.days.sort((a, b) => a.day - b.day);
    return copy;
  }
  const res = await fetch(CURRICULUM_URL, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Could not load the curriculum (${res.status})`);
  const data = (await res.json()) as Curriculum;
  data.days = [...(data.days ?? [])].sort((a, b) => a.day - b.day);
  return data;
}

export const curriculumQuery = queryOptions({
  queryKey: ["curriculum", CURRICULUM_URL],
  queryFn: fetchCurriculum,
  staleTime: 5 * 60 * 1000,
});

export function totalDays(c: Curriculum) {
  return c.meta?.total_days || c.days.length;
}

export function dayByNumber(c: Curriculum, day: number) {
  return (c.days.find((d) => d.day === day) ?? c.days[0])!;
}

export const STEP_IDS = [
  "warmup",
  "articulation",
  "lesson",
  "vocabulary",
  "challenge",
  "conversation",
  "feedback",
] as const;

export type StepId = (typeof STEP_IDS)[number];

export const STEP_LABELS: Record<StepId, string> = {
  warmup: "Warm-up",
  articulation: "Articulation",
  lesson: "Mini lesson",
  vocabulary: "Vocabulary",
  challenge: "Speaking challenge",
  conversation: "Conversation",
  feedback: "Feedback",
};
