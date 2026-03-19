import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { formatSecondsDisplay } from "../lib/youtube";
import { useNavStore } from "../store/navStore";
import { usePlayerStore } from "../store/playerStore";

export default function NowPlaying() {
  const {
    currentSong,
    queue,
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
    removeFromQueue,
  } = usePlayerStore();
  const navigate = useNavStore((s) => s.navigate);
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [showQueue, setShowQueue] = useState(false);

  const { data: likedSongs = [] } = useQuery({
    queryKey: ["likedSongs", actor],
    queryFn: async () => (actor ? actor.getLikedSongs() : []),
    enabled: !!actor,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !currentSong) return;
      await actor.toggleLikeSong(currentSong);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["likedSongs"] }),
  });

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <p className="text-zinc-400">Nothing playing right now</p>
        <button
          type="button"
          onClick={() => navigate("home")}
          className="text-red-400 hover:text-red-300"
        >
          Discover Music
        </button>
      </div>
    );
  }

  const isLiked = likedSongs.some((s) => s.id === currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Blurred background */}
      <div className="fixed inset-0 overflow-hidden">
        <img
          src={currentSong.thumbnailUrl}
          alt=""
          className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
        />
        <div className="absolute inset-0 bg-zinc-950/60" />
      </div>

      <div className="relative px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <span className="text-sm font-medium text-zinc-300">Now Playing</span>
          <button
            type="button"
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2 transition-colors ${
              showQueue ? "text-red-500" : "text-zinc-400 hover:text-white"
            }`}
          >
            <ListMusic size={22} />
          </button>
        </div>

        {!showQueue ? (
          <>
            {/* Album Art */}
            <div className="mb-8">
              <img
                src={currentSong.thumbnailUrl}
                alt={currentSong.title}
                className="w-full aspect-video rounded-2xl object-cover shadow-2xl"
              />
            </div>

            {/* Song Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">
                  {currentSong.title}
                </h2>
                <p className="text-zinc-400 truncate">{currentSong.artist}</p>
              </div>
              <button
                type="button"
                onClick={() => actor && likeMutation.mutate()}
                className={`p-2 transition-colors flex-shrink-0 ${
                  isLiked ? "text-red-500" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <button
                type="button"
                aria-label="Seek"
                className="w-full h-5 flex items-center mb-1 cursor-pointer group"
                onClick={handleProgressClick}
              >
                <div className="w-full h-1.5 bg-zinc-700 rounded-full">
                  <div
                    className="h-full bg-white rounded-full group-hover:bg-red-400 transition-colors"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{formatSecondsDisplay(currentTime)}</span>
                <span>{formatSecondsDisplay(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`p-2 transition-colors ${
                  isShuffle ? "text-red-500" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Shuffle size={22} />
              </button>
              <button
                type="button"
                onClick={prevSong}
                className="p-2 text-zinc-300 hover:text-white transition-colors"
              >
                <SkipBack size={28} />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:bg-zinc-200 transition-colors shadow-lg"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>
              <button
                type="button"
                onClick={nextSong}
                className="p-2 text-zinc-300 hover:text-white transition-colors"
              >
                <SkipForward size={28} />
              </button>
              <button
                type="button"
                onClick={toggleRepeat}
                className={`p-2 transition-colors ${
                  repeatMode !== "none"
                    ? "text-red-500"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {repeatMode === "one" ? (
                  <Repeat1 size={22} />
                ) : (
                  <Repeat size={22} />
                )}
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <Volume2 size={18} className="text-zinc-400 flex-shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                className="flex-1 accent-red-500"
              />
            </div>
          </>
        ) : (
          /* Queue View */
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Queue ({queue.length})
            </h3>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              {queue.map((song, i) => (
                <div
                  key={`${song.id}-${i}`}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    song.id === currentSong.id
                      ? "bg-zinc-800 border border-red-900"
                      : "hover:bg-zinc-800"
                  }`}
                >
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        song.id === currentSong.id ? "text-red-400" : ""
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                  {song.id !== currentSong.id && (
                    <button
                      type="button"
                      onClick={() => removeFromQueue(i)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
