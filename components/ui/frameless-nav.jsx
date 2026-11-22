"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cormorant_Garamond } from "next/font/google";
import gsap from "gsap";
import { cozyAudio } from "@/lib/cozy-sound";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 137.507764°
const DEG = Math.PI / 180;

// Top-Center Downward Stage Coordinates (Pivot at x = 260, y = 0)
const STAGE_W = 520;
const STAGE_H = 225;
const STAGE_CX = 260;
const FAN_RADIUS = 156;

// fanAngleDeg measured from straight-down (+Y): negative = left, positive = right
const ROUTES = [
  {
    id: "home",
    index: "01",
    cardinal: "N",
    bearing: 0,
    bearingLabel: "000°",
    fanAngleDeg: -64,
    label: "INDEX",
    editorial: "Index",
    subtitle: "Origin · 3D Cloud Voyager",
    href: "/",
    harmonic: "Φ⁰",
    coreMode: "armillary",
  },
  {
    id: "projects",
    index: "02",
    cardinal: "E",
    bearing: 90,
    bearingLabel: "090°",
    fanAngleDeg: -24,
    label: "WORKS",
    editorial: "Works",
    subtitle: "Archive · 08 Spatial Systems",
    href: "/projects",
    harmonic: "Φ⁻¹",
    coreMode: "tesseract",
  },
  {
    id: "about",
    index: "03",
    cardinal: "S",
    bearing: 180,
    bearingLabel: "180°",
    fanAngleDeg: 24,
    label: "ABOUT",
    editorial: "Atelier",
    subtitle: "Monograph · Craft & Form",
    href: "/about",
    harmonic: "Φ⁻²",
    coreMode: "fibonacci",
  },
  {
    id: "contact",
    index: "04",
    cardinal: "W",
    bearing: 270,
    bearingLabel: "270°",
    fanAngleDeg: 64,
    label: "CONTACT",
    editorial: "Initiate",
    subtitle: "Cadence · Direct Signal",
    href: "/contact",
    harmonic: "Φ⁻³",
    coreMode: "lissajous",
  },
];

// Precompute 4D Hypercube (Tesseract): 16 vertices in R^4, 32 edges
const TESSERACT_VERTS = Array.from({ length: 16 }, (_, i) => [
  i & 1 ? 1 : -1,
  i & 2 ? 1 : -1,
  i & 4 ? 1 : -1,
  i & 8 ? 1 : -1,
]);

const TESSERACT_EDGES = (() => {
  const edges = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const diff = i ^ j;
      if (diff && (diff & (diff - 1)) === 0) edges.push([i, j]);
    }
  }
  return edges;
})();

// Precompute 89-Node 3D Fibonacci Lattice Sphere
const FIB_SPHERE = Array.from({ length: 89 }, (_, i) => {
  const y = 1 - (i / 88) * 2;
  const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN_ANGLE * i;
  return { x: Math.cos(theta) * rAtY, y, z: Math.sin(theta) * rAtY };
});

function shortestArcDeg(from, to) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

/* ============================================================================
   MAGIC INSIDE THE OPEN COMPASS: 60FPS CELESTIAL ASTROLABE & MORPHING 3D/4D CORE
   ============================================================================ */
function AstrolabeCoreCanvas({ isOpen, isNight, focusedIdx, needleAngleRef, pointerRef, warpPulseRef }) {
  const canvasRef = useRef(null);
  const propsRef = useRef({ isNight, focusedIdx });
  propsRef.current = { isNight, focusedIdx };

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let rafId = 0;
    let size = 0;
    let t = 0;

    // 89 Golden-Angle Celestial Stars inside the compass glass
    const stars = Array.from({ length: 89 }, (_, i) => {
      const k = i + 1;
      const normR = 0.24 + 0.68 * Math.sqrt(k / 89);
      const baseAngle = k * GOLDEN_ANGLE;
      const speed = (i % 2 === 0 ? 1 : -1) * (0.00055 + (1 - normR) * 0.0012);
      return {
        normR,
        angle: baseAngle,
        speed,
        baseSize: 0.75 + (i % 4) * 0.35,
      };
    });

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = Math.min(parent.clientWidth, parent.clientHeight);
      canvas.width = Math.max(1, Math.round(size * dpr));
      canvas.height = Math.max(1, Math.round(size * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = () => {
      if (!size) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, size, size);
      const warp = warpPulseRef.current.active ? warpPulseRef.current.progress : 0;
      t += 0.017 + warp * 0.06;

      const { isNight: night, focusedIdx: fIdx } = propsRef.current;
      const mode = ROUTES[fIdx]?.coreMode || "armillary";
      const needleDeg = needleAngleRef.current;
      const needleRad = (needleDeg - 90) * DEG;
      const ptr = pointerRef.current;

      const cx = size * 0.5;
      const cy = size * 0.5;
      const R = size * 0.46;

      const accent = night ? [165, 180, 252] : [166, 134, 74];
      const ink = night ? [248, 250, 252] : [17, 17, 17];
      const rgba = (rgb, a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`;

      // 1. Illuminated Quadrant Sector Wedge under Locked Bearing
      const sectorCenter = (ROUTES[fIdx].bearing - 90) * DEG;
      const grad = ctx.createRadialGradient(cx, cy, R * 0.14, cx, cy, R * 0.96);
      grad.addColorStop(0, rgba(accent, night ? 0.16 : 0.14));
      grad.addColorStop(0.65, rgba(accent, night ? 0.06 : 0.055));
      grad.addColorStop(1, rgba(accent, 0));

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R * 0.96, sectorCenter - Math.PI / 4, sectorCenter + Math.PI / 4);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // 2. 89-Star Golden Constellation Field + Live Sightline Threads
      const beamTipX = cx + Math.cos(needleRad) * (R * 0.72);
      const beamTipY = cy + Math.sin(needleRad) * (R * 0.72);
      const litStars = [];

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.angle += s.speed * (1 + warp * 12);
        const pullIn = 1 - warp * 0.45;
        const r = R * s.normR * pullIn;
        const sx = cx + Math.cos(s.angle) * r;
        const sy = cy + Math.sin(s.angle) * r;

        const dBeam = Math.hypot(sx - beamTipX, sy - beamTipY);
        const proximity = Math.max(0, 1 - dBeam / (R * 0.52));

        if (proximity > 0.18) litStars.push({ sx, sy, proximity });

        ctx.beginPath();
        ctx.arc(sx, sy, s.baseSize + proximity * 1.4, 0, Math.PI * 2);
        ctx.fillStyle =
          proximity > 0.25
            ? rgba(accent, 0.35 + proximity * 0.65)
            : rgba(ink, 0.12 + (i % 5 === 0 ? 0.16 : 0));
        ctx.fill();
      }

      for (let i = 0; i < litStars.length; i++) {
        const a = litStars[i];
        if (a.proximity > 0.55) {
          ctx.beginPath();
          ctx.moveTo(beamTipX, beamTipY);
          ctx.lineTo(a.sx, a.sy);
          ctx.strokeStyle = rgba(accent, (a.proximity - 0.5) * 0.42);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
        for (let j = i + 1; j < litStars.length; j++) {
          const b = litStars[j];
          const dist = Math.hypot(a.sx - b.sx, a.sy - b.sy);
          if (dist < R * 0.24) {
            const alpha = (1 - dist / (R * 0.24)) * Math.min(a.proximity, b.proximity) * 0.45;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = rgba(accent, alpha);
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      // 3. Inner Golden-Ratio Escapement Ring (Counter-Rotating at -θ / Φ)
      const innerR = R / PHI;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((-needleDeg / PHI) * DEG);
      ctx.beginPath();
      ctx.arc(0, 0, innerR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(accent, 0.26);
      ctx.lineWidth = 0.85;
      ctx.setLineDash([2, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        const len = k % 6 === 0 ? 7 : 3.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (innerR - len), Math.sin(a) * (innerR - len));
        ctx.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
        ctx.strokeStyle = k % 6 === 0 ? rgba(accent, 0.65) : rgba(ink, 0.16);
        ctx.lineWidth = k % 6 === 0 ? 1.1 : 0.65;
        ctx.stroke();
      }
      ctx.restore();

      // 4. Quadrant-Morphing Sacred Geometry Core
      const coreR = R * 0.35 * (1 + warp * 0.28);
      const tiltX = 0.35 + (ptr.ny - 0.5) * 0.7;
      const tiltY = -0.25 + (ptr.nx - 0.5) * 0.8;

      if (mode === "tesseract") {
        const aXW = t * 0.82 + tiltY * 0.6;
        const aYZ = t * 0.52 + tiltX * 0.6;
        const aZW = t * 0.38;
        const cXW = Math.cos(aXW), sXW = Math.sin(aXW);
        const cYZ = Math.cos(aYZ), sYZ = Math.sin(aYZ);
        const cZW = Math.cos(aZW), sZW = Math.sin(aZW);

        const proj = TESSERACT_VERTS.map(([x, y, z, w4]) => {
          const x1 = x * cXW - w4 * sXW;
          const w1 = x * sXW + w4 * cXW;
          const y1 = y * cYZ - z * sYZ;
          const z1 = y * sYZ + z * cYZ;
          const z2 = z1 * cZW - w1 * sZW;
          const w2 = z1 * sZW + w1 * cZW;

          const s4 = 1.85 / (2.85 - w2);
          const s3 = (coreR * 1.48) / (3.1 - z2 * s4);
          return {
            sx: cx + x1 * s4 * s3,
            sy: cy + y1 * s4 * s3,
            depth: (w2 + z2 * s4) * 0.5,
          };
        });

        for (const [i, j] of TESSERACT_EDGES) {
          const p0 = proj[i], p1 = proj[j];
          const avgD = (p0.depth + p1.depth) * 0.5;
          ctx.beginPath();
          ctx.moveTo(p0.sx, p0.sy);
          ctx.lineTo(p1.sx, p1.sy);
          ctx.strokeStyle =
            avgD > 0 ? rgba(accent, 0.5 + Math.min(0.45, avgD * 0.35)) : rgba(ink, 0.18);
          ctx.lineWidth = avgD > 0 ? 1.15 : 0.7;
          ctx.stroke();
        }
      } else if (mode === "armillary") {
        const rings = [
          { rx: tiltX + t * 0.45, ry: tiltY + t * 0.3, s: 1 },
          { rx: tiltX - t * 0.35 + 1.1, ry: tiltY + t * 0.45, s: 0.88 },
          { rx: tiltX + 0.5, ry: tiltY - t * 0.55, s: 1 / PHI + 0.14 },
          { rx: tiltX + 1.55, ry: tiltY + t * 0.25, s: 0.76 },
        ];
        rings.forEach((rg, idx) => {
          const cX = Math.cos(rg.rx), sX = Math.sin(rg.rx);
          const cY = Math.cos(rg.ry), sY = Math.sin(rg.ry);
          ctx.beginPath();
          for (let s = 0; s <= 64; s++) {
            const u = (s / 64) * Math.PI * 2;
            const x = Math.cos(u) * rg.s;
            const y = Math.sin(u) * rg.s;
            const y1 = y * cX;
            const z1 = y * sX;
            const x2 = x * cY + z1 * sY;
            const z2 = -x * sY + z1 * cY;
            const sc = 3.2 / (3.2 + z2);
            const sx = cx + x2 * coreR * sc;
            const sy = cy + y1 * coreR * sc;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.strokeStyle = idx % 2 === 0 ? rgba(accent, 0.72) : rgba(ink, 0.28);
          ctx.lineWidth = idx === 0 ? 1.25 : 0.9;
          ctx.stroke();
        });
      } else if (mode === "fibonacci") {
        const cX = Math.cos(tiltX + t * 0.25), sX = Math.sin(tiltX + t * 0.25);
        const cY = Math.cos(tiltY + t * 0.45), sY = Math.sin(tiltY + t * 0.45);
        for (let i = 0; i < FIB_SPHERE.length; i++) {
          const p = FIB_SPHERE[i];
          const y1 = p.y * cX - p.z * sX;
          const z1 = p.y * sX + p.z * cX;
          const x2 = p.x * cY + z1 * sY;
          const z2 = -p.x * sY + z1 * cY;
          const sc = 3.2 / (3.2 + z2);
          const sx = cx + x2 * coreR * 0.92 * sc;
          const sy = cy + y1 * coreR * 0.92 * sc;
          const depthAlpha = Math.max(0.1, Math.min(0.9, (1.15 - z2) * 0.48));
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 5 === 0 ? 2.1 : 1.3) * sc, 0, Math.PI * 2);
          ctx.fillStyle = i % 3 === 0 ? rgba(accent, depthAlpha) : rgba(ink, depthAlpha * 0.7);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx - coreR * 0.36, cy, coreR * 0.72, 0, Math.PI * 2);
        ctx.arc(cx + coreR * 0.36, cy, coreR * 0.72, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(accent, 0.28);
        ctx.lineWidth = 0.85;
        ctx.stroke();
      } else {
        const phase = t * 0.95 + tiltY * 0.9;
        ctx.beginPath();
        for (let i = 0; i <= 180; i++) {
          const u = (i / 180) * Math.PI * 2;
          const sx = cx + Math.sin(3 * u + phase) * coreR * 0.95;
          const sy = cy + Math.sin(5 * u + tiltX * 0.5) * coreR * 0.78;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = rgba(ink, 0.24);
        ctx.lineWidth = 0.9;
        ctx.stroke();

        const headU = (t * 1.45) % (Math.PI * 2);
        ctx.beginPath();
        for (let i = 0; i <= 42; i++) {
          const u = headU - (i / 42) * 1.25;
          const sx = cx + Math.sin(3 * u + phase) * coreR * 0.95;
          const sy = cy + Math.sin(5 * u + tiltX * 0.5) * coreR * 0.78;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = rgba(accent, 0.95);
        ctx.lineWidth = 1.7;
        ctx.stroke();
      }

      // 5. Resonance Warp Shockwave on Route Lock
      if (warp > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.2 + warp * 0.9), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(accent, (1 - warp) * 0.95);
        ctx.lineWidth = 2.5 * (1 - warp * 0.6);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [isOpen, needleAngleRef, pointerRef, warpPulseRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full block rounded-full" />;
}

/* ============================================================================
   MAIN COMPONENT: TOP-CENTER HALF-COMPASS + DOWNWARD FAN + 360° ASTROLABE
   ============================================================================ */
export default function FramelessNav({ activeTheme = "sunset", className = "" }) {
  const pathname = usePathname();
  const router = useRouter();
  const isNight = activeTheme === "night";

  const [halfHovered, setHalfHovered] = useState(false);
  const [hoveredFanIdx, setHoveredFanIdx] = useState(null);
  const [compassOpen, setCompassOpen] = useState(false);
  const [openFocusIdx, setOpenFocusIdx] = useState(0);
  const [transitionRoute, setTransitionRoute] = useState(null);

  // Top-Center Half-Compass Refs
  const halfNeedleRef = useRef(null);
  const halfBezelRef = useRef(null);
  const halfHoverTimerRef = useRef(null);

  // Full 360° Opened Compass Refs
  const modalBackdropRef = useRef(null);
  const modalCompassRef = useRef(null);
  const fullNeedleRef = useRef(null);
  const fullOuterBezelRef = useRef(null);
  const fullReadoutRef = useRef(null);
  const fullNeedleAngleRef = useRef(0);
  const pointerNormRef = useRef({ nx: 0.5, ny: 0.5 });
  const warpPulseRef = useRef({ active: false, progress: 0 });

  // 8-Blade Optical Iris Transition Refs
  const irisOverlayRef = useRef(null);
  const irisBladeRefs = useRef([]);
  const irisRingRef = useRef(null);
  const irisMetaRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const pendingHrefRef = useRef(null);

  const activeRouteIdx = useMemo(() => {
    if (pathname === "/") return 0;
    if (pathname.startsWith("/projects")) return 1;
    if (pathname.startsWith("/about")) return 2;
    if (pathname.startsWith("/contact")) return 3;
    return 0;
  }, [pathname]);

  const accentHex = isNight ? "#a5b4fc" : "#a6864a";
  const accentText = isNight ? "text-indigo-300" : "text-[#a6864a]";

  // Precompute Downward Half-Compass Graduated Ticks (-84° to +84° from straight down)
  // SVG viewBox="0 0 160 80", Pivot at (80, 0)
  const halfTicks = useMemo(() => {
    const items = [];
    for (let deg = -84; deg <= 84; deg += 6) {
      const rad = deg * DEG;
      const isRouteSpoke = ROUTES.some((r) => Math.abs(r.fanAngleDeg - deg) < 3.5);
      const isMajor = deg % 18 === 0;
      const rOut = 66;
      const rIn = isRouteSpoke ? 54 : isMajor ? 58 : 61;
      items.push({
        deg,
        isRouteSpoke,
        isMajor,
        x1: (80 + Math.sin(rad) * rIn).toFixed(2),
        y1: (Math.cos(rad) * rIn).toFixed(2),
        x2: (80 + Math.sin(rad) * rOut).toFixed(2),
        y2: (Math.cos(rad) * rOut).toFixed(2),
      });
    }
    return items;
  }, []);

  // Precompute Full 360° Compass Outer Degree Ticks (72 Vernier Ticks)
  const fullTicks = useMemo(() => {
    return Array.from({ length: 72 }, (_, i) => {
      const deg = i * 5;
      const rad = (deg - 90) * DEG;
      const isCardinal = deg % 90 === 0;
      const isMajor = deg % 15 === 0;
      const rOut = 236;
      const rIn = isCardinal ? 216 : isMajor ? 224 : 229;
      return {
        deg,
        isCardinal,
        isMajor,
        x1: (250 + Math.cos(rad) * rIn).toFixed(2),
        y1: (250 + Math.sin(rad) * rIn).toFixed(2),
        x2: (250 + Math.cos(rad) * rOut).toFixed(2),
        y2: (250 + Math.sin(rad) * rOut).toFixed(2),
      };
    });
  }, []);

  // Auto-Sleeping Jewelled-Bearing Physics Engine
  const physRef = useRef({
    halfDeg: ROUTES[0].fanAngleDeg,
    halfVel: 0,
    halfTarget: ROUTES[0].fanAngleDeg,
    halfBezelDeg: 0,
    halfBezelTarget: 0,

    fullDeg: 0,
    fullVel: 0,
    fullTarget: 0,
    fullBezelDeg: 0,
    fullBezelTarget: 0,

    running: false,
    rafId: 0,
  });

  const applyPhysics = useCallback(() => {
    const p = physRef.current;

    // SVG positive rotation is clockwise; rotating a straight-down needle by -halfDeg aligns it with +X = sin(halfDeg)
    if (halfNeedleRef.current) {
      halfNeedleRef.current.setAttribute("transform", `rotate(${(-p.halfDeg).toFixed(2)} 80 0)`);
    }
    if (halfBezelRef.current) {
      halfBezelRef.current.setAttribute("transform", `rotate(${p.halfBezelDeg.toFixed(2)} 80 0)`);
    }

    fullNeedleAngleRef.current = p.fullDeg;

    if (fullNeedleRef.current) {
      fullNeedleRef.current.setAttribute("transform", `rotate(${p.fullDeg.toFixed(2)} 250 250)`);
    }
    if (fullOuterBezelRef.current) {
      fullOuterBezelRef.current.setAttribute(
        "transform",
        `rotate(${p.fullBezelDeg.toFixed(2)} 250 250)`
      );
    }
    if (fullReadoutRef.current) {
      const d = Math.round(normalizeDeg(p.fullDeg)) % 360;
      fullReadoutRef.current.textContent = `${String(d).padStart(3, "0")}°`;
    }
  }, []);

  const wakePhysics = useCallback(() => {
    const p = physRef.current;
    if (p.running) return;
    p.running = true;

    const tick = () => {
      const hErr = p.halfTarget - p.halfDeg;
      p.halfVel = (p.halfVel + hErr * 0.16) * 0.72;
      p.halfDeg += p.halfVel;

      const hbErr = p.halfBezelTarget - p.halfBezelDeg;
      p.halfBezelDeg += hbErr * 0.12;

      const fErr = shortestArcDeg(p.fullDeg, p.fullTarget);
      p.fullVel = (p.fullVel + fErr * 0.14) * 0.74;
      p.fullDeg += p.fullVel;

      const fbErr = p.fullBezelTarget - p.fullBezelDeg;
      p.fullBezelDeg += fbErr * 0.1;

      applyPhysics();

      const energy =
        Math.abs(hErr) +
        Math.abs(p.halfVel) * 4 +
        Math.abs(hbErr) +
        Math.abs(fErr) +
        Math.abs(p.fullVel) * 4 +
        Math.abs(fbErr);

      if (energy < 0.08) {
        p.halfDeg = p.halfTarget;
        p.halfVel = 0;
        p.halfBezelDeg = p.halfBezelTarget;
        p.fullDeg = p.fullTarget;
        p.fullVel = 0;
        p.fullBezelDeg = p.fullBezelTarget;
        applyPhysics();
        p.running = false;
        return;
      }

      p.rafId = requestAnimationFrame(tick);
    };

    p.rafId = requestAnimationFrame(tick);
  }, [applyPhysics]);

  useEffect(() => {
    physRef.current.halfTarget = ROUTES[activeRouteIdx].fanAngleDeg;
    physRef.current.fullTarget = ROUTES[activeRouteIdx].bearing;
    setOpenFocusIdx(activeRouteIdx);
    wakePhysics();
    return () => cancelAnimationFrame(physRef.current.rafId);
  }, [activeRouteIdx, wakePhysics]);

  // Scroll-Linked Top Half-Compass Bezel Rotation
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, window.scrollY / max));
        physRef.current.halfBezelTarget = (progress - 0.5) * 44;
        wakePhysics();
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [wakePhysics]);

  /* --------------------------------------------------------------------------
     1. HOVER INTENT MANAGEMENT FOR TOP HALF-COMPASS
     -------------------------------------------------------------------------- */
  const enterHalfZone = () => {
    if (halfHoverTimerRef.current) {
      clearTimeout(halfHoverTimerRef.current);
      halfHoverTimerRef.current = null;
    }
    if (!halfHovered) {
      setHalfHovered(true);
      try {
        cozyAudio.playSnap?.(0, 0.25);
      } catch { }
    }
  };

  const leaveHalfZone = () => {
    if (halfHoverTimerRef.current) clearTimeout(halfHoverTimerRef.current);
    halfHoverTimerRef.current = setTimeout(() => {
      setHalfHovered(false);
      setHoveredFanIdx(null);
      physRef.current.halfTarget = ROUTES[activeRouteIdx].fanAngleDeg;
      wakePhysics();
      halfHoverTimerRef.current = null;
    }, 170);
  };

  useEffect(() => {
    return () => {
      if (halfHoverTimerRef.current) clearTimeout(halfHoverTimerRef.current);
    };
  }, []);

  /* --------------------------------------------------------------------------
     2. OPEN / CLOSE FULL 360° CELESTIAL COMPASS (Drops from Top-Center)
     -------------------------------------------------------------------------- */
  const toggleFullCompass = useCallback(
    (force) => {
      const next = typeof force === "boolean" ? force : !compassOpen;
      try {
        if (next) {
          cozyAudio.playCompassOpen?.();
        } else {
          cozyAudio.playCompassClose?.();
        }
      } catch { }

      const backdrop = modalBackdropRef.current;
      const dial = modalCompassRef.current;

      if (next) {
        setHalfHovered(false);
        setHoveredFanIdx(null);
        setCompassOpen(true);

        const curBearing = ROUTES[activeRouteIdx].bearing;
        physRef.current.fullTarget = curBearing;
        physRef.current.fullBezelTarget = curBearing * 0.4;
        setOpenFocusIdx(activeRouteIdx);
        wakePhysics();

        if (typeof window !== "undefined" && window.__lenis) {
          window.__lenis.stop();
        }

        if (backdrop && dial) {
          gsap.killTweensOf([backdrop, dial]);
          const tl = gsap.timeline();
          tl.set(backdrop, { pointerEvents: "auto", visibility: "visible" })
            .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0)
            .fromTo(
              dial,
              { y: "-42vh", scale: 0.32, rotate: -65, opacity: 0 },
              { y: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.8, ease: "expo.out" },
              0.02
            )
            .fromTo(
              dial.querySelectorAll(".astrolabe-station"),
              { scale: 0.72, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.55, stagger: 0.055, ease: "expo.out" },
              0.24
            );
        }
      } else {
        if (backdrop && dial) {
          gsap.killTweensOf([backdrop, dial]);
          const tl = gsap.timeline({
            onComplete: () => {
              setCompassOpen(false);
              gsap.set(backdrop, { pointerEvents: "none", visibility: "hidden" });
              if (typeof window !== "undefined" && window.__lenis) {
                window.__lenis.start();
              }
            },
          });
          tl.to(
            dial,
            { y: "-42vh", scale: 0.34, rotate: 50, opacity: 0, duration: 0.45, ease: "power3.in" },
            0
          ).to(backdrop, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0.1);
        } else {
          setCompassOpen(false);
          if (typeof window !== "undefined" && window.__lenis) {
            window.__lenis.start();
          }
        }
      }
    },
    [activeRouteIdx, compassOpen, wakePhysics]
  );

  const handleFullCompassPointerMove = (e) => {
    const dial = modalCompassRef.current;
    if (!dial) return;
    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    pointerNormRef.current = {
      nx: Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width))),
      ny: Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height))),
    };

    if (Math.hypot(dx, dy) < 26) return;

    const deg = normalizeDeg((Math.atan2(dx, -dy) * 180) / Math.PI);
    physRef.current.fullTarget = deg;
    physRef.current.fullBezelTarget = deg * 0.32;

    const quadrant = Math.round(deg / 90) % 4;
    if (quadrant !== openFocusIdx) {
      setOpenFocusIdx(quadrant);
      try {
        cozyAudio.playCompassTick?.(quadrant);
      } catch { }
    }

    wakePhysics();
  };

  const handleFullCompassWheel = (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? 1 : -1;
    const nextIdx = (openFocusIdx + dir + 4) % 4;
    setOpenFocusIdx(nextIdx);
    physRef.current.fullTarget = ROUTES[nextIdx].bearing;
    physRef.current.fullBezelTarget += dir * 22.5;
    try {
      cozyAudio.playCompassTick?.(nextIdx);
    } catch { }
    wakePhysics();
  };

  /* --------------------------------------------------------------------------
     3. 8-BLADE OPTICAL IRIS SHUTTER TRANSITION (Barba-Style Lifecycle)
     -------------------------------------------------------------------------- */
  const openOpticalIris = useCallback(() => {
    const overlay = irisOverlayRef.current;
    const blades = irisBladeRefs.current.filter(Boolean);
    const ring = irisRingRef.current;
    const meta = irisMetaRef.current;

    if (!overlay || !blades.length) {
      isTransitioningRef.current = false;
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { pointerEvents: "none", visibility: "hidden" });
        isTransitioningRef.current = false;
        pendingHrefRef.current = null;
        setTransitionRoute(null);
      },
    });

    tl.to(meta, { opacity: 0, scale: 0.92, duration: 0.24, ease: "power2.in" }, 0)
      .to(ring, { opacity: 0, scale: 1.35, rotation: 30, duration: 0.4, ease: "power3.in" }, 0)
      .to(
        blades,
        {
          rotation: 68,
          svgOrigin: "1320 500",
          duration: 0.78,
          stagger: 0.014,
          ease: "expo.inOut",
        },
        0.08
      );
  }, []);

  useEffect(() => {
    if (isTransitioningRef.current && pendingHrefRef.current) {
      const timer = setTimeout(() => openOpticalIris(), 120);
      return () => clearTimeout(timer);
    }
  }, [pathname, openOpticalIris]);

  const launchIrisTransition = useCallback(
    (route, fromOpenCompass = false) => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      pendingHrefRef.current = route.href;
      setTransitionRoute(route);
      setHalfHovered(false);

      try {
        const routeIdx = ROUTES.findIndex((r) => r.id === route.id);
        cozyAudio.playPortalWarp?.(routeIdx >= 0 ? routeIdx : 0);
      } catch { }

      const overlay = irisOverlayRef.current;
      const blades = irisBladeRefs.current.filter(Boolean);
      const ring = irisRingRef.current;
      const meta = irisMetaRef.current;

      const fireIris = () => {
        if (!overlay || !blades.length) {
          router.push(route.href);
          isTransitioningRef.current = false;
          return;
        }

        const tl = gsap.timeline({
          onComplete: () => {
            if (compassOpen) {
              setCompassOpen(false);
              if (modalBackdropRef.current) {
                gsap.set(modalBackdropRef.current, { pointerEvents: "none", visibility: "hidden" });
              }
              if (typeof window !== "undefined" && window.__lenis) {
                window.__lenis.start();
              }
            }
            router.push(route.href);
            setTimeout(() => {
              if (isTransitioningRef.current) openOpticalIris();
            }, 1300);
          },
        });

        tl.set(overlay, { pointerEvents: "auto", visibility: "visible" })
          .set(blades, { rotation: 68, svgOrigin: "1320 500" })
          .set(ring, { opacity: 0, scale: 0.72, rotation: -45 })
          .set(meta, { opacity: 0, y: 12, scale: 0.96 })
          .to(
            blades,
            {
              rotation: 0,
              svgOrigin: "1320 500",
              duration: 0.62,
              stagger: 0.012,
              ease: "expo.inOut",
            },
            0
          )
          .to(ring, { opacity: 1, scale: 1, rotation: 0, duration: 0.56, ease: "expo.out" }, 0.16)
          .to(meta, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "expo.out" }, 0.22);
      };

      if (fromOpenCompass) {
        physRef.current.fullTarget = route.bearing;
        physRef.current.fullBezelTarget += 45;
        wakePhysics();
        warpPulseRef.current = { active: true, progress: 0 };
        gsap.to(warpPulseRef.current, {
          progress: 1,
          duration: 0.34,
          ease: "expo.in",
          onComplete: () => {
            warpPulseRef.current = { active: false, progress: 0 };
            fireIris();
          },
        });
      } else {
        fireIris();
      }
    },
    [compassOpen, openOpticalIris, router, wakePhysics]
  );

  /* --------------------------------------------------------------------------
     4. UNIFIED ROUTE NAVIGATION HANDLER
     -------------------------------------------------------------------------- */
  const handleRouteActivate = useCallback(
    (e, route, fromOpenCompass = false) => {
      try {
        cozyAudio.playSnap?.(2, 0.85);
      } catch { }

      physRef.current.halfTarget = route.fanAngleDeg;
      physRef.current.fullTarget = route.bearing;
      wakePhysics();

      if (route.id === "home" && pathname === "/") {
        e.preventDefault();
        setHalfHovered(false);
        if (compassOpen) toggleFullCompass(false);
        setTimeout(() => {
          if (typeof window !== "undefined" && window.__lenis) {
            window.__lenis.scrollTo(0, { duration: PHI });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, compassOpen ? 280 : 0);
        return;
      }

      if (route.id === "contact" && pathname === "/contact") {
        e.preventDefault();
        setHalfHovered(false);
        if (compassOpen) toggleFullCompass(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (pathname === route.href) {
        e.preventDefault();
        setHalfHovered(false);
        if (compassOpen) toggleFullCompass(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (route.href.startsWith("/")) {
        e.preventDefault();
        launchIrisTransition(route, fromOpenCompass);
      }
    },
    [compassOpen, launchIrisTransition, pathname, toggleFullCompass, wakePhysics]
  );

  // Keyboard Controls: C = Open/Close Compass, ESC = Close, 1–4 / Enter inside Compass
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;

      if (e.key === "Escape" && compassOpen) {
        e.preventDefault();
        toggleFullCompass(false);
      } else if ((e.key === "c" || e.key === "C") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggleFullCompass();
      } else if (compassOpen && ["1", "2", "3", "4"].includes(e.key)) {
        const idx = Number(e.key) - 1;
        const r = ROUTES[idx];
        if (r) handleRouteActivate({ preventDefault: () => { } }, r, true);
      } else if (compassOpen && e.key === "Enter") {
        e.preventDefault();
        const r = ROUTES[openFocusIdx];
        if (r) handleRouteActivate({ preventDefault: () => { } }, r, true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [compassOpen, openFocusIdx, toggleFullCompass, handleRouteActivate]);

  const focusedOpenRoute = ROUTES[openFocusIdx] || ROUTES[0];

  // Downward smile arc endpoints (-70° to +70° around straight-down +Y)
  const arcStartX = (STAGE_CX + Math.sin(-70 * DEG) * FAN_RADIUS).toFixed(1);
  const arcStartY = (Math.cos(-70 * DEG) * FAN_RADIUS).toFixed(1);
  const arcEndX = (STAGE_CX + Math.sin(70 * DEG) * FAN_RADIUS).toFixed(1);
  const arcEndY = (Math.cos(70 * DEG) * FAN_RADIUS).toFixed(1);

  return (
    <>
      {/* =====================================================================
          STAGE 1 & 2: TOP-CENTER HALF-COMPASS + DOWNWARD RADIAL INDEX FAN-OUT
          ===================================================================== */}
      <header
        aria-label="Primary navigation"
        onMouseEnter={enterHalfZone}
        onMouseLeave={leaveHalfZone}
        style={{ width: `${STAGE_W}px` }}
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 max-w-[100vw] select-none pointer-events-none transition-all duration-500 ${compassOpen ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"
          } ${halfHovered ? "h-[225px]" : "h-[86px]"} ${className}`}
      >
        {/* Forgiving Semicircular Hover Bridge (Keeps Fan Alive While Cursor Glides to Links) */}
        {halfHovered && (
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[490px] h-[205px] rounded-b-full pointer-events-auto"
          />
        )}

        {/* Radial Hairline Spokes Connecting Hemisphere Rim -> Downward Fanned Indexes */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
          fill="none"
          className={`hidden md:block pointer-events-none absolute inset-0 w-full h-full overflow-visible transition-opacity duration-400 ${halfHovered ? "opacity-100" : "opacity-0"
            }`}
        >
          {/* Gossamer Downward Orbital Arc connecting the 4 fanned indexes */}
          <path
            d={`M ${arcStartX} ${arcStartY} A ${FAN_RADIUS} ${FAN_RADIUS} 0 0 0 ${arcEndX} ${arcEndY}`}
            stroke={accentHex}
            strokeOpacity={isNight ? "0.24" : "0.3"}
            strokeWidth="0.9"
            strokeDasharray="2 5"
          />

          {ROUTES.map((route, idx) => {
            const rad = route.fanAngleDeg * DEG;
            const x1 = STAGE_CX + Math.sin(rad) * 76;
            const y1 = Math.cos(rad) * 76;
            const x2 = STAGE_CX + Math.sin(rad) * (FAN_RADIUS - 14);
            const y2 = Math.cos(rad) * (FAN_RADIUS - 14);
            const isHot = hoveredFanIdx === idx || activeRouteIdx === idx;

            return (
              <g key={route.id}>
                <line
                  x1={x1.toFixed(1)}
                  y1={y1.toFixed(1)}
                  x2={x2.toFixed(1)}
                  y2={y2.toFixed(1)}
                  stroke={isHot ? accentHex : isNight ? "rgba(226,232,240,0.24)" : "rgba(23,23,23,0.2)"}
                  strokeWidth={isHot ? "1.3" : "0.8"}
                  strokeDasharray={isHot ? undefined : "2 3"}
                />
                <circle
                  cx={x2.toFixed(1)}
                  cy={y2.toFixed(1)}
                  r={isHot ? "2.6" : "1.8"}
                  fill={isHot ? accentHex : isNight ? "rgba(226,232,240,0.42)" : "rgba(23,23,23,0.35)"}
                />
              </g>
            );
          })}
        </svg>

        {/* FANNED-OUT ROUTE INDEXES ALONG THE DOWNWARD SMILE ARC (Desktop Hover) */}
        <div className="hidden md:block">
          {ROUTES.map((route, idx) => {
            const rad = route.fanAngleDeg * DEG;
            const x = STAGE_CX + Math.sin(rad) * FAN_RADIUS;
            const y = Math.cos(rad) * FAN_RADIUS;
            const isActive =
              (route.id === "home" && pathname === "/") ||
              (route.id === "projects" && pathname.startsWith("/projects")) ||
              (route.id === "about" && pathname.startsWith("/about"));
            const isHot = hoveredFanIdx === idx;

            return (
              <Link
                key={route.id}
                href={route.href}
                onMouseEnter={() => {
                  setHoveredFanIdx(idx);
                  physRef.current.halfTarget = route.fanAngleDeg;
                  try {
                    cozyAudio.playHover?.(idx);
                  } catch { }
                  wakePhysics();
                }}
                onMouseLeave={() => {
                  setHoveredFanIdx(null);
                  physRef.current.halfTarget = ROUTES[activeRouteIdx].fanAngleDeg;
                  wakePhysics();
                }}
                onClick={(e) => handleRouteActivate(e, route, false)}
                style={{
                  left: `${x.toFixed(1)}px`,
                  top: `${y.toFixed(1)}px`,
                  transitionDelay: halfHovered ? `${idx * 38}ms` : "0ms",
                }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl no-underline cursor-pointer transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap ${halfHovered
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 -translate-y-6 scale-90 pointer-events-none"
                  } ${isHot || isActive
                    ? isNight
                      ? "bg-[#090f24]/95 border-indigo-300/75 text-white shadow-[0_10px_28px_rgba(0,0,0,0.68)]"
                      : "bg-[#fcfaf5]/96 border-[#a6864a] text-neutral-950 shadow-[0_10px_26px_rgba(17,17,17,0.13)]"
                    : isNight
                      ? "bg-[#060a17]/90 border-slate-700/80 text-slate-300 hover:text-white"
                      : "bg-[#faf8f4]/94 border-neutral-300/85 text-neutral-800 hover:text-neutral-950"
                  }`}
              >
                <span className={`font-mono text-[9px] tracking-[0.2em] ${isHot || isActive ? accentText : "opacity-55"}`}>
                  {route.index}
                </span>

                <span className="relative block h-4 overflow-hidden leading-4">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] transition-transform duration-300 group-hover:-translate-y-full">
                    {route.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`${cormorant.className} absolute inset-x-0 top-full block text-[16px] italic leading-4 ${accentText} transition-transform duration-300 group-hover:-translate-y-full`}
                  >
                    {route.editorial}
                  </span>
                </span>

                {isActive && (
                  <span
                    className={`size-1.5 rounded-full ${isNight ? "bg-indigo-300 shadow-[0_0_8px_#a5b4fc]" : "bg-[#a6864a]"
                      }`}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* THE TOP-CENTER HALF-COMPASS HEMISPHERE (Click to Drop Open 360° Magic!) */}
        <button
          type="button"
          onClick={() => toggleFullCompass(true)}
          aria-expanded={compassOpen}
          aria-label="Open interactive 360° compass navigation"
          title="Click to Open Compass (C)"
          className={`group pointer-events-auto absolute top-0 left-1/2 -translate-x-1/2 w-[128px] h-[64px] sm:w-[156px] sm:h-[78px] rounded-b-full border-x border-b backdrop-blur-2xl flex items-start justify-center cursor-pointer transition-all duration-500 focus:outline-none ${isNight
              ? "bg-[#070c1c]/92 border-indigo-400/50 hover:border-indigo-300 shadow-[0_14px_42px_rgba(0,0,0,0.78),inset_0_-8px_22px_rgba(165,180,252,0.12)]"
              : "bg-[#fcfaf5]/95 border-[#a6864a]/65 hover:border-[#a6864a] shadow-[0_14px_38px_rgba(17,17,17,0.14),inset_0_-8px_20px_rgba(166,134,74,0.1)]"
            }`}
        >
          {/* Downward Half-Compass SVG Dial (Pivot sits flush at top-center x=80, y=0) */}
          <svg viewBox="0 0 160 80" fill="none" className="w-full h-full overflow-hidden">
            {/* Scroll-Synced Outer Graduated Half-Bezel */}
            <g ref={halfBezelRef}>
              <circle
                cx="80"
                cy="0"
                r="66"
                stroke={accentHex}
                strokeOpacity="0.36"
                strokeWidth="0.9"
              />
              {halfTicks.map((t) => (
                <line
                  key={t.deg}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={
                    t.isRouteSpoke
                      ? accentHex
                      : isNight
                        ? "rgba(226,232,240,0.34)"
                        : "rgba(23,23,23,0.3)"
                  }
                  strokeWidth={t.isRouteSpoke ? "1.35" : t.isMajor ? "0.95" : "0.65"}
                />
              ))}
            </g>

            {/* Inner Φ-Scaled Harmonic Arcs */}
            <circle
              cx="80"
              cy="0"
              r={(66 / PHI).toFixed(2)}
              stroke={accentHex}
              strokeOpacity="0.3"
              strokeWidth="0.85"
              strokeDasharray="2 4"
            />
            <circle
              cx="80"
              cy="0"
              r={(66 / (PHI * PHI)).toFixed(2)}
              stroke={isNight ? "rgba(226,232,240,0.18)" : "rgba(23,23,23,0.16)"}
              strokeWidth="0.8"
            />

            {/* Live Magnetic Half-Compass Needle (Points directly down hovered spoke) */}
            <g ref={halfNeedleRef} transform={`rotate(${(-ROUTES[0].fanAngleDeg).toFixed(2)} 80 0)`}>
              <line
                x1="80"
                y1="0"
                x2="80"
                y2="60"
                stroke={accentHex}
                strokeOpacity="0.35"
                strokeWidth="0.8"
              />
              <polygon points="80,56 76.4,12 83.6,12" fill={accentHex} />
              <circle cx="80" cy="56" r="2.2" fill={accentHex} />
            </g>

            {/* Top-Edge Semicircular Pivot Jewel Hub */}
            <circle
              cx="80"
              cy="0"
              r="11"
              fill={isNight ? "#070c1c" : "#fcfaf5"}
              stroke={accentHex}
              strokeWidth="1.5"
            />
            <circle cx="80" cy="0" r="4" fill={accentHex} />
          </svg>

          {/* Subtle Bottom Rim Cue Glyph */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.2em] transition-all duration-300 ${accentText} ${halfHovered ? "opacity-100 translate-y-0" : "opacity-65 -translate-y-0.5"
              }`}
          >
            {halfHovered ? "✦" : "Φ"}
          </span>
        </button>
      </header>

      {/* =====================================================================
          STAGE 3: OPENED 360° CELESTIAL COMPASS (The Magic Inside)
          ===================================================================== */}
      <div
        ref={modalBackdropRef}
        role="dialog"
        aria-modal="true"
        aria-label="Interactive celestial compass navigation"
        onClick={(e) => {
          if (e.target === e.currentTarget) toggleFullCompass(false);
        }}
        style={{ visibility: "hidden", pointerEvents: "none" }}
        className={`fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-xl transition-colors duration-500 overflow-hidden ${isNight ? "bg-[#040712]/78" : "bg-[#f3eee4]/76"
          }`}
      >
        {/* Top Floating Escape / Instruction Ribbon */}
        <div
          className={`absolute top-5 sm:top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.28em] pointer-events-auto ${isNight ? "text-slate-400" : "text-neutral-600"
            }`}
        >
          <span className={accentText}>AUREA ASTROLABE</span>
          <span className="opacity-35">·</span>
          <span>SWEEP OR SCROLL TO AIM</span>
          <span className="opacity-35 hidden sm:inline">·</span>
          <button
            type="button"
            onClick={() => toggleFullCompass(false)}
            className={`hidden sm:inline cursor-pointer underline underline-offset-4 transition-colors ${isNight ? "hover:text-white" : "hover:text-black"
              }`}
          >
            CLOSE (ESC)
          </button>
        </div>

        {/* FULL 360° CIRCULAR HOROLOGICAL COMPASS HOUSING (Dead Centered) */}
        <div
          ref={modalCompassRef}
          onMouseMove={handleFullCompassPointerMove}
          onWheel={handleFullCompassWheel}
          className={`relative size-[min(86vw,74vh,500px)] rounded-full border-[1.5px] flex items-center justify-center select-none will-change-transform z-10 ${isNight
              ? "bg-[#060a17]/96 border-indigo-400/50 shadow-[0_36px_110px_rgba(0,0,0,0.9),inset_0_0_70px_rgba(129,140,248,0.14)]"
              : "bg-[#fcfaf5]/97 border-[#a6864a]/65 shadow-[0_36px_100px_rgba(17,17,17,0.22),inset_0_0_65px_rgba(166,134,74,0.12)]"
            }`}
        >
          {/* LIVE 60FPS GENERATIVE CELESTIAL CANVAS (Constellations + Morphing 3D/4D Core) */}
          <div className="pointer-events-none absolute inset-3 rounded-full overflow-hidden">
            <AstrolabeCoreCanvas
              isOpen={compassOpen}
              isNight={isNight}
              focusedIdx={openFocusIdx}
              needleAngleRef={fullNeedleAngleRef}
              pointerRef={pointerNormRef}
              warpPulseRef={warpPulseRef}
            />
          </div>

          {/* PRECISION SVG HOROLOGICAL BEZEL & JEWELLED MAGNETIC NEEDLE */}
          <svg
            viewBox="0 0 500 500"
            fill="none"
            className="pointer-events-none absolute inset-0 w-full h-full"
          >
            <g ref={fullOuterBezelRef}>
              <circle
                cx="250"
                cy="250"
                r="236"
                stroke={accentHex}
                strokeOpacity="0.34"
                strokeWidth="1"
              />
              {fullTicks.map((t) => (
                <line
                  key={t.deg}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={
                    t.isCardinal
                      ? accentHex
                      : isNight
                        ? "rgba(226,232,240,0.25)"
                        : "rgba(23,23,23,0.22)"
                  }
                  strokeWidth={t.isCardinal ? "1.8" : t.isMajor ? "1.1" : "0.7"}
                />
              ))}
            </g>

            <line
              x1="250"
              y1="26"
              x2="250"
              y2="474"
              stroke={isNight ? "rgba(226,232,240,0.08)" : "rgba(23,23,23,0.08)"}
              strokeWidth="0.9"
            />
            <line
              x1="26"
              y1="250"
              x2="474"
              y2="250"
              stroke={isNight ? "rgba(226,232,240,0.08)" : "rgba(23,23,23,0.08)"}
              strokeWidth="0.9"
            />

            <g ref={fullNeedleRef} transform="rotate(0 250 250)">
              <line
                x1="250"
                y1="44"
                x2="250"
                y2="456"
                stroke={accentHex}
                strokeOpacity="0.35"
                strokeWidth="0.9"
                strokeDasharray="3 5"
              />
              <polygon points="250,58 258,250 242,250" fill={accentHex} fillOpacity="0.88" />
              <polygon
                points="250,398 256,250 244,250"
                fill={isNight ? "rgba(226,232,240,0.2)" : "rgba(23,23,23,0.16)"}
              />
              <circle
                cx="250"
                cy="58"
                r="5.5"
                fill={isNight ? "#060a17" : "#fcfaf5"}
                stroke={accentHex}
                strokeWidth="1.5"
              />
            </g>
          </svg>

          {/* 4 INTERACTIVE CARDINAL ROUTE STATIONS */}
          {ROUTES.map((route, idx) => {
            const isFocused = openFocusIdx === idx;
            const isCurrent = activeRouteIdx === idx;
            const posClass =
              idx === 0
                ? "top-6 sm:top-8 left-1/2 -translate-x-1/2"
                : idx === 1
                  ? "right-5 sm:right-7 top-1/2 -translate-y-1/2"
                  : idx === 2
                    ? "bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
                    : "left-5 sm:left-7 top-1/2 -translate-y-1/2";

            return (
              <Link
                key={route.id}
                href={route.href}
                onMouseEnter={() => {
                  setOpenFocusIdx(idx);
                  physRef.current.fullTarget = route.bearing;
                  try {
                    cozyAudio.playCompassTick?.(idx);
                  } catch { }
                  wakePhysics();
                }}
                onClick={(e) => handleRouteActivate(e, route, true)}
                className={`astrolabe-station absolute z-20 flex flex-col items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border backdrop-blur-md no-underline cursor-pointer transition-all duration-300 ${posClass} ${isFocused
                    ? isNight
                      ? "bg-[#0c1430]/94 border-indigo-300/80 text-white shadow-[0_10px_30px_rgba(129,140,248,0.28)] scale-105"
                      : "bg-white/96 border-[#a6864a] text-neutral-950 shadow-[0_10px_28px_rgba(166,134,74,0.24)] scale-105"
                    : isNight
                      ? "bg-[#070c1c]/80 border-slate-700/70 text-slate-300 hover:text-white"
                      : "bg-[#faf8f4]/88 border-neutral-300/80 text-neutral-700 hover:text-black"
                  }`}
              >
                <span className={`font-mono text-[8px] sm:text-[9px] tracking-[0.22em] ${accentText}`}>
                  {route.cardinal} · {route.index}
                </span>
                <span className={`${cormorant.className} text-xl sm:text-2xl italic leading-tight`}>
                  {route.editorial}
                </span>
                {isCurrent && (
                  <span
                    className={`mt-0.5 size-1.5 rounded-full ${isNight ? "bg-indigo-300" : "bg-[#a6864a]"
                      }`}
                  />
                )}
              </Link>
            );
          })}

          {/* CENTER CRYSTAL ENGAGE HUB */}
          <button
            type="button"
            onClick={(e) => handleRouteActivate(e, focusedOpenRoute, true)}
            title={`Navigate to ${focusedOpenRoute.editorial} (Enter)`}
            className={`group relative z-30 size-24 sm:size-28 rounded-full border-[1.5px] backdrop-blur-md flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${isNight
                ? "bg-[#060a17]/78 border-indigo-400/60 hover:border-indigo-200 hover:scale-105 text-white shadow-[0_0_32px_rgba(129,140,248,0.2)]"
                : "bg-[#fcfaf5]/82 border-[#a6864a]/70 hover:border-[#a6864a] hover:scale-105 text-neutral-950 shadow-[0_0_28px_rgba(166,134,74,0.18)]"
              }`}
          >
            <span
              ref={fullReadoutRef}
              className={`font-mono text-[9px] sm:text-[10px] tabular-nums tracking-[0.2em] ${accentText}`}
            >
              000°
            </span>
            <span className={`${cormorant.className} text-lg sm:text-xl italic leading-none my-0.5`}>
              {focusedOpenRoute.editorial}
            </span>
            <span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.22em] opacity-70 group-hover:opacity-100">
              ENGAGE ↗
            </span>
          </button>
        </div>

        {/* Bottom Live Route Telemetry + Mobile Close Trigger */}
        <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-3 w-full max-w-md px-4 pointer-events-auto">
          <div
            className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border backdrop-blur-md font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] ${isNight
                ? "bg-[#070c1c]/90 border-slate-700/80 text-slate-300"
                : "bg-[#fcfaf5]/92 border-neutral-300/85 text-neutral-700"
              }`}
          >
            <span className={accentText}>{focusedOpenRoute.harmonic}</span>
            <span className="opacity-35">·</span>
            <span>{focusedOpenRoute.subtitle}</span>
          </div>

          <button
            type="button"
            onClick={() => toggleFullCompass(false)}
            className={`sm:hidden px-4 py-1.5 rounded-full border font-mono text-[9px] uppercase tracking-[0.22em] cursor-pointer ${isNight
                ? "bg-[#070c1c]/90 border-slate-700 text-slate-200"
                : "bg-[#fcfaf5]/92 border-neutral-300 text-neutral-800"
              }`}
          >
            Close ✕
          </button>
        </div>
      </div>

      {/* =====================================================================
          8-BLADE MECHANICAL OPTICAL IRIS SHUTTER (Cross-Route Aperture Wipe)
          ===================================================================== */}
      <div
        ref={irisOverlayRef}
        aria-hidden="true"
        style={{ visibility: "hidden", pointerEvents: "none" }}
        className="fixed inset-0 z-[95] overflow-hidden"
      >
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full block"
        >
          {Array.from({ length: 8 }, (_, k) => (
            <g key={k} transform={`rotate(${k * 45} 500 500)`}>
              <path
                ref={(el) => {
                  irisBladeRefs.current[k] = el;
                }}
                d="M 480 518 L 1320 500 L 1460 -360 L 880 -420 Z"
                fill={
                  isNight
                    ? k % 2 === 0
                      ? "#060a17"
                      : "#0a1024"
                    : k % 2 === 0
                      ? "#faf8f4"
                      : "#f1ebe0"
                }
                stroke={accentHex}
                strokeOpacity={isNight ? "0.35" : "0.45"}
                strokeWidth="1.4"
              />
            </g>
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div ref={irisRingRef} className="relative size-40 sm:size-48 flex items-center justify-center">
            <svg viewBox="0 0 180 180" fill="none" className="w-full h-full">
              <circle
                cx="90"
                cy="90"
                r="82"
                stroke={accentHex}
                strokeOpacity="0.45"
                strokeWidth="0.9"
                strokeDasharray="3 6"
              />
              <circle
                cx="90"
                cy="90"
                r={(82 / PHI).toFixed(2)}
                stroke={accentHex}
                strokeOpacity="0.28"
                strokeWidth="0.85"
              />
              <polygon points="90,12 87,20 93,20" fill={accentHex} />
            </svg>
          </div>

          <div ref={irisMetaRef} className="absolute text-center">
            <span className={`block font-mono text-[10px] uppercase tracking-[0.34em] mb-1 ${accentText}`}>
              {transitionRoute?.cardinal || "N"} · {transitionRoute?.bearingLabel || "000°"}
            </span>
            <span
              className={`${cormorant.className} block text-3xl sm:text-5xl italic font-light ${isNight ? "text-white" : "text-[#111111]"
                }`}
            >
              {transitionRoute?.editorial || "Index"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}