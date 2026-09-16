import React from 'react';
import NetWorthHero from './NetWorthHero';
import CashFlowChart from './CashFlowChart';
import CategoryDonutChart from './CategoryDonutChart';
import RecentTransactionsWidget from './RecentTransactionsWidget';
import DashboardBudgetsWidget from './DashboardBudgetsWidget';
import DashboardGoalsWidget from './DashboardGoalsWidget';

export default function DashboardView({
  onOpenTransactionWithType,
  onNavigateTab,
  onSelectTransaction,
  onOpenAccountModal,
}) {
  return (
    <div className="dashboard-layout">
      {/* Unified Hero Cockpit: Net Worth, Quick Actions, Metrics & Accounts Strip */}
      <NetWorthHero
        onOpenTransactionWithType={onOpenTransactionWithType}
        onNavigateTab={onNavigateTab}
        onOpenAccountModal={onOpenAccountModal}
      />

      {/* Primary Analytics Grid */}
      <div className="dashboard-grid-primary">
        <CashFlowChart />
        <CategoryDonutChart />
      </div>

      {/* Secondary Operations Grid */}
      <div className="dashboard-grid-secondary">
        <div className="dashboard-left-col">
          <RecentTransactionsWidget
            onViewAll={() => onNavigateTab('transactions')}
            onSelectTransaction={onSelectTransaction}
            onAddTransaction={() => onOpenTransactionWithType('expense')}
          />
        </div>

        <div className="dashboard-right-col">
          <DashboardBudgetsWidget onManageBudgets={() => onNavigateTab('budgets')} />
          <DashboardGoalsWidget onManageGoals={() => onNavigateTab('goals')} />
        </div>
      </div>
    </div>
  );
}
