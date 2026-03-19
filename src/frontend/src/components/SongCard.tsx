import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, ListMusic, MoreVertical, Play, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { formatDuration } from "../lib/youtube";
import { type Song, usePlayerStore } from "../store/playerStore";

interface Props {
  song: Song;
  songs?: Song[];
  index?: number;
}

export default function SongCard({ song, songs, index }: Props) {
  const { playSong, addToQueue } = usePlayerStore();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: likedSongs = [] } = useQuery({
    queryKey: ["likedSongs", actor],
    queryFn: async () => (actor ? actor.getLikedSongs() : []),
    enabled: !!actor,
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", actor],
    queryFn: async () => (actor ? actor.getUserPlaylists() : []),
    enabled: !!actor,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.toggleLikeSong(song);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["likedSongs"] }),
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!actor) return;
      await actor.addSongToPlaylist(playlistId, song);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["playlists"] }),
  });

  const recordPlayMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.recordRecentlyPlayed(song);
    },
  });

  const isLiked = likedSongs.some((s) => s.id === song.id);

  const handlePlay = () => {
    playSong(song, songs);
    recordPlayMutation.mutate();
  };

  return (
    <div className="group relative bg-zinc-900 hover:bg-zinc-800 rounded-xl overflow-hidden transition-all duration-200">
      <button type="button" className="w-full text-left" onClick={handlePlay}>
        <div className="relative aspect-video">
          <img
            src={song.thumbnailUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Play size={20} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
          {song.duration > 0n && (
            <span className="absolute bottom-1 right-1 bg-black/70 text-xs px-1 rounded">
              {formatDuration(song.duration)}
            </span>
          )}
        </div>
        <div className="p-2 pr-1">
          <p className="text-sm font-medium truncate leading-tight">
            {song.title}
          </p>
          <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
        </div>
      </button>

      {/* Menu button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="absolute bottom-2 right-1 p-1 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical size={14} />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-1 bottom-full mb-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 min-w-40 py-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              addToQueue(song);
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-700 transition-colors"
          >
            <ListMusic size={14} />
            Add to queue
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              likeMutation.mutate();
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-700 transition-colors"
          >
            <Heart
              size={14}
              fill={isLiked ? "currentColor" : "none"}
              className={isLiked ? "text-red-500" : ""}
            />
            {isLiked ? "Unlike" : "Like"}
          </button>
          {playlists.length > 0 && (
            <>
              <div className="border-t border-zinc-700 my-1" />
              <p className="px-3 py-1 text-xs text-zinc-500">Add to playlist</p>
              {playlists.map((pl) => (
                <button
                  type="button"
                  role="menuitem"
                  key={pl.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToPlaylistMutation.mutate(pl.id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-700 transition-colors"
                >
                  <PlusCircle size={12} />
                  {pl.name}
                </button>
              ))}
            </>
          )}
          {index !== undefined && (
            <>
              <div className="border-t border-zinc-700 my-1" />
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
