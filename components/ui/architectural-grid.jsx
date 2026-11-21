"use client";

/**
 * ArchitecturalGrid - Subtle Spatial Engineering Guidelines Overlay
 * Clean minimal architectural grid lines for the white studio theme.
 */
export default function ArchitecturalGrid() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[4] overflow-hidden select-none"
    >
      {/* 1. Vertical Architectural Column Lines */}
      <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 h-full w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border-r border-black/[0.04] h-full"
          />
        ))}
      </div>

      {/* 2. Horizontal Rhythm Lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        <div className="w-full border-b border-black/[0.04] h-0 mt-20" />
        <div className="w-full border-b border-black/[0.03] h-0" />
        <div className="w-full border-b border-black/[0.03] h-0" />
        <div className="w-full border-b border-black/[0.04] h-0 mb-16" />
      </div>

      {/* 3. Subtle Corner & Center Crosshairs (+) */}
      <div className="absolute top-6 left-6 text-black/20 font-mono text-xs font-light">
        +
      </div>
      <div className="absolute top-1/2 left-6 -translate-y-1/2 text-black/20 font-mono text-xs">
        +
      </div>
      <div className="absolute top-1/2 right-6 -translate-y-1/2 text-black/20 font-mono text-xs">
        +
      </div>
      <div className="absolute bottom-16 right-6 text-black/20 font-mono text-xs hidden sm:block">
        +
      </div>
    </div>
  );
}
