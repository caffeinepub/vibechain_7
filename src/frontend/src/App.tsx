import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import InstallPrompt from "./components/InstallPrompt";
import PlayerBar from "./components/PlayerBar";
import TopBar from "./components/TopBar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Login from "./pages/Login";
import NowPlaying from "./pages/NowPlaying";
import PlaylistPage from "./pages/PlaylistPage";
import Search from "./pages/Search";
import { useNavStore } from "./store/navStore";
import { usePlayerStore } from "./store/playerStore";

export default function App() {
  const initPlayer = usePlayerStore((s) => s.initPlayer);
  const page = useNavStore((s) => s.page);
  const { identity, isInitializing } = useInternetIdentity();

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem("vibechain_guest") === "true";
  });

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  const handleGuest = () => {
    localStorage.setItem("vibechain_guest", "true");
    setIsGuest(true);
  };

  // Show login page if not authenticated and not a guest
  const isAuthenticated = !!identity;
  const showLogin = !isInitializing && !isAuthenticated && !isGuest;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showLogin) {
    return <Login onGuest={handleGuest} />;
  }

  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home />;
      case "explore":
        return <Explore />;
      case "search":
        return <Search />;
      case "library":
        return <Library />;
      case "nowplaying":
        return <NowPlaying />;
      case "playlist":
        return <PlaylistPage />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-40 pt-14">{renderPage()}</main>
      <PlayerBar />
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
