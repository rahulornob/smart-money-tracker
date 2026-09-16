import React, { useState, useRef } from 'react';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useFinance } from '../../context/FinanceContext';
import confetti from 'canvas-confetti';
import { useModalAnimation } from '../../hooks/useModalAnimation';

export default function DepositModal({ isOpen, onClose, goal }) {
  const { accounts, contributeToGoal, currentCurrency } = useFinance();
  const { shouldRender, isClosing } = useModalAnimation(isOpen);

  const lastGoalRef = useRef(goal);
  if (goal) {
    lastGoalRef.current = goal;
  }
  const currentGoal = goal || lastGoalRef.current;

  const [amount, setAmount] = useState('100');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');

  if (!shouldRender || !currentGoal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    contributeToGoal(currentGoal.id, numAmount, fromAccountId);

    const newTotal = currentGoal.currentAmount + numAmount;
    if (newTotal >= currentGoal.targetAmount) {
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.log('Confetti error', err);
      }
    }

    onClose();
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
      <div className={`modal-card ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3 className="modal-title">Deposit to {currentGoal.name}</h3>
          <button onClick={onClose} className="btn-icon">
            <IconX size={18} stroke={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-form">
          <div className="form-group">
            <label>Deposit Amount ({currentCurrency.symbol})</label>
            <input
              type="number"
              step="10"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Transfer From Account</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="modal-select"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({currentCurrency.symbol}{acc.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <IconCheck size={18} stroke={2} />
              <span>Confirm Deposit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
