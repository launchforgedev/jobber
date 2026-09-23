import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden rounded-xl transition-transform duration-200 hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Minimal Dark Squircle Base */}
        <rect width="128" height="128" rx="32" fill="#090D16" />
        <rect x="1" y="1" width="126" height="126" rx="31" stroke="#4F46E5" stroke-width="2" stroke-opacity="0.4" />
        
        {/* Ambient radial glow */}
        <circle cx="64" cy="64" r="42" fill="url(#jobberLogoGlow)" opacity="0.45" />
        
        {/* Stylized Modern J Monogram / Intelligence Nodes */}
        <path
          d="M74 30 H90 V76 C90 94 75 104 56 104 C40 104 30 95 28 84 L45 80 C46 86 50 89 56 89 C66 89 74 83 74 74 V30 Z"
          fill="url(#jobberLogoGradient)"
        />
        {/* Glowing cyan node / spark */}
        <circle cx="48" cy="40" r="8" fill="#38BDF8" />
        <circle cx="48" cy="40" r="14" fill="#38BDF8" opacity="0.25" />
        
        <defs>
          <radialGradient id="jobberLogoGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stop-color="#6366F1" />
            <stop offset="100%" stop-color="#090D16" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="jobberLogoGradient" x1="28" y1="30" x2="90" y2="104" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#A5B4FC" />
            <stop offset="40%" stop-color="#6366F1" />
            <stop offset="100%" stop-color="#4338CA" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
