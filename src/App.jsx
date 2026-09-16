import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import DashboardView from './components/Dashboard/DashboardView';
import TransactionsView from './components/Transactions/TransactionsView';
import AccountsView from './components/Accounts/AccountsView';
import BudgetsView from './components/Budgets/BudgetsView';
import PlannedView from './components/Planned/PlannedView';
import GoalsView from './components/Goals/GoalsView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import TransactionModal from './components/Transactions/TransactionModal';
import AccountModal from './components/Accounts/AccountModal';
import FloatingActionBar from './components/common/FloatingActionBar';

function WalletApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState('expense');
  const [editingTx, setEditingTx] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const handleOpenNewTransaction = (type = 'expense') => {
    setEditingTx(null);
    setTxModalType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx) => {
    setEditingTx(tx);
    setTxModalType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleOpenNewAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          activeTab={activeTab}
          onOpenTransactionModal={() => handleOpenNewTransaction('expense')}
        />

        <main className="content-wrapper">
          <div key={activeTab} className="page-view-container">
            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenTransactionWithType={handleOpenNewTransaction}
                onNavigateTab={setActiveTab}
                onSelectTransaction={handleEditTransaction}
                onOpenAccountModal={handleOpenNewAccount}
              />
            )}
            {activeTab === 'transactions' && (
              <TransactionsView
                onOpenNewTransaction={handleOpenNewTransaction}
                onEditTransaction={handleEditTransaction}
              />
            )}
            {activeTab === 'accounts' && (
              <AccountsView
                onOpenTransfer={() => handleOpenNewTransaction('transfer')}
                onOpenNewTransaction={handleOpenNewTransaction}
              />
            )}
            {activeTab === 'budgets' && <BudgetsView />}
            {activeTab === 'planned' && <PlannedView />}
            {activeTab === 'goals' && <GoalsView />}
            {activeTab === 'analytics' && <AnalyticsView />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTransaction}
      />

      {/* Floating Action Glass Dock */}
      <FloatingActionBar
        onOpenTransaction={handleOpenNewTransaction}
        isModalOpen={isTxModalOpen || isAccountModalOpen}
      />

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txModalType}
        editTx={editingTx}
      />

      {/* Global Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        editAccount={editingAccount}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <WalletApp />
    </FinanceProvider>
  );
}
