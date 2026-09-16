# UI Design & Validation with UISentinel

When performing UI design, styling improvements, accessibility fixes, or responsive layout work:

## 1. Automated Validation with UISentinel
Utilize UISentinel (`npx uisentinel` or `npm run ui:*`) to measure and validate visual quality:
- **Accessibility Check**: `npm run ui:audit` (`npx uisentinel check-accessibility -u http://localhost:5173/`)
- **Color Contrast**: `npm run ui:contrast` (`npx uisentinel check-contrast -u http://localhost:5173/`)
- **Mobile Responsiveness**: `npm run ui:responsive` (`npx uisentinel analyze-responsive -u http://localhost:5173/ -v mobile`)
- **Mobile Touch Targets**: `npm run ui:mobile-ux` (`npx uisentinel analyze-mobile-ux -u http://localhost:5173/`)
- **Multi-Device Screenshots**: `npm run ui:capture` (`npx uisentinel fullpage-multi -u http://localhost:5173/ -d desktop,tablet,mobile`)
- **Element Measurement**: `npx uisentinel measure -u http://localhost:5173/ -s "<selector>"`

## 2. Design Standards & Targets
- **WCAG 2.1 AA Compliance**: All text must achieve minimum 4.5:1 contrast ratio against its background (3:1 for large text and UI components).
- **Touch Targets**: All buttons, links, tabs, and interactive elements must satisfy minimum 44×44px hit areas on mobile.
- **Fluid Layout**: Never rely on fixed pixel widths that clip or overflow on mobile screens (<400px). Use responsive grid, flex-wrap, `rem`, and percentage widths.
- **Phantom Design Style**: Deep dark background, clean stroke-free cards, subtle glow accents, rounded corners, and crisp Onest typography with Tabler icons.

## 3. Workflow
Always inspect before guessing, measure dimensions directly, and verify that changes improve validation scores without introducing regressions.
