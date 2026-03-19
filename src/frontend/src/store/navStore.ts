import { create } from "zustand";

export type Page =
  | "home"
  | "explore"
  | "search"
  | "library"
  | "nowplaying"
  | "playlist";

interface NavState {
  page: Page;
  playlistId: string | null;
  searchQuery: string;
  navigate: (
    page: Page,
    params?: { playlistId?: string; searchQuery?: string },
  ) => void;
}

export const useNavStore = create<NavState>((set) => ({
  page: "home",
  playlistId: null,
  searchQuery: "",
  navigate: (page, params) =>
    set({
      page,
      playlistId: params?.playlistId ?? null,
      searchQuery: params?.searchQuery ?? "",
    }),
}));
