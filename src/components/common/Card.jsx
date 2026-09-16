import React from 'react';

/**
 * Universal Card Primitive — Standard Design System Component
 * Enforces stroke-free, shadow-free styling and dark surface elevation.
 */
export default function Card({
  children,
  elevation = 2, // 1 = surface (#13141a), 2 = card (#1c1d26)
  interactive = false,
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const elevationClass = elevation === 1 ? 'ds-card-surface' : 'ds-card-elevated';
  const interactiveClass = interactive ? 'ds-card-interactive' : '';

  return (
    <div
      className={`ds-card ${elevationClass} ${interactiveClass} ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
