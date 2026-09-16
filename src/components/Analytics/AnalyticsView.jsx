import React, { useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import SpendingHeatmapCalendar from './SpendingHeatmapCalendar';
import {
  IconAward,
  IconShieldCheck,
  IconDownload,
  IconUpload,
  IconReload,
} from '@tabler/icons-react';

export default function AnalyticsView() {
  const {
    transactions,
    categories,
    accounts,
    formatCurrency,
    totalBalance,
    totalAssets,
    totalDebt,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthSavings,
    savingsRate,
    resetToDemoData,
    exportDataJSON,
    importDataJSON,
  } = useFinance();

  const fileInputRef = useRef(null);

  // Financial Health Metrics Calculation
  const totalInflowAllTime = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOutflowAllTime = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenseToIncomeRatio = currentMonthIncome > 0 ? (currentMonthExpense / currentMonthIncome) * 100 : 0;
  const debtToAssetRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;
  const emergencyBufferMonths = currentMonthExpense > 0 ? (totalAssets / currentMonthExpense).toFixed(1) : '12+';

  // Category lifetime breakdowns
  const expenseBreakdown = React.useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + Number(t.amount);
      });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId) || {
          name: 'General',
          color: '#94a3b8',
          icon: 'HelpCircle',
        };
        const percentage = totalOutflowAllTime > 0 ? (amount / totalOutflowAllTime) * 100 : 0;
        return {
          id: catId,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          amount,
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, totalOutflowAllTime]);

  const incomeBreakdown = React.useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + Number(t.amount);
      });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId) || {
          name: 'General Income',
          color: '#10b981',
          icon: 'TrendingUp',
        };
        const percentage = totalInflowAllTime > 0 ? (amount / totalInflowAllTime) * 100 : 0;
        return {
          id: catId,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          amount,
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, totalInflowAllTime]);

  const handleFileUpload = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const success = importDataJSON(parsed);
        if (success) {
          alert('Backup successfully imported!');
        } else {
          alert('Invalid backup structure.');
        }
      } catch (err) {
        alert('Invalid JSON backup file structure.');
      }
    };
    fileReader.readAsText(file);
  };

  const hasActivity = transactions.length > 0 || accounts.length > 0;

  return (
    <div className="analytics-page">
      {/* Financial Health Score Hero */}
      <div className="analytics-hero-card glass-panel">
        <div className="health-score-cluster">
          <div className="health-score-dial">
            <IconAward size={32} color={hasActivity ? '#10b981' : '#AB9FF2'} stroke={1.8} />
            <div className="health-score-val">{hasActivity ? 'A+' : '—'}</div>
          </div>
          <div>
            <div className="badge badge-income mb-2">
              <IconShieldCheck size={12} stroke={1.8} />
              <span>Financial Health Status</span>
            </div>
            <h2 className="analytics-title">
              {hasActivity ? 'Strong Cash Flow & Solid Liquidity' : 'Awaiting Financial Activity'}
            </h2>
            <p className="analytics-sub">
              {hasActivity
                ? `Your savings rate of ${savingsRate.toFixed(1)}% puts you in the top tier of personal budgeting.`
                : 'Start logging accounts and daily expenses to generate real-time health scores and runway metrics.'}
            </p>
          </div>
        </div>

        <div className="health-ratios-grid">
          <div className="ratio-item">
            <span className="ratio-label">Savings Rate:</span>
            <span className="ratio-val text-emerald">{savingsRate.toFixed(1)}%</span>
            <span className="ratio-sub">Target &gt; 20%</span>
          </div>
          <div className="ratio-item">
            <span className="ratio-label">Expense Ratio:</span>
            <span className="ratio-val">{expenseToIncomeRatio.toFixed(1)}%</span>
            <span className="ratio-sub">of total monthly inflow</span>
          </div>
          <div className="ratio-item">
            <span className="ratio-label">Debt-to-Asset:</span>
            <span className="ratio-val text-emerald">{debtToAssetRatio.toFixed(1)}%</span>
            <span className="ratio-sub">Healthy leverage &lt; 30%</span>
          </div>
          <div className="ratio-item">
            <span className="ratio-label">Liquid Runway:</span>
            <span className="ratio-val text-indigo">{emergencyBufferMonths} months</span>
            <span className="ratio-sub">Emergency coverage</span>
          </div>
        </div>
      </div>

      {/* Daily Spending Heatmap Calendar */}
      <SpendingHeatmapCalendar />

      {/* Two-Column Rankings */}
      <div className="analytics-breakdowns-grid">
        {/* Spending Structure */}
        <div className="breakdown-card glass-panel">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">Expense Structure</h3>
              <p className="card-subtitle">Lifetime spending distribution by category</p>
            </div>
          </div>

          <div className="breakdown-list">
            {expenseBreakdown.length === 0 ? (
              <div className="empty-widget-box py-6">
                <p className="empty-widget-text">No expense records logged yet.</p>
              </div>
            ) : (
              expenseBreakdown.map((item, idx) => (
                <div key={item.id} className="breakdown-item">
                  <div className="item-rank-num">#{idx + 1}</div>
                  <div
                    className="item-cat-icon"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <CategoryIcon iconName={item.icon} size={16} color={item.color} />
                  </div>
                  <div className="item-details">
                    <div className="item-title-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-amount text-rose">-{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <div className="item-percent-note">{item.percentage.toFixed(1)}% of all expenses</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Income Structure */}
        <div className="breakdown-card glass-panel">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">Income Sources</h3>
              <p className="card-subtitle">Revenue stream breakdown</p>
            </div>
          </div>

          <div className="breakdown-list">
            {incomeBreakdown.length === 0 ? (
              <div className="empty-widget-box py-6">
                <p className="empty-widget-text">No income records logged yet.</p>
              </div>
            ) : (
              incomeBreakdown.map((item, idx) => (
                <div key={item.id} className="breakdown-item">
                  <div className="item-rank-num">#{idx + 1}</div>
                  <div
                    className="item-cat-icon"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <CategoryIcon iconName={item.icon} size={16} color={item.color} />
                  </div>
                  <div className="item-details">
                    <div className="item-title-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-amount text-emerald">+{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <div className="item-percent-note">{item.percentage.toFixed(1)}% of total income</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Data Management & Backup Tools */}
      <div className="data-management-card glass-panel">
        <div className="card-header-flex">
          <div>
            <h3 className="card-title">Backup, Restore & Data Portability</h3>
            <p className="card-subtitle">
              Your data is stored locally in your browser. Download encrypted JSON snapshots or restore anytime.
            </p>
          </div>
        </div>

        <div className="data-tools-row">
          <button onClick={exportDataJSON} className="btn btn-secondary">
            <IconDownload size={16} stroke={1.8} />
            <span>Export Full Backup (JSON)</span>
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">
            <IconUpload size={16} stroke={1.8} />
            <span>Import / Restore Backup</span>
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          <button
            onClick={() => {
              if (window.confirm('Reset and clear all data back to clean empty state?')) {
                resetToDemoData();
              }
            }}
            className="btn btn-danger"
          >
            <IconReload size={16} stroke={1.8} />
            <span>Clear / Reset All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
