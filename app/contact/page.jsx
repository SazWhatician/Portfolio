"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bodoni_Moda, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import gsap from "gsap";
import {
  Mail,
  Copy,
  Check,
  ArrowUpRight,
  Send,
  MapPin,
  Clock,
  Globe,
  UploadCloud,
  X,
  FileText,
  Paperclip,
  RotateCcw,
} from "lucide-react";
import FramelessNav from "@/components/ui/frameless-nav";
import ArchitecturalGrid from "@/components/ui/architectural-grid";
import { getSystemTimeTheme } from "@/components/ui/time-clock";
import { cozyAudio } from "@/lib/cozy-sound";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  adjustFontFallback: false,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const PHI = 1.618033988749895;
const SCRAMBLE_GLYPHS = "ΦΔΩ01618✦·/—ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const TARGET_EMAIL = "saswatmohanty029@gmail.com";

const DISCIPLINES = [
  { label: "Spatial Computing & 3D", ratio: [3, 5], code: "3:5 · Φ⁰" },
  { label: "Kinetic Creative Direction", ratio: [5, 8], code: "5:8 · Φ⁻¹" },
  { label: "Design Systems Architecture", ratio: [8, 13], code: "8:13 · Φ⁻²" },
  { label: "General Collaboration", ratio: [2, 3], code: "2:3 · Φ⁻³" },
];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Analytical Golden Logarithmic Spiral: r(θ) = a · Φ^(2θ/π)
function buildLogSpiral(cx, cy, startTheta, maxTheta, a, steps = 140) {
  const b = (2 * Math.log(PHI)) / Math.PI;
  let d = "";
  let length = 0;
  let px = 0;
  let py = 0;

  for (let i = 0; i <= steps; i++) {
    const t = startTheta + (i / steps) * (maxTheta - startTheta);
    const r = a * Math.exp(b * (t - startTheta));
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r;
    if (i === 0) d = `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      length += Math.hypot(x - px, y - py);
    }
    px = x;
    py = y;
  }
  return { d, length: Number(length.toFixed(2)) };
}

/* ============================================================================
   CRYPTOGRAPHIC GLYPH DECODER (Mount + Hover Trigger)
   ============================================================================ */
function ScrambleText({ text, className = "", triggerOnMount = false, delayMs = 260 }) {
  const [output, setOutput] = useState(text);
  const rafRef = useRef(0);

  const decode = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const chars = text.split("");
    const totalFrames = Math.max(16, Math.min(30, chars.length * 1.35));
    let frame = 0;

    const tick = () => {
      frame += 1;
      const locked = Math.floor((frame / totalFrames) * chars.length);
      setOutput(
        chars
          .map((ch, idx) => {
            if (ch === " " || ch === "·" || ch === "/" || ch === "✦") return ch;
            if (idx < locked) return ch;
            return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
          })
          .join("")
      );
      if (frame < totalFrames) rafRef.current = requestAnimationFrame(tick);
      else setOutput(text);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [text]);

  useEffect(() => {
    setOutput(text);
    if (!triggerOnMount) return;
    const timer = setTimeout(decode, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, triggerOnMount, delayMs, decode]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <span onMouseEnter={decode} className={`inline-block ${className}`}>
      {output}
    </span>
  );
}

/* ============================================================================
   60FPS LIVE HARMONIC SIGNAL CARRIER CANVAS
   - Smoothly interpolates between Fibonacci Lissajous ratios (3:5, 5:8, 8:13, 2:3)
   - Reacts in real time to typing energy, file drag-over vortex & transmission state
   ============================================================================ */
function HarmonicSignalCanvas({
  isNight,
  accentHex,
  targetRatio,
  energyRef,
  isDragging,
  isSubmitting,
  isSent,
  readinessPct,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    isNight,
    accentHex,
    targetRatio,
    isDragging,
    isSubmitting,
    isSent,
    readinessPct,
  });
  stateRef.current = {
    isNight,
    accentHex,
    targetRatio,
    isDragging,
    isSubmitting,
    isSent,
    readinessPct,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let rafId = 0;
    let w = 0;
    let h = 0;
    let t = 0;
    let curA = targetRatio[0];
    let curB = targetRatio[1];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = () => {
      if (!w || !h) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const {
        isNight: night,
        targetRatio: ratio,
        isDragging: dragging,
        isSubmitting: submitting,
        isSent: sent,
        readinessPct: ready,
      } = stateRef.current;

      // Smoothly morph harmonic frequency ratio when user switches disciplines
      curA += (ratio[0] - curA) * 0.065;
      curB += (ratio[1] - curB) * 0.065;

      // Decay typing impulse smoothly
      energyRef.current *= 0.93;
      const boost =
        energyRef.current + (dragging ? 0.85 : 0) + (submitting ? 1.4 : 0) + (sent ? 0.35 : 0);

      t += 0.014 + boost * 0.028;

      const cx = w * 0.5;
      const cy = h * 0.5;
      const rx = w * 0.39;
      const ry = h * 0.34 * (0.86 + Math.min(0.28, boost * 0.16));

      const accent = night ? "rgba(165,180,252," : "rgba(155,61,11,";
      const ink = night ? "rgba(226,232,240," : "rgba(23,23,23,";

      // 1. Subtle Oscilloscope Graticule Axes
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = `${ink}0.14)`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(14, cy);
      ctx.lineTo(w - 14, cy);
      ctx.moveTo(cx, 12);
      ctx.lineTo(cx, h - 12);
      ctx.stroke();
      ctx.restore();

      // 2. Standing Carrier Envelope Wave (scales amplitude with typing & readiness)
      ctx.beginPath();
      const waveSteps = 120;
      const carrierAmp = h * (0.12 + (ready / 100) * 0.14 + Math.min(0.16, boost * 0.1));
      for (let i = 0; i <= waveSteps; i++) {
        const u = i / waveSteps;
        const x = 16 + u * (w - 32);
        const env = Math.sin(u * Math.PI);
        const y = cy + Math.sin(u * Math.PI * curB * 1.5 - t * 2.2) * carrierAmp * env;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `${accent}0.24)`;
      ctx.lineWidth = 0.95;
      ctx.stroke();

      // 3. Harmonic Lissajous Manifold
      const steps = 210;
      const phase = t * 0.65;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const u = (i / steps) * Math.PI * 2;
        const x = cx + Math.sin(curA * u + phase) * rx;
        const y = cy + Math.sin(curB * u) * ry;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `${ink}${night ? "0.2" : "0.17"})`;
      ctx.lineWidth = 0.95;
      ctx.stroke();

      // 4. Luminous Signal Packet Comet Orbiting the Lissajous Manifold
      const head = (t * 1.15) % (Math.PI * 2);
      const trailPts = 42;
      ctx.beginPath();
      for (let i = 0; i <= trailPts; i++) {
        const u = head - (i / trailPts) * 0.92;
        const x = cx + Math.sin(curA * u + phase) * rx;
        const y = cy + Math.sin(curB * u) * ry;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `${accent}0.92)`;
      ctx.lineWidth = 1.7;
      ctx.stroke();

      const hx = cx + Math.sin(curA * head + phase) * rx;
      const hy = cy + Math.sin(curB * head) * ry;

      ctx.beginPath();
      ctx.arc(hx, hy, 5.5 + boost * 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = `${accent}0.35)`;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(hx, hy, 2.7, 0, Math.PI * 2);
      ctx.fillStyle = `${accent}1)`;
      ctx.fill();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [energyRef, targetRatio]);

  return <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full block" />;
}

/* ============================================================================
   SACRED GEOMETRY DISPATCH RECEIPT (Self-Drawing Golden Spiral + Vesica Seal)
   ============================================================================ */
function TransmissionSuccessSeal({
  isNight,
  accentHex,
  accentText,
  fileCount,
  dispatchCode,
  onReset,
}) {
  const wrapRef = useRef(null);

  const geom = useMemo(() => {
    const spiral = buildLogSpiral(100, 100, 0, Math.PI * 3.1, 2.1, 130);
    const ringCirc = Number((2 * Math.PI * 78).toFixed(2));
    const vesicaCirc = Number((2 * Math.PI * 46).toFixed(2));
    return { spiral, ringCirc, vesicaCirc };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        ".seal-draw",
        { strokeDashoffset: (i, target) => target.getAttribute("data-len") || 400 },
        { strokeDashoffset: 0, duration: 1.4, stagger: 0.14, ease: "power3.inOut" },
        0
      )
        .fromTo(
          ".seal-check",
          { scale: 0, rotate: -45, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.7, ease: "back.out(1.8)" },
          0.42
        )
        .fromTo(
          ".seal-reveal",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.08 },
          0.32
        );

      gsap.to(".seal-orbit-ring", {
        rotation: 360,
        duration: 28,
        repeat: -1,
        ease: "none",
        svgOrigin: "100 100",
      });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="py-10 sm:py-12 text-center flex flex-col items-center justify-center">
      {/* Self-Drawing Golden Spiral + Vesica Piscis Seal */}
      <div className="relative size-36 sm:size-44 flex items-center justify-center mb-6">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <g className="seal-orbit-ring">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke={accentHex}
              strokeOpacity="0.28"
              strokeWidth="0.9"
              strokeDasharray="3 6"
            />
            <circle cx="100" cy="10" r="2.5" fill={accentHex} />
          </g>

          <circle
            cx="100"
            cy="100"
            r="78"
            stroke={accentHex}
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray={geom.ringCirc}
            strokeDashoffset={geom.ringCirc}
            data-len={geom.ringCirc}
            className="seal-draw"
          />

          <circle
            cx="77"
            cy="100"
            r="46"
            stroke={accentHex}
            strokeOpacity="0.35"
            strokeWidth="0.9"
            strokeDasharray={geom.vesicaCirc}
            strokeDashoffset={geom.vesicaCirc}
            data-len={geom.vesicaCirc}
            className="seal-draw"
          />
          <circle
            cx="123"
            cy="100"
            r="46"
            stroke={accentHex}
            strokeOpacity="0.35"
            strokeWidth="0.9"
            strokeDasharray={geom.vesicaCirc}
            strokeDashoffset={geom.vesicaCirc}
            data-len={geom.vesicaCirc}
            className="seal-draw"
          />

          <path
            d={geom.spiral.d}
            stroke={accentHex}
            strokeWidth="1.4"
            strokeDasharray={geom.spiral.length}
            strokeDashoffset={geom.spiral.length}
            data-len={geom.spiral.length}
            className="seal-draw"
          />
        </svg>

        <div
          className={`seal-check absolute size-12 rounded-full border flex items-center justify-center backdrop-blur-md ${isNight
              ? "bg-indigo-950/90 border-indigo-300/70 text-indigo-200"
              : "bg-[#fcfaf6]/95 border-[#9b3d0b]/70 text-[#9b3d0b]"
            }`}
        >
          <Check className="size-6" />
        </div>
      </div>

      <span
        className={`${jetbrains.className} seal-reveal text-[10px] uppercase tracking-[0.3em] mb-2 ${accentText}`}
      >
        LOCKED · {dispatchCode}
      </span>

      <h3
        className={`seal-reveal font-['Clash_Display',sans-serif] text-2xl sm:text-3xl font-semibold tracking-tight mb-3 ${isNight ? "text-white" : "text-neutral-950"
          }`}
      >
        Signal{" "}
        <span className={`${bodoni.className} italic font-medium ${accentText}`}>Dispatched</span>
      </h3>

      <p
        className={`seal-reveal text-sm font-normal max-w-md mx-auto mb-3 leading-relaxed ${isNight ? "text-slate-300" : "text-neutral-600"
          }`}
      >
        Your transmission and{" "}
        <span className={`${jetbrains.className} font-medium ${isNight ? "text-white" : "text-neutral-900"}`}>
          {fileCount} attachment(s)
        </span>{" "}
        have been delivered directly to{" "}
        <span className={`${jetbrains.className} font-medium ${isNight ? "text-indigo-200" : "text-neutral-950"}`}>
          {TARGET_EMAIL}
        </span>
        .
      </p>

      <p
        className={`${jetbrains.className} seal-reveal text-[10px] uppercase tracking-[0.2em] mb-8 ${isNight ? "text-slate-400" : "text-neutral-500"
          }`}
      >
        No external mail client required · Expected reply within 24–48 hrs
      </p>

      <button
        type="button"
        onClick={onReset}
        className={`${jetbrains.className} seal-reveal inline-flex items-center gap-2.5 px-6 py-3 rounded-full border text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 cursor-pointer ${isNight
            ? "border-slate-700 hover:border-indigo-300 text-slate-100 bg-slate-900/70"
            : "border-neutral-300 hover:border-neutral-950 text-neutral-900 bg-white/80"
          }`}
      >
        <RotateCcw className="size-3.5" />
        <span>Open New Transmission</span>
      </button>
    </div>
  );
}

/* ============================================================================
   MAIN CONTACT PAGE — THE AUREA SIGNAL CHAMBER
   ============================================================================ */
export default function ContactPage() {
  const [systemTheme, setSystemTheme] = useState("sunset");
  const [istClock, setIstClock] = useState("--:--:--");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedDisciplineIdx, setSelectedDisciplineIdx] = useState(0);
  const [focusedField, setFocusedField] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [dispatchCode, setDispatchCode] = useState("SIG-Φ-1618");
  const [errorMessage, setErrorMessage] = useState("");

  // DOM & GSAP Refs
  const pageRef = useRef(null);
  const fileInputRef = useRef(null);
  const disciplineWrapRef = useRef(null);
  const disciplineBtnRefs = useRef([]);
  const disciplineGliderRef = useRef(null);
  const magneticSubmitRef = useRef(null);
  const copyPulseRef = useRef(null);
  const typingEnergyRef = useRef(0);
  const attachedFilesRef = useRef([]);
  attachedFilesRef.current = attachedFiles;

  const isNight = systemTheme === "night";
  const selectedDiscipline = DISCIPLINES[selectedDisciplineIdx];

  const accentHex = isNight ? "#a5b4fc" : systemTheme === "sunset" ? "#9b3d0b" : "#875311";
  const accentText = isNight
    ? "text-indigo-300"
    : systemTheme === "sunset"
      ? "text-[#9b3d0b]"
      : "text-[#875311]";

  const cardSurface = isNight
    ? "bg-[#070c1b]/88 border-slate-800/90 shadow-[0_18px_56px_rgba(0,0,0,0.62)] text-white"
    : "bg-[#fcfaf6]/90 border-neutral-900/10 shadow-[0_18px_56px_rgba(17,17,17,0.055)] text-neutral-950";

  // Analytical Background Golden Spiral Blueprint
  const bgSpiral = useMemo(() => buildLogSpiral(420, 320, -0.4, Math.PI * 3.4, 7.5, 160), []);

  // Live Golden-Ratio Signal Readiness Percentage (0% -> 100%)
  const readinessPct = useMemo(() => {
    let score = 0;
    if (formState.name.trim().length > 1) score += 28;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) score += 32;
    if (formState.message.trim().length > 5) {
      score += Math.min(35, 15 + formState.message.trim().length * 0.4);
    }
    if (attachedFiles.length > 0) score += 5;
    return Math.min(100, Math.round(score));
  }, [formState, attachedFiles.length]);

  /* --------------------------------------------------------------------------
     1. THEME SYNC, LIVE IST CHRONOMETER, AUDIO ENTRY & BLOB CLEANUP
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const syncTheme = () => {
      const th = getSystemTimeTheme();
      setSystemTheme(th);
      cozyAudio.setTheme?.(th);
    };
    syncTheme();
    const themeTimer = setInterval(syncTheme, 10000);

    const updateIst = () => {
      try {
        const nowStr = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date());
        setIstClock(nowStr);
      } catch {
        setIstClock("UTC+05:30");
      }
    };
    updateIst();
    const clockTimer = setInterval(updateIst, 1000);

    const entryAudio = setTimeout(() => {
      try {
        cozyAudio.playEntry?.();
      } catch { }
    }, 320);

    return () => {
      clearInterval(themeTimer);
      clearInterval(clockTimer);
      clearTimeout(entryAudio);
      attachedFilesRef.current.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, []);

  /* --------------------------------------------------------------------------
     2. GOLDEN-RATIO ENTRANCE CHOREOGRAPHY + MAGNETIC SUBMIT CTA PHYSICS
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // 1. Vertical 38.2% & 61.8% architectural meridians drop from ceiling
      tl.fromTo(
        ".contact-axis-line",
        { scaleY: 0 },
        { scaleY: 1, duration: 1.35, stagger: 0.12, transformOrigin: "top center", ease: "expo.inOut" },
        0
      )
        // 2. Background Analytical Golden Spiral Blueprint traces itself
        .to(
          ".contact-bg-spiral",
          { strokeDashoffset: 0, duration: 2.1, ease: "power3.inOut" },
          0.08
        )
        // 3. Eyebrow badge + top hairline sweep
        .fromTo(
          ".contact-eyebrow",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.75 },
          0.12
        )
        // 4. 3D Perspective Masked Word-Blade Headline Unfurl
        .fromTo(
          ".contact-word",
          { yPercent: 120, rotateX: -48, opacity: 0 },
          { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.0, stagger: 0.045 },
          0.16
        )
        // 5. Subtitle & Golden Divider
        .fromTo(
          ".contact-sub",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.85 },
          0.34
        )
        .fromTo(
          ".contact-rule",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.0, transformOrigin: "left center", ease: "expo.inOut" },
          0.32
        )
        // 6. Golden-Ratio Vessels stagger cleanly upward
        .fromTo(
          ".contact-vessel",
          { y: 36, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.95, stagger: 0.1 },
          0.36
        );

      // Slow continuous rotation on dropzone reticle
      gsap.to(".dropzone-orbit", {
        rotation: 360,
        duration: 24,
        repeat: -1,
        ease: "none",
        svgOrigin: "40 40",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Magnetic pull physics on the Primary Submit Button
  useEffect(() => {
    const btn = magneticSubmitRef.current;
    if (!btn || isSent) return;

    const xTo = gsap.quickTo(btn, "x", { duration: 0.36, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.36, ease: "power3.out" });

    const onMove = (e) => {
      const rect = btn.getBoundingClientRect();
      xTo((e.clientX - (rect.left + rect.width / 2)) * 0.22);
      yTo((e.clientY - (rect.top + rect.height / 2)) * 0.26);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    return () => {
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }, [isSent]);

  /* --------------------------------------------------------------------------
     3. GLIDING VERNIER PILL FOR DISCIPLINE SELECTOR (ResizeObserver Synced)
     -------------------------------------------------------------------------- */
  const moveDisciplineGlider = useCallback((idx, immediate = false) => {
    const wrap = disciplineWrapRef.current;
    const glider = disciplineGliderRef.current;
    const target = disciplineBtnRefs.current[idx];
    if (!wrap || !glider || !target) return;

    const props = {
      x: target.offsetLeft,
      y: target.offsetTop,
      width: target.offsetWidth,
      height: target.offsetHeight,
      opacity: 1,
    };

    if (immediate) {
      gsap.set(glider, props);
    } else {
      gsap.to(glider, {
        ...props,
        duration: 0.52,
        ease: "expo.out",
        overwrite: "auto",
      });
    }
  }, []);

  useEffect(() => {
    if (isSent) return;
    moveDisciplineGlider(selectedDisciplineIdx, false);
    const wrap = disciplineWrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => moveDisciplineGlider(selectedDisciplineIdx, true));
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [selectedDisciplineIdx, isSent, moveDisciplineGlider]);

  /* --------------------------------------------------------------------------
     4. INTERACTION HANDLERS (Spotlight, Typing Pulse, Copy, Files, Submit)
     -------------------------------------------------------------------------- */
  const handleVesselMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const handleFieldChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    // Inject live harmonic energy into the oscilloscope canvas as user types
    typingEnergyRef.current = Math.min(1.25, typingEnergyRef.current + 0.34);
  };

  const handleFieldFocus = (fieldName, idx) => {
    setFocusedField(fieldName);
    typingEnergyRef.current = Math.min(1.25, typingEnergyRef.current + 0.4);
    try {
      cozyAudio.playHover?.(idx);
    } catch { }
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(TARGET_EMAIL);
    setCopiedEmail(true);
    typingEnergyRef.current = 1.1;
    try {
      cozyAudio.playSnap?.(3, 1);
    } catch { }

    if (copyPulseRef.current) {
      gsap.fromTo(
        copyPulseRef.current,
        { scale: 0.85, opacity: 0.8 },
        { scale: 1.45, opacity: 0, duration: 0.65, ease: "expo.out" }
      );
    }

    setTimeout(() => setCopiedEmail(false), 2400);
  };

  const processFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles = Array.from(fileList).map((file) => {
      const isImg = file.type.startsWith("image/");
      const previewUrl = isImg ? URL.createObjectURL(file) : null;
      return {
        id: `${file.name}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        isImage: isImg,
        previewUrl,
      };
    });

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    typingEnergyRef.current = 1.25;
    try {
      cozyAudio.playSnap?.(4, 1);
    } catch { }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
      try {
        cozyAudio.playHover?.(2);
      } catch { }
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (idToRemove) => {
    setAttachedFiles((prev) => {
      const target = prev.find((f) => f.id === idToRemove);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== idToRemove);
    });
    try {
      cozyAudio.playClose?.();
    } catch { }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    typingEnergyRef.current = 1.6;

    try {
      cozyAudio.playPortalWarp?.(selectedDisciplineIdx);
    } catch {
      try {
        cozyAudio.playSnap?.(2, 1);
      } catch { }
    }

    const formData = new FormData();
    formData.append("name", formState.name);
    formData.append("email", formState.email);
    formData.append("discipline", selectedDiscipline.label);
    formData.append("message", formState.message);

    attachedFiles.forEach(({ file }) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to transmit message.");
      }

      const hash = Math.abs(
        Array.from(`${formState.name}${Date.now()}`).reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 1618)
      )
        .toString(16)
        .toUpperCase()
        .slice(0, 4)
        .padStart(4, "0");

      setDispatchCode(`SIG-Φ-${hash}`);
      setIsSent(true);

      try {
        cozyAudio.playFocus?.(0);
      } catch { }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage(
        err.message || "Failed to transmit signal. Please try again or copy the address."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const ghostStroke = isNight
    ? "rgba(165, 180, 252, 0.085)"
    : systemTheme === "sunset"
      ? "rgba(155, 61, 11, 0.085)"
      : "rgba(23, 23, 23, 0.07)";

  const inputBase = isNight
    ? "bg-slate-900/65 border-slate-800 hover:border-slate-700 focus:border-indigo-300/70 focus:bg-slate-900/95 text-white placeholder:text-slate-500"
    : "bg-neutral-50/70 border-neutral-900/12 hover:border-neutral-900/25 focus:border-[#9b3d0b]/70 focus:bg-white text-neutral-950 placeholder:text-neutral-400";

  return (
    <div
      ref={pageRef}
      className={`${jakarta.className} relative min-h-screen selection:bg-neutral-900 selection:text-white overflow-x-clip transition-colors duration-700 ${isNight ? "bg-[#060a17] text-white" : "bg-[#faf8f4] text-neutral-950"
        }`}
    >
      {/* 1. Top-Center Celestial Half-Compass Navigation */}
      <FramelessNav activeTheme={systemTheme} />

      {/* 2. Architectural Blueprint Grid Background */}
      <ArchitecturalGrid />

      {/* 3. Golden-Section Vertical Meridians (38.2% & 61.8%) */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 hidden lg:block">
        <div
          className={`contact-axis-line absolute top-0 bottom-0 left-[38.2%] w-px ${isNight ? "bg-indigo-300/[0.06]" : "bg-[#9b3d0b]/[0.07]"
            }`}
        />
        <div
          className={`contact-axis-line absolute top-0 bottom-0 left-[61.8%] w-px ${isNight ? "bg-indigo-300/[0.04]" : "bg-[#9b3d0b]/[0.05]"
            }`}
        />
      </div>

      {/* 4. Ambient Halo + Self-Drawing Analytical Golden Spiral Blueprint */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[740px] h-[740px] rounded-full blur-[150px] transition-colors duration-1000 ${isNight ? "bg-indigo-900/25" : "bg-[#f1e6d4]/75"
            }`}
        />
        <div
          className={`absolute -bottom-24 right-0 w-[520px] h-[520px] rounded-full blur-[130px] transition-colors duration-1000 ${isNight ? "bg-cyan-950/25" : "bg-[#eadcc5]/55"
            }`}
        />
        <svg
          viewBox="0 0 900 680"
          fill="none"
          className="absolute -right-24 top-12 w-[780px] max-w-none h-auto opacity-75"
        >
          <path
            d={bgSpiral.d}
            stroke={accentHex}
            strokeOpacity={isNight ? "0.14" : "0.16"}
            strokeWidth="1"
            strokeDasharray={bgSpiral.length}
            strokeDashoffset={bgSpiral.length}
            className="contact-bg-spiral"
          />
          <circle
            cx="420"
            cy="320"
            r="190"
            stroke={accentHex}
            strokeOpacity={isNight ? "0.07" : "0.08"}
            strokeWidth="0.8"
            strokeDasharray="3 7"
          />
        </svg>
      </div>

      {/* 5. Main Aurea Signal Chamber */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 xs:px-6 sm:px-8 lg:px-10 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24">
        {/* EDITORIAL HEADER WITH GHOST NUMERAL + 3D MASKED WORD-BLADES */}
        <div className="relative max-w-3xl mb-10 sm:mb-14">
          <span
            aria-hidden="true"
            style={{ WebkitTextStroke: `1px ${ghostStroke}`, color: "transparent" }}
            className={`${bodoni.className} pointer-events-none select-none hidden md:block absolute -top-12 -left-8 text-[11.5rem] italic font-semibold leading-none z-0`}
          >
            04
          </span>

          <div className="relative z-10">
            <div
              className={`${jetbrains.className} contact-eyebrow inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-[10px] font-medium tracking-[0.26em] uppercase mb-4 sm:mb-5 backdrop-blur-md ${isNight
                  ? "border-indigo-400/30 bg-slate-950/75 text-indigo-300"
                  : "border-[#9b3d0b]/25 bg-white/85 text-[#9b3d0b]"
                }`}
            >
              <span className="size-1.5 rounded-full bg-current animate-pulse" />
              <ScrambleText text="04 / DIRECT SIGNAL · INITIATE DIALOGUE" triggerOnMount delayMs={280} />
            </div>

            <h1
              style={{ perspective: "900px" }}
              className={`text-[2.05rem] xs:text-[2.5rem] sm:text-[3.5rem] md:text-[4.1rem] lg:text-[4.6rem] leading-[1.06] sm:leading-[1.01] mb-5 sm:mb-6 ${isNight ? "text-white" : "text-neutral-950"
                }`}
            >
              {[
                { text: "Let's architect", style: "sans" },
                { text: "something", style: "sans" },
                { text: "timeless", style: "accent" },
                { text: "together.", style: "serif" },
              ].map((seg, sIdx, arr) =>
                seg.text.split(" ").map((word, wIdx, wArr) => {
                  const isLast = sIdx === arr.length - 1 && wIdx === wArr.length - 1;
                  return (
                    <span
                      key={`${sIdx}-${wIdx}`}
                      className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em] pr-[0.06em]"
                    >
                      <span
                        className={`contact-word inline-block will-change-transform ${seg.style === "accent"
                            ? `${bodoni.className} italic font-semibold tracking-[-0.02em] text-[1.08em] ${accentText}`
                            : seg.style === "serif"
                              ? `${bodoni.className} italic font-medium tracking-[-0.02em] text-[1.06em]`
                              : "font-['Clash_Display',sans-serif] font-semibold tracking-[-0.025em]"
                          }`}
                      >
                        {word}
                        {!isLast ? " " : ""}
                      </span>
                    </span>
                  );
                })
              )}
            </h1>

            <div className={`contact-rule h-px w-full max-w-md mb-5 ${isNight ? "bg-slate-800" : "bg-neutral-900/15"}`} />

            <p
              className={`contact-sub text-[15px] sm:text-[17px] font-normal leading-[1.75] max-w-xl ${isNight ? "text-slate-300" : "text-neutral-600"
                }`}
            >
              Transmit project briefs, spatial concepts, or visual references directly from this chamber—live telemetry, zero external mail client required.
            </p>
          </div>
        </div>

        {/* GOLDEN RATIO 1 : 1.618 (38.2% / 61.8%) WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.618fr] gap-8 lg:gap-10 items-start">
          {/* LEFT 38.2% COLUMN: HARMONIC OSCILLOSCOPE + COORDINATES */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* LIVE HARMONIC SIGNAL CHAMBER VESSEL */}
            <div
              onMouseMove={handleVesselMove}
              className={`contact-vessel group relative overflow-hidden rounded-3xl border p-5 xs:p-6 sm:p-7 backdrop-blur-xl transition-colors duration-500 ${cardSurface}`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: isNight
                    ? "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.12), transparent 65%)"
                    : "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(155,61,11,0.09), transparent 65%)",
                }}
              />

              <div className="relative z-10">
                <div className={`${jetbrains.className} flex items-center justify-between text-[9px] uppercase tracking-[0.24em] mb-3`}>
                  <span className={accentText}>CARRIER · {selectedDiscipline.code}</span>
                  <span className="inline-flex items-center gap-1.5 opacity-75">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isSubmitting ? "TRANSMITTING" : isSent ? "LOCKED" : "LIVE"}</span>
                  </span>
                </div>

                {/* 60FPS Typing-Reactive Golden Lissajous Oscilloscope */}
                <div
                  className={`relative h-36 w-full rounded-2xl border overflow-hidden mb-5 ${isNight ? "bg-slate-950/70 border-slate-800/90" : "bg-[#f5f0e7]/80 border-black/[0.07]"
                    }`}
                >
                  <HarmonicSignalCanvas
                    isNight={isNight}
                    accentHex={accentHex}
                    targetRatio={selectedDiscipline.ratio}
                    energyRef={typingEnergyRef}
                    isDragging={isDragging}
                    isSubmitting={isSubmitting}
                    isSent={isSent}
                    readinessPct={readinessPct}
                  />
                  <div
                    className={`${jetbrains.className} pointer-events-none absolute bottom-2 left-3 right-3 flex items-center justify-between text-[8px] uppercase tracking-[0.22em] opacity-65`}
                  >
                    <span>LISSAJOUS HARMONIC</span>
                    <span>READY · {String(readinessPct).padStart(2, "0")}%</span>
                  </div>
                </div>

                {/* Direct Coordinate Email Block */}
                <span className={`${jetbrains.className} text-[9px] uppercase tracking-[0.24em] opacity-55 block mb-1.5`}>
                  Direct Inquiries
                </span>
                <div className="font-['Clash_Display',sans-serif] text-base xs:text-lg sm:text-xl font-semibold tracking-tight break-all mb-4">
                  {TARGET_EMAIL}
                </div>

                <div className={`flex flex-wrap items-center gap-2.5 pt-4 border-t ${isNight ? "border-slate-800" : "border-neutral-900/10"}`}>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`${jetbrains.className} relative inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] uppercase tracking-[0.18em] transition-all active:scale-95 cursor-pointer ${copiedEmail
                        ? isNight
                          ? "border-emerald-400/70 bg-emerald-950/60 text-emerald-200"
                          : "border-emerald-600/60 bg-emerald-50 text-emerald-900"
                        : isNight
                          ? "border-slate-700 hover:border-indigo-300 bg-slate-900/70 text-slate-200 hover:text-white"
                          : "border-neutral-300 hover:border-neutral-950 bg-white/80 hover:bg-neutral-950 hover:text-white text-neutral-900"
                      }`}
                  >
                    <span
                      ref={copyPulseRef}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-full border border-current opacity-0"
                    />
                    {copiedEmail ? (
                      <>
                        <Check className="size-3.5 text-emerald-500" />
                        <ScrambleText text="COPIED · Φ LOCKED" triggerOnMount delayMs={0} />
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${TARGET_EMAIL}`}
                    onClick={() => cozyAudio.playSnap?.(4, 1)}
                    title="Open in default mail application"
                    className={`${jetbrains.className} inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.18em] transition-all no-underline shadow-sm ${isNight
                        ? "bg-white text-neutral-950 hover:bg-indigo-100"
                        : "bg-neutral-950 text-[#fcfaf6] hover:bg-black"
                      }`}
                  >
                    <Mail className="size-3.5" />
                    <span>Mail App</span>
                  </a>
                </div>
              </div>
            </div>

            {/* STUDIO MERIDIAN & LIVE IST ATOMIC CHRONOMETER */}
            <div
              onMouseMove={handleVesselMove}
              className={`contact-vessel group relative overflow-hidden rounded-3xl border p-5 xs:p-6 backdrop-blur-xl space-y-4 text-xs ${cardSurface}`}
            >
              <div className="flex items-start gap-3">
                <MapPin className={`size-4 shrink-0 mt-0.5 ${accentText}`} />
                <div>
                  <span className={`${jetbrains.className} block uppercase tracking-[0.22em] text-[9px] opacity-55`}>
                    Studio Base
                  </span>
                  <span className="font-medium">New Delhi, India · Available Globally</span>
                </div>
              </div>

              <div className={`h-px w-full ${isNight ? "bg-slate-800/80" : "bg-neutral-900/[0.08]"}`} />

              <div className="flex items-start gap-3">
                <Clock className={`size-4 shrink-0 mt-0.5 ${accentText}`} />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <div>
                    <span className={`${jetbrains.className} block uppercase tracking-[0.22em] text-[9px] opacity-55`}>
                      Local Studio Meridian
                    </span>
                    <span className="font-medium">Commissions Open · Q4 2026</span>
                  </div>
                  <span
                    className={`${jetbrains.className} px-2.5 py-1 rounded-lg border text-[10px] tabular-nums font-semibold ${isNight
                        ? "border-indigo-400/35 bg-slate-900/90 text-indigo-200"
                        : "border-[#9b3d0b]/25 bg-[#f7f2e8] text-[#9b3d0b]"
                      }`}
                  >
                    {istClock} IST
                  </span>
                </div>
              </div>

              <div className={`h-px w-full ${isNight ? "bg-slate-800/80" : "bg-neutral-900/[0.08]"}`} />

              <div className="flex items-start gap-3">
                <Globe className={`size-4 shrink-0 mt-0.5 ${accentText}`} />
                <div>
                  <span className={`${jetbrains.className} block uppercase tracking-[0.22em] text-[9px] opacity-55`}>
                    Direct Dispatch Pipeline
                  </span>
                  <span className="font-medium">Encrypted web uplink with media & PDF staging.</span>
                </div>
              </div>
            </div>

            {/* EXTERNAL PORTALS */}
            <div className="contact-vessel grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
              <a
                href="https://github.com/SazWhatician"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => cozyAudio.playHover?.(1)}
                className={`${jetbrains.className} group inline-flex items-center justify-between px-4 py-3.5 rounded-2xl border backdrop-blur-md text-[11px] uppercase tracking-[0.18em] transition-all no-underline ${isNight
                    ? "border-slate-800 bg-[#070c1b]/85 text-slate-200 hover:border-indigo-300/70 hover:text-white"
                    : "border-neutral-900/12 bg-[#fcfaf6]/90 text-neutral-800 hover:border-neutral-950 hover:text-black"
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub</span>
                </span>
                <ArrowUpRight className="size-3.5 opacity-60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => cozyAudio.playHover?.(2)}
                className={`${jetbrains.className} group inline-flex items-center justify-between px-4 py-3.5 rounded-2xl border backdrop-blur-md text-[11px] uppercase tracking-[0.18em] transition-all no-underline ${isNight
                    ? "border-slate-800 bg-[#070c1b]/85 text-slate-200 hover:border-indigo-300/70 hover:text-white"
                    : "border-neutral-900/12 bg-[#fcfaf6]/90 text-neutral-800 hover:border-neutral-950 hover:text-black"
                  }`}
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="size-3.5 opacity-60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* RIGHT 61.8% COLUMN: DIRECT TRANSMISSION CONSOLE & MAGNETIC DROPZONE */}
          <div
            onMouseMove={handleVesselMove}
            className={`contact-vessel group relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-colors duration-500 ${cardSurface}`}
          >
            {/* Live Signal Readiness Progress Hairline Across Card Crown */}
            <div className={`relative h-[3px] w-full ${isNight ? "bg-slate-800/90" : "bg-neutral-900/[0.07]"}`}>
              <div
                style={{
                  width: `${isSent ? 100 : readinessPct}%`,
                  transition: "width 520ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className={`h-full ${isNight
                    ? "bg-gradient-to-r from-indigo-500 via-indigo-300 to-cyan-300"
                    : "bg-gradient-to-r from-[#875311] via-[#9b3d0b] to-[#d99b43]"
                  }`}
              />
            </div>

            {/* Active Transmission Sweeping Phase-Beam Overlay */}
            {isSubmitting && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
              >
                <div
                  className={`absolute inset-y-0 w-1/2 -skew-x-12 animate-pulse ${isNight
                      ? "bg-gradient-to-r from-transparent via-indigo-400/15 to-transparent"
                      : "bg-gradient-to-r from-transparent via-[#9b3d0b]/12 to-transparent"
                    }`}
                />
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: isNight
                  ? "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.1), transparent 65%)"
                  : "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(155,61,11,0.08), transparent 65%)",
              }}
            />

            <div className="relative z-10 p-5 xs:p-6 sm:p-8 lg:p-10">
              {isSent ? (
                <TransmissionSuccessSeal
                  isNight={isNight}
                  accentHex={accentHex}
                  accentText={accentText}
                  fileCount={attachedFiles.length}
                  dispatchCode={dispatchCode}
                  onReset={() => {
                    attachedFiles.forEach((f) => {
                      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
                    });
                    setIsSent(false);
                    setFormState({ name: "", email: "", message: "" });
                    setAttachedFiles([]);
                    try {
                      cozyAudio.playSnap?.(1, 1);
                    } catch { }
                  }}
                />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Console Top Telemetry Strip */}
                  <div className={`${jetbrains.className} flex items-center justify-between pb-4 border-b text-[10px] uppercase tracking-[0.22em] ${isNight ? "border-slate-800 text-slate-400" : "border-neutral-900/10 text-neutral-500"
                    }`}>
                    <span>TRANSMISSION CONSOLE</span>
                    <span className={accentText}>SIGNAL · {String(readinessPct).padStart(2, "0")}%</span>
                  </div>

                  {errorMessage && (
                    <div className={`${jetbrains.className} p-3.5 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-500 text-xs`}>
                      {errorMessage}
                    </div>
                  )}

                  {/* GLIDING VERNIER DISCIPLINE SELECTOR */}
                  <div>
                    <label className={`${jetbrains.className} block text-[10px] uppercase tracking-[0.22em] opacity-60 mb-3`}>
                      01 · Discipline & Harmonic Channel
                    </label>
                    <div ref={disciplineWrapRef} className="relative flex flex-wrap gap-2">
                      {/* Gliding GSAP Vernier Pill */}
                      <span
                        ref={disciplineGliderRef}
                        aria-hidden="true"
                        className={`pointer-events-none absolute top-0 left-0 rounded-full opacity-0 shadow-sm ${isNight ? "bg-indigo-300" : "bg-neutral-950"
                          }`}
                      />

                      {DISCIPLINES.map((d, i) => {
                        const isSelected = selectedDisciplineIdx === i;
                        return (
                          <button
                            key={d.label}
                            ref={(el) => {
                              disciplineBtnRefs.current[i] = el;
                            }}
                            type="button"
                            onClick={() => {
                              setSelectedDisciplineIdx(i);
                              typingEnergyRef.current = 0.95;
                              try {
                                cozyAudio.playHover?.(i + 4);
                              } catch { }
                            }}
                            className={`${jetbrains.className} relative z-10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border text-[10px] sm:text-[11px] tracking-[0.04em] sm:tracking-[0.06em] transition-colors duration-300 cursor-pointer ${isSelected
                                ? isNight
                                  ? "border-transparent text-slate-950 font-semibold"
                                  : "border-transparent text-[#fcfaf6] font-medium"
                                : isNight
                                  ? "border-slate-800 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-700"
                                  : "border-neutral-900/12 bg-white/60 text-neutral-700 hover:text-neutral-950 hover:border-neutral-900/30"
                              }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Two-Column Name & Email Row on Desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name Field */}
                    <div className="relative">
                      <label
                        htmlFor="contact-name"
                        className={`${jetbrains.className} flex items-center justify-between text-[10px] uppercase tracking-[0.2em] mb-2 transition-colors ${focusedField === "name" ? accentText : "opacity-60"
                          }`}
                      >
                        <span>02 · Identity</span>
                        {formState.name.trim().length > 1 && <span className="text-emerald-500">●</span>}
                      </label>
                      <div className="relative overflow-hidden rounded-xl">
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          onFocus={() => handleFieldFocus("name", 1)}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Elena Rostova / Studio"
                          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-normal ${inputBase}`}
                        />
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute bottom-0 inset-x-0 h-[2px] origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${focusedField === "name" ? "scale-x-100" : "scale-x-0"
                            } ${isNight ? "bg-indigo-300" : "bg-[#9b3d0b]"}`}
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="relative">
                      <label
                        htmlFor="contact-email"
                        className={`${jetbrains.className} flex items-center justify-between text-[10px] uppercase tracking-[0.2em] mb-2 transition-colors ${focusedField === "email" ? accentText : "opacity-60"
                          }`}
                      >
                        <span>03 · Return Address</span>
                        {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim()) && (
                          <span className="text-emerald-500">●</span>
                        )}
                      </label>
                      <div className="relative overflow-hidden rounded-xl">
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          onFocus={() => handleFieldFocus("email", 2)}
                          onBlur={() => setFocusedField(null)}
                          placeholder="name@domain.com"
                          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-normal ${inputBase}`}
                        />
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute bottom-0 inset-x-0 h-[2px] origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${focusedField === "email" ? "scale-x-100" : "scale-x-0"
                            } ${isNight ? "bg-indigo-300" : "bg-[#9b3d0b]"}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="relative">
                    <label
                      htmlFor="contact-message"
                      className={`${jetbrains.className} flex items-center justify-between text-[10px] uppercase tracking-[0.2em] mb-2 transition-colors ${focusedField === "message" ? accentText : "opacity-60"
                        }`}
                    >
                      <span>04 · Transmission Brief</span>
                      <span className="tabular-nums opacity-70">{formState.message.length} CHR</span>
                    </label>
                    <div className="relative overflow-hidden rounded-xl">
                      <textarea
                        id="contact-message"
                        rows={4}
                        required
                        value={formState.message}
                        onChange={(e) => handleFieldChange("message", e.target.value)}
                        onFocus={() => handleFieldFocus("message", 3)}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Describe your vision, spatial goals, and target horizon..."
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-normal resize-none ${inputBase}`}
                      />
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute bottom-0 inset-x-0 h-[2px] origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${focusedField === "message" ? "scale-x-100" : "scale-x-0"
                          } ${isNight ? "bg-indigo-300" : "bg-[#9b3d0b]"}`}
                      />
                    </div>
                  </div>

                  {/* MAGNETIC VORTEX FILE & IMAGE DROPZONE */}
                  <div>
                    <div className={`${jetbrains.className} flex items-center justify-between text-[10px] uppercase tracking-[0.2em] mb-2`}>
                      <span className="opacity-60">05 · Artifact Staging (Optional)</span>
                      <span className={attachedFiles.length > 0 ? accentText : "opacity-55"}>
                        {attachedFiles.length > 0
                          ? `${attachedFiles.length} ARTIFACT(S) LOCKED`
                          : "PNG · SVG · PDF · ZIP"}
                      </span>
                    </div>

                    <div
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative group/drop rounded-2xl border border-dashed p-4 xs:p-5 sm:p-6 transition-all duration-400 text-center cursor-pointer flex flex-col items-center justify-center overflow-hidden ${isDragging
                          ? isNight
                            ? "border-indigo-300 bg-indigo-950/55 scale-[1.015] shadow-[0_0_40px_rgba(165,180,252,0.2)]"
                            : "border-[#9b3d0b] bg-[#f7efe2] scale-[1.015] shadow-[0_0_36px_rgba(155,61,11,0.14)]"
                          : isNight
                            ? "border-slate-700/90 bg-slate-900/45 hover:border-indigo-400/60 hover:bg-slate-900/75"
                            : "border-neutral-900/18 bg-neutral-50/55 hover:border-[#9b3d0b]/55 hover:bg-white/90"
                        }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.zip,.txt"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />

                      {/* Concentric Golden-Ratio Rotating Capture Reticle */}
                      <div className="relative size-14 sm:size-16 flex items-center justify-center mb-2.5">
                        <svg
                          viewBox="0 0 80 80"
                          fill="none"
                          className={`absolute inset-0 w-full h-full transition-transform duration-500 ${isDragging ? "scale-110" : "group-hover/drop:scale-105"
                            }`}
                        >
                          <g className="dropzone-orbit">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              stroke={accentHex}
                              strokeOpacity={isDragging ? "0.85" : "0.35"}
                              strokeWidth="1"
                              strokeDasharray="4 6"
                            />
                            <circle cx="40" cy="6" r="2.2" fill={accentHex} />
                          </g>
                          <circle
                            cx="40"
                            cy="40"
                            r={(34 / PHI).toFixed(1)}
                            stroke={accentHex}
                            strokeOpacity={isDragging ? "0.6" : "0.2"}
                            strokeWidth="0.85"
                          />
                        </svg>
                        <UploadCloud
                          className={`size-5 transition-transform duration-300 ${isDragging ? "-translate-y-1 scale-110" : "group-hover/drop:-translate-y-0.5"
                            } ${accentText}`}
                        />
                      </div>

                      <div className="text-xs font-medium mb-1">
                        {isDragging ? (
                          <span className={accentText}>Release to lock artifacts into payload</span>
                        ) : (
                          <>
                            <span className={`underline underline-offset-4 ${accentText}`}>
                              Select files
                            </span>{" "}
                            or drop references anywhere inside reticle
                          </>
                        )}
                      </div>

                      <p className={`${jetbrains.className} text-[10px] opacity-55`}>
                        Images, design briefs, PDFs or archives · Max 15MB each
                      </p>
                    </div>

                    {/* Staged Artifacts Manifest */}
                    {attachedFiles.length > 0 && (
                      <div className="mt-3.5 space-y-2">
                        {attachedFiles.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${isNight
                                ? "border-slate-800 bg-slate-900/80"
                                : "border-neutral-900/12 bg-white shadow-xs"
                              }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              {item.isImage && item.previewUrl ? (
                                <img
                                  src={item.previewUrl}
                                  alt={item.name}
                                  className="size-9 rounded-lg object-cover border border-current/15 shrink-0"
                                />
                              ) : (
                                <div
                                  className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${isNight ? "bg-slate-800 text-indigo-300" : "bg-neutral-100 text-[#9b3d0b]"
                                    }`}
                                >
                                  <FileText className="size-4" />
                                </div>
                              )}
                              <div className="truncate">
                                <div className="text-xs font-medium truncate max-w-[200px] sm:max-w-xs">
                                  {item.name}
                                </div>
                                <div className={`${jetbrains.className} text-[10px] opacity-55`}>
                                  {formatFileSize(item.size)}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(item.id);
                              }}
                              className="size-7 rounded-lg opacity-60 hover:opacity-100 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MAGNETIC DUAL-PLANE TRANSMIT CTA */}
                  <div className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isNight ? "border-slate-800" : "border-neutral-900/10"
                    }`}>
                    <span className={`${jetbrains.className} text-[10px] opacity-60 flex items-center gap-1.5`}>
                      <Paperclip className={`size-3.5 ${accentText}`} />
                      <span>Direct uplink → {TARGET_EMAIL}</span>
                    </span>

                    <div ref={magneticSubmitRef} className="w-full sm:w-auto inline-block will-change-transform">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`${jetbrains.className} group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shadow-lg disabled:opacity-55 cursor-pointer ${isNight
                            ? "bg-white text-neutral-950 hover:bg-indigo-100"
                            : "bg-neutral-950 text-[#fcfaf6] hover:bg-black"
                          }`}
                      >
                        <span>{isSubmitting ? "Transmitting..." : "Dispatch Signal"}</span>
                        <span className="relative flex size-4 items-center justify-center overflow-hidden">
                          <Send className="size-3.5 absolute transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-5 group-hover/btn:-translate-y-5" />
                          <Send className="size-3.5 absolute -translate-x-5 translate-y-5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* EDITORIAL MONOGRAPH COLOPHON FOOTER */}
        <footer
          className={`mt-16 sm:mt-24 pt-6 sm:pt-8 border-t flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 ${isNight ? "border-slate-800/90" : "border-neutral-900/12"
            }`}
        >
          <div>
            <span className="font-['Clash_Display',sans-serif] text-lg sm:text-xl font-semibold tracking-tight">
              SASWAT{" "}
              <span className={`${bodoni.className} italic font-medium ${accentText}`}>Mohanty</span>
            </span>
            <span className={`${jetbrains.className} block mt-1 text-[10px] uppercase tracking-[0.22em] opacity-55`}>
              © 2026 ALL RIGHTS RESERVED · EDITION XXVI
            </span>
          </div>

          <div className={`${jetbrains.className} flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] opacity-65`}>
            <span className={`font-semibold opacity-100 ${accentText}`}>Φ 1.61803</span>
            <span>SPATIAL COMPUTING & INTERFACE DESIGN</span>
            <span>NEW DELHI, INDIA</span>
          </div>
        </footer>
      </main>
    </div>
  );
}