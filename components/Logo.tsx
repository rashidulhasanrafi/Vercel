
import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const Logo: React.FC<Props> = ({ className = "", size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" /> {/* Orange-500 */}
          <stop offset="50%" stopColor="#D946EF" /> {/* Fuchsia-500 */}
          <stop offset="100%" stopColor="#7C3AED" /> {/* Violet-600 */}
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Segmented Ring */}
      <g transform="rotate(-45 50 50)">
        {/* Top Segment */}
        <path 
          d="M50 10 A 40 40 0 0 1 90 50" 
          stroke="url(#logoGradient)" 
          strokeWidth="12" 
          strokeLinecap="round"
          strokeDasharray="60 100" // Creates the gap
        />
        {/* Bottom/Side Segment */}
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          stroke="url(#logoGradient)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeDasharray="180 70" 
          strokeDashoffset="-65"
        />
      </g>

      {/* Wallet Icon */}
      <g filter="url(#dropShadow)">
        <rect x="28" y="32" width="44" height="36" rx="8" fill="url(#logoGradient)" />
        {/* Wallet Flap/Header */}
        <path d="M28 38 H72 V44 H28 Z" fill="rgba(255,255,255,0.2)" />
        {/* Clasp Button */}
        <circle cx="64" cy="50" r="3" fill="white" />
        <circle cx="64" cy="50" r="1.5" fill="#D946EF" />
      </g>

      {/* Coin Icon overlapping wallet */}
      <g filter="url(#dropShadow)">
        <circle cx="38" cy="62" r="11" fill="#FFFFFF" />
        <circle cx="38" cy="62" r="8" fill="none" stroke="#F97316" strokeWidth="1.5" />
        <text x="38" y="67" fontSize="12" fontWeight="bold" fill="#F97316" textAnchor="middle">$</text>
      </g>

    </svg>
  );
};
