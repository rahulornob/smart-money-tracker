import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import { IconChartPie } from '@tabler/icons-react';

export default function CategoryDonutChart() {
  const { transactions, categories, formatCurrency, currentMonthExpense } = useFinance();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Group current month expenses by category
  const expenseData = React.useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const categoryTotals = {};
    currentMonthExpenses.forEach((tx) => {
      categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + Number(tx.amount);
    });

    const list = Object.entries(categoryTotals)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId) || {
          name: 'Other',
          color: '#94a3b8',
          icon: 'MoreHorizontal',
        };
        const percentage = currentMonthExpense > 0 ? (amount / currentMonthExpense) * 100 : 0;
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

    return list;
  }, [transactions, categories, currentMonthExpense]);

  // Donut geometry constants with generous padding to prevent any clipping on hover
  const viewBoxSize = 220;
  const center = viewBoxSize / 2;
  const strokeWidth = 22;
  const hoverStrokeWidth = 28;
  const radius = 78;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets for each slice safely inside useMemo
  const slices = React.useMemo(() => {
    const result = [];
    let acc = 0;
    for (let i = 0; i < expenseData.length; i++) {
      const item = expenseData[i];
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((acc / 100) * circumference);
      acc += item.percentage;
      result.push({
        ...item,
        strokeDasharray,
        strokeDashoffset,
      });
    }
    return result;
  }, [expenseData, circumference]);

  // Ensure hovered slice is drawn last so its expanded stroke renders smoothly on top
  const sortedSlices = React.useMemo(() => {
    if (!hoveredCategory) return slices;
    return [...slices].sort((a, b) => {
      if (a.id === hoveredCategory.id) return 1;
      if (b.id === hoveredCategory.id) return -1;
      return 0;
    });
  }, [slices, hoveredCategory]);

  const activeDisplay = hoveredCategory || (expenseData.length > 0 ? expenseData[0] : null);

  return (
    <div className="category-donut-card glass-panel">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Spending Breakdown</h2>
          <p className="card-subtitle">Where your money went this month</p>
        </div>
        <div className="badge badge-neutral">
          <IconChartPie size={14} stroke={1.8} />
          <span>{expenseData.length} Categories</span>
        </div>
      </div>

      {expenseData.length === 0 ? (
        <div className="donut-empty-state">
          <p>No expenses recorded for this month.</p>
        </div>
      ) : (
        <div className="donut-body-grid">
          {/* Circular Donut Diagram */}
          <div className="donut-svg-container">
            <svg
              width={190}
              height={190}
              viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              className="donut-svg"
              style={{ overflow: 'visible' }}
            >
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth={strokeWidth}
              />
              {/* Interactive Slices */}
              {sortedSlices.map((slice) => {
                const isHovered = hoveredCategory && hoveredCategory.id === slice.id;
                return (
                  <circle
                    key={slice.id}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? hoverStrokeWidth : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="donut-slice"
                    onMouseEnter={() => setHoveredCategory(slice)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{
                      transformOrigin: `${center}px ${center}px`,
                      transform: 'rotate(-90deg)',
                      transition: 'stroke-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, filter 0.2s ease',
                      cursor: 'pointer',
                      opacity: hoveredCategory && !isHovered ? 0.45 : 1,
                      filter: 'none',
                    }}
                  />
                );
              })}
            </svg>

            {/* Center Info Display */}
            <div className="donut-center-info">
              {activeDisplay ? (
                <>
                  <CategoryIcon
                    iconName={activeDisplay.icon}
                    size={20}
                    color={activeDisplay.color}
                  />
                  <div className="donut-center-percent">
                    {activeDisplay.percentage.toFixed(0)}%
                  </div>
                  <div className="donut-center-name">{activeDisplay.name}</div>
                </>
              ) : (
                <>
                  <div className="donut-center-label">Total Out</div>
                  <div className="donut-center-amount">{formatCurrency(currentMonthExpense)}</div>
                </>
              )}
            </div>
          </div>

          {/* Category Legend & Bars */}
          <div className="category-legend-list">
            {expenseData.slice(0, 5).map((cat) => (
              <div
                key={cat.id}
                className={`legend-item ${hoveredCategory?.id === cat.id ? 'active-legend' : ''}`}
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="legend-icon-badge" style={{ backgroundColor: `${cat.color}20` }}>
                  <CategoryIcon iconName={cat.icon} size={15} color={cat.color} />
                </div>
                <div className="legend-content">
                  <div className="legend-row">
                    <span className="legend-name">{cat.name}</span>
                    <span className="legend-amount">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="legend-bar-track">
                    <div
                      className="legend-bar-fill"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
