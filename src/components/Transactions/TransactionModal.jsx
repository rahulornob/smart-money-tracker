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
  initialType = 'transfer',
  editTx = null,
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen);
  const {
    accounts: rawAccounts,
    categories: rawCategories,
    currentCurrency,
    addTransaction,
    editTransaction,
    deleteTransaction,
    addAccount,
  } = useFinance();

  const accounts = Array.isArray(rawAccounts) ? rawAccounts : [];
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  const [type, setType] = useState(initialType);
  const [transferMode, setTransferMode] = useState('give'); // 'give' | 'borrow' | 'internal'
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [payee, setPayee] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('cleared'); // For give: 'lent', 'returned', 'gift'. For borrow: 'borrowed', 'repaid'. For others: 'cleared', 'pending'

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
      const defAcc = accounts[0] ? accounts[0].id : '';
      const defToAcc = accounts[1] ? accounts[1].id : defAcc;
      setAccountId(editTx.accountId || defAcc);
      setFromAccountId(editTx.fromAccountId || defAcc);
      setToAccountId(editTx.toAccountId || defToAcc);
      setCategoryId(editTx.categoryId || '');
      setRecipient(editTx.recipient || '');
      setPayee(editTx.payee || '');
      setDate(editTx.date ? editTx.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setDueDate(editTx.dueDate || '');
      setNote(editTx.note || '');

      let mode = editTx.transferMode;
      if (!mode && editTx.type === 'transfer') {
        if (editTx.status === 'borrowed' || editTx.status === 'repaid') {
          mode = 'borrow';
        } else if (editTx.recipient && !editTx.toAccountId) {
          mode = 'give';
        } else {
          mode = 'internal';
        }
      }
      setTransferMode(mode || 'give');
      setStatus(editTx.status || (editTx.type === 'transfer' ? (mode === 'borrow' ? 'borrowed' : 'lent') : 'cleared'));
    } else {
      let resolvedType = initialType;
      let resolvedMode = 'give';
      let resolvedStatus = 'cleared';

      if (initialType === 'borrow') {
        resolvedType = 'transfer';
        resolvedMode = 'borrow';
        resolvedStatus = 'borrowed';
      } else if (initialType === 'give' || initialType === 'lend') {
        resolvedType = 'transfer';
        resolvedMode = 'give';
        resolvedStatus = 'lent';
      } else if (initialType === 'transfer') {
        resolvedType = 'transfer';
        resolvedMode = 'give';
        resolvedStatus = 'lent';
      }

      setType(resolvedType);
      setTransferMode(resolvedMode);
      setAmount('');
      const defaultAcc = accounts[0] ? accounts[0].id : '';
      const defaultToAcc = accounts[1] ? accounts[1].id : defaultAcc;
      setAccountId(defaultAcc);
      setFromAccountId(defaultAcc);
      setToAccountId(defaultToAcc);

      const defaultCat = categories?.find ? categories.find((c) => c.type === resolvedType) : null;
      setCategoryId(defaultCat ? defaultCat.id : categories?.[0]?.id || '');

      setRecipient('');
      setPayee('');

      // Current local date time for input
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDate(localIso);
      setDueDate(getFutureDate(localIso, 30));
      setNote('');
      setStatus(resolvedStatus);
    }
  }, [editTx, initialType, isOpen, accounts, categories]);

  if (!shouldRender) return null;

  const filteredCategories = (categories || []).filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    if (type === 'transfer') {
      if (transferMode === 'give') {
        if (!recipient.trim()) {
          alert("Please enter who you gave/lent the money to");
          return;
        }
      } else if (transferMode === 'borrow') {
        if (!recipient.trim()) {
          alert("Please enter who you borrowed the money from");
          return;
        }
      } else if (transferMode === 'internal') {
        if (fromAccountId === toAccountId) {
          alert("Source and destination accounts must be different for a transfer");
          return;
        }
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
      payload.transferMode = transferMode;
      if (transferMode === 'give') {
        payload.fromAccountId = fromAccountId || (accounts[0] ? accounts[0].id : '');
        payload.toAccountId = null;
        payload.accountId = payload.fromAccountId;
        payload.recipient = recipient.trim();
        payload.dueDate = dueDate || null;
        payload.payee = `Given to ${recipient.trim()}`;
        const fallbackCat = (categories || []).find((c) => c.id === 'cat_other_exp') || categories?.[0];
        payload.categoryId = fallbackCat ? fallbackCat.id : 'cat_other_exp';
      } else if (transferMode === 'borrow') {
        payload.fromAccountId = null;
        payload.toAccountId = toAccountId || (accounts[0] ? accounts[0].id : '');
        payload.accountId = payload.toAccountId;
        payload.recipient = recipient.trim();
        payload.dueDate = dueDate || null;
        payload.payee = `Borrowed from ${recipient.trim()}`;
        const fallbackCat = (categories || []).find((c) => c.id === 'cat_other_inc') || categories?.[0];
        payload.categoryId = fallbackCat ? fallbackCat.id : 'cat_other_inc';
      } else {
        // Internal transfer
        payload.fromAccountId = fromAccountId || (accounts[0] ? accounts[0].id : '');
        payload.toAccountId = toAccountId || (accounts[1] ? accounts[1].id : accounts[0]?.id);
        payload.accountId = payload.fromAccountId;
        payload.recipient = null;
        payload.dueDate = null;
        const fromAccName = accounts.find((a) => a.id === payload.fromAccountId)?.name || 'Account';
        const toAccName = accounts.find((a) => a.id === payload.toAccountId)?.name || 'Account';
        payload.payee = `Transfer: ${fromAccName} ➔ ${toAccName}`;
        const fallbackCat = (categories || []).find((c) => c.id === 'cat_other_exp') || categories?.[0];
        payload.categoryId = fallbackCat ? fallbackCat.id : 'cat_other_exp';
      }
    } else {
      payload.accountId = accountId || (accounts[0] ? accounts[0].id : '');
      payload.categoryId = categoryId || (categories[0] ? categories[0].id : '');
      payload.payee = payee.trim() || ((categories || []).find((c) => c.id === payload.categoryId)?.name || 'General');
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

        {/* Type Toggle Pills: Transfer is 1st by default */}
        <div className="tx-type-selector">
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
                    name: 'Primary Bank Account',
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
                <span>+ Primary Bank Account ({currentCurrency.symbol}0.00)</span>
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
                <span>+ Cash Wallet ({currentCurrency.symbol}0.00)</span>
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

            {/* TRANSFER & PEER MONEY MODES */}
            {type === 'transfer' ? (
              <>
                {/* Sub-mode Pill Switcher */}
                <div className="transfer-submode-selector">
                  <button
                    type="button"
                    className={`transfer-sub-btn ${transferMode === 'give' ? 'active give' : ''}`}
                    onClick={() => {
                      setTransferMode('give');
                      if (status !== 'lent' && status !== 'gift' && status !== 'returned') {
                        setStatus('lent');
                      }
                    }}
                  >
                    <IconArrowUpRight size={15} stroke={2} />
                    <span>Give / Lend</span>
                  </button>
                  <button
                    type="button"
                    className={`transfer-sub-btn ${transferMode === 'borrow' ? 'active borrow' : ''}`}
                    onClick={() => {
                      setTransferMode('borrow');
                      if (status !== 'borrowed' && status !== 'repaid') {
                        setStatus('borrowed');
                      }
                    }}
                  >
                    <IconArrowDownLeft size={15} stroke={2} />
                    <span>Borrow Money</span>
                  </button>
                  <button
                    type="button"
                    className={`transfer-sub-btn ${transferMode === 'internal' ? 'active internal' : ''}`}
                    onClick={() => {
                      setTransferMode('internal');
                      setStatus('cleared');
                    }}
                  >
                    <IconArrowsExchange size={15} stroke={2} />
                    <span>Between Accounts</span>
                  </button>
                </div>

                {/* MODE 1: GIVE / LEND */}
                {transferMode === 'give' && (
                  <>
                    <div className="transfer-helper-banner">
                      <span>💸 Giving or lending money to someone. They owe you return.</span>
                    </div>

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
                          Recipient / Borrower Name <span className="text-rose">*</span>
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
                        <div className="form-label-with-presets">
                          <label>Due Date</label>
                          <div className="quick-due-presets">
                            <button type="button" onClick={() => setDueDate(getFutureDate(date, 7))}>+7d</button>
                            <button type="button" onClick={() => setDueDate(getFutureDate(date, 14))}>+14d</button>
                            <button type="button" onClick={() => setDueDate(getFutureDate(date, 30))}>+30d</button>
                          </div>
                        </div>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="modal-select"
                        >
                          <option value="lent">Lent / Awaiting Return</option>
                          <option value="returned">Returned / Settled</option>
                          <option value="gift">Gift (No return expected)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Note (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. For concert tickets, dinner, groceries..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* MODE 2: BORROW MONEY */}
                {transferMode === 'borrow' && (
                  <>
                    <div className="transfer-helper-banner borrow">
                      <span>🤝 Borrowing money from someone. You owe them repayment.</span>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Deposit Into Account</label>
                        <select
                          value={toAccountId}
                          onChange={(e) => setToAccountId(e.target.value)}
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
                          Lender / Person Name <span className="text-rose">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Uncle Dave, Sarah, Roommate"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Date Borrowed</label>
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
                        <div className="form-label-with-presets">
                          <label>Due Date</label>
                          <div className="quick-due-presets">
                            <button type="button" onClick={() => setDueDate(getFutureDate(date, 7))}>+7d</button>
                            <button type="button" onClick={() => setDueDate(getFutureDate(date, 14))}>+14d</button>
                            <button type="button" onClick={() => setDueDate(getFutureDate(date, 30))}>+30d</button>
                          </div>
                        </div>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="modal-select"
                        >
                          <option value="borrowed">Borrowed / You Owe</option>
                          <option value="repaid">Repaid / Settled</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Note (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. For urgent car repairs, medical bill..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* MODE 3: BETWEEN ACCOUNTS */}
                {transferMode === 'internal' && (
                  <>
                    <div className="transfer-helper-banner internal">
                      <span>🔄 Transferring funds between your own wallets/accounts.</span>
                    </div>

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
                        <label>To Account</label>
                        <select
                          value={toAccountId}
                          onChange={(e) => setToAccountId(e.target.value)}
                          className="modal-select"
                          required
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                              {acc.name} ({currentCurrency.symbol}{acc.balance.toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

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
                        <label>Note (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. ATM withdrawal, savings deposit..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
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
