import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';

export default function CashFlowChart() {
  const { transactions, formatCurrency } = useFinance();
  const [period, setPeriod] = useState('30d'); // '7d', '30d', 'year'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Group transactions according to selected period
  const chartData = useMemo(() => {
    const now = new Date();
    const points = [];

    if (period === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

        const dayTxs = transactions.filter((t) => t.date.slice(0, 10) === dateStr);
        const income = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const expense = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

        points.push({ label, dateStr, income, expense });
      }
    } else if (period === '30d') {
      // 6 chunks of 5 days each for clean graph
      for (let i = 5; i >= 0; i--) {
        const dEnd = new Date(now);
        dEnd.setDate(dEnd.getDate() - i * 5);
        const dStart = new Date(dEnd);
        dStart.setDate(dStart.getDate() - 4);

        const label = `${dStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dEnd.getDate()}`;

        const periodTxs = transactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate >= dStart && tDate <= dEnd;
        });

        const income = periodTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const expense = periodTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

        points.push({ label, income, expense });
      }
    } else {
      // Past 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        const label = d.toLocaleDateString('en-US', { month: 'short' });

        const monthTxs = transactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === m && tDate.getFullYear() === y;
        });

        const income = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const expense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

        points.push({ label, income, expense });
      }
    }
    return points;
  }, [transactions, period]);

  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.income, d.expense)),
    100
  );

  const totalPeriodIncome = chartData.reduce((s, d) => s + d.income, 0);
  const totalPeriodExpense = chartData.reduce((s, d) => s + d.expense, 0);
  const netPeriodCashflow = totalPeriodIncome - totalPeriodExpense;

  // SVG Chart Geometry
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const getX = (index) => paddingX + (index / (chartData.length - 1 || 1)) * chartWidth;
  const getY = (val) => height - paddingY - (val / (maxVal * 1.15)) * chartHeight;

  // Generate SVG path strings for smooth Bezier curve
  const createSmoothPath = (key) => {
    if (chartData.length === 0) return '';
    const points = chartData.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const incomePath = createSmoothPath('income');
  const expensePath = createSmoothPath('expense');

  // Closed area paths for gradient fills
  const incomeArea = `${incomePath} L ${getX(chartData.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;
  const expenseArea = `${expensePath} L ${getX(chartData.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <div className="cashflow-card glass-panel">
      {/* Header and Period Buttons */}
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Cash Flow Dynamics</h2>
          <p className="card-subtitle">Income vs Expenses performance over time</p>
        </div>

        <div className="period-toggle-group">
          <button
            onClick={() => setPeriod('7d')}
            className={`period-btn ${period === '7d' ? 'active' : ''}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`period-btn ${period === '30d' ? 'active' : ''}`}
          >
            30 Days
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`period-btn ${period === 'year' ? 'active' : ''}`}
          >
            6 Months
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="cashflow-summary-row">
        <div className="cf-summary-item">
          <span className="cf-dot income-dot"></span>
          <span className="cf-label">Total Inflow:</span>
          <span className="cf-val text-emerald">{formatCurrency(totalPeriodIncome)}</span>
        </div>
        <div className="cf-summary-item">
          <span className="cf-dot expense-dot"></span>
          <span className="cf-label">Total Outflow:</span>
          <span className="cf-val text-rose">{formatCurrency(totalPeriodExpense)}</span>
        </div>
        <div className="cf-summary-item">
          <span className="cf-label">Period Net:</span>
          <span className={`cf-val ${netPeriodCashflow >= 0 ? 'text-emerald' : 'text-rose'}`}>
            {formatCurrency(netPeriodCashflow, { showPositiveSign: true })}
          </span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="chart-svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="cashflow-svg" preserveAspectRatio="none">
          <defs>
            {/* Income Gradient */}
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            {/* Expense Gradient */}
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * chartHeight;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fills */}
          <path d={incomeArea} fill="url(#incomeGradient)" />
          <path d={expenseArea} fill="url(#expenseGradient)" />

          {/* Line Strokes */}
          <path d={incomePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          <path d={expensePath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive Data Dots */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const yInc = getY(d.income);
            const yExp = getY(d.expense);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Income point */}
                <circle
                  cx={x}
                  cy={yInc}
                  r={isHovered ? 6 : 4}
                  fill="#10b981"
                  stroke="#0a0e17"
                  strokeWidth="2"
                  className="chart-point"
                />

                {/* Expense point */}
                <circle
                  cx={x}
                  cy={yExp}
                  r={isHovered ? 6 : 4}
                  fill="#f43f5e"
                  stroke="#0a0e17"
                  strokeWidth="2"
                  className="chart-point"
                />

                {/* Invisible hit target */}
                <rect
                  x={x - 25}
                  y={0}
                  width={50}
                  height={height}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {chartData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 8}
              textAnchor="middle"
              fill="rgba(148, 163, 184, 0.7)"
              fontSize="10"
              fontFamily="inherit"
            >
              {d.label}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
              top: '15%',
            }}
          >
            <div className="tooltip-title">{chartData[hoveredIndex].label}</div>
            <div className="tooltip-row text-emerald">
              <span>Income:</span>
              <span>{formatCurrency(chartData[hoveredIndex].income)}</span>
            </div>
            <div className="tooltip-row text-rose">
              <span>Expense:</span>
              <span>{formatCurrency(chartData[hoveredIndex].expense)}</span>
            </div>
            <div className="tooltip-row tooltip-net">
              <span>Net:</span>
              <span>
                {formatCurrency(
                  chartData[hoveredIndex].income - chartData[hoveredIndex].expense,
                  { showPositiveSign: true }
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
