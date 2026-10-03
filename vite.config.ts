// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null, // registration happens only in src/lib/pwa-register.ts
        filename: "sw.js",
        // must match nitro's public dir: dist on Cloudflare Pages, .output/public otherwise
        outDir: process.env.CF_PAGES ? "dist" : ".output/public",
        manifest: false, // we serve public/manifest.webmanifest ourselves
        devOptions: { enabled: false }, // never emit a SW in dev/preview
        workbox: {
          globPatterns: ["**/*.{js,css,json,png,webmanifest}"],
          // the Pages server bundle lives in the same dir but is not a fetchable URL
          globIgnores: ["_worker.js/**", "nitro.json", "_routes.json"],
          dontCacheBustURLsMatching: /^assets\//,
          navigateFallback: null, // pages are server-rendered, there is no index.html to fall back to
          runtimeCaching: [
            {
              // HTML navigations: always try the network first
              urlPattern: ({ request }: { request: Request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: { cacheName: "speak30-pages" },
            },
            {
              // Same-origin hashed build assets: cache-first is safe
              urlPattern: ({ url }: { url: URL }) =>
                url.origin === self.location.origin && url.pathname.startsWith("/assets/"),
              handler: "CacheFirst",
              options: { cacheName: "speak30-assets" },
            },
            {
              // Other same-origin files (unhashed): serve cached, refresh in the background
              urlPattern: ({ url, request }: { url: URL; request: Request }) =>
                url.origin === self.location.origin && request.destination !== "document",
              handler: "StaleWhileRevalidate",
              options: { cacheName: "speak30-static" },
            },
          ],
        },
      }),
    ],
  },
});
