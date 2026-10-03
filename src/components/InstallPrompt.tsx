import { useEffect, useState } from "react";
import { Download, ExternalLink, MoreVertical, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    // set by the inline script in __root.tsx, which runs before React hydrates
    __speak30Install?: BeforeInstallPromptEvent | null;
  }
}

type Platform = "ios" | "android" | "other";

function getPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

// In-app viewers (Google app, Facebook, Instagram, WebViews...) cannot install apps.
function isInAppBrowser(): boolean {
  return /\bwv\b|GSA\/|FBAN|FBAV|Instagram|Line\/|MicroMessenger|Snapchat|Twitter/i.test(
    navigator.userAgent,
  );
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function chromeIntentUrl(): string {
  const { host, pathname, search, href } = window.location;
  return `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(href)};end`;
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/15 text-[11px] font-bold text-brand">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [inApp, setInApp] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPlatform(getPlatform());
    setInApp(isInAppBrowser());
    setInstalled(isStandalone());
    if (window.__speak30Install) setDeferred(window.__speak30Install);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      window.__speak30Install = null;
      setDeferred(null);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Phones always get the banner (with manual steps as a fallback); desktop only
  // when the browser offers a real install prompt.
  if (platform === null || installed || dismissed) return null;
  if (platform === "other" && !deferred) return null;

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      window.__speak30Install = null;
      setDeferred(null);
      if (choice.outcome === "accepted") setInstalled(true);
      return;
    }
    setShowHelp(true);
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
            <p className="text-xs text-muted-foreground">Keep it on your phone like a real app.</p>
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

      {showHelp && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="glass-card w-full max-w-sm rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {platform === "ios" ? (
              <>
                <h3 className="font-display text-lg font-bold">Add Speak30 to your iPhone</h3>
                <ol className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                  <Step n={1}>
                    Tap the <Share className="inline size-4 -translate-y-0.5 text-brand" />{" "}
                    <strong className="text-foreground">Share</strong> button in Safari.
                  </Step>
                  <Step n={2}>
                    Scroll down and tap{" "}
                    <strong className="text-foreground">Add to Home Screen</strong>.
                  </Step>
                  <Step n={3}>
                    Tap <strong className="text-foreground">Add</strong> — Speak30 will appear on
                    your home screen.
                  </Step>
                </ol>
              </>
            ) : (
              <>
                <h3 className="font-display text-lg font-bold">Install Speak30 on your phone</h3>
                {inApp && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    This page is open inside another app, which can't install apps. Open it in
                    Chrome first.
                  </p>
                )}
                <a
                  href={chromeIntentUrl()}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-brand/30 py-2.5 text-sm font-semibold text-brand"
                >
                  <ExternalLink className="size-4" />
                  Open in Chrome
                </a>
                <ol className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  <Step n={1}>
                    In Chrome, tap the{" "}
                    <MoreVertical className="inline size-4 -translate-y-0.5 text-brand" />{" "}
                    <strong className="text-foreground">menu</strong> at the top right.
                  </Step>
                  <Step n={2}>
                    Scroll the menu and tap{" "}
                    <strong className="text-foreground">Add to Home screen</strong> (or{" "}
                    <strong className="text-foreground">Install app</strong>).
                  </Step>
                  <Step n={3}>
                    Tap <strong className="text-foreground">Install</strong> — Speak30 will appear
                    on your home screen.
                  </Step>
                </ol>
              </>
            )}
            <button
              onClick={() => setShowHelp(false)}
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
