// Chrome fires `beforeinstallprompt` once, shortly after the app shell loads.
// Capturing it in main.tsx (before any route mounts) means the Settings page
// can still trigger the real install/download flow even if opened later.
export const PWA_PROMPT_EVENT = "timebud:pwa-prompt";

export const captureInstallPrompt = (event: Event) => {
  event.preventDefault();
  window.deferredPrompt = event as BeforeInstallPromptEvent;
  window.dispatchEvent(new Event(PWA_PROMPT_EVENT));
};

export const clearInstallPrompt = () => {
  window.deferredPrompt = undefined;
  window.dispatchEvent(new Event(PWA_PROMPT_EVENT));
};

export const getInstallPrompt = () => window.deferredPrompt ?? null;
