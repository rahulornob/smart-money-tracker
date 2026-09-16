import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import SpendingHeatmapCalendar from '../Analytics/SpendingHeatmapCalendar';
import {
  IconSearch,
  IconPlus,
  IconTrash,
  IconPencil,
  IconDownload,
  IconCalendar,
  IconChevronDown,
  IconStack2,
  IconReceipt,
  IconCalendarStats,
} from '@tabler/icons-react';

export default function TransactionsView({ onOpenNewTransaction, onEditTransaction }) {
  const {
    transactions,
    accounts,
    categories,
    formatCurrency,
    deleteTransaction,
  } = useFinance();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'heatmap'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'expense', 'income', 'transfer'
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc'

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) return false;

        // Account filter
        if (selectedAccount !== 'all') {
          if (tx.type === 'transfer') {
            if (tx.fromAccountId !== selectedAccount && tx.toAccountId !== selectedAccount) {
              return false;
            }
          } else {
            if (tx.accountId !== selectedAccount) return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchPayee = tx.payee && tx.payee.toLowerCase().includes(q);
          const matchNote = tx.note && tx.note.toLowerCase().includes(q);
          const cat = categories.find((c) => c.id === tx.categoryId);
          const matchCat = cat && cat.name.toLowerCase().includes(q);
          if (!matchPayee && !matchNote && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, selectedType, selectedAccount, selectedCategory, searchTerm, sortBy, categories]);

  // Statistics for the filtered view
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);
  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach((tx) => {
      const dateObj = new Date(tx.date);
      const key = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  // Export transactions to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Amount', 'Account', 'Category', 'Payee', 'Note', 'Status'];
    const rows = filteredTransactions.map((tx) => {
      const acc = accounts.find((a) => a.id === tx.accountId);
      const cat = categories.find((c) => c.id === tx.categoryId);
      return [
        tx.id,
        tx.date,
        tx.type,
        tx.amount,
        acc ? acc.name : '',
        cat ? cat.name : '',
        `"${(tx.payee || '').replace(/"/g, '""')}"`,
        `"${(tx.note || '').replace(/"/g, '""')}"`,
        tx.status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="transactions-page">
      {/* Search & Top Action Bar */}
      <div className="tx-controls-card glass-panel">
        <div className="tx-search-row">
          <div className="tx-search-input-box">
            <IconSearch size={18} className="search-icon" stroke={1.8} />
            <input
              type="text"
              placeholder="Search payees, categories, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tx-search-input"
            />
          </div>

          <div className="tx-top-actions">
            <div className="tx-view-pill-group">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`tx-view-pill ${viewMode === 'list' ? 'active' : ''}`}
                title="Table ledger list view"
              >
                <IconReceipt size={15} stroke={1.8} />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('heatmap')}
                className={`tx-view-pill ${viewMode === 'heatmap' ? 'active' : ''}`}
                title="Calendar spending heatmap"
              >
                <IconCalendarStats size={15} stroke={1.8} />
                <span>Heatmap</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="btn btn-secondary btn-export-csv"
              title="Export filtered records to CSV"
            >
              <IconDownload size={16} stroke={1.8} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => onOpenNewTransaction('expense')}
              className="btn btn-primary btn-add-tx"
            >
              <IconPlus size={16} stroke={2} />
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Filter Chips & Selectors */}
        <div className="tx-filters-row">
          {/* Type Filter Tabs */}
          <div className="type-tabs-group">
            {['all', 'expense', 'income', 'transfer'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`type-tab-btn ${selectedType === type ? 'active ' + type : ''}`}
              >
                {type === 'all' && 'All Types'}
                {type === 'expense' && 'Expenses'}
                {type === 'income' && 'Income'}
                {type === 'transfer' && 'Transfers'}
              </button>
            ))}
          </div>

          {/* Account Filter */}
          <div className="filter-select-wrapper">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            <IconChevronDown size={14} className="select-icon" stroke={1.8} />
          </div>

          {/* Category Filter */}
          <div className="filter-select-wrapper">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <IconChevronDown size={14} className="select-icon" stroke={1.8} />
          </div>

          {/* Sort By */}
          <div className="filter-select-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
            <IconChevronDown size={14} className="select-icon" stroke={1.8} />
          </div>
        </div>
      </div>

      {/* Heatmap or List View Container */}
      {viewMode === 'heatmap' ? (
        <div className="tx-heatmap-container">
          <SpendingHeatmapCalendar />
        </div>
      ) : (
        <>
          {/* Filter Stats Bar */}
          <div className="tx-stats-ribbon">
            <div className="stats-ribbon-item">
              <span>Found:</span>
              <strong>{filteredTransactions.length} records</strong>
            </div>
        <div className="stats-ribbon-item text-emerald">
          <span>Filtered Income:</span>
          <strong>+{formatCurrency(filteredIncome)}</strong>
        </div>
        <div className="stats-ribbon-item text-rose">
          <span>Filtered Outflow:</span>
          <strong>-{formatCurrency(filteredExpense)}</strong>
        </div>
        <div className="stats-ribbon-item">
          <span>Net Difference:</span>
          <strong className={filteredIncome - filteredExpense >= 0 ? 'text-emerald' : 'text-rose'}>
            {formatCurrency(filteredIncome - filteredExpense, { showPositiveSign: true })}
          </strong>
        </div>
      </div>

      {/* Transactions Grouped List */}
      <div className="tx-list-container">
        {transactions.length === 0 ? (
          <div className="empty-tx-box glass-panel">
            <IconStack2 size={40} className="empty-icon" stroke={1.5} />
            <h3>No Transactions Recorded Yet</h3>
            <p>Start tracking your real cash flow by recording your first expense or income.</p>
            <button
              onClick={() => onOpenNewTransaction('expense')}
              className="btn btn-primary mt-3"
            >
              <IconPlus size={16} stroke={2} />
              <span>Record First Transaction</span>
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-tx-box glass-panel">
            <IconStack2 size={40} className="empty-icon" stroke={1.5} />
            <h3>No Transactions Match Your Filter</h3>
            <p>Try clearing filters or search query to see your transaction history.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedAccount('all');
                setSelectedCategory('all');
              }}
              className="btn btn-secondary mt-3"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateLabel, txs]) => (
            <div key={dateLabel} className="tx-date-group">
              <div className="tx-date-header">
                <IconCalendar size={14} stroke={1.8} />
                <span>{dateLabel}</span>
                <span className="tx-date-count">({txs.length})</span>
              </div>

              <div className="tx-group-card glass-panel">
                {txs.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId) || {
                    name: 'General',
                    icon: 'HelpCircle',
                    color: '#94a3b8',
                  };
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  const fromAcc = accounts.find((a) => a.id === tx.fromAccountId);
                  const toAcc = accounts.find((a) => a.id === tx.toAccountId);

                  return (
                    <div key={tx.id} className="tx-row-item">
                      <div
                        className="tx-cat-icon-wrapper"
                        style={{ backgroundColor: `${cat.color}1c` }}
                      >
                        <CategoryIcon iconName={cat.icon} size={20} color={cat.color} />
                      </div>

                      <div className="tx-main-details">
                        <div className="tx-title-line">
                          <span className="tx-payee-text">{tx.payee || cat.name}</span>
                          {tx.note && <span className="tx-note-text">"{tx.note}"</span>}
                        </div>
                        <div className="tx-sub-line">
                          <span className="tx-category-name">
                            {tx.type === 'transfer' && tx.recipient ? 'Money Given' : cat.name}
                          </span>
                          <span className="tx-bullet">•</span>
                          <span className="tx-account-name">
                            {tx.type === 'transfer'
                              ? tx.recipient
                                ? `From ${fromAcc?.name || 'Account'} to ${tx.recipient}`
                                : `${fromAcc?.name || 'Account'} ➔ ${toAcc?.name || 'Account'}`
                              : acc?.name || 'Primary Account'}
                          </span>
                          {tx.type === 'transfer' && tx.status === 'lent' && (
                            <span className="tx-lent-pill" title={tx.dueDate ? `Expected return by ${tx.dueDate}` : 'Awaiting return'}>
                              Lent {tx.dueDate ? `• Due ${new Date(tx.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                            </span>
                          )}
                          {tx.type === 'transfer' && tx.status === 'gift' && (
                            <span className="tx-gift-pill">Gift</span>
                          )}
                          {tx.type === 'transfer' && tx.status === 'cleared' && (
                            <span className="tx-cleared-pill">Returned</span>
                          )}
                          {tx.type !== 'transfer' && tx.status === 'pending' && (
                            <span className="tx-pending-pill">Pending</span>
                          )}
                        </div>
                      </div>

                      {/* Amount & Actions */}
                      <div className="tx-right-cluster">
                        <div className="tx-amount-display">
                          <span
                            className={`tx-amount-digits ${
                              tx.type === 'income'
                                ? 'text-emerald'
                                : tx.type === 'expense'
                                ? 'text-rose'
                                : 'text-transfer'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>

                        <div className="tx-action-buttons">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="btn-tx-action"
                            title="Edit transaction"
                          >
                            <IconPencil size={14} stroke={1.8} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this transaction and restore balances?')) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="btn-tx-action delete"
                            title="Delete transaction"
                          >
                            <IconTrash size={14} stroke={1.8} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      </>
      )}
    </div>
  );
}
