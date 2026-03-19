export type Emotion =
  | "happy"
  | "sad"
  | "angry"
  | "fearful"
  | "surprised"
  | "neutral"
  | "disgusted";

export const EMOTION_MUSIC: Record<
  Emotion,
  { query: string; label: string; emoji: string; color: string }
> = {
  happy: {
    query: "happy upbeat pop hits 2024",
    label: "Happy",
    emoji: "😄",
    color: "from-yellow-500 to-orange-500",
  },
  sad: {
    query: "sad emotional songs heartbreak",
    label: "Sad",
    emoji: "😢",
    color: "from-blue-600 to-indigo-700",
  },
  angry: {
    query: "intense metal rock angry music",
    label: "Angry",
    emoji: "😠",
    color: "from-red-600 to-red-900",
  },
  fearful: {
    query: "calm soothing anxiety relief music",
    label: "Anxious",
    emoji: "😰",
    color: "from-purple-600 to-violet-700",
  },
  surprised: {
    query: "exciting energetic upbeat music",
    label: "Excited",
    emoji: "😲",
    color: "from-cyan-500 to-blue-600",
  },
  neutral: {
    query: "chill vibes lo-fi focus music",
    label: "Neutral",
    emoji: "😐",
    color: "from-zinc-500 to-zinc-700",
  },
  disgusted: {
    query: "aggressive hip hop rap intensity",
    label: "Intense",
    emoji: "😤",
    color: "from-green-700 to-teal-800",
  },
};
