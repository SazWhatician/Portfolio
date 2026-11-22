"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GlassCarousel from "@/components/ui/glass-carousel";
import FramelessNav from "@/components/ui/frameless-nav";
import { getSystemTimeTheme } from "@/components/ui/time-clock";
import { cozyAudio } from "@/lib/cozy-sound";
import { Volume2, VolumeX } from "lucide-react";

const PROJECT_LIST = [
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

export default function ProjectsPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isCardFocused, setIsCardFocused] = useState(false);
  const [systemTheme, setSystemTheme] = useState("sunset");

  useEffect(() => {
    setSystemTheme(getSystemTimeTheme());
    const interval = setInterval(() => setSystemTheme(getSystemTimeTheme()), 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const muted = cozyAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      cozyAudio.playSnap(3, 1);
    }
  };

  return (
    <main className="projects-minimal-root">
      {/* Astrolabe Celestial Compass Navigation */}
      <FramelessNav activeTheme={systemTheme} />

      {/* Floating Minimal Header */}
      <header className="projects-minimal-header">
        <Link
          href="/"
          className="brand-logo text-neutral-900 no-underline flex items-center gap-2.5"
          aria-label="Saswat Mohanty Home"
          onClick={() => cozyAudio.playClose()}
        >
          <img
            src="/logo-mark.png"
            alt="Saswat Mohanty Logo"
            className="size-7 sm:size-8 rounded-full object-contain shrink-0"
          />
          <span className="logo-text hidden sm:inline text-neutral-900 font-['Clash_Display',sans-serif]">Saswat Mohanty</span>
          <span className="logo-badge hidden sm:inline text-neutral-400 font-mono text-sm ml-1">®</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Link to About */}
          <Link
            href="/about"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 bg-white/60 transition-colors"
            onClick={() => cozyAudio.playSnap(2, 1)}
          >
            <span>About</span>
          </Link>

          {/* Ergonomic Cozy Chime Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="projects-minimal-sound text-neutral-900 border-neutral-200 px-2.5 py-1.5 sm:px-3.5 sm:py-2"
            title={isMuted ? "Enable cozy sound chimes" : "Mute cozy sound chimes"}
            aria-label="Toggle cozy haptic chimes"
          >
            {isMuted ? (
              <VolumeX className="size-3.5 opacity-50" />
            ) : (
              <Volume2 className="size-3.5 text-neutral-900" />
            )}
            <span className="hidden sm:inline font-mono text-xs">
              {isMuted ? "CHIME OFF" : "CHIME ON"}
            </span>
          </button>

          <Link
            href="/"
            className="projects-minimal-close bg-neutral-900 hover:bg-black text-white border-neutral-900 px-2.5 py-1.5 sm:px-4 sm:py-2"
            aria-label="Back to home"
            onClick={() => cozyAudio.playClose()}
          >
            <span className="hidden sm:inline">Close</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Link>
        </div>
      </header>

      {/* The Single Section Glass Carousel */}
      <section className="projects-minimal-stage">
        <GlassCarousel
          items={PROJECT_LIST}
          theme="white"
          panelHeight={560}
          className="gc--fullscreen"
          onFocusChange={setIsCardFocused}
        />
      </section>

      {/* Floating Minimal Footer Hint */}
      <footer
        className={`projects-minimal-footer transition-opacity duration-300 ${
          isCardFocused ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <span className="footer-hint">← / → keys or drag to glide • click center to focus</span>
        <span className="footer-brand">Saswat Mohanty Studio © 2026</span>
      </footer>
    </main>
  );
}
