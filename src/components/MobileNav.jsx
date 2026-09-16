import React, { useState } from 'react';
import {
  IconLayoutDashboard,
  IconReceipt,
  IconCreditCard,
  IconDots,
  IconPlus,
  IconChartPie,
  IconTarget,
  IconCalendarEvent,
  IconChartBar,
  IconX,
  IconRotateClockwise,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconArrowsExchange,
} from '@tabler/icons-react';
import { useFinance } from '../context/FinanceContext';
import { useModalAnimation } from '../hooks/useModalAnimation';

export default function MobileNav({ activeTab, setActiveTab, onOpenNewTransaction }) {
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { shouldRender: shouldRenderMore, isClosing: isClosingMore } = useModalAnimation(showMoreSheet, 220);
  const { shouldRender: shouldRenderQuick, isClosing: isClosingQuick } = useModalAnimation(showQuickActions, 220);
  const { resetToDemoData } = useFinance();

  const isMoreActive = ['budgets', 'planned', 'goals', 'analytics'].includes(activeTab);

  const moreItems = [
    { id: 'budgets', label: 'Budgets & Limits', sub: 'Monthly spending caps', icon: IconChartPie, color: '#AB9FF2' },
    { id: 'planned', label: 'Planned & Bills', sub: 'Upcoming recurring expenses', icon: IconCalendarEvent, color: '#38BDF8' },
    { id: 'goals', label: 'Savings Goals', sub: 'Milestones & funds', icon: IconTarget, color: '#30E0A1' },
    { id: 'analytics', label: 'Analytics & Reports', sub: 'Cash flow & categories', icon: IconChartBar, color: '#FBBF24' },
  ];

  const handleSelectMore = (tabId) => {
    setActiveTab(tabId);
    setShowMoreSheet(false);
  };

  return (
    <>
      <nav className="mobile-bottom-nav">
        {/* Slot 1: Home */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setShowMoreSheet(false);
          }}
          className={`mobile-nav-btn ${activeTab === 'dashboard' && !showMoreSheet ? 'active' : ''}`}
        >
          <IconLayoutDashboard size={20} stroke={1.8} />
          <span>Home</span>
        </button>

        {/* Slot 2: Ledger */}
        <button
          onClick={() => {
            setActiveTab('transactions');
            setShowMoreSheet(false);
          }}
          className={`mobile-nav-btn ${activeTab === 'transactions' && !showMoreSheet ? 'active' : ''}`}
        >
          <IconReceipt size={20} stroke={1.8} />
          <span>Ledger</span>
        </button>

        {/* Slot 3: Center FAB & Quick Actions Speed Dial */}
        <div className="mobile-fab-wrapper">
          {shouldRenderQuick && (
            <div
              className={`mobile-quick-actions-backdrop ${isClosingQuick ? 'is-closing' : ''}`}
              onClick={() => setShowQuickActions(false)}
            >
              <div
                className={`mobile-quick-actions-menu ${isClosingQuick ? 'is-closing' : ''}`}
                onClick={(e) => e.stopPropagation()}
                role="menu"
                aria-label="New Transaction Type"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenNewTransaction('expense');
                  }}
                  className="mobile-quick-action-item quick-expense"
                  role="menuitem"
                >
                  <div className="mobile-quick-icon-box expense">
                    <IconArrowDownLeft size={18} stroke={2} />
                  </div>
                  <span className="mobile-quick-label">Expense</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenNewTransaction('income');
                  }}
                  className="mobile-quick-action-item quick-income"
                  role="menuitem"
                >
                  <div className="mobile-quick-icon-box income">
                    <IconArrowUpRight size={18} stroke={2} />
                  </div>
                  <span className="mobile-quick-label">Income</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenNewTransaction('transfer');
                  }}
                  className="mobile-quick-action-item quick-transfer"
                  role="menuitem"
                >
                  <div className="mobile-quick-icon-box transfer">
                    <IconArrowsExchange size={18} stroke={2} />
                  </div>
                  <span className="mobile-quick-label">Transfer</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowQuickActions((prev) => !prev)}
            className={`mobile-fab-btn ${showQuickActions ? 'open' : ''}`}
            aria-label={showQuickActions ? 'Close quick actions' : 'Add new transaction'}
            aria-expanded={showQuickActions}
          >
            <IconPlus
              size={24}
              stroke={2.2}
              style={{
                transform: showQuickActions ? 'rotate(45deg)' : 'none',
                transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </button>
        </div>

        {/* Slot 4: Cards / Accounts */}
        <button
          onClick={() => {
            setActiveTab('accounts');
            setShowMoreSheet(false);
          }}
          className={`mobile-nav-btn ${activeTab === 'accounts' && !showMoreSheet ? 'active' : ''}`}
        >
          <IconCreditCard size={20} stroke={1.8} />
          <span>Cards</span>
        </button>

        {/* Slot 5: More */}
        <button
          onClick={() => setShowMoreSheet((prev) => !prev)}
          className={`mobile-nav-btn ${isMoreActive || showMoreSheet ? 'active' : ''}`}
        >
          <IconDots size={20} stroke={1.8} />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-Up "More" Sheet for Mobile */}
      {shouldRenderMore && (
        <div className={`mobile-more-overlay ${isClosingMore ? 'is-closing' : ''}`} onClick={() => setShowMoreSheet(false)}>
          <div className={`mobile-more-sheet ${isClosingMore ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="more-sheet-header">
              <span className="more-sheet-title">More Navigation</span>
              <button
                onClick={() => setShowMoreSheet(false)}
                className="btn-icon"
                aria-label="Close menu"
              >
                <IconX size={18} stroke={1.8} />
              </button>
            </div>

            <div className="more-sheet-grid">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMore(item.id)}
                    className={`more-sheet-item ${isActive ? 'active' : ''}`}
                  >
                    <div
                      className="more-item-icon-box"
                      style={{ backgroundColor: `${item.color}18`, color: item.color }}
                    >
                      <Icon size={22} stroke={1.8} />
                    </div>
                    <div className="more-item-info">
                      <span className="more-item-name">{item.label}</span>
                      <span className="more-item-sub">{item.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="more-sheet-footer">
              <button
                onClick={() => {
                  if (window.confirm('Clear and reset all tracker data to clean empty state?')) {
                    resetToDemoData();
                    setShowMoreSheet(false);
                  }
                }}
                className="btn-demo-reset-mobile"
              >
                <IconRotateClockwise size={16} stroke={1.8} />
                <span>Clear / Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
