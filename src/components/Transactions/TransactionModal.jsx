import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryDropdown from '../common/CategoryDropdown';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import {
  IconX,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconArrowsExchange,
  IconCheck,
  IconBuildingBank,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';

export default function TransactionModal({
  isOpen,
  onClose,
  initialType = 'expense',
  editTx = null,
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen);
  const {
    accounts,
    categories,
    currentCurrency,
    addTransaction,
    editTransaction,
    deleteTransaction,
    addAccount,
  } = useFinance();

  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [payee, setPayee] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('cleared'); // For transfer: 'lent', 'gift', 'cleared'. For exp/inc: 'cleared', 'pending'

  // Helper to compute ISO date string + N days
  const getFutureDate = (baseDateStr, days) => {
    const d = baseDateStr ? new Date(baseDateStr) : new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setAmount(String(editTx.amount));
      setAccountId(editTx.accountId || (accounts[0] ? accounts[0].id : ''));
      setFromAccountId(editTx.fromAccountId || (accounts[0] ? accounts[0].id : ''));
      setCategoryId(editTx.categoryId || '');
      setRecipient(editTx.recipient || '');
      setPayee(editTx.payee || '');
      setDate(editTx.date ? editTx.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setDueDate(editTx.dueDate || '');
      setNote(editTx.note || '');
      setStatus(editTx.status || (editTx.type === 'transfer' ? 'lent' : 'cleared'));
    } else {
      setType(initialType);
      setAmount('');
      const defaultAcc = accounts[0] ? accounts[0].id : '';
      setAccountId(defaultAcc);
      setFromAccountId(defaultAcc);

      const defaultCat = categories.find((c) => c.type === initialType);
      setCategoryId(defaultCat ? defaultCat.id : categories[0]?.id || '');

      setRecipient('');
      setPayee('');

      // Current local date time for input
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDate(localIso);

      // Auto capture default due date: 30 days from now for transfers
      setDueDate(getFutureDate(localIso, 30));

      setNote('');
      setStatus(initialType === 'transfer' ? 'lent' : 'cleared');
    }
  }, [editTx, initialType, isOpen, accounts, categories]);

  if (!shouldRender) return null;

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    if (type === 'transfer') {
      if (!recipient.trim()) {
        alert("Please enter the recipient's name");
        return;
      }
    }

    const payload = {
      type,
      amount: numAmount,
      date: new Date(date).toISOString(),
      note: note.trim(),
      status,
    };

    if (type === 'transfer') {
      payload.fromAccountId = fromAccountId || (accounts[0] ? accounts[0].id : '');
      payload.recipient = recipient.trim();
      payload.dueDate = dueDate || null;
      payload.payee = `Given to ${recipient.trim()}`;
      const fallbackCat = categories.find((c) => c.id === 'cat_other_exp') || categories[0];
      payload.categoryId = fallbackCat ? fallbackCat.id : 'cat_other_exp';
    } else {
      payload.accountId = accountId || (accounts[0] ? accounts[0].id : '');
      payload.categoryId = categoryId || (categories[0] ? categories[0].id : '');
      payload.payee = payee.trim() || (categories.find((c) => c.id === payload.categoryId)?.name || 'General');
    }

    if (editTx) {
      editTransaction(editTx.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!editTx) return;
    const confirmText =
      editTx.type === 'transfer'
        ? 'Delete this transfer and restore account balance?'
        : 'Delete this transaction and restore account balance?';
    if (window.confirm(confirmText)) {
      deleteTransaction(editTx.id);
      onClose();
    }
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
      <div className={`modal-card ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-row">
          <h3 className="modal-title">
            {editTx ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <IconX size={18} stroke={1.8} />
          </button>
        </div>

        {/* Type Toggle Pills */}
        <div className="tx-type-selector">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setStatus('cleared');
            }}
            className={`tx-type-btn expense ${type === 'expense' ? 'active' : ''}`}
          >
            <IconArrowDownLeft size={16} stroke={1.8} />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setStatus('cleared');
            }}
            className={`tx-type-btn income ${type === 'income' ? 'active' : ''}`}
          >
            <IconArrowUpRight size={16} stroke={1.8} />
            <span>Income</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('transfer');
              setStatus('lent');
            }}
            className={`tx-type-btn transfer ${type === 'transfer' ? 'active' : ''}`}
          >
            <IconArrowsExchange size={16} stroke={1.8} />
            <span>Transfer</span>
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="tx-modal-empty-account">
            <div className="empty-modal-icon-box">
              <IconBuildingBank size={32} stroke={1.8} color="#AB9FF2" />
            </div>
            <h4 className="empty-modal-title">No Account Found</h4>
            <p className="empty-modal-desc">
              To record real money movements, add a starter account below:
            </p>
            <div className="quick-account-btn-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const created = addAccount({
                    name: 'Primary Checking',
                    type: 'bank',
                    initialBalance: 0,
                    accountNumber: 'Primary',
                    color: '#30E0A1',
                    icon: 'Building2',
                  });
                  if (created?.id) {
                    setAccountId(created.id);
                    setFromAccountId(created.id);
                  }
                }}
              >
                <IconPlus size={15} stroke={2} />
                <span>+ Primary Checking ($0.00)</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const created = addAccount({
                    name: 'Cash Wallet',
                    type: 'cash',
                    initialBalance: 0,
                    accountNumber: 'Cash in pocket',
                    color: '#10B981',
                    icon: 'Wallet',
                  });
                  if (created?.id) {
                    setAccountId(created.id);
                    setFromAccountId(created.id);
                  }
                }}
              >
                <IconPlus size={15} stroke={2} />
                <span>+ Cash Wallet ($0.00)</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="tx-form">
            {/* Big Amount Input Field */}
            <div className="amount-input-container">
              <span className="currency-prefix">{currentCurrency.symbol}</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="big-amount-input"
                autoFocus
                required
              />
            </div>

            {/* TRANSFER MODE ("Giving money to someone") */}
            {type === 'transfer' ? (
              <>
                {/* Row 1: Source Account & Recipient Name */}
                <div className="form-row">
                  <div className="form-group">
                    <label>From Account</label>
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

                  <div className="form-group">
                    <label>
                      Recipient Name <span className="text-rose">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera, Mom, Roommate"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Date Given & Due Date */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Date Given</label>
                    <input
                      type="datetime-local"
                      value={date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setDate(newDate);
                        if (!dueDate) {
                          setDueDate(getFutureDate(newDate, 30));
                        }
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 3: Status & Note */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="modal-select"
                    >
                      <option value="lent">Lent / Due Return</option>
                      <option value="gift">Given / Gift (No return)</option>
                      <option value="cleared">Returned / Cleared</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Note (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. For concert tickets, groceries..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* EXPENSE & INCOME CONTENT */
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Account / Wallet</label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
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

                  <div className="form-group">
                    <label>Payee / Payer</label>
                    <input
                      type="text"
                      placeholder="e.g. Whole Foods, Uber, Client"
                      value={payee}
                      onChange={(e) => setPayee(e.target.value)}
                    />
                  </div>
                </div>

                {/* Dropdown Category Selector */}
                <CategoryDropdown
                  categories={filteredCategories}
                  selectedId={categoryId}
                  onChange={setCategoryId}
                  label="Category"
                  required={true}
                  placeholder="Choose"
                />

                {/* Date, Note, and Status */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Date & Time</label>
                    <input
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="modal-select"
                    >
                      <option value="cleared">Cleared / Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Note / Reference (Optional)</label>
                  <input
                    type="text"
                    placeholder="Details, receipt notes, tags..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className={`modal-actions-footer ${editTx ? 'has-delete' : ''}`}>
              {editTx && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="modal-delete-btn"
                  title="Delete this transaction"
                >
                  <IconTrash size={16} stroke={1.8} />
                  <span>Delete</span>
                </button>
              )}

              <div className="modal-actions-right">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn">
                  <IconCheck size={18} stroke={2} />
                  <span>{editTx ? 'Update Transaction' : 'Save Transaction'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
