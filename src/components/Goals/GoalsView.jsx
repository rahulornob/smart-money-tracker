import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import GoalModal from './GoalModal';
import DepositModal from './DepositModal';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconTarget,
  IconCalendar,
  IconSparkles,
} from '@tabler/icons-react';

export default function GoalsView() {
  const { goals, deleteGoal, formatCurrency } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [depositingGoal, setDepositingGoal] = useState(null);

  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const overallSavedPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleDelete = (goal) => {
    if (window.confirm(`Delete savings goal "${goal.name}"?`)) {
      deleteGoal(goal.id);
    }
  };

  return (
    <div className="goals-page">
      {/* Hero Overview */}
      <div className="goals-hero-card glass-panel">
        <div className="goals-hero-info">
          <div className="badge badge-neutral mb-2">
            <IconTarget size={12} stroke={1.8} />
            <span>Wealth Accumulator</span>
          </div>
          <h2 className="goals-hero-title">Financial Dreams & Vaults</h2>
          <p className="goals-hero-sub">
            Track dedicated funds for long-term growth, holidays, safety nets and big purchases
          </p>

          <div className="goals-master-progress">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(overallSavedPercent, 100)}%`,
                  backgroundColor: '#AB9FF2',
                }}
              />
            </div>
            <div className="master-labels">
              <span>{formatCurrency(totalSaved)} saved</span>
              <span className="percent-text">{overallSavedPercent}% of {formatCurrency(totalTarget)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <IconPlus size={16} stroke={2} />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Grid of Goals */}
      <div className="goals-cards-grid">
        {goals.length === 0 ? (
          <div className="empty-page-box glass-panel">
            <div className="empty-state-icon">
              <IconTarget size={36} stroke={1.5} color="var(--phantom-purple)" />
            </div>
            <h3 className="empty-page-title">No Savings Goals Set</h3>
            <p className="empty-page-sub">
              Create savings milestones for an emergency buffer, travel vacation, gadget purchase, or investing.
            </p>
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="btn btn-primary mt-2"
            >
              <IconPlus size={16} stroke={2} />
              <span>Create Your First Goal</span>
            </button>
          </div>
        ) : (
          goals.map((goal) => {
          const percent = Math.min(
            Math.round((goal.currentAmount / goal.targetAmount) * 100),
            100
          );
          const isComplete = percent >= 100;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div key={goal.id} className="goal-card-box glass-panel">
              {/* Header */}
              <div className="goal-card-top">
                <div
                  className="goal-icon-circle"
                  style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                >
                  <CategoryIcon iconName={goal.icon || 'Target'} size={22} color={goal.color} />
                </div>

                <div className="goal-card-title-block">
                  <h3 className="goal-card-title">{goal.name}</h3>
                  <div className="goal-category-tag">{goal.category}</div>
                </div>

                <div className="goal-card-actions">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="btn-card-action"
                    title="Edit goal"
                  >
                    <IconPencil size={14} stroke={1.8} />
                  </button>
                  <button
                    onClick={() => handleDelete(goal)}
                    className="btn-card-action delete"
                    title="Delete goal"
                  >
                    <IconTrash size={14} stroke={1.8} />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Readout */}
              <div className="goal-middle-progress">
                <div className="goal-stat-numbers">
                  <div className="goal-saved-digits">{formatCurrency(goal.currentAmount)}</div>
                  <div className="goal-target-digits">Target: {formatCurrency(goal.targetAmount)}</div>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: goal.color || '#10b981',
                    }}
                  />
                </div>

                <div className="goal-percent-row">
                  <span className="percent-bold">{percent}% funded</span>
                  {isComplete ? (
                    <span className="goal-complete-badge">
                      <IconSparkles size={12} stroke={1.8} /> Goal Achieved!
                    </span>
                  ) : (
                    <span className="goal-remaining-text">{formatCurrency(remaining)} to go</span>
                  )}
                </div>
              </div>

              {/* Footer with target date and deposit CTA */}
              <div className="goal-card-footer">
                <div className="target-date-label">
                  <IconCalendar size={13} stroke={1.8} />
                  <span>Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>

                <button
                  onClick={() => setDepositingGoal(goal)}
                  className="btn btn-secondary btn-sm deposit-btn"
                >
                  <IconPlus size={14} stroke={2} />
                  <span>Add Funds</span>
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editGoal={editingGoal}
      />

      <DepositModal
        isOpen={Boolean(depositingGoal)}
        onClose={() => setDepositingGoal(null)}
        goal={depositingGoal}
      />
    </div>
  );
}
