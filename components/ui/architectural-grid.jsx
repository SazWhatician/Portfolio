"use client";

import { useEffect, useRef } from "react";

const PHI = (1 + Math.sqrt(5)) / 2; // 1.618033988749895
const INV_PHI = 1 / PHI; // 0.6180339887
const INV_PHI_2 = INV_PHI * INV_PHI; // 0.3819660113
const INV_PHI_3 = INV_PHI_2 * INV_PHI; // 0.2360679775
const INV_PHI_4 = INV_PHI_3 * INV_PHI; // 0.1458980338
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 2.399963 rad (137.508°)

const X_LINES = [
  { r: INV_PHI_4, label: "Φ⁻⁴", tier: 2 },
  { r: INV_PHI_3, label: "Φ⁻³", tier: 1 },
  { r: INV_PHI_2, label: "Φ⁻²", tier: 0 },
  { r: 0.5, label: "½", tier: 1 },
  { r: INV_PHI, label: "Φ⁻¹", tier: 0 },
  { r: 1 - INV_PHI_3, label: "1−Φ⁻³", tier: 1 },
  { r: 1 - INV_PHI_4, label: "1−Φ⁻⁴", tier: 2 },
];

const Y_LINES = [
  { r: INV_PHI_4, label: "Φ⁻⁴", tier: 2 },
  { r: INV_PHI_2, label: "Φ⁻²", tier: 0 },
  { r: 0.5, label: "½", tier: 1 },
  { r: INV_PHI, label: "Φ⁻¹", tier: 0 },
  { r: 1 - INV_PHI_4, label: "1−Φ⁻⁴", tier: 2 },
];

const GOLDEN_EYES = [
  { rx: INV_PHI_2, ry: INV_PHI_2, tag: "Φ⁻² · Φ⁻²" },
  { rx: INV_PHI, ry: INV_PHI_2, tag: "Φ⁻¹ · Φ⁻²" },
  { rx: INV_PHI_2, ry: INV_PHI, tag: "Φ⁻² · Φ⁻¹" },
  { rx: INV_PHI, ry: INV_PHI, tag: "Φ⁻¹ · Φ⁻¹" },
];

function snap(v) {
  return Math.floor(v) + 0.5;
}

// Shortest distance from point (px, py) to segment (x1, y1)-(x2, y2)
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function detectDarkParent(el) {
  const parent = el?.parentElement;
  if (!parent) return false;
  const cls = typeof parent.className === "string" ? parent.className : "";
  if (cls.includes("060a17") || cls.includes("slate-950") || cls.includes("bg-black")) {
    return true;
  }
  const bg = window.getComputedStyle(parent).backgroundColor;
  const match = bg && bg.match(/\d+/g);
  if (match && match.length >= 3) {
    const r = Number(match[0]);
    const g = Number(match[1]);
    const b = Number(match[2]);
    const a = match[3] !== undefined ? Number(match[3]) : 1;
    if (a > 0.1) {
      return 0.299 * r + 0.587 * g + 0.114 * b < 90;
    }
  }
  return false;
}

/**
 * ArchitecturalGrid — Codex Aurea Dynamic Renaissance & Golden-Ratio Drafting Matrix
 * Drop-in replacement compatible with <ArchitecturalGrid /> (auto-detects night theme)
 * or explicit <ArchitecturalGrid isNight={isNight} />.
 */
export default function ArchitecturalGrid({ isNight: isNightProp }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const nightPropRef = useRef(isNightProp);
  nightPropRef.current = isNightProp;
  const syncThemeRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let running = false;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = {
      intro: prefersReducedMotion ? 1 : 0,
      introStart: performance.now(),
      targetMx: width * INV_PHI,
      targetMy: height * INV_PHI_2,
      mx: width * INV_PHI,
      my: height * INV_PHI_2,
      targetPointerAlpha: 0,
      pointerAlpha: 0,
      targetScrollY: window.scrollY || 0,
      scrollY: window.scrollY || 0,
      scrollProgress: 0,
      darkness:
        typeof nightPropRef.current === "boolean"
          ? nightPropRef.current
            ? 1
            : 0
          : detectDarkParent(root)
            ? 1
            : 0,
      targetDarkness:
        typeof nightPropRef.current === "boolean"
          ? nightPropRef.current
            ? 1
            : 0
          : detectDarkParent(root)
            ? 1
            : 0,
    };

    const computeScrollProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, (window.scrollY || 0) / maxScroll));
    };
    state.scrollProgress = computeScrollProgress();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wake();
    };

    const drawLineSegment = (x1, y1, x2, y2, strokeStyle, lineWidth = 0.75, dash = null) => {
      ctx.beginPath();
      if (dash) ctx.setLineDash(dash);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      if (dash) ctx.setLineDash([]);
    };

    const renderFrame = (now) => {
      if (document.hidden) {
        running = false;
        return;
      }

      // 1. Advance intro drafting curve (quartic ease-out over 1.35s)
      if (state.intro < 1) {
        const raw = Math.min(1, (now - state.introStart) / 1350);
        state.intro = 1 - Math.pow(1 - raw, 4);
      }

      // 2. Smoothly damp pointer, scroll, and day/night palette transition
      state.mx += (state.targetMx - state.mx) * 0.14;
      state.my += (state.targetMy - state.my) * 0.14;
      state.pointerAlpha += (state.targetPointerAlpha - state.pointerAlpha) * 0.12;
      state.scrollY += (state.targetScrollY - state.scrollY) * 0.16;
      state.darkness += (state.targetDarkness - state.darkness) * 0.12;

      const scrollDelta = Math.abs(state.targetScrollY - state.scrollY);
      const scrollEnergy = Math.min(1, scrollDelta / 180);

      // Interpolate Day (Graphite + Antique Brass) <-> Night (Lunar Silver + Celestial Indigo)
      const d = state.darkness;
      const inkR = Math.round(23 + (226 - 23) * d);
      const inkG = Math.round(23 + (232 - 23) * d);
      const inkB = Math.round(23 + (240 - 23) * d);
      const accR = Math.round(166 + (165 - 166) * d);
      const accG = Math.round(134 + (180 - 134) * d);
      const accB = Math.round(74 + (252 - 74) * d);

      const ink = (a) => `rgba(${inkR},${inkG},${inkB},${a.toFixed(4)})`;
      const acc = (a) => `rgba(${accR},${accG},${accB},${a.toFixed(4)})`;

      ctx.clearRect(0, 0, width, height);

      const intro = state.intro;
      const loupeR = Math.min(width, height) < 640 ? 180 : 290;
      const pAlpha = isFinePointer ? state.pointerAlpha : 0;
      const showDetail = width >= 640;

      // =========================================================================
      // LAYER 1: RENAISSANCE PROJECTIVE ARMATURE (Baroque + Golden Reciprocals)
      // Algebraically intersects at all four Golden Eyes (38.2% / 61.8%).
      // =========================================================================
      if (width >= 768) {
        const armature = [
          // Main diagonals
          [0, 0, width, height, 0.026],
          [width, 0, 0, height, 0.026],
          // 4 Golden Reciprocal Diagonals (meet main diagonals at exact Golden Eyes)
          [0, 0, width * INV_PHI, height, 0.02],
          [width, 0, width * INV_PHI_2, height, 0.02],
          [0, height, width * INV_PHI, 0, 0.02],
          [width, height, width * INV_PHI_2, 0, 0.02],
        ];

        for (let i = 0; i < armature.length; i++) {
          const [x1, y1, x2, y2, baseOp] = armature[i];
          const ex = x1 + (x2 - x1) * intro;
          const ey = y1 + (y2 - y1) * intro;

          drawLineSegment(x1, y1, ex, ey, ink(baseOp + d * 0.014), 0.7);

          // Proximity illumination along armature chords inside optical loupe
          if (pAlpha > 0.02) {
            const dist = distToSegment(state.mx, state.my, x1, y1, x2, y2);
            if (dist < loupeR) {
              const u = 1 - dist / loupeR;
              const glow = u * u * pAlpha;
              const grad = ctx.createRadialGradient(state.mx, state.my, 0, state.mx, state.my, loupeR);
              grad.addColorStop(0, acc(0.2 * glow));
              grad.addColorStop(0.55, acc(0.08 * glow));
              grad.addColorStop(1, acc(0));
              drawLineSegment(x1, y1, ex, ey, grad, 0.9);
            }
          }
        }
      }

      // =========================================================================
      // LAYER 2: RECURSIVE GOLDEN-RATIO HARMONIC GRID (Φ⁻⁴ .. Φ⁻¹)
      // =========================================================================
      const activeX = showDetail ? X_LINES : X_LINES.filter((l) => l.tier <= 1);
      const activeY = showDetail ? Y_LINES : Y_LINES.filter((l) => l.tier === 0);

      for (let i = 0; i < activeX.length; i++) {
        const line = activeX[i];
        const x = snap(width * line.r);
        const ySpan = height * intro;
        const y0 = (height - ySpan) * 0.5;
        const isPrimary = line.tier === 0;
        const baseA = isPrimary ? 0.055 + d * 0.02 : line.tier === 1 ? 0.032 + d * 0.015 : 0.02 + d * 0.01;

        drawLineSegment(x, y0, x, y0 + ySpan, isPrimary ? acc(baseA * 1.45) : ink(baseA), isPrimary ? 0.85 : 0.65);

        // Localized cursor loupe glow along vertical meridian
        if (pAlpha > 0.02) {
          const dx = Math.abs(state.mx - x);
          if (dx < loupeR) {
            const f = Math.pow(1 - dx / loupeR, 2) * pAlpha;
            const g = ctx.createLinearGradient(x, state.my - loupeR, x, state.my + loupeR);
            g.addColorStop(0, acc(0));
            g.addColorStop(0.5, acc((isPrimary ? 0.34 : 0.18) * f));
            g.addColorStop(1, acc(0));
            drawLineSegment(x, Math.max(0, state.my - loupeR), x, Math.min(height, state.my + loupeR), g, isPrimary ? 1.05 : 0.85);
          }
        }
      }

      for (let i = 0; i < activeY.length; i++) {
        const line = activeY[i];
        const y = snap(height * line.r);
        const xSpan = width * intro;
        const x0 = (width - xSpan) * 0.5;
        const isPrimary = line.tier === 0;
        const baseA = isPrimary ? 0.05 + d * 0.018 : line.tier === 1 ? 0.028 + d * 0.014 : 0.018 + d * 0.01;

        drawLineSegment(x0, y, x0 + xSpan, y, isPrimary ? acc(baseA * 1.35) : ink(baseA), isPrimary ? 0.8 : 0.6);

        if (pAlpha > 0.02) {
          const dy = Math.abs(state.my - y);
          if (dy < loupeR) {
            const f = Math.pow(1 - dy / loupeR, 2) * pAlpha;
            const g = ctx.createLinearGradient(state.mx - loupeR, y, state.mx + loupeR, y);
            g.addColorStop(0, acc(0));
            g.addColorStop(0.5, acc((isPrimary ? 0.32 : 0.16) * f));
            g.addColorStop(1, acc(0));
            drawLineSegment(Math.max(0, state.mx - loupeR), y, Math.min(width, state.mx + loupeR), y, g, isPrimary ? 1.0 : 0.8);
          }
        }
      }

      // Subtle micro-crosshairs at grid intersections illuminated inside optical loupe
      if (pAlpha > 0.02 && showDetail) {
        for (let xi = 0; xi < activeX.length; xi++) {
          const x = snap(width * activeX[xi].r);
          if (Math.abs(state.mx - x) > loupeR) continue;
          for (let yi = 0; yi < activeY.length; yi++) {
            const y = snap(height * activeY[yi].r);
            const dist = Math.hypot(state.mx - x, state.my - y);
            if (dist < loupeR) {
              const f = Math.pow(1 - dist / loupeR, 2) * pAlpha;
              const arm = 4.5 + f * 3;
              drawLineSegment(x - arm, y, x + arm, y, acc(0.38 * f), 0.9);
              drawLineSegment(x, y - arm, x, y + arm, acc(0.38 * f), 0.9);
            }
          }
        }
      }

      // =========================================================================
      // LAYER 3: FOUR GOLDEN EYES + LIVE DA VINCI COMPASS & VESICA PISCIS LENS
      // =========================================================================
      let nearestEye = null;
      let nearestDist = Infinity;

      for (let i = 0; i < GOLDEN_EYES.length; i++) {
        const eye = GOLDEN_EYES[i];
        const ex = snap(width * eye.rx);
        const ey = snap(height * eye.ry);
        const dist = Math.hypot(state.mx - ex, state.my - ey);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEye = { ex, ey, tag: eye.tag, dist };
        }

        const prox = pAlpha > 0.01 ? Math.max(0, 1 - dist / 340) * pAlpha : 0;
        const baseEyeA = (0.14 + prox * 0.42 + scrollEnergy * 0.12) * intro;

        // Precision diamond + hairline registration ring at every Golden Eye
        const arm = 5 + prox * 3.5;
        drawLineSegment(ex - arm, ey, ex + arm, ey, acc(baseEyeA), 0.85);
        drawLineSegment(ex, ey - arm, ex, ey + arm, acc(baseEyeA), 0.85);

        ctx.beginPath();
        ctx.arc(ex, ey, 9 + prox * 5, 0, Math.PI * 2);
        ctx.strokeStyle = acc(baseEyeA * 0.65);
        ctx.lineWidth = 0.75;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Live Compass Construction between cursor and nearest Golden Eye
      if (nearestEye && pAlpha > 0.02 && nearestEye.dist > 14 && nearestEye.dist < 340 && width >= 768) {
        const { ex, ey, dist, tag } = nearestEye;
        const proximity = Math.pow(1 - dist / 340, 1.5) * pAlpha;
        const theta = Math.atan2(state.my - ey, state.mx - ex);

        // 1. Hairline drafting chord from Golden Eye to cursor
        drawLineSegment(ex, ey, state.mx, state.my, acc(0.24 * proximity), 0.75, [3, 5]);

        // 2. Osculating Golden-Angle compass arc centered on the Golden Eye
        const halfSpan = (GOLDEN_ANGLE * 0.42) * (0.35 + proximity * 0.65);
        ctx.beginPath();
        ctx.arc(ex, ey, dist, theta - halfSpan, theta + halfSpan);
        ctx.strokeStyle = acc(0.26 * proximity);
        ctx.lineWidth = 0.85;
        ctx.stroke();

        // 3. Exact Internal Golden-Section Point G = E + (P - E) / Φ
        const gx = ex + (state.mx - ex) * INV_PHI;
        const gy = ey + (state.my - ey) * INV_PHI;

        // Diamond marker at exact Golden Division G
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = acc(0.55 * proximity);
        ctx.lineWidth = 0.9;
        ctx.strokeRect(-2.8, -2.8, 5.6, 5.6);
        ctx.restore();

        // 4. Delicate Vesica Piscis Lens formed by E and G (radius = |G - E|)
        const vesR = dist * INV_PHI;
        if (vesR > 18 && vesR < 170) {
          const lensHalfAngle = Math.PI / 3; // Exact 60° intersection of Vesica Piscis
          ctx.beginPath();
          ctx.arc(ex, ey, vesR, theta - lensHalfAngle, theta + lensHalfAngle);
          ctx.strokeStyle = acc(0.16 * proximity);
          ctx.lineWidth = 0.7;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(gx, gy, vesR, theta + Math.PI - lensHalfAngle, theta + Math.PI + lensHalfAngle);
          ctx.strokeStyle = acc(0.16 * proximity);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }

        // 5. Whisper-fine coordinate engraving next to active Golden Eye
        if (proximity > 0.14) {
          ctx.font = '500 9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
          ctx.fillStyle = acc(0.65 * proximity);
          ctx.fillText(tag, ex + 14, ey - 10);
        }
      }

      // =========================================================================
      // LAYER 4: SCROLL-COUPLED FIBONACCI VERNIER MARGINS & ASTROLABE CORNERS
      // Strictly tucked within the outer 12px frame — zero clash with HUD/Ship.
      // =========================================================================
      const marginA = (0.14 + scrollEnergy * 0.16 + d * 0.05) * intro;

      // Top & Bottom Golden-Ratio Edge Ticks
      for (let i = 0; i < activeX.length; i++) {
        const x = snap(width * activeX[i].r);
        const len = activeX[i].tier === 0 ? 10 : 5;
        drawLineSegment(x, 0, x, len, activeX[i].tier === 0 ? acc(marginA * 1.6) : ink(marginA), 0.8);
        drawLineSegment(x, height - len, x, height, activeX[i].tier === 0 ? acc(marginA * 1.6) : ink(marginA), 0.8);
      }

      // Left & Right Scroll-Coupled Fibonacci Vernier Scales (89px stride)
      const stride = 89; // Fibonacci F_11
      const offset = (state.scrollY * 0.35) % stride;
      const fibSubTicks = [0, 13, 21, 34, 55];

      for (let base = -stride; base < height + stride; base += stride) {
        for (let k = 0; k < fibSubTicks.length; k++) {
          const y = snap(base + fibSubTicks[k] - offset);
          if (y < 24 || y > height - 24) continue;
          const isMajor = k === 0;
          const tLen = isMajor ? 8 : k === 4 ? 5 : 3;
          const col = isMajor ? acc(marginA * 1.25) : ink(marginA * 0.75);
          drawLineSegment(0, y, tLen, y, col, isMajor ? 0.85 : 0.65);
          drawLineSegment(width - tLen, y, width, y, col, isMajor ? 0.85 : 0.65);
        }
      }

      // Gliding Vernier Caliper Needles aligned to cursor X/Y on perimeter edges
      if (pAlpha > 0.02 && showDetail) {
        const mx = snap(state.mx);
        const my = snap(state.my);
        const needleCol = acc(0.58 * pAlpha);

        // Top & Bottom needles
        ctx.fillStyle = needleCol;
        ctx.beginPath();
        ctx.moveTo(mx, 9);
        ctx.lineTo(mx - 3, 2);
        ctx.lineTo(mx + 3, 2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(mx, height - 9);
        ctx.lineTo(mx - 3, height - 2);
        ctx.lineTo(mx + 3, height - 2);
        ctx.closePath();
        ctx.fill();

        // Left & Right needles
        ctx.beginPath();
        ctx.moveTo(9, my);
        ctx.lineTo(2, my - 3);
        ctx.lineTo(2, my + 3);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width - 9, my);
        ctx.lineTo(width - 2, my - 3);
        ctx.lineTo(width - 2, my + 3);
        ctx.closePath();
        ctx.fill();
      }

      // Four Corner Vitruvian Registration Brackets + Scroll-Rotated Quarter Arcs
      const pad = 18;
      const bLen = 10;
      const arcAngle = state.scrollProgress * Math.PI * 2 * PHI;
      const corners = [
        [pad, pad, 1, 1],
        [width - pad, pad, -1, 1],
        [pad, height - pad, 1, -1],
        [width - pad, height - pad, -1, -1],
      ];

      for (let i = 0; i < corners.length; i++) {
        const [cx, cy, sx, sy] = corners[i];
        const x = snap(cx);
        const y = snap(cy);
        drawLineSegment(x, y, x + bLen * sx, y, ink(0.2 * intro), 0.85);
        drawLineSegment(x, y, x, y + bLen * sy, ink(0.2 * intro), 0.85);

        ctx.beginPath();
        ctx.arc(x, y, 5.5, arcAngle + i * (Math.PI / 2), arcAngle + i * (Math.PI / 2) + Math.PI * 0.65);
        ctx.strokeStyle = acc(0.32 * intro);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 3. Sleep RAF automatically when fully settled (0% idle CPU/GPU cost)
      const settled =
        state.intro >= 0.999 &&
        Math.abs(state.targetMx - state.mx) < 0.08 &&
        Math.abs(state.targetMy - state.my) < 0.08 &&
        Math.abs(state.targetPointerAlpha - state.pointerAlpha) < 0.004 &&
        Math.abs(state.targetScrollY - state.scrollY) < 0.08 &&
        Math.abs(state.targetDarkness - state.darkness) < 0.004;

      if (settled) {
        running = false;
      } else {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const wake = () => {
      if (!running && !document.hidden) {
        running = true;
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const onPointerMove = (e) => {
      if (!isFinePointer) return;
      state.targetMx = e.clientX;
      state.targetMy = e.clientY;
      state.targetPointerAlpha = 1;
      wake();
    };

    const onPointerLeave = () => {
      state.targetPointerAlpha = 0;
      wake();
    };

    const onScroll = () => {
      state.targetScrollY = window.scrollY || 0;
      state.scrollProgress = computeScrollProgress();
      wake();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) wake();
    };

    // Observe parent container class/theme changes for zero-config day/night sync
    let observer = null;
    const syncTheme = () => {
      if (typeof nightPropRef.current === "boolean") {
        state.targetDarkness = nightPropRef.current ? 1 : 0;
      } else {
        state.targetDarkness = detectDarkParent(root) ? 1 : 0;
      }
      wake();
    };
    syncThemeRef.current = syncTheme;

    if (root.parentElement) {
      observer = new MutationObserver(syncTheme);
      observer.observe(root.parentElement, { attributes: true, attributeFilter: ["class", "style"] });
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Re-sync cleanly if caller passes an explicit isNight prop dynamically
  useEffect(() => {
    nightPropRef.current = isNightProp;
    if (typeof isNightProp === "boolean") {
      syncThemeRef.current?.();
      window.dispatchEvent(new Event("resize"));
    }
  }, [isNightProp]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[4] overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}