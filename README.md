# Smart Money Tracker — Wallet PRO

A state-of-the-art personal finance and money tracking application built with React, Vite, and a signature **Phantom Wallet** dark aesthetic. Designed for uncompromising speed, visual clarity, and fluid physics.

---

## ✨ Features

- **🏛️ Cockpit Dashboard**: Real-time Net Worth tracking, cash flow velocity, liquid runway, and health score ratios.
- **💳 Modern Digital Wallet Accounts**: Cash, Bank, and Credit cards with custom color spectrum selection and stats-exclusion toggles.
- **🌍 Multi-Currency**: Instant switching between currencies including Bangladeshi Taka (BDT ৳), USD ($), EUR (€), GBP (£), and more.
- **📅 Daily Spending Heatmap Calendar**: Interactive monthly calendar matrix visualizing daily cash outflow intensity with one-click date inspection.
- **💸 Peer Money Transfers**: Dedicated lending/gifting ledger tracking borrower, due dates (+7d, +14d, +30d), and repayment status.
- **🎯 Savings Goals & Vaults**: Milestone fund accumulator with celebratory canvas confetti upon goal completion.
- **📊 Spending Limits & Budgets**: Category monthly caps with real-time utilization progress bars.
- **📋 Planned Payments & Bills**: Recurring expense scheduler with one-click payment execution.
- **⚡ Fluid Animation System**: Silky entrance and exit transitions on all modals, dropdowns, and drawers with zero abrupt snaps.
- **🛡️ Phantom Wallet Aesthetic**: 100% stroke-free and shadow-free surface hierarchy with natural contrast.

---

## 🎨 Design & Animation System

This project enforces strict design and animation rules documented in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md):

- **Zero Strokes & Zero Borders**: Cards, tiles, and modals use `border: none !important;`. Contrast is driven exclusively by surface elevation (`#08080C` -> `#13141A` -> `#1C1D26` -> `#232432`).
- **Zero Box Shadows**: Crisp flat panels with zero fuzzy neon glows.
- **Mandatory Exit Transitions**: Overlays coordinate entrance and exit transitions via `useModalAnimation` (240ms exit).
- **Calibrated Easing**: Fluid Apple-inspired `cubic-bezier(0.2, 0.8, 0.2, 1)` and `cubic-bezier(0.25, 1, 0.5, 1)` curves.

To verify design system compliance:
```bash
npm run ds:lint
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/rahulornob/smart-money-tracker.git
cd smart-money-tracker
npm install
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```

### Verification & Audits
```bash
npm run ds:lint      # Design and animation system linter
npm run ui:audit     # Automated WCAG 2.1 AA accessibility audit
npm run ui:responsive # Mobile responsive overflow analysis
npm run ui:contrast  # Color contrast standards verification
```

---

## 📄 License
MIT License. Built with precision.
