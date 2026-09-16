import React from 'react';
import {
  IconPlus,
  IconSun,
  IconMoon,
  IconCoins,
  IconChevronDown,
  IconWallet,
} from '@tabler/icons-react';
import { useFinance } from '../context/FinanceContext';
import { CURRENCIES } from '../data/initialData';

export default function Header({ activeTab, onOpenTransactionModal }) {
  const { theme, toggleTheme, currency, setCurrency } = useFinance();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Financial Cockpit', sub: 'Overview of your net worth, cashflow & budgets' };
      case 'transactions':
        return { title: 'Transactions Ledger', sub: 'Categorized spending, income & history' };
      case 'accounts':
        return { title: 'Accounts & Cards', sub: 'Manage bank, cash, savings & credit lines' };
      case 'budgets':
        return { title: 'Budgets & Limits', sub: 'Monthly spending caps & category control' };
      case 'planned':
        return { title: 'Planned & Recurring Bills', sub: 'Upcoming bills, subscriptions & wages' };
      case 'goals':
        return { title: 'Savings Goals', sub: 'Emergency funds, vacations & financial milestones' };
      case 'analytics':
        return { title: 'Analytics & Reports', sub: 'Deep spending structure and cashflow trends' };
      default:
        return { title: 'Money Tracker', sub: 'Smart personal wealth management' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header className="app-header">
      <div className="header-title-block">
        <h1 className="header-title">{pageInfo.title}</h1>
        <p className="header-subtitle">{pageInfo.sub}</p>
      </div>

      <div className="header-actions">
        {/* User Account Capsule in Phantom Stroke-Free Pill Style */}
        <div className="phantom-account-chip" title="Active Financial Profile">
          <div className="phantom-chip-avatar">
            <IconWallet size={14} color="#FFFFFF" stroke={1.8} />
          </div>
          <div className="phantom-chip-text">
            <span className="phantom-chip-label">Personal Account</span>
            <span className="phantom-chip-addr">All Wallets • {currency}</span>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="currency-selector-wrapper">
          <IconCoins size={16} className="currency-icon" stroke={1.8} />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="currency-select"
            title="Change active currency"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
          <IconChevronDown size={14} className="select-arrow" stroke={1.8} />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <IconSun size={18} stroke={1.8} /> : <IconMoon size={18} stroke={1.8} />}
        </button>

        {/* Primary CTA: Add Transaction */}
        <button
          onClick={onOpenTransactionModal}
          className="btn btn-primary add-record-btn"
        >
          <IconPlus size={18} stroke={2} />
          <span>Add Record</span>
        </button>
      </div>
    </header>
  );
}

