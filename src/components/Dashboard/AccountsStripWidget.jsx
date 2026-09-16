import React from 'react';
import {
  IconBuildingBank,
  IconWallet,
  IconPigMoney,
  IconCreditCard,
  IconChartLine,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react';
import { useFinance } from '../../context/FinanceContext';

export default function AccountsStripWidget({ onNavigateTab }) {
  const { accounts, formatCurrency } = useFinance();

  const getAccountIcon = (acc) => {
    switch (acc.type) {
      case 'bank':
        return <IconBuildingBank size={16} color={acc.color || '#30E0A1'} stroke={1.8} />;
      case 'cash':
        return <IconWallet size={16} color={acc.color || '#10b981'} stroke={1.8} />;
      case 'savings':
        return <IconPigMoney size={16} color={acc.color || '#AB9FF2'} stroke={1.8} />;
      case 'credit':
        return <IconCreditCard size={16} color={acc.color || '#FF5C5C'} stroke={1.8} />;
      case 'investment':
        return <IconChartLine size={16} color={acc.color || '#8A81F8'} stroke={1.8} />;
      default:
        return <IconBuildingBank size={16} color="#AB9FF2" stroke={1.8} />;
    }
  };

  return (
    <div className="accounts-strip-widget glass-panel">
      <div className="accounts-strip-header">
        <div className="strip-header-title-group">
          <h3 className="widget-title">Accounts & Cash Balances</h3>
          <span className="accounts-count-tag">
            {accounts.length} {accounts.length === 1 ? 'Active Account' : 'Active Accounts'}
          </span>
        </div>
        <button
          onClick={() => onNavigateTab('accounts')}
          className="btn-link-view-all"
        >
          <span>Manage Accounts</span>
          <IconChevronRight size={14} stroke={1.8} />
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="accounts-empty-strip">
          <div className="empty-strip-desc">
            No accounts connected yet. Add your bank, cash wallet, or card to monitor balances.
          </div>
          <button
            onClick={() => onNavigateTab('accounts')}
            className="btn btn-primary btn-sm"
          >
            <IconPlus size={14} stroke={2} />
            <span>Add Account</span>
          </button>
        </div>
      ) : (
        <div className="accounts-pill-grid">
          {accounts.map((acc) => {
            const isNegative = acc.balance < 0;
            return (
              <div
                key={acc.id}
                className="account-pill-card"
                onClick={() => onNavigateTab('accounts')}
              >
                <div className="acc-pill-icon-box" style={{ backgroundColor: `${acc.color}20` }}>
                  {getAccountIcon(acc)}
                </div>
                <div className="acc-pill-info">
                  <div className="acc-pill-name">{acc.name}</div>
                  <div className={`acc-pill-bal ${isNegative ? 'text-rose' : 'text-emerald'}`}>
                    {formatCurrency(acc.balance)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

