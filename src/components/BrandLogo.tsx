import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-700/60 dark:border-zinc-800 bg-slate-900 shadow-xs flex items-center justify-center transition-transform duration-150 active:scale-95 ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[72%] h-[72%]"
      >
        {/* Crisp Geometric J Monogram */}
        <path
          d="M58 20 H74 V62 C74 76 62 84 48 84 C35 84 26 77 24 67 L38 64 C39 69 43 72 48 72 C55 72 60 67 60 60 V20 Z"
          fill="#3B82F6"
        />
        {/* Metric Accent Node */}
        <circle cx="36" cy="30" r="7" fill="#10B981" />
      </svg>
    </div>
  );
};
