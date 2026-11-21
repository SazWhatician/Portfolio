"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Music, Disc3 } from "lucide-react";

export const TRACKS = [
  { id: "velvet", title: "Velvet Horizon", src: "/Velvet_Horizon.mp3" },
  { id: "unfolding", title: "The Unfolding Map", src: "/The_Unfolding_Map.mp3" },
];

/**
 * AmbientSound - Audio Controller for Velvet Horizon & Ambient Soundscapes
 * Handles browser autoplay restrictions, smooth volume fading based on scroll progress:
 * - Starts at 40% volume on entry
 * - Smoothly diminishes as user scrolls down to 5% volume at the very last section
 * - Smoothly ramps back up to 40% when scrolling back up
 * - Interactive minimal sound widget with animated pulse and track skipping (double-click)
 */
export default function AmbientSound({ scrollProgress = 0 }) {
  const audioRef = useRef(null);
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [currentVolPercent, setCurrentVolPercent] = useState(40);

  const currentTrack = TRACKS[trackIdx];

  // Compute target volume based on scroll progress:
  // Starts at 0.40 (40%) at scrollProgress = 0, decreases down to 0.05 (5%) at scrollProgress = 1.0
  const computeTargetVolume = (progress) => {
    const p = Math.max(0, Math.min(1, progress));
    return Math.max(0.05, Math.min(0.40, 0.40 - p * 0.35));
  };

  // Initialize Audio
  useEffect(() => {
    if (typeof window === "undefined") return;

    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(TRACKS[0].src);
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;
    }
    window.__ambientAudio = audio;

    const initialTarget = computeTargetVolume(scrollProgress);

    // Attempt initial play
    const tryPlay = () => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setUserInteracted(true);
          // Smooth fade in to initial target
          let v = 0;
          const fadeInterval = setInterval(() => {
            v += 0.05;
            if (v >= initialTarget) {
              if (audioRef.current) audioRef.current.volume = initialTarget;
              clearInterval(fadeInterval);
            } else {
              if (audioRef.current) audioRef.current.volume = v;
            }
          }, 30);
        })
        .catch(() => {
          // Browser blocked autoplay without user gesture
          setIsPlaying(false);
        });
    };

    tryPlay();

    // Fallback on first user gesture (click, scroll, keypress, touch)
    const handleFirstGesture = () => {
      if (audioRef.current) {
        setUserInteracted(true);
        const target = computeTargetVolume(scrollProgress);
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            let v = audioRef.current.volume;
            const fadeInterval = setInterval(() => {
              v += 0.05;
              if (v >= target) {
                if (audioRef.current) audioRef.current.volume = target;
                clearInterval(fadeInterval);
              } else {
                if (audioRef.current) audioRef.current.volume = v;
              }
            }, 30);
          })
          .catch(() => {});
      }
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("wheel", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };

    window.addEventListener("pointerdown", handleFirstGesture, { passive: true });
    window.addEventListener("keydown", handleFirstGesture, { passive: true });
    window.addEventListener("wheel", handleFirstGesture, { passive: true });
    window.addEventListener("touchstart", handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("wheel", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      audio.pause();
    };
  }, []);

  // Update volume based on scrollProgress: 40% at top -> 5% at bottom
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = 0;
      setCurrentVolPercent(0);
      return;
    }

    const targetVolume = computeTargetVolume(scrollProgress);
    setCurrentVolPercent(Math.round(targetVolume * 100));
    audio.volume = targetVolume;

    if (audio.paused && userInteracted && !isMuted) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [scrollProgress, isMuted, userInteracted]);

  // Switch Track (cycle between tracks)
  const switchTrack = () => {
    const nextIdx = (trackIdx + 1) % TRACKS.length;
    setTrackIdx(nextIdx);
    const audio = audioRef.current;
    if (audio) {
      const wasPlaying = !audio.paused && !isMuted;
      audio.src = TRACKS[nextIdx].src;
      audio.currentTime = 0;
      if (wasPlaying || userInteracted) {
        const target = computeTargetVolume(scrollProgress);
        audio.volume = target;
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsMuted(false);
          })
          .catch(() => {});
      }
    }
  };

  // Toggle Mute / Play manually
  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetVolume = computeTargetVolume(scrollProgress);

    if (!userInteracted) {
      setUserInteracted(true);
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          audio.volume = targetVolume;
        })
        .catch(() => {});
      return;
    }

    if (isMuted || audio.paused) {
      setIsMuted(false);
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          audio.volume = targetVolume;
        })
        .catch(() => {});
    } else {
      setIsMuted(true);
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <aside
      aria-label="Sound control widget"
      className="fixed top-5 right-5 md:right-8 z-40 select-none"
    >
      <button
        type="button"
        onClick={toggleSound}
        onDoubleClick={(e) => {
          e.preventDefault();
          switchTrack();
        }}
        className="group relative size-9 sm:size-10 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-900 border border-neutral-200/80 dark:border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        title={
          isPlaying && !isMuted
            ? `${currentTrack.title} (Playing) — Click to Mute · Double-click to switch track`
            : `Play ${currentTrack.title} — Double-click to switch track`
        }
        aria-label="Toggle ambient soundtrack"
      >
        {/* Floating Tooltip badge on hover */}
        <span className="pointer-events-none absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-neutral-950/90 dark:bg-slate-950/95 text-[11px] font-mono text-neutral-200 tracking-wider shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
          <Disc3 className={`size-3 text-amber-400 ${isPlaying && !isMuted ? "animate-spin" : ""}`} />
          <span>{currentTrack.title}</span>
          <span className="text-[9px] opacity-60 ml-0.5">2x click to skip</span>
        </span>

        {isMuted || !isPlaying ? (
          <div className="relative flex items-center justify-center text-neutral-600 dark:text-slate-400">
            <Music className="size-4 opacity-45 transition-transform group-hover:scale-110" />
            <span className="absolute w-4 h-0.5 bg-neutral-400/80 dark:bg-slate-500/80 rotate-45 rounded-full" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center text-neutral-900 dark:text-white">
            <Music className="size-4 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </button>

      {/* Hidden Audio Tag */}
      <audio
        ref={audioRef}
        id="ambientAudio"
        src={currentTrack.src}
        loop
        preload="auto"
      />
    </aside>
  );
}
