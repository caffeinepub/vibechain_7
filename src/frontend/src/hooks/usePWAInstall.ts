import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Singleton deferred prompt shared across all hook instances
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let listeners: Array<(prompt: BeforeInstallPromptEvent | null) => void> = [];

function notifyListeners() {
  for (const l of listeners) l(deferredPrompt);
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notifyListeners();
  });
}

export function usePWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(
    deferredPrompt,
  );

  useEffect(() => {
    const listener = (p: BeforeInstallPromptEvent | null) => setPrompt(p);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const triggerInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    deferredPrompt = null;
    notifyListeners();
  };

  return { canInstall: !!prompt, triggerInstall };
}
