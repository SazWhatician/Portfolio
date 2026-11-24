"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Download, ExternalLink, X, FileText, Sparkles } from "lucide-react";
import { cozyAudio } from "@/lib/cozy-sound";

const PHI = (1 + Math.sqrt(5)) / 2;
const INV_PHI = 1 / PHI;
const INV_PHI_2 = INV_PHI * INV_PHI;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SPIRAL_B = (2 * Math.log(PHI)) / Math.PI;

function drawRoundedRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

export default function ResumeModal({
  isOpen,
  onClose,
  isNight = false,
  pdfUrl = "/Saswat_Kumar_Mohanty_Resume.pdf",
}) {
  const [isRendered, setIsRendered] = useState(false);

  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const canvasRef = useRef(null);
  const windowRef = useRef(null);
  const iframeVeilRef = useRef(null);
  const closeBtnRef = useRef(null);
  const tlRef = useRef(null);
  const closingRef = useRef(false);
  const nightRef = useRef(isNight);
  nightRef.current = isNight;

  const paintGeometry = useCallback((u, m, targetW, targetH) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== Math.floor(vw * dpr) || canvas.height !== Math.floor(vh * dpr)) {
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    ctx.clearRect(0, 0, vw, vh);

    const veil = Math.sin(Math.PI * Math.pow(Math.max(0, Math.min(1, u)), 0.78));
    if (veil <= 0.004) return;

    const night = nightRef.current;
    const acc = (a) =>
      night
        ? `rgba(245, 201, 122, ${(a * veil).toFixed(4)})`
        : `rgba(166, 134, 74, ${(a * veil).toFixed(4)})`;
    const ink = (a) =>
      night
        ? `rgba(226, 232, 240, ${(a * veil).toFixed(4)})`
        : `rgba(23, 23, 23, ${(a * veil).toFixed(4)})`;

    const cx = vw * 0.5;
    const cy = vh * 0.5;
    const scale = 0.88 + 0.12 * m;
    const ix = (1 - m) * 0.34;
    const iy = (1 - m) * 0.42;
    const curW = Math.max(24, targetW * scale * (1 - 2 * ix));
    const curH = Math.max(24, targetH * scale * (1 - 2 * iy));
    const x0 = cx - curW * 0.5;
    const y0 = cy - curH * 0.5;
    const radius = 24 + (1 - m) * 18;

    const baseR = Math.min(targetW, targetH) * 0.28 * (0.45 + 0.55 * u);
    const rot = u * GOLDEN_ANGLE;

    ctx.save();

    ctx.beginPath();
    ctx.arc(cx, cy, baseR * PHI, rot, rot + Math.PI * 2 * Math.min(1, u * 1.25));
    ctx.strokeStyle = ink(0.18);
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    const vesSweep = Math.PI * 2 * Math.min(1, u * 1.35);
    ctx.beginPath();
    ctx.arc(cx - baseR * 0.5, cy, baseR, -Math.PI * 0.5 + rot * 0.2, -Math.PI * 0.5 + rot * 0.2 + vesSweep);
    ctx.strokeStyle = acc(0.36);
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + baseR * 0.5, cy, baseR, Math.PI * 0.5 + rot * 0.2, Math.PI * 0.5 + rot * 0.2 + vesSweep);
    ctx.strokeStyle = acc(0.36);
    ctx.lineWidth = 0.9;
    ctx.stroke();

    const maxTheta = Math.PI * 3.15 * Math.min(1, u * 1.15);
    const spiralA = Math.min(targetW, targetH) * 0.011;
    ctx.beginPath();
    for (let i = 0; i <= 96; i++) {
      const th = (i / 96) * maxTheta;
      const r = spiralA * Math.exp(SPIRAL_B * th);
      const sx = cx + Math.cos(th + rot) * r;
      const sy = cy + Math.sin(th + rot) * r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = acc(0.62);
    ctx.lineWidth = 1.15;
    ctx.stroke();

    drawRoundedRect(ctx, x0, y0, curW, curH, radius);
    ctx.strokeStyle = acc(0.68);
    ctx.lineWidth = 1.1;
    ctx.stroke();

    const gx1 = x0 + curW * INV_PHI_2;
    const gx2 = x0 + curW * INV_PHI;
    const gy1 = y0 + curH * INV_PHI_2;
    const gy2 = y0 + curH * INV_PHI;

    ctx.beginPath();
    ctx.moveTo(gx1, y0);
    ctx.lineTo(gx1, y0 + curH);
    ctx.moveTo(gx2, y0);
    ctx.lineTo(gx2, y0 + curH);
    ctx.moveTo(x0, gy1);
    ctx.lineTo(x0 + curW, gy1);
    ctx.moveTo(x0, gy2);
    ctx.lineTo(x0 + curW, gy2);
    ctx.strokeStyle = ink(0.14);
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + curW, y0 + curH);
    ctx.moveTo(x0 + curW, y0);
    ctx.lineTo(x0, y0 + curH);
    ctx.strokeStyle = ink(0.1);
    ctx.lineWidth = 0.65;
    ctx.stroke();

    const eyes = [
      [gx1, gy1],
      [gx2, gy1],
      [gx1, gy2],
      [gx2, gy2],
    ];
    for (let i = 0; i < eyes.length; i++) {
      const [ex, ey] = eyes[i];
      ctx.beginPath();
      ctx.moveTo(ex - 5, ey);
      ctx.lineTo(ex + 5, ey);
      ctx.moveTo(ex, ey - 5);
      ctx.lineTo(ex, ey + 5);
      ctx.strokeStyle = acc(0.6);
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    const bLen = 14;
    const pad = 10;
    const corners = [
      [x0 - pad, y0 - pad, 1, 1],
      [x0 + curW + pad, y0 - pad, -1, 1],
      [x0 - pad, y0 + curH + pad, 1, -1],
      [x0 + curW + pad, y0 + curH + pad, -1, -1],
    ];
    ctx.strokeStyle = acc(0.8);
    ctx.lineWidth = 1.1;
    for (let i = 0; i < corners.length; i++) {
      const [bx, by, sx, sy] = corners[i];
      ctx.beginPath();
      ctx.moveTo(bx + bLen * sx, by);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx, by + bLen * sy);
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    if (isOpen) {
      closingRef.current = false;
      setIsRendered(true);
      try {
        cozyAudio.playFocus?.();
      } catch { }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isRendered) return;

    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const win = windowRef.current;
    const veil = iframeVeilRef.current;
    if (!root || !backdrop || !win) return;

    tlRef.current?.kill();

    const targetW = win.offsetWidth || Math.min(window.innerWidth - 32, 1024);
    const targetH = win.offsetHeight || Math.min(window.innerHeight * 0.92, 920);
    const headerItems = root.querySelectorAll(".rm-stagger");
    const footnote = root.querySelector(".rm-footnote");
    const headerRule = root.querySelector(".rm-rule");

    if (isOpen) {
      const driver = { u: 0, m: 0 };

      gsap.set(root, { opacity: 1 });
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(win, {
        opacity: 0.01,
        scale: 0.88,
        y: 26,
        rotateX: 9,
        transformPerspective: 1400,
        clipPath: "inset(42% 34% 42% 34% round 42px)",
        pointerEvents: "none",
      });
      if (veil) gsap.set(veil, { opacity: 1 });
      if (headerRule) gsap.set(headerRule, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(headerItems, { y: 14, opacity: 0 });
      if (footnote) gsap.set(footnote, { y: 16, opacity: 0, scale: 0.94 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(win, { clearProps: "clipPath,transform,pointerEvents" });
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
        },
      });

      tl.to(backdrop, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0)
        .to(
          driver,
          {
            u: 1,
            duration: 0.88,
            ease: "power2.inOut",
            onUpdate: () => paintGeometry(driver.u, driver.m, targetW, targetH),
          },
          0
        )
        .to(
          driver,
          {
            m: 1,
            duration: 0.78,
            ease: "expo.out",
            onUpdate: () => {
              const m = driver.m;
              const ix = ((1 - m) * 34).toFixed(2);
              const iy = ((1 - m) * 42).toFixed(2);
              const rad = (24 + (1 - m) * 18).toFixed(1);
              gsap.set(win, {
                opacity: Math.min(1, m * 1.45),
                scale: 0.88 + 0.12 * m,
                y: (1 - m) * 26,
                rotateX: (1 - m) * 9,
                clipPath: `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${rad}px)`,
              });
            },
          },
          0.1
        )
        .to(headerRule, { scaleX: 1, duration: 0.72, ease: "expo.inOut" }, 0.34)
        .to(
          headerItems,
          { y: 0, opacity: 1, duration: 0.62, stagger: 0.055, ease: "expo.out" },
          0.38
        )
        .to(veil, { opacity: 0, duration: 0.55, ease: "power2.out" }, 0.44)
        .to(footnote, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }, 0.52);

      tlRef.current = tl;
    } else {
      const driver = { u: 1, m: 1 };

      gsap.set(win, { transformPerspective: 1400, pointerEvents: "none" });

      const tl = gsap.timeline({
        onComplete: () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
          setIsRendered(false);
        },
      });

      tl.to(
        [footnote, headerItems],
        { y: -8, opacity: 0, duration: 0.22, stagger: 0.02, ease: "power2.in" },
        0
      )
        .to(veil, { opacity: 0.85, duration: 0.24, ease: "power2.in" }, 0.04)
        .to(
          driver,
          {
            u: 0,
            duration: 0.58,
            ease: "power2.inOut",
            onUpdate: () => paintGeometry(driver.u, driver.m, targetW, targetH),
          },
          0.02
        )
        .to(
          driver,
          {
            m: 0,
            duration: 0.5,
            ease: "expo.in",
            onUpdate: () => {
              const m = driver.m;
              const ix = ((1 - m) * 34).toFixed(2);
              const iy = ((1 - m) * 42).toFixed(2);
              const rad = (24 + (1 - m) * 18).toFixed(1);
              gsap.set(win, {
                opacity: Math.max(0, Math.pow(m, 0.7)),
                scale: 0.88 + 0.12 * m,
                y: (1 - m) * 18,
                rotateX: (1 - m) * -7,
                clipPath: `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${rad}px)`,
              });
            },
          },
          0.06
        )
        .to(backdrop, { opacity: 0, duration: 0.36, ease: "power2.inOut" }, 0.22);

      tlRef.current = tl;
    }

    return () => {
      tlRef.current?.kill();
    };
  }, [isOpen, isRendered, paintGeometry]);

  const triggerClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    try {
      cozyAudio.playClose?.();
    } catch { }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") triggerClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop?.();

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start?.();
    };
  }, [isOpen, triggerClose]);

  if (!isRendered) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6 lg:p-8 pointer-events-auto opacity-0"
    >
      <div
        ref={backdropRef}
        aria-hidden="true"
        onClick={triggerClose}
        className={`absolute inset-0 backdrop-blur-md cursor-pointer ${isNight ? "bg-[#040712]/75" : "bg-neutral-950/55"
          }`}
      />

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 z-20 pointer-events-none w-full h-full"
      />

      <div
        ref={windowRef}
        style={{ clipPath: "inset(42% 34% 42% 34% round 42px)" }}
        className={`relative z-10 w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl sm:rounded-3xl border flex flex-col overflow-hidden shadow-2xl will-change-transform ${isNight
          ? "bg-[#0c1222]/95 border-white/15 text-white shadow-[0_28px_90px_-15px_rgba(0,0,0,0.75)]"
          : "bg-white/95 border-neutral-200/90 text-neutral-900 shadow-[0_28px_90px_-15px_rgba(0,0,0,0.2)]"
          }`}
      >
        <div
          className={`relative flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0 ${isNight ? "bg-white/[0.02]" : "bg-neutral-50/55"
            }`}
        >
          <div className="rm-stagger flex items-center gap-3 min-w-0">
            <div
              className={`size-9 sm:size-10 rounded-xl flex items-center justify-center shrink-0 border ${isNight
                ? "bg-amber-400/10 border-amber-400/25 text-amber-300"
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
                  className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${isNight
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified CV
                </span>
              </div>
              <p
                className={`text-xs font-mono truncate ${isNight ? "text-neutral-400" : "text-neutral-500"
                  }`}
              >
                Spatial Technologist & Creative Director
              </p>
            </div>
          </div>

          <div className="rm-stagger flex items-center gap-2 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 no-underline cursor-pointer ${isNight
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

            <a
              href={pdfUrl}
              download="SASWAT_KUMAR_MOHANTY.pdf"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 no-underline cursor-pointer ${isNight
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

            <button
              ref={closeBtnRef}
              type="button"
              onClick={triggerClose}
              aria-label="Close resume viewer"
              className={`group p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border flex items-center gap-1 transition-all duration-200 cursor-pointer ${isNight
                ? "border-white/15 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
                : "border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                }`}
              onMouseEnter={() => cozyAudio.playHover?.()}
            >
              <X className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90" />
              <kbd
                className={`hidden sm:inline-block text-[9px] font-mono px-1 py-0.5 rounded border leading-none ${isNight ? "border-white/15 text-neutral-400" : "border-neutral-200 text-neutral-500"
                  }`}
              >
                ESC
              </kbd>
            </button>
          </div>

          <div
            className={`rm-rule absolute bottom-0 left-0 right-0 h-px ${isNight ? "bg-white/12" : "bg-neutral-200/90"
              }`}
          />
        </div>

        <div className="relative flex-1 w-full bg-neutral-900/5 dark:bg-black/40 overflow-hidden flex flex-col">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0 bg-white"
            title="Saswat Kumar Mohanty Resume Document"
          />

          <div
            ref={iframeVeilRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-10 ${isNight ? "bg-[#0c1222]" : "bg-[#faf8f4]"
              }`}
          />

          <div
            className={`rm-footnote absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full border backdrop-blur-md shadow-lg flex items-center gap-3 text-xs font-mono transition-colors pointer-events-auto ${isNight
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