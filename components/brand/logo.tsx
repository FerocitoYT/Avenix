import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AvenixLogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = size === "sm" ? 28 : size === "lg" ? 48 : 36;
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-xl bg-blue-500/25 blur-md -z-10 group-hover:bg-blue-400/35 transition-all" />

      {/* Vector Geometric "A" Symbol */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]"
      >
        <defs>
          <linearGradient id="avxGrad1" x1="50" y1="5" x2="10" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="avxGrad2" x1="50" y1="5" x2="90" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="60%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="avxGradBridge" x1="28" y1="62" x2="72" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="avxGlowPeak" x1="50" y1="2" x2="50" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>

        {/* Outer boundary polygon */}
        <polygon
          points="50,6 92,88 74,88 50,40 26,88 8,88"
          fill="url(#avxGrad1)"
          opacity="0.2"
        />

        {/* Left facet */}
        <polygon
          points="50,8 14,86 28,86 50,42"
          fill="url(#avxGrad1)"
        />

        {/* Right facet */}
        <polygon
          points="50,8 50,42 72,86 86,86"
          fill="url(#avxGrad2)"
        />

        {/* Floating crossbar - Electric Energy Bridge */}
        <polygon
          points="31,64 69,64 64,72 36,72"
          fill="url(#avxGradBridge)"
        />

        {/* Diamond vertex accent */}
        <polygon
          points="50,4 56,16 50,22 44,16"
          fill="url(#avxGlowPeak)"
        />

        {/* Core tech point */}
        <circle cx="50" cy="53" r="3.5" fill="#60A5FA" />
      </svg>
    </div>
  );
}

export function AvenixLogo({
  className = "",
  iconOnly = false,
  size = "md",
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 transition-opacity hover:opacity-95 ${className}`}
    >
      <AvenixLogoIcon size={size} />
      {!iconOnly && (
        <div className="flex flex-col select-none">
          <span className="font-extrabold tracking-wider text-white text-lg md:text-xl font-display">
            Axyon
          </span>
        </div>
      )}
    </Link>
  );
}
