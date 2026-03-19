import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Song = {
    id : Text;
    title : Text;
    artist : Text;
    thumbnailUrl : Text;
    duration : Nat; // seconds
  };

  type Playlist = {
    id : Text;
    name : Text;
    songs : [Song];
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userLikedSongs = Map.empty<Principal, List.List<Song>>();
  let userPlaylists = Map.empty<Principal, Map.Map<Text, Playlist>>();
  let userRecentlyPlayed = Map.empty<Principal, List.List<Song>>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Like/unlike song
  public shared ({ caller }) func toggleLikeSong(song : Song) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like songs");
    };
    // If song already liked, remove it; otherwise, add to liked songs.
    let likedSongsList = switch (userLikedSongs.get(caller)) {
      case (null) {
        let newList = List.empty<Song>();
        newList.add(song);
        userLikedSongs.add(caller, newList);
        return true;
      };
      case (?list) {
        let exists = list.any(func(s) { s.id == song.id });
        if (exists) {
          let filtered = list.filter(func(s) { s.id != song.id });
          userLikedSongs.add(caller, filtered);
          return false;
        } else {
          list.add(song);
          return true;
        };
      };
    };
    true;
  };

  // Get all liked songs for user
  public query ({ caller }) func getLikedSongs() : async [Song] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access liked songs");
    };
    switch (userLikedSongs.get(caller)) {
      case (null) { [] };
      case (?songs) { songs.toArray() };
    };
  };

  // Record recently played song
  public shared ({ caller }) func recordRecentlyPlayed(song : Song) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record recently played");
    };
    let recentlyPlayed = switch (userRecentlyPlayed.get(caller)) {
      case (null) {
        let newList = List.empty<Song>();
        newList.add(song);
        userRecentlyPlayed.add(caller, newList);
        ?newList;
      };
      case (?list) { ?list };
    };
    switch (recentlyPlayed) {
      case (null) {};
      case (?list) {
        let filtered = list.filter(func(s) { s.id != song.id });
        filtered.add(song);
        let finalList = if (filtered.size() > 50) {
          let iter = filtered.values();
          let limited = List.empty<Song>();
          var count = 0;
          for (elem in iter) {
            if (count < 50) {
              limited.add(elem);
              count += 1;
            };
          };
          limited;
        } else {
          filtered;
        };
        userRecentlyPlayed.add(caller, finalList);
      };
    };
  };

  // Playlists management
  public shared ({ caller }) func createOrUpdatePlaylist(id : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage playlists");
    };
    let existingUserPlaylists = switch (userPlaylists.get(caller)) {
      case (null) { Map.empty<Text, Playlist>() };
      case (?p) { p };
    };
    let newPlaylist = {
      id;
      name;
      songs = [];
    };
    existingUserPlaylists.add(id, newPlaylist);
    userPlaylists.add(caller, existingUserPlaylists);
  };

  public shared ({ caller }) func deletePlaylist(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete playlists");
    };
    switch (userPlaylists.get(caller)) {
      case (null) { Runtime.trap("Playlist not found") };
      case (?playlists) {
        if (not playlists.containsKey(id)) { Runtime.trap("Playlist not found") };
        playlists.remove(id);
        userPlaylists.add(caller, playlists);
      };
    };
  };

  public shared ({ caller }) func addSongToPlaylist(playlistId : Text, song : Song) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify playlists");
    };
    switch (userPlaylists.get(caller)) {
      case (null) { Runtime.trap("Playlist not found") };
      case (?playlists) {
        if (not playlists.containsKey(playlistId)) { Runtime.trap("Playlist not found") };
        switch (playlists.get(playlistId)) {
          case (null) { Runtime.trap("Playlist not found") };
          case (?playlist) {
            let newSongs = List.fromArray<Song>(playlist.songs);
            newSongs.add(song);
            let updatedPlaylist = {
              id = playlist.id;
              name = playlist.name;
              songs = newSongs.toArray();
            };
            playlists.add(playlistId, updatedPlaylist);
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeSongFromPlaylist(playlistId : Text, songId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify playlists");
    };
    switch (userPlaylists.get(caller)) {
      case (null) { Runtime.trap("Playlist not found") };
      case (?playlists) {
        if (not playlists.containsKey(playlistId)) { Runtime.trap("Playlist not found") };
        switch (playlists.get(playlistId)) {
          case (null) { Runtime.trap("Playlist not found") };
          case (?playlist) {
            let filteredSongs = List.fromArray<Song>(playlist.songs).filter(func(s) { s.id != songId });
            let updatedPlaylist = {
              id = playlist.id;
              name = playlist.name;
              songs = filteredSongs.toArray();
            };
            playlists.add(playlistId, updatedPlaylist);
          };
        };
      };
    };
  };

  public query ({ caller }) func getUserPlaylists() : async [Playlist] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access playlists");
    };
    switch (userPlaylists.get(caller)) {
      case (null) { [] };
      case (?playlistsMap) {
        playlistsMap.values().toArray();
      };
    };
  };

  // Get recently played songs
  public query ({ caller }) func getRecentlyPlayed() : async [Song] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access recently played");
    };
    switch (userRecentlyPlayed.get(caller)) {
      case (null) { [] };
      case (?songs) { songs.toArray() };
    };
  };
};
