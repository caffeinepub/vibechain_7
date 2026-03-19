declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let player: any = null;
let isReady = false;
let pendingVideoId: string | null = null;
let onStateChangeCb: ((state: number) => void) | null = null;

export function initYouTubePlayer(
  onStateChange: (state: number) => void,
): void {
  onStateChangeCb = onStateChange;

  if (document.getElementById("yt-player")) return;

  const div = document.createElement("div");
  div.id = "yt-player";
  div.style.position = "fixed";
  div.style.left = "-9999px";
  div.style.top = "0";
  div.style.width = "1px";
  div.style.height = "1px";
  document.body.appendChild(div);

  window.onYouTubeIframeAPIReady = () => {
    player = new window.YT.Player("yt-player", {
      height: "1",
      width: "1",
      playerVars: { autoplay: 1, controls: 0 },
      events: {
        onReady: () => {
          isReady = true;
          if (pendingVideoId) {
            player.loadVideoById(pendingVideoId);
            pendingVideoId = null;
          }
        },
        onStateChange: (event: any) => {
          onStateChangeCb?.(event.data);
        },
      },
    });
  };

  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
}

export function loadVideo(videoId: string): void {
  if (isReady && player) {
    player.loadVideoById(videoId);
  } else {
    pendingVideoId = videoId;
  }
}

export function ytPlay(): void {
  player?.playVideo();
}

export function ytPause(): void {
  player?.pauseVideo();
}

export function ytSeek(seconds: number): void {
  player?.seekTo(seconds, true);
}

export function ytSetVolume(vol: number): void {
  player?.setVolume(Math.round(vol * 100));
}

export function ytGetCurrentTime(): number {
  return player?.getCurrentTime() ?? 0;
}

export function ytGetDuration(): number {
  return player?.getDuration() ?? 0;
}
