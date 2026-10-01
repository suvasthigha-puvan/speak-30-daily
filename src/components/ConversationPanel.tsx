import { useState } from "react";
import { Mic, Square } from "lucide-react";
import type { CurriculumDay } from "@/lib/curriculum";

type Msg = { role: "coach" | "you"; text: string };

export function ConversationPanel({ conversation }: { conversation: CurriculumDay["conversation"] }) {
  const questions = [conversation.opening_question, ...conversation.follow_up_questions];
  const [messages, setMessages] = useState<Msg[]>([{ role: "coach", text: questions[0] }]);
  const [qIndex, setQIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [started, setStarted] = useState(0);
  const done = qIndex >= questions.length - 1 && messages[messages.length - 1]?.role === "you";

  function toggle() {
    if (!recording) {
      setStarted(Date.now());
      setRecording(true);
      return;
    }
    setRecording(false);
    const secs = Math.max(1, Math.round((Date.now() - started) / 1000));
    const next = qIndex + 1;
    const reply: Msg[] = [{ role: "you", text: `🎙 Voice answer · ${secs}s` }];
    if (next < questions.length) reply.push({ role: "coach", text: questions[next] });
    else reply.push({ role: "coach", text: "Thanks — great conversation. You can move on to feedback." });
    setMessages((m) => [...m, ...reply]);
    setQIndex(next);
  }

  return (
    <div className="rounded-[2rem] bg-background/80 p-6 ring-1 ring-border">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">AI Conversation</h2>
        <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
          {recording ? "Listening" : "Live"}
        </span>
      </div>
      <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
        {messages.map((m, i) =>
          m.role === "you" ? (
            <div key={i} className="flex justify-end rise-in">
              <div className="max-w-[80%] rounded-2xl rounded-br-md gradient-brand px-4 py-2.5 text-sm font-medium text-brand-foreground">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-end gap-2 rise-in">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                AI
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-foreground">
                {m.text}
              </div>
            </div>
          ),
        )}
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-full bg-muted p-1.5 pl-4 ring-1 ring-border">
        <span className="text-sm text-muted-foreground">
          {done ? "Conversation complete" : recording ? "Tap to finish your answer" : "Speak your answer…"}
        </span>
        <button
          onClick={toggle}
          disabled={done}
          aria-label={recording ? "Stop answer" : "Speak answer"}
          className="ml-auto grid size-10 place-items-center rounded-full gradient-brand text-brand-foreground shadow-md disabled:opacity-40"
        >
          {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
        </button>
      </div>
    </div>
  );
}
