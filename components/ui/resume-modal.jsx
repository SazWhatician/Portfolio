"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import gsap from "gsap";
import { ArrowDown, ArrowUpRight, X } from "lucide-react";
import { cozyAudio } from "@/lib/cozy-sound";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function ResumeModal({
  isOpen,
  onClose,
  isNight = false,
  pdfUrl = "/Saswat_Kumar_Mohanty_Resume.pdf",
}) {
  const [mounted, setMounted] = useState(false);

  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const horizonRef = useRef(null);
  const frameRef = useRef(null);
  const innerRef = useRef(null);
  const shutterLRef = useRef(null);
  const shutterRRef = useRef(null);
  const seamRef = useRef(null);
  const tlRef = useRef(null);
  const closingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      closingRef.current = false;
      setMounted(true);
      try {
        cozyAudio.playFocus?.();
      } catch { }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;

    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const horizon = horizonRef.current;
    const frame = frameRef.current;
    const inner = innerRef.current;
    const shutterL = shutterLRef.current;
    const shutterR = shutterRRef.current;
    const seam = seamRef.current;
    if (!root || !backdrop || !horizon || !frame || !inner) return;

    tlRef.current?.kill();

    const masks = root.querySelectorAll(".rm-mask-up");
    const hRules = root.querySelectorAll(".rm-h-rule");
    const vRules = root.querySelectorAll(".rm-v-rule");
    const ticks = root.querySelectorAll(".rm-tick");

    if (isOpen) {
      gsap.set(root, { opacity: 1 });
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(horizon, { scaleX: 0, opacity: 1, transformOrigin: "50% 50%" });
      gsap.set(frame, {
        opacity: 0,
        clipPath: "inset(50% 4% 50% 4%)",
        pointerEvents: "none",
      });
      gsap.set(inner, { scale: 1.035 });
      gsap.set(shutterL, { xPercent: 0 });
      gsap.set(shutterR, { xPercent: 0 });
      gsap.set(seam, { scaleY: 0, opacity: 1, transformOrigin: "50% 50%" });
      gsap.set(masks, { yPercent: 115, opacity: 0 });
      gsap.set(hRules, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(vRules, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(ticks, { scale: 0, opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(frame, { clearProps: "clipPath,pointerEvents" });
          gsap.set(inner, { clearProps: "transform" });
        },
      });

      tl.to(backdrop, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0)
        .to(horizon, { scaleX: 1, duration: 0.42, ease: "expo.inOut" }, 0.04)
        .set(frame, { opacity: 1 }, 0.22)
        .to(
          frame,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.78,
            ease: "expo.inOut",
          },
          0.22
        )
        .to(horizon, { opacity: 0, duration: 0.25, ease: "power2.out" }, 0.28)
        .to(inner, { scale: 1, duration: 0.9, ease: "expo.out" }, 0.24)
        .to(
          hRules,
          { scaleX: 1, duration: 0.75, stagger: 0.06, ease: "expo.inOut" },
          0.42
        )
        .to(
          vRules,
          { scaleY: 1, duration: 0.65, stagger: 0.05, ease: "expo.out" },
          0.46
        )
        .to(
          masks,
          { yPercent: 0, opacity: 1, duration: 0.72, stagger: 0.045, ease: "expo.out" },
          0.48
        )
        .to(
          ticks,
          { scale: 1, opacity: 1, duration: 0.45, stagger: 0.03, ease: "back.out(2)" },
          0.54
        )
        .to(seam, { scaleY: 1, duration: 0.4, ease: "expo.out" }, 0.46)
        .to(seam, { opacity: 0, duration: 0.2, ease: "power2.out" }, 0.74)
        .to(shutterL, { xPercent: -101, duration: 0.82, ease: "expo.inOut" }, 0.68)
        .to(shutterR, { xPercent: 101, duration: 0.82, ease: "expo.inOut" }, 0.68);

      tlRef.current = tl;
    } else {
      gsap.set(frame, {
        clipPath: "inset(0% 0% 0% 0%)",
        pointerEvents: "none",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setMounted(false);
        },
      });

      tl.to(shutterL, { xPercent: 0, duration: 0.36, ease: "expo.inOut" }, 0)
        .to(shutterR, { xPercent: 0, duration: 0.36, ease: "expo.inOut" }, 0)
        .to(
          masks,
          { yPercent: 110, opacity: 0, duration: 0.28, stagger: 0.02, ease: "power3.in" },
          0.04
        )
        .to(ticks, { scale: 0, opacity: 0, duration: 0.22, ease: "power2.in" }, 0.06)
        .to(inner, { scale: 1.03, duration: 0.46, ease: "expo.in" }, 0.18)
        .to(
          frame,
          {
            clipPath: "inset(50% 4% 50% 4%)",
            duration: 0.48,
            ease: "expo.inOut",
          },
          0.18
        )
        .fromTo(
          horizon,
          { scaleX: 1, opacity: 0 },
          { opacity: 1, duration: 0.14, ease: "power2.out" },
          0.54
        )
        .set(frame, { opacity: 0 }, 0.64)
        .to(horizon, { scaleX: 0, opacity: 0, duration: 0.28, ease: "expo.in" }, 0.64)
        .to(backdrop, { opacity: 0, duration: 0.36, ease: "power2.inOut" }, 0.56);

      tlRef.current = tl;
    }

    return () => {
      tlRef.current?.kill();
    };
  }, [isOpen, mounted]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    try {
      cozyAudio.playClose?.();
    } catch { }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop?.();

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start?.();
    };
  }, [isOpen, handleClose]);

  if (!mounted) return null;

  const accentBg = isNight ? "bg-indigo-300" : "bg-[#a6864a]";
  const accentText = isNight ? "text-indigo-300" : "text-[#a6864a]";
  const borderCol = isNight ? "border-white/[0.1]" : "border-neutral-900/[0.1]";
  const ruleBg = isNight ? "bg-white/[0.1]" : "bg-neutral-900/[0.1]";
  const shutterBg = isNight ? "bg-[#090d1a]" : "bg-[#f6f3ed]";

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 lg:p-10 pointer-events-auto opacity-0"
    >
      <div
        ref={backdropRef}
        aria-hidden="true"
        onClick={handleClose}
        className={`absolute inset-0 backdrop-blur-lg cursor-pointer ${isNight ? "bg-[#03050c]/82" : "bg-[#141311]/55"
          }`}
      />

      <div
        ref={horizonRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-4 right-4 sm:left-10 sm:right-10 max-w-5xl mx-auto h-px z-30 ${accentBg}`}
      />

      <div
        ref={frameRef}
        className={`relative z-20 w-full max-w-5xl h-[93vh] max-h-[940px] border flex flex-col overflow-hidden ${borderCol} ${isNight
            ? "bg-[#080c18] text-white shadow-[0_32px_100px_rgba(0,0,0,0.8)]"
            : "bg-[#faf8f4] text-neutral-900 shadow-[0_32px_100px_rgba(12,11,9,0.22)]"
          }`}
      >
        <div ref={innerRef} className="flex flex-col w-full h-full will-change-transform">
          <div className="relative shrink-0 flex items-stretch justify-between">
            <div className="flex items-center gap-4 sm:gap-5 px-4 sm:px-7 py-4 min-w-0">
              <div className="overflow-hidden shrink-0">
                <div
                  className={`rm-mask-up size-9 sm:size-10 border flex items-center justify-center font-mono text-[10px] tracking-[0.2em] ${borderCol} ${accentText}`}
                >
                  CV
                </div>
              </div>

              <div className="min-w-0">
                <div className="overflow-hidden">
                  <div className="rm-mask-up flex items-baseline gap-2.5">
                    <span
                      id="resume-modal-title"
                      className={`${cormorant.className} italic text-xl sm:text-2xl font-normal tracking-tight leading-none`}
                    >
                      Saswat
                    </span>
                    <span className="font-['Clash_Display',sans-serif] text-sm sm:text-base font-medium uppercase tracking-[0.14em] leading-none truncate">
                      Kumar Mohanty
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden mt-1.5">
                  <p
                    className={`rm-mask-up text-[10px] font-mono uppercase tracking-[0.26em] truncate ${isNight ? "text-slate-400" : "text-neutral-500"
                      }`}
                  >
                    Spatial Technologist · Folio XXVI
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-stretch shrink-0">
              <div className={`rm-v-rule hidden sm:block w-px ${ruleBg}`} />

              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => cozyAudio.playHover?.()}
                onClick={() => cozyAudio.playSnap?.(2, 1)}
                title="Open full PDF in dedicated browser tab"
                className={`group hidden sm:inline-flex items-center gap-2 px-5 text-[11px] font-mono uppercase tracking-[0.2em] no-underline transition-colors duration-300 ${isNight
                    ? "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    : "text-neutral-600 hover:bg-neutral-900/[0.04] hover:text-neutral-950"
                  }`}
              >
                <span className="overflow-hidden">
                  <span className="rm-mask-up inline-block">Expand</span>
                </span>
                <span className="relative size-3.5 overflow-hidden inline-flex items-center justify-center">
                  <ArrowUpRight className="size-3.5 absolute transition-transform duration-300 group-hover:translate-x-3.5 group-hover:-translate-y-3.5" />
                  <ArrowUpRight className="size-3.5 absolute -translate-x-3.5 translate-y-3.5 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
                </span>
              </a>

              <div className={`rm-v-rule w-px ${ruleBg}`} />

              <a
                href={pdfUrl}
                download="SASWAT_KUMAR_MOHANTY.pdf"
                onMouseEnter={() => cozyAudio.playHover?.()}
                onClick={() => cozyAudio.playSnap?.(3, 1)}
                title="Download official PDF resume"
                className={`group inline-flex items-center gap-2 px-4 sm:px-6 text-[11px] font-mono uppercase tracking-[0.2em] font-medium no-underline transition-colors duration-300 ${isNight
                    ? "bg-white text-neutral-950 hover:bg-indigo-100"
                    : "bg-neutral-900 text-[#faf8f4] hover:bg-black"
                  }`}
              >
                <span className="overflow-hidden">
                  <span className="rm-mask-up inline-block">
                    <span className="hidden xs:inline">Download</span>
                    <span className="xs:hidden">PDF</span>
                  </span>
                </span>
                <span className="relative size-3.5 overflow-hidden inline-flex items-center justify-center">
                  <ArrowDown className="size-3.5 absolute transition-transform duration-300 group-hover:translate-y-4" />
                  <ArrowDown className="size-3.5 absolute -translate-y-4 transition-transform duration-300 group-hover:translate-y-0" />
                </span>
              </a>

              <div className={`rm-v-rule w-px ${ruleBg}`} />

              <button
                type="button"
                onClick={handleClose}
                onMouseEnter={() => cozyAudio.playHover?.()}
                aria-label="Close resume viewer"
                className={`group inline-flex items-center gap-2 px-4 sm:px-5 cursor-pointer transition-colors duration-300 ${isNight
                    ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    : "text-neutral-600 hover:bg-neutral-900/[0.05] hover:text-neutral-950"
                  }`}
              >
                <X className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90" />
                <span
                  className={`hidden md:inline text-[9px] font-mono tracking-[0.22em] ${isNight ? "text-slate-500" : "text-neutral-400"
                    }`}
                >
                  ESC
                </span>
              </button>
            </div>

            <div className={`rm-h-rule absolute bottom-0 left-0 right-0 h-px ${ruleBg}`} />
          </div>

          <div
            className={`relative flex-1 p-2.5 sm:p-4 lg:p-5 overflow-hidden flex flex-col ${isNight ? "bg-[#050811]" : "bg-[#f1ede5]"
              }`}
          >
            <div className={`relative flex-1 w-full border overflow-hidden ${borderCol} bg-white`}>
              <span
                aria-hidden="true"
                className={`rm-tick pointer-events-none absolute top-2 left-2 z-30 size-2 border-t border-l ${isNight ? "border-indigo-300/60" : "border-[#a6864a]/70"
                  }`}
              />
              <span
                aria-hidden="true"
                className={`rm-tick pointer-events-none absolute top-2 right-2 z-30 size-2 border-t border-r ${isNight ? "border-indigo-300/60" : "border-[#a6864a]/70"
                  }`}
              />
              <span
                aria-hidden="true"
                className={`rm-tick pointer-events-none absolute bottom-2 left-2 z-30 size-2 border-b border-l ${isNight ? "border-indigo-300/60" : "border-[#a6864a]/70"
                  }`}
              />
              <span
                aria-hidden="true"
                className={`rm-tick pointer-events-none absolute bottom-2 right-2 z-30 size-2 border-b border-r ${isNight ? "border-indigo-300/60" : "border-[#a6864a]/70"
                  }`}
              />

              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border-0 bg-white block"
                title="Saswat Kumar Mohanty Resume Document"
              />

              <div
                ref={shutterLRef}
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-0 w-[38.2%] z-20 will-change-transform border-r ${borderCol} ${shutterBg}`}
              />
              <div
                ref={shutterRRef}
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 right-0 w-[61.8%] z-20 will-change-transform ${shutterBg}`}
              />
              <div
                ref={seamRef}
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-[38.2%] w-px z-30 ${accentBg}`}
              />
            </div>
          </div>

          <div className="relative shrink-0 px-4 sm:px-7 py-2.5 flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.22em]">
            <div className={`rm-h-rule absolute top-0 left-0 right-0 h-px ${ruleBg}`} />

            <div className="overflow-hidden flex items-center gap-3 min-w-0">
              <span className={`rm-mask-up ${accentText}`}>Φ 1.618</span>
              <span
                className={`rm-mask-up truncate ${isNight ? "text-slate-400" : "text-neutral-500"
                  }`}
              >
                Curriculum Vitae · Vector PDF
              </span>
            </div>

            <div className="overflow-hidden shrink-0">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => cozyAudio.playSnap?.(2, 1)}
                className={`rm-mask-up inline-flex items-center gap-1.5 no-underline transition-colors ${isNight
                    ? "text-slate-300 hover:text-white"
                    : "text-neutral-700 hover:text-black"
                  }`}
              >
                <span>Open Fullscreen</span>
                <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}