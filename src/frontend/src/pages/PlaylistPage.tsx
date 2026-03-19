import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ListMusic, Play, Shuffle, Trash2 } from "lucide-react";
import { useActor } from "../hooks/useActor";
import { formatDuration } from "../lib/youtube";
import { useNavStore } from "../store/navStore";
import { usePlayerStore } from "../store/playerStore";

export default function PlaylistPage() {
  const { actor } = useActor();
  const navigate = useNavStore((s) => s.navigate);
  const playlistId = useNavStore((s) => s.playlistId);
  const { playSong, toggleShuffle } = usePlayerStore();
  const queryClient = useQueryClient();

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", actor],
    queryFn: async () => (actor ? actor.getUserPlaylists() : []),
    enabled: !!actor,
  });

  const playlist = playlists.find((p) => p.id === playlistId);

  const removeSongMutation = useMutation({
    mutationFn: async (songId: string) => {
      if (!actor || !playlistId) return;
      await actor.removeSongFromPlaylist(playlistId, songId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["playlists"] }),
  });

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <p className="text-zinc-400">Playlist not found</p>
        <button
          type="button"
          onClick={() => navigate("library")}
          className="text-red-400 hover:text-red-300"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const songs = playlist.songs;

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => navigate("library")}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Library
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-red-800 to-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
          {songs.length > 0 ? (
            <img
              src={songs[0].thumbnailUrl}
              alt=""
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <ListMusic size={36} className="text-red-400" />
          )}
        </div>
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
            Playlist
          </p>
          <h1 className="text-2xl font-bold">{playlist.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {songs.length} song{songs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {songs.length > 0 && (
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => playSong(songs[0], songs)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
          >
            <Play size={16} fill="white" />
            Play All
          </button>
          <button
            type="button"
            onClick={() => {
              toggleShuffle();
              playSong(songs[Math.floor(Math.random() * songs.length)], songs);
            }}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
          >
            <Shuffle size={16} />
            Shuffle
          </button>
        </div>
      )}

      {songs.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <ListMusic size={48} className="mx-auto mb-4 opacity-30" />
          <p>No songs in this playlist yet</p>
          <p className="text-sm mt-1">Browse music and add songs here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {songs.map((song, i) => (
            <div
              key={song.id}
              className="relative flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-lg group"
            >
              <button
                type="button"
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
                onClick={() => playSong(song, songs)}
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
                <div className="min-w-0">
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
              <button
                type="button"
                onClick={() => removeSongMutation.mutate(song.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
