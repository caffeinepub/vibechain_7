import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Playlist {
    id: string;
    name: string;
    songs: Array<Song>;
}
export interface UserProfile {
    name: string;
}
export interface Song {
    id: string;
    title: string;
    duration: bigint;
    thumbnailUrl: string;
    artist: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSongToPlaylist(playlistId: string, song: Song): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdatePlaylist(id: string, name: string): Promise<void>;
    deletePlaylist(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLikedSongs(): Promise<Array<Song>>;
    getRecentlyPlayed(): Promise<Array<Song>>;
    getUserPlaylists(): Promise<Array<Playlist>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordRecentlyPlayed(song: Song): Promise<void>;
    removeSongFromPlaylist(playlistId: string, songId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleLikeSong(song: Song): Promise<boolean>;
}
