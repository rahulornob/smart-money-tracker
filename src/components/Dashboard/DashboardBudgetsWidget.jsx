import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import { IconChevronRight, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';

export default function DashboardBudgetsWidget({ onManageBudgets }) {
  const { budgets, categories, categorySpendingMap, formatCurrency } = useFinance();

  const activeBudgets = budgets.slice(0, 4);

  return (
    <div className="budget-widget-card glass-panel">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Monthly Budgets</h2>
          <p className="card-subtitle">Spending limits & allowance left</p>
        </div>
        <button onClick={onManageBudgets} className="btn-link-action">
          <span>Manage</span>
          <IconChevronRight size={15} stroke={1.8} />
        </button>
      </div>

      <div className="budget-widget-list">
        {activeBudgets.length === 0 ? (
          <div className="empty-widget-box">
            <p className="empty-widget-text">No active category budgets.</p>
            <button
              type="button"
              onClick={onManageBudgets}
              className="btn-link-action highlight"
            >
              <span>+ Set Budget</span>
            </button>
          </div>
        ) : (
          activeBudgets.map((bgt) => {
          const cat = categories.find((c) => c.id === bgt.categoryId) || {
            name: 'Category',
            icon: 'PieChart',
            color: '#3b82f6',
          };
          const spent = categorySpendingMap[bgt.categoryId] || 0;
          const percentage = Math.min(Math.round((spent / bgt.amount) * 100), 100);
          const isOver = spent > bgt.amount;
          const isWarning = percentage >= 80 && !isOver;

          let statusColor = '#10b981';
          if (isOver) statusColor = '#f43f5e';
          else if (isWarning) statusColor = '#f59e0b';

          return (
            <div key={bgt.id} className="budget-item-row">
              <div className="budget-row-top">
                <div className="budget-cat-name">
                  <div
                    className="budget-mini-icon"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <CategoryIcon iconName={cat.icon} size={14} color={cat.color} />
                  </div>
                  <span>{cat.name}</span>
                </div>
                <div className="budget-amount-split">
                  <span className="spent-val">{formatCurrency(spent)}</span>
                  <span className="budget-divider">/</span>
                  <span className="limit-val">{formatCurrency(bgt.amount)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </div>

              {/* Status footer */}
              <div className="budget-row-footer">
                <span className="budget-percent-label">{percentage}% used</span>
                <span className={`budget-status-label ${isOver ? 'over' : isWarning ? 'warn' : 'ok'}`}>
                  {isOver ? (
                    <>
                      <IconAlertCircle size={12} stroke={1.8} /> Over by {formatCurrency(spent - bgt.amount)}
                    </>
                  ) : (
                    <>
                      <IconCircleCheck size={12} stroke={1.8} /> {formatCurrency(bgt.amount - spent)} left
                    </>
                  )}
                </span>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
