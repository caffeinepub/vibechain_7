import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Search as SearchIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import SongCard from "../components/SongCard";
import { searchVideos } from "../lib/youtube";
import { useNavStore } from "../store/navStore";

const SUGGESTIONS = [
  "Trending music 2024",
  "Bollywood hits",
  "Hip hop classics",
  "Chill beats",
  "Rock anthems",
  "K-Pop 2024",
  "Latin vibes",
  "EDM bangers",
];

export default function Search() {
  const navSearchQuery = useNavStore((s) => s.searchQuery);
  const [input, setInput] = useState(navSearchQuery || "");
  const [query, setQuery] = useState(navSearchQuery || "");

  useEffect(() => {
    if (navSearchQuery) {
      setInput(navSearchQuery);
      setQuery(navSearchQuery);
    }
  }, [navSearchQuery]);

  const debouncedSearch = useCallback(() => {
    const timer = setTimeout(() => setQuery(input), 400);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    const cleanup = debouncedSearch();
    return cleanup;
  }, [debouncedSearch]);

  const {
    data: results = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchVideos(query),
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-6">
        <SearchIcon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          data-ocid="search.input"
          type="text"
          placeholder="Search for songs, artists, albums..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-zinc-800 text-white placeholder-zinc-400 pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>

      {/* Suggestions when empty */}
      {!query && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => {
                  setInput(s);
                  setQuery(s);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              {isLoading ? "Searching..." : `Results for "${query}"`}
            </h2>
            {!isLoading && !isError && (
              <span className="text-sm text-zinc-400">
                {results.length} songs
              </span>
            )}
          </div>
          {isError ? (
            <div
              data-ocid="search.error_state"
              className="flex items-start gap-2 bg-red-950/60 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                Could not load music:{" "}
                {(error as Error)?.message ?? "Unknown error"}. Check your API
                key or try again later.
              </span>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }, (_, i) => `s${i}`).map((key) => (
                <div
                  key={key}
                  className="bg-zinc-800 rounded-xl aspect-video animate-pulse"
                />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <SearchIcon size={48} className="mx-auto mb-4 opacity-30" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {results.map((song) => (
                <SongCard key={song.id} song={song} songs={results} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
