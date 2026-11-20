import { useEffect, useState } from "react";
import {
  clearInstallPrompt,
  getInstallPrompt,
  PWA_PROMPT_EVENT,
} from "../lib/pwa";

export const usePWAInstall = () => {
  const [showInstall, setShowInstall] = useState(() => Boolean(getInstallPrompt()));

  useEffect(() => {
    const sync = () => setShowInstall(Boolean(getInstallPrompt()));
    sync();
    window.addEventListener(PWA_PROMPT_EVENT, sync);
    return () => window.removeEventListener(PWA_PROMPT_EVENT, sync);
  }, []);

  const installPWA = async () => {
    const prompt = getInstallPrompt();
    if (!prompt) return false;

    await prompt.prompt();
    await prompt.userChoice;
    clearInstallPrompt();
    return true;
  };

  return { showInstall, installPWA };
};
