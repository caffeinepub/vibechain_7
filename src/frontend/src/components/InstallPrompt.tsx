import { Download, X } from "lucide-react";
import { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";

const DISMISSED_KEY = "vibechain_install_dismissed";

export default function InstallPrompt() {
  const { canInstall, triggerInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(
    () => !!localStorage.getItem(DISMISSED_KEY),
  );

  const handleInstall = async () => {
    await triggerInstall();
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  if (!canInstall || dismissed) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .install-prompt-animate {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div
        data-ocid="install.panel"
        className="install-prompt-animate fixed bottom-20 left-3 right-3 z-50 max-w-sm mx-auto"
      >
        <div className="relative rounded-2xl border border-purple-500/30 bg-zinc-900/95 backdrop-blur-md shadow-2xl shadow-purple-900/40 p-4 flex items-center gap-3">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/10 to-transparent pointer-events-none" />

          <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden ring-1 ring-purple-500/50 shadow-md">
            <img
              src="/icons/icon-192.png"
              alt="VibeChain icon"
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
                const parent = el.parentElement;
                if (parent) {
                  parent.style.background =
                    "linear-gradient(135deg, #7c3aed, #4f46e5)";
                  parent.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:20px">🎵</span>`;
                }
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">
              VibeChain
            </p>
            <p className="text-zinc-400 text-xs mt-0.5 leading-tight">
              Install for the best experience
            </p>
          </div>

          <button
            type="button"
            data-ocid="install.primary_button"
            onClick={handleInstall}
            className="shrink-0 flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors duration-150 shadow-md shadow-purple-900/50"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>

          <button
            type="button"
            data-ocid="install.close_button"
            onClick={handleDismiss}
            className="shrink-0 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors duration-150"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
