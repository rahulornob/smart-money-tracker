import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import CategoryIcon from '../common/CategoryIcon';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconFlame,
  IconTrendingDown,
  IconSparkles,
  IconCalendarStats,
  IconX,
  IconReceipt,
  IconBuildingBank,
} from '@tabler/icons-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to format Date into 'YYYY-MM-DD'
function toDateKey(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export default function SpendingHeatmapCalendar() {
  const { transactions, categories, accounts, formatCurrency } = useFinance();

  // Active viewing date (defaults to current month)
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Selected date key for the detail inspector
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  // Hovered day for interactive tooltip
  const [hoveredDay, setHoveredDay] = useState(null);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
    setSelectedDateKey(null);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
    setSelectedDateKey(null);
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
    setSelectedDateKey(todayKey);
  };

  // Map of dateKey ('YYYY-MM-DD') -> { totalSpent, items: [] }
  const dailySpendingMap = useMemo(() => {
    const map = {};

    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return; // Only expenses contribute to spending heatmap
      if (!tx.date) return;

      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;

      const key = toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      const amt = Number(tx.amount) || 0;

      if (!map[key]) {
        map[key] = { totalSpent: 0, items: [] };
      }
      map[key].totalSpent += amt;
      map[key].items.push(tx);
    });

    return map;
  }, [transactions]);

  // Calendar matrix calculations for viewMonth
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  // Calculate statistics for the active month
  const monthStats = useMemo(() => {
    let total = 0;
    let peakDay = null;
    let peakAmount = 0;
    let activeSpendDays = 0;
    let zeroSpendDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const key = toDateKey(viewYear, viewMonth, day);
      const data = dailySpendingMap[key];
      const spent = data ? data.totalSpent : 0;

      total += spent;
      if (spent > 0) {
        activeSpendDays++;
        if (spent > peakAmount) {
          peakAmount = spent;
          peakDay = day;
        }
      } else {
        zeroSpendDays++;
      }
    }

    const dailyAvg = activeSpendDays > 0 ? total / daysInMonth : 0;

    return {
      totalSpent: total,
      dailyAvg,
      peakDay,
      peakAmount,
      activeSpendDays,
      zeroSpendDays,
    };
  }, [viewYear, viewMonth, daysInMonth, dailySpendingMap]);

  // Intensity level calculator based on month's peak spending
  const getIntensityLevel = (amount) => {
    if (!amount || amount <= 0) return 0;
    const max = monthStats.peakAmount || 1;
    const ratio = amount / max;

    if (ratio <= 0.2) return 1;
    if (ratio <= 0.45) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  // Determine if a date is "today"
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === viewYear && now.getMonth() === viewMonth;
  const todayDay = now.getDate();

  // Selected date data for detail drawer
  const selectedDayData = useMemo(() => {
    if (!selectedDateKey) return null;
    const parts = selectedDateKey.split('-');
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const data = dailySpendingMap[selectedDateKey] || { totalSpent: 0, items: [] };

    return {
      dateKey: selectedDateKey,
      dateObj,
      formattedDate: dateObj.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      totalSpent: data.totalSpent,
      items: data.items,
    };
  }, [selectedDateKey, dailySpendingMap]);

  return (
    <div className="spending-heatmap-card glass-panel">
      {/* Heatmap Card Header */}
      <div className="heatmap-header-row">
        <div className="heatmap-title-group">
          <div className="heatmap-title-cluster">
            <div className="heatmap-icon-box">
              <IconCalendarStats size={20} stroke={1.8} color="#FF5C5C" />
            </div>
            <div>
              <h3 className="heatmap-card-title">Spending Heatmap</h3>
              <p className="heatmap-card-sub">Daily cash outflow & spending intensity calendar</p>
            </div>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="heatmap-month-nav">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="btn btn-secondary btn-sm heatmap-today-btn"
            title="Jump to current month"
          >
            Today
          </button>
          <div className="heatmap-nav-arrows">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="heatmap-nav-arrow-btn"
              aria-label="Previous month"
            >
              <IconChevronLeft size={18} stroke={2} />
            </button>
            <span className="heatmap-current-month-label">
              {viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="heatmap-nav-arrow-btn"
              aria-label="Next month"
            >
              <IconChevronRight size={18} stroke={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Stat Badges */}
      <div className="heatmap-stats-strip">
        <div className="heatmap-stat-pill">
          <span className="hstat-label">Month Total:</span>
          <span className="hstat-val coral">{formatCurrency(monthStats.totalSpent)}</span>
        </div>
        <div className="heatmap-stat-pill">
          <span className="hstat-label">Daily Avg:</span>
          <span className="hstat-val">{formatCurrency(monthStats.dailyAvg)}</span>
        </div>
        <div className="heatmap-stat-pill">
          <span className="hstat-label">Peak Day:</span>
          <span className="hstat-val">
            {monthStats.peakDay
              ? `${viewDate.toLocaleString(undefined, { month: 'short' })} ${monthStats.peakDay} (${formatCurrency(monthStats.peakAmount)})`
              : 'None'}
          </span>
        </div>
        <div className="heatmap-stat-pill">
          <span className="hstat-label">No-Spend Days:</span>
          <span className="hstat-val mint">{monthStats.zeroSpendDays} days</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="heatmap-calendar-matrix">
        {/* Weekday Labels Header */}
        <div className="heatmap-weekdays-row">
          {WEEKDAYS.map((day) => (
            <div key={day} className="heatmap-weekday-cell">
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="heatmap-days-grid">
          {/* Empty padding cells before the 1st */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="heatmap-day-cell empty" />
          ))}

          {/* Active Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateKey = toDateKey(viewYear, viewMonth, dayNum);
            const data = dailySpendingMap[dateKey];
            const spent = data ? data.totalSpent : 0;
            const txCount = data ? data.items.length : 0;
            const level = getIntensityLevel(spent);
            const isToday = isCurrentMonth && dayNum === todayDay;
            const isSelected = selectedDateKey === dateKey;

            return (
              <button
                key={dateKey}
                type="button"
                className={`heatmap-day-cell level-${level} ${isToday ? 'is-today' : ''} ${
                  isSelected ? 'is-selected' : ''
                }`}
                onClick={() => setSelectedDateKey(isSelected ? null : dateKey)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredDay({
                    dateKey,
                    dayNum,
                    spent,
                    txCount,
                    top: rect.top,
                    left: rect.left + rect.width / 2,
                  });
                }}
                onMouseLeave={() => setHoveredDay(null)}
                aria-label={`${viewDate.toLocaleString(undefined, { month: 'short' })} ${dayNum}: ${formatCurrency(spent)} spent`}
              >
                <div className="day-number-tag">{dayNum}</div>
                {spent > 0 ? (
                  <div className="day-spend-val">
                    {formatCurrency(spent)}
                  </div>
                ) : (
                  <div className="day-spend-zero">—</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Tooltip on Hover */}
      {hoveredDay && !selectedDateKey && (
        <div
          className="heatmap-floating-tooltip"
          style={{
            position: 'fixed',
            top: `${hoveredDay.top - 8}px`,
            left: `${hoveredDay.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="tooltip-date-header">
            {viewDate.toLocaleString(undefined, { month: 'short' })} {hoveredDay.dayNum}, {viewYear}
          </div>
          <div className="tooltip-amount-row">
            <span className="tooltip-amount">
              {formatCurrency(hoveredDay.spent)}
            </span>
            <span className="tooltip-tx-count">
              {hoveredDay.txCount} {hoveredDay.txCount === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>
        </div>
      )}

      {/* Intensity Legend & Instructions Footer */}
      <div className="heatmap-footer-row">
        <div className="heatmap-hint-text">
          <span>Click any date to inspect individual spending details</span>
        </div>
        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          <span className="legend-tile level-0" title="Zero spend" />
          <span className="legend-tile level-1" title="Low spend" />
          <span className="legend-tile level-2" title="Moderate spend" />
          <span className="legend-tile level-3" title="High spend" />
          <span className="legend-tile level-4" title="Peak spend" />
          <span className="legend-label">More</span>
        </div>
      </div>

      {/* Selected Day Transaction Breakdown Drawer */}
      {selectedDayData && (
        <div className="heatmap-day-inspector">
          <div className="inspector-header-row">
            <div>
              <div className="inspector-badge">
                <IconReceipt size={14} stroke={1.8} />
                <span>Date Inspection</span>
              </div>
              <h4 className="inspector-date-title">{selectedDayData.formattedDate}</h4>
            </div>
            <div className="inspector-right-group">
              <div className="inspector-total-pill">
                <span>Total Spent:</span>
                <strong className="text-coral">{formatCurrency(selectedDayData.totalSpent)}</strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateKey(null)}
                className="btn-icon inspector-close-btn"
                aria-label="Close day inspection"
              >
                <IconX size={16} stroke={1.8} />
              </button>
            </div>
          </div>

          {selectedDayData.items.length === 0 ? (
            <div className="inspector-empty-state">
              <IconSparkles size={24} color="#30E0A1" stroke={1.8} />
              <span>No money spent on this day. Great savings streak!</span>
            </div>
          ) : (
            <div className="inspector-tx-list">
              {selectedDayData.items.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId) || {
                  name: 'General',
                  color: '#94a3b8',
                  icon: 'ShoppingBag',
                };
                const acc = accounts.find((a) => a.id === tx.accountId) || {
                  name: 'Account',
                };

                return (
                  <div key={tx.id} className="inspector-tx-row">
                    <div className="inspector-tx-left">
                      <div
                        className="inspector-cat-icon-tile"
                        style={{
                          background: `${cat.color || '#AB9FF2'}1A`,
                          color: cat.color || '#AB9FF2',
                        }}
                      >
                        <CategoryIcon iconName={cat.icon} size={18} />
                      </div>
                      <div className="inspector-tx-details">
                        <div className="inspector-tx-payee">
                          {tx.payee || cat.name || 'Expense'}
                        </div>
                        <div className="inspector-tx-sub">
                          <span>{cat.name}</span>
                          <span className="inspector-dot">•</span>
                          <span>{acc.name}</span>
                          {tx.note && (
                            <>
                              <span className="inspector-dot">•</span>
                              <span className="inspector-note">"{tx.note}"</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="inspector-tx-amount">
                      -{formatCurrency(tx.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
