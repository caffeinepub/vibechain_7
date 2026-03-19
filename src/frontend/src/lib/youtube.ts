const API_KEY = "AIzaSyDpNw9tt9wak6-hlZhM2KeBHCVpcQHhpvQ";
const BASE = "https://www.googleapis.com/youtube/v3";

export interface YTSong {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: bigint;
}

export async function searchVideos(query: string): Promise<YTSong[]> {
  const res = await fetch(
    `${BASE}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=20&key=${API_KEY}`,
  );
  const data = await res.json();
  if (data.error) {
    throw new Error(
      `YouTube API error ${data.error.code}: ${data.error.message}`,
    );
  }
  if (!data.items) return [];
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnailUrl:
      item.snippet.thumbnails.high?.url ||
      item.snippet.thumbnails.medium?.url ||
      item.snippet.thumbnails.default?.url,
    duration: 0n,
  }));
}

export async function getTrending(): Promise<YTSong[]> {
  const res = await fetch(
    `${BASE}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=20&regionCode=US&key=${API_KEY}`,
  );
  const data = await res.json();
  if (data.error) {
    throw new Error(
      `YouTube API error ${data.error.code}: ${data.error.message}`,
    );
  }
  if (!data.items) return [];
  return data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnailUrl:
      item.snippet.thumbnails.high?.url ||
      item.snippet.thumbnails.medium?.url ||
      item.snippet.thumbnails.default?.url,
    duration: parseISO8601(item.contentDetails?.duration || "PT0S"),
  }));
}

function parseISO8601(duration: string): bigint {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0n;
  const h = Number.parseInt(match[1] || "0");
  const m = Number.parseInt(match[2] || "0");
  const s = Number.parseInt(match[3] || "0");
  return BigInt(h * 3600 + m * 60 + s);
}

export function formatDuration(seconds: bigint): string {
  const s = Number(seconds);
  if (s === 0) return "";
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export function formatSecondsDisplay(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
