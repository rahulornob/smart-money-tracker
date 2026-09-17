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
                    {(() => {
                      const isBorrow =
                        tx.type === 'transfer' &&
                        (tx.transferMode === 'borrow' || tx.status === 'borrowed' || tx.status === 'repaid');
                      const isGive =
                        tx.type === 'transfer' &&
                        (tx.transferMode === 'give' || (tx.recipient && !tx.toAccountId && !isBorrow));

                      let accountLabel = acc?.name || 'Main Account';
                      if (isBorrow) {
                        accountLabel = tx.recipient ? `Borrowed from ${tx.recipient}` : toAcc?.name || 'Account';
                      } else if (isGive) {
                        accountLabel = tx.recipient ? `To ${tx.recipient}` : fromAcc?.name || 'Account';
                      } else if (tx.type === 'transfer') {
                        accountLabel = `${fromAcc?.name || 'Account'} → ${toAcc?.name || 'Account'}`;
                      }

                      return (
                        <span className="tx-account-name">
                          {accountLabel}
                        </span>
                      );
                    })()}
                    <span className="meta-separator">•</span>
                    <span className="tx-date-label">
                      <IconClock size={11} stroke={1.8} />
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Amount display */}
                <div className="tx-amount-block">
                  {(() => {
                    const isBorrow =
                      tx.type === 'transfer' &&
                      (tx.transferMode === 'borrow' || tx.status === 'borrowed' || tx.status === 'repaid');
                    const isGive =
                      tx.type === 'transfer' &&
                      (tx.transferMode === 'give' || (tx.recipient && !tx.toAccountId && !isBorrow));

                    let amountSign = '';
                    let amountColor = 'text-transfer';
                    if (tx.type === 'income' || isBorrow) {
                      amountSign = '+';
                      amountColor = 'text-emerald';
                    } else if (tx.type === 'expense' || isGive) {
                      amountSign = '-';
                      amountColor = 'text-rose';
                    }

                    let typeBadgeText = tx.type === 'income' ? 'Income' : 'Expense';
                    let typeBadgeClass = tx.type;

                    if (isBorrow) {
                      typeBadgeText = tx.status === 'repaid' ? 'Repaid' : 'Borrowed';
                      typeBadgeClass = 'borrow';
                    } else if (isGive) {
                      typeBadgeText = tx.status === 'gift' ? 'Gift' : tx.status === 'returned' ? 'Returned' : 'Lent';
                      typeBadgeClass = 'lend';
                    } else if (tx.type === 'transfer') {
                      typeBadgeText = 'Transfer';
                      typeBadgeClass = 'transfer';
                    }

                    return (
                      <>
                        <span className={`tx-amount-value ${amountColor}`}>
                          {amountSign}
                          {formatCurrency(tx.amount)}
                        </span>
                        <div className="tx-status-indicator">
                          <span className={`type-badge-mini ${typeBadgeClass}`}>
                            {typeBadgeText}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
