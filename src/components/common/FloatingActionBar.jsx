import React, { useState, useEffect, useRef } from 'react';
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconArrowsExchange,
} from '@tabler/icons-react';

export default function FloatingActionBar({ onOpenTransaction, isModalOpen }) {
  // State for click-expanded button (for touch devices or click-to-reveal)
  const [expandedType, setExpandedType] = useState(null);
  const dockRef = useRef(null);

  // Close any click-expanded button when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setExpandedType(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  // Global keyboard shortcuts (E, I, T) when no modal or input is focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) return;

      // Ignore if typing in an input, textarea, or select
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) return;

      // Ignore modifier keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === 'e') {
        e.preventDefault();
        onOpenTransaction('expense');
      } else if (key === 'i') {
        e.preventDefault();
        onOpenTransaction('income');
      } else if (key === 't') {
        e.preventDefault();
        onOpenTransaction('transfer');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenTransaction, isModalOpen]);

  const handleActionClick = (e, type) => {
    // If running on touch device (no hover capability):
    const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
    if (isTouch) {
      if (expandedType === type) {
        onOpenTransaction(type);
        setExpandedType(null);
      } else {
        e.preventDefault();
        setExpandedType(type);
      }
    } else {
      // On desktop with hover: hover already reveals the name, so 1-click opens!
      onOpenTransaction(type);
    }
  };

  return (
    <div className="floating-action-bar-wrapper" role="region" aria-label="Quick Actions">
      <div className="floating-action-bar glass-panel-dock" ref={dockRef}>
        {/* Action 1: Transfer */}
        <button
          type="button"
          onClick={(e) => handleActionClick(e, 'transfer')}
          onMouseEnter={() => setExpandedType('transfer')}
          onMouseLeave={() => setExpandedType(null)}
          className={`floating-dock-btn dock-transfer ${expandedType === 'transfer' ? 'is-expanded' : ''}`}
          title="Transfer Money (T)"
          aria-label="Transfer Money"
        >
          <div className="dock-icon-box">
            <IconArrowsExchange size={17} stroke={2} />
          </div>
          <div className="dock-reveal-wrapper">
            <div className="dock-reveal-inner">
              <span className="dock-btn-label">Transfer</span>
              <kbd className="dock-kbd-hint">T</kbd>
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="dock-divider" aria-hidden="true" />

        {/* Action 2: Expense */}
        <button
          type="button"
          onClick={(e) => handleActionClick(e, 'expense')}
          onMouseEnter={() => setExpandedType('expense')}
          onMouseLeave={() => setExpandedType(null)}
          className={`floating-dock-btn dock-expense ${expandedType === 'expense' ? 'is-expanded' : ''}`}
          title="Add Expense (E)"
          aria-label="Add Expense"
        >
          <div className="dock-icon-box">
            <IconArrowDownLeft size={17} stroke={2} />
          </div>
          <div className="dock-reveal-wrapper">
            <div className="dock-reveal-inner">
              <span className="dock-btn-label">Expense</span>
              <kbd className="dock-kbd-hint">E</kbd>
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="dock-divider" aria-hidden="true" />

        {/* Action 3: Income */}
        <button
          type="button"
          onClick={(e) => handleActionClick(e, 'income')}
          onMouseEnter={() => setExpandedType('income')}
          onMouseLeave={() => setExpandedType(null)}
          className={`floating-dock-btn dock-income ${expandedType === 'income' ? 'is-expanded' : ''}`}
          title="Add Income (I)"
          aria-label="Add Income"
        >
          <div className="dock-icon-box">
            <IconArrowUpRight size={17} stroke={2} />
          </div>
          <div className="dock-reveal-wrapper">
            <div className="dock-reveal-inner">
              <span className="dock-btn-label">Income</span>
              <kbd className="dock-kbd-hint">I</kbd>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
