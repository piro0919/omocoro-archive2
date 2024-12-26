import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, Serwist, type SerwistGlobalConfig } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// eslint-disable-next-line write-good-comments/write-good-comments
// `injectionPoint` is the string that will be replaced by the
// eslint-disable-next-line write-good-comments/write-good-comments
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  clientsClaim: true,
  navigationPreload: true,
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: defaultCache,
  skipWaiting: true,
});

serwist.addEventListeners();
