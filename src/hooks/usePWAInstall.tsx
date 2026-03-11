import { useEffect, useState } from "react";

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // 1. Check if the event already fired before this component mounted
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      setShowInstall(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      // 2. Store it in state AND globally
      setDeferredPrompt(e);
      window.deferredPrompt = e; 
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return { showInstall, installPWA };
};