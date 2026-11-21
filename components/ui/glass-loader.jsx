"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";
import { cozyAudio } from "@/lib/cozy-sound";

export function GlassLoader({ onComplete, autoDismissDuration = 4800 }) {
  const [mounted, setMounted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const isDoneRef = useRef(false);

  const handleDismiss = useCallback((reason = "unknown") => {
    console.log("handleDismiss reason:", reason);
    if (typeof window !== "undefined") window.__lastDismissReason = reason;
    if (isDoneRef.current) return;
    isDoneRef.current = true;
    setIsDone(true);
    try {
      cozyAudio.playClose?.();
    } catch {}
    setTimeout(() => {
      onComplete?.();
    }, 750);
  }, [onComplete]);

  useEffect(() => {
    setMounted(true);

    // Initial audio entrance chime
    const chimeTimer = setTimeout(() => {
      try {
        cozyAudio.playEntry?.();
      } catch {}
    }, 350);

    // Progress bar animation
    const startTime = performance.now();
    let animFrame = null;
    const updateProgress = (now) => {
      if (isDoneRef.current) return;
      const elapsed = now - startTime;
      const p = Math.min(100, (elapsed / (autoDismissDuration - 600)) * 100);
      setProgress(p);
      if (p < 100 && !isDoneRef.current) {
        animFrame = requestAnimationFrame(updateProgress);
      }
    };
    animFrame = requestAnimationFrame(updateProgress);

    // Safety fallback dismiss timer
    const dismissTimer = setTimeout(() => {
      handleDismiss("timer-fallback");
    }, autoDismissDuration);

    const handleKeyDown = () => {
      handleDismiss("keydown");
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(chimeTimer);
      clearTimeout(dismissTimer);
      if (animFrame) cancelAnimationFrame(animFrame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [autoDismissDuration, handleDismiss]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="glass-loader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: "blur(12px)",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          }}
          onClick={() => handleDismiss("user-click")}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-white text-neutral-900 select-none cursor-pointer overflow-hidden p-6 sm:p-10"
        >
          {/* Top header status */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-full flex items-center justify-between text-[11px] font-mono tracking-widest text-neutral-400 uppercase"
          >
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-neutral-900 animate-ping" />
              <span className="text-neutral-900 font-semibold">INITIALIZING EXPERIMENTAL CADENCE</span>
            </div>
            <div className="hidden sm:block">
              <span>PORTFOLIO 2026 // STUDIOS</span>
            </div>
          </motion.div>

          {/* Center Glass Icon Reveal */}
          <div className="relative flex flex-col items-center justify-center w-full max-w-[340px] sm:max-w-[400px] aspect-square">
            <GlassIconReveal
              logo="/logo-mark.png"
              label="Saswat Mohanty"
              look="light"
              background="#ffffff"
              originalColors={true}
              logoColor="#111111"
              logoScale={0.72}
              finalScale={0.75}
              loop={false}
              hold={1.2}
              speed={1.0}
              className="w-full h-full rounded-3xl"
              tuning={{
                startZoom: 2.35,
                dispersion: 1.85,
                colorBleed: 1.35,
                bulge: 1.15,
                specular: 1.25,
                ripple: 1.1,
                response: 0.44,
              }}
              onComplete={() => {
                setTimeout(() => {
                  handleDismiss("reveal-finished");
                }, 1000);
              }}
            />

            {/* Typography brand title below glass */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-12 sm:-bottom-14 flex flex-col items-center text-center pointer-events-none"
            >
              <h1 className="font-['Clash_Display',sans-serif] font-bold text-xl sm:text-2xl tracking-tight text-neutral-900">
                Saswat Mohanty
              </h1>
              <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.28em] text-neutral-400 mt-1">
                Spatial Computing & Interface Architecture
              </p>
            </motion.div>
          </div>

          {/* Bottom Progress Bar & Skip hint */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="w-full max-w-xs flex flex-col items-center gap-2.5 pb-2"
          >
            {/* Minimal Progress Bar */}
            <div className="w-full h-[2px] bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neutral-900 rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full text-[10px] font-mono text-neutral-400">
              <span className="tabular-nums font-semibold text-neutral-700">{Math.round(progress)}%</span>
              <span className="hover:text-neutral-900 transition-colors tracking-wider">
                [ CLICK ANYWHERE TO ENTER ]
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GlassLoader;
