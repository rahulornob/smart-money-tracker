# Project Guidelines & Agent Instructions

## Mandatory Design & Animation System Rules
Any AI agent or tool working in this codebase **MUST STRICTLY COMPLY** with the following system rules defined in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md):

### 1. Zero Strokes & Zero Borders (Absolute Constraint)
- **STRICTLY FORBIDDEN**: Never add borders or strokes (`border: 1px solid...`, `border: 2px...`) to cards, tiles, slots, modals, or widgets.
- **MANDATORY**: Apply `border: none !important;`. Separation must rely exclusively on surface background contrast (`#08080c` -> `#13141a` -> `#1c1d26` -> `#232432`).

### 2. Zero Box Shadows & Zero Fuzzy Neon Glows
- **STRICTLY FORBIDDEN**: Never add drop shadows, fuzzy colored neon glows, or multi-pixel outer blurs to cards or panels.
- **MANDATORY**: Apply `box-shadow: none !important;`. The visual aesthetic must remain crisp, flat, and elegant (Phantom wallet signature aesthetic).

### 3. Butter-Smooth Animations & Mandatory Exit Transitions
- **STRICTLY FORBIDDEN**: Never instantly unmount any modal, dropdown, drawer, or popover (`if (!isOpen) return null;` on the first frame).
- **MANDATORY**: All overlays must use [`useModalAnimation.js`](./src/hooks/useModalAnimation.js) or `<Modal />` primitive to play a `0.24s` exit animation before DOM unmounting.
- **MANDATORY**: Easing curves must be fluid cubic-bezier curves:
  - Entrance: `0.32s - 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)`
  - Exit: `0.20s - 0.24s cubic-bezier(0.4, 0, 1, 1)`
  - Interactive Hover: `0.22s - 0.30s cubic-bezier(0.25, 1, 0.5, 1)`

### 4. Component Patterns
- **Cards**: Flat `#1c1d26` surface, `border-radius: 20px`, `border: none !important; box-shadow: none !important;`.
- **Modals**: Centered, `border: none !important; box-shadow: none !important;`, entrance (`modalSlideUp`), exit (`modalSlideDown`).
- **Interactive Buttons**: Pill rounded (`border-radius: 9999px`), smooth transitions (`var(--transition-fast)`).

---

## Verification Commands
Before declaring any task complete, always execute:
- `npm run build` - Validates Vite production build with 0 errors.
- `npm run ui:audit` - Automated WCAG 2.1 AA accessibility audit (must be 0 violations).
- `npm run ui:responsive` - Analyzes mobile layout to ensure zero horizontal overflow.
- `npm run ui:contrast` - Verifies WCAG color contrast standards across all elements.
