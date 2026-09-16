import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import PlannedModal from './PlannedModal';
import {
  IconPlus,
  IconCircleCheck,
  IconTrash,
  IconRepeat,
  IconClock,
} from '@tabler/icons-react';

export default function PlannedView() {
  const {
    planned,
    categories,
    accounts,
    deletePlanned,
    executePlannedPayment,
    formatCurrency,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const now = new Date();
  const todayDate = now.getDate();

  const monthlyCommittedExpense = planned
    .filter((p) => p.type === 'expense')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const monthlyCommittedIncome = planned
    .filter((p) => p.type === 'income')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const handlePayNow = (plan) => {
    executePlannedPayment(plan);
    setSuccessToast(`Payment recorded: ${plan.name} (${formatCurrency(plan.amount)})`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  return (
    <div className="planned-page">
      {/* Toast Notification */}
      {successToast && (
        <div className="toast-notification">
          <IconCircleCheck size={18} className="text-emerald" stroke={1.8} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="planned-hero glass-panel">
        <div className="planned-hero-info">
          <div className="badge badge-neutral mb-2">
            <IconRepeat size={12} stroke={1.8} />
            <span>Recurring Obligations</span>
          </div>
          <h2 className="planned-hero-title">Planned & Scheduled Cash Flow</h2>
          <p className="planned-hero-sub">
            Never miss bills, subscriptions, wages, or fixed monthly commitments
          </p>
        </div>

        <div className="planned-stats-cluster">
          <div className="planned-stat-box">
            <span className="p-stat-label">Committed Expenses:</span>
            <span className="p-stat-val text-rose">-{formatCurrency(monthlyCommittedExpense)}</span>
          </div>
          <div className="planned-stat-box">
            <span className="p-stat-label">Expected Inflow:</span>
            <span className="p-stat-val text-emerald">+{formatCurrency(monthlyCommittedIncome)}</span>
          </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <IconPlus size={16} stroke={2} />
          <span>Add Planned Item</span>
        </button>
      </div>

      {/* Grid of Planned Items */}
      <div className="planned-list-grid">
        {planned.length === 0 ? (
          <div className="empty-page-box glass-panel">
            <div className="empty-state-icon">
              <IconRepeat size={36} stroke={1.5} color="var(--phantom-purple)" />
            </div>
            <h3 className="empty-page-title">No Recurring Bills or Scheduled Inflows</h3>
            <p className="empty-page-sub">
              Plan out fixed expenses like rent, utilities, subscriptions, and regular paycheck schedules.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary mt-2"
            >
              <IconPlus size={16} stroke={2} />
              <span>Schedule First Payment</span>
            </button>
          </div>
        ) : (
          planned.map((plan) => {
          const cat = categories.find((c) => c.id === plan.categoryId) || {
            name: 'General',
            icon: 'Clock',
            color: '#3b82f6',
          };
          const acc = accounts.find((a) => a.id === plan.accountId);
          const isExpense = plan.type === 'expense';

          const daysUntil = plan.dayOfMonth - todayDate;
          let dueString = '';
          if (daysUntil === 0) dueString = 'Due Today';
          else if (daysUntil > 0) dueString = `Due in ${daysUntil} days (${plan.dayOfMonth}th)`;
          else dueString = `Due on ${plan.dayOfMonth}th (next month)`;

          return (
            <div key={plan.id} className="planned-card-item glass-panel">
              <div className="planned-card-top">
                <div
                  className="planned-cat-icon"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <CategoryIcon iconName={cat.icon} size={20} color={cat.color} />
                </div>

                <div className="planned-main-info">
                  <h3 className="planned-item-name">{plan.name}</h3>
                  <div className="planned-meta">
                    <span>{cat.name}</span>
                    <span className="meta-dot">•</span>
                    <span>{acc?.name || 'Account'}</span>
                  </div>
                </div>

                <div className="planned-amount-block">
                  <span
                    className={`planned-amount-val ${
                      isExpense ? 'text-rose' : 'text-emerald'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatCurrency(plan.amount)}
                  </span>
                  <div className="frequency-tag">Monthly</div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="planned-card-bottom">
                <div className="due-badge">
                  <IconClock size={13} stroke={1.8} />
                  <span>{dueString}</span>
                </div>

                <div className="planned-card-actions">
                  <button
                    onClick={() => handlePayNow(plan)}
                    className="btn btn-secondary btn-sm pay-now-btn"
                    title="Generate transaction now"
                  >
                    <IconCircleCheck size={14} stroke={1.8} />
                    <span>Pay Now</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${plan.name} from planned payments?`)) {
                        deletePlanned(plan.id);
                      }
                    }}
                    className="btn-tx-action delete"
                    title="Delete scheduled payment"
                  >
                    <IconTrash size={14} stroke={1.8} />
                  </button>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      <PlannedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
