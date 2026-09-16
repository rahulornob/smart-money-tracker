import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import AccountModal from './AccountModal';
import {
  IconPlus,
  IconArrowsExchange,
  IconPencil,
  IconTrash,
  IconBuildingBank,
} from '@tabler/icons-react';

export default function AccountsView({ onOpenTransfer }) {
  const {
    accounts,
    deleteAccount,
    formatCurrency,
    totalBalance,
    totalAssets,
    totalDebt,
  } = useFinance();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const handleEdit = (acc) => {
    setEditingAccount(acc);
    setIsAccountModalOpen(true);
  };

  const handleDelete = (acc) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${acc.name}"? Transactions tied directly to this account will also be removed.`
      )
    ) {
      deleteAccount(acc.id);
    }
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case 'bank':
        return 'Checking / Bank';
      case 'cash':
        return 'Physical Cash';
      case 'savings':
        return 'Savings Vault';
      case 'credit':
        return 'Credit Card';
      case 'investment':
        return 'Investment Portfolio';
      default:
        return 'Account';
    }
  };

  return (
    <div className="accounts-page">
      {/* Top Aggregate Summary Strip */}
      <div className="accounts-hero-strip glass-panel">
        <div className="strip-item">
          <div className="strip-label">Combined Net Worth</div>
          <div className="strip-val highlight">{formatCurrency(totalBalance)}</div>
        </div>
        <div className="strip-item">
          <div className="strip-label">Total Liquid Assets</div>
          <div className="strip-val">{formatCurrency(totalAssets)}</div>
        </div>
        <div className="strip-item">
          <div className="strip-label">Total Debt & Liabilities</div>
          <div className={`strip-val ${totalDebt > 0 ? 'text-rose' : ''}`}>{formatCurrency(totalDebt)}</div>
        </div>
        <div className="strip-actions">
          <button
            onClick={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <IconPlus size={16} stroke={2} />
            <span>Add Account</span>
          </button>
          <button onClick={onOpenTransfer} className="btn btn-secondary">
            <IconArrowsExchange size={16} stroke={1.8} />
            <span>Transfer Funds</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="accounts-cards-grid">
        {accounts.length === 0 ? (
          <div className="accounts-empty-full glass-panel">
            <div className="empty-state-icon">
              <IconBuildingBank size={36} stroke={1.5} color="var(--phantom-purple)" />
            </div>
            <h3 className="empty-page-title">No Financial Accounts Added</h3>
            <p className="empty-page-sub">
              Create your primary bank checking account, physical cash wallet, savings vault, or credit cards to begin tracking real balances.
            </p>
            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="btn btn-primary mt-2"
            >
              <IconPlus size={16} stroke={2} />
              <span>Add Your First Account</span>
            </button>
          </div>
        ) : (
          accounts.map((acc) => {
            const isNegative = acc.balance < 0;

            return (
              <div
                key={acc.id}
                className="wallet-card-item"
              >
                {/* Top Row: Type Badge & Action Controls */}
                <div className="card-top-row">
                  <div className="card-type-chip">
                    <div
                      className="card-type-icon-box"
                      style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                    >
                      <CategoryIcon iconName={acc.icon || 'CreditCard'} size={15} color={acc.color} />
                    </div>
                    <span className="card-type-name">{getAccountTypeLabel(acc.type)}</span>
                    {acc.excludeFromStats && (
                      <span className="card-excluded-badge" title="Excluded from net worth and statistics">
                        Off-Stats
                      </span>
                    )}
                  </div>

                  <div className="card-actions-cluster">
                    <button
                      onClick={() => handleEdit(acc)}
                      className="btn-card-action"
                      title="Edit account details"
                    >
                      <IconPencil size={14} stroke={1.8} />
                    </button>
                    <button
                      onClick={() => handleDelete(acc)}
                      className="btn-card-action delete"
                      title="Delete account"
                    >
                      <IconTrash size={14} stroke={1.8} />
                    </button>
                  </div>
                </div>

                {/* Account Name & Details */}
                <div className="card-middle-block">
                  <div className="card-name-row">
                    <span className="card-color-dot" style={{ backgroundColor: acc.color }} />
                    <h3 className="card-name-title">{acc.name}</h3>
                  </div>
                  <p className="card-sub-num">{acc.accountNumber || 'Primary Account'}</p>
                  {acc.type === 'credit' && acc.creditLimit && (
                    <div className="card-limit-note">
                      Limit: {formatCurrency(acc.creditLimit)} • Available: {formatCurrency(acc.creditLimit + acc.balance)}
                    </div>
                  )}
                </div>

                {/* Balance Block */}
                <div className="card-bottom-row">
                  <div className="card-balance-block">
                    <div className="card-balance-label">Current Balance</div>
                    <div className={`card-balance-val ${isNegative ? 'text-rose' : ''}`}>
                      {formatCurrency(acc.balance)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        editAccount={editingAccount}
      />
    </div>
  );
}
