import React from 'react';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCreditCard,
  IconPigMoney,
  IconWallet,
  IconBuildingBank,
  IconChartLine,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react';
import { useFinance } from '../../context/FinanceContext';

export default function NetWorthHero({
  onNavigateTab,
  onOpenAccountModal,
}) {
  const {
    totalAssets,
    totalDebt,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthSavings,
    savingsRate,
    accounts,
    formatCurrency,
  } = useFinance();

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case 'bank':
        return 'Bank Account';
      case 'cash':
        return 'Cash Wallet';
      case 'savings':
        return 'Savings Vault';
      case 'credit':
        return 'Credit Card';
      case 'investment':
        return 'Investment';
      default:
        return 'Account';
    }
  };

  const getAccountIcon = (acc) => {
    switch (acc.type) {
      case 'bank':
        return <IconBuildingBank size={14} stroke={1.8} />;
      case 'cash':
        return <IconWallet size={14} stroke={1.8} />;
      case 'savings':
        return <IconPigMoney size={14} stroke={1.8} />;
      case 'credit':
        return <IconCreditCard size={14} stroke={1.8} />;
      case 'investment':
        return <IconChartLine size={14} stroke={1.8} />;
      default:
        return <IconBuildingBank size={14} stroke={1.8} />;
    }
  };

  return (
    <div className="net-worth-hero glass-panel">
      {/* 1. TOP MAIN SECTION: Accounts & Cards */}
      <div className="hero-accounts-section">
        <div className="accounts-strip-header">
          <div className="strip-header-title-group">
            <h2 className="widget-title">Accounts & Cards</h2>
            <span className="accounts-count-tag">
              {accounts.length} {accounts.length === 1 ? 'Active Card' : 'Active Cards'}
            </span>
          </div>
          <div className="strip-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                if (onOpenAccountModal) {
                  onOpenAccountModal();
                } else if (onNavigateTab) {
                  onNavigateTab('accounts');
                }
              }}
              className="btn-link-view-all"
              title="Add new card or account"
            >
              <IconPlus size={14} stroke={2} />
              <span>Add Card</span>
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('accounts')}
              className="btn-link-view-all"
              title="Manage all accounts"
            >
              <span>Manage Accounts</span>
              <IconChevronRight size={14} stroke={1.8} />
            </button>
          </div>
        </div>

        {/* Cards Row / Grid */}
        {accounts.length === 0 ? (
          <div className="accounts-cards-empty-container">
            <div
              className="fin-card fin-card-add-slot empty-hero-slot"
              onClick={() => {
                if (onOpenAccountModal) {
                  onOpenAccountModal();
                } else if (onNavigateTab) {
                  onNavigateTab('accounts');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="add-slot-content">
                <div className="add-slot-icon">
                  <IconPlus size={22} stroke={2} />
                </div>
                <span className="add-slot-title">Add Your First Card or Account</span>
                <span className="add-slot-desc">Connect bank account, cash wallet, or credit card</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="hero-cards-grid">
            {accounts.map((acc) => {
              const isNegative = acc.balance < 0;
              const displayDigits = acc.accountNumber
                ? acc.accountNumber.replace(/\s+/g, '').slice(-4)
                : acc.id
                ? (acc.id.replace(/\D/g, '') + '4820').slice(-4)
                : '4820';

              return (
                <div
                  key={acc.id}
                  className="fin-card"
                  style={{
                    '--card-accent': acc.color || '#AB9FF2',
                  }}
                  onClick={() => onNavigateTab && onNavigateTab('accounts')}
                  role="button"
                  tabIndex={0}
                  title={`View details for ${acc.name}`}
                >
                  {/* Top: Account Identity & Tags */}
                  <div className="fin-card-top">
                    <div className="fin-card-identity">
                      <div className="fin-card-icon-wrap">
                        {getAccountIcon(acc)}
                      </div>
                      <div className="fin-card-meta">
                        <span className="fin-card-name" title={acc.name}>
                          {acc.name}
                        </span>
                        <span className="fin-card-type-sub">
                          {getAccountTypeLabel(acc.type)}
                        </span>
                      </div>
                    </div>
                    <div className="fin-card-tags">
                      {acc.excludeFromStats && (
                        <span className="fin-card-offstats-badge">Off-Stats</span>
                      )}
                      <span className="fin-card-num-pill">
                        •••• {displayDigits}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Available Balance */}
                  <div className="fin-card-body">
                    <span className="fin-card-balance-caption">Current Balance</span>
                    <div className={`fin-card-balance-val ${isNegative ? 'text-rose' : ''}`}>
                      {formatCurrency(acc.balance)}
                    </div>
                  </div>

                  {/* Footer: Contextual info or Credit Bar */}
                  <div className="fin-card-footer">
                    {acc.type === 'credit' && acc.creditLimit ? (
                      <div className="fin-card-credit-line">
                        <div className="credit-line-labels">
                          <span>Limit: {formatCurrency(acc.creditLimit)}</span>
                          <span>{Math.round((Math.abs(acc.balance) / acc.creditLimit) * 100)}% Used</span>
                        </div>
                        <div className="credit-progress-bar">
                          <div
                            className="credit-progress-fill"
                            style={{
                              width: `${Math.min(100, Math.max(0, (Math.abs(acc.balance) / acc.creditLimit) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="fin-card-footer-info">
                        <div className="fin-card-status-indicator">
                          <span className="fin-card-status-dot" />
                          <span className="fin-card-status-text">Active</span>
                        </div>
                        <span className="fin-card-view-hint">
                          Manage <IconChevronRight size={12} stroke={2} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick "+ Add Card" slot in the cards carousel */}
            <div
              className="fin-card fin-card-add-slot"
              onClick={() => {
                if (onOpenAccountModal) {
                  onOpenAccountModal();
                } else if (onNavigateTab) {
                  onNavigateTab('accounts');
                }
              }}
              role="button"
              tabIndex={0}
              title="Add another card or account"
            >
              <div className="add-slot-content">
                <div className="add-slot-icon">
                  <IconPlus size={18} stroke={2} />
                </div>
                <span className="add-slot-title">Add Card</span>
                <span className="add-slot-desc">Bank, wallet or credit</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. DIRECTLY AFTER: Key Metrics Grid (Total, Debt, Monthly Net, Income vs Spending) */}
      <div className="hero-metrics-grid">
        {/* 1. Total Assets */}
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-title">Total Assets</span>
            <IconPigMoney size={16} className="metric-icon-muted" stroke={1.8} />
          </div>
          <div className="metric-value">{formatCurrency(totalAssets)}</div>
          <div className="metric-note">Cash, savings, investments</div>
        </div>

        {/* 2. Total Debt */}
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-title">Total Debt</span>
            <IconCreditCard size={16} className="metric-icon-muted" stroke={1.8} />
          </div>
          <div className={`metric-value ${totalDebt > 0 ? 'text-rose' : ''}`}>
            {formatCurrency(totalDebt)}
          </div>
          <div className="metric-note">Credit cards & credit lines</div>
        </div>

        {/* 3. This Month Net */}
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-title">This Month Net</span>
            {currentMonthSavings >= 0 ? (
              <IconTrendingUp size={16} className="metric-icon-pos" stroke={1.8} />
            ) : (
              <IconTrendingDown size={16} className="metric-icon-neg" stroke={1.8} />
            )}
          </div>
          <div className="metric-value">
            {formatCurrency(currentMonthSavings, { showPositiveSign: true })}
          </div>
          <div className="metric-note">
            Savings Rate: <span className="highlight-tag">{savingsRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* 4. Income vs Spending */}
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-title">Income vs Spending</span>
            <span className="period-pill">This Month</span>
          </div>
          <div className="cashflow-mini-stats">
            <div className="cashflow-stat-row">
              <span className="stat-label">
                <span className="stat-dot in"></span>
                In:
              </span>
              <span className="stat-val">{formatCurrency(currentMonthIncome)}</span>
            </div>
            <div className="cashflow-stat-row">
              <span className="stat-label">
                <span className="stat-dot out"></span>
                Out:
              </span>
              <span className="stat-val">{formatCurrency(currentMonthExpense)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
