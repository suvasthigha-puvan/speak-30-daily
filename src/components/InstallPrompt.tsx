import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  // Nothing to offer: already installed, dismissed, and no prompt/iOS flow available.
  if (isStandalone() || dismissed || (!deferred && !isIos())) return null;

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setDeferred(null);
      return;
    }
    setShowIosHelp(true);
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
        <div className="glass-card flex items-center gap-3 rounded-2xl p-3 shadow-xl shadow-brand/20 ring-1 ring-brand/20">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl gradient-brand font-display text-sm font-bold text-brand-foreground">
            S
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Install Speak30</p>
            <p className="text-xs text-muted-foreground">
              Keep it on your phone like a real app.
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full gradient-brand px-3.5 py-2 text-xs font-semibold text-brand-foreground shadow-md shadow-brand/30 transition-transform active:scale-95"
          >
            <Download className="size-3.5" />
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss install prompt"
            className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-background/60"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {showIosHelp && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            className="glass-card w-full max-w-sm rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold">Add Speak30 to your iPhone</h3>
            <ol className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/15 text-[11px] font-bold text-brand">1</span>
                <span>
                  Tap the <Share className="inline size-4 -translate-y-0.5 text-brand" />{" "}
                  <strong className="text-foreground">Share</strong> button in Safari.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/15 text-[11px] font-bold text-brand">2</span>
                <span>
                  Scroll down and tap{" "}
                  <strong className="text-foreground">Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/15 text-[11px] font-bold text-brand">3</span>
                <span>
                  Tap <strong className="text-foreground">Add</strong> — Speak30 will appear on
                  your home screen.
                </span>
              </li>
            </ol>
            <button
              onClick={() => setShowIosHelp(false)}
              className="mt-4 w-full rounded-full gradient-brand py-2.5 text-sm font-semibold text-brand-foreground"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
