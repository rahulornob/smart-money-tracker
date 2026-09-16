import React from 'react';

export default function WalletLogoIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="walletGrad" x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#AB9FF2" />
          <stop offset="1" stopColor="#30E0A1" />
        </linearGradient>
      </defs>
      {/* Outer Wallet Body with rounded smooth edges */}
      <rect
        x="3"
        y="6"
        width="26"
        height="20"
        rx="6"
        fill="url(#walletGrad)"
      />
      {/* Top Fold Accent */}
      <path
        d="M3 12C3 8.68629 5.68629 6 9 6H23C26.3137 6 29 8.68629 29 12V13H3V12Z"
        fill="rgba(0, 0, 0, 0.2)"
      />
      {/* Wallet Flap / Card Lock */}
      <rect
        x="17"
        y="12"
        width="12"
        height="8"
        rx="4"
        fill="#101014"
      />
      {/* Center Gem / Coin Pill */}
      <circle
        cx="21.5"
        cy="16"
        r="2"
        fill="#30E0A1"
      />
    </svg>
  );
}
