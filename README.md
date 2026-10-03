# Speak30

A daily speaking coach you can install on your phone. Each day gives you one short, guided
session: warm up, drill a sound, learn one idea, pick up new words, then speak and review.

**Live app:** https://speak30-daily.pages.dev

## What it does

- **Today** — shows the current day, your streak, the topic and objective, and one button to
  start.
- **Practice** — walks through the day's session step by step:
  1. Warm-up
  2. Articulation drill
  3. Mini lesson
  4. Vocabulary
  5. Speaking challenge (record, play back, re-record)
  6. Conversation
  7. Feedback and retry
- **My Words** — vocabulary you saved, with meaning, pronunciation, an example sentence and
  spoken audio.
- **Progress** — days completed, streak, speaking time and your scores per session.
- **Conversation** — the day's conversation questions on their own.

The app works on desktop and mobile, and installs as an app (see [Install](#install-on-your-phone)).

## Current limitations

- **Scores are estimates.** Clarity, pacing, filler words and the other scores are calculated
  from how long you spoke compared with the target time. Your audio is not analysed.
- **The conversation is scripted.** The "AI" coach asks the questions written in the
  curriculum, in order. It does not listen to or respond to what you say.
- **Recordings stay in the browser.** Audio is only kept for playback during the session and is
  never uploaded.
- **Progress is saved on the device.** It lives in the browser's local storage, so it does not
  sync between devices and is lost if you clear site data.

## Curriculum

All lesson content lives in one file: [public/data/curriculum.json](public/data/curriculum.json).
The app has no lesson text in its code, so you change the course by editing that file.

```jsonc
{
  "meta": { "project": "...", "version": 1, "total_days": 28 },
  "days": [
    {
      "day": 1,
      "week": 1,
      "title": "...",
      "topic": "...",
      "objective": "...",
      "estimated_minutes": 9,
      "warmup": { "type": "...", "instructions": "...", "duration_seconds": 60 },
      "articulation_exercise": {
        "focus_sound": "...",
        "drill_text": "...",
        "instructions": "...",
        "duration_seconds": 90,
      },
      "mini_lesson": { "title": "...", "content": "...", "key_points": ["..."] },
      "vocabulary": [
        {
          "word": "...",
          "meaning": "...",
          "pronunciation": "...",
          "example_sentence": "...",
          "similar_words": ["..."],
        },
      ],
      "phrases": ["..."],
      "speaking_prompt": {
        "prompt": "...",
        "prep_seconds": 15,
        "response_seconds": 45,
        "tips": ["..."],
      },
      "conversation": { "opening_question": "...", "follow_up_questions": ["..."] },
      "feedback_criteria": ["..."],
      "retry_instructions": "...",
    },
  ],
}
```

The full type definitions are in [src/lib/curriculum.ts](src/lib/curriculum.ts).

### Updating the live course without redeploying

By default the app reads the copy of `curriculum.json` bundled with the build. If the
`VITE_CURRICULUM_URL` environment variable is set at build time, it loads the curriculum from
that URL instead.

The live site sets it to the raw GitHub URL of this file on `main`. So a change to
`curriculum.json` pushed to `main` reaches the live app without a new deployment, usually
within a few minutes.

## Run it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```sh
git clone https://github.com/suvasthigha-puvan/speak-30-daily.git
cd speak-30-daily
npm install
npm run dev
```

The repository's lockfile is for [Bun](https://bun.sh); `bun install` and `bun run dev` work
the same way.

| Command          | What it does                  |
| ---------------- | ----------------------------- |
| `npm run dev`    | Start the development server  |
| `npm run build`  | Build for production          |
| `npm run lint`   | Check the code with ESLint    |
| `npm run format` | Format the code with Prettier |

## Deployment

The site is a Cloudflare Pages project connected to this repository. Every push to `main` is
built and deployed automatically.

| Setting                | Value                                                                 |
| ---------------------- | --------------------------------------------------------------------- |
| Build command          | `npm run build`                                                       |
| Build output directory | `dist`                                                                |
| `NODE_VERSION`         | `20`                                                                  |
| `VITE_CURRICULUM_URL`  | Optional — see [above](#updating-the-live-course-without-redeploying) |

The build produces a different folder layout on Cloudflare Pages than on your own machine. To
reproduce the Pages build locally, set `CF_PAGES=1` first, then preview it with Wrangler:

```sh
CF_PAGES=1 npm run build
npx wrangler pages dev dist
```

## Install on your phone

- **Android (Chrome):** tap **Install** on the banner at the bottom of the page, or open the
  **⋮** menu and choose **Add to Home screen**. If the menu shows **Open Speak30** instead, the
  app is already installed — look for it in your app list.
- **iPhone (Safari):** tap **Share**, then **Add to Home Screen**.

The link must be open in the browser itself. In-app viewers (the Google app, WhatsApp,
Instagram and similar) cannot install apps; use the banner's **Open in Chrome** button.

### How the install support is built

- [public/manifest.webmanifest](public/manifest.webmanifest) — app name, colours and icons.
  Its `related_applications` entry contains the site address and must be updated if the domain
  changes.
- [vite.config.ts](vite.config.ts) — generates the service worker (`sw.js`), which caches the
  app's files so it loads quickly and previously opened pages work offline.
- [src/lib/pwa-register.ts](src/lib/pwa-register.ts) — registers the service worker, in
  production only.
- [src/components/InstallPrompt.tsx](src/components/InstallPrompt.tsx) — the install banner
  and its instructions.

## Project structure

```
public/
  data/curriculum.json     Course content
  icons/                   App icons
  manifest.webmanifest     Install metadata
src/
  routes/                  One file per page (Today, Practice, My Words, Progress, Conversation)
  components/              Recorder, word cards, conversation panel, install banner, app shell
  components/ui/           Shared UI building blocks (shadcn/ui)
  lib/curriculum.ts        Curriculum types and loading
  lib/progress.ts          Streak, completed sessions and saved words (local storage)
vite.config.ts             Build and service worker configuration
```

## Built with

[TanStack Start](https://tanstack.com/start) (React 19, server-rendered), TanStack Router and
Query, Tailwind CSS 4, shadcn/ui, Vite and `vite-plugin-pwa`, running on Cloudflare Pages.

## Lovable

This project was started with [Lovable](https://lovable.dev) and stays connected to it:
commits pushed to `main` sync back into the
[Lovable editor](https://lovable.dev/projects/95f6490b-dae0-40c1-90fd-95b2d1c971ad). Avoid
force-pushing or rewriting history on `main`, because that breaks the project history on
Lovable's side.
