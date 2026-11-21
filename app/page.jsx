"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
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

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 137.507764°

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

  const accent = isNight ? "#a5b4fc" : "#a6864a";
  const ink = isNight ? "rgba(226,232,240,0.28)" : "rgba(23,23,23,0.2)";

  return (
    <div
      ref={wrapRef}
      className={`relative h-36 sm:h-40 w-full rounded-2xl border overflow-hidden mb-7 ${isNight ? "bg-slate-900/55 border-slate-800/90" : "bg-[#faf8f4]/80 border-black/[0.06]"
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
            strokeOpacity={idx % 2 === 0 ? 0.65 : 0.9}
            strokeWidth={idx === 0 ? "1.1" : "0.9"}
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
        className={`absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[9px] font-mono tracking-[0.22em] uppercase pointer-events-none ${isNight ? "text-slate-400" : "text-neutral-400"
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

  const accent = isNight ? "#a5b4fc" : "#a6864a";
  const ink = isNight ? "rgba(226,232,240,0.22)" : "rgba(23,23,23,0.16)";

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
          strokeOpacity="0.65"
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
          strokeOpacity="0.65"
          strokeWidth="1.05"
          strokeDasharray={geom.circ}
          strokeDashoffset={geom.circ}
          className="sec-draw-path"
        />

        <polygon
          points="210,20.2 233,60 210,99.8 187,60"
          stroke={isNight ? "#f8fafc" : "#171717"}
          strokeOpacity="0.38"
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

  const accent = isNight ? "#a5b4fc" : "#a6864a";
  const primary = isNight ? "#f8fafc" : "#171717";
  const faint = isNight ? "rgba(226,232,240,0.22)" : "rgba(23,23,23,0.16)";

  return (
    <div
      className={`relative h-36 sm:h-40 w-full rounded-2xl border overflow-hidden mb-7 ${isNight ? "bg-slate-900/55 border-slate-800/90" : "bg-[#faf8f4]/80 border-black/[0.06]"
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
          strokeOpacity="0.45"
          strokeWidth="0.9"
          strokeDasharray="2 3"
          className="fresnel-scanline"
        />

        <path
          d={waves.w1.d}
          stroke={primary}
          strokeOpacity="0.8"
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
        className={`absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[9px] font-mono tracking-[0.22em] uppercase pointer-events-none ${isNight ? "text-slate-400" : "text-neutral-400"
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

      const accent = night ? "rgba(165,180,252,0.75)" : "rgba(166,134,74,0.75)";
      const frontStroke = night ? "rgba(248,250,252,0.82)" : "rgba(23,23,23,0.78)";
      const backStroke = night ? "rgba(148,163,184,0.2)" : "rgba(23,23,23,0.16)";

      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
      ctx.strokeStyle = night ? "rgba(165,180,252,0.18)" : "rgba(166,134,74,0.22)";
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

  const accent = isNight ? "#a5b4fc" : "#a6864a";
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
   HAUTE-COUTURE EDITORIAL HERO SIGNATURE ("Saswat MOHANTY")
   ============================================================================ */
function CoutureHeroSignature({ isNight }) {
  const wrapRef = useRef(null);
  const lastRowRef = useRef(null);
  const starRef = useRef(null);
  const shimmerRef = useRef(null);

  const swash = useMemo(() => {
    const p0 = [10, 128];
    const p1 = [145, 18];
    const p2 = [395, 146];
    const p3 = [548, 36];

    let len = 0;
    let px = p0[0];
    let py = p0[1];
    const steps = 100;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const x =
        mt * mt * mt * p0[0] +
        3 * mt * mt * t * p1[0] +
        3 * mt * t * t * p2[0] +
        t * t * t * p3[0];
      const y =
        mt * mt * mt * p0[1] +
        3 * mt * mt * t * p1[1] +
        3 * mt * t * t * p2[1] +
        t * t * t * p3[1];
      len += Math.hypot(x - px, y - py);
      px = x;
      py = y;
    }

    return {
      d: `M ${p0[0]} ${p0[1]} C ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}`,
      length: Number(len.toFixed(2)),
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const onEnter = () => {
        if (lastRowRef.current) {
          gsap.to(lastRowRef.current, {
            letterSpacing: "0.24em",
            duration: 0.75,
            ease: "expo.out",
          });
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
            { xPercent: 140, opacity: 0.7, duration: 1.05, ease: "power2.inOut" }
          );
        }
      };

      const onLeave = () => {
        if (lastRowRef.current) {
          gsap.to(lastRowRef.current, {
            letterSpacing: "0.18em",
            duration: 0.75,
            ease: "power3.out",
          });
        }
        if (starRef.current) {
          gsap.to(starRef.current, {
            scale: 1,
            duration: 0.65,
            ease: "power3.out",
            transformOrigin: "50% 50%",
          });
        }
      };

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      };
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  const accentHex = isNight ? "#a5b4fc" : "#a6864a";
  const accentText = isNight ? "text-indigo-300" : "text-[#a6864a]";

  return (
    <div
      ref={wrapRef}
      className="hero-identity-container relative max-w-3xl text-left select-none pointer-events-auto cursor-default"
    >
      {/* Calligraphic Couture Ribbon */}
      <svg
        aria-hidden="true"
        viewBox="0 0 560 160"
        fill="none"
        className="hero-exit-meta pointer-events-none absolute -top-2 -left-4 w-[108%] max-w-[600px] h-auto z-0 overflow-hidden opacity-80"
      >
        <path
          d={swash.d}
          stroke={accentHex}
          strokeOpacity={isNight ? "0.35" : "0.4"}
          strokeWidth="0.95"
          strokeDasharray={swash.length}
          strokeDashoffset={swash.length}
          className="hero-couture-arc"
        />
        <circle cx="10" cy="128" r="2" fill={accentHex} fillOpacity="0.6" />
        <circle cx="548" cy="36" r="2" fill={accentHex} fillOpacity="0.6" />
      </svg>

      {/* Top Atelier Eyebrow Stamp */}
      <div className="hero-exit-meta hero-sub-reveal relative z-10 flex items-center gap-3 mb-2 sm:mb-3">
        <span
          className={`hero-couture-rule block h-px w-8 sm:w-12 origin-left ${isNight ? "bg-indigo-400/70" : "bg-[#a6864a]/80"
            }`}
        />
        <span
          className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.38em] ${isNight ? "text-slate-400" : "text-neutral-500"
            }`}
        >
          Atelier · Edition XXVI
        </span>
      </div>

      {/* HAUTE-COUTURE ASYMMETRICAL MASTHEAD */}
      <h1 className="relative z-10">
        {/* ROW 1: Sweeping High-Contrast Didone Italic Serif ("Saswat") */}
        <span className="hero-exit-first flex items-center gap-4 sm:gap-6 will-change-transform">
          <span
            className={`${cormorant.className} relative inline-flex items-baseline overflow-hidden pl-2 -ml-2 pr-4 pb-2 -mb-2 text-[4.3rem] sm:text-[6.4rem] md:text-[7.6rem] lg:text-[9rem] font-light italic leading-[0.84] tracking-[-0.03em] transition-colors duration-500 ${isNight
                ? "text-white drop-shadow-[0_6px_36px_rgba(0,0,0,0.75)]"
                : "text-[#111111]"
              }`}
          >
            <span
              ref={shimmerRef}
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 opacity-0 blur-md ${isNight
                  ? "bg-gradient-to-r from-transparent via-indigo-200/35 to-transparent"
                  : "bg-gradient-to-r from-transparent via-[#e8d5b0]/55 to-transparent"
                }`}
            />

            {"Saswat".split("").map((ch, i) => (
              <span
                key={i}
                className={`hero-enter-char inline-block will-change-transform ${i === 0 ? `text-[1.08em] font-normal ${accentText}` : ""
                  }`}
              >
                {ch}
              </span>
            ))}
          </span>

          {/* Editorial Shoulder Hairline + 4-Point Atelier Star */}
          <span className="hero-sub-reveal hidden sm:inline-flex items-center gap-2.5 self-center mt-2">
            <span
              className={`hero-couture-rule block h-px w-10 md:w-16 origin-left ${isNight ? "bg-slate-700" : "bg-neutral-300"
                }`}
            />
            <svg
              ref={starRef}
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 overflow-hidden will-change-transform"
            >
              <path
                d="M12 1 C12.4 8.2 15.8 11.6 23 12 C15.8 12.4 12.4 15.8 12 23 C11.6 15.8 8.2 12.4 1 12 C8.2 11.6 11.6 8.2 12 1 Z"
                fill={accentHex}
              />
            </svg>
            <span
              className={`text-[10px] font-mono tracking-[0.26em] ${isNight ? "text-slate-400" : "text-neutral-400"
                }`}
            >
              Φ 1.618
            </span>
          </span>
        </span>

        {/* ROW 2: Golden-Section Indented Wide-Tracked Architectural Display ("MOHANTY") */}
        <span className="hero-exit-last flex items-start gap-2.5 sm:gap-3 pl-7 sm:pl-14 md:pl-20 lg:pl-24 -mt-1 sm:-mt-3 will-change-transform">
          <span
            ref={lastRowRef}
            style={{ letterSpacing: "0.18em" }}
            className={`font-['Clash_Display',sans-serif] inline-flex overflow-hidden py-1 text-[2.15rem] sm:text-[3.4rem] md:text-[4.25rem] lg:text-[5rem] font-light uppercase leading-[0.95] transition-colors duration-500 ${isNight
                ? "text-slate-100 drop-shadow-[0_4px_28px_rgba(0,0,0,0.8)]"
                : "text-neutral-900"
              }`}
          >
            {"MOHANTY".split("").map((ch, i) => (
              <span key={i} className="hero-enter-char inline-block will-change-transform">
                {ch}
              </span>
            ))}
          </span>

          {/* Framed Circular Maison ® Seal */}
          <span
            className={`hero-title-badge mt-1 sm:mt-2 inline-flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-full border text-[10px] sm:text-xs font-mono ${isNight
                ? "border-indigo-400/50 text-indigo-300 bg-slate-950/60"
                : "border-[#a6864a]/50 text-[#a6864a] bg-white/70"
              }`}
          >
            ®
          </span>
        </span>
      </h1>

      {/* Editorial Colophon Credentials Bar */}
      <div className="hero-exit-meta hero-sub-reveal relative z-10 mt-6 sm:mt-7 pt-4">
        <div
          className={`hero-couture-rule h-px w-full max-w-md mb-3.5 origin-left ${isNight ? "bg-slate-800" : "bg-neutral-200/90"
            }`}
        />
        <div
          className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] sm:text-xs font-mono tracking-[0.24em] uppercase ${isNight ? "text-slate-400" : "text-neutral-500"
            }`}
        >
          <span>Spatial Computing</span>
          <span className={`text-[9px] ${accentText}`}>✦</span>
          <span>Interactive Systems</span>
          <span className={`text-[9px] ${accentText}`}>✦</span>
          <span>WebGL Direction</span>
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
      // 2. Global Scroll Progress Tracker
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
        },
      });

      // Chapter Wayfinding Observer
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

      // 3. ZERO-CONFLICT HAUTE-COUTURE HERO CHOREOGRAPHY
      gsap.fromTo(
        ".hero-enter-char",
        { yPercent: 118, rotateZ: 3, opacity: 0 },
        {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          duration: 1.15,
          stagger: 0.034, // Fibonacci cadence
          ease: "expo.out",
          delay: 0.12,
        }
      );

      gsap.to(".hero-couture-arc", {
        strokeDashoffset: 0,
        duration: 1.5,
        delay: 0.28,
        ease: "power3.inOut",
      });

      gsap.fromTo(
        ".hero-couture-rule",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          stagger: 0.12,
          delay: 0.35,
          ease: "expo.inOut",
        }
      );

      gsap.fromTo(
        ".hero-title-badge",
        { scale: 0, rotate: -90, opacity: 0 },
        { scale: 1, rotate: 0, opacity: 1, duration: 0.85, delay: 0.5, ease: "back.out(1.8)" }
      );

      gsap.fromTo(
        [".hero-sub-reveal", ".hero-scroll-reveal", ".hero-top-bar"],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.48, stagger: 0.12, ease: "power3.out" }
      );

      gsap.to(".hero-cue-orbit", {
        rotation: 360,
        duration: 13,
        repeat: -1,
        ease: "none",
        svgOrigin: "24 24",
      });

      // Lookbook Gatefold Scroll-Out: "Saswat" glides left, "MOHANTY" parts right & down
      gsap.to(".hero-exit-first", {
        xPercent: -26,
        opacity: 0,
        filter: "blur(8px)",
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom 22%",
          scrub: 0.9,
        },
      });

      gsap.to(".hero-exit-last", {
        xPercent: 18,
        yPercent: 20,
        opacity: 0,
        filter: "blur(8px)",
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom 22%",
          scrub: 0.9,
        },
      });

      gsap.to(".hero-exit-meta", {
        y: 20,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom 32%",
          scrub: 0.9,
        },
      });

      // 4. Story Sections
      const sections = document.querySelectorAll(".story-section:not(#hero)");
      sections.forEach((section) => {
        const vessel = section.querySelector(".phi-vessel");
        const badges = section.querySelectorAll(".reveal-badge");
        const headings = section.querySelectorAll(".reveal-heading");
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
            { y: 42, opacity: 0, scale: 0.97 },
            { y: 0, opacity: 1, scale: 1, duration: 1.05 },
            0
          );
        }
        if (rules.length) {
          secTl.fromTo(
            rules,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.1, transformOrigin: "left center", ease: "expo.inOut" },
            0.05
          );
        }
        if (badges.length) {
          secTl.fromTo(badges, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.08);
        }
        if (headings.length) {
          secTl.fromTo(headings, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.95 }, 0.14);
        }
        if (texts.length) {
          secTl.fromTo(texts, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.08 }, 0.22);
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
      });

      // 5. Continuous Mathematical Diagram Loops
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
    ? "bg-slate-950/78 border-slate-800/85 shadow-[0_14px_48px_rgba(0,0,0,0.55)] text-white"
    : "bg-white/78 border-neutral-200/75 shadow-[0_14px_48px_rgba(0,0,0,0.045)] text-neutral-900";

  const accentText = isNight ? "text-indigo-400" : "text-[#a6864a]";

  return (
    <div
      ref={mainRef}
      className={`relative min-h-screen selection:bg-neutral-900 selection:text-white overflow-x-clip transition-colors duration-700 ${isNight ? "bg-[#060a17] text-white" : "bg-white text-neutral-900"
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

      {/* Pure Typography Frameless Navigation Bar on Top */}
      <FramelessNav activeTheme={activeTheme} />

      {/* High-End Architectural Grid Line Overlay */}
      <ArchitecturalGrid />

      {/* Ambient Soundtrack Controller (The_Unfolding_Map.mp3) */}
      <AmbientSound scrollProgress={scrollProgress} />

      {/* Top Hairline Golden-Ratio Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none">
        <div
          ref={topHairlineRef}
          className={`h-full w-full origin-left scale-x-0 will-change-transform ${isNight ? "bg-indigo-400" : "bg-[#a6864a]"
            }`}
        />
      </div>

      {/* Subtle Viewport Golden-Section Axis Registration Ticks (38.2% & 61.8%) */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-10 hidden xl:block">
        <div
          className={`absolute top-0 bottom-0 left-[38.2%] w-px transition-colors duration-700 ${isNight ? "bg-white/[0.025]" : "bg-black/[0.025]"
            }`}
        />
        <div
          className={`absolute top-0 bottom-0 left-[61.8%] w-px transition-colors duration-700 ${isNight ? "bg-white/[0.025]" : "bg-black/[0.025]"
            }`}
        />
      </div>

      {/* =========================================================================
          HARMONIC MERIDIAN WAYFINDING HUD (Right Edge, Desktop XL+)
          ========================================================================= */}
      <aside
        aria-label="Section navigation"
        className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3.5"
      >
        <div className="flex flex-col items-end gap-1 mb-1 pointer-events-none select-none">
          <svg viewBox="0 0 56 56" fill="none" className="size-10 overflow-hidden">
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke={isNight ? "rgba(165,180,252,0.18)" : "rgba(166,134,74,0.22)"}
              strokeWidth="0.8"
              strokeDasharray="2 4"
            />
            <path
              d={pageSpirals.hud.d}
              stroke={isNight ? "rgba(165,180,252,0.18)" : "rgba(23,23,23,0.12)"}
              strokeWidth="1"
            />
            <path
              ref={hudSpiralPathRef}
              d={pageSpirals.hud.d}
              stroke={isNight ? "#a5b4fc" : "#a6864a"}
              strokeWidth="1.4"
              strokeDasharray={pageSpirals.hud.length}
              strokeDashoffset={pageSpirals.hud.length}
            />
          </svg>
          <span
            ref={hudAngleRef}
            className={`text-[9px] font-mono tracking-widest tabular-nums ${isNight ? "text-indigo-300/70" : "text-[#a6864a]"
              }`}
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
                className={`text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-300 ${active
                    ? isNight
                      ? "opacity-100 text-indigo-300 translate-x-0"
                      : "opacity-100 text-neutral-900 translate-x-0"
                    : isNight
                      ? "opacity-0 group-hover:opacity-85 text-slate-400 translate-x-2 group-hover:translate-x-0"
                      : "opacity-0 group-hover:opacity-85 text-neutral-500 translate-x-2 group-hover:translate-x-0"
                  }`}
              >
                {chap.num} · {chap.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${active
                    ? isNight
                      ? "w-5 h-1.5 bg-indigo-400"
                      : "w-5 h-1.5 bg-[#a6864a]"
                    : isNight
                      ? "size-1.5 bg-slate-600 group-hover:bg-indigo-300"
                      : "size-1.5 bg-neutral-400/50 group-hover:bg-neutral-900"
                  }`}
              />
            </button>
          );
        })}

        <span
          ref={hudPctRef}
          className={`mt-1 text-[10px] font-mono tracking-widest tabular-nums pointer-events-none ${isNight ? "text-slate-500" : "text-neutral-400"
            }`}
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
          SECTION 0: HERO (3D Model Unobstructed in Center, Couture Masthead)
          ========================================================================= */}
      <section
        id="hero"
        className="story-section hero-section relative z-20 min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-16 pt-24 pb-20"
      >
        {/* Top Header Status Row */}
        <div
          className={`hero-top-bar w-full flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] transition-colors select-none ${isNight ? "text-slate-400" : "text-neutral-400"
            }`}
        >
          <div className="hidden sm:flex items-center gap-3">
            <span>Spatial Systems & Motion Direction</span>
            <span className={`text-[10px] tracking-[0.25em] ${accentText}`}>Φ 1.618</span>
          </div>
          <div className="text-[11px] font-mono tracking-widest text-right">
            <span>STUDIO 2026 // NEW DELHI</span>
          </div>
        </div>

        {/* Center Open Space for 3D ShipScene */}
        <div className="flex-1 flex items-center justify-center pointer-events-none" />

        {/* Bottom Row: Haute-Couture Signature + Logarithmic Scroll Cue */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-8 z-30 pointer-events-none">
          <CoutureHeroSignature isNight={isNight} />

          {/* BOTTOM RIGHT: GOLDEN SPIRAL SCROLL PENDULUM */}
          <div className="hero-exit-meta hero-scroll-reveal flex items-center md:flex-col md:items-end gap-3 pointer-events-none pb-2">
            <span
              className={`text-xs font-mono tracking-widest uppercase ${isNight ? "text-slate-400" : "text-neutral-400"
                }`}
            >
              Scroll to explore
            </span>
            <div className="relative size-12 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="size-12 overflow-hidden">
                <g className="hero-cue-orbit">
                  <circle
                    cx="24"
                    cy="24"
                    r="21"
                    stroke={isNight ? "rgba(165,180,252,0.3)" : "rgba(166,134,74,0.35)"}
                    strokeWidth="0.9"
                    strokeDasharray="3 5"
                  />
                  <circle cx="24" cy="3" r="2.2" fill={isNight ? "#a5b4fc" : "#a6864a"} />
                </g>
                <path
                  d={pageSpirals.heroCue.d}
                  stroke={isNight ? "rgba(255,255,255,0.7)" : "rgba(23,23,23,0.75)"}
                  strokeWidth="1.15"
                />
                <circle cx="24" cy="24" r="2" fill={isNight ? "#a5b4fc" : "#171717"} />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: 01 MECHANICS (Left 38.2% Golden Anchor + Keplerian Chamber)
          ========================================================================= */}
      <section
        id="mechanics"
        className="story-section relative z-20 min-h-screen flex items-center px-6 sm:px-12 lg:px-16 py-28"
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-start">
          <div
            onMouseMove={(e) => handleCardMove(e, false)}
            className={`phi-vessel group relative overflow-hidden w-full max-w-xl backdrop-blur-md p-8 sm:p-10 rounded-3xl border transition-colors duration-500 will-change-transform ${cardSurface}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: isNight
                  ? "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.12), transparent 65%)"
                  : "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(166,134,74,0.11), transparent 65%)",
              }}
            />

            <div className="relative z-10">
              <div className="reveal-badge flex items-center justify-between mb-4">
                <span className={`text-xs font-mono uppercase tracking-[0.2em] ${accentText}`}>
                  01 / Kinematics & Classical Form
                </span>
                <span className={`text-[10px] font-mono tracking-[0.22em] ${isNight ? "text-slate-500" : "text-neutral-400"}`}>
                  1 : 1.618
                </span>
              </div>

              <OrbitalVectorsChamber isNight={isNight} />

              <h2
                className={`reveal-heading font-['Clash_Display',sans-serif] text-3xl sm:text-5xl lg:text-[3.25rem] font-semibold tracking-tight leading-[1.06] mb-5 ${isNight ? "text-white" : "text-neutral-900"
                  }`}
              >
                Four Concentric Orbital Vectors
              </h2>

              <p
                className={`reveal-text text-sm sm:text-base font-light leading-relaxed mb-7 ${isNight ? "text-slate-300" : "text-neutral-600"
                  }`}
              >
                Engineered to maintain absolute dimensional equilibrium. Blending classical sculptural heritage with real-time WebGL rendering, architectural topography rotates seamlessly in responsive 3D space.
              </p>

              <div className={`phi-rule h-px w-full mb-5 ${isNight ? "bg-slate-800" : "bg-neutral-200/90"}`} />

              <div
                className={`reveal-card text-xs font-mono uppercase tracking-wider flex flex-wrap items-center gap-3 ${isNight ? "text-slate-400" : "text-neutral-500"
                  }`}
              >
                <span>Interactive Flight</span>
                <span className={accentText}>•</span>
                <span>Volumetric Depth</span>
                <span className={accentText}>•</span>
                <span>PBR Materials</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 02 CONVERGENCE (Vesica Piscis √3:1 Optical Quartz Sanctuary)
          ========================================================================= */}
      <section
        id="convergence"
        className="story-section relative z-20 min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-28 text-center"
      >
        <div
          onMouseMove={(e) => handleCardMove(e, false)}
          className={`phi-vessel group relative overflow-hidden max-w-4xl mx-auto flex flex-col items-center w-full backdrop-blur-md p-8 sm:p-12 rounded-3xl border transition-colors duration-500 will-change-transform ${cardSurface}`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: isNight
                ? "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.12), transparent 65%)"
                : "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(166,134,74,0.11), transparent 65%)",
            }}
          />

          <div className="relative z-10 w-full flex flex-col items-center">
            <span className={`reveal-badge text-xs font-mono uppercase tracking-[0.22em] mb-3 block ${accentText}`}>
              02 / Equilibrium & Heritage
            </span>

            <OpticalVesicaCrest isNight={isNight} />

            <h2
              className={`reveal-heading font-['Clash_Display',sans-serif] text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.06] mb-6 ${isNight ? "text-white" : "text-neutral-900"
                }`}
            >
              Optical Quartz Crystal Resonance
            </h2>

            <p
              className={`reveal-text text-sm sm:text-base md:text-lg font-light leading-relaxed mb-8 max-w-2xl ${isNight ? "text-slate-300" : "text-neutral-600"
                }`}
            >
              At the epicenter lies high-renaissance digital craftsmanship. High-precision sculptural topology merges with dynamic lighting and camera perspective controls.
            </p>

            <div className={`phi-rule h-px w-full max-w-2xl mb-6 ${isNight ? "bg-slate-800" : "bg-neutral-200/90"}`} />

            <div
              className={`reveal-card flex flex-wrap items-center justify-center gap-4 text-xs font-mono uppercase tracking-widest ${isNight ? "text-slate-400" : "text-neutral-500"
                }`}
            >
              <span>High-Precision Photogrammetry</span>
              <span className={accentText}>•</span>
              <span>Sub-Surface Specular</span>
              <span className={accentText}>•</span>
              <span>Frictionless Orbit</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: 03 ARCHITECTURE (Right 38.2% Golden Anchor + Fresnel Manifold)
          ========================================================================= */}
      <section
        id="synthesis"
        className="story-section relative z-20 min-h-screen flex items-center px-6 sm:px-12 lg:px-16 py-28"
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-end">
          <div
            onMouseMove={(e) => handleCardMove(e, false)}
            className={`phi-vessel group relative overflow-hidden w-full max-w-xl backdrop-blur-md p-8 sm:p-10 rounded-3xl border transition-colors duration-500 will-change-transform ${cardSurface}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: isNight
                  ? "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.12), transparent 65%)"
                  : "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(166,134,74,0.11), transparent 65%)",
              }}
            />

            <div className="relative z-10">
              <div className="reveal-badge flex items-center justify-between mb-4">
                <span className={`text-xs font-mono uppercase tracking-[0.2em] ${accentText}`}>
                  03 / Shaders & Materials
                </span>
                <span className={`text-[10px] font-mono tracking-[0.22em] ${isNight ? "text-slate-500" : "text-neutral-400"}`}>
                  Φ⁻¹ · FRESNEL
                </span>
              </div>

              <FresnelShaderChamber isNight={isNight} />

              <h2
                className={`reveal-heading font-['Clash_Display',sans-serif] text-3xl sm:text-5xl lg:text-[3.25rem] font-semibold tracking-tight leading-[1.06] mb-5 ${isNight ? "text-white" : "text-neutral-900"
                  }`}
              >
                Physically-Based Interactive Shaders
              </h2>

              <p
                className={`reveal-text text-sm sm:text-base font-light leading-relaxed mb-7 ${isNight ? "text-slate-300" : "text-neutral-600"
                  }`}
              >
                Merging volumetric brushstroke geometry with modern real-time lighting. Every rim highlight, woven cloud texture, and atmospheric depth computes dynamically against lighting environments.
              </p>

              <div className={`phi-rule h-px w-full mb-5 ${isNight ? "bg-slate-800" : "bg-neutral-200/90"}`} />

              <ul
                className={`space-y-3 font-mono text-xs ${isNight ? "text-slate-300" : "text-neutral-600"
                  }`}
              >
                <li className="reveal-card flex items-center gap-3">
                  <span className={`text-[10px] ${accentText}`}>01</span>
                  <span className={`h-px w-3 ${isNight ? "bg-slate-700" : "bg-neutral-300"}`} />
                  <span>3D Volumetric Cloud Depth Reconstruction</span>
                </li>
                <li className="reveal-card flex items-center gap-3">
                  <span className={`text-[10px] ${accentText}`}>02</span>
                  <span className={`h-px w-3 ${isNight ? "bg-slate-700" : "bg-neutral-300"}`} />
                  <span>Real-Time PBR Material Pipeline with ACES Tone Mapping</span>
                </li>
                <li className="reveal-card flex items-center gap-3">
                  <span className={`text-[10px] ${accentText}`}>03</span>
                  <span className={`h-px w-3 ${isNight ? "bg-slate-700" : "bg-neutral-300"}`} />
                  <span>Responsive Coordinate Mapping Across Desktop & Mobile Viewports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: 04 SHOWCASE GATEWAY — TRUE GOLDEN RATIO SPIRAL MOSAIC
          ========================================================================= */}
      <section
        id="showcase"
        className="story-section relative z-20 min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-32 text-center"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center w-full">
          <span className={`reveal-badge text-xs font-mono uppercase tracking-[0.22em] mb-4 block ${accentText}`}>
            04 / Selected Works
          </span>

          <h2
            className={`reveal-heading font-['Clash_Display',sans-serif] text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight mb-6 ${isNight ? "text-white" : "text-neutral-900"
              }`}
          >
            Explorations in Physical & Digital Form
          </h2>

          <p
            className={`reveal-text text-sm sm:text-base md:text-lg font-light leading-relaxed mb-12 max-w-2xl ${isNight ? "text-slate-300" : "text-neutral-600"
              }`}
          >
            A portfolio of spatial computing interfaces, brand identities, and generative WebGL installations engineered for visionary brands.
          </p>

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
                stroke={isNight ? "rgba(165,180,252,0.42)" : "rgba(166,134,74,0.45)"}
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
                onMouseEnter={() => setVellinHovered(true)}
                onMouseLeave={(e) => {
                  setVellinHovered(false);
                  handleCardLeave(e, true);
                }}
                style={{ transformStyle: "preserve-3d" }}
                className={`reveal-card group relative overflow-hidden p-7 sm:p-8 rounded-3xl text-left flex flex-col justify-between no-underline border backdrop-blur-md transition-colors duration-500 will-change-transform ${isNight
                    ? "bg-slate-900/85 border-slate-800 text-white hover:border-indigo-400/60 shadow-xl"
                    : "bg-white/85 border-neutral-200/90 text-neutral-900 hover:border-[#a6864a]/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                  }`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: isNight
                      ? "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(129,140,248,0.14), transparent 65%)"
                      : "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(166,134,74,0.12), transparent 65%)",
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase tracking-[0.22em] ${accentText}`}>
                    01 / SPATIAL INTERFACE
                  </span>
                  <span className={`text-[10px] font-mono ${isNight ? "text-slate-500" : "text-neutral-400"}`}>
                    Φ² · 61.8%
                  </span>
                </div>

                <div className="relative z-10 w-full h-48 sm:h-56 my-3 overflow-hidden">
                  <GoldenPolyhedronMiniCanvas isNight={isNight} hovered={vellinHovered} />
                </div>

                <div className="relative z-10 flex items-end justify-between pt-4 border-t border-current/10">
                  <div>
                    <span className="font-['Clash_Display',sans-serif] text-2xl sm:text-3xl font-semibold block tracking-tight">
                      Vellin Studio
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
                  onMouseLeave={(e) => handleCardLeave(e, true)}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`reveal-card group relative overflow-hidden p-6 rounded-3xl text-left flex flex-col justify-between no-underline border backdrop-blur-md transition-colors duration-500 will-change-transform ${isNight
                      ? "bg-slate-900/85 border-slate-800 text-white hover:border-indigo-400/60 shadow-xl"
                      : "bg-white/85 border-neutral-200/90 text-neutral-900 hover:border-[#a6864a]/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase tracking-[0.2em] ${accentText}`}>
                      02 / SOUND ARCHITECTURE
                    </span>
                    <span className={`text-[10px] font-mono ${isNight ? "text-slate-500" : "text-neutral-400"}`}>
                      3 : 5
                    </span>
                  </div>

                  <div className="w-full h-24 my-2 overflow-hidden">
                    <ShowcaseMicroDiagram type="aura" isNight={isNight} />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-current/10">
                    <span className="font-['Clash_Display',sans-serif] text-xl font-semibold block">
                      Aura Spatial
                    </span>
                    <span className="text-xs font-mono opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
                  </div>
                </Link>

                {/* CARD 03: Kroma System */}
                <Link
                  href="/projects"
                  onMouseMove={(e) => handleCardMove(e, true)}
                  onMouseLeave={(e) => handleCardLeave(e, true)}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`reveal-card group relative overflow-hidden p-6 rounded-3xl text-left flex flex-col justify-between no-underline border backdrop-blur-md transition-colors duration-500 will-change-transform ${isNight
                      ? "bg-slate-900/85 border-slate-800 text-white hover:border-indigo-400/60 shadow-xl"
                      : "bg-white/85 border-neutral-200/90 text-neutral-900 hover:border-[#a6864a]/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-[0.2em] block mb-1 ${accentText}`}>
                        03 / GENERATIVE SYSTEM
                      </span>
                      <span className="font-['Clash_Display',sans-serif] text-xl font-semibold block">
                        Kroma System
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
                className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold tracking-wide no-underline transition-all shadow-[0_6px_24px_rgba(0,0,0,0.12)] active:scale-95 ${isNight
                    ? "bg-white text-neutral-950 hover:bg-slate-100"
                    : "bg-neutral-900 text-white hover:bg-black"
                  }`}
              >
                <span>Explore Selected Projects (08)</span>
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

            <a
              href="mailto:saswat@example.com"
              className={`inline-flex items-center gap-2 px-6 py-4 rounded-full text-sm font-medium transition-colors shadow-sm no-underline ${isNight
                  ? "bg-slate-900/90 text-white border border-slate-700 hover:border-indigo-400"
                  : "bg-white/90 text-neutral-900 border border-neutral-200 hover:border-neutral-900"
                }`}
            >
              <span>Initiate Collaboration</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: 05 ENGINEERING SKYLINE
          ========================================================================= */}
      <section
        id="skyline"
        className="story-section relative z-20 min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 pb-28"
      >
        <div className="max-w-5xl mx-auto w-full">
          <div
            className={`phi-vessel mb-6 text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 backdrop-blur-md p-6 sm:p-8 rounded-3xl border transition-colors duration-500 ${cardSurface}`}
          >
            <div>
              <span className={`reveal-badge text-xs font-mono uppercase tracking-[0.2em] mb-2 block ${accentText}`}>
                05 / Activity
              </span>

              <h2
                className={`reveal-heading font-['Clash_Display',sans-serif] text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight mb-2 ${isNight ? "text-white" : "text-neutral-900"
                  }`}
              >
                Engineering & Kinetic Cadence
              </h2>

              <p
                className={`reveal-text text-xs sm:text-sm font-light max-w-xl leading-relaxed ${isNight ? "text-slate-300" : "text-neutral-500"
                  }`}
              >
                Live GitHub commit continuum for{" "}
                <a
                  href="https://github.com/SazWhatician"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-medium underline underline-offset-4 ${isNight ? "text-indigo-300 hover:text-white" : "text-neutral-900 hover:text-black"
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
              className={`reveal-card inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all self-start sm:self-auto shadow-sm no-underline ${isNight
                  ? "border border-slate-700 text-slate-200 hover:text-white hover:border-indigo-400 bg-slate-900/80"
                  : "border border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:border-neutral-400 bg-neutral-50/80"
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

          <div className="mt-12">
            <div className={`phi-rule h-px w-full mb-6 ${isNight ? "bg-slate-800" : "bg-neutral-200/80"}`} />
            <div
              className={`flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-4 ${isNight ? "text-slate-400" : "text-neutral-400"
                }`}
            >
              <div>© 2026 SASWAT MOHANTY. ALL RIGHTS RESERVED.</div>
              <div className="flex items-center gap-6">
                <span className={accentText}>Φ 1.61803</span>
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