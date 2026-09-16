import React, { useState } from 'react';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useFinance } from '../../context/FinanceContext';
import CategoryDropdown from '../common/CategoryDropdown';
import { useModalAnimation } from '../../hooks/useModalAnimation';

export default function PlannedModal({ isOpen, onClose }) {
  const { accounts, categories, addPlanned, currentCurrency } = useFinance();
  const { shouldRender, isClosing } = useModalAnimation(isOpen);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [dueDay, setDueDay] = useState(1);
  const [frequency, setFrequency] = useState('monthly');

  if (!shouldRender) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    addPlanned({
      name: name.trim(),
      amount: numAmount,
      type,
      accountId,
      categoryId,
      dueDay: parseInt(dueDay, 10),
      frequency,
      autoPay: false,
    });

    onClose();
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
      <div className={`modal-card ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3 className="modal-title">New Planned Bill or Income</h3>
          <button onClick={onClose} className="btn-icon">
            <IconX size={18} stroke={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-form">
          <div className="form-group">
            <label>Bill or Payment Name</label>
            <input
              type="text"
              placeholder="e.g. Netflix, Car Insurance, Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  const firstMatching = categories.find((c) => c.type === e.target.value);
                  if (firstMatching) setCategoryId(firstMatching.id);
                }}
                className="modal-select"
              >
                <option value="expense">Recurring Expense</option>
                <option value="income">Recurring Income</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount ({currentCurrency.symbol})</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="modal-select"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <CategoryDropdown
            categories={filteredCategories}
            selectedId={categoryId}
            onChange={setCategoryId}
            label="Category"
            required={true}
            placeholder="Choose category"
          />

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <IconCheck size={18} stroke={2} />
              <span>Create Planned Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
