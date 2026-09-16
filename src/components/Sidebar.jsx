import React from 'react';
import {
  IconLayoutDashboard,
  IconReceipt,
  IconCreditCard,
  IconChartPie,
  IconCalendarTime,
  IconTarget,
  IconChartBar,
  IconReload,
} from '@tabler/icons-react';
import { useFinance } from '../context/FinanceContext';
import WalletLogoIcon from './common/WalletLogoIcon';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { totalBalance, formatCurrency, resetToDemoData } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: IconReceipt },
    { id: 'accounts', label: 'Accounts & Cards', icon: IconCreditCard },
    { id: 'budgets', label: 'Budgets & Limits', icon: IconChartPie },
    { id: 'planned', label: 'Planned & Bills', icon: IconCalendarTime },
    { id: 'goals', label: 'Savings Goals', icon: IconTarget },
    { id: 'analytics', label: 'Reports & Analytics', icon: IconChartBar },
  ];

  return (
    <aside className="sidebar-container">
      {/* Brand Logo Header */}
      <div className="brand-header">
        <div className="brand-logo-badge">
          <WalletLogoIcon size={26} />
        </div>
        <div>
          <div className="brand-title">
            Wallet<span className="brand-pro-tag">PRO</span>
          </div>
          <div className="brand-sub">Smart Money Tracker</div>
        </div>
      </div>

      {/* Net Balance Mini Widget */}
      <div className="sidebar-balance-widget">
        <div className="balance-label">Total Net Worth</div>
        <div className="balance-amount">{formatCurrency(totalBalance)}</div>
        <div className="balance-status">
          <span className="dot-pulse"></span>
          <span>All Accounts Synced</span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="nav-menu">
        <div className="nav-section-title">MAIN MENU</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
              {isActive && <span className="nav-active-pill" />}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button
          onClick={() => {
            if (window.confirm('Clear and reset all tracker data to clean empty state?')) {
              resetToDemoData();
            }
          }}
          className="btn-demo-reset"
          title="Reset tracker data"
        >
          <IconReload size={14} />
          <span>Clear / Reset Data</span>
        </button>
        <div className="sidebar-version">v2.4.0 • Enterprise Encryption</div>
      </div>
    </aside>
  );
}
