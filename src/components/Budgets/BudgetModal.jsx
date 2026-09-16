import React, { useState, useEffect } from 'react';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useFinance } from '../../context/FinanceContext';
import CategoryDropdown from '../common/CategoryDropdown';
import { useModalAnimation } from '../../hooks/useModalAnimation';

export default function BudgetModal({ isOpen, onClose, editBudget = null }) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen);
  const { categories, addBudget, editBudget: updateBudget, currentCurrency } = useFinance();

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (editBudget) {
      setCategoryId(editBudget.categoryId);
      setAmount(String(editBudget.amount));
    } else {
      setCategoryId(expenseCategories[0]?.id || '');
      setAmount('300');
    }
  }, [editBudget, isOpen]);

  if (!shouldRender) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    const payload = {
      categoryId,
      amount: numAmount,
      period: 'monthly',
    };

    if (editBudget) {
      updateBudget(editBudget.id, payload);
    } else {
      addBudget(payload);
    }

    onClose();
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
      <div className={`modal-card ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3 className="modal-title">{editBudget ? 'Edit Budget' : 'Set Category Budget'}</h3>
          <button onClick={onClose} className="btn-icon">
            <IconX size={18} stroke={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-form">
          {/* Category Dropdown */}
          <CategoryDropdown
            categories={expenseCategories}
            selectedId={categoryId}
            onChange={setCategoryId}
            label="Category"
            required={true}
            placeholder="Choose category"
          />

          <div className="form-group">
            <label>Monthly Spending Limit ({currentCurrency.symbol})</label>
            <input
              type="number"
              step="10"
              min="10"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <IconCheck size={18} stroke={2} />
              <span>{editBudget ? 'Save Changes' : 'Create Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
