"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { paintStudy } from "@/components/ui/glass-carousel-utils/studies";
import { cozyAudio } from "@/lib/cozy-sound";
import "./glass-carousel-utils/glass-carousel.css";

/**
 * Glass Carousel
 * An endless row of portrait panels seen through a liquid glass lens in the middle. The row is
 * drawn into a texture, then a second shader bends it: the rim swirls and splits into colour,
 * a soft white bloom sits in the centre and a thin blue/lime ring shimmers round the edge.
 * Click the centred panel to bring it forward; the rest fall away.
 */

const DEFAULT_ITEMS = [
  {
    title: "Vellin Studio",
    category: "Spatial Interface",
    tagline: "Volumetric spatial interface and generative 3D environment engine.",
    description: "An experimental spatial system architected with Next.js and Three.js. Explores non-euclidean viewport transformations, real-time depth mapping, and physical tactile interactions.",
    year: "2026",
    role: "Lead Creative Technologist",
    stack: ["Three.js", "WebGL2", "GLSL Shaders", "Next.js"],
    image: "/placeholder.jpg",
    liveUrl: "https://vellin.studio",
    githubUrl: "https://github.com/SazWhatician/vellin-studio",
  },
  {
    title: "Aura Spatial",
    category: "Sound Architecture",
    tagline: "Binaural sound synthesis engine with physical modal chime resonance.",
    description: "A generative audio architecture utilizing the Web Audio API. Models transverse beam partials and spatial stereo cathedral reverberations synchronized with real-time UI interactions.",
    year: "2026",
    role: "Sound Designer & Engineer",
    stack: ["Web Audio API", "DSP Synthesis", "TypeScript"],
    image: "/placeholder.jpg",
    liveUrl: "https://aura-spatial.dev",
    githubUrl: "https://github.com/SazWhatician/aura-spatial",
  },
  {
    title: "Kroma System",
    category: "Generative System",
    tagline: "Mathematical color harmonization and dynamic chromatic dispersion.",
    description: "Algorithmic chromatic color engine for high-end digital design systems. Dynamically balances perceptual contrast, chromatic aberration caustics, and responsive theme scaling.",
    year: "2025",
    role: "Systems Architect",
    stack: ["Color Science", "Tailwind CSS", "React"],
    image: "/placeholder.jpg",
    liveUrl: "https://kroma.design",
    githubUrl: "https://github.com/SazWhatician/kroma-system",
  },
  {
    title: "Mirai Interface",
    category: "Spatial Interaction",
    tagline: "Ultra-low-latency gestural interfaces for next-generation computing.",
    description: "Multi-modal interface architecture integrating hand tracking, gaze heuristics, and kinetic spring physics into a seamless computing canvas.",
    year: "2025",
    role: "Interaction Designer",
    stack: ["Spatial UI", "WebGL", "TypeScript"],
    image: "/placeholder.jpg",
    liveUrl: "https://mirai-ui.org",
    githubUrl: "https://github.com/SazWhatician/mirai-interface",
  },
  {
    title: "Sora Living",
    category: "Architectural 3D",
    tagline: "Virtual residential spatial galleries engineered with raytraced lighting.",
    description: "Immersive architectural walkthrough platform showcasing high-fidelity material shaders, physically based rendering (PBR), and spatial audio navigation.",
    year: "2025",
    role: "3D Graphics Engineer",
    stack: ["Three.js", "PBR Materials", "WebXR"],
    image: "/placeholder.jpg",
    liveUrl: "https://sora-living.co",
    githubUrl: "https://github.com/SazWhatician/sora-living",
  },
  {
    title: "Elysian Brand",
    category: "Kinetic Identity",
    tagline: "Minimalist luxury digital identity with fluid typography dynamics.",
    description: "A luxury editorial and interactive typography showcase featuring kinetic scroll transforms, variable font weight interpolation, and architectural grid layouts.",
    year: "2025",
    role: "Creative Director",
    stack: ["Next.js", "Variable Fonts", "Lenis", "GSAP"],
    image: "/placeholder.jpg",
    liveUrl: "https://elysian-studio.design",
    githubUrl: "https://github.com/SazWhatician/elysian-brand",
  },
  {
    title: "Nova Spatial XR",
    category: "Extended Reality",
    tagline: "Cross-platform WebXR engine for spatial computing headsets and browsers.",
    description: "Lightweight WebXR spatial workspace bringing interactive 3D nodes, multi-dimensional cards, and tactile spatial inputs directly to browser runtimes.",
    year: "2024",
    role: "XR Architect",
    stack: ["WebXR", "GLTF/GLB", "React Three Fiber"],
    image: "/placeholder.jpg",
    liveUrl: "https://novaspatial.app",
    githubUrl: "https://github.com/SazWhatician/nova-spatial",
  },
  {
    title: "Zenith Architecture",
    category: "Computational Monoliths",
    tagline: "Parametric structural design and generative building morphologies.",
    description: "Algorithmic generation of complex structural monoliths using Voronoi tessellations, stress-tensor calculations, and interactive 3D point cloud inspections.",
    year: "2024",
    role: "Computational Designer",
    stack: ["Parametric Modeling", "Three.js", "Mathematical Shaders"],
    image: "/placeholder.jpg",
    liveUrl: "https://zenith-arch.io",
    githubUrl: "https://github.com/SazWhatician/zenith-architecture",
  },
];

const PANEL_ASPECT = 3 / 4;

// ---------- shaders ----------
const QUAD_VS = `attribute vec2 a; uniform vec4 uRect; uniform vec2 uView; varying vec2 vUv;
void main(){ vUv = vec2(a.x, 1.0 - a.y); vec2 px = uRect.xy + (a - 0.5) * uRect.zw; gl_Position = vec4(px / (uView * 0.5), 0.0, 1.0); }`;
const QUAD_FS = `precision mediump float; uniform sampler2D uTex; uniform vec4 uTile; uniform float uAlpha; varying vec2 vUv;
void main(){ vec4 c = texture2D(uTex, uTile.xy + vUv * uTile.zw); gl_FragColor = vec4(c.rgb, c.a * uAlpha); }`;
const LENS_VS = `attribute vec2 a; varying vec2 vUv; void main(){ vUv = a; gl_Position = vec4(a * 2.0 - 1.0, 0.0, 1.0); }`;
const LENS_FS = `precision highp float;
#define PI 3.14159265
uniform sampler2D uScene; uniform vec2 uRes; uniform vec2 uRadius; uniform float uFx; uniform float uTime; uniform float uShimmer; uniform vec3 uRing;
varying vec2 vUv;
void main(){
  vec2 px = vUv * uRes;
  vec2 c = uRes * 0.5;
  vec2 off = px - c;
  vec2 p = off / uRadius;
  float nd = length(p);
  vec4 base = texture2D(uScene, vUv);
  if (nd > 1.0 || uFx < 0.001) { gl_FragColor = base; return; }
  vec2 rd = normalize(off + 1e-4);
  vec2 td = vec2(-rd.y, rd.x);
  float ang = atan(p.y, p.x);
  float rim = smoothstep(0.58, 1.0, nd);
  float wave = sin(ang * 2.0) * 0.55 + sin(ang) * 0.25;
  float R = (uRadius.x + uRadius.y) * 0.5;
  vec2 bent = px + td * wave * rim * R * 0.32 * uFx;
  vec2 disp = off * 11.0 * 0.004 * smoothstep(0.55, 1.0, nd) * uFx;
  vec3 col = vec3(0.0), w = vec3(0.0);
  float colAlpha = 0.0;
  for (int i = 0; i < 16; i++) {
    float t = float(i) / 15.0;
    vec4 s = texture2D(uScene, (bent + disp * (t - 0.5)) / uRes);
    vec3 k = vec3(exp(-pow(t / 0.38, 2.0)), exp(-pow((t - 0.5) / 0.38, 2.0)), exp(-pow((t - 1.0) / 0.38, 2.0)));
    col += s.rgb * k; w += k;
    colAlpha += s.a * ((k.r + k.g + k.b) / 3.0);
  }
  col /= max(w, vec3(0.001));
  colAlpha /= max((w.r + w.g + w.b) / 3.0, 0.001);
  col *= mix(0.91, 1.0, smoothstep(0.0, 0.38, nd));
  float r2 = nd * nd * 0.25;
  float gs = 0.12;
  col += vec3(exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18) * 0.07 * uFx * clamp(colAlpha * 2.5, 0.0, 1.0);
  float dC = nd * 0.5;
  float ring = exp(-pow((dC - 0.49) / 0.014, 2.0)) * 1.6;
  ring *= mix(1.0, sin(ang * 12.0 + uTime * 3.5) * 0.12 + 0.88, uShimmer);
  float aura = exp(-pow((dC - 0.49) / 0.084, 2.0)) * 0.25;
  col += uRing * (ring + aura) * uFx;
  colAlpha = clamp(colAlpha + (ring + aura) * 0.5 * uFx, 0.0, 1.0);
  col += vec3(exp(-pow((dC - 0.488) / 0.003, 2.0)) * 1.4) * uFx;
  float a = smoothstep(1.0, 0.93, nd);
  vec4 finalLens = vec4(col, colAlpha);
  gl_FragColor = mix(base, finalLens, a);
}`;

function program(gl, vs, fs) {
  const mk = (t, s) => {
    const sh = gl.createShader(t);
    gl.shaderSource(sh, s);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(sh) ?? "shader");
    return sh;
  };
  const p = gl.createProgram();
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link");
  return p;
}

// ---------- tiny tween engine ----------
const E = {
  out3: (t) => 1 - (1 - t) ** 3,
  out4: (t) => 1 - (1 - t) ** 4,
  inOut3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  expoInOut: (t) =>
    t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? 2 ** (20 * t - 10) / 2
          : (2 - 2 ** (-20 * t + 10)) / 2,
};

function hexRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function GlassCarousel({
  items = DEFAULT_ITEMS,
  panelHeight = 450,
  gap = 14,
  theme = "night",
  entry = true,
  motion = "full",
  className = "",
  style = {},
  onActiveChange,
  onFocusChange,
}) {
  const host = useRef(null);
  const canvas = useRef(null);
  const cursor = useRef(null);
  const engine = useRef(null);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [cardMetrics, setCardMetrics] = useState({
    w: 380,
    h: 500,
    screenW: typeof window !== "undefined" ? window.innerWidth : 1200,
    screenH: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  const [shown, setShown] = useState(!entry);
  const [failed, setFailed] = useState(false);
  const [fallbackImgs, setFallbackImgs] = useState([]);
  const labelId = useId();
  const cb = useRef(onActiveChange);
  cb.current = onActiveChange;
  const focusCb = useRef(onFocusChange);
  focusCb.current = onFocusChange;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const hasEntered = useRef(false);

  useEffect(() => {
    const el = host.current,
      cv = canvas.current;
    if (!el || !cv || !items.length) return;
    const gl = cv.getContext("webgl", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    const reduced =
      motion === "reduced" ||
      (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!gl) {
      setFailed(true);
      setFallbackImgs(
        items.map(
          (it, i) =>
            it.image ??
            paintStudy(i * 2 + 5, 360, 480).toDataURL("image/jpeg", 0.85),
        ),
      );
      return;
    }
    let qp, lp;
    try {
      qp = program(gl, QUAD_VS, QUAD_FS);
      lp = program(gl, LENS_VS, LENS_FS);
    } catch {
      setFailed(true);
      return;
    }
    const N = items.length;

    // Unit quad shared by both passes.
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
      gl.STATIC_DRAW,
    );
    const U = (p, n) => gl.getUniformLocation(p, n);
    const uq = {
      rect: U(qp, "uRect"),
      view: U(qp, "uView"),
      tex: U(qp, "uTex"),
      tile: U(qp, "uTile"),
      alpha: U(qp, "uAlpha"),
    };
    const ul = {
      scene: U(lp, "uScene"),
      res: U(lp, "uRes"),
      radius: U(lp, "uRadius"),
      fx: U(lp, "uFx"),
      time: U(lp, "uTime"),
      shimmer: U(lp, "uShimmer"),
      ring: U(lp, "uRing"),
    };

    // Atlas of panels (4 columns).
    const cols = Math.min(4, N),
      rows = Math.ceil(N / cols),
      TW = 420,
      TH = 560;
    const atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = cols * TW;
    atlasCanvas.height = rows * TH;
    const actx = atlasCanvas.getContext("2d");
    const atlas = gl.createTexture();
    const pushAtlas = () => {
      gl.bindTexture(gl.TEXTURE_2D, atlas);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        atlasCanvas,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    items.forEach((it, i) => {
      const x = (i % cols) * TW,
        y = Math.floor(i / cols) * TH;
      const fallbackStudy = paintStudy(i * 2 + 5, TW, TH);
      if (fallbackStudy) {
        actx.drawImage(fallbackStudy, x, y);
      }
      if (it.image) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const s = Math.max(TW / img.width, TH / img.height);
          actx.drawImage(
            img,
            x + (TW - img.width * s) / 2,
            y + (TH - img.height * s) / 2,
            img.width * s,
            img.height * s,
          );
          pushAtlas();
        };
        img.src = it.image;
      }
    });
    pushAtlas();

    const tileOf = (i) =>
      [
        (i % cols) / cols,
        Math.floor(i / cols) / rows,
        1 / cols,
        1 / rows,
      ];

    // Offscreen target for pass one.
    const fb = gl.createFramebuffer();
    const fbTex = gl.createTexture();
    let W = 1,
      H = 1,
      dpr = 1,
      PANEL_H = panelHeight;
    const resize = () => {
      dpr = Math.min((typeof window !== "undefined" && window.devicePixelRatio) || 1, 2);
      W = Math.max(1, el.clientWidth);
      H = Math.max(1, el.clientHeight);
      PANEL_H = Math.max(120, Math.min(panelHeight, Math.round(H * 0.55)));
      setCardMetrics({
        w: Math.round(PANEL_H * 1.15 * PANEL_ASPECT),
        h: Math.round(PANEL_H * 1.15),
        screenW: W,
        screenH: H,
      });
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      gl.bindTexture(gl.TEXTURE_2D, fbTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        cv.width,
        cv.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        fbTex,
        0,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    resize();

    // ---------- state ----------
    const slot = () => PANEL_ASPECT * PANEL_H + gap;
    let scroll = 0,
      target = 0,
      velocity = 0,
      energy = 0,
      prev = 0,
      lastInput = 0,
      snapped = true,
      lastCenter = -1;
    let dragging = false,
      dragX = 0,
      dragDist = 0,
      dragVel = 0,
      dragT = 0,
      suppress = false,
      dragType = "mouse";
    let hover = false,
      pmx = -1,
      pmy = -1,
      inside = false;
    let entering = entry && !reduced && !hasEntered.current;
    const focus = {
      on: false,
      fx: entering ? 0 : 1,
      scale: 1,
      index: -1,
      xOffset: 0,
    };
    const drop = new Float32Array(N * 7);
    const rise = new Float32Array(N * 7).fill(entering ? 0 : 1);
    const grow = new Float32Array(N * 7).fill(entering ? 0 : 1);
    const tweens = [];
    const tween = (get, set, to, dur, delay, ease, done) =>
      tweens.push({
        get,
        set,
        to,
        start: performance.now() + delay * 1000,
        dur: dur * 1000,
        ease,
        done,
      });

    const nearest = (v) => Math.round(v / slot());
    const centreOf = (k) => k * slot();
    const srcOf = (k) => ((k % N) + N) % N;
    const M = N * 7;
    const slotOf = (k) => ((k % M) + M) % M;

    let drawn = [];
    const layout = () => {
      drawn = [];
      const s = slot();
      const shrink = 1 - 0.25 * energy;
      const first = Math.floor((scroll - W / 2) / s) - 1,
        last = Math.ceil((scroll + W / 2) / s) + 1;
      const kc = nearest(scroll);
      for (let k = first; k <= last; k++) {
        const slotIdx = slotOf(k);
        const src = srcOf(k);
        let h = PANEL_H * shrink;
        let x = k * s - scroll;
        let y = 0;
        if (focus.on && k === focus.index) {
          h *= focus.scale;
          x += focus.xOffset;
        } else {
          y = -(drop[slotIdx] || 0) * H * 1.4;
        }
        if (entering || grow[slotIdx] < 1) {
          const gh = (j) => 80 + (PANEL_H - 80) * grow[slotOf(j)];
          let off = 0;
          const di = k - kc;
          for (let j = 0; j < Math.abs(di); j++) {
            const a = kc + Math.sign(di) * j,
              b = a + Math.sign(di);
            off +=
              Math.sign(di) *
              ((PANEL_ASPECT * gh(a) + PANEL_ASPECT * gh(b)) / 2 + gap);
          }
          x = off + (kc * s - scroll);
          h = gh(k);
          y = -H * 0.9 * (1 - rise[slotIdx]);
        }
        const w = h * PANEL_ASPECT;
        if (x + w / 2 < -W / 2 - 20 || x - w / 2 > W / 2 + 20) continue;
        drawn.push({ k, src, x, y, w, h, slotIdx });
      }
    };

    const centred = () =>
      drawn.reduce(
        (b, d) => (!b || Math.abs(d.x) < Math.abs(b.x) ? d : b),
        null,
      );
    const hit = (mx, my) => {
      const x = mx - W / 2,
        y = H / 2 - my;
      return (
        drawn.find(
          (d) => Math.abs(x - d.x) <= d.w / 2 && Math.abs(y - d.y) <= d.h / 2,
        ) ?? null
      );
    };

    // ---------- render ----------
    const render = (now) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(qp);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      const la = gl.getAttribLocation(qp, "a");
      gl.enableVertexAttribArray(la);
      gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlas);
      gl.uniform1i(uq.tex, 0);
      gl.uniform2f(uq.view, W, H);
      for (const d of drawn) {
        gl.uniform4f(uq.rect, d.x, d.y, d.w, d.h);
        gl.uniform4f(uq.tile, ...tileOf(d.src));
        gl.uniform1f(uq.alpha, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(lp);
      const lla = gl.getAttribLocation(lp, "a");
      gl.enableVertexAttribArray(lla);
      gl.vertexAttribPointer(lla, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, fbTex);
      gl.uniform1i(ul.scene, 0);
      gl.uniform2f(ul.res, cv.width, cv.height);
      const lensH = PANEL_H * 0.5 * 0.985,
        lensW = Math.min(W * 0.46, PANEL_H * PANEL_ASPECT * 0.5 * 1.32);
      gl.uniform2f(ul.radius, lensW * dpr, lensH * dpr);
      gl.uniform1f(ul.fx, focus.fx);
      gl.uniform1f(ul.time, now / 1000);
      gl.uniform1f(ul.shimmer, reduced ? 0 : 1);
      // Ring refraction color: luxury warm champagne cashmere gold
      gl.uniform3f(ul.ring, 0.88, 0.73, 0.58);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // ---------- loop ----------
    let raf = 0,
      visible = true,
      alive = true;
    const tick = (now) => {
      raf = 0;
      if (!alive || !visible || document.hidden) return;
      for (let i = tweens.length - 1; i >= 0; i--) {
        const t = tweens[i];
        if (now < t.start) continue;
        if (t.from === undefined) t.from = t.get();
        const k = Math.min(1, (now - t.start) / Math.max(1, t.dur));
        t.set(t.from + (t.to - t.from) * t.ease(k));
        if (k >= 1) {
          tweens.splice(i, 1);
          t.done?.();
        }
      }
      if (!dragging) {
        target += velocity;
        velocity *= 0.865;
        if (Math.abs(velocity) < 0.05) velocity = 0;
        if (!snapped && !focus.on && performance.now() - lastInput > 120) {
          target = centreOf(nearest(scroll));
          snapped = true;
        }
      }
      const follow =
        dragging && dragType !== "mouse"
          ? 0.22
          : reduced
            ? 0.28
            : snapped
              ? 0.05
              : 0.09;
      scroll += (target - scroll) * follow;
      const speed = Math.abs(scroll - prev);
      prev = scroll;
      const n = Math.min(1, speed / 60);
      energy += (n - energy) * (n > energy ? 0.25 : 0.06);
      layout();
      const c = srcOf(nearest(scroll));
      if (c !== lastCenter) {
        const dir = c > lastCenter ? 1 : -1;
        lastCenter = c;
        setActive(c);
        cb.current?.(c);
        if (!entering) {
          cozyAudio.playSnap(c, dir);
        }
      }
      if (inside && dragType === "mouse" && !dragging) {
        const h = !focus.on && !entering && !!hit(pmx, pmy);
        if (h !== hover) {
          hover = h;
          el.dataset.hover = h ? "" : "x";
          if (!h) delete el.dataset.hover;
          if (h) cozyAudio.playHover();
        }
      }
      render(now);
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && alive) raf = requestAnimationFrame(tick);
    };

    // ---------- focus ----------
    let revealTimer = null;

    const calcShift = (w) => {
      if (w < 768) return 0;
      if (w < 1024) return Math.min(220, Math.round(w * 0.18));
      return Math.min(280, Math.round(w * 0.2));
    };

    const ranked = (fromK) =>
      drawn
        .filter((d) => d.k !== fromK)
        .map((d) => ({ d, r: Math.abs(d.k - fromK) }))
        .sort((a, b) => a.r - b.r);
    const open = () => {
      const c = centred();
      if (!c || focus.on) return;
      cozyAudio.playFocus();
      focus.on = true;
      focus.index = c.k;
      focus.xOffset = 0;
      target = centreOf(c.k);
      setRevealed(false);
      tween(
        () => focus.fx,
        (v) => (focus.fx = v),
        0,
        0.85,
        0,
        E.out3,
      );
      tween(
        () => focus.scale,
        (v) => (focus.scale = v),
        1.15,
        0.9,
        0,
        E.out3,
      );
      for (const { d, r } of ranked(c.k))
        tween(
          () => drop[d.slotIdx],
          (v) => (drop[d.slotIdx] = v),
          1,
          0.7,
          (r - 1) * 0.06,
          E.out4,
        );
      setFocused(true);
      focusCb.current?.(true);
      wake();

      // Schedule shift to the left & details reveal after 2 seconds
      if (revealTimer) clearTimeout(revealTimer);
      revealTimer = setTimeout(() => {
        if (!focus.on) return;
        const shift = calcShift(W);
        if (shift > 0) {
          tween(
            () => focus.xOffset,
            (v) => (focus.xOffset = v),
            -shift,
            0.85,
            0,
            E.out4,
          );
        }
        setRevealed(true);
        try {
          cozyAudio.playSnap(2, 1);
        } catch {}
        wake();
      }, 2000);
    };
    const close = () => {
      if (!focus.on) return;
      if (revealTimer) {
        clearTimeout(revealTimer);
        revealTimer = null;
      }
      setRevealed(false);
      cozyAudio.playClose();

      const wasShifted = Math.abs(focus.xOffset) > 1;
      const closeDelay = wasShifted ? 0.35 : 0;

      // 1. Move card back to center first!
      if (wasShifted) {
        tween(
          () => focus.xOffset,
          (v) => (focus.xOffset = v),
          0,
          0.55,
          0,
          E.inOut3,
        );
      }

      // 2. Scale back down and raise the carousel cards back up
      const list = ranked(focus.index).reverse();
      tween(
        () => focus.fx,
        (v) => (focus.fx = v),
        1,
        0.68,
        closeDelay,
        E.inOut3,
      );
      tween(
        () => focus.scale,
        (v) => (focus.scale = v),
        1,
        0.76,
        closeDelay,
        E.out3,
        () => {
          focus.on = false;
          focus.xOffset = 0;
        },
      );
      const maxR = list[0]?.r ?? 0;
      for (const { d, r } of list)
        tween(
          () => drop[d.slotIdx],
          (v) => (drop[d.slotIdx] = v),
          0,
          0.6,
          closeDelay + (maxR - r) * 0.042,
          E.out4,
        );
      setFocused(false);
      focusCb.current?.(false);
      wake();
    };
    const step = (dir) => {
      if (focus.on || entering) return;
      cozyAudio.playSnap(nearest(scroll) + dir, dir);
      velocity = 0;
      target = centreOf(nearest(scroll) + dir);
      snapped = true;
      lastInput = performance.now();
      wake();
    };
    engine.current = { next: () => step(1), prev: () => step(-1), close, wake };

    // ---------- intro ----------
    if (entering) {
      cozyAudio.playEntry();
      layout();
      const vis = drawn.map((d) => d.slotIdx);
      const spread = 0.07 * Math.max(vis.length - 1, 1);
      let riseEnd = 0;
      vis.forEach((s) => {
        const at = 0.5 + Math.random() * spread;
        riseEnd = Math.max(riseEnd, at + 1);
        tween(
          () => rise[s],
          (v) => (rise[s] = v),
          1,
          1,
          at,
          E.out3,
        );
      });
      const growStart = riseEnd + 0.25;
      tween(
        () => focus.fx,
        (v) => (focus.fx = v),
        1,
        1.4,
        growStart,
        E.inOut3,
      );
      const maxR = Math.max(
        ...drawn.map((d) => Math.abs(d.k - nearest(scroll))),
      );
      let growEnd = growStart;
      for (const d of drawn) {
        const at = growStart + (maxR - Math.abs(d.k - nearest(scroll))) * 0.085;
        growEnd = Math.max(growEnd, at + 2.15);
        tween(
          () => grow[d.slotIdx],
          (v) => (grow[d.slotIdx] = v),
          1,
          2.15,
          at,
          E.expoInOut,
        );
      }
      setTimeout(
        () => {
          rise.fill(1);
          grow.fill(1);
          entering = false;
          hasEntered.current = true;
          setShown(true);
        },
        growEnd * 1000 + 30,
      );
    } else {
      hasEntered.current = true;
      setShown(true);
    }

    // ---------- input ----------
    const local = (e) => {
      const r = el.getBoundingClientRect();
      const k = r.width / el.offsetWidth || 1;
      return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
    };
    const onWheel = (e) => {
      if (focus.on || entering) return;
      cozyAudio.unlock();
      e.preventDefault();
      target += (e.deltaY || e.deltaX) * 1.4;
      lastInput = performance.now();
      snapped = false;
      wake();
    };
    const onDown = (e) => {
      suppress = false;
      cozyAudio.unlock();
      if (focus.on || entering || (e.pointerType === "mouse" && e.button !== 0))
        return;
      dragging = true;
      dragType = e.pointerType || "mouse";
      cv.setPointerCapture(e.pointerId);
      dragX = local(e).x;
      dragDist = 0;
      dragVel = 0;
      dragT = performance.now();
      velocity = 0;
      snapped = false;
      el.dataset.dragging = "";
      wake();
    };
    const onMove = (e) => {
      const p = local(e);
      pmx = p.x;
      pmy = p.y;
      inside = true;
      if (cursor.current && e.pointerType === "mouse") {
        cursor.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
      }
      if (dragging) {
        const sens = dragType === "mouse" ? 1.6 : 1;
        const dx = p.x - dragX;
        dragX = p.x;
        dragDist += Math.abs(dx);
        target -= dx * sens;
        dragVel = dragVel * 0.6 - dx * sens * 0.4;
        dragT = lastInput = performance.now();
      }
      wake();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      delete el.dataset.dragging;
      velocity = performance.now() - dragT > 90 ? 0 : dragVel;
      lastInput = performance.now();
      suppress = dragDist > (dragType === "mouse" ? 6 : 12);
      wake();
    };
    const onLeave = () => {
      inside = false;
      hover = false;
      delete el.dataset.hover;
    };
    const onClick = (e) => {
      if (suppress) return void (suppress = false);
      if (focus.on) {
        const p = local(e);
        const h = hit(p.x, p.y);
        // If clicking outside the focused card on the backdrop, close
        if (!h || h.k !== focus.index) {
          close();
        }
        return;
      }
      if (entering) return;
      const p = local(e);
      const h = hit(p.x, p.y);
      if (!h) return;
      const c = centred();
      if (c && h.k === c.k) return open();
      velocity = 0;
      target = centreOf(h.k);
      snapped = true;
      wake();
    };
    cv.addEventListener("wheel", onWheel, { passive: false });
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("click", onClick);
    const ro = new ResizeObserver(() => {
      resize();
      target = scroll = centreOf(nearest(scroll));
      wake();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) wake();
    });
    io.observe(el);
    const onVis = () => !document.hidden && wake();
    document.addEventListener("visibilitychange", onVis);
    wake();

    return () => {
      if (revealTimer) clearTimeout(revealTimer);
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      cv.removeEventListener("wheel", onWheel);
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("click", onClick);
      engine.current = null;
    };
  }, [items, panelHeight, gap, entry, motion]);

  useEffect(() => {
    engine.current?.wake?.();
  }, [theme]);

  const onKeyDown = (e) => {
    cozyAudio.unlock();
    if (e.key === "ArrowRight") engine.current?.next();
    else if (e.key === "ArrowLeft") engine.current?.prev();
    else if (e.key === "Escape") engine.current?.close();
    else return;
    e.preventDefault();
  };

  useEffect(() => {
    if (!focused) return;
    const handleGlobalKey = (e) => {
      if (e.key === "Escape") {
        engine.current?.close();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [focused]);

  const current = items[active] ?? items[0];
  const pad = (n) => String(n).padStart(2, "0");
  const shiftX = revealed
    ? cardMetrics.screenW >= 768
      ? Math.min(280, Math.round(cardMetrics.screenW * 0.2))
      : 0
    : 0;

  return (
    <div
      ref={host}
      className={`gc gc--${theme} ${className}`}
      style={{ background: "transparent", ...style }}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onKeyDown={onKeyDown}
      data-shown={shown ? "" : undefined}
      data-focused={focused ? "" : undefined}
    >
      <p id={labelId} className="gc__sr">
        Project carousel. Use the left and right arrow keys to move, and Escape
        to close a focused project.
      </p>
      <p className="gc__sr" aria-live="polite">
        {current?.title}, {pad(active + 1)} of {pad(items.length)}
        {focused ? ", focused" : ""}
      </p>
      {failed ? (
        <ul className="gc__fallback">
          {items.map((it, i) => (
            <li key={it.title}>
              {fallbackImgs[i] && <img src={fallbackImgs[i]} alt="" />}
              <span>{it.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <canvas ref={canvas} className="gc__canvas" aria-hidden="true" />
      )}
      <p className="gc__title" aria-hidden="true">
        {current?.title}
      </p>
      <p className="gc__count" aria-hidden="true">
        {pad(active + 1)}/{pad(items.length)}
      </p>
      <div ref={cursor} className="gc__cursor" aria-hidden="true">
        View
      </div>

      {/* Sleek Close Button Just Below Isolated Card */}
      {focused && (
        <div
          className="absolute z-30 pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            top: `calc(50% + ${cardMetrics.h / 2}px + 18px)`,
            left: `calc(50% - ${shiftX}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <button
            type="button"
            onClick={() => engine.current?.close()}
            aria-label="Close project preview"
            className={`group flex items-center gap-2 px-4 py-2 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border ${
              theme === "night"
                ? "bg-neutral-900/90 hover:bg-black text-white border-white/20"
                : "bg-white/90 hover:bg-neutral-50 text-neutral-900 border-neutral-200"
            }`}
            onMouseEnter={() => cozyAudio.playHover?.()}
          >
            <span
              className={`size-4 rounded-full flex items-center justify-center transition-colors ${
                theme === "night"
                  ? "bg-neutral-800 group-hover:bg-neutral-700 text-white"
                  : "bg-neutral-100 group-hover:bg-neutral-200 text-neutral-800"
              }`}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Close
            </span>
            <kbd
              className={`hidden sm:inline-block text-[9px] font-mono border px-1 py-0.5 rounded leading-none ${
                theme === "night"
                  ? "text-neutral-400 border-neutral-700"
                  : "text-neutral-500 border-neutral-300"
              }`}
            >
              ESC
            </kbd>
          </button>
        </div>
      )}

      {/* Project Details Reveal on the Right */}
      {focused && (
        <div
          className={`absolute z-20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            revealed
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-8 pointer-events-none"
          }`}
          style={
            cardMetrics.screenW >= 768
              ? {
                  top: "50%",
                  left: `calc(50% - ${shiftX}px + ${cardMetrics.w / 2}px + 36px)`,
                  transform: "translateY(-50%)",
                  width: "min(460px, 42vw)",
                  maxHeight: `${Math.max(cardMetrics.h, 480)}px`,
                }
              : {
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "calc(100vw - 32px)",
                  maxHeight: "85vh",
                }
          }
        >
          <div
            className={`flex flex-col justify-between h-full backdrop-blur-2xl rounded-3xl p-6 sm:p-8 transition-colors duration-500 overflow-y-auto ${
              theme === "night"
                ? "bg-[#060a17]/90 border border-white/15 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
                : "bg-white/95 border border-neutral-200/90 text-neutral-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]"
            }`}
          >
            <div>
              {/* Category & Year */}
              <div
                className={`flex items-center justify-between text-xs font-mono uppercase tracking-widest mb-3 ${
                  theme === "night" ? "text-neutral-400" : "text-neutral-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span
                    className={`font-semibold ${
                      theme === "night" ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {pad(active + 1)} // {current?.category || "SELECTED WORK"}
                  </span>
                </div>
                <span>{current?.year || "2026"}</span>
              </div>

              {/* Title */}
              <h2
                className={`font-['Clash_Display',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] ${
                  theme === "night" ? "text-white" : "text-neutral-900"
                }`}
              >
                {current?.title}
              </h2>

              {/* Tagline */}
              <p
                className={`mt-2 text-sm sm:text-base font-medium leading-snug ${
                  theme === "night" ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                {current?.tagline || "Spatial architecture and interactive system design."}
              </p>

              {/* Divider */}
              <div
                className={`h-px my-4 ${
                  theme === "night" ? "bg-white/10" : "bg-neutral-200/80"
                }`}
              />

              {/* Description */}
              <p
                className={`text-xs sm:text-sm font-light leading-relaxed ${
                  theme === "night" ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                {current?.description || "An experimental spatial system architected with Next.js, Three.js, and WebGL. Explores depth mapping, non-euclidean viewports, and tactile digital interactions."}
              </p>

              {/* Tech Stack Badges */}
              {current?.stack && Array.isArray(current.stack) && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {current.stack.map((tech) => (
                    <span
                      key={tech}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider ${
                        theme === "night"
                          ? "bg-white/10 border border-white/15 text-neutral-200"
                          : "bg-neutral-100/90 border border-neutral-200/70 text-neutral-600"
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions Row: 2 Small Sleek Buttons */}
            <div
              className={`mt-6 pt-4 border-t flex items-center gap-3 ${
                theme === "night" ? "border-white/10" : "border-neutral-100"
              }`}
            >
              {/* Button 1: Live Demo / Visit Site */}
              <a
                href={current?.liveUrl || "https://github.com/SazWhatician"}
                target="_blank"
                rel="noopener noreferrer"
                className={`group/btn inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm hover:scale-105 active:scale-95 no-underline ${
                  theme === "night"
                    ? "bg-white text-neutral-900 hover:bg-neutral-100"
                    : "bg-neutral-900 text-white hover:bg-black"
                }`}
                onMouseEnter={() => cozyAudio.playHover?.()}
                onClick={() => cozyAudio.playSnap?.(3, 1)}
              >
                <span>Live Preview</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>

              {/* Button 2: GitHub Code */}
              <a
                href={current?.githubUrl || "https://github.com/SazWhatician"}
                target="_blank"
                rel="noopener noreferrer"
                className={`group/gh inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm hover:scale-105 active:scale-95 no-underline ${
                  theme === "night"
                    ? "bg-white/10 text-white border border-white/20 hover:border-white/40 hover:bg-white/15"
                    : "bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-900"
                }`}
                onMouseEnter={() => cozyAudio.playHover?.()}
                onClick={() => cozyAudio.playSnap?.(4, 1)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GlassCarousel;
