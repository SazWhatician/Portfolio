"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { cozyAudio } from "@/lib/cozy-sound";
import TeamMemberCard from "@/components/ui/team-member-card";
import FramelessNav from "@/components/ui/frameless-nav";

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 137.507764°

const DISCIPLINES = [
  {
    number: "01",
    title: "Spatial Computing & WebGL",
    description:
      "Crafting immersive, real-time 3D spatial viewports that dissolve the boundary between mathematical code and cinematic depth.",
    technologies: ["Three.js", "WebGL2", "GLSL Shaders", "WebXR", "GLTF Architecture"],
    diagram: "spatial",
  },
  {
    number: "02",
    title: "Kinetic Motion Architecture",
    description:
      "Engineering sub-millisecond spring dynamics, non-linear easing curves, and uninterrupted inertial scrolling narratives.",
    technologies: ["GSAP 3", "ScrollTrigger", "Framer Motion", "Lenis Scroll", "Kinetic Physics"],
    diagram: "kinetic",
  },
  {
    number: "03",
    title: "Tactile Sensory Acoustics",
    description:
      "Modeling physical modal chimes, Euler-Bernoulli beam harmonics, and spatial binaural reverberation with the Web Audio API.",
    technologies: ["Web Audio API", "DSP Synthesis", "Spatial Panning", "Modal Harmonics"],
    diagram: "acoustics",
  },
  {
    number: "04",
    title: "Architectural Frontend Systems",
    description:
      "Building resilient, accessible, and high-performance web systems with clean component modularity and precision typography.",
    technologies: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Design Systems"],
    diagram: "systems",
  },
];

const CHRONOLOGY = [
  {
    period: "2024 — Present",
    role: "Lead Creative Technologist & Spatial Systems Architect",
    studio: "Novasite Studio",
    location: "New Delhi, India",
    highlight:
      "Directing real-time WebGL graphics, spatial interaction topologies, and experimental generative audio architectures.",
  },
  {
    period: "2023 — 2024",
    role: "Senior Interactive Graphics Engineer",
    studio: "Spatial Continuum Lab",
    location: "Remote",
    highlight:
      "Engineered high-performance GLSL shader pipelines, physically based rendering (PBR) scenes, and fluid motion design systems.",
  },
  {
    period: "2022 — 2023",
    role: "Creative Developer & Computational Designer",
    studio: "Studio Vanguard",
    location: "New Delhi, India",
    highlight:
      "Spearheaded award-winning digital experiences, generative visual identity systems, and micro-interaction frameworks.",
  },
];

const CHAPTERS = [
  { id: "01", label: "Profile & Editorial", short: "Identity" },
  { id: "02", label: "02 / Philosophy", short: "Philosophy" },
  { id: "03", label: "03 / Capabilities", short: "Capabilities" },
  { id: "04", label: "04 / Trajectory", short: "Trajectory" },
  { id: "05", label: "05 / Dialogue", short: "Dialogue" },
];

function computeLogSpiral(cx, cy, maxTheta, a, steps = 140) {
  const b = (2 * Math.log(PHI)) / Math.PI;
  let d = "";
  let length = 0;
  let px = 0;
  let py = 0;

  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * maxTheta;
    const r = a * Math.exp(b * th);
    const x = cx + Math.cos(th) * r;
    const y = cy + Math.sin(th) * r;
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

/* ============================================================================
   1. REAL-TIME 4D HOPF FIBRATION + 3D OPHANIM ANGELIC GEOMETRY ENGINE
   Zero GC allocations per frame. Clearly legible antique-brass & graphite ink.
   ============================================================================ */
function AngelicOphanimCanvas({ bridgeRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId = 0;

    // 18 Golden-Angle Villarceau fibers on S³
    const FIBERS = 18;
    const SEGS = 44;
    const fiberBuf = new Float32Array(FIBERS * (SEGS + 1) * 4);

    let pIdx = 0;
    for (let f = 0; f < FIBERS; f++) {
      const frac = (f + 0.5) / FIBERS;
      const eta = 0.4 + frac * 0.76;
      const phi = f * GOLDEN_ANGLE;
      const cosE = Math.cos(eta);
      const sinE = Math.sin(eta);
      for (let s = 0; s <= SEGS; s++) {
        const u = (s / SEGS) * Math.PI * 2;
        fiberBuf[pIdx++] = cosE * Math.cos(u);
        fiberBuf[pIdx++] = cosE * Math.sin(u);
        fiberBuf[pIdx++] = sinE * Math.cos(u + phi);
        fiberBuf[pIdx++] = sinE * Math.sin(u + phi);
      }
    }

    // 3 Interlocking Ophanim Angelic Wheels (Radii strictly 1, 1/PHI, 1/PHI²)
    const wheels = [
      { r: 1.46, eyes: 8, ax: 0.45, ay: 0.25, az: 0.12, spd: 0.34, gold: true },
      { r: 1.46 / PHI, eyes: 5, ax: -0.62, ay: 0.68, az: -0.2, spd: -0.52, gold: false },
      { r: 1.46 / (PHI * PHI), eyes: 3, ax: 0.88, ay: -0.36, az: 0.45, spd: 0.78, gold: true },
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    let smx = 0;
    let smy = 0;

    const drawWheel = (rad, eyeCount, ax, ay, az, cx, cy, scPx, fov, dilation, rimColor, eyeColor) => {
      const ca = Math.cos(ax), sa = Math.sin(ax);
      const cb = Math.cos(ay), sb = Math.sin(ay);
      const cg = Math.cos(az), sg = Math.sin(az);
      const R = rad * scPx;

      ctx.beginPath();
      const STEPS = 76;
      for (let i = 0; i <= STEPS; i++) {
        const u = (i / STEPS) * Math.PI * 2;
        const x0 = Math.cos(u) * R;
        const y0 = Math.sin(u) * R;
        const y1 = y0 * ca;
        const z1 = y0 * sa;
        const x2 = x0 * cb + z1 * sb;
        const z2 = -x0 * sb + z1 * cb;
        const x3 = x2 * cg - y1 * sg;
        const y3 = x2 * sg + y1 * cg;

        const persp = fov / (fov + z2);
        const px = cx + x3 * persp;
        const py = cy + y3 * persp;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Vesica Piscis Eyes along rim
      for (let e = 0; e < eyeCount; e++) {
        const u = (e / eyeCount) * Math.PI * 2;
        const x0 = Math.cos(u) * R;
        const y0 = Math.sin(u) * R;
        const y1 = y0 * ca;
        const z1 = y0 * sa;
        const x2 = x0 * cb + z1 * sb;
        const z2 = -x0 * sb + z1 * cb;
        const x3 = x2 * cg - y1 * sg;
        const y3 = x2 * sg + y1 * cg;

        const persp = fov / (fov + z2);
        const px = cx + x3 * persp;
        const py = cy + y3 * persp;
        const sz = 7.2 * persp;
        const lid = sz * (0.48 + dilation * 0.35);
        const tang = Math.atan2(y3, x3) + Math.PI / 2;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(tang);
        ctx.beginPath();
        ctx.moveTo(-sz, 0);
        ctx.quadraticCurveTo(0, -lid, sz, 0);
        ctx.quadraticCurveTo(0, lid, -sz, 0);
        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = 0.9;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1.2, sz * 0.24), 0, Math.PI * 2);
        ctx.fillStyle = eyeColor;
        ctx.fill();
        ctx.restore();
      }
    };

    const render = () => {
      const st = bridgeRef.current;
      const vis = Math.max(0, 1 - st.engulf * 1.35);
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (vis > 0.01) {
        const velFactor = Math.min(Math.abs(st.velocity) / 2200, 1);
        t += 0.004 + velFactor * 0.022;
        smx += (st.mx - smx) * 0.05;
        smy += (st.my - smy) * 0.05;

        const p = st.progress;
        const cx = w * (0.52 + Math.sin(p * Math.PI * PHI) * 0.22) + smx * 36;
        const cy = h * (0.48 + Math.cos(p * Math.PI * 1.2) * 0.1) + smy * 28;
        const scPx = Math.min(w, h) * 0.26;
        const fov = 1050;

        // 4D Isoclinic double rotation
        const a4 = t * 0.68 + p * Math.PI * 2.2;
        const b4 = t * 0.45 + smx * 0.85;
        const cosA4 = Math.cos(a4), sinA4 = Math.sin(a4);
        const cosB4 = Math.cos(b4), sinB4 = Math.sin(b4);

        const camX = t * 0.3 + smy * 0.7 + p * 1.4;
        const camY = t * 0.38 - smx * 0.8 + p * 2.0;
        const cX = Math.cos(camX), sX = Math.sin(camX);
        const cY = Math.cos(camY), sY = Math.sin(camY);

        let idx = 0;
        for (let f = 0; f < FIBERS; f++) {
          ctx.beginPath();
          const gold = f % 3 === 0;
          for (let s = 0; s <= SEGS; s++) {
            const x1 = fiberBuf[idx++];
            const x2 = fiberBuf[idx++];
            const x3 = fiberBuf[idx++];
            const x4 = fiberBuf[idx++];

            const rx1 = x1 * cosA4 - x4 * sinA4;
            const rx4 = x1 * sinA4 + x4 * cosA4;
            const rx2 = x2 * cosB4 - x3 * sinB4;
            const rx3 = x2 * sinB4 + x3 * cosB4;

            const s4 = 1.48 / (2.35 - rx4);
            const X = rx1 * s4 * scPx;
            const Y = rx2 * s4 * scPx;
            const Z = rx3 * s4 * scPx;

            const Y1 = Y * cX - Z * sX;
            const Z1 = Y * sX + Z * cX;
            const X2 = X * cY + Z1 * sY;
            const Z2 = -X * sY + Z1 * cY;

            const persp = fov / (fov + Z2);
            const px = cx + X2 * persp;
            const py = cy + Y1 * persp;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }

          ctx.strokeStyle = gold
            ? `rgba(166,134,74,${(0.16 * vis).toFixed(3)})`
            : `rgba(23,23,23,${(0.08 * vis).toFixed(3)})`;
          ctx.lineWidth = gold ? 0.95 : 0.7;
          ctx.stroke();
        }

        for (let i = 0; i < wheels.length; i++) {
          const wh = wheels[i];
          const rimCol = wh.gold
            ? `rgba(166,134,74,${(0.24 * vis).toFixed(3)})`
            : `rgba(23,23,23,${(0.12 * vis).toFixed(3)})`;
          const eyeCol = wh.gold
            ? `rgba(166,134,74,${(0.45 * vis).toFixed(3)})`
            : `rgba(23,23,23,${(0.26 * vis).toFixed(3)})`;

          drawWheel(
            wh.r,
            wh.eyes,
            wh.ax + t * wh.spd + p * 1.7 + smy * 0.5,
            wh.ay + t * wh.spd * 0.72 - smx * 0.55,
            wh.az + p * 1.1,
            cx,
            cy,
            scPx,
            fov,
            velFactor,
            rimCol,
            eyeCol
          );
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [bridgeRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[1] pointer-events-none w-full h-full"
    />
  );
}

/* ============================================================================
   2. INTERACTIVE METATRON'S CUBE + FRUIT OF LIFE + GOLDEN SPIRAL (Section 02)
   Pixel-exact dash lengths. Hovering snaps to the nearest of the 13 nodes
   and illuminates its connected Platonic chords. Strictly contained 400x400.
   ============================================================================ */
function InteractiveMetatronBlueprint() {
  const [hoveredNode, setHoveredNode] = useState(null);

  const { haloCirc, circleCirc, circles, chords, spiral } = useMemo(() => {
    const cx = 200;
    const cy = 200;
    const r = 28;
    const haloR = 178;

    const centers = [{ x: cx, y: cy, tier: 0 }];
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + Math.PI / 6;
      centers.push({ x: cx + Math.cos(a) * (2 * r), y: cy + Math.sin(a) * (2 * r), tier: 1 });
    }
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + Math.PI / 6;
      centers.push({ x: cx + Math.cos(a) * (4 * r), y: cy + Math.sin(a) * (4 * r), tier: 2 });
    }

    const lines = [];
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const len = Math.hypot(centers[j].x - centers[i].x, centers[j].y - centers[i].y);
        lines.push({
          a: i,
          b: j,
          x1: centers[i].x.toFixed(2),
          y1: centers[i].y.toFixed(2),
          x2: centers[j].x.toFixed(2),
          y2: centers[j].y.toFixed(2),
          len: Number(len.toFixed(2)),
          inner: centers[i].tier < 2 && centers[j].tier < 2,
        });
      }
    }

    // Calibrated so max r = 163.5px inside 400x400 (never overflows)
    const logSpiral = computeLogSpiral(200, 200, Math.PI * 3.4, 6.2, 130);

    return {
      haloCirc: Number((2 * Math.PI * haloR).toFixed(2)),
      circleCirc: Number((2 * Math.PI * r).toFixed(2)),
      circles: centers.map((c) => ({
        x: c.x,
        y: c.y,
        cx: c.x.toFixed(2),
        cy: c.y.toFixed(2),
        r,
        tier: c.tier,
      })),
      chords: lines,
      spiral: logSpiral,
    };
  }, []);

  const handleSvgMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * 400;
    const sy = ((e.clientY - rect.top) / rect.height) * 400;

    let best = null;
    let bestD = 42;
    for (let i = 0; i < circles.length; i++) {
      const d = Math.hypot(circles[i].x - sx, circles[i].y - sy);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    setHoveredNode(best);
  };

  return (
    <div className="mt-10 w-full max-w-[340px] mx-auto lg:mx-0">
      <div className="relative rounded-2xl border border-black/[0.06] bg-[#faf9f6]/75 p-4 overflow-hidden">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          onMouseMove={handleSvgMove}
          onMouseLeave={() => setHoveredNode(null)}
          className="w-full h-auto cursor-crosshair overflow-hidden"
        >
          {/* Outer Celestial Halo */}
          <circle
            cx="200"
            cy="200"
            r="178"
            stroke="rgba(23,23,23,0.14)"
            strokeWidth="1"
            strokeDasharray={haloCirc}
            strokeDashoffset={haloCirc}
            className="metatron-halo"
          />

          {/* 78 Exact Chords of Metatron's Cube */}
          <g>
            {chords.map((l, idx) => {
              const lit = hoveredNode !== null && (l.a === hoveredNode || l.b === hoveredNode);
              return (
                <line
                  key={idx}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke={
                    lit
                      ? "#a6864a"
                      : l.inner
                        ? "rgba(166,134,74,0.34)"
                        : "rgba(23,23,23,0.11)"
                  }
                  strokeWidth={lit ? "1.35" : l.inner ? "0.85" : "0.6"}
                  strokeDasharray={l.len}
                  strokeDashoffset={l.len}
                  className="metatron-chord transition-colors duration-200"
                />
              );
            })}
          </g>

          {/* 13 Circles of the Fruit of Life */}
          <g>
            {circles.map((c, idx) => {
              const isSelected = hoveredNode === idx;
              return (
                <g key={idx}>
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={c.r}
                    stroke={
                      isSelected
                        ? "#a6864a"
                        : c.tier === 0
                          ? "#a6864a"
                          : "rgba(23,23,23,0.24)"
                    }
                    strokeWidth={isSelected ? "1.6" : c.tier === 0 ? "1.2" : "0.8"}
                    strokeDasharray={circleCirc}
                    strokeDashoffset={circleCirc}
                    className="metatron-circle transition-colors duration-200"
                  />
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={isSelected ? "4.2" : "2.1"}
                    fill={isSelected ? "#a6864a" : "rgba(23,23,23,0.38)"}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </g>

          {/* True Logarithmic Golden Spiral */}
          <path
            d={spiral.d}
            stroke="#171717"
            strokeWidth="1.5"
            strokeDasharray={spiral.length}
            strokeDashoffset={spiral.length}
            className="metatron-spiral"
          />
          <circle cx="200" cy="200" r="3.2" fill="#a6864a" />
        </svg>

        <div className="mt-2 pt-2 border-t border-black/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-500 tracking-[0.18em]">
          <span>
            {hoveredNode !== null
              ? `NODE ${String(hoveredNode + 1).padStart(2, "0")} · 12 CHORDS`
              : "METATRON · 78 CHORDS"}
          </span>
          <span className="text-[#a6864a]">Φ^(2θ/π)</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   3A. LIVE 3D DUAL GOLDEN ICOSAHEDRON + DODECAHEDRON CANVAS (Pillar 01)
   ============================================================================ */
function SpatialPolyhedronCanvas({ hovered }) {
  const canvasRef = useRef(null);
  const hoverRef = useRef(hovered);
  hoverRef.current = hovered;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId = 0;

    // Exact Golden Ratio Icosahedron vertices
    const icoVerts = [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ].map(([x, y, z]) => {
      const l = Math.hypot(x, y, z);
      return [x / l, y / l, z / l];
    });

    const icoEdges = [];
    for (let i = 0; i < icoVerts.length; i++) {
      for (let j = i + 1; j < icoVerts.length; j++) {
        const d = Math.hypot(
          icoVerts[i][0] - icoVerts[j][0],
          icoVerts[i][1] - icoVerts[j][1],
          icoVerts[i][2] - icoVerts[j][2]
        );
        if (d < 1.15) icoEdges.push([i, j]);
      }
    }

    // Dual Inner Octahedron scaled by 1/PHI
    const innerScale = 1 / PHI;
    const octVerts = [
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
    ].map(([x, y, z]) => [x * innerScale, y * innerScale, z * innerScale]);

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
    const proj = (verts, ax, ay, R, cx, cy) => {
      const ca = Math.cos(ax), sa = Math.sin(ax);
      const cb = Math.cos(ay), sb = Math.sin(ay);
      return verts.map(([x, y, z]) => {
        const y1 = y * ca - z * sa;
        const z1 = y * sa + z * ca;
        const x2 = x * cb + z1 * sb;
        const z2 = -x * sb + z1 * cb;
        const sc = 3.2 / (3.2 + z2);
        return [cx + x2 * R * sc, cy + y1 * R * sc, z2];
      });
    };

    const draw = () => {
      const w = canvas.parentElement?.clientWidth || 300;
      const h = canvas.parentElement?.clientHeight || 160;
      ctx.clearRect(0, 0, w, h);

      a += hoverRef.current ? 0.022 : 0.008;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;

      // Bounding equatorial halo
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(166,134,74,0.22)";
      ctx.lineWidth = 0.85;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner Golden Octahedron (counter-rotating)
      const pOct = proj(octVerts, -a * 1.25, -a * 0.85, R, cx, cy);
      ctx.beginPath();
      for (const [i, j] of octEdges) {
        ctx.moveTo(pOct[i][0], pOct[i][1]);
        ctx.lineTo(pOct[j][0], pOct[j][1]);
      }
      ctx.strokeStyle = "rgba(166,134,74,0.58)";
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Outer Golden Icosahedron
      const pIco = proj(icoVerts, a * 0.72, a, R, cx, cy);
      for (const [i, j] of icoEdges) {
        const front = (pIco[i][2] + pIco[j][2]) * 0.5 < 0.08;
        ctx.beginPath();
        ctx.moveTo(pIco[i][0], pIco[i][1]);
        ctx.lineTo(pIco[j][0], pIco[j][1]);
        ctx.strokeStyle = front ? "rgba(23,23,23,0.82)" : "rgba(23,23,23,0.18)";
        ctx.lineWidth = front ? 1.1 : 0.75;
        ctx.stroke();
      }

      for (const [px, py, pz] of pIco) {
        ctx.beginPath();
        ctx.arc(px, py, pz < 0.08 ? 2.4 : 1.4, 0, Math.PI * 2);
        ctx.fillStyle = pz < 0.08 ? "#a6864a" : "rgba(23,23,23,0.25)";
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full block" />;
}

/* ============================================================================
   3B. STRICTLY CONTAINED EQUATION CHAMBERS FOR ALL 4 CAPABILITIES
   Every coordinate mathematically bounded inside viewBox + overflow-hidden
   ============================================================================ */
function DisciplineChamber({ type, hovered }) {
  const geom = useMemo(() => {
    if (type === "kinetic") {
      // Exact 3:5 Fibonacci Lissajous Attractor bounded strictly in 320x160
      let d = "";
      let len = 0;
      let px = 0;
      let py = 0;
      for (let i = 0; i <= 240; i++) {
        const u = (i / 240) * Math.PI * 2;
        const x = 160 + Math.sin(3 * u + Math.PI / 2) * 114;
        const y = 80 + Math.sin(5 * u) * 54;
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

    if (type === "acoustics") {
      // 3 Euler-Bernoulli Modal Eigenmodes scaled by 1, 1/PHI, 1/PHI² around y=80
      const buildWave = (n, amp) => {
        let d = "";
        for (let i = 0; i <= 96; i++) {
          const frac = i / 96;
          const x = 24 + frac * 272;
          const y = 80 - Math.sin(n * Math.PI * frac) * amp;
          d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
        return d;
      };
      return {
        m1: buildWave(1, 52),
        m2: buildWave(2, 52 / PHI),
        m3: buildWave(3, 52 / (PHI * PHI)),
      };
    }

    return {};
  }, [type]);

  if (type === "spatial") {
    return <SpatialPolyhedronCanvas hovered={hovered} />;
  }

  if (type === "kinetic") {
    const seg = Number((geom.length * 0.16).toFixed(2));
    const gap = Number((geom.length - seg).toFixed(2));
    return (
      <svg viewBox="0 0 320 160" fill="none" className="w-full h-full overflow-hidden">
        <line x1="20" y1="80" x2="300" y2="80" stroke="rgba(23,23,23,0.08)" strokeWidth="0.8" />
        <line x1="160" y1="14" x2="160" y2="146" stroke="rgba(23,23,23,0.08)" strokeWidth="0.8" />
        <path d={geom.path} stroke="rgba(23,23,23,0.2)" strokeWidth="1" />
        <path
          d={geom.path}
          data-len={geom.length}
          stroke="#a6864a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${seg} ${gap}`}
          className="kinetic-comet"
        />
        <circle cx="160" cy="80" r="3" fill="#171717" />
      </svg>
    );
  }

  if (type === "acoustics") {
    return (
      <svg viewBox="0 0 320 160" fill="none" className="w-full h-full overflow-hidden">
        <line x1="24" y1="80" x2="296" y2="80" stroke="rgba(23,23,23,0.14)" strokeWidth="0.8" />
        <path d={geom.m1} stroke="#171717" strokeWidth="1.3" className="acoustic-wave-1" />
        <path d={geom.m2} stroke="#a6864a" strokeWidth="1.2" className="acoustic-wave-2" />
        <path d={geom.m3} stroke="rgba(23,23,23,0.36)" strokeWidth="0.95" className="acoustic-wave-3" />
        <circle cx="24" cy="80" r="2.8" fill="#171717" />
        <circle cx="296" cy="80" r="2.8" fill="#171717" />
        <circle cx="160" cy="80" r="2.4" fill="#a6864a" />
      </svg>
    );
  }

  // Exact Golden Rectangle Subdivision bounded strictly inside 320x160
  return (
    <svg viewBox="0 0 320 160" fill="none" className="w-full h-full overflow-hidden">
      <g transform="translate(55 15)">
        <rect x="0" y="0" width="210" height="129.8" stroke="#171717" strokeWidth="1.05" />
        <line x1="129.8" y1="0" x2="129.8" y2="129.8" stroke="rgba(23,23,23,0.38)" strokeWidth="0.9" />
        <line x1="129.8" y1="80.2" x2="210" y2="80.2" stroke="rgba(23,23,23,0.32)" strokeWidth="0.85" />
        <line x1="160.4" y1="80.2" x2="160.4" y2="129.8" stroke="rgba(23,23,23,0.28)" strokeWidth="0.8" />
        <line x1="129.8" y1="99.1" x2="160.4" y2="99.1" stroke="rgba(23,23,23,0.25)" strokeWidth="0.75" />
        <path
          d="M 0 129.8 A 129.8 129.8 0 0 1 129.8 0 A 80.2 80.2 0 0 1 210 80.2 A 49.6 49.6 0 0 1 160.4 129.8 A 30.6 30.6 0 0 1 129.8 99.1 A 18.9 18.9 0 0 1 148.7 80.2"
          stroke="#a6864a"
          strokeWidth="1.6"
        />
        <circle cx="152" cy="94.6" r="3" fill="#a6864a" />
        <circle cx="152" cy="94.6" r="8" stroke="rgba(166,134,74,0.45)" strokeWidth="0.9" className="systems-pulse" />
      </g>
    </svg>
  );
}

/* ============================================================================
   4. SECTION 05 ENGULFED SANCTUARY — 144-NODE GOLDEN PHYLLOTAXIS & OPHANIM HALO
   All coordinates strictly bounded inside 640x640, exact pixel dash lengths
   ============================================================================ */
function EngulfedAngelicSanctuarySVG({ shockRef }) {
  const geom = useMemo(() => {
    const cx = 320;
    const cy = 320;

    // 144 (Fibonacci F_12) Golden-Angle Phyllotaxis Nodes (max r = 228 inside 640x640)
    const seeds = Array.from({ length: 144 }, (_, i) => {
      const k = i + 1;
      const r = 19 * Math.sqrt(k);
      const a = k * GOLDEN_ANGLE;
      return {
        x: (cx + Math.cos(a) * r).toFixed(2),
        y: (cy + Math.sin(a) * r).toFixed(2),
        r: (1.1 + (k / 144) * 1.45).toFixed(2),
        op: (0.16 + (1 - k / 144) * 0.48).toFixed(2),
      };
    });

    // 13 Ophanim Vesica Piscis Eyes along outer wheel (r = 268)
    const outerR = 268;
    const midR = Number((outerR / PHI).toFixed(2));
    const innerR = Number((outerR / (PHI * PHI)).toFixed(2));

    const eyes = Array.from({ length: 13 }, (_, i) => {
      const a = (i / 13) * Math.PI * 2;
      return {
        x: (cx + Math.cos(a) * outerR).toFixed(2),
        y: (cy + Math.sin(a) * outerR).toFixed(2),
        deg: ((a * 180) / Math.PI + 90).toFixed(2),
      };
    });

    // Logarithmic Golden Spiral calibrated to max r = 242px inside 640x640
    const spiral = computeLogSpiral(320, 320, Math.PI * 3.5, 8.3, 150);

    return {
      seeds,
      eyes,
      outerR,
      outerCirc: Number((2 * Math.PI * outerR).toFixed(2)),
      midR,
      innerR,
      innerCirc: Number((2 * Math.PI * innerR).toFixed(2)),
      spiral,
    };
  }, []);

  return (
    <svg viewBox="0 0 640 640" fill="none" className="w-full h-full overflow-hidden">
      {/* CTA Overdrive Shockwave */}
      <circle ref={shockRef} cx="320" cy="320" r="185" stroke="#e5cca0" strokeWidth="1.2" opacity="0" />

      {/* Outer Ophanim Wheel with 13 Vesica Piscis Eyes */}
      <g className="sanctuary-ring-1">
        <circle
          cx="320"
          cy="320"
          r={geom.outerR}
          stroke="rgba(229,204,160,0.28)"
          strokeWidth="1"
          strokeDasharray={geom.outerCirc}
          strokeDashoffset={geom.outerCirc}
          className="sanctuary-draw"
        />
        {geom.eyes.map((eye, idx) => (
          <g key={idx} transform={`translate(${eye.x} ${eye.y}) rotate(${eye.deg})`}>
            <path
              d="M -9 0 Q 0 -5.5 9 0 Q 0 5.5 -9 0 Z"
              stroke="rgba(229,204,160,0.52)"
              strokeWidth="0.95"
              fill="#09090b"
            />
            <circle cx="0" cy="0" r="1.9" fill="#e5cca0" />
          </g>
        ))}
      </g>

      {/* Middle Phi-Scaled Wheel */}
      <g className="sanctuary-ring-2">
        <circle
          cx="320"
          cy="320"
          r={geom.midR}
          stroke="rgba(247,242,235,0.18)"
          strokeWidth="0.95"
          strokeDasharray="3 8"
        />
        <polygon
          points="320,154.4 463.4,402.8 176.6,402.8"
          stroke="rgba(229,204,160,0.2)"
          strokeWidth="0.85"
        />
        <polygon
          points="320,485.6 463.4,237.2 176.6,237.2"
          stroke="rgba(247,242,235,0.12)"
          strokeWidth="0.75"
        />
      </g>

      {/* Inner Phi² Wheel */}
      <g className="sanctuary-ring-3">
        <circle
          cx="320"
          cy="320"
          r={geom.innerR}
          stroke="rgba(229,204,160,0.34)"
          strokeWidth="1"
          strokeDasharray={geom.innerCirc}
          strokeDashoffset={geom.innerCirc}
          className="sanctuary-draw"
        />
      </g>

      {/* Logarithmic Golden Spiral */}
      <path
        d={geom.spiral.d}
        stroke="rgba(229,204,160,0.56)"
        strokeWidth="1.25"
        strokeDasharray={geom.spiral.length}
        strokeDashoffset={geom.spiral.length}
        className="sanctuary-draw"
      />

      {/* 144 Golden-Angle Phyllotaxis Sunburst */}
      <g className="sanctuary-phyllotaxis">
        {geom.seeds.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#e5cca0"
            fillOpacity={s.op}
            className="sanctuary-dot"
          />
        ))}
      </g>
    </svg>
  );
}

function ScrubParagraph({ text, className }) {
  return (
    <p className={className}>
      {text.split(" ").map((word, idx) => (
        <span key={idx} className="manifesto-word inline-block mr-[0.28em] opacity-[0.24]">
          {word}
        </span>
      ))}
    </p>
  );
}

export default function AboutPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [cardPosition, setCardPosition] = useState("left");
  const [activeSection, setActiveSection] = useState("01");
  const [hoveredDiscipline, setHoveredDiscipline] = useState(null);
  const [isEngulfed, setIsEngulfed] = useState(false);

  const pageRef = useRef(null);
  const topProgressRef = useRef(null);
  const scrollPctRef = useRef(null);
  const spineFillRef = useRef(null);
  const spineNodeRef = useRef(null);
  const engulfSectionRef = useRef(null);
  const engulfVesselRef = useRef(null);
  const engulfInnerRef = useRef(null);
  const engulfHaloRef = useRef(null);
  const engulfGlowRef = useRef(null);
  const engulfShockRef = useRef(null);
  const engulfCtaRef = useRef(null);
  const eqBarsRef = useRef(null);
  const sanctuaryLoopsRef = useRef([]);

  const bridgeRef = useRef({
    progress: 0,
    velocity: 0,
    mx: 0,
    my: 0,
    engulf: 0,
  });

  const toggleSound = () => {
    const muted = cozyAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) cozyAudio.playSnap(3, 1);
  };

  const switchCardPosition = (pos) => {
    if (pos === cardPosition) return;
    setCardPosition(pos);
    cozyAudio.playSnap(pos === "left" ? 1 : 4, 1);
  };

  const scrollToChapter = (id) => {
    const el = document.querySelector(`[data-chapter="${id}"]`);
    if (!el) return;
    cozyAudio.playSnap(Number(id), 1);
    const top = el.getBoundingClientRect().top + window.scrollY - (id === "05" ? 0 : 88);
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleCardSpotlight = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const handleRowEnter = (e) => {
    const curtain = e.currentTarget.querySelector(".chrono-curtain");
    if (!curtain) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fromTop = e.clientY - rect.top < rect.height / 2;
    gsap.fromTo(
      curtain,
      { yPercent: fromTop ? -101 : 101 },
      { yPercent: 0, duration: 0.44, ease: "expo.out", overwrite: true }
    );
  };

  const handleRowLeave = (e) => {
    const curtain = e.currentTarget.querySelector(".chrono-curtain");
    if (!curtain) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const toTop = e.clientY - rect.top < rect.height / 2;
    gsap.to(curtain, {
      yPercent: toTop ? -101 : 101,
      duration: 0.36,
      ease: "power3.inOut",
      overwrite: true,
    });
  };

  // Sync document overscroll background cleanly when fully engulfed (prevents white bounce)
  useEffect(() => {
    const prevBg = document.documentElement.style.backgroundColor;
    document.documentElement.style.backgroundColor = isEngulfed ? "#09090b" : "#ffffff";
    return () => {
      document.documentElement.style.backgroundColor = prevBg;
    };
  }, [isEngulfed]);

  // Header live acoustic equalizer bars
  useEffect(() => {
    if (!eqBarsRef.current) return;
    const bars = eqBarsRef.current.querySelectorAll(".eq-bar");
    gsap.killTweensOf(bars);

    if (isMuted) {
      gsap.to(bars, { scaleY: 0.16, duration: 0.35, ease: "power2.out" });
      return;
    }

    bars.forEach((bar, i) => {
      gsap.to(bar, {
        scaleY: 0.28 + ((i % 3) + 1) * 0.24,
        duration: 0.36 + i * 0.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => gsap.killTweensOf(bars);
  }, [isMuted]);

  // Global pointer tracking for 4D Canvas (zero React re-renders)
  useEffect(() => {
    const onMove = (e) => {
      bridgeRef.current.mx = e.clientX / window.innerWidth - 0.5;
      bridgeRef.current.my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Master GSAP + ScrollTrigger Engine
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header entrance
      gsap.from(".studio-header-item", {
        y: -12,
        opacity: 0,
        duration: 0.72,
        stagger: 0.055,
        ease: "expo.out",
        clearProps: "transform",
      });

      // Global scroll progress telemetry (DOM-direct, zero setState)
      ScrollTrigger.create({
        trigger: pageRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          bridgeRef.current.progress = self.progress;
          bridgeRef.current.velocity = self.getVelocity();
          if (topProgressRef.current) {
            gsap.set(topProgressRef.current, { scaleX: self.progress });
          }
          if (scrollPctRef.current) {
            scrollPctRef.current.textContent = `${String(Math.round(self.progress * 100)).padStart(2, "0")}%`;
          }
        },
      });

      const onScrollEnd = () => {
        bridgeRef.current.velocity = 0;
      };
      ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);

      // Chapter wayfinding
      document.querySelectorAll("[data-chapter]").forEach((el) => {
        const id = el.getAttribute("data-chapter");
        ScrollTrigger.create({
          trigger: el,
          start: "top 52%",
          end: "bottom 52%",
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        });
      });

      // Architectural hairlines
      gsap.utils.toArray(".arch-rule").forEach((rule) => {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: "expo.inOut",
            transformOrigin: "left center",
            scrollTrigger: { trigger: rule, start: "top 92%", once: true },
          }
        );
      });

      // Section heading masked reveals
      gsap.utils.toArray(".heading-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 108, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.0,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });

      // =========================================================================
      // SECTION 02: METATRON'S CUBE CONSTRUCTION + INK ILLUMINATION + METRICS
      // =========================================================================
      gsap.to(".manifesto-word", {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: ".manifesto-copy",
          start: "top 82%",
          end: "bottom 58%",
          scrub: 0.5,
        },
      });

      const metatronTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".manifesto-section",
          start: "top 80%",
          end: "bottom 55%",
          scrub: 0.75,
        },
      });

      metatronTl
        .to(".metatron-halo", { strokeDashoffset: 0, duration: 0.3, ease: "none" }, 0)
        .to(".metatron-circle", { strokeDashoffset: 0, stagger: 0.025, duration: 0.42, ease: "none" }, 0.06)
        .to(".metatron-chord", { strokeDashoffset: 0, stagger: 0.004, duration: 0.5, ease: "none" }, 0.22)
        .to(".metatron-spiral", { strokeDashoffset: 0, duration: 0.52, ease: "none" }, 0.48);

      // Metric counters
      gsap.utils.toArray(".metric-value").forEach((el) => {
        const target = parseInt(el.getAttribute("data-target"), 10);
        const suffix = el.getAttribute("data-suffix") || "";
        const pad = el.getAttribute("data-pad") === "true";
        const counter = { val: 0 };
        gsap.to(counter, {
          val: target,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            const v = Math.round(counter.val);
            el.textContent = `${pad ? String(v).padStart(2, "0") : v}${suffix}`;
          },
        });
      });

      // =========================================================================
      // SECTION 03: CAPABILITIES ENTRANCE + EXACT SVG-ORIGIN PARAMETRIC LOOPS
      // =========================================================================
      gsap.fromTo(
        ".discipline-card",
        { y: 38, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.11,
          ease: "expo.out",
          scrollTrigger: { trigger: ".disciplines-grid", start: "top 84%", once: true },
        }
      );

      // Kinetic comet (exact pixel dashoffset loop)
      const comet = document.querySelector(".kinetic-comet");
      if (comet) {
        const totalLen = parseFloat(comet.getAttribute("data-len") || "800");
        gsap.fromTo(
          comet,
          { strokeDashoffset: 0 },
          { strokeDashoffset: -totalLen, duration: 5.5, repeat: -1, ease: "none" }
        );
      }

      // Acoustic Euler-Bernoulli waves pivoted strictly on centerline y=80
      gsap.to(".acoustic-wave-1", {
        scaleY: -1,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        svgOrigin: "160 80",
      });
      gsap.to(".acoustic-wave-2", {
        scaleY: -1,
        duration: 2.2 / PHI,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        svgOrigin: "160 80",
      });
      gsap.to(".acoustic-wave-3", {
        scaleY: -1,
        duration: 2.2 / (PHI * PHI),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        svgOrigin: "160 80",
      });

      // Systems golden eye pulse
      gsap.to(".systems-pulse", {
        scale: 1.55,
        opacity: 0.1,
        duration: 1.618,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        svgOrigin: "152 94.6",
      });

      // =========================================================================
      // SECTION 04: CHRONOLOGY PLUMB SPINE + VESICA EYE DILATIONS
      // =========================================================================
      ScrollTrigger.create({
        trigger: ".chrono-list",
        start: "top 75%",
        end: "bottom 58%",
        scrub: 0.5,
        onUpdate: (self) => {
          if (spineFillRef.current) {
            gsap.set(spineFillRef.current, { scaleY: self.progress });
          }
          if (spineNodeRef.current) {
            gsap.set(spineNodeRef.current, { top: `${self.progress * 100}%` });
          }
        },
      });

      gsap.utils.toArray(".chrono-row").forEach((row) => {
        const eye = row.querySelector(".chrono-vesica-eye");
        gsap.fromTo(
          row.querySelectorAll(".chrono-col"),
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.08,
            ease: "expo.out",
            scrollTrigger: { trigger: row, start: "top 88%", once: true },
          }
        );

        if (eye) {
          gsap.fromTo(
            eye,
            { scaleY: 0.1, opacity: 0.25 },
            {
              scaleY: 1,
              opacity: 1,
              duration: 0.55,
              ease: "back.out(2)",
              scrollTrigger: {
                trigger: row,
                start: "top 72%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      // =========================================================================
      // SECTION 05: BULLETPROOF FULL-SCREEN ENGULF (NO STICKY, NO WHITE AFTER)
      // Section 05 IS the bottom of the page (min-h-screen). As it scrolls in,
      // the rounded obsidian card swells edge-to-edge to 100vw × 100vh.
      // =========================================================================
      const engulfTl = gsap.timeline({
        scrollTrigger: {
          trigger: engulfSectionRef.current,
          start: "top 92%",
          end: "top 2%",
          scrub: 0.45,
          onUpdate: (self) => {
            bridgeRef.current.engulf = self.progress;
            setIsEngulfed(self.progress > 0.55);
          },
        },
      });

      engulfTl
        .fromTo(
          engulfVesselRef.current,
          { clipPath: "inset(36px 5vw 36px 5vw round 32px)" },
          { clipPath: "inset(0px 0vw 0px 0vw round 0px)", duration: 1, ease: "power2.inOut" },
          0
        )
        .fromTo(
          engulfInnerRef.current,
          { scale: 0.94 },
          { scale: 1, duration: 1, ease: "power2.out" },
          0
        )
        .fromTo(
          engulfHaloRef.current,
          { scale: 0.78, opacity: 0.4 },
          { scale: 1, opacity: 0.92, duration: 1, ease: "power2.out" },
          0
        )
        .to(
          ".sanctuary-draw",
          { strokeDashoffset: 0, stagger: 0.08, duration: 0.85, ease: "none" },
          0.1
        )
        .fromTo(
          ".sanctuary-dot",
          { scale: 0, transformOrigin: "center center" },
          { scale: 1, stagger: { amount: 0.45, from: "start" }, duration: 0.4, ease: "back.out(1.6)" },
          0.18
        );

      // Exact svgOrigin rotations inside Engulfed Sanctuary (zero wobble)
      const l1 = gsap.to(".sanctuary-ring-1", { rotation: 360, duration: 55, repeat: -1, ease: "none", svgOrigin: "320 320" });
      const l2 = gsap.to(".sanctuary-ring-2", { rotation: -360, duration: 34, repeat: -1, ease: "none", svgOrigin: "320 320" });
      const l3 = gsap.to(".sanctuary-ring-3", { rotation: 360, duration: 21, repeat: -1, ease: "none", svgOrigin: "320 320" });
      const l4 = gsap.to(".sanctuary-phyllotaxis", { rotation: 360, duration: 89, repeat: -1, ease: "none", svgOrigin: "320 320" });
      sanctuaryLoopsRef.current = [l1, l2, l3, l4];

      // Ambient Glow + Magnetic Overdrive CTA inside Section 05
      const vessel = engulfVesselRef.current;
      const glow = engulfGlowRef.current;
      const cta = engulfCtaRef.current;
      const cleanups = [];

      if (vessel && glow) {
        const gx = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3.out" });
        const gy = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3.out" });
        const onMove = (e) => {
          const rect = vessel.getBoundingClientRect();
          gx(e.clientX - rect.left - 280);
          gy(e.clientY - rect.top - 280);
        };
        vessel.addEventListener("mousemove", onMove);
        cleanups.push(() => vessel.removeEventListener("mousemove", onMove));
      }

      if (cta) {
        const cx = gsap.quickTo(cta, "x", { duration: 0.36, ease: "power3.out" });
        const cy = gsap.quickTo(cta, "y", { duration: 0.36, ease: "power3.out" });

        const onMove = (e) => {
          const rect = cta.getBoundingClientRect();
          cx((e.clientX - (rect.left + rect.width / 2)) * 0.25);
          cy((e.clientY - (rect.top + rect.height / 2)) * 0.25);
        };

        const onEnter = () => {
          sanctuaryLoopsRef.current.forEach((tw) => gsap.to(tw, { timeScale: 4.5, duration: 0.65, ease: "power2.out" }));
          if (engulfShockRef.current) {
            gsap.fromTo(
              engulfShockRef.current,
              { scale: 0.55, opacity: 0.6, svgOrigin: "320 320" },
              { scale: 1.45, opacity: 0, duration: 0.95, ease: "expo.out", svgOrigin: "320 320" }
            );
          }
        };

        const onLeave = () => {
          cx(0);
          cy(0);
          sanctuaryLoopsRef.current.forEach((tw) => gsap.to(tw, { timeScale: 1, duration: 1.0, ease: "power3.out" }));
        };

        cta.addEventListener("mousemove", onMove);
        cta.addEventListener("mouseenter", onEnter);
        cta.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          cta.removeEventListener("mousemove", onMove);
          cta.removeEventListener("mouseenter", onEnter);
          cta.removeEventListener("mouseleave", onLeave);
        });
      }

      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
        cleanups.forEach((fn) => fn());
      };
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const activeChapterObj = CHAPTERS.find((c) => c.id === activeSection) || CHAPTERS[0];

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white overflow-x-clip"
    >
      {/* Astrolabe Celestial Compass Navigation */}
      <FramelessNav activeTheme={isEngulfed ? "night" : "sunset"} />
      {/* =========================================================================
          4D HOPF FIBRATION + 3D OPHANIM ANGELIC GEOMETRY CANVAS
          ========================================================================= */}
      <AngelicOphanimCanvas bridgeRef={bridgeRef} />

      {/* =========================================================================
          AMBIENT ARCHITECTURAL STUDIO LIGHT VIGNETTES
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[760px] h-[760px] rounded-full blur-[140px] bg-[#f7f2eb]/75" />
        <div className="absolute bottom-1/4 right-1/4 w-[560px] h-[560px] rounded-full blur-[130px] bg-[#ede5d8]/45" />
      </div>

      {/* =========================================================================
          INTERACTIVE CHAPTER WAYFINDING RAIL (XL+)
          ========================================================================= */}
      <nav
        aria-label="Page chapters"
        className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-50 flex-col items-end gap-3"
      >
        {CHAPTERS.map((chap) => {
          const isActive = activeSection === chap.id;
          return (
            <button
              key={chap.id}
              type="button"
              onClick={() => scrollToChapter(chap.id)}
              className="group flex items-center gap-3 cursor-pointer py-1 focus:outline-none"
              aria-label={`Jump to ${chap.label}`}
            >
              <span
                className={`text-[10px] font-mono uppercase tracking-[0.22em] transition-all duration-300 ${isActive
                    ? isEngulfed
                      ? "opacity-100 text-[#e5cca0] translate-x-0"
                      : "opacity-100 text-neutral-900 translate-x-0"
                    : isEngulfed
                      ? "opacity-0 group-hover:opacity-85 text-neutral-400 translate-x-2 group-hover:translate-x-0"
                      : "opacity-0 group-hover:opacity-85 text-neutral-500 translate-x-2 group-hover:translate-x-0"
                  }`}
              >
                {chap.id} · {chap.short}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${isActive
                    ? isEngulfed
                      ? "w-6 h-1.5 bg-[#e5cca0]"
                      : "w-6 h-1.5 bg-neutral-900"
                    : isEngulfed
                      ? "size-1.5 bg-white/30 group-hover:bg-white/75"
                      : "size-1.5 bg-neutral-900/25 group-hover:bg-neutral-900/75"
                  }`}
              />
            </button>
          );
        })}
        <span
          ref={scrollPctRef}
          className={`mt-2 text-[10px] font-mono tracking-widest tabular-nums transition-colors duration-500 ${isEngulfed ? "text-neutral-500" : "text-neutral-400"
            }`}
        >
          00%
        </span>
      </nav>

      {/* =========================================================================
          HEADER: FLOATING MINIMAL NAVIGATION (Inverts seamlessly on Engulf)
          ========================================================================= */}
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-md border-b transition-colors duration-500 ${isEngulfed
            ? "bg-[#09090b]/80 border-white/[0.08]"
            : "bg-white/80 border-black/[0.06]"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="studio-header-item flex items-center gap-2.5 no-underline group"
            onClick={() => cozyAudio.playClose()}
          >
            <img
              src="/logo-mark.png"
              alt="Saswat Mohanty Logo"
              className="size-7 rounded-full object-contain shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:rotate-180"
            />
            <span
              className={`font-['Clash_Display',sans-serif] font-semibold tracking-tight text-base sm:text-lg transition-colors duration-500 ${isEngulfed ? "text-white" : "text-neutral-900"
                }`}
            >
              Saswat Mohanty
            </span>
            <span className="text-neutral-400 font-mono text-xs ml-0.5">®</span>
          </Link>

          <div className="studio-header-item flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={toggleSound}
              className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border transition-all text-xs font-mono shadow-sm cursor-pointer ${isEngulfed
                  ? "border-white/15 text-neutral-200 bg-white/5 hover:bg-white/15"
                  : "border-neutral-200/90 text-neutral-700 bg-white/80 hover:bg-neutral-100 hover:text-black"
                }`}
              title={isMuted ? "Enable sound chimes" : "Mute sound chimes"}
              aria-label="Toggle sound chimes"
            >
              {isMuted ? (
                <VolumeX className="size-3.5 text-neutral-400" />
              ) : (
                <Volume2 className={`size-3.5 ${isEngulfed ? "text-[#e5cca0]" : "text-neutral-900"}`} />
              )}
              <svg
                ref={eqBarsRef}
                aria-hidden="true"
                viewBox="0 0 16 12"
                className="hidden sm:block w-3.5 h-3"
              >
                <rect x="1" y="1" width="2" height="10" rx="1" className="eq-bar fill-current origin-bottom" />
                <rect x="5" y="1" width="2" height="10" rx="1" className="eq-bar fill-current origin-bottom" />
                <rect x="9" y="1" width="2" height="10" rx="1" className="eq-bar fill-current origin-bottom" />
                <rect x="13" y="1" width="2" height="10" rx="1" className="eq-bar fill-current origin-bottom" />
              </svg>
              <span className="hidden sm:inline font-mono">
                {isMuted ? "CHIME OFF" : "CHIME ON"}
              </span>
            </button>

            <Link
              href="/projects"
              className={`group hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${isEngulfed
                  ? "text-neutral-300 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-900"
                }`}
              onClick={() => cozyAudio.playSnap(2, 1)}
            >
              <span>Works (08)</span>
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm active:scale-95 no-underline ${isEngulfed
                  ? "bg-white text-neutral-950 hover:bg-[#f7f2eb]"
                  : "bg-neutral-900 hover:bg-black text-white"
                }`}
              onClick={() => cozyAudio.playClose()}
            >
              <span>Close</span>
              <span className="text-neutral-400 font-mono">✕</span>
            </Link>
          </div>
        </div>

        {/* Hairline Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-transparent overflow-hidden">
          <div
            ref={topProgressRef}
            className={`h-full w-full origin-left scale-x-0 will-change-transform transition-colors duration-500 ${isEngulfed ? "bg-[#e5cca0]" : "bg-neutral-900"
              }`}
          />
        </div>
      </header>

      {/* =========================================================================
          SECTIONS 01 – 04: ARCHITECTURAL LIGHT EDITORIAL CANVAS
          ========================================================================= */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-10 pb-16">
        {/* Top Editorial Eyebrow & Perspective Switcher */}
        <div
          data-chapter="01"
          className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400">
              01 / IDENTITY & ESSENCE
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs font-mono text-neutral-500">
              STUDIO PORTRAIT CARD
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-neutral-100/85 p-1 rounded-full border border-neutral-200/70">
            <span className="text-[11px] font-mono text-neutral-400 uppercase px-2">
              Layout:
            </span>
            <button
              type="button"
              onClick={() => switchCardPosition("left")}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-300 cursor-pointer ${cardPosition === "left"
                  ? "bg-white text-neutral-900 font-semibold shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
                }`}
            >
              Left Align
            </button>
            <button
              type="button"
              onClick={() => switchCardPosition("right")}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-300 cursor-pointer ${cardPosition === "right"
                  ? "bg-white text-neutral-900 font-semibold shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
                }`}
            >
              Right Align
            </button>
          </div>
        </div>
        <div className="arch-rule h-px w-full bg-black/[0.08]" />

        {/* =========================================================================
            SECTION 01: HERO MONOGRAPH CARD (True FLIP glide on align switch)
            ========================================================================= */}
        <section className="py-6 sm:py-12 flex justify-center">
          <TeamMemberCard
            position={cardPosition}
            firstName="Saswat"
            lastName="Mohanty"
            jobPosition="Spatial Technologist & Creative Director"
            imageUrl="/placeholder.jpg"
            description="Saswat is an interactive systems designer and creative technologist specializing in real-time WebGL, spatial computing, and physical acoustic interfaces."
            ctaHref="mailto:saswat@example.com"
            className="my-4 sm:my-8"
          />
        </section>

        {/* =========================================================================
            SECTION 02: THE ARCHITECTURAL MANIFESTO (True 1 : 1.618 Golden Split)
            ========================================================================= */}
        <section data-chapter="02" className="manifesto-section mt-24 py-8">
          <div className="arch-rule h-px w-full bg-black/[0.1] mb-16" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.618fr] gap-12 lg:gap-16 items-start">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400">
                  02 / PHILOSOPHY
                </span>
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#a6864a]">
                  1 : 1.618
                </span>
              </div>

              <div className="overflow-hidden">
                <h2 className="heading-reveal font-['Clash_Display',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.08] text-neutral-900">
                  Crafting Depth in a Flat Digital World.
                </h2>
              </div>

              <InteractiveMetatronBlueprint />
            </div>

            <div className="manifesto-copy flex flex-col gap-8 text-neutral-800 font-light leading-relaxed text-lg sm:text-xl lg:text-[1.35rem]">
              <ScrubParagraph text="Modern digital products often surrender to homogeneous templates. My work reclaims the computational canvas as an architectural territory—uniting procedural Three.js geometry, physical resonance, and graphic discipline into seamless interactive journeys." />

              <ScrubParagraph text="From mathematical shader simulations to reactive auditory feedback networks, every experience is calculated to reward human curiosity. Technology should not merely present information; it should evoke atmosphere, weight, and timeless poise." />

              <div className="arch-rule h-px w-full bg-black/[0.08] mt-4" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-3">
                <div>
                  <span
                    data-target="8"
                    data-suffix="+"
                    data-pad="true"
                    className="metric-value font-['Clash_Display',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 block tabular-nums"
                  >
                    08+
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 mt-2 block">
                    Spatial Projects
                  </span>
                </div>
                <div>
                  <span
                    data-target="60"
                    data-suffix=" FPS"
                    data-pad="false"
                    className="metric-value font-['Clash_Display',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 block tabular-nums"
                  >
                    60 FPS
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 mt-2 block">
                    Kinetic Fidelity
                  </span>
                </div>
                <div>
                  <span
                    data-target="2026"
                    data-suffix=""
                    data-pad="false"
                    className="metric-value font-['Clash_Display',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 block tabular-nums"
                  >
                    2026
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 mt-2 block">
                    Active Studio Era
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 03: CAPABILITIES — 4 LIVE MATHEMATICAL CHAMBERS
            ========================================================================= */}
        <section data-chapter="03" className="mt-32">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 block mb-2">
                03 / CAPABILITIES
              </span>
              <div className="overflow-hidden">
                <h2 className="heading-reveal font-['Clash_Display',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
                  Core Engineering & Design Pillars
                </h2>
              </div>
            </div>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              SYSTEMS ARCHITECTURE & CREATIVE TOOLING
            </p>
          </div>

          <div className="disciplines-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {DISCIPLINES.map((item, idx) => (
              <div
                key={item.number}
                onMouseMove={handleCardSpotlight}
                onMouseEnter={() => setHoveredDiscipline(idx)}
                onMouseLeave={() => setHoveredDiscipline(null)}
                className="discipline-card group relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-[#faf9f6]/90 backdrop-blur-sm p-7 sm:p-9 hover:bg-white hover:border-[#a6864a]/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col justify-between"
              >
                {/* Warm alabaster studio sheen */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(237, 229, 216, 0.45), transparent 65%)",
                  }}
                />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs font-mono text-[#a6864a] tracking-[0.25em]">
                        {item.number} / 04
                      </span>
                      <span className="size-1.5 rounded-full bg-neutral-300 group-hover:bg-[#a6864a] transition-colors" />
                    </div>

                    {/* Strictly Contained Live Equation Chamber */}
                    <div className="relative h-44 w-full rounded-2xl bg-white/90 border border-black/[0.06] mb-6 overflow-hidden">
                      <DisciplineChamber type={item.diagram} hovered={hoveredDiscipline === idx} />
                    </div>

                    <h3 className="font-['Clash_Display',sans-serif] text-xl sm:text-2xl font-medium tracking-tight text-neutral-900 mb-3">
                      {item.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-neutral-600 font-light mb-6">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-black/[0.06]">
                    {item.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-white border border-neutral-200/90 text-neutral-600 group-hover:border-neutral-900/25 group-hover:text-neutral-900 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 04: CHRONOLOGY WITH VESICA PISCIS EYES & DIRECTIONAL CURTAINS
            ========================================================================= */}
        <section data-chapter="04" className="relative mt-32 mb-10">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 block mb-2">
              04 / TRAJECTORY
            </span>
            <div className="overflow-hidden">
              <h2 className="heading-reveal font-['Clash_Display',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
                Chronicle of Milestones
              </h2>
            </div>
          </div>

          <div className="chrono-list relative md:pl-12">
            {/* Clean HTML Plumb Spine (Zero SVG aspect-ratio distortion) */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute left-3 top-0 bottom-0 w-px bg-black/[0.08] pointer-events-none"
            >
              <div
                ref={spineFillRef}
                className="absolute inset-0 bg-[#a6864a] origin-top scale-y-0 will-change-transform"
              />
              <span
                ref={spineNodeRef}
                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 size-3 rounded-full border border-[#a6864a] bg-white shadow-[0_0_0_5px_rgba(166,134,74,0.14)]"
              />
            </div>

            <div className="flex flex-col divide-y divide-black/[0.08] border-y border-black/[0.08]">
              {CHRONOLOGY.map((entry, index) => (
                <div
                  key={index}
                  onMouseEnter={handleRowEnter}
                  onMouseLeave={handleRowLeave}
                  className="chrono-row group relative overflow-hidden py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start px-5 rounded-xl"
                >
                  {/* Direction-Aware Obsidian Curtain */}
                  <div
                    aria-hidden="true"
                    className="chrono-curtain pointer-events-none absolute inset-0 bg-neutral-900 translate-y-[-101%] will-change-transform z-0"
                  />

                  {/* Vesica Piscis Eye anchored cleanly on spine */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 14"
                    className="chrono-vesica-eye hidden md:block absolute -left-[46px] top-11 w-6 h-3.5 z-10 overflow-hidden"
                  >
                    <path
                      d="M 2 7 Q 12 1 22 7 Q 12 13 2 7 Z"
                      fill="#ffffff"
                      stroke="#a6864a"
                      strokeWidth="1.2"
                    />
                    <circle cx="12" cy="7" r="2.2" fill="#171717" />
                  </svg>

                  <div className="chrono-col relative z-10 md:col-span-3">
                    <span className="text-xs font-mono tracking-wider text-neutral-400 uppercase group-hover:text-[#e5cca0] transition-colors duration-300">
                      {entry.period}
                    </span>
                    <div className="text-xs font-mono text-neutral-500 mt-1 group-hover:text-neutral-400 transition-colors duration-300">
                      {entry.location}
                    </div>
                  </div>

                  <div className="chrono-col relative z-10 md:col-span-4">
                    <h4 className="font-['Clash_Display',sans-serif] text-lg sm:text-xl font-semibold text-neutral-900 group-hover:text-white transition-all duration-300 group-hover:translate-x-1.5">
                      {entry.role}
                    </h4>
                    <span className="text-xs font-mono text-neutral-500 mt-0.5 block group-hover:text-neutral-300 transition-all duration-300 group-hover:translate-x-1.5">
                      {entry.studio}
                    </span>
                  </div>

                  <div className="chrono-col relative z-10 md:col-span-5 text-sm font-light text-neutral-600 leading-relaxed group-hover:text-neutral-200 transition-colors duration-300">
                    {entry.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          SECTION 05: BULLETPROOF FULL-SCREEN ENGULF SANCTUARY
          Zero empty runway underneath — impossible for a white screen to appear.
          As you scroll into Section 05, the framed obsidian card swells past all
          4 viewport edges to engulf 100vw × 100vh in obsidian and antique gold.
          ========================================================================= */}
      <section
        ref={engulfSectionRef}
        data-chapter="05"
        className="relative z-20 w-full min-h-screen"
      >
        <div
          ref={engulfVesselRef}
          style={{ clipPath: "inset(36px 5vw 36px 5vw round 32px)" }}
          className="relative w-full min-h-screen bg-[#09090b] text-white overflow-hidden will-change-[clip-path]"
        >
          {/* Cursor-following warm champagne glow */}
          <div
            ref={engulfGlowRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 w-[560px] h-[560px] rounded-full bg-[#e5cca0]/[0.08] blur-[110px] will-change-transform"
          />

          {/* Subtle celestial dot lattice */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

          {/* 144-Node Golden-Angle Phyllotaxis + 13-Eye Ophanim Sanctuary Halo */}
          <div
            ref={engulfHaloRef}
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 w-[440px] h-[440px] sm:w-[580px] sm:h-[580px] lg:w-[700px] lg:h-[700px] will-change-transform overflow-hidden"
          >
            <EngulfedAngelicSanctuarySVG shockRef={engulfShockRef} />
          </div>

          {/* Inner Sanctuary Content + Integrated Studio Footer */}
          <div
            ref={engulfInnerRef}
            className="relative z-10 min-h-screen max-w-7xl mx-auto px-8 sm:px-14 lg:px-16 pt-28 pb-10 flex flex-col justify-between gap-12 will-change-transform"
          >
            {/* Top Sanctuary Telemetry */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-[0.28em] text-neutral-500 uppercase">
              <span>05 / INITIATE DIALOGUE</span>
              <span className="hidden sm:inline text-[#e5cca0]/75">
                137.508° · AUREA SECTIO
              </span>
            </div>

            {/* Center Focal Content */}
            <div className="max-w-3xl my-auto">
              <div className="overflow-hidden mb-6">
                <h2 className="heading-reveal font-['Clash_Display',sans-serif] text-3xl sm:text-5xl lg:text-[3.5rem] font-light tracking-tight leading-[1.08] text-white">
                  Have an ambitious vision or experimental interface to architect?
                </h2>
              </div>

              <p className="text-sm sm:text-base lg:text-lg font-light text-neutral-300 leading-relaxed mb-10 max-w-xl">
                Currently accepting selective commissions, spatial interface design
                collaborations, and WebGL creative direction opportunities for 2026.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <div ref={engulfCtaRef} className="inline-block will-change-transform">
                  <a
                    href="mailto:saswat@example.com"
                    className="group relative inline-flex items-center gap-2.5 overflow-hidden px-7 py-3.5 rounded-full bg-white text-neutral-950 font-medium text-sm transition-all duration-300 hover:bg-[#f7f2eb] active:scale-95 shadow-[0_0_40px_rgba(229,204,160,0.22)] no-underline"
                  >
                    <span>Initiate Collaboration</span>
                    <span className="relative flex size-4 items-center justify-center overflow-hidden">
                      <ArrowRight className="absolute size-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-5" />
                      <ArrowRight className="absolute size-4 -translate-x-5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                    </span>
                  </a>
                </div>

                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-neutral-700 text-neutral-200 hover:text-white hover:border-[#e5cca0]/60 transition-colors text-sm font-mono no-underline"
                  onClick={() => cozyAudio.playSnap(4, 1)}
                >
                  <span>Browse Selected Works (08)</span>
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <a
                  href="https://github.com/SazWhatician"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                >
                  <span>GitHub @SazWhatician</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            {/* Integrated Minimal Studio Footer inside Engulfed Chamber */}
            <footer className="pt-6 border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-400 gap-4">
              <div>© 2026 SASWAT MOHANTY. ALL RIGHTS RESERVED.</div>
              <div className="flex items-center gap-6">
                <span>SPATIAL COMPUTING & MOTION DIRECTION</span>
                <span>NEW DELHI, INDIA</span>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}