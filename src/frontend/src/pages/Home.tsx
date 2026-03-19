import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronRight, Play } from "lucide-react";
import MoodDetector from "../components/MoodDetector";
import SongCard from "../components/SongCard";
import { getTrending, searchVideos } from "../lib/youtube";
import { useNavStore } from "../store/navStore";
import { usePlayerStore } from "../store/playerStore";

const MOODS = [
  {
    name: "Workout",
    query: "workout gym music 2024",
    gradient: "from-orange-600 to-red-700",
    emoji: "💪",
  },
  {
    name: "Chill",
    query: "chill lofi beats study",
    gradient: "from-blue-600 to-cyan-700",
    emoji: "😌",
  },
  {
    name: "Focus",
    query: "focus concentration music",
    gradient: "from-indigo-600 to-purple-700",
    emoji: "🎯",
  },
  {
    name: "Party",
    query: "party dance hits 2024",
    gradient: "from-pink-600 to-rose-700",
    emoji: "🎉",
  },
  {
    name: "Sleep",
    query: "sleep relaxing calm music",
    gradient: "from-blue-900 to-indigo-900",
    emoji: "😴",
  },
  {
    name: "Romance",
    query: "romantic love songs",
    gradient: "from-rose-600 to-pink-700",
    emoji: "❤️",
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function ApiErrorBanner({ message }: { message: string }) {
  return (
    <div
      data-ocid="api.error_state"
      className="flex items-start gap-2 bg-red-950/60 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm"
    >
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span>
        Could not load music: {message}. Check your API key or try again later.
      </span>
    </div>
  );
}

export default function Home() {
  const navigate = useNavStore((s) => s.navigate);
  const playSong = usePlayerStore((s) => s.playSong);

  const {
    data: trending = [],
    isLoading: trendingLoading,
    isError: trendingError,
    error: trendingErr,
  } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: newReleases = [],
    isLoading: newLoading,
    isError: newError,
    error: newErr,
  } = useQuery({
    queryKey: ["newReleases"],
    queryFn: () => searchVideos("new music releases 2024"),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="px-4 py-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{getGreeting()}</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Discover your next favorite track
        </p>
      </div>

      {/* AI Mood Detector */}
      <MoodDetector />

      {/* Mood Playlists */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Mood & Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOODS.map((mood) => (
            <button
              type="button"
              key={mood.name}
              onClick={() => navigate("search", { searchQuery: mood.query })}
              className={`bg-gradient-to-br ${mood.gradient} rounded-xl p-4 text-left hover:scale-105 transition-transform duration-200`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <p className="mt-2 font-semibold text-sm">{mood.name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Trending Now</h2>
          <button
            type="button"
            onClick={() => navigate("explore")}
            className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>
        {trendingError ? (
          <ApiErrorBanner
            message={(trendingErr as Error)?.message ?? "Unknown error"}
          />
        ) : trendingLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => `s${i}`).map((key) => (
              <div
                key={key}
                className="bg-zinc-800 rounded-xl aspect-video animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {trending.slice(0, 10).map((song) => (
              <SongCard key={song.id} song={song} songs={trending} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Play Banner */}
      {trending.length > 0 && (
        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-900 to-zinc-900">
          <div className="absolute inset-0">
            <img
              src={trending[0].thumbnailUrl}
              alt=""
              className="w-full h-full object-cover opacity-20 blur-sm"
            />
          </div>
          <div className="relative p-6 flex items-center gap-4">
            <img
              src={trending[0].thumbnailUrl}
              alt={trending[0].title}
              className="w-20 h-20 rounded-lg object-cover shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-400 font-medium mb-1">
                #1 TRENDING
              </p>
              <h3 className="font-bold text-lg truncate">
                {trending[0].title}
              </h3>
              <p className="text-zinc-400 text-sm truncate">
                {trending[0].artist}
              </p>
            </div>
            <button
              type="button"
              onClick={() => playSong(trending[0], trending)}
              className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Play size={20} fill="white" className="text-white ml-0.5" />
            </button>
          </div>
        </section>
      )}

      {/* New Releases */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">New Releases</h2>
          <button
            type="button"
            onClick={() =>
              navigate("search", { searchQuery: "new music 2024" })
            }
            className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>
        {newError ? (
          <ApiErrorBanner
            message={(newErr as Error)?.message ?? "Unknown error"}
          />
        ) : newLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => `s${i}`).map((key) => (
              <div
                key={key}
                className="bg-zinc-800 rounded-xl aspect-video animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {newReleases.slice(0, 10).map((song) => (
              <SongCard key={song.id} song={song} songs={newReleases} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
