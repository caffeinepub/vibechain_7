import { Download, LogIn, LogOut, Music2, Search, User } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { useNavStore } from "../store/navStore";

export default function TopBar() {
  const { identity, login, clear } = useInternetIdentity();
  const navigate = useNavStore((s) => s.navigate);
  const [query, setQuery] = useState("");
  const { canInstall, triggerInstall } = usePWAInstall();
  const isAuthenticated = !!identity;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate("search", { searchQuery: query.trim() });
    }
  };

  const handleSignOut = () => {
    clear();
    localStorage.removeItem("vibechain_guest");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 flex items-center px-4 gap-3">
      <button
        type="button"
        onClick={() => navigate("home")}
        className="flex items-center gap-2 flex-shrink-0"
        data-ocid="topbar.link"
      >
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
          <Music2 size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">
          Vibe<span className="text-red-500">Chain</span>
        </span>
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-800 text-white placeholder-zinc-400 pl-9 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            data-ocid="topbar.search_input"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 flex-shrink-0">
        {canInstall && (
          <button
            type="button"
            onClick={triggerInstall}
            className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 border border-purple-500/40 hover:border-purple-500/70 text-purple-300 hover:text-purple-200 px-3 py-1.5 rounded-full transition-all duration-150"
            data-ocid="topbar.primary_button"
            title="Install VibeChain app"
          >
            <Download size={13} />
            <span className="hidden sm:block">Install App</span>
          </button>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-zinc-700 rounded-full flex items-center justify-center">
              <User size={14} />
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
              data-ocid="topbar.button"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={login}
            className="flex items-center gap-1 text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full transition-colors"
            data-ocid="topbar.secondary_button"
          >
            <LogIn size={14} />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </header>
  );
}
