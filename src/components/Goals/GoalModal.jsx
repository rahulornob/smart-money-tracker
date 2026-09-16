import React, { useState, useEffect } from 'react';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useFinance } from '../../context/FinanceContext';
import ColorPicker from '../common/ColorPicker';
import { useModalAnimation } from '../../hooks/useModalAnimation';

const GOAL_ICONS = ['ShieldCheck', 'Plane', 'Laptop', 'Car', 'Home', 'GraduationCap', 'Heart', 'Sparkles'];

export default function GoalModal({ isOpen, onClose, editGoal = null }) {
  const { addGoal, editGoal: updateGoal, currentCurrency } = useFinance();
  const { shouldRender, isClosing } = useModalAnimation(isOpen);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Personal');
  const [color, setColor] = useState('#10b981');
  const [icon, setIcon] = useState(GOAL_ICONS[0]);

  useEffect(() => {
    if (editGoal) {
      setName(editGoal.name);
      setTargetAmount(String(editGoal.targetAmount));
      setCurrentAmount(String(editGoal.currentAmount || 0));
      setTargetDate(editGoal.targetDate || '');
      setCategory(editGoal.category || 'Personal');
      setColor(editGoal.color || '#10b981');
      setIcon(editGoal.icon || GOAL_ICONS[0]);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setTargetDate(nextYear.toISOString().slice(0, 10));
      setCategory('Personal');
      setColor('#10b981');
      setIcon(GOAL_ICONS[0]);
    }
  }, [editGoal, isOpen]);

  if (!shouldRender) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    const payload = {
      name: name.trim(),
      targetAmount: numTarget,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate,
      category,
      color,
      icon,
    };

    if (editGoal) {
      updateGoal(editGoal.id, payload);
    } else {
      addGoal(payload);
    }

    onClose();
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
      <div className={`modal-card ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3 className="modal-title">{editGoal ? 'Edit Savings Goal' : 'New Savings Goal'}</h3>
          <button onClick={onClose} className="btn-icon">
            <IconX size={18} stroke={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-form">
          <div className="form-group">
            <label>Goal Name</label>
            <input
              type="text"
              placeholder="e.g. Summer Vacation, Emergency Reserve"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Amount ({currentCurrency.symbol})</label>
              <input
                type="number"
                step="50"
                placeholder="5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Starting Funds ({currentCurrency.symbol})</label>
              <input
                type="number"
                step="10"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Completion Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category Tag</label>
              <input
                type="text"
                placeholder="e.g. Travel, Tech, Emergency"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="form-group">
            <ColorPicker
              value={color}
              onChange={setColor}
              label="Theme Color"
            />
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <IconCheck size={18} stroke={2} />
              <span>{editGoal ? 'Update Goal' : 'Save Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
