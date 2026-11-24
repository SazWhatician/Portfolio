"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, X, FileText, Sparkles } from "lucide-react";
import { cozyAudio } from "@/lib/cozy-sound";

export default function ResumeModal({
  isOpen,
  onClose,
  isNight = false,
  pdfUrl = "/Saswat_Kumar_Mohanty_Resume.pdf",
}) {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small tick to ensure DOM is mounted before adding visible classes for smooth CSS transition
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      try {
        cozyAudio.playFocus?.();
      } catch {}
      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        try {
          cozyAudio.playClose?.();
        } catch {}
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  const handleClose = () => {
    try {
      cozyAudio.playClose?.();
    } catch {}
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6 lg:p-8 pointer-events-auto transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Blurred Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer transition-opacity duration-300"
      />

      {/* Main Animated Modal Window */}
      <div
        className={`relative z-10 w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl sm:rounded-3xl border flex flex-col overflow-hidden shadow-2xl transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-3"
        } ${
          isNight
            ? "bg-[#0c1222]/95 border-white/15 text-white shadow-[0_25px_80px_-15px_rgba(0,0,0,0.7)]"
            : "bg-white/95 border-neutral-200/90 text-neutral-900 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.18)]"
        }`}
      >
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b shrink-0 ${
            isNight ? "border-white/10 bg-white/[0.02]" : "border-neutral-200/80 bg-neutral-50/50"
          }`}
        >
          {/* Identity & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`size-9 sm:size-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isNight
                  ? "bg-amber-400/10 border-amber-400/20 text-amber-300"
                  : "bg-neutral-900 border-neutral-800 text-white"
              }`}
            >
              <FileText className="size-4 sm:size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  id="resume-modal-title"
                  className="font-['Clash_Display',sans-serif] text-base sm:text-lg font-semibold tracking-tight truncate block"
                >
                  Saswat Kumar Mohanty
                </span>
                <span
                  className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                    isNight
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified CV
                </span>
              </div>
              <p
                className={`text-xs font-mono truncate ${
                  isNight ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                Spatial Technologist & Creative Director
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Open / Expand in new tab */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 no-underline cursor-pointer ${
                isNight
                  ? "border-white/15 bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white"
                  : "border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900"
              }`}
              onMouseEnter={() => cozyAudio.playHover?.()}
              onClick={() => cozyAudio.playSnap?.(2, 1)}
              title="Open full PDF in dedicated browser tab"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">Expand</span>
            </a>

            {/* Direct Download PDF Button */}
            <a
              href={pdfUrl}
              download="SASWAT_KUMAR_MOHANTY.pdf"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 no-underline cursor-pointer ${
                isNight
                  ? "bg-white text-neutral-900 hover:bg-neutral-100"
                  : "bg-neutral-900 text-white hover:bg-black"
              }`}
              onMouseEnter={() => cozyAudio.playHover?.()}
              onClick={() => cozyAudio.playSnap?.(3, 1)}
              title="Download official PDF resume"
            >
              <Download className="size-3.5" />
              <span className="hidden xs:inline">Download PDF</span>
              <span className="xs:hidden">PDF</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close resume viewer"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border flex items-center gap-1 transition-all duration-200 cursor-pointer ${
                isNight
                  ? "border-white/15 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
                  : "border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900"
              }`}
              onMouseEnter={() => cozyAudio.playHover?.()}
            >
              <X className="size-4" />
              <kbd
                className={`hidden sm:inline-block text-[9px] font-mono px-1 py-0.5 rounded border leading-none ${
                  isNight ? "border-white/15 text-neutral-400" : "border-neutral-200 text-neutral-500"
                }`}
              >
                ESC
              </kbd>
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded PDF Canvas */}
        <div className="relative flex-1 w-full bg-neutral-900/5 dark:bg-black/40 overflow-hidden flex flex-col">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0 bg-white"
            title="Saswat Kumar Mohanty Resume Document"
          />

          {/* Floating Minimal Footnote for Mobile / Fallback */}
          <div
            className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border backdrop-blur-md shadow-lg flex items-center gap-3 text-xs font-mono transition-colors pointer-events-auto ${
              isNight
                ? "bg-[#060a17]/90 border-white/20 text-neutral-300"
                : "bg-white/90 border-neutral-300 text-neutral-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3 text-amber-400" />
              <span className="hidden sm:inline">Official Document •</span> 99 KB Vector PDF
            </span>
            <div className="h-3 w-px bg-neutral-400/30" />
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:no-underline text-current"
            >
              Open Fullscreen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
