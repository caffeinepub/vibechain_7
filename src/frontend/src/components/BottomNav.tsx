import { Compass, Home, Library, Search } from "lucide-react";
import { type Page, useNavStore } from "../store/navStore";

const tabs: { icon: typeof Home; label: string; page: Page }[] = [
  { icon: Home, label: "Home", page: "home" },
  { icon: Compass, label: "Explore", page: "explore" },
  { icon: Search, label: "Search", page: "search" },
  { icon: Library, label: "Library", page: "library" },
];

export default function BottomNav() {
  const { page, navigate } = useNavStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 flex items-center justify-around px-2">
      {tabs.map(({ icon: Icon, label, page: tabPage }) => {
        const active = page === tabPage;
        return (
          <button
            type="button"
            key={tabPage}
            onClick={() => navigate(tabPage)}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
              active ? "text-red-500" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
