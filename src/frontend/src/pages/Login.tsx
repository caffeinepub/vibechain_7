import { Button } from "@/components/ui/button";
import { Loader2, Music2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginProps {
  onGuest: () => void;
}

export default function Login({ onGuest }: LoginProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-sm w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "backOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/40">
              <Music2 size={36} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Vibe<span className="text-red-500">Chain</span>
            </h1>
            <p className="mt-2 text-zinc-400 text-base">
              Your music, your vibe
            </p>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {[
            "🎵 Trending charts",
            "🎭 Mood detection",
            "📚 Playlists",
            "🔍 Search",
          ].map((f) => (
            <span
              key={f}
              className="bg-zinc-800/80 text-zinc-300 text-xs px-3 py-1.5 rounded-full border border-zinc-700/50"
            >
              {f}
            </span>
          ))}
        </motion.div>

        {/* Auth buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col gap-3 w-full"
        >
          <Button
            data-ocid="login.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-red-900/30"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>

          <Button
            data-ocid="login.secondary_button"
            variant="outline"
            onClick={onGuest}
            className="w-full h-12 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl text-sm transition-all duration-200"
          >
            Continue as Guest
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-xs text-zinc-600 max-w-xs"
        >
          Sign in to save your liked songs, playlists, and listening history
          across devices.
        </motion.p>
      </motion.div>
    </div>
  );
}
