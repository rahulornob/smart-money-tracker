---
description: Mandatory rules for design aesthetics, color contrast, and animation physics in this repository
globs: ["src/**/*.{js,jsx,ts,tsx,css}"]
---

# Design & Animation System Rules

## Visual Guidelines
1. **Never add borders or strokes** to cards, tiles, or modals (`border: none !important;`).
2. **Never add box shadows or fuzzy glows** (`box-shadow: none !important;`).
3. Contrast is achieved through the 4-tier dark surface hierarchy:
   - Base canvas: `#08080C`
   - Panels & sheets: `#13141A`
   - Elevated cards & tiles: `#1C1D26`
   - Hovered cards & rows: `#232432`

## Animation Guidelines
1. **Never unmount overlays abruptly on close**:
   - Always integrate `src/hooks/useModalAnimation.js` or `<Modal />` primitive.
   - Modals and drawers must animate closed (`0.24s`) before DOM unmount.
2. **Always use calibrated cubic-bezier curves**:
   - Entrance: `0.35s cubic-bezier(0.2, 0.8, 0.2, 1)`
   - Exit: `0.24s cubic-bezier(0.4, 0, 1, 1)`
   - Hover: `0.22s cubic-bezier(0.25, 1, 0.5, 1)`

## Verification
- Must pass `npm run build` and `npm run ui:audit` (0 accessibility violations).
