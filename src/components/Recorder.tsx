import { useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, Play, Check } from "lucide-react";

type Props = {
  label: string;
  maxSeconds?: number;
  onSubmit?: (seconds: number) => void;
  submitLabel?: string;
};

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Recorder({ label, maxSeconds = 60, onSubmit, submitLabel = "Submit" }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= maxSeconds) {
          recorderRef.current?.stop();
          return maxSeconds;
        }
        return s + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [recording, maxSeconds]);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      rec.start();
      recorderRef.current = rec;
      setAudioUrl(null);
      setSeconds(0);
      setRecording(true);
    } catch {
      setError("Microphone access is needed to record. Please allow it and try again.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
  }

  function reset() {
    setAudioUrl(null);
    setSeconds(0);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full items-center justify-between">
        <h3 className="font-display text-lg font-bold">{recording ? "Now recording" : label}</h3>
        <span className="font-display text-2xl font-bold tabular-nums text-brand">
          {mmss(seconds)}
        </span>
      </div>

      <div className="relative mt-6 flex flex-col items-center">
        {recording && (
          <>
            <span className="absolute left-1/2 top-12 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aqua/30 mic-ring" />
            <span
              className="absolute left-1/2 top-12 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aqua/30 mic-ring"
              style={{ animationDelay: "0.8s" }}
            />
            <span
              className="absolute left-1/2 top-12 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aqua/30 mic-ring"
              style={{ animationDelay: "1.6s" }}
            />
          </>
        )}
        <button
          onClick={recording ? stop : start}
          aria-label={recording ? "Stop recording" : "Start recording"}
          className="relative grid size-24 place-items-center rounded-full gradient-brand text-brand-foreground shadow-lg shadow-brand/40 transition-transform active:scale-95"
        >
          {recording ? <Square className="size-9" /> : <Mic className="size-10" />}
        </button>

        <div className="mt-5 flex h-8 items-end gap-1">
          {[30, 70, 45, 90, 55, 80, 35, 65, 50].map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-aqua/70 transition-[height] duration-300"
              style={{
                height: recording ? `${Math.max(20, (h + seconds * 7 * (i + 1)) % 100)}%` : "25%",
              }}
            />
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={reset}
          disabled={!audioUrl}
          className="grid size-12 place-items-center rounded-full bg-background text-foreground ring-1 ring-border disabled:opacity-40"
          aria-label="Re-record"
        >
          <RotateCcw className="size-5" />
        </button>
        <button
          onClick={() => audioRef.current?.play()}
          disabled={!audioUrl}
          className="grid size-14 place-items-center rounded-full bg-ink text-primary-foreground shadow-lg disabled:opacity-40"
          aria-label="Play recording"
        >
          <Play className="size-6" />
        </button>
        <button
          onClick={() => onSubmit?.(seconds)}
          disabled={!audioUrl && !onSubmit}
          className="grid size-12 place-items-center rounded-full bg-aqua/15 text-aqua-deep ring-1 ring-aqua/30 disabled:opacity-40"
          aria-label={submitLabel}
        >
          <Check className="size-5" />
        </button>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
      <p className="mt-3 text-xs font-medium text-muted-foreground">
        {audioUrl ? "Play it back, re-record, or submit" : `Up to ${mmss(maxSeconds)}`}
      </p>
    </div>
  );
}
