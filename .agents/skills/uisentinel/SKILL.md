---
name: uisentinel
description: >-
  Visual validation and UI/UX design toolkit for AI coding agents. Use when
  designing, debugging, or validating web UI layouts, WCAG 2.1 AA accessibility,
  color contrast, multi-device responsiveness (desktop, tablet, mobile), measuring
  element dimensions and spacing, detecting UI components, or testing interactive flows.
---

# UISentinel Design & Validation Skill

UISentinel equips Antigravity with visual inspection, layout measurement, accessibility analysis, and multi-device responsive validation powered by Playwright, axe-core, and Chromium.

## When to Use UISentinel
1. **Design Audits & Refinement**: Inspecting visual hierarchy, alignment, padding, and spacing systems.
2. **Accessibility (WCAG 2.1 AA)**: Finding color contrast issues, missing ARIA tags, and semantic structure problems.
3. **Responsive & Mobile UX**: Verifying breakpoints, fixed-width elements overflowing viewports, and touch target sizes (≥ 44×44px).
4. **Before & After Validation**: Capturing baseline screenshots, making code edits, and re-validating to prove visual improvement.

---

## Quick Command Reference

All commands run against the local dev server (default: `http://localhost:5173`):

### 1. Visual Capture & Screenshots
```bash
# Multi-device screenshot capture (desktop, tablet, mobile)
npx uisentinel fullpage-multi -u http://localhost:5173/ -d desktop,tablet,mobile -e "Full baseline capture across viewports"

# Single full page screenshot
npx uisentinel fullpage -u http://localhost:5173/ -d desktop -e "Desktop page capture"

# View-by-view window scrolling
npx uisentinel views -u http://localhost:5173/ -d mobile --overlap 50
```

### 2. Accessibility & Color Contrast
```bash
# WCAG 2.1 AA automated compliance check
npx uisentinel check-accessibility -u http://localhost:5173/ -e "WCAG AA audit"

# Color contrast ratio validation (4.5:1 text, 3.0:1 large text/UI)
npx uisentinel check-contrast -u http://localhost:5173/ -e "Verify color contrast across all components"

# Visual accessibility overlay with highlighted violation badges
npx uisentinel inspect-a11y -u http://localhost:5173/ -v desktop
```

### 3. Responsive Design & Mobile UX
```bash
# Analyze responsive layout, fixed widths, and overflow
npx uisentinel analyze-responsive -u http://localhost:5173/ -v mobile -e "Detect fixed pixel widths and mobile overflow"

# Validate mobile UX: touch targets (≥ 44x44px), text readability (≥ 16px), tap collision
npx uisentinel analyze-mobile-ux -u http://localhost:5173/ -e "Validate mobile touch targets and font sizes"

# Analyze CSS media queries and breakpoint coverage
npx uisentinel analyze-media-queries -u http://localhost:5173/

# Visual breakpoint indicator overlay
npx uisentinel show-breakpoints -u http://localhost:5173/ -v mobile
```

### 4. Layout Measurement & Component Detection
```bash
# Measure element box model (dimensions, margin, padding, border)
npx uisentinel measure -u http://localhost:5173/ -s ".sidebar" -v desktop -e "Measure sidebar dimensions"

# Show 12-column grid alignment overlay
npx uisentinel show-grid -u http://localhost:5173/ --columns 12 --gutter 20

# Inspect element with Chrome DevTools-style ruler and metadata
npx uisentinel inspect-element -u http://localhost:5173/ -s ".action-bar" --show-rulers --show-info

# Detect and inventory components (buttons, links, forms, headings, navigation)
npx uisentinel detect-components -u http://localhost:5173/ --highlight
```

### 5. Interactive User Flows
```bash
# Multi-step action sequence capture (click, type, wait)
npx uisentinel inspect-sequence -u http://localhost:5173/ -s "#add-expense-btn" \
  -A "click,type:50,wait:500" --capture-intermediate -e "Test modal open and input flow"
```

---

## Designer Mental Model: Macro → Micro → Macro

1. **Macro Phase (Baseline)**: Run `check-accessibility`, `check-contrast`, and `analyze-responsive` to get health scores and identify systemic issues.
2. **Micro Phase (Targeted Fix)**: Use `measure` and `inspect-element` on specific components to inspect exact pixel values and computed CSS.
3. **Macro Phase (Verification)**: Re-run the validation command to verify score improvements and ensure zero regressions.

## Expectations Parameter `-e`
Always provide `-e, --expectations` with commands to document the hypothesis, rationale, and success criteria. Results and screenshots are saved in `./uisentinel-output/`.
