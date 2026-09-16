# CLAUDE.md — Agent & Assistant Guidelines

## Design & Animation System Specification
This repository strictly enforces the Phantom Wallet Aesthetic specified in `DESIGN_SYSTEM.md`:

- **Borders & Strokes**: Forbidden on cards, widgets, and modals (`border: none !important;`).
- **Box Shadows & Neon Glows**: Forbidden on cards, widgets, and modals (`box-shadow: none !important;`).
- **Surface Elevation Layers**: `#08080C` (Base) -> `#13141A` (Panels) -> `#1C1D26` (Cards) -> `#232432` (Hover).
- **Animation System**:
  - Never unmount an overlay instantly without playing its exit animation.
  - Modals, dropdowns, and drawers must use `useModalAnimation.js` (240ms exit).
  - Use fluid cubic-bezier curves (`cubic-bezier(0.2, 0.8, 0.2, 1)` and `cubic-bezier(0.4, 0, 1, 1)`).
- **Verification**: Run `npm run build` and `npm run ui:audit` before finishing work.
