"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const PHI = 1.618033988749895;

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function buildLogSpiral(cx, cy, maxTheta, a, steps = 120) {
  const b = (2 * Math.log(PHI)) / Math.PI;
  let d = "";
  let length = 0;
  let px = 0;
  let py = 0;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * maxTheta;
    const r = a * Math.exp(b * t);
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

export default function TeamMemberCard({
  position = "left",
  jobPosition = "Creative Technologist & Spatial Systems",
  firstName = "Saswat",
  lastName = "Mohanty",
  imageUrl = "/placeholder.jpg",
  description = "Saswat is a creative technologist and systems architect crafting sensory web interfaces, real-time 3D spatial environments, and tactile computing systems.",
  className,
  ctaHref,
  onCtaClick,
}) {
  const rootRef = useRef(null);
  const portraitParallaxRef = useRef(null);
  const portraitFlipRef = useRef(null);
  const portraitFrameRef = useRef(null);
  const portraitImgRef = useRef(null);
  const infoParallaxRef = useRef(null);
  const infoFlipRef = useRef(null);
  const haloRef = useRef(null);
  const spiralOverlayRef = useRef(null);
  const magneticBtnRef = useRef(null);
  const ctaRingRef = useRef(null);
  const ctaEyeUpperRef = useRef(null);
  const ctaEyeLowerRef = useRef(null);

  const prevRectsRef = useRef(null);
  const prevPosRef = useRef(position);
  const hasMountedRef = useRef(false);

  const fullName = `${firstName} ${lastName}`;
  const isPositionRight = position === "right";

  const CtaWrapper = ctaHref ? "a" : "div";
  const ctaProps = ctaHref
    ? { href: ctaHref, "aria-label": `Contact or explore ${fullName}` }
    : { onClick: onCtaClick, role: "button", tabIndex: 0 };

  // Precomputed pixel-exact SVG geometry (zero pathLength="1" browser bugs)
  const geom = useMemo(() => {
    const outerR = 196;
    const outerCirc = Number((2 * Math.PI * outerR).toFixed(2));
    const vesicaR = 132;
    const vesicaCirc = Number((2 * Math.PI * vesicaR).toFixed(2));
    const ctaR = 39;
    const ctaCirc = Number((2 * Math.PI * ctaR).toFixed(2));

    const ticks = Array.from({ length: 34 }, (_, i) => {
      const a = (i / 34) * Math.PI * 2;
      const major = i % 5 === 0;
      const r1 = 196;
      const r2 = major ? 210 : 202;
      return {
        x1: (220 + Math.cos(a) * r1).toFixed(2),
        y1: (220 + Math.sin(a) * r1).toFixed(2),
        x2: (220 + Math.cos(a) * r2).toFixed(2),
        y2: (220 + Math.sin(a) * r2).toFixed(2),
        major,
      };
    });

    // Bounded cleanly inside 280x453 portrait viewBox (max r = 117px from 140,226)
    const spiral = buildLogSpiral(140, 226, Math.PI * 3.2, 5.35, 130);

    return { outerR, outerCirc, vesicaR, vesicaCirc, ctaR, ctaCirc, ticks, spiral };
  }, []);

  // Capture bounding boxes before position prop updates layout
  if (prevPosRef.current !== position && typeof window !== "undefined") {
    if (portraitFlipRef.current && infoFlipRef.current) {
      prevRectsRef.current = {
        portrait: portraitFlipRef.current.getBoundingClientRect(),
        info: infoFlipRef.current.getBoundingClientRect(),
      };
    }
    prevPosRef.current = position;
  }

  // True FLIP Glide on Left/Right Alignment Toggle (no DOM remount)
  useIsomorphicLayoutEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const prev = prevRectsRef.current;
    if (!prev || !portraitFlipRef.current || !infoFlipRef.current) return;

    const nextPortrait = portraitFlipRef.current.getBoundingClientRect();
    const nextInfo = infoFlipRef.current.getBoundingClientRect();

    gsap.fromTo(
      portraitFlipRef.current,
      { x: prev.portrait.left - nextPortrait.left, y: prev.portrait.top - nextPortrait.top },
      { x: 0, y: 0, duration: 0.9, ease: "expo.inOut", clearProps: "x,y", overwrite: "auto" }
    );

    gsap.fromTo(
      infoFlipRef.current,
      { x: prev.info.left - nextInfo.left, y: prev.info.top - nextInfo.top },
      { x: 0, y: 0, duration: 0.9, ease: "expo.inOut", clearProps: "x,y", overwrite: "auto" }
    );

    if (haloRef.current) {
      gsap.to(haloRef.current, {
        rotation: "+=137.508",
        duration: 1.05,
        ease: "expo.inOut",
        transformOrigin: "50% 50%",
      });
    }

    prevRectsRef.current = null;
  }, [position]);

  // Entrance Choreography + Scroll Depth + Interactive Sacred Optics
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.fromTo(
        ".tmc-eyebrow-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.05, transformOrigin: "left center" },
        0
      )
        .fromTo(
          ".tmc-role",
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.85 },
          0.08
        )
        .fromTo(
          portraitFrameRef.current,
          { clipPath: "inset(45% 0% 45% 0% round 24px)", scale: 0.94 },
          {
            clipPath: "inset(0% 0% 0% 0% round 24px)",
            scale: 1,
            duration: 1.25,
            ease: "expo.inOut",
          },
          0.06
        )
        .fromTo(
          portraitImgRef.current,
          { scale: 1.22 },
          { scale: 1.03, duration: 1.5, ease: "expo.out" },
          0.08
        )
        .to(
          ".tmc-draw-stroke",
          { strokeDashoffset: 0, duration: 1.35, stagger: 0.1, ease: "power3.inOut" },
          0.24
        )
        .fromTo(
          ".tmc-name-row",
          { yPercent: 108, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: "expo.out" },
          0.26
        )
        .fromTo(
          ".tmc-meta-fade",
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, stagger: 0.1 },
          0.48
        );

      // Exact svgOrigin keeps the angelic halo spinning dead-center
      gsap.to(".tmc-halo-orbit", {
        rotation: 360,
        duration: 89,
        repeat: -1,
        ease: "none",
        svgOrigin: "220 220",
      });

      gsap.to(portraitImgRef.current, {
        yPercent: 9,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.75,
        },
      });

      gsap.to(infoParallaxRef.current, {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top center",
          end: "bottom top",
          scrub: 0.9,
        },
      });

      const cleanups = [];

      // Contained optical focus on portrait hover
      const frame = portraitFrameRef.current;
      const overlay = spiralOverlayRef.current;
      if (frame && overlay) {
        const imgX = gsap.quickTo(portraitImgRef.current, "x", { duration: 0.65, ease: "power3.out" });
        const imgY = gsap.quickTo(portraitImgRef.current, "y", { duration: 0.65, ease: "power3.out" });

        const onMove = (e) => {
          const rect = frame.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          imgX(-nx * 12);
          imgY(-ny * 10);
          gsap.to(overlay, { opacity: 0.82, duration: 0.45, overwrite: "auto" });
        };

        const onLeave = () => {
          imgX(0);
          imgY(0);
          gsap.to(overlay, { opacity: 0.24, duration: 0.6, overwrite: "auto" });
        };

        frame.addEventListener("mousemove", onMove);
        frame.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          frame.removeEventListener("mousemove", onMove);
          frame.removeEventListener("mouseleave", onLeave);
        });
      }

      // Magnetic Ophanim Vesica-Eye CTA
      const btn = magneticBtnRef.current;
      if (btn) {
        const xTo = gsap.quickTo(btn, "x", { duration: 0.38, ease: "power3.out" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.38, ease: "power3.out" });

        const onMove = (e) => {
          const rect = btn.getBoundingClientRect();
          xTo((e.clientX - (rect.left + rect.width / 2)) * 0.32);
          yTo((e.clientY - (rect.top + rect.height / 2)) * 0.32);
        };

        const onEnter = () => {
          if (ctaRingRef.current) {
            gsap.to(ctaRingRef.current, { strokeDashoffset: 0, duration: 0.65, ease: "expo.out" });
          }
          if (ctaEyeUpperRef.current && ctaEyeLowerRef.current) {
            gsap.to(ctaEyeUpperRef.current, { attr: { d: "M 12 48 Q 48 16 84 48" }, duration: 0.48, ease: "expo.out" });
            gsap.to(ctaEyeLowerRef.current, { attr: { d: "M 12 48 Q 48 80 84 48" }, duration: 0.48, ease: "expo.out" });
          }
        };

        const onLeave = () => {
          xTo(0);
          yTo(0);
          if (ctaRingRef.current) {
            gsap.to(ctaRingRef.current, {
              strokeDashoffset: geom.ctaCirc,
              duration: 0.5,
              ease: "power2.inOut",
            });
          }
          if (ctaEyeUpperRef.current && ctaEyeLowerRef.current) {
            gsap.to(ctaEyeUpperRef.current, { attr: { d: "M 12 48 Q 48 36 84 48" }, duration: 0.48, ease: "power3.out" });
            gsap.to(ctaEyeLowerRef.current, { attr: { d: "M 12 48 Q 48 60 84 48" }, duration: 0.48, ease: "power3.out" });
          }
        };

        btn.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseenter", onEnter);
        btn.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          btn.removeEventListener("mousemove", onMove);
          btn.removeEventListener("mouseenter", onEnter);
          btn.removeEventListener("mouseleave", onLeave);
        });
      }

      return () => cleanups.forEach((fn) => fn());
    }, rootRef);

    return () => ctx.revert();
  }, [geom.ctaCirc]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative my-8 md:my-14 flex flex-col justify-center w-full max-w-5xl mx-auto",
        className
      )}
    >
      {/* Eyebrow & Golden Ratio Marker */}
      <div
        className={cn(
          "mb-6 flex items-center gap-4",
          isPositionRight ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div className="overflow-hidden">
          <p
            className={cn(
              "tmc-role text-xs font-mono font-medium tracking-[0.3em] text-neutral-400 uppercase select-none",
              isPositionRight ? "text-left md:text-right" : "text-left"
            )}
          >
            {jobPosition}
          </p>
        </div>
        <div className="tmc-eyebrow-line hidden sm:block h-px flex-1 bg-black/[0.08]" />
        <span className="hidden sm:inline-block text-[10px] font-mono tracking-[0.25em] text-[#a6864a] select-none">
          Φ 1.618
        </span>
      </div>

      <div
        className={cn(
          "relative flex flex-col md:flex-row items-center",
          isPositionRight ? "md:justify-start" : "md:justify-end"
        )}
      >
        {/* Portrait Assembly */}
        <div
          ref={portraitParallaxRef}
          className={cn("relative shrink-0 will-change-transform", isPositionRight && "md:order-1")}
        >
          <div ref={portraitFlipRef} className="relative will-change-transform">
            {/* Angelic Halo centered strictly behind portrait */}
            <svg
              ref={haloRef}
              aria-hidden="true"
              viewBox="0 0 440 440"
              fill="none"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[400px] md:w-[440px] h-auto z-0 will-change-transform overflow-hidden"
            >
              <g className="tmc-halo-orbit">
                <circle
                  cx="220"
                  cy="220"
                  r={geom.outerR}
                  stroke="rgba(166,134,74,0.34)"
                  strokeWidth="1"
                  strokeDasharray={geom.outerCirc}
                  strokeDashoffset={geom.outerCirc}
                  className="tmc-draw-stroke"
                />
                <circle
                  cx="220"
                  cy="220"
                  r="182"
                  stroke="rgba(23,23,23,0.1)"
                  strokeWidth="0.8"
                  strokeDasharray="2 7"
                />
                {geom.ticks.map((t, i) => (
                  <line
                    key={i}
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke={t.major ? "rgba(166,134,74,0.62)" : "rgba(23,23,23,0.18)"}
                    strokeWidth={t.major ? "1.2" : "0.75"}
                  />
                ))}
              </g>
              {/* Sacred Vesica Piscis Circles */}
              <circle
                cx="178"
                cy="220"
                r={geom.vesicaR}
                stroke="rgba(23,23,23,0.08)"
                strokeWidth="0.85"
                strokeDasharray={geom.vesicaCirc}
                strokeDashoffset={geom.vesicaCirc}
                className="tmc-draw-stroke"
              />
              <circle
                cx="262"
                cy="220"
                r={geom.vesicaR}
                stroke="rgba(23,23,23,0.08)"
                strokeWidth="0.85"
                strokeDasharray={geom.vesicaCirc}
                strokeDashoffset={geom.vesicaCirc}
                className="tmc-draw-stroke"
              />
            </svg>

            {/* Portrait Frame — Strict 1 : 1.618 Golden Proportion */}
            <div
              ref={portraitFrameRef}
              className="relative z-10 aspect-[1/1.618] w-[270px] sm:w-[300px] md:w-[324px] overflow-hidden rounded-3xl border border-neutral-200/90 bg-neutral-100 shadow-[0_28px_72px_rgba(0,0,0,0.08)] will-change-transform"
            >
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Strictly Contained Logarithmic Golden Spiral Overlay */}
              <svg
                ref={spiralOverlayRef}
                aria-hidden="true"
                viewBox="0 0 280 453"
                fill="none"
                className="pointer-events-none absolute inset-0 z-20 h-full w-full opacity-[0.24] overflow-hidden"
              >
                <line x1="0" y1="173" x2="280" y2="173" stroke="rgba(247,242,235,0.4)" strokeWidth="0.65" strokeDasharray="2 4" />
                <line x1="173" y1="0" x2="173" y2="453" stroke="rgba(247,242,235,0.3)" strokeWidth="0.65" strokeDasharray="2 4" />
                <path
                  d={geom.spiral.d}
                  stroke="rgba(247,242,235,0.92)"
                  strokeWidth="1.05"
                  strokeDasharray={geom.spiral.length}
                  strokeDashoffset={geom.spiral.length}
                  className="tmc-draw-stroke"
                />
                <circle cx="140" cy="226" r="2.6" fill="rgba(247,242,235,0.95)" />
              </svg>

              <img
                ref={portraitImgRef}
                src={imageUrl}
                alt={fullName}
                className="h-[114%] w-[108%] -mt-[7%] -ml-[4%] max-w-none object-cover will-change-transform"
              />
            </div>
          </div>
        </div>

        {/* Overlapping Editorial Info Block */}
        <div
          ref={infoParallaxRef}
          className={cn(
            "relative z-20 w-full md:w-[calc(100%-300px)] lg:w-[calc(100%-324px)] mt-10 md:mt-0 will-change-transform",
            isPositionRight ? "md:left-10" : "md:-left-10"
          )}
        >
          <div
            ref={infoFlipRef}
            className={cn(
              "flex flex-col gap-8 md:gap-12 will-change-transform",
              isPositionRight ? "md:items-end text-left md:text-right" : "items-start text-left"
            )}
          >
            <div>
              <h1 className="font-['Clash_Display',sans-serif] text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.02] font-extralight tracking-tight text-neutral-900 select-none">
                <span className="block overflow-hidden py-1 -my-1">
                  <span className="tmc-name-row block will-change-transform">{firstName}</span>
                </span>
                <span className="block overflow-hidden py-1 -my-1">
                  <span className="tmc-name-row block font-semibold text-neutral-900 will-change-transform">
                    {lastName}
                  </span>
                </span>
              </h1>
            </div>

            <div
              className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 w-full",
                isPositionRight && "md:justify-end"
              )}
            >
              {/* Ophanim Vesica-Eye Magnetic CTA */}
              <div
                className={cn(
                  "tmc-meta-fade order-2 sm:order-1",
                  isPositionRight && "md:order-2"
                )}
              >
                <div ref={magneticBtnRef} className="inline-block will-change-transform">
                  <CtaWrapper
                    {...ctaProps}
                    className="group relative flex h-16 w-16 md:h-20 md:w-20 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-colors duration-500 hover:bg-neutral-900"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 96 96"
                      className="pointer-events-none absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] overflow-hidden"
                    >
                      <circle cx="48" cy="48" r={geom.ctaR} fill="none" stroke="rgba(23,23,23,0.14)" strokeWidth="1" />
                      <circle
                        ref={ctaRingRef}
                        cx="48"
                        cy="48"
                        r={geom.ctaR}
                        fill="none"
                        stroke="#a6864a"
                        strokeWidth="1.6"
                        strokeDasharray={geom.ctaCirc}
                        strokeDashoffset={geom.ctaCirc}
                        transform="rotate(-90 48 48)"
                      />
                      <path ref={ctaEyeUpperRef} d="M 12 48 Q 48 36 84 48" fill="none" stroke="rgba(166,134,74,0.48)" strokeWidth="0.95" />
                      <path ref={ctaEyeLowerRef} d="M 12 48 Q 48 60 84 48" fill="none" stroke="rgba(166,134,74,0.48)" strokeWidth="0.95" />
                    </svg>

                    <span className="relative z-10 flex size-6 items-center justify-center overflow-hidden">
                      <ArrowRight
                        size={22}
                        className={cn(
                          "absolute text-neutral-800 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-7 group-hover:-translate-y-7 group-hover:opacity-0",
                          isPositionRight && "rotate-180 group-hover:-translate-x-7 group-hover:translate-y-7"
                        )}
                      />
                      <ArrowRight
                        size={22}
                        className={cn(
                          "absolute text-white -translate-x-7 translate-y-7 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 -rotate-45",
                          isPositionRight && "translate-x-7 -translate-y-7 rotate-[135deg]"
                        )}
                      />
                    </span>
                  </CtaWrapper>
                </div>
              </div>

              <div
                className={cn(
                  "tmc-meta-fade w-full sm:w-[75%] md:w-[62%] lg:w-[54%] order-1 sm:order-2",
                  isPositionRight && "md:order-1"
                )}
              >
                <p
                  className={cn(
                    "text-sm md:text-base leading-[1.8] text-neutral-600 font-light",
                    isPositionRight ? "text-left md:text-right" : "text-left"
                  )}
                >
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}