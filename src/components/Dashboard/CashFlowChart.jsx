import React, { useState, useMemo } from 'react';
import { IconChartLine } from '@tabler/icons-react';
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

        const dayTxs = transactions.filter((t) => t.date && t.date.slice(0, 10) === dateStr);
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
          if (!t.date) return false;
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
          if (!t.date) return false;
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

  const totalPeriodIncome = chartData.reduce((s, d) => s + d.income, 0);
  const totalPeriodExpense = chartData.reduce((s, d) => s + d.expense, 0);
  const netPeriodCashflow = totalPeriodIncome - totalPeriodExpense;
  const hasData = totalPeriodIncome > 0 || totalPeriodExpense > 0;

  const rawMax = Math.max(...chartData.map((d) => Math.max(d.income, d.expense)), 0);
  const maxVal = rawMax > 0 ? rawMax * 1.15 : 100;

  // SVG Chart Geometry with calibrated dimensions
  const width = 800;
  const height = 230;
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 26;
  const paddingBottom = 42;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index) => paddingLeft + (index / (chartData.length - 1 || 1)) * chartWidth;
  const getY = (val) => height - paddingBottom - (val / maxVal) * chartHeight;

  // Generate smooth cubic Bezier curve with natural tension
  const createSmoothPath = (key) => {
    if (chartData.length === 0) return '';
    const points = chartData.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const dx = (p1.x - p0.x) * 0.45;
      path += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const incomePath = hasData && totalPeriodIncome > 0 ? createSmoothPath('income') : '';
  const expensePath = hasData && totalPeriodExpense > 0 ? createSmoothPath('expense') : '';

  const incomeArea = incomePath
    ? `${incomePath} L ${getX(chartData.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`
    : '';
  const expenseArea = expensePath
    ? `${expensePath} L ${getX(chartData.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`
    : '';

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

      {/* Summary Metrics Bar */}
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

      {/* Chart Canvas */}
      <div className="chart-svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="cashflow-svg" preserveAspectRatio="none">
          <defs>
            {/* Soft Phantom Mint Area Gradient */}
            <linearGradient id="phantomMintGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#30E0A1" stopOpacity="0.24" />
              <stop offset="90%" stopColor="#30E0A1" stopOpacity="0.0" />
            </linearGradient>
            {/* Soft Phantom Coral Area Gradient */}
            <linearGradient id="phantomCoralGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5C5C" stopOpacity="0.18" />
              <stop offset="90%" stopColor="#FF5C5C" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Reference Grid Guidelines */}
          {[1, 0.5, 0].map((ratio) => {
            const y = paddingTop + (1 - ratio) * chartHeight;
            const gridVal = rawMax > 0 ? ratio * rawMax : 0;
            return (
              <g key={ratio} className="chart-grid-group">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeDasharray={ratio === 0 ? 'none' : '4 6'}
                  strokeWidth={ratio === 0 ? '1' : '0.8'}
                  opacity={ratio === 0 ? '0.4' : '0.2'}
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="9.5"
                  fontFamily="inherit"
                  opacity="0.65"
                >
                  {formatCurrency(gridVal, { maximumFractionDigits: 0 })}
                </text>
              </g>
            );
          })}

          {/* Render Area Fills */}
          {incomeArea && <path d={incomeArea} fill="url(#phantomMintGradient)" />}
          {expenseArea && <path d={expenseArea} fill="url(#phantomCoralGradient)" />}

          {/* Smooth Fluid Line Curves (Zero clunky static dots) */}
          {incomePath && (
            <path
              d={incomePath}
              fill="none"
              stroke="#30E0A1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {expensePath && (
            <path
              d={expensePath}
              fill="none"
              stroke="#FF5C5C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Scrubbing Cursor & Dynamic Dots */}
          {hasData &&
            chartData.map((d, i) => {
              const x = getX(i);
              const yInc = getY(d.income);
              const yExp = getY(d.expense);
              const isHovered = hoveredIndex === i;

              return (
                <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  {/* Vertical cursor guide */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={height - paddingBottom}
                      stroke="var(--phantom-purple)"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity="0.6"
                    />
                  )}

                  {/* Active Indicator Point on Hover (Mint Inflow) */}
                  {isHovered && d.income > 0 && (
                    <circle
                      cx={x}
                      cy={yInc}
                      r="5"
                      fill="#30E0A1"
                      stroke="var(--bg-card)"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Active Indicator Point on Hover (Coral Outflow) */}
                  {isHovered && d.expense > 0 && (
                    <circle
                      cx={x}
                      cy={yExp}
                      r="5"
                      fill="#FF5C5C"
                      stroke="var(--bg-card)"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Hit Target Column */}
                  <rect
                    x={x - chartWidth / (chartData.length * 2)}
                    y={paddingTop}
                    width={chartWidth / chartData.length}
                    height={chartHeight + 10}
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
              y={height - 14}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="10"
              fontWeight="500"
              fontFamily="inherit"
              opacity="0.8"
            >
              {d.label}
            </text>
          ))}
        </svg>

        {/* Empty State Overlay when no transactions in period */}
        {!hasData && (
          <div className="chart-empty-overlay">
            <div className="chart-empty-badge">
              <IconChartLine size={15} stroke={1.8} className="chart-empty-icon" />
              <span>Awaiting transaction activity for this period</span>
            </div>
          </div>
        )}

        {/* Dynamic Tooltip on Hover */}
        {hasData && hoveredIndex !== null && chartData[hoveredIndex] && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
              top: '18%',
            }}
          >
            <div className="tooltip-title">{chartData[hoveredIndex].label}</div>
            <div className="tooltip-row text-emerald">
              <span>Inflow:</span>
              <span>{formatCurrency(chartData[hoveredIndex].income)}</span>
            </div>
            <div className="tooltip-row text-rose">
              <span>Outflow:</span>
              <span>{formatCurrency(chartData[hoveredIndex].expense)}</span>
            </div>
            <div className="tooltip-row tooltip-net">
              <span>Net:</span>
              <span className={chartData[hoveredIndex].income >= chartData[hoveredIndex].expense ? 'text-emerald' : 'text-rose'}>
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

