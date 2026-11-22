"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";
import { cozyAudio } from "@/lib/cozy-sound";

export function GlassLoader({
  onComplete,
  isModelLoaded = false,
  autoDismissDuration = 7500,
}) {
  const [mounted, setMounted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const isDoneRef = useRef(false);
  const isLogoCompleteRef = useRef(false);
  const isModelReadyRef = useRef(Boolean(isModelLoaded));
  const progressRef = useRef(0);

  const handleDismiss = useCallback(
    (reason = "unknown") => {
      if (isDoneRef.current) return;
      isDoneRef.current = true;
      setIsDone(true);
      if (typeof window !== "undefined") {
        window.__loaderDismissed = true;
        window.__lastDismissReason = reason;
      }
      try {
        cozyAudio.playClose?.();
      } catch {}
      setTimeout(() => {
        onComplete?.();
      }, 750);
    },
    [onComplete]
  );

  // Sync prop changes
  useEffect(() => {
    if (isModelLoaded) {
      isModelReadyRef.current = true;
    }
  }, [isModelLoaded]);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined" && window.__shipSceneLoaded) {
      isModelReadyRef.current = true;
    }

    const handleShipLoaded = () => {
      isModelReadyRef.current = true;
    };
    window.addEventListener("ship-scene:loaded", handleShipLoaded);

    // Initial audio entrance chime
    const chimeTimer = setTimeout(() => {
      try {
        cozyAudio.playEntry?.();
      } catch {}
    }, 320);

    // Manual skip via keydown
    const handleKeyDown = () => {
      handleDismiss("keydown");
    };
    window.addEventListener("keydown", handleKeyDown);

    // Fallback safety timeout so user is never stuck on slow/broken connections
    const fallbackTimer = setTimeout(() => {
      isModelReadyRef.current = true;
      isLogoCompleteRef.current = true;
      handleDismiss("safety-fallback");
    }, autoDismissDuration);

    return () => {
      clearTimeout(chimeTimer);
      clearTimeout(fallbackTimer);
      window.removeEventListener("ship-scene:loaded", handleShipLoaded);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [autoDismissDuration, handleDismiss]);

  // Dynamic progress meter animation loop
  useEffect(() => {
    let animFrame = null;
    let lastTime = performance.now();

    const updateProgress = (now) => {
      if (isDoneRef.current) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const current = progressRef.current;
      const modelReady = isModelReadyRef.current;

      let next = current;

      if (!modelReady) {
        // Meter climbs smoothly towards ~88%-90% and then STAYS/WAITS for 3D figure
        if (current < 65) {
          next = Math.min(65, current + dt * 42);
        } else if (current < 86) {
          next = Math.min(86, current + dt * 18);
        } else if (current < 91) {
          // Slow crawl to stay visually alive without completing
          next = Math.min(91, current + dt * 1.8);
        }
      } else {
        // 3D figure is loaded! Meter surges straight to 100%
        const diff = 100 - current;
        next = Math.min(100, current + Math.max(dt * 96, diff * 0.22));
      }

      progressRef.current = next;
      setProgress(next);

      // Check exit condition:
      // 1. Meter ends at 100% (3D figure loaded!)
      // 2. Logo S has completed its animation regardless of the meter
      if (next >= 99.8 && isLogoCompleteRef.current && !isDoneRef.current) {
        progressRef.current = 100;
        setProgress(100);
        setTimeout(() => {
          handleDismiss("model-and-logo-completed");
        }, 300);
        return;
      }

      animFrame = requestAnimationFrame(updateProgress);
    };

    animFrame = requestAnimationFrame(updateProgress);
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [handleDismiss]);

  // Callback when Logo S animation completes its full cycle
  const handleLogoComplete = useCallback(() => {
    isLogoCompleteRef.current = true;
    // If meter has already reached 100% (because 3D figure finished earlier):
    if (progressRef.current >= 99.8 && !isDoneRef.current) {
      setTimeout(() => {
        handleDismiss("logo-completed-after-meter");
      }, 300);
    }
  }, [handleDismiss]);

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
          style={{ backgroundColor: "#ffffff" }}
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
            {mounted ? (
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
                onComplete={handleLogoComplete}
              />
            ) : (
              <div className="w-full h-full rounded-3xl bg-neutral-50/80 border border-neutral-100 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                <img
                  src="/logo-mark.png"
                  alt="Saswat Mohanty Logo"
                  className="size-32 object-contain opacity-90"
                />
              </div>
            )}

            {/* Typography brand title below glass */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
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
            transition={{ delay: 0.2, duration: 0.5 }}
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
