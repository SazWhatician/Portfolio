"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

const PHI = (1 + Math.sqrt(5)) / 2;
const INV_PHI = 1 / PHI;
const TAU = Math.PI * 2;
const SPIRAL_B = (2 * Math.log(PHI)) / Math.PI;
const GOLDEN_ANGLE = TAU * (1 - INV_PHI);
const ECLIPTIC_TILT = (23.439 * Math.PI) / 180;

const CONFIG = {
  speed: 1,
  enableFirstLoadReveal: true,
  phyllotaxisCount: 55,
};

const PALETTES = {
  home: {
    bgDeep: "#060911",
    bgMid: "#0e1526",
    goldLight: "#fff6df",
    goldMid: "#d9b878",
    goldDeep: "#6b5228",
    auraRgb: [228, 194, 128],
    inkRgb: [250, 238, 210],
    veilRgb: [10, 14, 26],
  },
  projects: {
    bgDeep: "#ece6da",
    bgMid: "#f7f3eb",
    goldLight: "#fffdf7",
    goldMid: "#b48b44",
    goldDeep: "#6c4f20",
    auraRgb: [216, 178, 108],
    inkRgb: [164, 122, 54],
    veilRgb: [245, 241, 232],
  },
  about: {
    bgDeep: "#ded4c4",
    bgMid: "#efe8dc",
    goldLight: "#fff7e4",
    goldMid: "#9c7338",
    goldDeep: "#583e18",
    auraRgb: [194, 148, 82],
    inkRgb: [142, 102, 46],
    veilRgb: [234, 226, 213],
  },
};

function getTargetPalette(path) {
  if (!path) return PALETTES.home;
  if (path.startsWith("/projects")) return PALETTES.projects;
  if (path.startsWith("/about")) return PALETTES.about;
  return PALETTES.home;
}

function hexToRgb01(hex) {
  let c = (hex || "#ffffff").replace("#", "").trim();
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const n = parseInt(c, 16);
  if (Number.isNaN(n)) return { r: 0.9, g: 0.88, b: 0.84 };
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

// =========================================================================
// 1. EXACT GOLDEN-RATIO PLATONIC POLYHEDRA (ICOSAHEDRON + DUAL DODECAHEDRON)
// =========================================================================
function buildPolyhedra() {
  const icoRaw = [
    [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
    [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
  ];
  const icoNorm = Math.hypot(1, PHI);
  const icoVerts = icoRaw.map(([x, y, z]) => [x / icoNorm, y / icoNorm, z / icoNorm]);

  const icoEdges = [];
  for (let i = 0; i < icoVerts.length; i++) {
    for (let j = i + 1; j < icoVerts.length; j++) {
      const d = Math.hypot(
        icoVerts[i][0] - icoVerts[j][0],
        icoVerts[i][1] - icoVerts[j][1],
        icoVerts[i][2] - icoVerts[j][2]
      );
      if (d < 1.12) icoEdges.push([i, j]);
    }
  }

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
      dodRaw.push([s2 * PHI, 0, s1 * INV_PHI]);
    }
  }
  const dodNorm = Math.sqrt(3);
  const dodVerts = dodRaw.map(([x, y, z]) => [
    (x / dodNorm) * INV_PHI,
    (y / dodNorm) * INV_PHI,
    (z / dodNorm) * INV_PHI,
  ]);

  const dodEdges = [];
  const dodAdjMax = (2 * INV_PHI / dodNorm) * INV_PHI * 1.12;
  for (let i = 0; i < dodVerts.length; i++) {
    for (let j = i + 1; j < dodVerts.length; j++) {
      const d = Math.hypot(
        dodVerts[i][0] - dodVerts[j][0],
        dodVerts[i][1] - dodVerts[j][1],
        dodVerts[i][2] - dodVerts[j][2]
      );
      if (d < dodAdjMax) dodEdges.push([i, j]);
    }
  }

  return { icoVerts, icoEdges, dodVerts, dodEdges };
}

const POLYHEDRA = buildPolyhedra();

// Unit Quaternion algebra on SO(3)
function quatFromAxisAngle(ax, ay, az, angle) {
  const half = angle * 0.5;
  const s = Math.sin(half);
  const len = Math.hypot(ax, ay, az) || 1;
  return [(ax / len) * s, (ay / len) * s, (az / len) * s, Math.cos(half)];
}

function quatMul(a, b) {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}

function rotateVecByQuat(v, q) {
  const [vx, vy, vz] = v;
  const [qx, qy, qz, qw] = q;
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  return [
    vx + qw * tx + (qy * tz - qz * ty),
    vy + qw * ty + (qz * tx - qx * tz),
    vz + qw * tz + (qx * ty - qy * tx),
  ];
}

// =========================================================================
// 2. WEBGL CONFORMAL GOLDEN-SPIRAL IRIS & CHIAROSCURO SHADER (GLSL ES 1.0)
// =========================================================================
const VERT_SRC = `
  attribute vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG_SRC = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  uniform vec2  u_res;
  uniform float u_time;
  uniform float u_cover;
  uniform float u_reveal;
  uniform float u_twist;
  uniform float u_aura;
  uniform vec2  u_bias;

  uniform vec3  u_bgDeep;
  uniform vec3  u_bgMid;
  uniform vec3  u_goldLight;
  uniform vec3  u_goldMid;
  uniform vec3  u_goldDeep;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.52;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = ROT * p * 2.02 + vec2(11.7, 23.4);
      a *= 0.48;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    float minRes = max(min(u_res.x, u_res.y), 1.0);
    vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / minRes;

    // Exact corner-normalized radius so 21:9 & portrait screens seal 100% cleanly
    float maxR = length(0.5 * u_res) / minRes;
    float r = length(p);
    float rn = r / maxR;
    float theta = atan(p.y, p.x);

    // Conformal logarithmic golden-ratio spiral modulation (pitch 1/b = 3.26425)
    float logR = log(max(rn, 0.0035));
    float spiral5 = sin(theta * 5.0 - logR * 3.26425 + u_twist);
    float spiral8 = cos(theta * 8.0 + logR * 2.01742 - u_twist * 0.618);
    float harmonic = (spiral5 * 0.085 + spiral8 * 0.032) * smoothstep(0.0, 0.16, rn);

    float velIn  = sin(clamp(u_cover,  0.0, 1.0) * 3.14159265);
    float velOut = sin(clamp(u_reveal, 0.0, 1.0) * 3.14159265);

    // Closing: golden iris sweeps smoothly INWARD from perimeter to singularity
    float fieldIn = (1.0 - rn) + harmonic * velIn;
    float frontIn = mix(-0.24, 1.24, u_cover);
    float featherIn = mix(0.012, 0.078, velIn);
    float distIn = fieldIn - frontIn;
    float maskIn = smoothstep(featherIn, -featherIn, distIn);

    // Opening: camera-obscura golden iris dilates cleanly OUTWARD from center
    float fieldOut = rn + harmonic * velOut;
    float frontOut = mix(-0.24, 1.24, u_reveal);
    float featherOut = mix(0.012, 0.085, velOut);
    float distOut = fieldOut - frontOut;
    float maskOut = smoothstep(-featherOut, featherOut, distOut);

    float alpha = clamp(maskIn * maskOut, 0.0, 1.0);
    if (alpha < 0.001) {
      gl_FragColor = vec4(0.0);
      return;
    }

    // Painterly Renaissance chiaroscuro plaster / velvet material
    vec2 drift = vec2(u_time * 0.04, -u_time * 0.055);
    vec2 q = vec2(fbm(p * 1.65 + drift), fbm(p * 1.65 + vec2(4.2, -2.8) - drift * 0.6));
    float pigment = fbm(p * 1.9 + q * 0.9);

    // Directional chiaroscuro light steered softly by click origin
    vec2 lightPos = u_bias * 0.24 + vec2(0.06, 0.08);
    float lightDist = length(p - lightPos);
    float chiaroscuro = exp(-lightDist * lightDist * 2.15);

    vec3 col = mix(u_bgDeep, u_bgMid, clamp(pigment * 0.58 + chiaroscuro * 0.52, 0.0, 1.0));

    // Whisper-subtle conformal caustic filaments embedded in the material (4% contrast)
    float caustic = pow(0.5 + 0.5 * sin(logR * 6.5285 - theta * 2.0 + u_twist * 0.5), 6.0);
    float causticMask = exp(-r * r * 2.8) * (0.35 + 0.65 * u_aura);
    col = mix(col, u_goldMid, caustic * causticMask * 0.085);

    // Warm Renaissance golden corona radiating softly from the polyhedron core
    float corona = exp(-r * r * 5.2) * u_aura;
    float halo = exp(-r * r * 1.45) * u_aura;
    col += u_goldLight * corona * 0.22 + u_goldMid * halo * 0.09;

    // Anisotropic brushed 24k gold caustic meniscus along the moving aperture lip
    float aniso = 0.55 + 0.45 * pow(0.5 + 0.5 * cos(2.0 * theta - u_twist * 0.8), 2.0);
    float rimIn  = exp(-pow((distIn  + 0.006) * 26.0, 2.0)) * velIn;
    float rimOut = exp(-pow((distOut - 0.006) * 24.0, 2.0)) * velOut;
    float rim = clamp(rimIn + rimOut, 0.0, 1.0);

    float hairIn  = exp(-pow((distIn  + 0.001) * 95.0, 2.0)) * velIn;
    float hairOut = exp(-pow((distOut - 0.001) * 90.0, 2.0)) * velOut;
    float hairline = clamp(hairIn + hairOut, 0.0, 1.0);

    col = mix(col, mix(u_goldDeep, u_goldMid, aniso), rim * 0.52);
    col = mix(col, u_goldLight, hairline * (0.45 + 0.45 * aniso));

    // Soft museum edge vignette
    float vig = 1.0 - smoothstep(0.52, 1.22, rn) * 0.16;
    col *= vig;

    // Filmic soft shoulder + triangular-PDF dither (eliminates 8-bit banding)
    col = col / (1.0 + col * 0.12);
    float dither = (hash(gl_FragCoord.xy + fract(u_time) * 31.0) + hash(gl_FragCoord.xy + 17.3) - 1.0) * (1.6 / 255.0);
    col = clamp(col + dither, 0.0, 1.0);

    // Premultiplied alpha output eliminates dark edge halos across all browsers
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

export default function AureaSectioTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const stageRef = useRef(null);
  const glCanvasRef = useRef(null);
  const vecCanvasRef = useRef(null);

  const glEngineRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const activeTlRef = useRef(null);
  const failsafeRef = useRef(null);

  const isTransitioningRef = useRef(false);
  const pendingRevealRef = useRef(false);
  const isFirstMountRef = useRef(true);
  const currentPathRef = useRef(pathname);
  const prefetchedRef = useRef(new Set());

  const pointerRef = useRef({ nx: 0, ny: 0 });

  // Unified real-time mathematical state animated smoothly by GSAP
  const stateRef = useRef({
    time: 0,
    cover: 0,
    reveal: 0,
    twist: 0,
    aura: 0,
    geoAlpha: 0,
    spiralDraw: 0,
    spiralErase: 0,
    polyScale: 0.72,
    polyRot: 0,
    ringRot: 0,
    frameAlpha: 0,
    biasX: 0,
    biasY: 0,
    bgDeep: hexToRgb01(PALETTES.home.bgDeep),
    bgMid: hexToRgb01(PALETTES.home.bgMid),
    goldLight: hexToRgb01(PALETTES.home.goldLight),
    goldMid: hexToRgb01(PALETTES.home.goldMid),
    goldDeep: hexToRgb01(PALETTES.home.goldDeep),
    inkR: PALETTES.home.inkRgb[0],
    inkG: PALETTES.home.inkRgb[1],
    inkB: PALETTES.home.inkRgb[2],
    auraR: PALETTES.home.auraRgb[0],
    auraG: PALETTES.home.auraRgb[1],
    auraB: PALETTES.home.auraRgb[2],
    veilR: PALETTES.home.veilRgb[0],
    veilG: PALETTES.home.veilRgb[1],
    veilB: PALETTES.home.veilRgb[2],
  });

  function clearFailsafe() {
    if (failsafeRef.current) {
      clearTimeout(failsafeRef.current);
      failsafeRef.current = null;
    }
  }

  function syncPalette(palette, dur = 0) {
    const s = stateRef.current;
    const targets = {
      bgDeep: hexToRgb01(palette.bgDeep),
      bgMid: hexToRgb01(palette.bgMid),
      goldLight: hexToRgb01(palette.goldLight),
      goldMid: hexToRgb01(palette.goldMid),
      goldDeep: hexToRgb01(palette.goldDeep),
    };

    if (dur === 0) {
      Object.assign(s.bgDeep, targets.bgDeep);
      Object.assign(s.bgMid, targets.bgMid);
      Object.assign(s.goldLight, targets.goldLight);
      Object.assign(s.goldMid, targets.goldMid);
      Object.assign(s.goldDeep, targets.goldDeep);
      [s.inkR, s.inkG, s.inkB] = palette.inkRgb;
      [s.auraR, s.auraG, s.auraB] = palette.auraRgb;
      [s.veilR, s.veilG, s.veilB] = palette.veilRgb;
      return;
    }

    gsap.to(s.bgDeep, { ...targets.bgDeep, duration: dur, ease: "sine.inOut" });
    gsap.to(s.bgMid, { ...targets.bgMid, duration: dur, ease: "sine.inOut" });
    gsap.to(s.goldLight, { ...targets.goldLight, duration: dur, ease: "sine.inOut" });
    gsap.to(s.goldMid, { ...targets.goldMid, duration: dur, ease: "sine.inOut" });
    gsap.to(s.goldDeep, { ...targets.goldDeep, duration: dur, ease: "sine.inOut" });
    gsap.to(s, {
      inkR: palette.inkRgb[0],
      inkG: palette.inkRgb[1],
      inkB: palette.inkRgb[2],
      auraR: palette.auraRgb[0],
      auraG: palette.auraRgb[1],
      auraB: palette.auraRgb[2],
      veilR: palette.veilRgb[0],
      veilG: palette.veilRgb[1],
      veilB: palette.veilRgb[2],
      duration: dur,
      ease: "sine.inOut",
    });
  }

  // =========================================================================
  // 3. WEBGL INITIALIZER
  // =========================================================================
  function initWebGL(canvas) {
    if (!canvas) return null;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) return null;

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return null;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return null;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      cover: gl.getUniformLocation(prog, "u_cover"),
      reveal: gl.getUniformLocation(prog, "u_reveal"),
      twist: gl.getUniformLocation(prog, "u_twist"),
      aura: gl.getUniformLocation(prog, "u_aura"),
      bias: gl.getUniformLocation(prog, "u_bias"),
      bgDeep: gl.getUniformLocation(prog, "u_bgDeep"),
      bgMid: gl.getUniformLocation(prog, "u_bgMid"),
      goldLight: gl.getUniformLocation(prog, "u_goldLight"),
      goldMid: gl.getUniformLocation(prog, "u_goldMid"),
      goldDeep: gl.getUniformLocation(prog, "u_goldDeep"),
    };

    return { gl, u };
  }

  // =========================================================================
  // 4. HIGH-DPI 2D MATHEMATICAL DRAFTING ENGINE
  //    (Pacioli Icosahedron/Dodecahedron + Oblique Armillary + Golden Spirals)
  // =========================================================================
  function drawVectorGeometry(ctx, W, H, s) {
    ctx.clearRect(0, 0, W, H);

    // Graceful solid chiaroscuro fallback if WebGL is disabled
    if (!glEngineRef.current) {
      const veilAlpha = Math.max(0, Math.min(1, s.cover * (1 - s.reveal)));
      if (veilAlpha > 0.002) {
        ctx.fillStyle = `rgba(${s.veilR | 0}, ${s.veilG | 0}, ${s.veilB | 0}, ${veilAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    const masterGeo = s.geoAlpha;
    if (masterGeo <= 0.002) return;

    const cx = W * 0.5;
    const cy = H * 0.5;
    const minDim = Math.min(W, H);
    const baseR = minDim * 0.255;

    const gR = Math.round(s.goldMid.r * 255);
    const gG = Math.round(s.goldMid.g * 255);
    const gB = Math.round(s.goldMid.b * 255);

    const lR = Math.round(s.goldLight.r * 255);
    const lG = Math.round(s.goldLight.g * 255);
    const lB = Math.round(s.goldLight.b * 255);

    const dR = Math.round(s.goldDeep.r * 255);
    const dG = Math.round(s.goldDeep.g * 255);
    const dB = Math.round(s.goldDeep.b * 255);

    const rgbaGold = (a) => `rgba(${gR},${gG},${gB},${(a * masterGeo).toFixed(4)})`;
    const rgbaLight = (a) => `rgba(${lR},${lG},${lB},${(a * masterGeo).toFixed(4)})`;
    const rgbaDeep = (a) => `rgba(${dR},${dG},${dB},${(a * masterGeo).toFixed(4)})`;

    // -----------------------------------------------------------------------
    // A. Whisper-Quiet Folio Margin & Golden Harmonic Chords
    // -----------------------------------------------------------------------
    if (s.frameAlpha > 0.004) {
      const fA = s.frameAlpha * masterGeo;
      const pad = Math.max(16, Math.min(30, minDim * 0.024));

      ctx.save();
      ctx.lineWidth = 0.65;
      ctx.strokeStyle = `rgba(${gR},${gG},${gB},${(0.22 * fA).toFixed(4)})`;
      ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

      // Subtle primary Golden Ratio cross-chords (W/phi, H/phi)
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = `rgba(${gR},${gG},${gB},${(0.11 * fA).toFixed(4)})`;
      ctx.beginPath();
      const gx1 = W * INV_PHI;
      const gx2 = W * (1 - INV_PHI);
      const gy1 = H * INV_PHI;
      const gy2 = H * (1 - INV_PHI);
      ctx.moveTo(gx1, pad); ctx.lineTo(gx1, H - pad);
      ctx.moveTo(gx2, pad); ctx.lineTo(gx2, H - pad);
      ctx.moveTo(pad, gy1); ctx.lineTo(W - pad, gy1);
      ctx.moveTo(pad, gy2); ctx.lineTo(W - pad, gy2);
      ctx.stroke();

      // 4 Precision Corner Registration Crosshairs
      const tick = 9;
      ctx.lineWidth = 0.85;
      ctx.strokeStyle = `rgba(${lR},${lG},${lB},${(0.45 * fA).toFixed(4)})`;
      ctx.beginPath();
      const corners = [
        [pad, pad],
        [W - pad, pad],
        [W - pad, H - pad],
        [pad, H - pad],
      ];
      for (const [x, y] of corners) {
        ctx.moveTo(x - tick, y); ctx.lineTo(x + tick, y);
        ctx.moveTo(x, y - tick); ctx.lineTo(x, y + tick);
      }
      ctx.stroke();
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // B. Concentric Vitruvian Golden Rings & 120-Tick Celestial Astrolabe
    // -----------------------------------------------------------------------
    const ringScale = 0.88 + 0.12 * s.polyScale;
    const astrolabeR = baseR * 1.38 * ringScale;

    ctx.save();
    // Concentric phi-ratio circles: R*phi, R, R/phi, R/phi^2
    const goldenRadii = [
      { r: astrolabeR * 1.12, w: 0.5, a: 0.14 },
      { r: astrolabeR, w: 0.8, a: 0.34 },
      { r: astrolabeR * INV_PHI, w: 0.7, a: 0.28 },
      { r: astrolabeR * INV_PHI * INV_PHI, w: 0.55, a: 0.22 },
    ];
    for (const ring of goldenRadii) {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, TAU);
      ctx.lineWidth = ring.w;
      ctx.strokeStyle = rgbaGold(ring.a);
      ctx.stroke();
    }

    // Engraved 120-tick vernier celestial dial rotating gently
    ctx.beginPath();
    for (let i = 0; i < 120; i++) {
      const ang = (i / 120) * TAU + s.ringRot * 0.35;
      const isCardinal = i % 30 === 0;
      const isDec = i % 10 === 0;
      const len = isCardinal ? 11 : isDec ? 6 : 2.6;
      const r0 = astrolabeR + 3;
      const r1 = r0 + len;
      ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
      ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
    }
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = rgbaGold(0.38);
    ctx.stroke();
    ctx.restore();

    // -----------------------------------------------------------------------
    // C. Vogel Golden-Angle Phyllotaxis Field (55 Botanical Starlight Motes)
    // -----------------------------------------------------------------------
    ctx.save();
    const phyloSpread = astrolabeR * 1.06;
    for (let n = 1; n <= CONFIG.phyllotaxisCount; n++) {
      const frac = n / CONFIG.phyllotaxisCount;
      const rad = Math.sqrt(frac) * phyloSpread * (0.76 + 0.24 * s.polyScale);
      const ang = n * GOLDEN_ANGLE + s.ringRot * 0.22;
      const x = cx + Math.cos(ang) * rad;
      const y = cy + Math.sin(ang) * rad;
      const pulse = 0.45 + 0.55 * Math.sin(s.time * 2.4 + n * 0.7);
      const dotR = (0.7 + (1 - frac) * 1.15) * (0.8 + 0.2 * pulse);

      ctx.beginPath();
      ctx.arc(x, y, dotR, 0, TAU);
      ctx.fillStyle = rgbaLight((0.18 + 0.42 * (1 - frac)) * pulse * s.aura);
      ctx.fill();
    }
    ctx.restore();

    // -----------------------------------------------------------------------
    // D. 3D Projected Oblique Armillary Great Circles (SO(3) Quaternions)
    // -----------------------------------------------------------------------
    const qYaw = quatFromAxisAngle(0, 1, 0, s.polyRot + s.biasX * 0.45);
    const qPitch = quatFromAxisAngle(1, 0, 0, 0.34 + s.polyRot * 0.38 + s.biasY * 0.35);
    const qRoll = quatFromAxisAngle(0, 0, 1, -0.18 + s.ringRot * 0.16);
    const qMain = quatMul(quatMul(qYaw, qPitch), qRoll);

    const zCam = 4.2;
    const focal = baseR * 4.05 * s.polyScale;

    const project3D = (v) => {
      const [x, y, z] = rotateVecByQuat(v, qMain);
      const denom = Math.max(0.55, zCam - z);
      const k = focal / denom;
      return { x: cx + x * k, y: cy + y * k, z };
    };

    // 3 Mutually-Inclined Armillary Bands (Equatorial, Ecliptic 23.44 deg, Meridian)
    const armillaryTilt = [
      { rx: 0, rz: 0, r: 1.24, w: 0.72, op: 0.36 },
      { rx: ECLIPTIC_TILT, rz: 0.42, r: 1.15, w: 0.65, op: 0.30 },
      { rx: Math.PI * 0.5, rz: s.ringRot * 0.45, r: 1.07, w: 0.55, op: 0.22 },
    ];

    const segs = 72;
    for (const band of armillaryTilt) {
      const qBand = quatMul(
        quatFromAxisAngle(1, 0, 0, band.rx),
        quatFromAxisAngle(0, 0, 1, band.rz)
      );
      const pts = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * TAU;
        const local = rotateVecByQuat([Math.cos(a) * band.r, 0, Math.sin(a) * band.r], qBand);
        pts.push(project3D(local));
      }

      for (let i = 0; i < segs; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const avgZ = (p0.z + p1.z) * 0.5;
        const depth01 = Math.max(0, Math.min(1, (avgZ + 1.3) / 2.6));
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineWidth = band.w * (0.65 + 0.55 * depth01);
        ctx.strokeStyle = depth01 > 0.55
          ? rgbaLight(band.op * (0.4 + 0.9 * depth01))
          : rgbaDeep(band.op * (0.28 + 0.5 * depth01));
        ctx.stroke();
      }
    }

    // -----------------------------------------------------------------------
    // E. Pacioli's 3D Golden Icosahedron & Nested Dual Dodecahedron
    // -----------------------------------------------------------------------
    const projIco = POLYHEDRA.icoVerts.map(project3D);
    const projDod = POLYHEDRA.dodVerts.map(project3D);

    // Collect & painter-sort edges back-to-front for razor-clean chiaroscuro depth
    const drawEdges = [];

    for (const [i, j] of POLYHEDRA.dodEdges) {
      const p0 = projDod[i];
      const p1 = projDod[j];
      drawEdges.push({ p0, p1, z: (p0.z + p1.z) * 0.5, isOuter: false });
    }
    for (const [i, j] of POLYHEDRA.icoEdges) {
      const p0 = projIco[i];
      const p1 = projIco[j];
      drawEdges.push({ p0, p1, z: (p0.z + p1.z) * 0.5, isOuter: true });
    }

    drawEdges.sort((a, b) => a.z - b.z);

    // Subtle directional museum light vector in screen space
    const lx = 0.58;
    const ly = -0.81;

    for (const e of drawEdges) {
      const depth01 = Math.max(0, Math.min(1, (e.z + 1.05) / 2.1));
      const dx = e.p1.x - e.p0.x;
      const dy = e.p1.y - e.p0.y;
      const len = Math.hypot(dx, dy) || 1;
      const spec = Math.abs((-dy / len) * lx + (dx / len) * ly);

      ctx.beginPath();
      ctx.moveTo(e.p0.x, e.p0.y);
      ctx.lineTo(e.p1.x, e.p1.y);

      if (e.isOuter) {
        ctx.lineWidth = 0.55 + depth01 * 0.85;
        const op = 0.14 + depth01 * depth01 * (0.58 + 0.24 * spec);
        ctx.strokeStyle = depth01 > 0.62 ? rgbaLight(op) : rgbaGold(op);
      } else {
        ctx.lineWidth = 0.45 + depth01 * 0.45;
        const op = 0.08 + depth01 * 0.34;
        ctx.strokeStyle = rgbaGold(op);
      }
      ctx.stroke();
    }

    // Subtle specular star-pins on front-facing Icosahedron vertices
    for (const v of projIco) {
      const depth01 = Math.max(0, Math.min(1, (v.z + 1.0) / 2.0));
      if (depth01 < 0.42) continue;
      const pin = 1.6 + depth01 * 2.4;
      const op = (depth01 - 0.35) * 1.15;

      ctx.beginPath();
      ctx.moveTo(v.x - pin, v.y); ctx.lineTo(v.x + pin, v.y);
      ctx.moveTo(v.x, v.y - pin); ctx.lineTo(v.x, v.y + pin);
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = rgbaLight(op * 0.72);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(v.x, v.y, 1.0 + depth01 * 0.8, 0, TAU);
      ctx.fillStyle = rgbaLight(op * 0.9);
      ctx.fill();
    }

    // -----------------------------------------------------------------------
    // F. Exact Analytical Twin Golden Logarithmic Spirals (r = r0 * e^(b*theta))
    // -----------------------------------------------------------------------
    const tStart = s.spiralErase;
    const tEnd = s.spiralDraw;
    if (tEnd - tStart > 0.005) {
      const maxTheta = 4.65 * Math.PI;
      const rOuter = Math.hypot(W, H) * 0.58;
      const steps = 150;
      const thetaMin = maxTheta * (1 - tEnd);
      const thetaMax = maxTheta * (1 - tStart);

      const drawLogSpiral = (phaseOffset, width, alpha, isPrimary) => {
        ctx.beginPath();
        let tipX = cx;
        let tipY = cy;

        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const th = thetaMax - u * (thetaMax - thetaMin);
          const rad = rOuter * Math.exp(-SPIRAL_B * (maxTheta - th));
          const ang = th + phaseOffset + s.ringRot * 0.5;
          const x = cx + Math.cos(ang) * rad;
          const y = cy + Math.sin(ang) * rad;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          tipX = x;
          tipY = y;
        }

        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.strokeStyle = isPrimary ? rgbaLight(alpha) : rgbaGold(alpha);
        ctx.stroke();

        // Refined luminous stylus spark at the leading mathematical tangent
        if (isPrimary && tEnd > 0.04 && tEnd < 0.99 && tStart < 0.05) {
          const flare = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 18);
          flare.addColorStop(0, `rgba(${lR},${lG},${lB},${(0.95 * masterGeo).toFixed(4)})`);
          flare.addColorStop(0.35, `rgba(${gR},${gG},${gB},${(0.45 * masterGeo).toFixed(4)})`);
          flare.addColorStop(1, `rgba(${gR},${gG},${gB},0)`);
          ctx.fillStyle = flare;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 18, 0, TAU);
          ctx.fill();
        }
      };

      // Primary Hero Golden Spiral + Gossamer 180-deg Conjugate Harmonic Twin
      drawLogSpiral(0.45, 1.35, 0.86, true);
      drawLogSpiral(0.45 + Math.PI, 0.65, 0.24, false);
    }

    // -----------------------------------------------------------------------
    // G. Central Golden Singularity Pinpoint
    // -----------------------------------------------------------------------
    if (s.aura > 0.02) {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24 * s.aura + 4);
      grad.addColorStop(0, `rgba(${lR},${lG},${lB},${(0.85 * s.aura * masterGeo).toFixed(4)})`);
      grad.addColorStop(0.3, `rgba(${gR},${gG},${gB},${(0.28 * s.aura * masterGeo).toFixed(4)})`);
      grad.addColorStop(1, `rgba(${gR},${gG},${gB},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 24 * s.aura + 4, 0, TAU);
      ctx.fill();
    }
  }

  // =========================================================================
  // 5. ZERO-IDLE UNIFIED RENDER LOOP
  // =========================================================================
  function renderFrame(ts) {
    const dt = lastTsRef.current ? Math.min((ts - lastTsRef.current) / 1000, 0.05) : 0.016;
    lastTsRef.current = ts;
    const s = stateRef.current;
    s.time += dt;

    const engine = glEngineRef.current;
    const glCanvas = glCanvasRef.current;
    if (engine && glCanvas) {
      const { gl, u } = engine;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(u.res, glCanvas.width, glCanvas.height);
      gl.uniform1f(u.time, s.time);
      gl.uniform1f(u.cover, s.cover);
      gl.uniform1f(u.reveal, s.reveal);
      gl.uniform1f(u.twist, s.twist);
      gl.uniform1f(u.aura, s.aura);
      gl.uniform2f(u.bias, s.biasX, s.biasY);

      gl.uniform3f(u.bgDeep, s.bgDeep.r, s.bgDeep.g, s.bgDeep.b);
      gl.uniform3f(u.bgMid, s.bgMid.r, s.bgMid.g, s.bgMid.b);
      gl.uniform3f(u.goldLight, s.goldLight.r, s.goldLight.g, s.goldLight.b);
      gl.uniform3f(u.goldMid, s.goldMid.r, s.goldMid.g, s.goldMid.b);
      gl.uniform3f(u.goldDeep, s.goldDeep.r, s.goldDeep.g, s.goldDeep.b);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const vecCanvas = vecCanvasRef.current;
    if (vecCanvas) {
      const ctx = vecCanvas.getContext("2d");
      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = vecCanvas.width / dpr;
        const H = vecCanvas.height / dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawVectorGeometry(ctx, W, H, s);
      }
    }

    rafRef.current = requestAnimationFrame(renderFrame);
  }

  function startRender() {
    if (stageRef.current) stageRef.current.classList.add("is-active");
    if (rafRef.current !== null) return;
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(renderFrame);
  }

  function stopRender() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (stageRef.current) stageRef.current.classList.remove("is-active");
  }

  // =========================================================================
  // 6. CHOREOGRAPHY: CONFORMAL ENFOLD -> EQUILIBRIUM -> CAMERA-OBSCURA UNVEIL
  // =========================================================================
  function coverScreen(fromPalette, toPalette, onDone) {
    if (activeTlRef.current) activeTlRef.current.kill();

    syncPalette(fromPalette, 0);

    const s = stateRef.current;
    s.cover = 0;
    s.reveal = 0;
    s.twist = 0;
    s.aura = 0;
    s.geoAlpha = 0;
    s.spiralDraw = 0;
    s.spiralErase = 0;
    s.polyScale = 0.68;
    s.polyRot = -0.75;
    s.ringRot = 0;
    s.frameAlpha = 0;
    s.biasX = pointerRef.current.nx;
    s.biasY = pointerRef.current.ny;

    startRender();

    const mainEl = document.querySelector("main");
    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        if (onDone) onDone();
      },
    });
    tl.timeScale(CONFIG.speed);
    activeTlRef.current = tl;

    // 1. Outgoing page softly recedes into chiaroscuro depth
    if (mainEl) {
      tl.to(mainEl, {
        scale: 0.982,
        opacity: 0.42,
        filter: "blur(4px)",
        duration: 0.72,
        ease: "power3.inOut",
      }, 0);
    }

    // 2. Conformal Golden-Spiral Iris sweeps smoothly inward to seal the viewport
    tl.to(s, { cover: 1, duration: 0.82, ease: "expo.inOut" }, 0);
    tl.to(s, { twist: 2.35, duration: 0.86, ease: "power2.inOut" }, 0);

    // 3. Pacioli 3D Polyhedron, Armillary & Twin Logarithmic Spirals materialize gracefully
    tl.to(s, { geoAlpha: 1, duration: 0.42, ease: "power2.out" }, 0.08);
    tl.to(s, { frameAlpha: 1, duration: 0.48, ease: "power2.out" }, 0.16);
    tl.to(s, { polyScale: 1.0, duration: 0.84, ease: "expo.out" }, 0.06);
    tl.to(s, { polyRot: 0.52, duration: 0.86, ease: "power2.inOut" }, 0);
    tl.to(s, { ringRot: 0.85, duration: 0.86, ease: "power2.out" }, 0);
    tl.to(s, { spiralDraw: 1, duration: 0.72, ease: "power3.inOut" }, 0.12);
    tl.to(s, { aura: 1, duration: 0.62, ease: "sine.inOut" }, 0.24);

    // Cross-morph seamlessly into destination Renaissance pigment once fully veiled
    tl.call(() => syncPalette(toPalette, 0.42), null, 0.46);

    return tl;
  }

  function revealScreen(targetPalette, isInitialOrPop = false, onDone) {
    if (activeTlRef.current) activeTlRef.current.kill();
    clearFailsafe();

    syncPalette(targetPalette, isInitialOrPop ? 0 : 0.35);

    const s = stateRef.current;
    if (isInitialOrPop) {
      s.cover = 1;
      s.reveal = 0;
      s.twist = 2.1;
      s.aura = 0.92;
      s.geoAlpha = 1;
      s.spiralDraw = 1;
      s.spiralErase = 0;
      s.polyScale = 1.0;
      s.polyRot = 0.35;
      s.ringRot = 0.6;
      s.frameAlpha = 0.9;
      s.biasX = 0;
      s.biasY = 0;
      startRender();
    }

    const mainEl = document.querySelector("main");
    const revealItems = document.querySelectorAll("main [data-reveal]");
    const revealImgs = document.querySelectorAll("main [data-reveal-img]");

    if (mainEl) {
      gsap.set(mainEl, { scale: 1.022, y: 18, opacity: 0, filter: "blur(5px)" });
    }
    if (revealItems.length) {
      gsap.set(revealItems, { y: 26, opacity: 0 });
    }
    if (revealImgs.length) {
      gsap.set(revealImgs, { clipPath: "inset(8% 0% 0% 0%)", opacity: 0 });
      revealImgs.forEach((box) => {
        const media = box.querySelector("img, video");
        if (media) gsap.set(media, { scale: 1.08 });
      });
    }

    const startAt = isInitialOrPop ? 0.12 : 0.02;
    const dur = isInitialOrPop ? 1.08 : 0.94;

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        isTransitioningRef.current = false;
        s.cover = 0;
        s.reveal = 0;
        s.geoAlpha = 0;
        s.aura = 0;
        stopRender();
        if (mainEl) gsap.set(mainEl, { clearProps: "transform,opacity,filter" });
        if (onDone) onDone();
      },
    });
    tl.timeScale(CONFIG.speed);
    activeTlRef.current = tl;

    // 1. Conformal Golden-Spiral Aperture dilates open outward like a camera obscura
    tl.to(s, { reveal: 1, duration: dur, ease: "expo.inOut" }, startAt);
    tl.to(s, { twist: s.twist + 2.5, duration: dur, ease: "power2.inOut" }, startAt);

    // 2. 3D Polyhedron glides past the camera frustum while spirals unspool into light
    tl.to(s, { polyScale: 1.48, duration: dur * 0.88, ease: "power3.in" }, startAt);
    tl.to(s, { polyRot: s.polyRot + 1.25, duration: dur, ease: "power2.inOut" }, startAt);
    tl.to(s, { ringRot: s.ringRot + 1.15, duration: dur, ease: "power2.in" }, startAt);
    tl.to(s, { spiralErase: 1, duration: dur * 0.72, ease: "power3.inOut" }, startAt);
    tl.to(s, { frameAlpha: 0, duration: dur * 0.45, ease: "power2.in" }, startAt + 0.04);
    tl.to(s, { aura: 0, duration: dur * 0.65, ease: "power2.out" }, startAt + 0.06);
    tl.to(s, { geoAlpha: 0, duration: dur * 0.62, ease: "power2.in" }, startAt + dur * 0.24);

    // 3. Incoming page emerges from the golden aperture into razor focus
    if (mainEl) {
      tl.to(mainEl, {
        scale: 1,
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.96,
        ease: "expo.out",
      }, startAt + 0.24);
    }

    if (revealItems.length) {
      tl.to(revealItems, {
        y: 0,
        opacity: 1,
        duration: 0.88,
        stagger: 0.055,
        ease: "expo.out",
        clearProps: "transform,opacity",
      }, startAt + 0.34);
    }

    if (revealImgs.length) {
      tl.to(revealImgs, {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.96,
        stagger: 0.07,
        ease: "expo.out",
        clearProps: "clipPath,opacity",
      }, startAt + 0.32);

      revealImgs.forEach((box, idx) => {
        const media = box.querySelector("img, video");
        if (media) {
          tl.to(
            media,
            { scale: 1, duration: 1.25, ease: "expo.out", clearProps: "transform" },
            startAt + 0.32 + idx * 0.07
          );
        }
      });
    }

    return tl;
  }

  // =========================================================================
  // 7. LIFECYCLE: CANVAS SIZING, PREFETCH, LINK INTERCEPT & POPSTATE
  // =========================================================================
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glCanvas = glCanvasRef.current;
    const vecCanvas = vecCanvasRef.current;

    glEngineRef.current = initWebGL(glCanvas);

    const resizeCanvases = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const vecDpr = Math.min(window.devicePixelRatio || 1, 2);
      const glDpr = Math.min(window.devicePixelRatio || 1, 1.5);

      if (glCanvas) {
        glCanvas.width = Math.max(1, Math.floor(w * glDpr));
        glCanvas.height = Math.max(1, Math.floor(h * glDpr));
        if (glEngineRef.current) {
          glEngineRef.current.gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        }
      }
      if (vecCanvas) {
        vecCanvas.width = Math.max(1, Math.floor(w * vecDpr));
        vecCanvas.height = Math.max(1, Math.floor(h * vecDpr));
      }
    };

    resizeCanvases();

    const initialPalette = getTargetPalette(pathname);
    syncPalette(initialPalette, 0);

    if (CONFIG.enableFirstLoadReveal && !reducedMotion) {
      isTransitioningRef.current = true;
      revealScreen(initialPalette, true, () => {
        window.dispatchEvent(new CustomEvent("aurea-sectio:ready", { detail: { pathname } }));
      });
    }

    const handlePointerDown = (e) => {
      pointerRef.current.nx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
      pointerRef.current.ny = Math.max(-1, Math.min(1, 1 - (e.clientY / window.innerHeight) * 2));
    };

    const handleLinkHover = (e) => {
      if (!(e.target instanceof Element)) return;
      const anchor = e.target.closest("a");
      if (!anchor) return;
      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;

      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const key = url.pathname + url.search;
        if (!prefetchedRef.current.has(key)) {
          prefetchedRef.current.add(key);
          router.prefetch(key);
        }
      } catch (_) { }
    };

    const handleLinkClick = (e) => {
      if (!(e.target instanceof Element)) return;
      const anchor = e.target.closest("a");
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;
      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
      ) {
        return;
      }

      if (anchor.hasAttribute("download") || anchor.target === "_blank") return;
      if (anchor.hasAttribute("data-barba-prevent") || anchor.hasAttribute("data-transition-ignore")) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      let url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch (_) {
        return;
      }

      if (url.origin !== window.location.origin) return;

      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        if (!url.hash) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (reducedMotion) return;

      e.preventDefault();
      e.stopPropagation();

      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      const fromPalette = getTargetPalette(currentPathRef.current);
      const toPalette = getTargetPalette(url.pathname);
      const destination = url.pathname + url.search + url.hash;

      router.prefetch(destination);

      coverScreen(fromPalette, toPalette, () => {
        pendingRevealRef.current = true;
        router.push(destination);

        clearFailsafe();
        failsafeRef.current = setTimeout(() => {
          if (pendingRevealRef.current) {
            pendingRevealRef.current = false;
            revealScreen(getTargetPalette(window.location.pathname), false);
          }
        }, 3200);
      });
    };

    const handleContextLost = (e) => e.preventDefault();
    if (glCanvas) glCanvas.addEventListener("webglcontextlost", handleContextLost, false);

    window.addEventListener("resize", resizeCanvases, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointerover", handleLinkHover, { passive: true });
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      clearFailsafe();
      if (activeTlRef.current) activeTlRef.current.kill();
      stopRender();
      if (glCanvas) glCanvas.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("resize", resizeCanvases);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerover", handleLinkHover);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [router]);

  useEffect(() => {
    currentPathRef.current = pathname;

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const targetPalette = getTargetPalette(pathname);

    if (pendingRevealRef.current) {
      pendingRevealRef.current = false;
      clearFailsafe();

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        revealScreen(targetPalette, false, () => {
          window.dispatchEvent(new CustomEvent("aurea-sectio:ready", { detail: { pathname } }));
        });
      });
    } else {
      // Browser Back / Forward: unveil cleanly without flashing
      isTransitioningRef.current = true;
      requestAnimationFrame(() => {
        revealScreen(targetPalette, true, () => {
          window.dispatchEvent(new CustomEvent("aurea-sectio:ready", { detail: { pathname } }));
        });
      });
    }
  }, [pathname]);

  return (
    <div ref={stageRef} className="dp-stage" aria-hidden="true">
      <canvas ref={glCanvasRef} className="dp-canvas dp-gl" />
      <canvas ref={vecCanvasRef} className="dp-canvas dp-vec" />
    </div>
  );
}