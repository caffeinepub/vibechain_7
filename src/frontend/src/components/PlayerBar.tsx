import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronUp,
  Heart,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useActor } from "../hooks/useActor";
import { formatSecondsDisplay } from "../lib/youtube";
import { useNavStore } from "../store/navStore";
import { usePlayerStore } from "../store/playerStore";

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();
  const navigate = useNavStore((s) => s.navigate);
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: likedSongs = [] } = useQuery({
    queryKey: ["likedSongs", actor],
    queryFn: async () => (actor ? actor.getLikedSongs() : []),
    enabled: !!actor,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !currentSong) return;
      await actor.toggleLikeSong({
        id: currentSong.id,
        title: currentSong.title,
        artist: currentSong.artist,
        thumbnailUrl: currentSong.thumbnailUrl,
        duration: currentSong.duration,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedSongs"] });
    },
  });

  if (!currentSong) return null;

  const isLiked = likedSongs.some((s) => s.id === currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800 px-3 py-2">
      {/* Progress bar */}
      <button
        type="button"
        aria-label="Seek"
        className="w-full h-3 flex items-center mb-1 cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div className="w-full h-1 bg-zinc-700 rounded-full">
          <div
            className="h-full bg-red-500 rounded-full group-hover:bg-red-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </button>

      <div className="flex items-center gap-3">
        {/* Song info */}
        <button
          type="button"
          onClick={() => navigate("nowplaying")}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <img
            src={currentSong.thumbnailUrl}
            alt={currentSong.title}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium truncate">{currentSong.title}</p>
            <p className="text-xs text-zinc-400 truncate">
              {currentSong.artist}
            </p>
          </div>
          <ChevronUp size={16} className="text-zinc-400 flex-shrink-0" />
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors ${
              isShuffle ? "text-red-500" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Shuffle size={16} />
          </button>
          <button
            type="button"
            onClick={prevSong}
            className="p-1.5 text-zinc-300 hover:text-white transition-colors"
          >
            <SkipBack size={18} />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black hover:bg-zinc-200 transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            type="button"
            onClick={nextSong}
            className="p-1.5 text-zinc-300 hover:text-white transition-colors"
          >
            <SkipForward size={18} />
          </button>
          <button
            type="button"
            onClick={toggleRepeat}
            className={`p-1.5 rounded-full transition-colors ${
              repeatMode !== "none"
                ? "text-red-500"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {repeatMode === "one" ? (
              <Repeat1 size={16} />
            ) : (
              <Repeat size={16} />
            )}
          </button>
        </div>

        {/* Right controls */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-zinc-400 w-16 text-right">
            {formatSecondsDisplay(currentTime)} /{" "}
            {formatSecondsDisplay(duration)}
          </span>
          <button
            type="button"
            onClick={() => actor && likeMutation.mutate()}
            className={`p-1.5 transition-colors ${
              isLiked ? "text-red-500" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <Volume2 size={16} className="text-zinc-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
            className="w-20 accent-red-500"
          />
        </div>
      </div>
    </div>
  );
}
