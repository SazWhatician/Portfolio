"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import gsap from "gsap";
import { ArrowDown, ArrowUpRight, X } from "lucide-react";
import { cozyAudio } from "@/lib/cozy-sound";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const PHI = (1 + Math.sqrt(5)) / 2;
const INV_PHI = 1 / PHI;
const INV_PHI_2 = INV_PHI * INV_PHI;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SPIRAL_B = (2 * Math.log(PHI)) / Math.PI;
const ROMAN_FIB = ["XXI", "XIII", "VIII", "V", "III", "II", "I"];

function buildGoldenLeaves() {
  const leaves = [];
  let x = 0;
  let y = 0;
  let w = 100;
  let h = 100;

  for (let i = 0; i < 6; i++) {
    const dir = i % 4;
    if (dir === 0) {
      const sw = w * INV_PHI;
      leaves.push({ i, dir, x, y, w: sw, h, roman: ROMAN_FIB[i] });
      x += sw;
      w -= sw;
    } else if (dir === 1) {
      const sh = h * INV_PHI;
      leaves.push({ i, dir, x, y, w, h: sh, roman: ROMAN_FIB[i] });
      y += sh;
      h -= sh;
    } else if (dir === 2) {
      const sw = w * INV_PHI;
      leaves.push({ i, dir, x: x + (w - sw), y, w: sw, h, roman: ROMAN_FIB[i] });
      w -= sw;
    } else {
      const sh = h * INV_PHI;
      leaves.push({ i, dir, x, y: y + (h - sh), w, h: sh, roman: ROMAN_FIB[i] });
      h -= sh;
    }
  }

  leaves.push({ i: 6, dir: 4, x, y, w, h, roman: ROMAN_FIB[6] });
  return leaves;
}

function leafArcPath(dir) {
  if (dir === 0) return "M 0 100 A 100 100 0 0 1 100 0";
  if (dir === 1) return "M 0 0 A 100 100 0 0 1 100 100";
  if (dir === 2) return "M 100 0 A 100 100 0 0 1 0 100";
  if (dir === 3) return "M 100 100 A 100 100 0 0 1 0 0";
  return "";
}

function leafHinge(dir) {
  if (dir === 0) return { origin: "0% 50%", prop: "rotateY", angle: -102 };
  if (dir === 1) return { origin: "50% 0%", prop: "rotateX", angle: 102 };
  if (dir === 2) return { origin: "100% 50%", prop: "rotateY", angle: 102 };
  if (dir === 3) return { origin: "50% 100%", prop: "rotateX", angle: -102 };
  return { origin: "50% 50%", prop: "scale", angle: 0 };
}

function stepRK4(pos, vel, target, stiffness, damping, dt) {
  const acc = (p, v) => stiffness * (target - p) - damping * v;
  const k1p = vel;
  const k1v = acc(pos, vel);
  const k2p = vel + 0.5 * dt * k1v;
  const k2v = acc(pos + 0.5 * dt * k1p, k2p);
  const k3p = vel + 0.5 * dt * k2v;
  const k3v = acc(pos + 0.5 * dt * k2p, k3p);
  const k4p = vel + dt * k3v;
  const k4v = acc(pos + dt * k3p, k4p);
  return [
    pos + (dt / 6) * (k1p + 2 * k2p + 2 * k3p + k4p),
    vel + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v),
  ];
}

function computeLameAxes(u, boxW, boxH) {
  const clamped = Math.max(0.001, Math.min(1, u));
  const sqBlend = clamped * clamped;
  const circleR = Math.min(boxW, boxH) * 0.5 * clamped;
  const rxPx = circleR * (1 - sqBlend) + boxW * 0.5 * sqBlend;
  const ryPx = circleR * (1 - sqBlend) + boxH * 0.5 * sqBlend;
  const n = 2 + 78 * Math.pow(clamped, 3.4);
  return { rxPx, ryPx, n };
}

function lamePolygonClip(rxPx, ryPx, boxW, boxH, n, pts = 48) {
  const rx = Math.min(50, (rxPx / boxW) * 100);
  const ry = Math.min(50, (ryPx / boxH) * 100);
  const exp = 2 / n;
  let out = "polygon(";
  for (let i = 0; i < pts; i++) {
    const th = (i / pts) * Math.PI * 2;
    const c = Math.cos(th);
    const s = Math.sin(th);
    const px = 50 + rx * Math.sign(c) * Math.pow(Math.abs(c), exp);
    const py = 50 + ry * Math.sign(s) * Math.pow(Math.abs(s), exp);
    out += `${px.toFixed(2)}% ${py.toFixed(2)}%${i === pts - 1 ? ")" : ","}`;
  }
  return out;
}

function buildPolyhedraData() {
  const dodRaw = [];
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) dodRaw.push([sx, sy, sz]);
    }
  }
  for (const s1 of [-1, 1]) {
    for (const s2 of [-1, 1]) {
      dodRaw.push([0, s1 * INV_PHI, s2 * PHI]);
      dodRaw.push([s1 * INV_PHI, s2 * PHI, 0]);
      dodRaw.push([s1 * PHI, 0, s2 * INV_PHI]);
    }
  }
  const dodVerts = dodRaw.map(([x, y, z]) => {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  });
  const dodEdges = [];
  for (let i = 0; i < dodVerts.length; i++) {
    for (let j = i + 1; j < dodVerts.length; j++) {
      const d = Math.hypot(
        dodVerts[i][0] - dodVerts[j][0],
        dodVerts[i][1] - dodVerts[j][1],
        dodVerts[i][2] - dodVerts[j][2]
      );
      if (d < 0.75) dodEdges.push([i, j]);
    }
  }

  const icoRaw = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
  ];
  const icoVerts = icoRaw.map(([x, y, z]) => {
    const l = Math.hypot(x, y, z);
    return [(x / l) * INV_PHI, (y / l) * INV_PHI, (z / l) * INV_PHI];
  });
  const icoEdges = [];
  for (let i = 0; i < icoVerts.length; i++) {
    for (let j = i + 1; j < icoVerts.length; j++) {
      const d = Math.hypot(
        icoVerts[i][0] - icoVerts[j][0],
        icoVerts[i][1] - icoVerts[j][1],
        icoVerts[i][2] - icoVerts[j][2]
      );
      if (d < 1.12 * INV_PHI) icoEdges.push([i, j]);
    }
  }

  return { dodVerts, dodEdges, icoVerts, icoEdges };
}

function RenaissanceAstrolabeCanvas({ isNight, active }) {
  const canvasRef = useRef(null);
  const poly = useMemo(() => buildPolyhedraData(), []);
  const stateRef = useRef({ isNight, active, mx: 0, my: 0, smx: 0, smy: 0 });
  stateRef.current.isNight = isNight;
  stateRef.current.active = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let t = 0;

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(p.clientWidth * dpr);
      canvas.height = Math.floor(p.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      stateRef.current.mx = e.clientX / window.innerWidth - 0.5;
      stateRef.current.my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const project = (verts, ax, ay, az, R, cx, cy) => {
      const ca = Math.cos(ax), sa = Math.sin(ax);
      const cb = Math.cos(ay), sb = Math.sin(ay);
      const cg = Math.cos(az), sg = Math.sin(az);
      return verts.map(([x, y, z]) => {
        const y1 = y * ca - z * sa;
        const z1 = y * sa + z * ca;
        const x2 = x * cb + z1 * sb;
        const z2 = -x * sb + z1 * cb;
        const x3 = x2 * cg - y1 * sg;
        const y3 = x2 * sg + y1 * cg;
        const sc = 3.4 / (3.4 + z2);
        return [cx + x3 * R * sc, cy + y3 * R * sc, z2];
      });
    };

    const draw = () => {
      if (!stateRef.current.active) return;
      const p = canvas.parentElement;
      const w = p?.clientWidth || 260;
      const h = p?.clientHeight || 260;
      ctx.clearRect(0, 0, w, h);

      t += 0.0065;
      stateRef.current.smx += (stateRef.current.mx - stateRef.current.smx) * 0.06;
      stateRef.current.smy += (stateRef.current.my - stateRef.current.smy) * 0.06;

      const night = stateRef.current.isNight;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const R = Math.min(w, h) * 0.34;
      const gold = (a) => (night ? `rgba(218,188,128,${a})` : `rgba(156,119,56,${a})`);
      const ink = (a) => (night ? `rgba(226,232,240,${a})` : `rgba(28,25,21,${a})`);

      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.32, 0, Math.PI * 2);
      ctx.strokeStyle = gold(0.28);
      ctx.lineWidth = 0.85;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.24, 0, Math.PI * 2);
      ctx.strokeStyle = ink(0.12);
      ctx.lineWidth = 0.7;
      ctx.setLineDash([2, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 + t * 0.15;
        const major = i % 3 === 0;
        const r1 = R * 1.24;
        const r2 = R * (major ? 1.37 : 1.3);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.strokeStyle = major ? gold(0.55) : ink(0.18);
        ctx.lineWidth = major ? 0.95 : 0.65;
        ctx.stroke();
      }

      const pentR = R * 1.24;
      ctx.beginPath();
      for (let k = 0; k <= 5; k++) {
        const idx = (k * 2) % 5;
        const a = (idx / 5) * Math.PI * 2 - Math.PI * 0.5 - t * 0.2;
        const px = cx + Math.cos(a) * pentR;
        const py = cy + Math.sin(a) * pentR;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = gold(0.16);
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.beginPath();
      const sA = R * 0.045;
      for (let i = 0; i <= 88; i++) {
        const th = (i / 88) * Math.PI * 3.1;
        const sr = sA * Math.exp(SPIRAL_B * th);
        const sx = cx + Math.cos(th + t * 0.4) * sr;
        const sy = cy + Math.sin(th + t * 0.4) * sr;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = gold(0.32);
      ctx.lineWidth = 0.9;
      ctx.stroke();

      const ax = t * 0.52 + stateRef.current.smy * 1.1;
      const ay = t * 0.78 - stateRef.current.smx * 1.2;
      const az = t * 0.24;

      const pDod = project(poly.dodVerts, ax, ay, az, R, cx, cy);
      for (let i = 0; i < poly.dodEdges.length; i++) {
        const [a, b] = poly.dodEdges[i];
        const front = (pDod[a][2] + pDod[b][2]) * 0.5 < 0.1;
        ctx.beginPath();
        ctx.moveTo(pDod[a][0], pDod[a][1]);
        ctx.lineTo(pDod[b][0], pDod[b][1]);
        ctx.strokeStyle = front ? ink(0.68) : ink(0.16);
        ctx.lineWidth = front ? 0.95 : 0.6;
        ctx.stroke();
      }

      const pIco = project(poly.icoVerts, -ax * INV_PHI, -ay * PHI, az, R, cx, cy);
      for (let i = 0; i < poly.icoEdges.length; i++) {
        const [a, b] = poly.icoEdges[i];
        const front = (pIco[a][2] + pIco[b][2]) * 0.5 < 0.08;
        ctx.beginPath();
        ctx.moveTo(pIco[a][0], pIco[a][1]);
        ctx.lineTo(pIco[b][0], pIco[b][1]);
        ctx.strokeStyle = front ? gold(0.88) : gold(0.28);
        ctx.lineWidth = front ? 1.0 : 0.65;
        ctx.stroke();
      }

      for (let i = 0; i < pIco.length; i++) {
        const [px, py, pz] = pIco[i];
        ctx.beginPath();
        ctx.arc(px, py, pz < 0.08 ? 2.1 : 1.2, 0, Math.PI * 2);
        ctx.fillStyle = pz < 0.08 ? gold(0.95) : gold(0.32);
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    if (stateRef.current.active) {
      rafId = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [poly, active]);

  return <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full block" />;
}

export default function ResumeModal({
  isOpen,
  onClose,
  isNight = false,
  pdfUrl = "/Saswat_Kumar_Mohanty_Resume.pdf",
}) {
  const [mounted, setMounted] = useState(false);

  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const draftCanvasRef = useRef(null);
  const frameRef = useRef(null);
  const leavesWrapRef = useRef(null);
  const leafRefs = useRef([]);
  const rafRef = useRef(0);
  const tlRef = useRef(null);
  const closingRef = useRef(false);
  const nightRef = useRef(isNight);
  nightRef.current = isNight;

  const leaves = useMemo(() => buildGoldenLeaves(), []);

  const drawDraftingPlate = useCallback((u, rxPx, ryPx, n, boxW, boxH) => {
    const canvas = draftCanvasRef.current;
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

    const env = Math.sin(Math.PI * Math.pow(Math.max(0, Math.min(1, u)), 0.76));
    if (env <= 0.004) return;

    const night = nightRef.current;
    const gold = (a) =>
      night
        ? `rgba(222,192,132,${(a * env).toFixed(4)})`
        : `rgba(156,119,56,${(a * env).toFixed(4)})`;
    const ink = (a) =>
      night
        ? `rgba(226,232,240,${(a * env).toFixed(4)})`
        : `rgba(28,25,21,${(a * env).toFixed(4)})`;

    const cx = vw * 0.5;
    const cy = vh * 0.5;
    const vitR = Math.min(boxW, boxH) * 0.52 * (0.35 + 0.65 * u);
    const rot = u * GOLDEN_ANGLE;

    ctx.save();

    ctx.beginPath();
    ctx.arc(cx, cy, vitR, rot, rot + Math.PI * 2 * Math.min(1, u * 1.25));
    ctx.strokeStyle = gold(0.42);
    ctx.lineWidth = 0.95;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, vitR * INV_PHI, -rot * PHI, -rot * PHI + Math.PI * 2 * Math.min(1, u * 1.35));
    ctx.strokeStyle = ink(0.22);
    ctx.lineWidth = 0.75;
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    for (let k = 0; k <= 5; k++) {
      const idx = (k * 2) % 5;
      const a = (idx / 5) * Math.PI * 2 - Math.PI * 0.5 + rot * 0.5;
      const px = cx + Math.cos(a) * vitR;
      const py = cy + Math.sin(a) * vitR;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = gold(0.24);
    ctx.lineWidth = 0.8;
    ctx.stroke();

    const maxTh = Math.PI * 3.35 * Math.min(1, u * 1.15);
    const spA = Math.min(boxW, boxH) * 0.011;
    for (const dirSign of [1, -1]) {
      ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        const th = (i / 90) * maxTh;
        const r = spA * Math.exp(SPIRAL_B * th);
        const angle = dirSign * th + rot + (dirSign === -1 ? Math.PI : 0);
        const sx = cx + Math.cos(angle) * r;
        const sy = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = dirSign === 1 ? gold(0.68) : gold(0.32);
      ctx.lineWidth = dirSign === 1 ? 1.15 : 0.85;
      ctx.stroke();
    }

    const exp = 2 / n;
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      const px = cx + rxPx * Math.sign(c) * Math.pow(Math.abs(c), exp);
      const py = cy + ryPx * Math.sign(s) * Math.pow(Math.abs(s), exp);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = gold(0.88);
    ctx.lineWidth = 1.25;
    ctx.stroke();

    const x0 = cx - rxPx;
    const y0 = cy - ryPx;
    const curW = rxPx * 2;
    const curH = ryPx * 2;
    const divX = x0 + curW * INV_PHI_2;

    ctx.beginPath();
    ctx.moveTo(divX, y0);
    ctx.lineTo(divX, y0 + curH);
    ctx.moveTo(x0, y0 + curH * INV_PHI_2);
    ctx.lineTo(x0 + curW, y0 + curH * INV_PHI_2);
    ctx.moveTo(x0, y0 + curH * INV_PHI);
    ctx.lineTo(x0 + curW, y0 + curH * INV_PHI);
    ctx.strokeStyle = ink(0.18);
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.restore();
  }, []);

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
    const frame = frameRef.current;
    const leavesWrap = leavesWrapRef.current;
    if (!root || !backdrop || !frame) return;

    cancelAnimationFrame(rafRef.current);
    tlRef.current?.kill();

    const boxW = frame.offsetWidth || Math.min(window.innerWidth - 32, 1140);
    const boxH = frame.offsetHeight || Math.min(window.innerHeight * 0.9, 860);
    const masks = root.querySelectorAll(".codex-mask");
    const rules = root.querySelectorAll(".codex-rule");

    if (isOpen) {
      gsap.set(root, { opacity: 1 });
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(frame, {
        opacity: 0,
        scale: 0.9,
        rotateX: 7,
        transformPerspective: 1500,
        pointerEvents: "none",
      });
      gsap.set(masks, { yPercent: 112, opacity: 0 });
      gsap.set(rules, { scaleX: 0, transformOrigin: "0% 50%" });

      if (leavesWrap) {
        gsap.set(leavesWrap, { visibility: "visible", opacity: 1, pointerEvents: "auto" });
      }
      leaves.forEach((lf, idx) => {
        const el = leafRefs.current[idx];
        if (!el) return;
        const h = leafHinge(lf.dir);
        gsap.set(el, {
          transformOrigin: h.origin,
          rotateX: 0,
          rotateY: 0,
          rotate: 0,
          scale: 1,
          opacity: 1,
        });
      });

      gsap.to(backdrop, { opacity: 1, duration: 0.55, ease: "power2.out" });

      let pos = 0;
      let vel = 0;
      let lastTs = performance.now();
      let leavesTriggered = false;

      const triggerLeafUnfold = () => {
        const tl = gsap.timeline({
          onComplete: () => {
            if (leavesWrap) gsap.set(leavesWrap, { visibility: "hidden", pointerEvents: "none" });
          },
        });

        tl.to(rules, { scaleX: 1, duration: 0.75, stagger: 0.06, ease: "expo.inOut" }, 0)
          .to(masks, { yPercent: 0, opacity: 1, duration: 0.72, stagger: 0.048, ease: "expo.out" }, 0.06);

        const fibDelays = [0.46, 0.37, 0.29, 0.22, 0.16, 0.11, 0.06];
        leaves.forEach((lf, idx) => {
          const el = leafRefs.current[idx];
          if (!el) return;
          const h = leafHinge(lf.dir);
          const delay = fibDelays[idx];
          if (lf.dir === 4) {
            tl.to(
              el,
              { scale: 0, rotate: 137.508, opacity: 0, duration: 0.45, ease: "expo.inOut" },
              delay
            );
          } else {
            tl.to(
              el,
              {
                [h.prop]: h.angle,
                opacity: 0,
                duration: 0.62,
                ease: "expo.inOut",
              },
              delay
            );
          }
        });

        tlRef.current = tl;
      };

      const stepOpen = (now) => {
        const dt = Math.min(0.032, Math.max(0.004, (now - lastTs) / 1000));
        lastTs = now;

        [pos, vel] = stepRK4(pos, vel, 1, 145, 22.8, dt);
        const u = Math.max(0, Math.min(1, pos));
        const { rxPx, ryPx, n } = computeLameAxes(u, boxW, boxH);

        frame.style.clipPath = lamePolygonClip(rxPx, ryPx, boxW, boxH, n);
        gsap.set(frame, {
          opacity: Math.min(1, u * 1.6),
          scale: 0.9 + 0.1 * u,
          rotateX: (1 - u) * 7,
        });

        drawDraftingPlate(u, rxPx, ryPx, n, boxW, boxH);

        if (!leavesTriggered && u > 0.56) {
          leavesTriggered = true;
          triggerLeafUnfold();
        }

        if (Math.abs(1 - pos) < 0.0025 && Math.abs(vel) < 0.015) {
          frame.style.clipPath = "none";
          gsap.set(frame, {
            opacity: 1,
            scale: 1,
            rotateX: 0,
            clearProps: "transform,pointerEvents",
          });
          const canvas = draftCanvasRef.current;
          canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }

        rafRef.current = requestAnimationFrame(stepOpen);
      };

      rafRef.current = requestAnimationFrame(stepOpen);
    } else {
      gsap.set(frame, { pointerEvents: "none", transformPerspective: 1500 });
      if (leavesWrap) {
        gsap.set(leavesWrap, { visibility: "visible", opacity: 1, pointerEvents: "none" });
      }

      const closeTl = gsap.timeline();

      closeTl.to(masks, { yPercent: 105, opacity: 0, duration: 0.24, stagger: 0.018, ease: "power3.in" }, 0);

      leaves.forEach((lf, idx) => {
        const el = leafRefs.current[idx];
        if (!el) return;
        const h = leafHinge(lf.dir);
        const delay = idx * 0.032;
        if (lf.dir === 4) {
          closeTl.to(
            el,
            { scale: 1, rotate: 0, opacity: 1, duration: 0.26, ease: "expo.out" },
            delay
          );
        } else {
          closeTl.to(
            el,
            { [h.prop]: 0, opacity: 1, duration: 0.3, ease: "expo.out" },
            delay
          );
        }
      });

      closeTl.add(() => {
        let pos = 1;
        let vel = 0;
        let lastTs = performance.now();

        gsap.to(backdrop, { opacity: 0, duration: 0.42, delay: 0.14, ease: "power2.inOut" });

        const stepClose = (now) => {
          const dt = Math.min(0.032, Math.max(0.004, (now - lastTs) / 1000));
          lastTs = now;

          [pos, vel] = stepRK4(pos, vel, 0, 175, 25.5, dt);
          const u = Math.max(0, Math.min(1, pos));
          const { rxPx, ryPx, n } = computeLameAxes(u, boxW, boxH);

          frame.style.clipPath = lamePolygonClip(rxPx, ryPx, boxW, boxH, n);
          gsap.set(frame, {
            opacity: Math.pow(u, 0.75),
            scale: 0.88 + 0.12 * u,
            rotateX: (1 - u) * -6,
          });

          drawDraftingPlate(u, rxPx, ryPx, n, boxW, boxH);

          if (pos < 0.008 && Math.abs(vel) < 0.08) {
            const canvas = draftCanvasRef.current;
            canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
            setMounted(false);
            return;
          }

          rafRef.current = requestAnimationFrame(stepClose);
        };

        rafRef.current = requestAnimationFrame(stepClose);
      }, 0.22);

      tlRef.current = closeTl;
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      tlRef.current?.kill();
    };
  }, [isOpen, mounted, leaves, drawDraftingPlate]);

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

  const goldText = isNight ? "text-[#dabc80]" : "text-[#9c7738]";
  const goldStroke = isNight ? "#dabc80" : "#9c7738";
  const borderCol = isNight ? "border-[#dabc80]/20" : "border-[#9c7738]/25";
  const ruleBg = isNight ? "bg-[#dabc80]/20" : "bg-[#9c7738]/25";
  const parchmentBg = isNight ? "bg-[#090d19]" : "bg-[#f7f3ea]";
  const leafBg = isNight ? "bg-[#0b1020]" : "bg-[#f4efe4]";

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 lg:p-8 pointer-events-auto opacity-0"
    >
      <div
        ref={backdropRef}
        aria-hidden="true"
        onClick={handleClose}
        className={`absolute inset-0 backdrop-blur-md cursor-pointer ${isNight ? "bg-[#03050c]/82" : "bg-[#1a1610]/52"
          }`}
      />

      <canvas
        ref={draftCanvasRef}
        aria-hidden="true"
        className="fixed inset-0 z-30 pointer-events-none w-full h-full"
      />

      <div
        ref={frameRef}
        className={`relative z-20 w-full max-w-6xl h-[92vh] max-h-[860px] border p-1.5 sm:p-2 will-change-transform ${borderCol} ${isNight
            ? "bg-[#060913] text-[#f3eee3] shadow-[0_36px_110px_rgba(0,0,0,0.85)]"
            : "bg-[#ede7da] text-[#1c1915] shadow-[0_36px_110px_rgba(24,18,10,0.28)]"
          }`}
      >
        <div className={`relative w-full h-full border grid grid-cols-1 lg:grid-cols-[1fr_1.618fr] overflow-hidden ${borderCol} ${parchmentBg}`}>
          <aside className={`relative flex flex-col justify-between p-5 sm:p-7 lg:p-8 border-b lg:border-b-0 lg:border-r ${borderCol}`}>
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="overflow-hidden">
                  <span className={`codex-mask block text-[10px] font-mono uppercase tracking-[0.3em] ${goldText}`}>
                    De Divina Proportione
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  onMouseEnter={() => cozyAudio.playHover?.()}
                  aria-label="Close resume viewer"
                  className={`lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-mono uppercase tracking-[0.2em] cursor-pointer ${borderCol}`}
                >
                  <X className="size-3.5" />
                  <span>ESC</span>
                </button>
              </div>

              <div className={`codex-rule h-px w-full my-4 ${ruleBg}`} />

              <div className="overflow-hidden">
                <h2
                  id="resume-modal-title"
                  className="codex-mask flex flex-wrap items-baseline gap-x-3 gap-y-1"
                >
                  <span
                    className={`${cormorant.className} italic text-4xl sm:text-5xl font-light tracking-tight leading-[0.88]`}
                  >
                    Saswat
                  </span>
                  <span className="font-['Clash_Display',sans-serif] text-lg sm:text-xl font-medium uppercase tracking-[0.18em]">
                    Mohanty
                  </span>
                </h2>
              </div>

              <div className="overflow-hidden mt-2.5">
                <p
                  className={`codex-mask text-[11px] font-mono uppercase tracking-[0.22em] ${isNight ? "text-slate-400" : "text-neutral-600"
                    }`}
                >
                  Spatial Technologist & Director
                </p>
              </div>
            </div>

            <div className={`hidden lg:flex flex-col items-center justify-center my-5 py-4 border-y relative flex-1 min-h-[210px] ${borderCol}`}>
              <div className="w-full h-full max-h-[265px] relative">
                <RenaissanceAstrolabeCanvas isNight={isNight} active={mounted && isOpen} />
              </div>
              <div className="w-full flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.26em] mt-2 opacity-75">
                <span className={goldText}>Φ = 1.618033</span>
                <span>Dodeca · Icosa Dual</span>
              </div>
            </div>

            <div className="mt-4 lg:mt-0 flex flex-col gap-3">
              <div className="hidden lg:grid grid-cols-2 gap-3 text-[10px] font-mono uppercase tracking-[0.2em] pb-3">
                <div>
                  <span className="opacity-50 block mb-0.5">Codex</span>
                  <span>Folio MMXXVI</span>
                </div>
                <div className="text-right">
                  <span className="opacity-50 block mb-0.5">Ratio</span>
                  <span className={goldText}>38.2% : 61.8%</span>
                </div>
              </div>

              <div className={`codex-rule h-px w-full ${ruleBg}`} />

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={pdfUrl}
                  download="SASWAT_KUMAR_MOHANTY.pdf"
                  onMouseEnter={() => cozyAudio.playHover?.()}
                  onClick={() => cozyAudio.playSnap?.(3, 1)}
                  className={`group inline-flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-mono uppercase tracking-[0.2em] font-medium no-underline transition-colors duration-300 ${isNight
                      ? "bg-[#dabc80] text-[#080b14] hover:bg-[#ead2a2]"
                      : "bg-[#1c1915] text-[#f7f3ea] hover:bg-black"
                    }`}
                >
                  <span>Download</span>
                  <ArrowDown className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>

                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => cozyAudio.playHover?.()}
                  onClick={() => cozyAudio.playSnap?.(2, 1)}
                  className={`group inline-flex items-center justify-center gap-2 px-4 py-3 border text-[11px] font-mono uppercase tracking-[0.2em] no-underline transition-colors duration-300 ${borderCol} ${isNight
                      ? "hover:bg-[#dabc80]/10 text-[#f3eee3]"
                      : "hover:bg-[#9c7738]/10 text-[#1c1915]"
                    }`}
                >
                  <span>Full Tab</span>
                  <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>

              <button
                type="button"
                onClick={handleClose}
                onMouseEnter={() => cozyAudio.playHover?.()}
                aria-label="Close resume viewer"
                className={`hidden lg:flex items-center justify-between w-full px-4 py-2.5 border text-[10px] font-mono uppercase tracking-[0.25em] cursor-pointer transition-colors duration-300 ${borderCol} ${isNight
                    ? "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    : "text-neutral-600 hover:bg-neutral-900/[0.04] hover:text-black"
                  }`}
              >
                <span>Close Manuscript</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className={goldText}>ESC</span>
                  <X className="size-3.5" />
                </span>
              </button>
            </div>
          </aside>

          <section
            className={`relative flex-1 min-h-0 p-2.5 sm:p-4 lg:p-5 flex flex-col ${isNight ? "bg-[#050811]" : "bg-[#ebe4d6]"
              }`}
          >
            <div className={`relative flex-1 w-full border overflow-hidden bg-white ${borderCol}`}>
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border-0 bg-white block"
                title="Saswat Kumar Mohanty Resume Document"
              />

              <div
                ref={leavesWrapRef}
                aria-hidden="true"
                style={{ perspective: "1600px" }}
                className="absolute inset-0 z-20 overflow-hidden"
              >
                {leaves.map((lf, idx) => (
                  <div
                    key={lf.i}
                    ref={(el) => {
                      leafRefs.current[idx] = el;
                    }}
                    style={{
                      left: `${lf.x}%`,
                      top: `${lf.y}%`,
                      width: `${lf.w}%`,
                      height: `${lf.h}%`,
                      backfaceVisibility: "hidden",
                    }}
                    className={`absolute border ${borderCol} ${leafBg} will-change-transform flex items-center justify-center overflow-hidden`}
                  >
                    {lf.dir < 4 && (
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        <path
                          d={leafArcPath(lf.dir)}
                          fill="none"
                          stroke={goldStroke}
                          strokeOpacity="0.65"
                          strokeWidth="1.2"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    )}
                    <span
                      className={`${cormorant.className} italic text-xs sm:text-sm tracking-[0.18em] select-none ${goldText} opacity-75`}
                    >
                      {lf.roman}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2.5 px-1 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.26em] opacity-70">
              <span className={goldText}>Sectio Aurea · Plate 61.8%</span>
              <span>Vector Manuscript · Verified CV</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}