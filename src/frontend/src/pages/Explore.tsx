import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import SongCard from "../components/SongCard";
import { getTrending, searchVideos } from "../lib/youtube";
import { useNavStore } from "../store/navStore";

const GENRES = [
  { name: "Pop", query: "pop music hits 2024", color: "bg-pink-700" },
  { name: "Hip-Hop", query: "hip hop rap 2024", color: "bg-yellow-700" },
  { name: "Rock", query: "rock music classic hits", color: "bg-red-800" },
  { name: "Electronic", query: "electronic edm dance", color: "bg-blue-700" },
  { name: "Jazz", query: "jazz smooth music", color: "bg-amber-700" },
  { name: "Classical", query: "classical piano violin", color: "bg-slate-600" },
  { name: "R&B", query: "rnb soul music 2024", color: "bg-purple-700" },
  { name: "K-Pop", query: "kpop music 2024", color: "bg-rose-700" },
  { name: "Latin", query: "latin music reggaeton", color: "bg-orange-700" },
  { name: "Country", query: "country music hits", color: "bg-lime-700" },
  { name: "Indie", query: "indie alternative music", color: "bg-teal-700" },
  { name: "Metal", query: "metal rock heavy music", color: "bg-gray-700" },
];

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

export default function Explore() {
  const navigate = useNavStore((s) => s.navigate);

  const {
    data: trending = [],
    isLoading,
    isError: trendingError,
    error: trendingErr,
  } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: topCharts = [],
    isError: chartsError,
    error: chartsErr,
  } = useQuery({
    queryKey: ["topCharts"],
    queryFn: () => searchVideos("top charts music global 2024"),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="px-4 py-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Explore</h1>

      {/* Genres */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Browse by Genre</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {GENRES.map((genre) => (
            <button
              type="button"
              key={genre.name}
              onClick={() => navigate("search", { searchQuery: genre.query })}
              className={`${genre.color} rounded-xl p-4 text-left hover:scale-105 transition-transform duration-200 aspect-square flex items-end`}
            >
              <span className="font-bold text-sm md:text-base">
                {genre.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Trending Charts</h2>
        {trendingError ? (
          <ApiErrorBanner
            message={(trendingErr as Error)?.message ?? "Unknown error"}
          />
        ) : isLoading ? (
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

      {/* Top Charts */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Global Top Charts</h2>
        {chartsError ? (
          <ApiErrorBanner
            message={(chartsErr as Error)?.message ?? "Unknown error"}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {topCharts.slice(0, 10).map((song) => (
              <SongCard key={song.id} song={song} songs={topCharts} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
