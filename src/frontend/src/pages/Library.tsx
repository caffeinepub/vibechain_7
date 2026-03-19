import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Heart,
  ListMusic,
  Lock,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { formatDuration } from "../lib/youtube";
import { useNavStore } from "../store/navStore";
import { usePlayerStore } from "../store/playerStore";

type Tab = "liked" | "playlists" | "recent";

export default function Library() {
  const [tab, setTab] = useState<Tab>("liked");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { actor } = useActor();
  const { identity, login } = useInternetIdentity();
  const navigate = useNavStore((s) => s.navigate);
  const playSong = usePlayerStore((s) => s.playSong);
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: likedSongs = [] } = useQuery({
    queryKey: ["likedSongs", actor],
    queryFn: async () => (actor ? actor.getLikedSongs() : []),
    enabled: !!actor && isAuthenticated,
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", actor],
    queryFn: async () => (actor ? actor.getUserPlaylists() : []),
    enabled: !!actor && isAuthenticated,
  });

  const { data: recentlyPlayed = [] } = useQuery({
    queryKey: ["recent", actor],
    queryFn: async () => (actor ? actor.getRecentlyPlayed() : []),
    enabled: !!actor && isAuthenticated,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!actor) return;
      const id = crypto.randomUUID();
      await actor.createOrUpdatePlaylist(id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setNewPlaylistName("");
      setShowCreate(false);
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) return;
      await actor.deletePlaylist(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["playlists"] }),
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4 px-4">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
          <Lock size={28} className="text-zinc-400" />
        </div>
        <h2 className="text-xl font-semibold">
          Sign in to access your library
        </h2>
        <p className="text-zinc-400 text-sm text-center">
          Save songs, create playlists, and track your listening history.
        </p>
        <button
          type="button"
          onClick={login}
          className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-medium transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Library</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { id: "liked", label: "Liked Songs", icon: Heart },
            { id: "playlists", label: "Playlists", icon: ListMusic },
            { id: "recent", label: "Recent", icon: Clock },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === id
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Liked Songs */}
      {tab === "liked" && (
        <div className="space-y-1">
          {likedSongs.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Heart size={48} className="mx-auto mb-4 opacity-30" />
              <p>No liked songs yet</p>
              <p className="text-sm mt-1">Like songs to see them here</p>
            </div>
          ) : (
            likedSongs.map((song, i) => (
              <button
                type="button"
                key={song.id}
                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-lg text-left group"
                onClick={() => playSong(song, likedSongs)}
              >
                <span className="text-sm text-zinc-500 w-5 text-center group-hover:hidden">
                  {i + 1}
                </span>
                <Play
                  size={14}
                  className="text-white hidden group-hover:block w-5"
                />
                <img
                  src={song.thumbnailUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs text-zinc-400 truncate">
                    {song.artist}
                  </p>
                </div>
                {song.duration > 0n && (
                  <span className="text-xs text-zinc-500">
                    {formatDuration(song.duration)}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Playlists */}
      {tab === "playlists" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">
              {playlists.length} playlists
            </span>
            <button
              type="button"
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1.5 rounded-full transition-colors"
            >
              <Plus size={14} />
              New Playlist
            </button>
          </div>

          {showCreate && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newPlaylistName.trim()) {
                    createPlaylistMutation.mutate(newPlaylistName.trim());
                  }
                }}
                className="flex-1 bg-zinc-800 text-white placeholder-zinc-400 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="button"
                onClick={() => {
                  if (newPlaylistName.trim()) {
                    createPlaylistMutation.mutate(newPlaylistName.trim());
                  }
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Create
              </button>
            </div>
          )}

          <div className="space-y-2">
            {playlists.length === 0 ? (
              <div className="text-center py-16 text-zinc-400">
                <ListMusic size={48} className="mx-auto mb-4 opacity-30" />
                <p>No playlists yet</p>
                <p className="text-sm mt-1">Create a playlist to get started</p>
              </div>
            ) : (
              playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="relative flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-lg group"
                >
                  <button
                    type="button"
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    onClick={() => navigate("playlist", { playlistId: pl.id })}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-red-800 to-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ListMusic size={18} className="text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{pl.name}</p>
                      <p className="text-xs text-zinc-400">
                        {pl.songs.length} song{pl.songs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePlaylistMutation.mutate(pl.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Recently Played */}
      {tab === "recent" && (
        <div className="space-y-1">
          {recentlyPlayed.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Clock size={48} className="mx-auto mb-4 opacity-30" />
              <p>No listening history yet</p>
              <p className="text-sm mt-1">Play some music to see it here</p>
            </div>
          ) : (
            recentlyPlayed.map((song, i) => (
              <button
                type="button"
                key={`${song.id}-${i}`}
                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-lg text-left group"
                onClick={() => playSong(song, recentlyPlayed)}
              >
                <img
                  src={song.thumbnailUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs text-zinc-400 truncate">
                    {song.artist}
                  </p>
                </div>
                <Play
                  size={14}
                  className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
