# Money Tracker — Design & Animation System Specification

This document defines the **single source of truth** for all visual design, layout patterns, and animation physics across this application. **Every developer, tool, and AI assistant MUST strictly follow these rules.**

---

## 1. Absolute Golden Rules (Zero Exceptions)

### Rule 1: STRICTLY ZERO STROKES / ZERO BORDERS on Cards, Tiles, & Modals
- **PROHIBITED**: `border: 1px solid ...`, `border: 2px ...`, outline borders, border dividers between card sections.
- **REQUIRED**: `border: none !important;`.
- **How contrast is achieved**: Contrast is created exclusively through **Surface Elevation Layers** (`#08080c` -> `#13141a` -> `#1c1d26` -> `#232432`), soft ambient radial tints, and typographic hierarchy. Never draw borders to separate surfaces.

### Rule 2: STRICTLY ZERO FUZZY BOX SHADOWS OR NEON GLOWS
- **PROHIBITED**: `box-shadow: 0 0 15px rgba(...)`, neon colored glows, drop shadows on flat cards.
- **REQUIRED**: `box-shadow: none !important;` on cards, tiles, and widgets.
- Clean flat surfaces evoke the modern, high-precision Phantom wallet digital aesthetic.

### Rule 3: STRICTLY NEVER UNMOUNT AN OVERLAY INSTANTLY ON CLOSE
- **PROHIBITED**: `if (!isOpen) return null;` directly on modals, dropdowns, drawers, or sheets without an exit transition.
- **REQUIRED**: ALWAYS use the [`useModalAnimation`](file:///Users/user/Desktop/untitled%20folder/src/hooks/useModalAnimation.js) hook or wrap content with `<Modal isOpen={isOpen} onClose={onClose}>`.
- The closing animation MUST play completely (`0.20s - 0.24s`) before unmounting from the DOM.

### Rule 4: NEVER USE INSTANT OR ABRUPT ANIMATION EASING
- **PROHIBITED**: `transition: all 0.1s ease;`, linear transitions, or over-accelerated easing that finishes travel in <60ms.
- **REQUIRED**: Use calibrated fluid cubic-bezier curves:
  - Entrance: `0.32s - 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)` (luxurious decelerating glide).
  - Exit: `0.20s - 0.24s cubic-bezier(0.4, 0, 1, 1)` (snappy clean departure).
  - Interactive Hover/Focus: `0.22s - 0.30s cubic-bezier(0.25, 1, 0.5, 1)` (smooth Apple-like responsiveness).

---

## 2. Color System & Surface Hierarchy

The design system is built on a 4-tier dark surface hierarchy inspired by the Phantom crypto wallet.

| Elevation Level | Variable | Hex / RGBA | Role / Usage |
|---|---|---|---|
| **Level 0 (Base)** | `--bg-primary` | `#08080C` | Deepest canvas background, full screen wrapper |
| **Level 1 (Panels)** | `--bg-surface` | `#13141A` | Hero cockpit, sidebar, main panels, modal cards |
| **Level 2 (Cards)** | `--bg-card` | `#1C1D26` | Financial cards, metric tiles, transaction rows |
| **Level 2 (Hover)** | `--bg-card-hover` | `#232432` | Hovered state for cards, rows, and buttons |
| **Level 3 (Popovers)** | `--bg-modal-overlay` | `rgba(8, 8, 12, 0.78)` | Backdrop blur overlay with `backdrop-filter: blur(12px)` |

### Accent Colors (Vibrant & High-Contrast)
- **Phantom Lilac / Purple**: `#AB9FF2` (primary brand accent, active tabs, badges, highlights)
- **Phantom Mint / Emerald**: `#30E0A1` (positive cash flow, income, assets, savings streaks)
- **Phantom Coral / Rose**: `#FF5C5C` (outflow, expenses, debt, high-intensity spend days)
- **Phantom Amber / Gold**: `#FBBF24` (pending states, alerts, milestone targets)
- **Phantom Sky**: `#38BDF8` (transfer indicators, planned bills)

### Typography
- **Font Family**: `'Onest', -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`
- **Weights**:
  - Regular (`400`): Secondary body, descriptions, notes
  - Medium (`500`): Labels, table headers, subtitles
  - SemiBold (`600`): Card headers, button labels, badges
  - Bold (`700`): Hero balances, metric figures, key titles

---

## 3. Standard Animation Physics & Tokens

### CSS Animation Tokens (defined in `src/index.css`)
```css
--transition-fast: 0.22s cubic-bezier(0.25, 1, 0.5, 1);
--transition-normal: 0.3s cubic-bezier(0.25, 1, 0.5, 1);
--transition-fluid: 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
```

### Standard Keyframe Animations

| Animation Name | Duration & Curve | Start State | End State | Used In |
|---|---|---|---|---|
| `modalFadeIn` | `0.32s cubic-bezier(0.2, 0.8, 0.2, 1)` | `opacity: 0` | `opacity: 1` | Modal backdrops, sheets |
| `modalFadeOut` | `0.24s cubic-bezier(0.4, 0, 1, 1)` | `opacity: 1` | `opacity: 0` | Closing backdrops |
| `modalSlideUp` | `0.35s cubic-bezier(0.2, 0.8, 0.2, 1)` | `translateY(22px) scale(0.96); opacity: 0` | `translateY(0) scale(1); opacity: 1` | Modal cards entrance |
| `modalSlideDown` | `0.24s cubic-bezier(0.4, 0, 1, 1)` | `translateY(0) scale(1); opacity: 1` | `translateY(18px) scale(0.97); opacity: 0` | Modal cards exit |
| `dropdownOpen` | `0.28s cubic-bezier(0.2, 0.8, 0.2, 1)` | `translateY(-8px) scale(0.97); opacity: 0` | `translateY(0) scale(1); opacity: 1` | Dropdowns, popovers |
| `dropdownClose` | `0.20s cubic-bezier(0.4, 0, 1, 1)` | `translateY(0) scale(1); opacity: 1` | `translateY(-6px) scale(0.97); opacity: 0` | Closing dropdowns |
| `sheetSlideUp` | `0.35s cubic-bezier(0.2, 0.8, 0.2, 1)` | `translateY(100%); opacity: 0` | `translateY(0); opacity: 1` | Mobile bottom drawer |
| `sheetSlideDown` | `0.24s cubic-bezier(0.4, 0, 1, 1)` | `translateY(0); opacity: 1` | `translateY(100%); opacity: 0` | Mobile drawer exit |
| `pageFadeSlide` | `0.34s cubic-bezier(0.22, 1, 0.36, 1)` | `translateY(8px); opacity: 0` | `translateY(0); opacity: 1` | Tab page view switches |

---

## 4. Reusable Component Patterns

### 1. Modal Dialog Pattern
Always use `useModalAnimation` to manage entrance & exit:
```jsx
import { useModalAnimation } from '../../hooks/useModalAnimation';

export default function CustomModal({ isOpen, onClose }) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen);
  if (!shouldRender) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
      <div className={`modal-card ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Modal content */}
      </div>
    </div>
  );
}
```

### 2. Stroke-Free Card Pattern
```jsx
<div className="fin-card">
  {/* Header with Account/Entity identity icon and badge */}
  {/* Hero Balance / Main Data Point */}
  {/* Contextual Status footer */}
</div>
```
CSS Rules:
- `border: none !important;`
- `box-shadow: none !important;`
- `border-radius: var(--radius-xl);` (28px for heroes, 20px for cards)
- `background: #1c1d26;`

### 3. Interactive Buttons & Pills
- Use `border-radius: var(--radius-full);` (pill shape).
- Transitions: `transition: all var(--transition-fast);`.
- Hover states must change background subtly (`rgba(255, 255, 255, 0.08)` or accent tint) without layout shifting or lifting (`transform: translateY(-2px)` max).

---

## 5. Mandatory Verification Checklist

Before completing any task, every AI or developer must run:
1. **`npm run build`**: Must compile production bundle cleanly with 0 errors.
2. **`npm run ui:audit`**: Must report **0 accessibility violations** (WCAG 2.1 AA).
3. **`npm run ui:responsive`**: Must confirm **0 horizontal overflows** across mobile & desktop viewports.
4. **Visual Inspection**: All cards and modals must have **zero strokes** and **zero drop shadows**.
