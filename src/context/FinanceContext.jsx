import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CURRENCIES,
  CATEGORIES,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_PLANNED,
  INITIAL_GOALS,
} from '../data/initialData';

const STORAGE_KEY = 'money_tracker_app_state_v2';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  // Load initial state from localStorage or defaults
  const [data, setData] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wallet_budgetbakers_app_state_v1');
        localStorage.removeItem('phantom_accounts');
        localStorage.removeItem('phantom_transactions');
        localStorage.removeItem('phantom_budgets');
        localStorage.removeItem('phantom_planned');
        localStorage.removeItem('phantom_goals');
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.transactions && parsed.transactions.some((t) => t.id === 'tx_1')) {
          parsed.transactions = [];
          parsed.budgets = [];
          parsed.planned = [];
          parsed.goals = [];
          parsed.accounts = [];
        }
        if (!parsed.currency || !['BDT', 'USD'].includes(parsed.currency)) {
          parsed.currency = 'BDT';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved finance state', e);
    }
    return {
      currency: 'BDT',
      theme: 'dark',
      accounts: INITIAL_ACCOUNTS,
      categories: CATEGORIES,
      transactions: INITIAL_TRANSACTIONS,
      budgets: INITIAL_BUDGETS,
      planned: INITIAL_PLANNED,
      goals: INITIAL_GOALS,
    };
  });

  // Keep localStorage in sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save finance state to localStorage', e);
    }
  }, [data]);

  // Sync theme with HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.theme);
  }, [data.theme]);

  // Currency helpers
  const currentCurrency = CURRENCIES.find((c) => c.code === data.currency) || CURRENCIES[0];

  const formatCurrency = (amount, options = {}) => {
    const num = Number(amount) || 0;
    const absVal = Math.abs(num);
    const formattedNum = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absVal);

    const sign = num < 0 ? '-' : options.showPositiveSign && num > 0 ? '+' : '';
    return `${sign}${currentCurrency.symbol}${formattedNum}`;
  };

  const setCurrency = (code) => {
    setData((prev) => ({ ...prev, currency: code }));
  };

  const toggleTheme = () => {
    setData((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  // ----------------- TRANSACTIONS -----------------
  const addTransaction = (txData) => {
    const id = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newTx = { ...txData, id };

    setData((prev) => {
      // Update account balances
      const updatedAccounts = prev.accounts.map((acc) => {
        let balanceChange = 0;
        if (newTx.type === 'expense' && acc.id === newTx.accountId) {
          balanceChange = -Number(newTx.amount);
        } else if (newTx.type === 'income' && acc.id === newTx.accountId) {
          balanceChange = Number(newTx.amount);
        } else if (newTx.type === 'transfer') {
          if (acc.id === newTx.fromAccountId) balanceChange = -Number(newTx.amount);
          if (newTx.toAccountId && acc.id === newTx.toAccountId) {
            balanceChange = Number(newTx.amount);
          }
        }
        return {
          ...acc,
          balance: Number((acc.balance + balanceChange).toFixed(2)),
        };
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: [newTx, ...prev.transactions],
      };
    });
    return newTx;
  };

  const deleteTransaction = (id) => {
    setData((prev) => {
      const txToDelete = prev.transactions.find((t) => t.id === id);
      if (!txToDelete) return prev;

      // Revert account balances
      const updatedAccounts = prev.accounts.map((acc) => {
        let revertChange = 0;
        if (txToDelete.type === 'expense' && acc.id === txToDelete.accountId) {
          revertChange = Number(txToDelete.amount);
        } else if (txToDelete.type === 'income' && acc.id === txToDelete.accountId) {
          revertChange = -Number(txToDelete.amount);
        } else if (txToDelete.type === 'transfer') {
          if (acc.id === txToDelete.fromAccountId) revertChange = Number(txToDelete.amount);
          if (txToDelete.toAccountId && acc.id === txToDelete.toAccountId) {
            revertChange = -Number(txToDelete.amount);
          }
        }
        return {
          ...acc,
          balance: Number((acc.balance + revertChange).toFixed(2)),
        };
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: prev.transactions.filter((t) => t.id !== id),
      };
    });
  };

  const editTransaction = (id, updatedFields) => {
    deleteTransaction(id);
    addTransaction({ ...updatedFields, id });
  };

  // ----------------- ACCOUNTS -----------------
  const addAccount = (accData) => {
    const id = 'acc_' + Date.now();
    const newAccount = {
      ...accData,
      id,
      balance: Number(accData.initialBalance) || 0,
      excludeFromStats: Boolean(accData.excludeFromStats),
    };
    setData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
    }));
  };

  const editAccount = (id, fields) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) => (acc.id === id ? { ...acc, ...fields } : acc)),
    }));
  };

  const deleteAccount = (id) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((acc) => acc.id !== id),
      transactions: prev.transactions.filter(
        (t) => t.accountId !== id && t.fromAccountId !== id && t.toAccountId !== id
      ),
    }));
  };

  // ----------------- BUDGETS -----------------
  const addBudget = (budgetData) => {
    const id = 'bgt_' + Date.now();
    const newBudget = { ...budgetData, id, amount: Number(budgetData.amount) };
    setData((prev) => ({
      ...prev,
      budgets: [...prev.budgets, newBudget],
    }));
  };

  const editBudget = (id, fields) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) =>
        b.id === id ? { ...b, ...fields, amount: Number(fields.amount ?? b.amount) } : b
      ),
    }));
  };

  const deleteBudget = (id) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== id),
    }));
  };

  // ----------------- PLANNED PAYMENTS -----------------
  const addPlanned = (planData) => {
    const id = 'plan_' + Date.now();
    const newPlan = { ...planData, id, amount: Number(planData.amount) };
    setData((prev) => ({
      ...prev,
      planned: [...prev.planned, newPlan],
    }));
  };

  const deletePlanned = (id) => {
    setData((prev) => ({
      ...prev,
      planned: prev.planned.filter((p) => p.id !== id),
    }));
  };

  const executePlannedPayment = (plan) => {
    addTransaction({
      type: plan.type,
      amount: plan.amount,
      accountId: plan.accountId,
      categoryId: plan.categoryId,
      payee: plan.name,
      date: new Date().toISOString(),
      note: `Paid recurring payment: ${plan.name}`,
      status: 'cleared',
    });
  };

  // ----------------- SAVINGS GOALS -----------------
  const addGoal = (goalData) => {
    const id = 'goal_' + Date.now();
    const newGoal = {
      ...goalData,
      id,
      targetAmount: Number(goalData.targetAmount),
      currentAmount: Number(goalData.currentAmount || 0),
    };
    setData((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const editGoal = (id, fields) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id
          ? {
              ...g,
              ...fields,
              targetAmount: Number(fields.targetAmount ?? g.targetAmount),
              currentAmount: Number(fields.currentAmount ?? g.currentAmount),
            }
          : g
      ),
    }));
  };

  const deleteGoal = (id) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const contributeToGoal = (goalId, amount, fromAccountId) => {
    const numAmount = Number(amount);
    if (numAmount <= 0) return;

    if (fromAccountId) {
      addTransaction({
        type: 'expense',
        amount: numAmount,
        accountId: fromAccountId,
        categoryId: 'cat_investments',
        payee: 'Savings Goal Deposit',
        date: new Date().toISOString(),
        note: `Allocated towards savings goal`,
        status: 'cleared',
      });
    }

    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: Number((g.currentAmount + numAmount).toFixed(2)) } : g
      ),
    }));
  };

  // ----------------- DATA BACKUP & RESET -----------------
  const resetToDemoData = () => {
    const cleanState = {
      currency: 'USD',
      theme: data.theme,
      accounts: [],
      categories: CATEGORIES,
      transactions: [],
      budgets: [],
      planned: [],
      goals: [],
    };
    setData(cleanState);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('wallet_budgetbakers_app_state_v1');
    } catch (e) {
      console.error(e);
    }
  };

  const exportDataJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `money_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = (importedObj) => {
    if (importedObj && importedObj.accounts && importedObj.transactions) {
      setData((prev) => ({
        ...prev,
        ...importedObj,
      }));
      return true;
    }
    return false;
  };

  // ----------------- CALCULATIONS -----------------
  // Accounts included in statistics (exclude accounts where excludeFromStats === true)
  const includedAccounts = data.accounts.filter((a) => !a.excludeFromStats);
  const includedAccountIds = new Set(includedAccounts.map((a) => a.id));

  // Net Worth (Assets - Liabilities)
  const totalBalance = includedAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalAssets = includedAccounts
    .filter((a) => a.balance > 0)
    .reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalDebt = includedAccounts
    .filter((a) => a.balance < 0)
    .reduce((sum, acc) => sum + Math.abs(Number(acc.balance)), 0);

  // Current month transactions calculation (only for included accounts)
  const currentMonthTransactions = data.transactions.filter((tx) => {
    const linkedAccId = tx.accountId || tx.fromAccountId;
    if (linkedAccId && !includedAccountIds.has(linkedAccId)) {
      return false;
    }
    const txDate = new Date(tx.date);
    const now = new Date();
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });

  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currentMonthExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currentMonthSavings = currentMonthIncome - currentMonthExpense;
  const savingsRate = currentMonthIncome > 0 ? (currentMonthSavings / currentMonthIncome) * 100 : 0;

  // Spending per category in current month
  const categorySpendingMap = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + Number(t.amount);
      return acc;
    }, {});

  const value = {
    ...data,
    currentCurrency,
    formatCurrency,
    setCurrency,
    toggleTheme,
    // Actions
    addTransaction,
    deleteTransaction,
    editTransaction,
    addAccount,
    editAccount,
    deleteAccount,
    addBudget,
    editBudget,
    deleteBudget,
    addPlanned,
    deletePlanned,
    executePlannedPayment,
    addGoal,
    editGoal,
    deleteGoal,
    contributeToGoal,
    resetToDemoData,
    exportDataJSON,
    importDataJSON,
    // Computed metrics
    totalBalance,
    totalAssets,
    totalDebt,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthSavings,
    savingsRate,
    categorySpendingMap,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
