import React, { useState, useEffect } from 'react';
import { IconX, IconCheck, IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { useFinance } from '../../context/FinanceContext';
import ColorPicker from '../common/ColorPicker';
import { useModalAnimation } from '../../hooks/useModalAnimation';

const ACCOUNT_ICONS = [
  'Building2',
  'Wallet',
  'PiggyBank',
  'CreditCard',
  'LineChart',
  'ShieldCheck',
  'Coins',
  'Layers',
];

export default function AccountModal({ isOpen, onClose, editAccount = null }) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen);
  const { addAccount, editAccount: updateAccount, deleteAccount, currentCurrency } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#B8A9F4');
  const [icon, setIcon] = useState(ACCOUNT_ICONS[0]);
  const [excludeFromStats, setExcludeFromStats] = useState(false);

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name || '');
      setType(editAccount.type || 'bank');
      setBalance(String(editAccount.balance ?? 0));
      setCreditLimit(editAccount.creditLimit ? String(editAccount.creditLimit) : '');
      setAccountNumber(editAccount.accountNumber || '');
      setColor(editAccount.color || '#B8A9F4');
      setIcon(editAccount.icon || ACCOUNT_ICONS[0]);
      setExcludeFromStats(Boolean(editAccount.excludeFromStats));
    } else {
      setName('');
      setType('bank');
      setBalance('0');
      setCreditLimit('5000');
      setAccountNumber('');
      setColor('#B8A9F4');
      setIcon(ACCOUNT_ICONS[0]);
      setExcludeFromStats(false);
    }
  }, [editAccount, isOpen]);

  if (!shouldRender) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please provide an account name');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      initialBalance: parseFloat(balance) || 0,
      accountNumber: accountNumber.trim(),
      color,
      icon,
      excludeFromStats: Boolean(excludeFromStats),
    };

    if (type === 'credit' && creditLimit) {
      payload.creditLimit = parseFloat(creditLimit) || 0;
    }

    if (editAccount) {
      updateAccount(editAccount.id, payload);
    } else {
      addAccount(payload);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!editAccount) return;
    if (
      window.confirm(
        `Delete account "${editAccount.name}"? Transactions associated with this account will remain in history.`
      )
    ) {
      deleteAccount(editAccount.id);
      onClose();
    }
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
      <div className={`modal-card ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3 className="modal-title">
            {editAccount ? 'Edit Account' : 'Add Financial Account'}
          </h3>
          <button onClick={onClose} className="btn-icon">
            <IconX size={18} stroke={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-form">
          <div className="form-group">
            <label>Account Name</label>
            <input
              type="text"
              placeholder="e.g. City Bank, Standard Chartered, Cash Pocket"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="modal-select"
              >
                <option value="bank">Bank Account</option>
                <option value="cash">Cash Wallet</option>
                <option value="savings">Savings Vault</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment / Stocks</option>
                <option value="loan">Loan / Mortgage</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                {editAccount ? 'Current Balance' : 'Initial Balance'} ({currentCurrency.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>
          </div>

          {type === 'credit' && (
            <div className="form-group">
              <label>Credit Limit ({currentCurrency.symbol})</label>
              <input
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Account / Card Number or Details (Optional)</label>
            <input
              type="text"
              placeholder="e.g. •••• 4921 or Primary wallet"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          {/* Exclude from statistics toggle row */}
          <div className="exclude-stats-form-group">
            <div className="exclude-stats-row">
              <label className="exclude-stats-control" htmlFor="excludeFromStatsToggle">
                <input
                  type="checkbox"
                  id="excludeFromStatsToggle"
                  checked={excludeFromStats}
                  onChange={(e) => setExcludeFromStats(e.target.checked)}
                  className="exclude-stats-checkbox"
                />
                <span className="exclude-stats-track" aria-hidden="true">
                  <span className="exclude-stats-thumb"></span>
                </span>
                <span className="exclude-stats-text">Exclude from statistics</span>
              </label>
              <div
                className="exclude-stats-info"
                title="Excluded accounts won't be counted in your Net Worth, assets, debt, or cash flow statistics."
              >
                <IconInfoCircle size={15} stroke={1.8} />
              </div>
            </div>
          </div>

          {/* Rich Color Picker */}
          <div className="form-group">
            <ColorPicker
              value={color}
              onChange={setColor}
              label="Card Accent Color"
            />
          </div>

          <div className={`modal-actions-footer ${editAccount ? 'has-delete' : ''}`}>
            {editAccount && (
              <button
                type="button"
                onClick={handleDelete}
                className="modal-delete-btn"
                title="Delete this account"
              >
                <IconTrash size={16} stroke={1.8} />
                <span>Delete</span>
              </button>
            )}

            <div className="modal-actions-right">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <IconCheck size={18} stroke={2} />
                <span>{editAccount ? 'Save Changes' : 'Create Account'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
