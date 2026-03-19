import { create } from "zustand";
import {
  initYouTubePlayer,
  loadVideo,
  ytGetCurrentTime,
  ytGetDuration,
  ytPause,
  ytPlay,
  ytSeek,
  ytSetVolume,
} from "../lib/ytPlayer";

export type RepeatMode = "none" | "one" | "all";

export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: bigint;
}

interface PlayerStore {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;

  initPlayer: () => void;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  _setCurrentTime: (t: number) => void;
  _setDuration: (d: number) => void;
  _setIsPlaying: (v: boolean) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isShuffle: false,
  repeatMode: "none",

  initPlayer: () => {
    initYouTubePlayer((state) => {
      // YT.PlayerState: ENDED=0, PLAYING=1, PAUSED=2
      if (state === 0) {
        get().nextSong();
      } else if (state === 1) {
        get()._setIsPlaying(true);
        get()._setDuration(ytGetDuration());
      } else if (state === 2) {
        get()._setIsPlaying(false);
      }
    });

    setInterval(() => {
      if (get().isPlaying) {
        get()._setCurrentTime(ytGetCurrentTime());
        const dur = ytGetDuration();
        if (dur > 0) get()._setDuration(dur);
      }
    }, 500);
  },

  playSong: (song, newQueue) => {
    const queue = newQueue ?? get().queue;
    const inQueue = queue.some((s) => s.id === song.id);
    set({
      currentSong: song,
      queue: inQueue ? queue : [...queue, song],
      isPlaying: true,
      currentTime: 0,
    });
    loadVideo(song.id);
  },

  togglePlay: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      ytPause();
      set({ isPlaying: false });
    } else {
      ytPlay();
      set({ isPlaying: true });
    }
  },

  nextSong: () => {
    const { queue, currentSong, repeatMode, isShuffle } = get();
    if (!queue.length) return;
    if (repeatMode === "one" && currentSong) {
      loadVideo(currentSong.id);
      return;
    }
    const idx = queue.findIndex((s) => s.id === currentSong?.id);
    let nextIdx: number;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = idx + 1;
      if (nextIdx >= queue.length) {
        if (repeatMode === "all") nextIdx = 0;
        else return;
      }
    }
    const next = queue[nextIdx];
    if (next) {
      set({ currentSong: next, isPlaying: true, currentTime: 0 });
      loadVideo(next.id);
    }
  },

  prevSong: () => {
    const { queue, currentSong, currentTime } = get();
    if (currentTime > 3) {
      ytSeek(0);
      set({ currentTime: 0 });
      return;
    }
    const idx = queue.findIndex((s) => s.id === currentSong?.id);
    const prev = queue[Math.max(0, idx - 1)];
    if (prev) {
      set({ currentSong: prev, isPlaying: true, currentTime: 0 });
      loadVideo(prev.id);
    }
  },

  seek: (time) => {
    ytSeek(time);
    set({ currentTime: time });
  },

  setVolume: (v) => {
    ytSetVolume(v);
    set({ volume: v });
  },

  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

  toggleRepeat: () =>
    set((s) => ({
      repeatMode:
        s.repeatMode === "none"
          ? "one"
          : s.repeatMode === "one"
            ? "all"
            : "none",
    })),

  addToQueue: (song) => set((s) => ({ queue: [...s.queue, song] })),

  removeFromQueue: (index) =>
    set((s) => ({ queue: s.queue.filter((_, i) => i !== index) })),

  _setCurrentTime: (t) => set({ currentTime: t }),
  _setDuration: (d) => set({ duration: d }),
  _setIsPlaying: (v) => set({ isPlaying: v }),
}));
