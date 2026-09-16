import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import { IconChevronRight, IconClock, IconPlus } from '@tabler/icons-react';

export default function RecentTransactionsWidget({ onViewAll, onSelectTransaction, onAddTransaction }) {
  const { transactions, categories, accounts, formatCurrency } = useFinance();

  const recentList = transactions.slice(0, 6);

  return (
    <div className="recent-tx-card glass-panel">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Recent Transactions</h2>
          <p className="card-subtitle">Latest movements across all accounts</p>
        </div>
        <button onClick={onViewAll} className="btn-link-action">
          <span>View All</span>
          <IconChevronRight size={15} stroke={1.8} />
        </button>
      </div>

      <div className="tx-widget-list">
        {recentList.length === 0 ? (
          <div className="empty-widget-box">
            <p className="empty-widget-text">No transactions recorded yet.</p>
            {onAddTransaction && (
              <button
                type="button"
                onClick={onAddTransaction}
                className="btn-link-action highlight"
              >
                <IconPlus size={14} stroke={2} />
                <span>Add Record</span>
              </button>
            )}
          </div>
        ) : (
          recentList.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId) || {
              name: 'General',
              icon: 'HelpCircle',
              color: '#94a3b8',
            };

            const acc = accounts.find((a) => a.id === tx.accountId);
            const fromAcc = accounts.find((a) => a.id === tx.fromAccountId);
            const toAcc = accounts.find((a) => a.id === tx.toAccountId);

            const txDate = new Date(tx.date);
            const formattedDate = txDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={tx.id}
                className="tx-widget-item glass-card-interactive"
                onClick={() => onSelectTransaction && onSelectTransaction(tx)}
              >
                {/* Category Icon Badge */}
                <div
                  className="tx-category-badge"
                  style={{ backgroundColor: `${cat.color}26`, color: cat.color }}
                >
                  <CategoryIcon iconName={cat.icon} size={20} color={cat.color} />
                </div>

                {/* Description & Account */}
                <div className="tx-info-block">
                  <div className="tx-payee-name">{tx.payee || cat.name}</div>
                  <div className="tx-meta-row">
                    <span className="tx-account-name">
                      {tx.type === 'transfer'
                        ? tx.recipient
                          ? `From ${fromAcc?.name || 'Account'} to ${tx.recipient}`
                          : `${fromAcc?.name || 'Account'} → ${toAcc?.name || 'Account'}`
                        : acc?.name || 'Main Account'}
                    </span>
                    <span className="meta-separator">•</span>
                    <span className="tx-date-label">
                      <IconClock size={11} stroke={1.8} />
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Amount display */}
                <div className="tx-amount-block">
                  <span
                    className={`tx-amount-value ${
                      tx.type === 'income'
                        ? 'text-emerald'
                        : tx.type === 'expense'
                        ? 'text-rose'
                        : 'text-transfer'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {formatCurrency(tx.amount)}
                  </span>
                  <div className="tx-status-indicator">
                    {tx.type === 'transfer' ? (
                      <span className="type-badge-mini transfer">Transfer</span>
                    ) : (
                      <span className={`type-badge-mini ${tx.type}`}>
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
