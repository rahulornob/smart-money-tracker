import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import { IconChevronRight } from '@tabler/icons-react';

export default function DashboardGoalsWidget({ onManageGoals }) {
  const { goals, formatCurrency } = useFinance();

  return (
    <div className="goals-widget-card glass-panel">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Savings Goals</h2>
          <p className="card-subtitle">Progress on your dream milestones</p>
        </div>
        <button onClick={onManageGoals} className="btn-link-action">
          <span>All Goals</span>
          <IconChevronRight size={15} stroke={1.8} />
        </button>
      </div>

      <div className="goals-widget-grid">
        {goals.length === 0 ? (
          <div className="empty-widget-box">
            <p className="empty-widget-text">No savings goals created yet.</p>
            <button
              type="button"
              onClick={onManageGoals}
              className="btn-link-action highlight"
            >
              <span>+ Create Goal</span>
            </button>
          </div>
        ) : (
          goals.slice(0, 3).map((goal) => {
          const percent = Math.min(
            Math.round((goal.currentAmount / goal.targetAmount) * 100),
            100
          );
          const isComplete = percent >= 100;

          return (
            <div key={goal.id} className="goal-widget-item">
              <div className="goal-item-header">
                <div
                  className="goal-icon-circle"
                  style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                >
                  <CategoryIcon iconName={goal.icon || 'Target'} size={16} color={goal.color} />
                </div>
                <div className="goal-meta-title">
                  <div className="goal-name">{goal.name}</div>
                  <div className="goal-category-tag">{goal.category}</div>
                </div>
                <span className="goal-percent-pill">{percent}%</span>
              </div>

              {/* Progress bar */}
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: goal.color || '#10b981',
                  }}
                />
              </div>

              <div className="goal-values-row">
                <span className="saved-amount">{formatCurrency(goal.currentAmount)}</span>
                <span className="target-amount">Target: {formatCurrency(goal.targetAmount)}</span>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
