"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * 4 Distinct Atmospheric Lighting & Color Profiles
 * - Morning: Dawn Mist & Pale Sunrise Gold
 * - Afternoon: High Noon & Crisp Azure Skies
 * - Sunset: Anime Golden Hour with Rich Sakura Pink & Honey Amber
 * - Night: Starlit Cosmic Indigo with Bioluminescent Clouds & Cool Moonlight
 */
export const ATMOSPHERIC_THEMES = {
  morning: {
    id: "morning",
    name: "Morning",
    tagline: "Dawn Mist",
    skyStops: [
      { stop: 0.0, color: "#2563eb" },  // Morning deep azure sky
      { stop: 0.32, color: "#60a5fa" }, // Breezy light sky
      { stop: 0.62, color: "#f472b6" }, // Blossom dawn pink
      { stop: 0.82, color: "#fed7aa" }, // Apricot dawn
      { stop: 1.0, color: "#fef08a" },  // Sunrise golden horizon
    ],
    fogColor: 0xfae8f0,
    fogNear: 14,
    fogFar: 64,
    ambientColor: 0xf8fafc,
    ambientIntensity: 2.2,
    sunColor: 0xfef08a,
    sunIntensity: 3.6,
    sunPos: [10, 16, 8],
    skyFillColor: 0x93c5fd,
    skyFillIntensity: 2.3,
    cloudBounceColor: 0xf472b6,
    cloudBounceIntensity: 2.0,
    horizonColor: 0xfb923c,
    horizonIntensity: 1.8,
    moteColor: 0xffffff,
    moteOpacity: 0.8,
    shipEmissive: 0xfff7ed, // Soft morning warm pearlescent ivory
    cloudEmissive: 0xfdf2f8, // Soft morning rose-tinted white clouds
    exposure: 1.28,
  },
  afternoon: {
    id: "afternoon",
    name: "Afternoon",
    tagline: "High Noon",
    skyStops: [
      { stop: 0.0, color: "#1d4ed8" },  // Deep cobalt zenith
      { stop: 0.35, color: "#3b82f6" }, // Radiant azure
      { stop: 0.68, color: "#60a5fa" }, // Crisp sky mist
      { stop: 0.88, color: "#bae6fd" }, // Luminous cyan cloud haze
      { stop: 1.0, color: "#f8fafc" },  // Brilliant white horizon glow
    ],
    fogColor: 0xe0f2fe,
    fogNear: 16,
    fogFar: 68,
    ambientColor: 0xffffff,
    ambientIntensity: 2.6,
    sunColor: 0xfffbeb,
    sunIntensity: 4.3,
    sunPos: [8, 24, 6],
    skyFillColor: 0x38bdf8,
    skyFillIntensity: 2.7,
    cloudBounceColor: 0xf1f5f9,
    cloudBounceIntensity: 1.8,
    horizonColor: 0x67e8f9,
    horizonIntensity: 1.8,
    moteColor: 0xe0f2fe,
    moteOpacity: 0.65,
    shipEmissive: 0xffffff, // Pure crisp sunlight reflection
    cloudEmissive: 0xffffff, // Brilliant crisp white clouds
    exposure: 1.25,
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    tagline: "Golden Hour",
    skyStops: [
      { stop: 0.0, color: "#3b82f6" },  // Vibrant anime zenith blue
      { stop: 0.32, color: "#70a6f4" }, // Soft azure periwinkle
      { stop: 0.60, color: "#c48ff0" }, // Twilight lavender
      { stop: 0.82, color: "#f472b6" }, // Vivid sakura anime pink
      { stop: 1.0, color: "#fde047" },  // Golden sunset horizon glow
    ],
    fogColor: 0xf5bed6,
    fogNear: 14,
    fogFar: 64,
    ambientColor: 0xfce7f3,
    ambientIntensity: 2.0,
    sunColor: 0xffaa3b,
    sunIntensity: 4.0,
    sunPos: [14, 12, 8],
    skyFillColor: 0x38bdf8,
    skyFillIntensity: 2.8,
    cloudBounceColor: 0xf472b6,
    cloudBounceIntensity: 2.8,
    horizonColor: 0xfb923c,
    horizonIntensity: 2.2,
    moteColor: 0xfef08a,
    moteOpacity: 0.8,
    shipEmissive: 0xfed7aa, // Warm anime honey glow
    cloudEmissive: 0xfbcfe8, // Vibrant sakura pink cloud highlights
    exposure: 1.32,
  },
  night: {
    id: "night",
    name: "Night",
    tagline: "Midnight Violet & Deep Blue",
    skyStops: [
      { stop: 0.0, color: "#000000" },  // 1. Pure pitch black top space
      { stop: 0.25, color: "#050819" }, // 2. Deep midnight obsidian navy
      { stop: 0.55, color: "#1e1b4b" }, // 3. Dark royal indigo
      { stop: 0.78, color: "#3b0764" }, // 4. Deep celestial purple
      { stop: 1.0, color: "#1e40af" },  // 5. Rich deep blue horizon
    ],
    fogColor: 0x000000, // Deep black-navy mist
    fogNear: 12,
    fogFar: 54,
    ambientColor: 0x0f172a, // Dark midnight slate-blue base
    ambientIntensity: 1.4,
    sunColor: 0x60a5fa, // Silvery-blue moonlight
    sunIntensity: 3.5,
    sunPos: [-10, 18, 6],
    skyFillColor: 0x9333ea, // Vibrant electric purple starlight
    skyFillIntensity: 2.5,
    cloudBounceColor: 0x2563eb, // Rich royal blue cloud under-bounce
    cloudBounceIntensity: 2.8,
    horizonColor: 0x7c3aed, // Luminous violet horizon rim
    horizonIntensity: 2.0,
    moteColor: 0xa855f7, // Shimmering purple and blue diamond stars
    moteOpacity: 0.9,
    shipEmissive: 0x93c5fd, // Cool moonlight reflection on ship hull
    cloudEmissive: 0x4338ca, // Rich indigo & deep blue-purple cloud body
    exposure: 1.35,
  },
};

/**
 * ShipScene
 * High-performance Three.js controller for ship_in_clouds.glb.
 * Reliably centers, scales, and frames the ship and surrounding clouds.
 * Features real-time dynamic time-of-day atmospheric theme transitions.
 */
export default function ShipScene({
  scrollProgress = 0,
  theme = "sunset",
  showDevTools = false,
}) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);
  const [copied, setCopied] = useState(false);
  const printCameraRef = useRef(null);

  const scrollTargetRef = useRef(0);
  const themeTargetRef = useRef(theme);
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    scrollTargetRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    themeTargetRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const container = containerRef.current;
    let animationFrameId;

    // 1. Initial Theme Setup
    const initialThemeKey = themeTargetRef.current || "sunset";
    const initialTheme = ATMOSPHERIC_THEMES[initialThemeKey] || ATMOSPHERIC_THEMES.sunset;

    // 2. Scene
    const scene = new THREE.Scene();

    // 3. Dynamic 2D Sky Gradient Canvas (CanvasTexture)
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 2;
    skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext("2d");

    // Dynamic stops tracking
    const currentSkyStops = initialTheme.skyStops.map((s) => ({
      stop: s.stop,
      color: new THREE.Color(s.color),
    }));

    const drawSkyGradient = () => {
      const grad = skyCtx.createLinearGradient(0, 0, 0, 512);
      for (let i = 0; i < currentSkyStops.length; i++) {
        grad.addColorStop(
          currentSkyStops[i].stop,
          `#${currentSkyStops[i].color.getHexString()}`
        );
      }
      skyCtx.fillStyle = grad;
      skyCtx.fillRect(0, 0, 2, 512);
    };

    drawSkyGradient();

    const bgTexture = new THREE.CanvasTexture(skyCanvas);
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = bgTexture;

    // 4. Atmospheric Fog
    const currentFogColor = new THREE.Color(initialTheme.fogColor);
    scene.fog = new THREE.Fog(currentFogColor, initialTheme.fogNear, initialTheme.fogFar);

    // 5. Camera Setup
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 180);
    camera.position.set(0.0, 0.85, 8.5);
    camera.lookAt(0.0, 0.55, 0.0);

    // 6. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = initialTheme.exposure;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 7. Dynamic Lighting Rig
    const currentAmbientColor = new THREE.Color(initialTheme.ambientColor);
    let currentAmbientIntensity = initialTheme.ambientIntensity;
    const ambientLight = new THREE.AmbientLight(currentAmbientColor, currentAmbientIntensity);
    scene.add(ambientLight);

    const currentSunColor = new THREE.Color(initialTheme.sunColor);
    let currentSunIntensity = initialTheme.sunIntensity;
    const currentSunPos = new THREE.Vector3(...initialTheme.sunPos);
    const sunLight = new THREE.DirectionalLight(currentSunColor, currentSunIntensity);
    sunLight.position.copy(currentSunPos);
    scene.add(sunLight);

    const currentSkyFillColor = new THREE.Color(initialTheme.skyFillColor);
    let currentSkyFillIntensity = initialTheme.skyFillIntensity;
    const skyFill = new THREE.DirectionalLight(currentSkyFillColor, currentSkyFillIntensity);
    skyFill.position.set(-12, 10, -6);
    scene.add(skyFill);

    const currentCloudBounceColor = new THREE.Color(initialTheme.cloudBounceColor);
    let currentCloudBounceIntensity = initialTheme.cloudBounceIntensity;
    const warmCloudBounce = new THREE.DirectionalLight(currentCloudBounceColor, currentCloudBounceIntensity);
    warmCloudBounce.position.set(0, -9, 4);
    scene.add(warmCloudBounce);

    const currentHorizonColor = new THREE.Color(initialTheme.horizonColor);
    let currentHorizonIntensity = initialTheme.horizonIntensity;
    const horizonSunsetBacklight = new THREE.DirectionalLight(currentHorizonColor, currentHorizonIntensity);
    horizonSunsetBacklight.position.set(0, 4, -20);
    scene.add(horizonSunsetBacklight);

    // 8. Floating Cloud Motes & Stardust
    const moteCount = 130;
    const moteGeometry = new THREE.BufferGeometry();
    const motePositions = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePositions[i * 3] = (Math.random() - 0.5) * 22;
      motePositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      motePositions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
    const currentMoteColor = new THREE.Color(initialTheme.moteColor);
    const moteMaterial = new THREE.PointsMaterial({
      color: currentMoteColor,
      size: 0.09,
      transparent: true,
      opacity: initialTheme.moteOpacity,
      blending: THREE.AdditiveBlending,
    });
    const motes = new THREE.Points(moteGeometry, moteMaterial);
    scene.add(motes);

    // 9. Root Wrapper for Centering & Wave Physics
    const wrapper = new THREE.Group();
    scene.add(wrapper);

    // Track dynamic materials for ship and clouds
    const shipMaterials = [];
    const cloudMaterials = [];
    const currentShipEmissive = new THREE.Color(initialTheme.shipEmissive);
    const currentCloudEmissive = new THREE.Color(initialTheme.cloudEmissive);
    let currentExposure = initialTheme.exposure;

    // 10. Load GLB Model
    const loader = new GLTFLoader();
    loader.load(
      "/models/ship_in_clouds.glb",
      (gltf) => {
        const model = gltf.scene;

        let shipObject = null;
        model.traverse((child) => {
          if (child.name && child.name.toLowerCase().includes("boot")) {
            shipObject = child;
          }
        });

        const targetObj = shipObject || model;
        const box = new THREE.Box3().setFromObject(targetObj);
        const center = new THREE.Vector3();
        box.getCenter(center);

        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        wrapper.scale.setScalar(3.8);
        wrapper.add(model);

        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.depthWrite = true;
            if (child.material.emissiveMap) {
              child.material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            }
            if (child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace;
            }
            if (child.material.transparent) {
              child.material.opacity = Math.max(child.material.opacity, 0.95);
            }

            const name = (child.name || "").toLowerCase();
            const matName = (child.material.name || "").toLowerCase();

            // Cloud meshes vs Ship mesh
            if (name.includes("cloud") || matName.includes("cloud") || matName.includes("poly")) {
              child.material.emissive.copy(currentCloudEmissive);
              if (!cloudMaterials.includes(child.material)) {
                cloudMaterials.push(child.material);
              }
            } else {
              child.material.emissive.copy(currentShipEmissive);
              if (!shipMaterials.includes(child.material)) {
                shipMaterials.push(child.material);
              }
            }
          }
        });

        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadPercent(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        console.error("Error loading ship_in_clouds.glb:", err);
        setLoading(false);
      }
    );

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    // 11. Mouse Tracking for Parallax (X axis only)
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosRef.current.targetX = x * 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 12. Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 13. Calibrated Flight Trajectory Points
    const flightStages = [
      {
        p: 0.0,
        // High Aerial Vantage (Hero Angle)
        cam: new THREE.Vector3(0.40, 2.80, 5.65),
        lookAt: new THREE.Vector3(0.50, 0.60, -0.96),
        fov: 70,
      },
      {
        p: 0.28,
        // Section 01 Mechanics: Starboard High Wing Glider
        cam: new THREE.Vector3(1.80, 2.40, 2.20),
        lookAt: new THREE.Vector3(-0.40, 0.70, -3.20),
        fov: 65,
      },
      {
        p: 0.50,
        // Section 02 Convergence: High Soaring Overhead (y=3.20 clears all masts/sails)
        cam: new THREE.Vector3(1.10, 3.20, -0.80),
        lookAt: new THREE.Vector3(-0.10, 0.60, -5.50),
        fov: 68,
      },
      {
        p: 0.68,
        // Section 03 Architecture: Portside Arc (x=-2.60, y=2.60 safely outside ship perimeter)
        cam: new THREE.Vector3(-2.60, 2.60, -4.50),
        lookAt: new THREE.Vector3(0.40, 0.80, -7.50),
        fov: 66,
      },
      {
        p: 0.85,
        // Section 04 Showcase: Stern Sweep & Horizon Turn
        cam: new THREE.Vector3(1.00, 2.00, -8.60),
        lookAt: new THREE.Vector3(0.30, 0.80, -5.00),
        fov: 65,
      },
      {
        p: 1.0,
        // Section 05 Skyline: Grand 180° Reverse Horizon View (Moved left)
        cam: new THREE.Vector3(1.30, 1.65, -9.80),
        lookAt: new THREE.Vector3(0.60, 0.95, -3.00),
        fov: 64,
      },
    ];

    const currentCamPos = new THREE.Vector3().copy(flightStages[0].cam);
    const currentLookAt = new THREE.Vector3().copy(flightStages[0].lookAt);
    let smoothP = 0;
    const clock = new THREE.Clock();

    // Dev Helper: Log and export current camera coordinates
    const logCoordinates = () => {
      const output =
        `p: ${smoothP.toFixed(2)},\n` +
        `cam: new THREE.Vector3(${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}),\n` +
        `lookAt: new THREE.Vector3(${currentLookAt.x.toFixed(2)}, ${currentLookAt.y.toFixed(2)}, ${currentLookAt.z.toFixed(2)}),\n` +
        `fov: ${Math.round(camera.fov)}`;

      console.log(
        `%c[Ship Camera Inspector]%c Current Coordinates:\n${output}`,
        "background: #0284c7; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-weight: bold;",
        "color: #0284c7; font-family: monospace; font-size: 12px;"
      );

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(output).catch(() => { });
      }

      return {
        p: Number(smoothP.toFixed(2)),
        cam: [Number(camera.position.x.toFixed(2)), Number(camera.position.y.toFixed(2)), Number(camera.position.z.toFixed(2))],
        lookAt: [Number(currentLookAt.x.toFixed(2)), Number(currentLookAt.y.toFixed(2)), Number(currentLookAt.z.toFixed(2))],
        fov: Math.round(camera.fov),
      };
    };

    printCameraRef.current = logCoordinates;
    if (typeof window !== "undefined") {
      window.shipCam = logCoordinates;
      window.getCam = logCoordinates;
    }

    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "c" || e.key === "C" || e.code === "KeyC") {
        logCoordinates();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);

    // 14. Render Loop with Smooth Atmospheric Lerping
    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const elapsedTime = clock.getElapsedTime();

      // Smooth scroll interpolation
      smoothP += (scrollTargetRef.current - smoothP) * 0.06;

      // Mouse lerp
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.05;

      // --- ATMOSPHERIC THEME INTERPOLATION ---
      const activeKey = themeTargetRef.current || "sunset";
      const targetTheme = ATMOSPHERIC_THEMES[activeKey] || ATMOSPHERIC_THEMES.sunset;
      const lerpSpeed = 0.045; // Smooth cinematic transition speed

      // 1. Fog Lerp
      currentFogColor.lerp(new THREE.Color(targetTheme.fogColor), lerpSpeed);
      scene.fog.color.copy(currentFogColor);
      scene.fog.near += (targetTheme.fogNear - scene.fog.near) * lerpSpeed;
      scene.fog.far += (targetTheme.fogFar - scene.fog.far) * lerpSpeed;

      // 2. Ambient Light Lerp
      currentAmbientColor.lerp(new THREE.Color(targetTheme.ambientColor), lerpSpeed);
      currentAmbientIntensity += (targetTheme.ambientIntensity - currentAmbientIntensity) * lerpSpeed;
      ambientLight.color.copy(currentAmbientColor);
      ambientLight.intensity = currentAmbientIntensity;

      // 3. Direct Sun / Moon Light Lerp
      currentSunColor.lerp(new THREE.Color(targetTheme.sunColor), lerpSpeed);
      currentSunIntensity += (targetTheme.sunIntensity - currentSunIntensity) * lerpSpeed;
      currentSunPos.lerp(new THREE.Vector3(...targetTheme.sunPos), lerpSpeed);
      sunLight.color.copy(currentSunColor);
      sunLight.intensity = currentSunIntensity;
      sunLight.position.copy(currentSunPos);

      // 4. Sky Fill Light Lerp
      currentSkyFillColor.lerp(new THREE.Color(targetTheme.skyFillColor), lerpSpeed);
      currentSkyFillIntensity += (targetTheme.skyFillIntensity - currentSkyFillIntensity) * lerpSpeed;
      skyFill.color.copy(currentSkyFillColor);
      skyFill.intensity = currentSkyFillIntensity;

      // 5. Cloud Under-Bounce Light Lerp
      currentCloudBounceColor.lerp(new THREE.Color(targetTheme.cloudBounceColor), lerpSpeed);
      currentCloudBounceIntensity += (targetTheme.cloudBounceIntensity - currentCloudBounceIntensity) * lerpSpeed;
      warmCloudBounce.color.copy(currentCloudBounceColor);
      warmCloudBounce.intensity = currentCloudBounceIntensity;

      // 6. Horizon Backlight Lerp
      currentHorizonColor.lerp(new THREE.Color(targetTheme.horizonColor), lerpSpeed);
      currentHorizonIntensity += (targetTheme.horizonIntensity - currentHorizonIntensity) * lerpSpeed;
      horizonSunsetBacklight.color.copy(currentHorizonColor);
      horizonSunsetBacklight.intensity = currentHorizonIntensity;

      // 7. Tone Mapping Exposure Lerp
      currentExposure += (targetTheme.exposure - currentExposure) * lerpSpeed;
      renderer.toneMappingExposure = currentExposure;

      // 8. Stardust Motes Lerp
      currentMoteColor.lerp(new THREE.Color(targetTheme.moteColor), lerpSpeed);
      moteMaterial.color.copy(currentMoteColor);
      moteMaterial.opacity += (targetTheme.moteOpacity - moteMaterial.opacity) * lerpSpeed;

      // 9. Model & Cloud Materials Emissive Lerp
      currentShipEmissive.lerp(new THREE.Color(targetTheme.shipEmissive), lerpSpeed);
      currentCloudEmissive.lerp(new THREE.Color(targetTheme.cloudEmissive), lerpSpeed);

      for (let i = 0; i < shipMaterials.length; i++) {
        shipMaterials[i].emissive.copy(currentShipEmissive);
      }
      for (let i = 0; i < cloudMaterials.length; i++) {
        cloudMaterials[i].emissive.copy(currentCloudEmissive);
      }

      // 10. Dynamic Sky Gradient Canvas Update (Only repaints while colors are interpolating)
      let skyNeedsUpdate = false;
      for (let i = 0; i < currentSkyStops.length; i++) {
        const targetColor = new THREE.Color(targetTheme.skyStops[i].color);
        const cur = currentSkyStops[i].color;
        const diff = Math.abs(cur.r - targetColor.r) + Math.abs(cur.g - targetColor.g) + Math.abs(cur.b - targetColor.b);
        if (diff > 0.001) {
          cur.lerp(targetColor, lerpSpeed);
          skyNeedsUpdate = true;
        }
      }

      if (skyNeedsUpdate) {
        drawSkyGradient();
        bgTexture.needsUpdate = true;
      }

      // --- CAMERA TRAJECTORY INTERPOLATION ---
      let fromStage = flightStages[0];
      let toStage = flightStages[flightStages.length - 1];

      for (let i = 0; i < flightStages.length - 1; i++) {
        if (smoothP >= flightStages[i].p && smoothP <= flightStages[i + 1].p) {
          fromStage = flightStages[i];
          toStage = flightStages[i + 1];
          break;
        }
      }

      const stageSpan = toStage.p - fromStage.p;
      const subT = stageSpan > 0 ? (smoothP - fromStage.p) / stageSpan : 0;
      const easeT = subT < 0.5 ? 4 * subT * subT * subT : 1 - Math.pow(-2 * subT + 2, 3) / 2;

      const targetCam = new THREE.Vector3().lerpVectors(fromStage.cam, toStage.cam, easeT);
      const targetLook = new THREE.Vector3().lerpVectors(fromStage.lookAt, toStage.lookAt, easeT);
      const targetFov = (fromStage.fov || 34) + ((toStage.fov || 34) - (fromStage.fov || 34)) * easeT;

      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
      }

      targetCam.x += mousePosRef.current.x * 0.75;
      currentCamPos.lerp(targetCam, 0.08);
      currentLookAt.lerp(targetLook, 0.08);

      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      // Ship gentle wave floating motion
      if (wrapper) {
        wrapper.position.y = Math.sin(elapsedTime * 0.9) * 0.12;
        wrapper.rotation.z = Math.sin(elapsedTime * 0.6) * 0.015;
        wrapper.rotation.x = Math.cos(elapsedTime * 0.5) * 0.01;
      }

      // Gentle cloud motes rotation
      if (motes) {
        motes.rotation.y = elapsedTime * 0.01;
      }

      renderer.render(scene, camera);
    };

    render();

    return () => {
      clearTimeout(safetyTimer);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (typeof window !== "undefined") {
        delete window.shipCam;
        delete window.getCam;
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      bgTexture.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fce7f3] transition-opacity duration-700 pointer-events-auto">
          <div className="size-12 rounded-full border-2 border-pink-300 border-t-pink-800 animate-spin mb-4" />
          <span className="text-[11px] font-mono tracking-[0.25em] text-pink-900 uppercase font-semibold">
            Loading Stratospheric Continuum {loadPercent}%
          </span>
          <span className="text-[10px] font-mono text-pink-500 mt-1">
            23.5 MB • 3D Atmospheric Assets
          </span>
        </div>
      )}

      {/* Optional On-Screen Dev Camera Inspector Pill */}
      {showDevTools && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto flex items-center">
          <button
            type="button"
            onClick={() => {
              if (printCameraRef.current) {
                printCameraRef.current();
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white text-xs font-mono border border-slate-700 shadow-xl transition-all flex items-center gap-2 backdrop-blur-md cursor-pointer select-none active:scale-95"
            title="Print camera coordinates to DevTools console & copy to clipboard"
          >
            <span>📷</span>
            <span>{copied ? "Copied to Console & Clipboard!" : "Print Cam [C]"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
