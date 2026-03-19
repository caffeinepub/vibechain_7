import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, CameraOff, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EMOTION_MUSIC, type Emotion } from "../lib/moodMusic";
import { searchVideos } from "../lib/youtube";
import { usePlayerStore } from "../store/playerStore";

declare const faceapi: any;

type DetectionStatus =
  | "idle"
  | "loading-models"
  | "starting-camera"
  | "detecting"
  | "result"
  | "error"
  | "manual";

const FACEAPI_CDN =
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const MODELS_URL = "https://justadudewhohacks.github.io/face-api.js/models";

function loadFaceApiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).__faceApiLoaded) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${FACEAPI_CDN}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Script load failed")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = FACEAPI_CDN;
    script.async = true;
    script.onload = () => {
      (window as any).__faceApiLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load face-api.js"));
    document.head.appendChild(script);
  });
}

export default function MoodDetector() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion | null>(null);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulatedScores = useRef<Record<Emotion, number>>({
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    surprised: 0,
    neutral: 0,
    disgusted: 0,
  });
  const detectionCount = useRef(0);

  const playSong = usePlayerStore((s) => s.playSong);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }, []);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        cleanup();
        setStatus("idle");
        setStatusMsg("");
        setDetectedEmotion(null);
        setIsLoadingSongs(false);
        detectionCount.current = 0;
        accumulatedScores.current = {
          happy: 0,
          sad: 0,
          angry: 0,
          fearful: 0,
          surprised: 0,
          neutral: 0,
          disgusted: 0,
        };
      }
      setOpen(nextOpen);
    },
    [cleanup],
  );

  const playMood = useCallback(
    async (emotion: Emotion) => {
      setIsLoadingSongs(true);
      const moodData = EMOTION_MUSIC[emotion];
      try {
        const songs = await searchVideos(moodData.query);
        if (songs.length > 0) {
          playSong(songs[0], songs);
        }
      } catch (_e) {
        // silent
      } finally {
        setIsLoadingSongs(false);
      }
    },
    [playSong],
  );

  const selectManualMood = useCallback(
    (emotion: Emotion) => {
      setDetectedEmotion(emotion);
      setStatus("result");
      playMood(emotion);
      setTimeout(() => handleClose(false), 2500);
    },
    [playMood, handleClose],
  );

  const startDetection = useCallback(async () => {
    setStatus("loading-models");
    setStatusMsg("Loading AI models\u2026");

    try {
      await loadFaceApiScript();
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODELS_URL),
      ]);
    } catch (_e) {
      setStatus("error");
      setStatusMsg(
        "Could not load AI models. Please select your mood manually.",
      );
      return;
    }

    setStatus("starting-camera");
    setStatusMsg("Starting camera\u2026");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
    } catch (_e) {
      setStatus("manual");
      setStatusMsg("Camera access denied. Pick your mood:");
      return;
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    setStatus("detecting");
    setStatusMsg("Analyzing your expression\u2026");

    const DETECTION_DURATION_MS = 4000;
    const startTime = Date.now();

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceExpressions();

      // Draw boxes on canvas
      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, resized);
      }

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        for (const e of Object.keys(expressions) as Emotion[]) {
          if (e in accumulatedScores.current) {
            accumulatedScores.current[e] += expressions[e] as number;
          }
        }
        detectionCount.current += 1;
      }

      if (Date.now() - startTime >= DETECTION_DURATION_MS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        cleanup();

        const scores = accumulatedScores.current;
        const topEmotion = (Object.keys(scores) as Emotion[]).reduce((a, b) =>
          scores[a] > scores[b] ? a : b,
        );

        setDetectedEmotion(topEmotion);
        setStatus("result");
        playMood(topEmotion);
        setTimeout(() => handleClose(false), 2500);
      }
    }, 200);
  }, [cleanup, playMood, handleClose]);

  useEffect(() => {
    if (open && status === "idle") {
      startDetection();
    }
  }, [open, status, startDetection]);

  const moodData = detectedEmotion ? EMOTION_MUSIC[detectedEmotion] : null;

  return (
    <>
      <Button
        data-ocid="mood.open_modal_button"
        onClick={() => handleClose(true)}
        className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold rounded-full py-3 h-auto text-base shadow-lg shadow-violet-900/40 transition-all duration-300"
      >
        <Sparkles className="mr-2 h-5 w-5" />✨ Detect My Mood
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          data-ocid="mood.dialog"
          className="bg-zinc-950 border-zinc-800 text-white max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-violet-400" />
              AI Mood Detection
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Camera / Detection View */}
            {(status === "detecting" || status === "starting-camera") && (
              <div className="relative rounded-xl overflow-hidden bg-zinc-900 aspect-video">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ transform: "scaleX(-1)" }}
                />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                    <Camera className="h-3 w-3 text-violet-400" />
                    Reading your expression\u2026
                  </span>
                </div>
              </div>
            )}

            {/* Loading models */}
            {status === "loading-models" && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
                <p className="text-zinc-400 text-sm">{statusMsg}</p>
              </div>
            )}

            {/* Result */}
            <AnimatePresence>
              {status === "result" && moodData && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={`rounded-2xl bg-gradient-to-br ${moodData.color} p-6 text-center`}
                >
                  <div className="text-6xl mb-3">{moodData.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    You're feeling {moodData.label}
                  </h3>
                  <p className="text-white/80 text-sm mb-3">
                    Playing music to match your vibe\u2026
                  </p>
                  {isLoadingSongs && (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-white/60" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {status === "error" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <CameraOff className="h-8 w-8 text-red-400" />
                <p className="text-zinc-400 text-sm text-center">{statusMsg}</p>
              </div>
            )}

            {/* Manual mood picker (fallback or error) */}
            {(status === "manual" || status === "error") && (
              <div>
                <p className="text-zinc-400 text-sm mb-3 text-center">
                  {status === "manual" ? statusMsg : "Pick your mood manually:"}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    Object.entries(EMOTION_MUSIC) as [
                      Emotion,
                      (typeof EMOTION_MUSIC)[Emotion],
                    ][]
                  ).map(([emotion, data]) => (
                    <button
                      key={emotion}
                      type="button"
                      data-ocid={`mood.${emotion}.button`}
                      onClick={() => selectManualMood(emotion)}
                      className={`bg-gradient-to-br ${data.color} rounded-xl p-3 flex flex-col items-center gap-1 hover:scale-105 transition-transform`}
                    >
                      <span className="text-2xl">{data.emoji}</span>
                      <span className="text-white text-xs font-medium">
                        {data.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status text while detecting */}
            {status === "detecting" && (
              <p className="text-center text-zinc-400 text-sm">{statusMsg}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
