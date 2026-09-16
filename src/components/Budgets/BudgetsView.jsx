import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import BudgetModal from './BudgetModal';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconAlertTriangle,
  IconCircleCheck,
  IconCalendar,
  IconBolt,
  IconChartPie,
} from '@tabler/icons-react';

export default function BudgetsView() {
  const {
    budgets,
    categories,
    categorySpendingMap,
    deleteBudget,
    formatCurrency,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const now = new Date();
  const currentMonthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = currentMonthDays - now.getDate() + 1;

  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalBudgetedSpent = budgets.reduce((sum, b) => {
    return sum + (categorySpendingMap[b.categoryId] || 0);
  }, 0);

  const totalRemaining = Math.max(0, totalBudgeted - totalBudgetedSpent);
  const dailyBurnRate = daysLeft > 0 ? totalRemaining / daysLeft : 0;
  const overallPercent = totalBudgeted > 0 ? Math.round((totalBudgetedSpent / totalBudgeted) * 100) : 0;

  const handleEdit = (bgt) => {
    setEditingBudget(bgt);
    setIsModalOpen(true);
  };

  const handleDelete = (bgt) => {
    if (window.confirm('Delete this budget limit?')) {
      deleteBudget(bgt.id);
    }
  };

  return (
    <div className="budgets-page">
      {/* Top Banner Overview */}
      <div className="budgets-overview-hero glass-panel">
        <div className="hero-stat-main">
          <div className="badge badge-neutral mb-2">
            <IconCalendar size={12} stroke={1.8} />
            <span>{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Budget</span>
          </div>
          <div className="overview-title-val">
            <span className="spent-lead">{formatCurrency(totalBudgetedSpent)}</span>
            <span className="total-lead">of {formatCurrency(totalBudgeted)}</span>
          </div>
          <p className="overview-sub">
            {overallPercent}% of total budgeted spend used • {daysLeft} days remaining in cycle
          </p>

          {/* Master Progress */}
          <div className="progress-bar-bg master-progress">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(overallPercent, 100)}%`,
                backgroundColor: overallPercent > 100 ? '#f43f5e' : overallPercent > 80 ? '#f59e0b' : '#30E0A1',
              }}
            />
          </div>
        </div>

        {/* Burn Rate Calculator Pill */}
        <div className="burn-rate-card">
          <div className="burn-rate-icon">
            <IconBolt size={22} color="#f59e0b" stroke={1.8} />
          </div>
          <div className="burn-info">
            <div className="burn-label">Recommended Daily Limit</div>
            <div className="burn-val">{formatCurrency(dailyBurnRate)} / day</div>
            <div className="burn-sub">
              To stay within your {formatCurrency(totalBudgeted)} monthly allowance
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary btn-add-budget"
        >
          <IconPlus size={16} stroke={2} />
          <span>New Budget</span>
        </button>
      </div>

      {/* Grid of Category Budgets */}
      <div className="budget-cards-grid">
        {budgets.length === 0 ? (
          <div className="empty-page-box glass-panel">
            <div className="empty-state-icon">
              <IconChartPie size={36} stroke={1.5} color="var(--phantom-purple)" />
            </div>
            <h3 className="empty-page-title">No Active Budgets</h3>
            <p className="empty-page-sub">
              Create monthly spending limits by category (e.g. Groceries, Shopping, Entertainment) to stay in control of your spending.
            </p>
            <button
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary mt-2"
            >
              <IconPlus size={16} stroke={2} />
              <span>Create Your First Budget</span>
            </button>
          </div>
        ) : (
          budgets.map((bgt) => {
          const cat = categories.find((c) => c.id === bgt.categoryId) || {
            name: 'General',
            icon: 'PieChart',
            color: '#3b82f6',
          };
          const spent = categorySpendingMap[bgt.categoryId] || 0;
          const percentage = Math.round((spent / bgt.amount) * 100);
          const remaining = bgt.amount - spent;
          const isOver = spent > bgt.amount;
          const isWarning = percentage >= 80 && !isOver;

          let statusColor = '#30E0A1';
          if (isOver) statusColor = '#f43f5e';
          else if (isWarning) statusColor = '#f59e0b';

          const catDaily = daysLeft > 0 && remaining > 0 ? remaining / daysLeft : 0;

          return (
            <div key={bgt.id} className="budget-card-box glass-panel">
              <div className="bgt-card-header">
                <div className="bgt-cat-info">
                  <div
                    className="bgt-cat-icon-box"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <CategoryIcon iconName={cat.icon} size={20} color={cat.color} />
                  </div>
                  <div>
                    <h3 className="bgt-name">{cat.name}</h3>
                    <div className="bgt-period-tag">Monthly Cap</div>
                  </div>
                </div>

                <div className="bgt-action-btns">
                  <button
                    onClick={() => handleEdit(bgt)}
                    className="btn-card-action"
                    title="Edit budget"
                  >
                    <IconPencil size={14} stroke={1.8} />
                  </button>
                  <button
                    onClick={() => handleDelete(bgt)}
                    className="btn-card-action delete"
                    title="Delete budget"
                  >
                    <IconTrash size={14} stroke={1.8} />
                  </button>
                </div>
              </div>

              {/* Progress & Amount Block */}
              <div className="bgt-metrics-row">
                <div className="bgt-money-col">
                  <span className="spent-lead-num">{formatCurrency(spent)}</span>
                  <span className="cap-label">of {formatCurrency(bgt.amount)}</span>
                </div>
                <div
                  className="bgt-percent-pill"
                  style={{
                    backgroundColor: `${statusColor}22`,
                    color: statusColor,
                  }}
                >
                  {percentage}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </div>

              {/* Footer Status Details */}
              <div className="bgt-footer-row">
                {isOver ? (
                  <div className="status-msg over">
                    <IconAlertTriangle size={14} stroke={1.8} />
                    <span>Over budget by {formatCurrency(spent - bgt.amount)}</span>
                  </div>
                ) : (
                  <div className="status-msg safe">
                    <IconCircleCheck size={14} stroke={1.8} />
                    <span>{formatCurrency(remaining)} remaining</span>
                  </div>
                )}

                <div className="daily-allowance-tag">
                  {remaining > 0 ? `~${formatCurrency(catDaily)}/day left` : 'Limit exceeded'}
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editBudget={editingBudget}
      />
    </div>
  );
}
