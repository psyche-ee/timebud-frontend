import { useEffect, useState } from "react";

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => window.deferredPrompt ?? null
  );
  const [showInstall, setShowInstall] = useState(() => Boolean(window.deferredPrompt));

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      const prompt = event as BeforeInstallPromptEvent;
      window.deferredPrompt = prompt;
      setDeferredPrompt(prompt);
      setShowInstall(true);
    };

    const installed = () => {
      window.deferredPrompt = undefined;
      setDeferredPrompt(null);
      setShowInstall(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    window.deferredPrompt = undefined;
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return { showInstall, installPWA };
};
