"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bodoni_Moda, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import ShipScene from "@/components/demos/ship-scene";
import AmbientSound from "@/components/ui/ambient-sound";
import ArchitecturalGrid from "@/components/ui/architectural-grid";
import ContributionSkyline from "@/components/ui/contribution-skyline";
import GlassLoader from "@/components/ui/glass-loader";
import TimeClock, { getSystemTimeTheme } from "@/components/ui/time-clock";
import FramelessNav from "@/components/ui/frameless-nav";
import { cozyAudio } from "@/lib/cozy-sound";
import initialGithubContributions from "@/data/github-contributions.json";

/* ============================================================================
   ARCHITECTURAL EDITORIAL FONT TRIAD (+ Existing Clash Display)
   ============================================================================ */
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
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 137.507764°
const SCRAMBLE_GLYPHS = "ΦΔΩ01618✦·/—ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const CHAPTERS = [
  { id: "hero", num: "00", label: "Origin" },
  { id: "mechanics", num: "01", label: "Kinematics" },
  { id: "convergence", num: "02", label: "Equilibrium" },
  { id: "synthesis", num: "03", label: "Shaders" },
  { id: "showcase", num: "04", label: "Works" },
  { id: "skyline", num: "05", label: "Cadence" },
];

// Analytical Golden Logarithmic Spiral: r(θ) = a · Φ^(2θ/π) with exact Euclidean pixel length
function buildLogSpiral(cx, cy, startTheta, maxTheta, a, steps = 130) {
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
    if (i === 0) {
      d = `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      length += Math.hypot(x - px, y - py);
    }
    px = x;
    py = y;
  }
  return { d, length: Number(length.toFixed(2)) };
}

// Ramanujan high-precision ellipse perimeter for exact SVG stroke-dasharray drawing
function ellipsePerimeter(rx, ry) {
  return Number(
    (Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)))).toFixed(2)
  );
}

/* ============================================================================
   KINETIC TYPOGRAPHY PRIMITIVES
   1. ScrambleText  — Architectural glyph decoder (mount + hover)
   2. KineticHeadline — 3D masked word-blade splitter mixing Sans & Bodoni Italic
   ============================================================================ */
function ScrambleText({ text, className = "", triggerOnMount = false, delayMs = 300 }) {
  const [output, setOutput] = useState(text);
  const rafRef = useRef(0);

  const runDecode = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const chars = text.split("");
    const totalFrames = Math.max(18, Math.min(34, chars.length * 1.4));
    let frame = 0;

    const step = () => {
      frame += 1;
      const progress = frame / totalFrames;
      const lockedCount = Math.floor(progress * chars.length);

      const next = chars
        .map((ch, idx) => {
          if (ch === " " || ch === "·" || ch === "/" || ch === "✦") return ch;
          if (idx < lockedCount) return ch;
          return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        })
        .join("");

      setOutput(next);

      if (frame < totalFrames) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setOutput(text);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, [text]);

  useEffect(() => {
    setOutput(text);
    if (!triggerOnMount) return;
    const timer = setTimeout(runDecode, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, triggerOnMount, delayMs, runDecode]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <span onMouseEnter={runDecode} className={`inline-block ${className}`}>
      {output}
    </span>
  );
}

function KineticHeadline({ segments, className = "", accentClass = "" }) {
  return (
    <h2
      style={{ perspective: "900px" }}
      className={`reveal-heading ${className}`}
    >
      {segments.map((seg, sIdx) => {
        const words = seg.text.split(" ");
        return words.map((word, wIdx) => {
          const isSerif = seg.style === "serif";
          const isAccent = seg.style === "accent";
          const isLastWord = sIdx === segments.length - 1 && wIdx === words.length - 1;
          return (
            <span
              key={`${sIdx}-${wIdx}`}
              className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em] pr-[0.06em]"
            >
              <span
                className={`kinetic-word inline-block will-change-transform ${isSerif
                    ? `${bodoni.className} italic font-medium tracking-[-0.02em] text-[1.06em]`
                    : isAccent
                      ? `${bodoni.className} italic font-semibold tracking-[-0.02em] text-[1.08em] ${accentClass}`
                      : "font-['Clash_Display',sans-serif] font-semibold tracking-[-0.025em]"
                  }`}
              >
                {word}
                {!isLastWord ? "\u00A0" : ""}
              </span>
            </span>
          );
        });
      })}
    </h2>
  );
}

/* ============================================================================
   SECTION 01 DIAGRAM: 4 CONCENTRIC KEPLERIAN ORBITAL VECTORS (Φ⁰ → Φ⁻³)
   ============================================================================ */
function OrbitalVectorsChamber({ isNight }) {
  const wrapRef = useRef(null);
  const dotRefs = useRef([]);

  const orbits = useMemo(() => {
    const specs = [
      { scale: 1, tiltDeg: -13, speed: 0.42, phase: 0.4 },
      { scale: 1 / PHI, tiltDeg: 21, speed: -0.68, phase: 2.1 },
      { scale: 1 / (PHI * PHI), tiltDeg: -34, speed: 1.05, phase: 4.0 },
      { scale: 1 / (PHI * PHI * PHI), tiltDeg: 11, speed: -1.62, phase: 5.2 },
    ];
    return specs.map((s) => {
      const rx = Number((144 * s.scale).toFixed(2));
      const ry = Number((50 * s.scale).toFixed(2));
      return {
        ...s,
        rx,
        ry,
        rad: (s.tiltDeg * Math.PI) / 180,
        perim: ellipsePerimeter(rx, ry),
      };
    });
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let rafId = 0;
    let visible = false;
    let t = 0;

    const tick = () => {
      if (!visible) return;
      t += 0.016;
      for (let i = 0; i < orbits.length; i++) {
        const node = dotRefs.current[i];
        if (!node) continue;
        const o = orbits[i];
        const u = t * o.speed + o.phase;
        const lx = Math.cos(u) * o.rx;
        const ly = Math.sin(u) * o.ry;
        const cosT = Math.cos(o.rad);
        const sinT = Math.sin(o.rad);
        const x = 180 + lx * cosT - ly * sinT;
        const y = 75 + lx * sinT + ly * cosT;
        node.setAttribute("cx", x.toFixed(2));
        node.setAttribute("cy", y.toFixed(2));
      }
      rafId = requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [orbits]);

  const accent = isNight ? "#a5b4fc" : "#9a6c27";
  const ink = isNight ? "rgba(226,232,240,0.28)" : "rgba(23,23,23,0.22)";

  return (
    <div
      ref={wrapRef}
      className={`relative h-36 sm:h-40 w-full rounded-2xl border overflow-hidden mb-7 ${isNight ? "bg-slate-900/55 border-slate-800/90" : "bg-[#faf8f4]/85 border-black/[0.08]"
        }`}
    >
      <svg viewBox="0 0 360 150" fill="none" className="w-full h-full overflow-hidden">
        <line x1="20" y1="75" x2="340" y2="75" stroke={ink} strokeWidth="0.6" strokeDasharray="2 5" />
        <line x1="180" y1="12" x2="180" y2="138" stroke={ink} strokeWidth="0.6" strokeDasharray="2 5" />

        {orbits.map((o, idx) => (
          <ellipse
            key={idx}
            cx="180"
            cy="75"
            rx={o.rx}
            ry={o.ry}
            transform={`rotate(${o.tiltDeg} 180 75)`}
            stroke={idx % 2 === 0 ? accent : ink}
            strokeOpacity={idx % 2 === 0 ? 0.72 : 0.9}
            strokeWidth={idx === 0 ? "1.15" : "0.9"}
            strokeDasharray={o.perim}
            strokeDashoffset={o.perim}
            className="sec-draw-path"
          />
        ))}

        <circle cx="180" cy="75" r="3" fill={accent} />
        <circle cx="180" cy="75" r="8" stroke={accent} strokeOpacity="0.35" strokeWidth="0.8" />

        {orbits.map((_, idx) => (
          <circle
            key={idx}
            ref={(el) => {
              dotRefs.current[idx] = el;
            }}
            cx="180"
            cy="75"
            r={idx === 0 ? "3.2" : "2.4"}
            fill={idx % 2 === 0 ? accent : isNight ? "#f8fafc" : "#171717"}
          />
        ))}
      </svg>

      <div
        className={`${jetbrains.className} absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[9px] tracking-[0.22em] uppercase pointer-events-none ${isNight ? "text-slate-400" : "text-neutral-500"
          }`}
      >
        <span>Φ⁰ · Φ⁻¹ · Φ⁻² · Φ⁻³</span>
        <span>KEPLERIAN HARMONICS</span>
      </div>
    </div>
  );
}

/* ============================================================================
   SECTION 02 DIAGRAM: VESICA PISCIS (√3:1) + 13-NODE QUARTZ PHYLLOTAXIS CREST
   ============================================================================ */
function OpticalVesicaCrest({ isNight }) {
  const geom = useMemo(() => {
    const r = 46;
    const circ = Number((2 * Math.PI * r).toFixed(2));
    const outerR = Number((r * PHI).toFixed(2));
    const outerCirc = Number((2 * Math.PI * outerR).toFixed(2));

    const seeds = Array.from({ length: 13 }, (_, i) => {
      const k = i + 1;
      const rad = 5.6 * Math.sqrt(k);
      const a = k * GOLDEN_ANGLE;
      return {
        x: (210 + Math.cos(a) * rad).toFixed(2),
        y: (60 + Math.sin(a) * rad).toFixed(2),
        r: (1.25 + (1 - k / 13) * 1.1).toFixed(2),
      };
    });

    return { r, circ, outerR, outerCirc, seeds };
  }, []);

  const accent = isNight ? "#a5b4fc" : "#9a6c27";
  const ink = isNight ? "rgba(226,232,240,0.22)" : "rgba(23,23,23,0.18)";

  return (
    <div className="w-full max-w-md mx-auto h-28 mb-4 overflow-hidden">
      <svg viewBox="0 0 420 120" fill="none" className="w-full h-full overflow-hidden">
        <line x1="20" y1="60" x2="400" y2="60" stroke={ink} strokeWidth="0.7" strokeDasharray="2 5" />

        <circle
          cx="176"
          cy="60"
          r={geom.outerR}
          stroke={ink}
          strokeWidth="0.75"
          strokeDasharray={geom.outerCirc}
          strokeDashoffset={geom.outerCirc}
          className="sec-draw-path"
        />
        <circle
          cx="244"
          cy="60"
          r={geom.outerR}
          stroke={ink}
          strokeWidth="0.75"
          strokeDasharray={geom.outerCirc}
          strokeDashoffset={geom.outerCirc}
          className="sec-draw-path"
        />

        <circle
          cx="187"
          cy="60"
          r={geom.r}
          stroke={accent}
          strokeOpacity="0.72"
          strokeWidth="1.05"
          strokeDasharray={geom.circ}
          strokeDashoffset={geom.circ}
          className="sec-draw-path"
        />
        <circle
          cx="233"
          cy="60"
          r={geom.r}
          stroke={accent}
          strokeOpacity="0.72"
          strokeWidth="1.05"
          strokeDasharray={geom.circ}
          strokeDashoffset={geom.circ}
          className="sec-draw-path"
        />

        <polygon
          points="210,20.2 233,60 210,99.8 187,60"
          stroke={isNight ? "#f8fafc" : "#171717"}
          strokeOpacity="0.4"
          strokeWidth="0.85"
        />

        <g className="vesica-crystal-spin">
          {geom.seeds.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={accent} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ============================================================================
   SECTION 03 DIAGRAM: SCHLICK-FRESNEL STANDING WAVE SHADER MANIFOLD (1, 1/Φ, 1/Φ²)
   ============================================================================ */
function FresnelShaderChamber({ isNight }) {
  const waves = useMemo(() => {
    const build = (n, amp) => {
      let d = "";
      let len = 0;
      let px = 0;
      let py = 0;
      for (let i = 0; i <= 100; i++) {
        const u = i / 100;
        const x = 22 + u * 316;
        const env = 0.45 + 0.55 * Math.sin(Math.PI * u);
        const y = 75 - Math.sin(n * Math.PI * u) * amp * env;
        if (i === 0) d = `M ${x.toFixed(2)} ${y.toFixed(2)}`;
        else {
          d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
          len += Math.hypot(x - px, y - py);
        }
        px = x;
        py = y;
      }
      return { d, len: Number(len.toFixed(2)) };
    };
    return {
      w1: build(1, 52),
      w2: build(2, 52 / PHI),
      w3: build(3, 52 / (PHI * PHI)),
    };
  }, []);

  const accent = isNight ? "#a5b4fc" : "#9a6c27";
  const primary = isNight ? "#f8fafc" : "#171717";
  const faint = isNight ? "rgba(226,232,240,0.22)" : "rgba(23,23,23,0.18)";

  return (
    <div
      className={`relative h-36 sm:h-40 w-full rounded-2xl border overflow-hidden mb-7 ${isNight ? "bg-slate-900/55 border-slate-800/90" : "bg-[#faf8f4]/85 border-black/[0.08]"
        }`}
    >
      <svg viewBox="0 0 360 150" fill="none" className="w-full h-full overflow-hidden">
        <line x1="22" y1="75" x2="338" y2="75" stroke={faint} strokeWidth="0.75" />
        <line
          x1="22"
          y1="16"
          x2="22"
          y2="134"
          stroke={accent}
          strokeOpacity="0.5"
          strokeWidth="0.9"
          strokeDasharray="2 3"
          className="fresnel-scanline"
        />

        <path
          d={waves.w1.d}
          stroke={primary}
          strokeOpacity="0.82"
          strokeWidth="1.25"
          strokeDasharray={waves.w1.len}
          strokeDashoffset={waves.w1.len}
          className="sec-draw-path fresnel-w1"
        />
        <path
          d={waves.w2.d}
          stroke={accent}
          strokeWidth="1.2"
          strokeDasharray={waves.w2.len}
          strokeDashoffset={waves.w2.len}
          className="sec-draw-path fresnel-w2"
        />
        <path
          d={waves.w3.d}
          stroke={faint}
          strokeWidth="1"
          strokeDasharray={waves.w3.len}
          strokeDashoffset={waves.w3.len}
          className="sec-draw-path fresnel-w3"
        />

        <circle cx="22" cy="75" r="2.8" fill={accent} />
        <circle cx="180" cy="75" r="2.2" fill={primary} />
        <circle cx="338" cy="75" r="2.8" fill={accent} />
      </svg>

      <div
        className={`${jetbrains.className} absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[9px] tracking-[0.22em] uppercase pointer-events-none ${isNight ? "text-slate-400" : "text-neutral-500"
          }`}
      >
        <span>F(θ) = F₀ + (1−F₀)(1−cosθ)⁵</span>
        <span>ACES · PBR</span>
      </div>
    </div>
  );
}

/* ============================================================================
   SECTION 04 CARD 01: INTERSECTION-GATED 3D GOLDEN ICOSAHEDRON CANVAS
   ============================================================================ */
function GoldenPolyhedronMiniCanvas({ isNight, hovered }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ isNight, hovered });
  stateRef.current = { isNight, hovered };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId = 0;
    let visible = false;

    const verts = [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ].map(([x, y, z]) => {
      const len = Math.hypot(x, y, z);
      return [x / len, y / len, z / len];
    });

    const edges = [];
    for (let i = 0; i < verts.length; i++) {
      for (let j = i + 1; j < verts.length; j++) {
        const d = Math.hypot(
          verts[i][0] - verts[j][0],
          verts[i][1] - verts[j][1],
          verts[i][2] - verts[j][2]
        );
        if (d < 1.15) edges.push([i, j]);
      }
    }

    const innerS = 1 / PHI;
    const oct = [
      [innerS, 0, 0], [-innerS, 0, 0], [0, innerS, 0],
      [0, -innerS, 0], [0, 0, innerS], [0, 0, -innerS],
    ];
    const octEdges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2],
    ];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let a = 0;
    const proj = (pts, ax, ay, R, cx, cy) => {
      const ca = Math.cos(ax), sa = Math.sin(ax);
      const cb = Math.cos(ay), sb = Math.sin(ay);
      return pts.map(([x, y, z]) => {
        const y1 = y * ca - z * sa;
        const z1 = y * sa + z * ca;
        const x2 = x * cb + z1 * sb;
        const z2 = -x * sb + z1 * cb;
        const sc = 3.2 / (3.2 + z2);
        return [cx + x2 * R * sc, cy + y1 * R * sc, z2];
      });
    };

    const draw = () => {
      if (!visible) return;
      const w = canvas.parentElement?.clientWidth || 260;
      const h = canvas.parentElement?.clientHeight || 190;
      ctx.clearRect(0, 0, w, h);

      const { isNight: night, hovered: hov } = stateRef.current;
      a += hov ? 0.024 : 0.0085;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.37;

      const accent = night ? "rgba(165,180,252,0.78)" : "rgba(154,108,39,0.82)";
      const frontStroke = night ? "rgba(248,250,252,0.85)" : "rgba(23,23,23,0.8)";
      const backStroke = night ? "rgba(148,163,184,0.2)" : "rgba(23,23,23,0.16)";

      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
      ctx.strokeStyle = night ? "rgba(165,180,252,0.18)" : "rgba(154,108,39,0.24)";
      ctx.lineWidth = 0.85;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      const pOct = proj(oct, -a * 1.25, -a * 0.9, R, cx, cy);
      ctx.beginPath();
      for (const [i, j] of octEdges) {
        ctx.moveTo(pOct[i][0], pOct[i][1]);
        ctx.lineTo(pOct[j][0], pOct[j][1]);
      }
      ctx.strokeStyle = accent;
      ctx.lineWidth = 0.95;
      ctx.stroke();

      const pIco = proj(verts, a * 0.72, a, R, cx, cy);
      for (const [i, j] of edges) {
        const front = (pIco[i][2] + pIco[j][2]) * 0.5 < 0.08;
        ctx.beginPath();
        ctx.moveTo(pIco[i][0], pIco[i][1]);
        ctx.lineTo(pIco[j][0], pIco[j][1]);
        ctx.strokeStyle = front ? frontStroke : backStroke;
        ctx.lineWidth = front ? 1.1 : 0.7;
        ctx.stroke();
      }

      for (const [px, py, pz] of pIco) {
        ctx.beginPath();
        ctx.arc(px, py, pz < 0.08 ? 2.3 : 1.3, 0, Math.PI * 2);
        ctx.fillStyle = pz < 0.08 ? accent : backStroke;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(canvas);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full block" />;
}

/* ============================================================================
   SECTION 04 CARD 02 & 03 DIAGRAMS: 3:5 LISSAJOUS + 55-NODE PHYLLOTAXIS
   ============================================================================ */
function ShowcaseMicroDiagram({ type, isNight }) {
  const geom = useMemo(() => {
    if (type === "aura") {
      let d = "";
      let len = 0;
      let px = 0;
      let py = 0;
      for (let i = 0; i <= 220; i++) {
        const u = (i / 220) * Math.PI * 2;
        const x = 130 + Math.sin(3 * u + Math.PI / 2) * 96;
        const y = 55 + Math.sin(5 * u) * 38;
        if (i === 0) d = `M ${x.toFixed(2)} ${y.toFixed(2)}`;
        else {
          d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
          len += Math.hypot(x - px, y - py);
        }
        px = x;
        py = y;
      }
      return { path: d, length: Number(len.toFixed(2)) };
    }

    const seeds = Array.from({ length: 55 }, (_, i) => {
      const k = i + 1;
      const r = 5.2 * Math.sqrt(k);
      const a = k * GOLDEN_ANGLE;
      return {
        x: (110 + Math.cos(a) * r).toFixed(2),
        y: (48 + Math.sin(a) * r).toFixed(2),
        r: (1.1 + (k / 55) * 1.25).toFixed(2),
        op: (0.25 + (1 - k / 55) * 0.65).toFixed(2),
      };
    });
    return { seeds };
  }, [type]);

  const accent = isNight ? "#a5b4fc" : "#9a6c27";
  const faint = isNight ? "rgba(226,232,240,0.2)" : "rgba(23,23,23,0.16)";

  if (type === "aura") {
    const seg = Number((geom.length * 0.18).toFixed(2));
    const gap = Number((geom.length - seg).toFixed(2));
    return (
      <svg viewBox="0 0 260 110" fill="none" className="w-full h-full overflow-hidden">
        <path d={geom.path} stroke={faint} strokeWidth="0.9" />
        <path
          d={geom.path}
          data-len={geom.length}
          stroke={accent}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray={`${seg} ${gap}`}
          className="aura-comet"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 96" fill="none" className="w-full h-full overflow-hidden">
      <g className="kroma-phyllo-spin">
        {geom.seeds.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={accent} fillOpacity={s.op} />
        ))}
      </g>
    </svg>
  );
}

/* ============================================================================
   MONUMENTAL KINETIC EDITORIAL HERO MASTHEAD ("SASWAT / Mohanty")
   - Clash Display Architectural Sans + High-Contrast Bodoni Moda Italic
   - Live Gaussian Proximity Glyph-Wave Physics on Pointer Sweep
   - 4-Theme Contrast Engineering (Always Razor-Legible Over 3D Clouds & Sky)
   ============================================================================ */
function EditorialHeroMasthead({ activeTheme = "sunset", isNight }) {
  const wrapRef = useRef(null);
  const firstGlyphRefs = useRef([]);
  const lastGlyphRefs = useRef([]);
  const starRef = useRef(null);
  const shimmerRef = useRef(null);
  const lastRowRef = useRef(null);

  // High-contrast ink & atmospheric veil palette tuned to every ShipScene sky
  const palette = useMemo(() => {
    if (isNight || activeTheme === "night") {
      return {
        accentHex: "#c7d2fe",
        accentText: "text-indigo-200",
        firstInk: "text-white",
        lastInk: "text-[#e9edff]",
        subInk: "text-slate-100",
        mutedInk: "text-slate-300",
        ruleBg: "bg-indigo-300/80",
        dividerBg: "bg-indigo-200/25",
        chip: "border-indigo-300/45 bg-[#060a17]/78 text-indigo-100",
        shimmer: "from-transparent via-indigo-200/40 to-transparent",
        strokeColor: "rgba(199, 210, 254, 0.22)",
        textShadow: "none",
        subShadow: "none",
        scrim:
          "radial-gradient(ellipse 84% 78% at 32% 58%, rgba(4, 7, 20, 0.72) 0%, rgba(4, 7, 20, 0.34) 56%, transparent 82%)",
      };
    }

    if (activeTheme === "sunset") {
      return {
        accentHex: "#9b3d0b",
        accentText: "text-[#9b3d0b]",
        firstInk: "text-[#110905]",
        lastInk: "text-[#261107]",
        subInk: "text-[#1d0f08]",
        mutedInk: "text-[#3a2013]",
        ruleBg: "bg-[#9b3d0b]",
        dividerBg: "bg-[#261107]/28",
        chip: "border-[#9b3d0b]/55 bg-[#fff8ee]/86 text-[#1d0f08]",
        shimmer: "from-transparent via-[#fff3da]/75 to-transparent",
        strokeColor: "rgba(155, 61, 11, 0.2)",
        textShadow: "none",
        subShadow: "none",
        scrim: "transparent",
      };
    }

    // morning / afternoon
    return {
      accentHex: "#875311",
      accentText: "text-[#875311]",
      firstInk: "text-[#090c12]",
      lastInk: "text-[#161c28]",
      subInk: "text-[#111622]",
      mutedInk: "text-[#2b3344]",
      ruleBg: "bg-[#875311]",
      dividerBg: "bg-[#090c12]/22",
      chip: "border-[#875311]/55 bg-white/88 text-[#090c12]",
      shimmer: "from-transparent via-white/80 to-transparent",
      strokeColor: "rgba(135, 83, 17, 0.2)",
      textShadow: "none",
      subShadow: "none",
      scrim: "transparent",
    };
  }, [activeTheme, isNight]);

  // Live Gaussian Proximity Glyph-Wave Physics across both name rows
  const handleMastheadMove = (e) => {
    const mx = e.clientX;
    const my = e.clientY;
    const radius = 150;

    const applyWave = (nodes, ampY, ampRot) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;
        const r = node.getBoundingClientRect();
        const cx = r.left + r.width * 0.5;
        const cy = r.top + r.height * 0.5;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          const gauss = Math.exp(-(dist * dist) / (2 * 62 * 62));
          gsap.to(node, {
            y: -ampY * gauss,
            rotateZ: -(dx / radius) * ampRot * gauss,
            scale: 1 + 0.055 * gauss,
            duration: 0.36,
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.to(node, {
            y: 0,
            rotateZ: 0,
            scale: 1,
            duration: 0.55,
            ease: "elastic.out(1, 0.65)",
            overwrite: "auto",
          });
        }
      }
    };

    applyWave(firstGlyphRefs.current, 11, 5.5);
    applyWave(lastGlyphRefs.current, 9, 4.5);
  };

  const handleMastheadEnter = () => {
    if (lastRowRef.current) {
      gsap.to(lastRowRef.current, { letterSpacing: "0.05em", duration: 0.7, ease: "expo.out" });
    }
    if (starRef.current) {
      gsap.to(starRef.current, {
        rotation: "+=135",
        scale: 1.25,
        duration: 0.85,
        ease: "expo.out",
        transformOrigin: "50% 50%",
      });
    }
    if (shimmerRef.current) {
      gsap.fromTo(
        shimmerRef.current,
        { xPercent: -120, opacity: 0 },
        { xPercent: 145, opacity: 0.85, duration: 0.95, ease: "power2.inOut" }
      );
    }
  };

  const handleMastheadLeave = () => {
    const all = [...firstGlyphRefs.current, ...lastGlyphRefs.current].filter(Boolean);
    gsap.to(all, {
      y: 0,
      rotateZ: 0,
      scale: 1,
      duration: 0.72,
      ease: "elastic.out(1, 0.58)",
      overwrite: "auto",
    });
    if (lastRowRef.current) {
      gsap.to(lastRowRef.current, { letterSpacing: "0.01em", duration: 0.7, ease: "power3.out" });
    }
    if (starRef.current) {
      gsap.to(starRef.current, { scale: 1, duration: 0.6, ease: "power3.out" });
    }
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMastheadMove}
      onMouseEnter={handleMastheadEnter}
      onMouseLeave={handleMastheadLeave}
      className="hero-identity-container relative max-w-4xl text-left select-none pointer-events-auto cursor-default"
    >
      {/* Edge-less Feathered Contrast Veil (Guaranteed Crisp Contrast Over Any Cloud/Sky) */}
      <div
        aria-hidden="true"
        className="hero-exit-meta pointer-events-none absolute -inset-x-12 -inset-y-10 z-0 transition-all duration-700"
        style={{ background: palette.scrim }}
      />

      {/* Precision Top Architectural Eyebrow + Coordinates */}
      <div
        style={{ textShadow: palette.subShadow }}
        className={`${jetbrains.className} hero-exit-meta hero-sub-reveal relative z-10 flex flex-wrap items-center gap-3 mb-3 sm:mb-4`}
      >
        <span className={`hero-couture-rule block h-[2px] w-9 sm:w-12 origin-left ${palette.ruleBg}`} />
        <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.32em] ${palette.subInk}`}>
          <ScrambleText text="MONOGRAPH // EDITION XXVI" triggerOnMount delayMs={420} />
        </span>
        <span className={`hidden sm:inline-block text-[10px] tracking-[0.22em] opacity-75 ${palette.accentText}`}>
          [28.61°N · 77.20°E]
        </span>
      </div>

      {/* MONUMENTAL MIXED-TYPEFACE MASTHEAD */}
      <h1 className="relative z-10">
        {/* ROW 1: Bold Architectural Clash Display ("SASWAT") + Floating Index Stamp */}
        <span className="hero-exit-first flex items-end gap-3 sm:gap-6 will-change-transform">
          <span
            style={{ textShadow: palette.textShadow }}
            className={`font-['Clash_Display',sans-serif] relative inline-flex items-baseline pr-2 py-1 text-[2.65rem] xs:text-[3.1rem] sm:text-[4.8rem] md:text-[6.2rem] lg:text-[7.4rem] font-semibold uppercase leading-none sm:leading-[0.96] tracking-[0.03em] transition-colors duration-500 ${palette.firstInk}`}
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <span
                ref={shimmerRef}
                className={`absolute inset-y-0 w-1/3 -skew-x-12 opacity-0 blur-md bg-gradient-to-r ${palette.shimmer}`}
              />
            </span>

            {"SASWAT".split("").map((ch, i) => (
              <span key={i} className="inline-block">
                <span
                  ref={(el) => {
                    firstGlyphRefs.current[i] = el;
                  }}
                  className={`hero-enter-char inline-block will-change-transform ${i === 0 ? palette.accentText : ""
                    }`}
                >
                  {ch}
                </span>
              </span>
            ))}
          </span>

          {/* Editorial Shoulder Spec Stamp */}
          <span
            style={{ textShadow: palette.subShadow }}
            className={`${jetbrains.className} hero-sub-reveal hidden md:inline-flex flex-col items-start gap-1 pb-2.5 shrink-0`}
          >
            <span className="inline-flex items-center gap-2">
              <span className={`hero-couture-rule block h-px w-10 origin-left ${palette.dividerBg}`} />
              <svg
                ref={starRef}
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-3.5 overflow-hidden will-change-transform"
              >
                <path
                  d="M12 1 C12.4 8.2 15.8 11.6 23 12 C15.8 12.4 12.4 15.8 12 23 C11.6 15.8 8.2 12.4 1 12 C8.2 11.6 11.6 8.2 12 1 Z"
                  fill={palette.accentHex}
                />
              </svg>
              <span className={`text-[10px] font-semibold tracking-[0.26em] ${palette.accentText}`}>
                Φ 1.618
              </span>
            </span>
            <span className={`text-[9px] uppercase tracking-[0.26em] ${palette.mutedInk}`}>
              CREATIVE ENGINEER
            </span>
          </span>
        </span>

        {/* ROW 2: Golden-Indented High-Contrast Bodoni Moda Italic ("Mohanty") + Framed Seal */}
        <span className="hero-exit-last flex items-start gap-2.5 sm:gap-4 pl-3 xs:pl-6 sm:pl-14 md:pl-20 lg:pl-28 mt-1 sm:mt-2 will-change-transform">
          <span
            ref={lastRowRef}
            style={{ letterSpacing: "0.01em", textShadow: palette.textShadow }}
            className={`${bodoni.className} relative inline-flex items-baseline pr-3 xs:pr-5 py-1 text-[2.85rem] xs:text-[3.35rem] sm:text-[5.1rem] md:text-[6.5rem] lg:text-[7.75rem] italic font-semibold leading-none sm:leading-[0.98] transition-colors duration-500 ${palette.lastInk}`}
          >
            {"Mohanty".split("").map((ch, i) => (
              <span key={i} className="inline-block pr-[0.02em]">
                <span
                  ref={(el) => {
                    lastGlyphRefs.current[i] = el;
                  }}
                  className="hero-enter-char inline-block will-change-transform"
                >
                  {ch}
                </span>
              </span>
            ))}
          </span>

          {/* Architectural Edition Pill Seal */}
          <span
            className={`${jetbrains.className} hero-title-badge mt-2 sm:mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] backdrop-blur-md shrink-0 ${palette.chip}`}
          >
            <span className={palette.accentText}>®</span>
            <span className="hidden sm:inline">26</span>
          </span>
        </span>
      </h1>

      {/* Structured Editorial Colophon Strip */}
      <div
        style={{ textShadow: palette.subShadow }}
        className="hero-exit-meta hero-sub-reveal relative z-10 mt-5 sm:mt-6 pt-3.5"
      >
        <div className={`hero-couture-rule h-px w-full max-w-lg mb-3.5 origin-left ${palette.dividerBg}`} />
        <div
          className={`${jetbrains.className} flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[10px] sm:text-[11px] font-medium tracking-[0.22em] uppercase ${palette.subInk}`}
        >
          <ScrambleText text="SPATIAL COMPUTING" triggerOnMount delayMs={620} />
          <span className={`text-[9px] ${palette.accentText}`}>✦</span>
          <ScrambleText text="INTERACTIVE SYSTEMS" triggerOnMount delayMs={780} />
          <span className={`text-[9px] ${palette.accentText}`}>✦</span>
          <ScrambleText text="WEBGL DIRECTION" triggerOnMount delayMs={940} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN LANDING PAGE
   ============================================================================ */
export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [contributions, setContributions] = useState(
    initialGithubContributions?.contributions || []
  );
  const [timeMode, setTimeMode] = useState("auto"); // "auto" | "morning" | "afternoon" | "sunset" | "night"
  const [systemTheme, setSystemTheme] = useState("sunset");
  const [activeChapter, setActiveChapter] = useState("hero");
  const [vellinHovered, setVellinHovered] = useState(false);

  const mainRef = useRef(null);
  const topHairlineRef = useRef(null);
  const hudSpiralPathRef = useRef(null);
  const hudAngleRef = useRef(null);
  const hudPctRef = useRef(null);
  const magneticCtaRef = useRef(null);
  const marqueeTrackRef = useRef(null);

  const pageSpirals = useMemo(() => {
    const hud = buildLogSpiral(28, 28, 0, Math.PI * 3.1, 1.35, 90);
    const heroCue = buildLogSpiral(24, 24, 0, Math.PI * 2.8, 1.45, 80);
    const mosaicSpiralD =
      "M 0 618 A 618 618 0 0 1 618 0 A 382 382 0 0 1 1000 382 A 236 236 0 0 1 764 618 A 146 146 0 0 1 618 472 A 90 90 0 0 1 708 382";
    const mosaicSpiralLen = Number(
      ((Math.PI / 2) * (618 + 382 + 236 + 146 + 90)).toFixed(2)
    );
    return { hud, heroCue, mosaicSpiralD, mosaicSpiralLen };
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      setSystemTheme(getSystemTimeTheme());
    };
    updateTheme();
    const interval = setInterval(updateTheme, 10000);
    return () => clearInterval(interval);
  }, []);

  const activeTheme = timeMode === "auto" ? systemTheme : timeMode;
  const isNight = activeTheme === "night";

  // Sync Day / Night Scale with Audio Palette (Night -> Mystic D Kurd 9 Handpan Scale)
  useEffect(() => {
    cozyAudio.setTheme?.(activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    fetch("/api/contributions?username=SazWhatician")
      .then((res) => res.json())
      .then((data) => {
        if (data?.contributions && Array.isArray(data.contributions) && data.contributions.length > 0) {
          setContributions(data.contributions);
        }
      })
      .catch((err) => {
        console.warn("Using offline/cached GitHub contributions:", err);
      });
  }, []);

  const scrollToChapter = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { duration: PHI });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCardMove = (e, tilt = false) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);

    if (tilt) {
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      gsap.to(card, {
        rotateY: nx * 7,
        rotateX: -ny * 6,
        transformPerspective: 1100,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  const handleCardLeave = (e, tilt = false) => {
    if (tilt) {
      gsap.to(e.currentTarget, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // 1. Global Scroll Progress + Velocity-Reactive Typographic Ribbon
      ScrollTrigger.create({
        trigger: mainRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          setScrollProgress(p);

          if (topHairlineRef.current) {
            gsap.set(topHairlineRef.current, { scaleX: p });
          }
          if (hudSpiralPathRef.current) {
            const offset = pageSpirals.hud.length * (1 - p);
            hudSpiralPathRef.current.style.strokeDashoffset = offset.toFixed(2);
          }
          if (hudAngleRef.current) {
            const rad = (p * Math.PI * 2 * PHI).toFixed(2);
            hudAngleRef.current.textContent = `${rad} rad`;
          }
          if (hudPctRef.current) {
            hudPctRef.current.textContent = `${String(Math.round(p * 100)).padStart(2, "0")}%`;
          }
          if (marqueeTrackRef.current) {
            const skew = Math.max(-7, Math.min(7, self.getVelocity() / 420));
            gsap.to(marqueeTrackRef.current, {
              skewX: skew,
              duration: 0.45,
              ease: "power3.out",
              overwrite: "auto",
            });
          }
        },
      });

      // 2. Chapter Wayfinding Observer
      CHAPTERS.forEach((chap) => {
        const el = document.getElementById(chap.id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 52%",
          end: "bottom 52%",
          onEnter: () => {
            setActiveChapter(chap.id);
            if (chap.id === "convergence" || chap.id === "showcase") {
              try {
                cozyAudio.playWindChimeBreeze?.(0.5);
              } catch { }
            }
          },
          onEnterBack: () => {
            setActiveChapter(chap.id);
            if (chap.id === "convergence" || chap.id === "showcase") {
              try {
                cozyAudio.playWindChimeBreeze?.(0.5);
              } catch { }
            }
          },
        });
      });

      // 3. KINETIC HERO TYPOGRAPHY CHOREOGRAPHY
      gsap.fromTo(
        ".hero-enter-char",
        { yPercent: 122, rotateX: -52, opacity: 0 },
        {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.18,
          stagger: 0.036,
          ease: "expo.out",
          delay: 0.12,
        }
      );

      gsap.fromTo(
        ".hero-couture-rule",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.05,
          stagger: 0.11,
          delay: 0.34,
          ease: "expo.inOut",
        }
      );

      gsap.fromTo(
        ".hero-title-badge",
        { scale: 0, rotate: -60, opacity: 0 },
        { scale: 1, rotate: 0, opacity: 1, duration: 0.85, delay: 0.52, ease: "back.out(1.7)" }
      );

      gsap.fromTo(
        [".hero-sub-reveal", ".hero-scroll-reveal", ".hero-top-bar"],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.45, stagger: 0.1, ease: "power3.out" }
      );

      gsap.to(".hero-cue-orbit", {
        rotation: 360,
        duration: 13,
        repeat: -1,
        ease: "none",
        svgOrigin: "24 24",
      });

      // Editorial Gatefold Scroll-Out with Dynamic Kerning Expansion (Dissolves cleanly before reaching nav compass)
      gsap.to(".hero-exit-first", {
        xPercent: -24,
        letterSpacing: "0.08em",
        opacity: 0,
        filter: "blur(8px)",
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom 48%",
          scrub: 0.9,
        },
      });

      gsap.to(".hero-exit-last", {
        xPercent: 18,
        yPercent: 18,
        opacity: 0,
        filter: "blur(8px)",
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom 48%",
          scrub: 0.9,
        },
      });

      gsap.to(".hero-exit-meta", {
        y: 22,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom 52%",
          scrub: 0.9,
        },
      });

      // 4. Story Sections — 3D Perspective Masked Word Reveals + Ghost Numeral Parallax
      const sections = document.querySelectorAll(".story-section:not(#hero)");
      sections.forEach((section) => {
        const vessel = section.querySelector(".phi-vessel");
        const ghostNum = section.querySelector(".ghost-numeral");
        const badges = section.querySelectorAll(".reveal-badge");
        const words = section.querySelectorAll(".kinetic-word");
        const texts = section.querySelectorAll(".reveal-text");
        const cards = section.querySelectorAll(".reveal-card");
        const drawPaths = section.querySelectorAll(".sec-draw-path");
        const rules = section.querySelectorAll(".phi-rule");

        const secTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
          defaults: { ease: "expo.out" },
        });

        if (vessel) {
          secTl.fromTo(
            vessel,
            { y: 42, opacity: 0, scale: 0.975 },
            { y: 0, opacity: 1, scale: 1, duration: 1.05 },
            0
          );
        }
        if (rules.length) {
          secTl.fromTo(
            rules,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.05, transformOrigin: "left center", ease: "expo.inOut" },
            0.06
          );
        }
        if (badges.length) {
          secTl.fromTo(badges, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.08);
        }
        if (words.length) {
          secTl.fromTo(
            words,
            { yPercent: 118, rotateX: -44, opacity: 0 },
            {
              yPercent: 0,
              rotateX: 0,
              opacity: 1,
              duration: 0.95,
              stagger: 0.042,
              ease: "expo.out",
            },
            0.14
          );
        }
        if (texts.length) {
          secTl.fromTo(texts, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.08 }, 0.24);
        }
        if (drawPaths.length) {
          secTl.to(
            drawPaths,
            { strokeDashoffset: 0, duration: 1.4, stagger: 0.08, ease: "power3.inOut" },
            0.18
          );
        }
        if (cards.length) {
          secTl.fromTo(
            cards,
            { opacity: 0, y: 26, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.089, duration: 0.85, ease: "expo.out" },
            0.28
          );
        }

        if (vessel && !section.id.includes("skyline")) {
          gsap.fromTo(
            vessel,
            { y: 28 },
            {
              y: -28,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            }
          );
        }

        if (ghostNum) {
          gsap.fromTo(
            ghostNum,
            { y: 55 },
            {
              y: -55,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1,
              },
            }
          );
        }
      });

      // 5. Continuous Showcase Typographic Ticker + Mathematical Diagram Loops
      if (marqueeTrackRef.current) {
        gsap.to(marqueeTrackRef.current, {
          xPercent: -50,
          duration: 28,
          repeat: -1,
          ease: "none",
        });
      }

      gsap.to(".vesica-crystal-spin", {
        rotation: 360,
        duration: 55,
        repeat: -1,
        ease: "none",
        svgOrigin: "210 60",
      });

      gsap.to(".fresnel-w1", {
        scaleY: -1,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        svgOrigin: "180 75",
      });
      gsap.to(".fresnel-w2", {
        scaleY: -1,
        duration: 2.4 / PHI,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        svgOrigin: "180 75",
      });
      gsap.to(".fresnel-w3", {
        scaleY: -1,
        duration: 2.4 / (PHI * PHI),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        svgOrigin: "180 75",
      });
      gsap.to(".fresnel-scanline", {
        x: 316,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      const auraComet = document.querySelector(".aura-comet");
      if (auraComet) {
        const len = parseFloat(auraComet.getAttribute("data-len") || "600");
        gsap.fromTo(
          auraComet,
          { strokeDashoffset: 0 },
          { strokeDashoffset: -len, duration: 5.5, repeat: -1, ease: "none" }
        );
      }

      gsap.to(".kroma-phyllo-spin", {
        rotation: 360,
        duration: 42,
        repeat: -1,
        ease: "none",
        svgOrigin: "110 48",
      });

      gsap.to(".mosaic-golden-spiral", {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#showcase-mosaic",
          start: "top 82%",
          end: "bottom 55%",
          scrub: 0.7,
        },
      });

      // 6. Magnetic Primary CTA Physics
      const cta = magneticCtaRef.current;
      let cleanupCta = null;
      if (cta) {
        const xTo = gsap.quickTo(cta, "x", { duration: 0.38, ease: "power3.out" });
        const yTo = gsap.quickTo(cta, "y", { duration: 0.38, ease: "power3.out" });
        const onMove = (e) => {
          const rect = cta.getBoundingClientRect();
          xTo((e.clientX - (rect.left + rect.width / 2)) * 0.24);
          yTo((e.clientY - (rect.top + rect.height / 2)) * 0.24);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };
        cta.addEventListener("mousemove", onMove);
        cta.addEventListener("mouseleave", onLeave);
        cleanupCta = () => {
          cta.removeEventListener("mousemove", onMove);
          cta.removeEventListener("mouseleave", onLeave);
        };
      }

      return () => {
        if (cleanupCta) cleanupCta();
      };
    }, mainRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, [pageSpirals.hud.length]);

  const cardSurface = isNight
    ? "bg-[#070c1b]/82 border-slate-800/90 shadow-[0_18px_56px_rgba(0,0,0,0.62)] text-white"
    : "bg-[#fcfaf6]/84 border-neutral-900/12 shadow-[0_18px_56px_rgba(17,17,17,0.065)] text-neutral-900";

  const accentText = isNight
    ? "text-indigo-300"
    : activeTheme === "sunset"
      ? "text-[#9b3d0b]"
      : "text-[#875311]";

  const heroMetaInk = isNight
    ? "text-slate-100"
    : activeTheme === "sunset"
      ? "text-[#1d0f08]"
      : "text-[#0b0f19]";

  const ghostStroke = isNight
    ? "rgba(165, 180, 252, 0.09)"
    : activeTheme === "sunset"
      ? "rgba(155, 61, 11, 0.09)"
      : "rgba(23, 23, 23, 0.075)";

  return (
    <div
      ref={mainRef}
      className={`${jakarta.className} relative min-h-screen selection:bg-neutral-900 selection:text-white overflow-x-clip transition-colors duration-700 ${isNight ? "bg-[#060a17] text-white" : "bg-white text-neutral-900"
        }`}
    >
      {/* Fullscreen Liquid Glass Icon Reveal Loader */}
      <GlassLoader />

      {/* 3D WebGL Cloud Voyager Ship Scene with Dynamic Time-of-Day Theme */}
      <ShipScene scrollProgress={scrollProgress} theme={activeTheme} />

      {/* Interactive Chronometer & Atmosphere Controller */}
      <TimeClock
        mode={timeMode}
        resolvedTheme={activeTheme}
        onModeChange={(newMode) => setTimeMode(newMode)}
      />

      {/* Top-Center Celestial Half-Compass Navigation */}
      <FramelessNav activeTheme={activeTheme} />

      {/* High-End Architectural Grid Line Overlay */}
      <ArchitecturalGrid />

      {/* Ambient Soundtrack Controller */}
      <AmbientSound scrollProgress={scrollProgress} />

      {/* Top Hairline Golden-Ratio Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none">
        <div
          ref={topHairlineRef}
          className={`h-full w-full origin-left scale-x-0 will-change-transform ${isNight ? "bg-indigo-400" : "bg-[#9b3d0b]"
            }`}
        />
      </div>

      {/* Subtle Viewport Golden-Section Axis Registration Ticks (38.2% & 61.8%) */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-10 hidden xl:block">
        <div
          className={`absolute top-0 bottom-0 left-[38.2%] w-px transition-colors duration-700 ${isNight ? "bg-white/[0.03]" : "bg-black/[0.03]"
            }`}
        />
        <div
          className={`absolute top-0 bottom-0 left-[61.8%] w-px transition-colors duration-700 ${isNight ? "bg-white/[0.03]" : "bg-black/[0.03]"
            }`}
        />
      </div>

      {/* =========================================================================
          HARMONIC MERIDIAN WAYFINDING HUD (Right Edge, Desktop XL+)
          ========================================================================= */}
      <aside
        aria-label="Section navigation"
        className={`${jetbrains.className} hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3.5`}
      >
        <div className="flex flex-col items-end gap-1 mb-1 pointer-events-none select-none">
          <svg viewBox="0 0 56 56" fill="none" className="size-10 overflow-hidden">
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke={isNight ? "rgba(165,180,252,0.22)" : "rgba(154,108,39,0.28)"}
              strokeWidth="0.8"
              strokeDasharray="2 4"
            />
            <path
              d={pageSpirals.hud.d}
              stroke={isNight ? "rgba(165,180,252,0.18)" : "rgba(23,23,23,0.14)"}
              strokeWidth="1"
            />
            <path
              ref={hudSpiralPathRef}
              d={pageSpirals.hud.d}
              stroke={isNight ? "#a5b4fc" : "#9a6c27"}
              strokeWidth="1.4"
              strokeDasharray={pageSpirals.hud.length}
              strokeDashoffset={pageSpirals.hud.length}
            />
          </svg>
          <span
            ref={hudAngleRef}
            className={`text-[9px] font-medium tracking-widest tabular-nums ${accentText}`}
          >
            0.00 rad
          </span>
        </div>

        {CHAPTERS.map((chap) => {
          const active = activeChapter === chap.id;
          return (
            <button
              key={chap.id}
              type="button"
              onClick={() => scrollToChapter(chap.id)}
              className="group flex items-center gap-2.5 cursor-pointer py-0.5 focus:outline-none"
              aria-label={`Scroll to ${chap.label}`}
            >
              <span
                className={`text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${active
                    ? isNight
                      ? "opacity-100 text-indigo-200 font-semibold translate-x-0"
                      : "opacity-100 text-neutral-950 font-semibold translate-x-0"
                    : isNight
                      ? "opacity-0 group-hover:opacity-90 text-slate-300 translate-x-2 group-hover:translate-x-0"
                      : "opacity-0 group-hover:opacity-90 text-neutral-700 translate-x-2 group-hover:translate-x-0"
                  }`}
              >
                {chap.num} · {chap.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${active
                    ? isNight
                      ? "w-5 h-1.5 bg-indigo-300 shadow-[0_0_8px_#a5b4fc]"
                      : "w-5 h-1.5 bg-[#9b3d0b]"
                    : isNight
                      ? "size-1.5 bg-slate-500 group-hover:bg-indigo-300"
                      : "size-1.5 bg-neutral-600/55 group-hover:bg-neutral-950"
                  }`}
              />
            </button>
          );
        })}

        <span
          ref={hudPctRef}
          className={`mt-1 text-[10px] font-medium tracking-widest tabular-nums pointer-events-none ${heroMetaInk}`}
        >
          00%
        </span>
      </aside>

      {/* Atmospheric Background Gradient Vignettes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] transition-colors duration-1000 ${isNight ? "bg-indigo-900/25" : "bg-[#f4ece1]/40"
            }`}
        />
        <div
          className={`absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${isNight ? "bg-cyan-950/20" : "bg-[#e8e2d8]/30"
            }`}
        />
      </div>

      {/* =========================================================================
          SECTION 0: HERO (Unobstructed 3D ShipScene + Monumental Kinetic Masthead)
          ========================================================================= */}
      <section
        id="hero"
        className="story-section hero-section relative z-20 min-h-screen flex flex-col justify-between px-5 xs:px-6 sm:px-12 lg:px-16 pt-24 sm:pt-28 pb-16 sm:pb-20"
      >
        {/* Top Header Status Row (Crisp High-Contrast Telemetry) */}
        <div
          className={`${jetbrains.className} hero-top-bar w-full flex items-center justify-between text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] transition-colors select-none ${heroMetaInk}`}
        >
          <div className="hidden sm:flex items-center gap-3">
            <ScrambleText text="SPATIAL SYSTEMS & MOTION" triggerOnMount delayMs={260} />
            <span className={`text-[10px] font-semibold tracking-[0.25em] ${accentText}`}>Φ 1.618</span>
          </div>
          <div className="text-[10px] sm:text-[11px] tracking-[0.22em] text-right ml-auto">
            <ScrambleText text="STUDIO 2026 // NEW DELHI" triggerOnMount delayMs={380} />
          </div>
        </div>

        {/* Center Open Space for 3D ShipScene */}
        <div className="flex-1 flex items-center justify-center pointer-events-none" />

        {/* Bottom Row: Monumental Kinetic Masthead + Logarithmic Scroll Cue */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-8 z-30 pointer-events-none">
          <EditorialHeroMasthead activeTheme={activeTheme} isNight={isNight} />

          {/* BOTTOM RIGHT: GOLDEN SPIRAL SCROLL PENDULUM */}
          <div className="hero-exit-meta hero-scroll-reveal flex items-center md:flex-col md:items-end gap-3 pointer-events-none pb-2">
            <span
              className={`${jetbrains.className} text-[10px] sm:text-[11px] font-medium tracking-[0.26em] uppercase ${heroMetaInk}`}
            >
              Scroll to descend
            </span>
            <div className="relative size-12 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="size-12 overflow-hidden">
                <g className="hero-cue-orbit">
                  <circle
                    cx="24"
                    cy="24"
                    r="21"
                    stroke={isNight ? "rgba(199,210,254,0.45)" : "rgba(155,61,11,0.48)"}
                    strokeWidth="0.95"
                    strokeDasharray="3 5"
                  />
                  <circle cx="24" cy="3" r="2.3" fill={isNight ? "#c7d2fe" : "#9b3d0b"} />
                </g>
                <path
                  d={pageSpirals.heroCue.d}
                  stroke={isNight ? "rgba(255,255,255,0.85)" : "rgba(17,9,5,0.85)"}
                  strokeWidth="1.2"
                />
                <circle cx="24" cy="24" r="2.1" fill={isNight ? "#c7d2fe" : "#110905"} />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: 01 MECHANICS — MARGINALIA LEDGER EDITORIAL LAYOUT
          ========================================================================= */}
      <section
        id="mechanics"
        className="story-section relative z-20 min-h-screen flex items-center px-6 sm:px-12 lg:px-16 py-28"
      >
        <div className="relative w-full max-w-7xl mx-auto flex items-center justify-start">
          {/* Drifting Ghost Outlined Watermark Numeral */}
          <span
            aria-hidden="true"
            style={{ WebkitTextStroke: `1px ${ghostStroke}`, color: "transparent" }}
            className={`${bodoni.className} ghost-numeral pointer-events-none select-none hidden lg:block absolute -top-16 -left-6 text-[13rem] italic font-semibold leading-none z-0`}
          >
            01
          </span>

          <div
            onMouseMove={(e) => handleCardMove(e, false)}
            className={`phi-vessel group relative z-10 overflow-hidden w-full max-w-2xl backdrop-blur-xl p-8 sm:p-11 rounded-3xl border transition-colors duration-500 will-change-transform ${cardSurface}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: isNight
                  ? "radial-gradient(460px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.13), transparent 65%)"
                  : "radial-gradient(460px circle at var(--mx, 50%) var(--my, 50%), rgba(155,61,11,0.1), transparent 65%)",
              }}
            />

            <div className="relative z-10">
              <div className={`${jetbrains.className} reveal-badge flex items-center justify-between mb-5`}>
                <span className={`text-[11px] font-medium uppercase tracking-[0.24em] ${accentText}`}>
                  <ScrambleText text="01 / KINEMATICS & CLASSICAL FORM" />
                </span>
                <span className={`text-[10px] tracking-[0.24em] ${isNight ? "text-slate-400" : "text-neutral-500"}`}>
                  RATIO 1 : 1.618
                </span>
              </div>

              <OrbitalVectorsChamber isNight={isNight} />

              <KineticHeadline
                className={`text-[2.1rem] sm:text-[3.1rem] lg:text-[3.55rem] leading-[1.03] mb-7 ${isNight ? "text-white" : "text-neutral-950"
                  }`}
                accentClass={accentText}
                segments={[
                  { text: "Four Concentric", style: "sans" },
                  { text: "Orbital Vectors", style: "accent" },
                ]}
              />

              <div className={`phi-rule h-px w-full mb-6 ${isNight ? "bg-slate-800" : "bg-neutral-900/12"}`} />

              {/* Swiss Marginalia Two-Column Text Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-[0.38fr_1fr] gap-5 sm:gap-7 items-start">
                <div className={`${jetbrains.className} reveal-card flex sm:flex-col gap-3 sm:gap-2 text-[10px] uppercase tracking-[0.2em]`}>
                  <span className={accentText}>AXIS // KEPLER</span>
                  <span className={isNight ? "text-slate-400" : "text-neutral-500"}>60 FPS · WEBGL</span>
                  <span className={isNight ? "text-slate-400" : "text-neutral-500"}>Φ⁰ → Φ⁻³</span>
                </div>

                <p
                  className={`reveal-text text-[14.5px] sm:text-[15.5px] font-normal leading-[1.78] ${isNight ? "text-slate-300" : "text-neutral-700"
                    }`}
                >
                  <span
                    className={`${bodoni.className} float-left mr-2.5 mt-0.5 text-[2.9rem] italic font-semibold leading-[0.8] ${accentText}`}
                  >
                    E
                  </span>
                  ngineered to maintain absolute dimensional equilibrium. Blending classical sculptural heritage with real-time WebGL rendering, architectural topography rotates seamlessly in responsive 3D space.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 02 CONVERGENCE — CENTERED MONUMENTAL BROADSHEET
          ========================================================================= */}
      <section
        id="convergence"
        className="story-section relative z-20 min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-28 text-center"
      >
        <div className="relative max-w-4xl mx-auto w-full">
          <span
            aria-hidden="true"
            style={{ WebkitTextStroke: `1px ${ghostStroke}`, color: "transparent" }}
            className={`${bodoni.className} ghost-numeral pointer-events-none select-none hidden lg:block absolute -top-20 left-1/2 -translate-x-1/2 text-[14rem] italic font-semibold leading-none z-0`}
          >
            02
          </span>

          <div
            onMouseMove={(e) => handleCardMove(e, false)}
            className={`phi-vessel group relative z-10 overflow-hidden flex flex-col items-center w-full backdrop-blur-xl p-8 sm:p-12 lg:p-14 rounded-3xl border transition-colors duration-500 will-change-transform ${cardSurface}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: isNight
                  ? "radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.13), transparent 65%)"
                  : "radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), rgba(155,61,11,0.1), transparent 65%)",
              }}
            />

            <div className="relative z-10 w-full flex flex-col items-center">
              <div className={`${jetbrains.className} reveal-badge flex items-center gap-3 mb-4`}>
                <span className={`h-px w-8 ${isNight ? "bg-indigo-400/50" : "bg-[#9b3d0b]/50"}`} />
                <span className={`text-[11px] font-medium uppercase tracking-[0.26em] ${accentText}`}>
                  <ScrambleText text="02 / EQUILIBRIUM & HERITAGE" />
                </span>
                <span className={`h-px w-8 ${isNight ? "bg-indigo-400/50" : "bg-[#9b3d0b]/50"}`} />
              </div>

              <OpticalVesicaCrest isNight={isNight} />

              <KineticHeadline
                className={`text-[2.25rem] sm:text-[3.6rem] lg:text-[4.35rem] leading-[1.02] mb-6 ${isNight ? "text-white" : "text-neutral-950"
                  }`}
                accentClass={accentText}
                segments={[
                  { text: "Optical", style: "serif" },
                  { text: "Quartz Crystal", style: "sans" },
                  { text: "Resonance", style: "accent" },
                ]}
              />

              {/* Editorial Pull-Quote Statement */}
              <p
                className={`${bodoni.className} reveal-text text-xl sm:text-2xl italic font-normal leading-relaxed mb-3 max-w-2xl ${isNight ? "text-indigo-100/95" : "text-neutral-900"
                  }`}
              >
                “At the epicenter lies high-renaissance digital craftsmanship.”
              </p>

              <p
                className={`reveal-text text-sm sm:text-[15.5px] font-normal leading-[1.8] mb-9 max-w-xl ${isNight ? "text-slate-300" : "text-neutral-600"
                  }`}
              >
                High-precision sculptural topology merges with dynamic atmospheric lighting and calibrated camera perspective controls.
              </p>

              {/* Symmetrical 3-Column Spec Bar */}
              <div
                className={`w-full grid grid-cols-1 sm:grid-cols-3 border-t pt-6 gap-4 sm:gap-0 sm:divide-x ${isNight
                    ? "border-slate-800 divide-slate-800"
                    : "border-neutral-900/12 divide-neutral-900/12"
                  }`}
              >
                {[
                  { n: "I", title: "Photogrammetry", sub: "Sub-millimeter Mesh" },
                  { n: "II", title: "Sub-Surface", sub: "Specular Dispersion" },
                  { n: "III", title: "Frictionless", sub: "Damped Orbit Physics" },
                ].map((spec) => (
                  <div key={spec.n} className="reveal-card px-4 flex flex-col items-center">
                    <span className={`${bodoni.className} italic text-lg leading-none mb-1 ${accentText}`}>
                      {spec.n}
                    </span>
                    <span className="font-['Clash_Display',sans-serif] text-sm font-medium tracking-wide">
                      {spec.title}
                    </span>
                    <span
                      className={`${jetbrains.className} mt-1 text-[9px] uppercase tracking-[0.2em] ${isNight ? "text-slate-400" : "text-neutral-500"
                        }`}
                    >
                      {spec.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: 03 ARCHITECTURE — INDEX-NUMBERED TECHNICAL MONOGRAPH
          ========================================================================= */}
      <section
        id="synthesis"
        className="story-section relative z-20 min-h-screen flex items-center px-6 sm:px-12 lg:px-16 py-28"
      >
        <div className="relative w-full max-w-7xl mx-auto flex items-center justify-end">
          <span
            aria-hidden="true"
            style={{ WebkitTextStroke: `1px ${ghostStroke}`, color: "transparent" }}
            className={`${bodoni.className} ghost-numeral pointer-events-none select-none hidden lg:block absolute -top-16 -right-4 text-[13rem] italic font-semibold leading-none z-0`}
          >
            03
          </span>

          <div
            onMouseMove={(e) => handleCardMove(e, false)}
            className={`phi-vessel group relative z-10 overflow-hidden w-full max-w-2xl backdrop-blur-xl p-8 sm:p-11 rounded-3xl border transition-colors duration-500 will-change-transform ${cardSurface}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: isNight
                  ? "radial-gradient(460px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.13), transparent 65%)"
                  : "radial-gradient(460px circle at var(--mx, 50%) var(--my, 50%), rgba(155,61,11,0.1), transparent 65%)",
              }}
            />

            <div className="relative z-10">
              <div className={`${jetbrains.className} reveal-badge flex items-center justify-between mb-5`}>
                <span className={`text-[11px] font-medium uppercase tracking-[0.24em] ${accentText}`}>
                  <ScrambleText text="03 / SHADERS & MATERIALS" />
                </span>
                <span className={`text-[10px] tracking-[0.24em] ${isNight ? "text-slate-400" : "text-neutral-500"}`}>
                  Φ⁻¹ · FRESNEL
                </span>
              </div>

              <FresnelShaderChamber isNight={isNight} />

              <KineticHeadline
                className={`text-[2.1rem] sm:text-[3.1rem] lg:text-[3.55rem] leading-[1.03] mb-5 ${isNight ? "text-white" : "text-neutral-950"
                  }`}
                accentClass={accentText}
                segments={[
                  { text: "Physically-Based", style: "sans" },
                  { text: "Interactive Shaders", style: "accent" },
                ]}
              />

              <p
                className={`reveal-text text-[14.5px] sm:text-[15.5px] font-normal leading-[1.78] mb-7 ${isNight ? "text-slate-300" : "text-neutral-700"
                  }`}
              >
                Merging volumetric brushstroke geometry with modern real-time lighting. Every rim highlight, woven cloud texture, and atmospheric depth computes dynamically against shifting lighting environments.
              </p>

              {/* Interactive Hover-Sweep Technical Spec Rows */}
              <ul className={`divide-y border-t ${isNight ? "divide-slate-800 border-slate-800" : "divide-neutral-900/10 border-neutral-900/12"}`}>
                {[
                  { num: "01", tag: "VOLUMETRIC", label: "3D Volumetric Cloud Depth Reconstruction" },
                  { num: "02", tag: "ACES · PBR", label: "Real-Time Material Pipeline & Tone Mapping" },
                  { num: "03", tag: "ADAPTIVE", label: "Responsive Coordinate Mapping Across Viewports" },
                ].map((row) => (
                  <li
                    key={row.num}
                    className={`reveal-card group/row relative flex items-center justify-between gap-4 py-3.5 px-2 -mx-2 rounded-lg transition-colors duration-300 ${isNight ? "hover:bg-indigo-400/10" : "hover:bg-[#9b3d0b]/[0.06]"
                      }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`${bodoni.className} italic text-base font-semibold shrink-0 ${accentText}`}>
                        {row.num}
                      </span>
                      <span
                        className={`text-[13px] sm:text-sm font-medium truncate transition-transform duration-300 group-hover/row:translate-x-1 ${isNight ? "text-slate-200" : "text-neutral-800"
                          }`}
                      >
                        {row.label}
                      </span>
                    </div>
                    <span
                      className={`${jetbrains.className} hidden sm:inline text-[9px] tracking-[0.2em] uppercase shrink-0 opacity-65 group-hover/row:opacity-100 ${accentText}`}
                    >
                      {row.tag}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: 04 SHOWCASE GATEWAY — KINETIC TICKER + GOLDEN SPIRAL MOSAIC
          ========================================================================= */}
      <section
        id="showcase"
        className="story-section relative z-20 min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-32 text-center"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center w-full">
          <div className={`${jetbrains.className} reveal-badge flex items-center gap-3 mb-4`}>
            <span className={`h-px w-8 ${isNight ? "bg-indigo-400/50" : "bg-[#9b3d0b]/50"}`} />
            <span className={`text-[11px] font-medium uppercase tracking-[0.26em] ${accentText}`}>
              <ScrambleText text="04 / SELECTED ARCHIVE" />
            </span>
            <span className={`h-px w-8 ${isNight ? "bg-indigo-400/50" : "bg-[#9b3d0b]/50"}`} />
          </div>

          <KineticHeadline
            className={`text-[2.5rem] sm:text-[4.2rem] lg:text-[5.1rem] leading-[1.01] mb-6 ${isNight ? "text-white" : "text-neutral-950"
              }`}
            accentClass={accentText}
            segments={[
              { text: "Explorations in", style: "sans" },
              { text: "Physical & Digital", style: "accent" },
              { text: "Form", style: "serif" },
            ]}
          />

          <p
            className={`reveal-text text-sm sm:text-base md:text-[17px] font-normal leading-[1.75] mb-9 max-w-2xl ${isNight ? "text-slate-300" : "text-neutral-600"
              }`}
          >
            A curated monograph of spatial computing interfaces, typographic systems, and generative WebGL installations engineered for visionary studios.
          </p>

          {/* Scroll-Velocity-Skewed Architectural Typographic Ribbon */}
          <div
            aria-hidden="true"
            className={`w-full max-w-4xl overflow-hidden border-y py-2.5 mb-10 ${isNight
                ? "border-slate-800/90 text-slate-300/80"
                : "border-neutral-900/12 text-neutral-700/85"
              }`}
            style={{
              maskImage: "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}
          >
            <div ref={marqueeTrackRef} className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-center gap-8">
                  <span className={`${jetbrains.className} text-[10px] uppercase tracking-[0.28em]`}>
                    GOLDEN RATIO 1.618
                  </span>
                  <span className={accentText}>✦</span>
                  <span className={`${bodoni.className} italic text-base`}>Spatial Computing</span>
                  <span className={accentText}>✦</span>
                  <span className={`${jetbrains.className} text-[10px] uppercase tracking-[0.28em]`}>
                    REAL-TIME SHADERS
                  </span>
                  <span className={accentText}>✦</span>
                  <span className={`${bodoni.className} italic text-base`}>Editorial Motion</span>
                  <span className={accentText}>✦</span>
                  <span className={`${jetbrains.className} text-[10px] uppercase tracking-[0.28em]`}>
                    08 SELECTED WORKS
                  </span>
                  <span className={accentText}>✦</span>
                </div>
              ))}
            </div>
          </div>

          <div id="showcase-mosaic" className="relative w-full max-w-4xl mb-12">
            <svg
              aria-hidden="true"
              viewBox="0 0 1000 618"
              preserveAspectRatio="none"
              fill="none"
              className="hidden lg:block pointer-events-none absolute inset-0 w-full h-full z-20 overflow-hidden"
            >
              <path
                d={pageSpirals.mosaicSpiralD}
                stroke={isNight ? "rgba(165,180,252,0.42)" : "rgba(155,61,11,0.42)"}
                strokeWidth="1.4"
                strokeDasharray={pageSpirals.mosaicSpiralLen}
                strokeDashoffset={pageSpirals.mosaicSpiralLen}
                vectorEffect="non-scaling-stroke"
                className="mosaic-golden-spiral"
              />
            </svg>

            <div className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-4 lg:gap-5 w-full lg:min-h-[420px]">
              {/* CARD 01: Vellin Studio */}
              <Link
                href="/projects"
                onMouseMove={(e) => handleCardMove(e, true)}
                onMouseEnter={() => {
                  setVellinHovered(true);
                  try {
                    cozyAudio.playHover?.(0);
                  } catch { }
                }}
                onMouseLeave={(e) => {
                  setVellinHovered(false);
                  handleCardLeave(e, true);
                }}
                style={{ transformStyle: "preserve-3d" }}
                className={`reveal-card group relative overflow-hidden p-7 sm:p-8 rounded-3xl text-left flex flex-col justify-between no-underline border backdrop-blur-xl transition-colors duration-500 will-change-transform ${isNight
                    ? "bg-slate-900/86 border-slate-800 text-white hover:border-indigo-400/60 shadow-xl"
                    : "bg-[#fcfaf6]/90 border-neutral-900/12 text-neutral-950 hover:border-[#9b3d0b]/60 shadow-[0_10px_34px_rgba(0,0,0,0.05)]"
                  }`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: isNight
                      ? "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.14), transparent 65%)"
                      : "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(155,61,11,0.11), transparent 65%)",
                  }}
                />

                <div className={`${jetbrains.className} relative z-10 flex items-center justify-between`}>
                  <span className={`text-[10px] uppercase tracking-[0.22em] ${accentText}`}>
                    01 / SPATIAL INTERFACE
                  </span>
                  <span className={`text-[10px] ${isNight ? "text-slate-400" : "text-neutral-500"}`}>
                    Φ² · 61.8%
                  </span>
                </div>

                <div className="relative z-10 w-full h-48 sm:h-56 my-3 overflow-hidden">
                  <GoldenPolyhedronMiniCanvas isNight={isNight} hovered={vellinHovered} />
                </div>

                <div className="relative z-10 flex items-end justify-between pt-4 border-t border-current/12">
                  <div>
                    <span className="font-['Clash_Display',sans-serif] text-2xl sm:text-3xl font-semibold tracking-tight">
                      Vellin{" "}
                      <span className={`${bodoni.className} italic font-medium ${accentText}`}>
                        Studio
                      </span>
                    </span>
                  </div>
                  <span
                    className={`size-9 rounded-full border flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isNight ? "border-slate-700 text-indigo-300" : "border-neutral-300 text-neutral-800"
                      }`}
                  >
                    ↗
                  </span>
                </div>
              </Link>

              {/* RIGHT 38.2% COLUMN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[1.618fr_1fr] gap-4 lg:gap-5">
                {/* CARD 02: Aura Spatial */}
                <Link
                  href="/projects"
                  onMouseMove={(e) => handleCardMove(e, true)}
                  onMouseEnter={() => {
                    try {
                      cozyAudio.playHover?.(1);
                    } catch { }
                  }}
                  onMouseLeave={(e) => handleCardLeave(e, true)}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`reveal-card group relative overflow-hidden p-6 rounded-3xl text-left flex flex-col justify-between no-underline border backdrop-blur-xl transition-colors duration-500 will-change-transform ${isNight
                      ? "bg-slate-900/86 border-slate-800 text-white hover:border-indigo-400/60 shadow-xl"
                      : "bg-[#fcfaf6]/90 border-neutral-900/12 text-neutral-950 hover:border-[#9b3d0b]/60 shadow-[0_10px_34px_rgba(0,0,0,0.05)]"
                    }`}
                >
                  <div className={`${jetbrains.className} flex items-center justify-between`}>
                    <span className={`text-[10px] uppercase tracking-[0.2em] ${accentText}`}>
                      02 / SOUND ARCHITECTURE
                    </span>
                    <span className={`text-[10px] ${isNight ? "text-slate-400" : "text-neutral-500"}`}>
                      3 : 5
                    </span>
                  </div>

                  <div className="w-full h-24 my-2 overflow-hidden">
                    <ShowcaseMicroDiagram type="aura" isNight={isNight} />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-current/12">
                    <span className="font-['Clash_Display',sans-serif] text-xl font-semibold">
                      Aura{" "}
                      <span className={`${bodoni.className} italic font-medium ${accentText}`}>
                        Spatial
                      </span>
                    </span>
                    <span className={`${jetbrains.className} text-xs opacity-65 group-hover:opacity-100 transition-opacity`}>
                      ↗
                    </span>
                  </div>
                </Link>

                {/* CARD 03: Kroma System */}
                <Link
                  href="/projects"
                  onMouseMove={(e) => handleCardMove(e, true)}
                  onMouseEnter={() => {
                    try {
                      cozyAudio.playHover?.(2);
                    } catch { }
                  }}
                  onMouseLeave={(e) => handleCardLeave(e, true)}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`reveal-card group relative overflow-hidden p-6 rounded-3xl text-left flex flex-col justify-between no-underline border backdrop-blur-xl transition-colors duration-500 will-change-transform ${isNight
                      ? "bg-slate-900/86 border-slate-800 text-white hover:border-indigo-400/60 shadow-xl"
                      : "bg-[#fcfaf6]/90 border-neutral-900/12 text-neutral-950 hover:border-[#9b3d0b]/60 shadow-[0_10px_34px_rgba(0,0,0,0.05)]"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className={`${jetbrains.className} text-[10px] uppercase tracking-[0.2em] block mb-1 ${accentText}`}>
                        03 / GENERATIVE SYSTEM
                      </span>
                      <span className="font-['Clash_Display',sans-serif] text-xl font-semibold block">
                        Kroma{" "}
                        <span className={`${bodoni.className} italic font-medium ${accentText}`}>
                          System
                        </span>
                      </span>
                    </div>
                    <div className="w-24 h-16 shrink-0 overflow-hidden">
                      <ShowcaseMicroDiagram type="kroma" isNight={isNight} />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="reveal-text flex flex-col sm:flex-row items-center gap-4">
            <div ref={magneticCtaRef} className="inline-block will-change-transform">
              <Link
                href="/projects"
                onClick={() => cozyAudio.playSnap?.(1, 1)}
                className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold tracking-wide no-underline transition-all shadow-[0_8px_28px_rgba(0,0,0,0.14)] active:scale-95 ${isNight
                    ? "bg-white text-neutral-950 hover:bg-indigo-50"
                    : "bg-neutral-950 text-[#fcfaf6] hover:bg-black"
                  }`}
              >
                <span>Explore Selected Works</span>
                <span className={`${jetbrains.className} text-[11px] opacity-65`}>(08)</span>
                <span className="relative flex size-4 items-center justify-center overflow-hidden">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="absolute transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-5"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="absolute -translate-x-5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </Link>
            </div>

            <Link
              href="/contact"
              className={`inline-flex items-center gap-2.5 px-7 py-4 rounded-full text-sm font-medium transition-colors shadow-sm no-underline backdrop-blur-md ${isNight
                  ? "bg-slate-900/90 text-white border border-slate-700 hover:border-indigo-300"
                  : "bg-[#fcfaf6]/92 text-neutral-950 border border-neutral-900/20 hover:border-neutral-950"
                }`}
              onClick={() => cozyAudio.playSnap?.(3, 1)}
            >
              <span>Initiate Collaboration</span>
              <span className={accentText}>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: 05 ENGINEERING SKYLINE & EDITORIAL COLOPHON
          ========================================================================= */}
      <section
        id="skyline"
        className="story-section relative z-20 min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 pb-28"
      >
        <div className="max-w-5xl mx-auto w-full">
          <div
            className={`phi-vessel mb-6 text-left flex flex-col sm:flex-row sm:items-end justify-between gap-5 backdrop-blur-xl p-6 sm:p-9 rounded-3xl border transition-colors duration-500 ${cardSurface}`}
          >
            <div>
              <span className={`${jetbrains.className} reveal-badge text-[11px] font-medium uppercase tracking-[0.24em] mb-2.5 block ${accentText}`}>
                <ScrambleText text="05 / ENGINEERING CADENCE" />
              </span>

              <KineticHeadline
                className={`text-[1.9rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.05] mb-3 ${isNight ? "text-white" : "text-neutral-950"
                  }`}
                accentClass={accentText}
                segments={[
                  { text: "Engineering &", style: "sans" },
                  { text: "Kinetic Cadence", style: "accent" },
                ]}
              />

              <p
                className={`reveal-text text-xs sm:text-sm font-normal max-w-xl leading-[1.75] ${isNight ? "text-slate-300" : "text-neutral-600"
                  }`}
              >
                Live GitHub commit continuum for{" "}
                <a
                  href="https://github.com/SazWhatician"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${jetbrains.className} font-medium underline underline-offset-4 ${isNight ? "text-indigo-200 hover:text-white" : "text-neutral-950 hover:text-[#9b3d0b]"
                    }`}
                >
                  @SazWhatician
                </a>
                , folding dynamically between a 2D activity matrix and an interactive 3D isometric skyline.
              </p>
            </div>

            <a
              href="https://github.com/SazWhatician"
              target="_blank"
              rel="noopener noreferrer"
              className={`${jetbrains.className} reveal-card inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] transition-all self-start sm:self-auto shadow-sm no-underline ${isNight
                  ? "border border-slate-700 text-slate-100 hover:text-white hover:border-indigo-300 bg-slate-900/85"
                  : "border border-neutral-900/20 text-neutral-900 hover:border-neutral-950 bg-white/85"
                }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>github.com/SazWhatician</span>
            </a>
          </div>

          <div className="reveal-card relative w-full">
            <ContributionSkyline
              data={contributions}
              defaultView="3d"
              palette="github"
              heightScale={1.05}
              orbit={true}
              showStats={true}
              showLegend={true}
              showToggle={true}
            />
          </div>

          {/* Editorial Monograph Colophon Footer */}
          <div className="mt-14">
            <div className={`phi-rule h-px w-full mb-7 ${isNight ? "bg-slate-800" : "bg-neutral-900/15"}`} />
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div>
                <span className={`font-['Clash_Display',sans-serif] text-xl sm:text-2xl font-semibold tracking-tight ${heroMetaInk}`}>
                  SASWAT{" "}
                  <span className={`${bodoni.className} italic font-medium ${accentText}`}>
                    Mohanty
                  </span>
                </span>
                <span className={`${jetbrains.className} block mt-1.5 text-[10px] tracking-[0.24em] uppercase ${heroMetaInk}`}>
                  © 2026 ALL RIGHTS RESERVED · EDITION XXVI
                </span>
              </div>

              <div className={`${jetbrains.className} flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.22em] ${heroMetaInk}`}>
                <span className={`font-semibold ${accentText}`}>Φ 1.61803</span>
                <span>SPATIAL COMPUTING & INTERFACE DESIGN</span>
                <span>NEW DELHI, INDIA</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}