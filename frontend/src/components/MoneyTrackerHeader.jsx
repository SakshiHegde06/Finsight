import React, { useState } from 'react';
import { Menu, CalendarDays, ChevronDown, Check } from 'lucide-react';

export default function MoneyTrackerHeader({ 
  monthYear, 
  setMonthYear, 
  totalExpense = 0, 
  totalIncome = 0, 
  balance = 0,
  onOpenMenu,
  onOpenCalendar
}) {
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Format currency with standard Indian numbering (11,867 or 12,000)
  const formatNumber = (num) => {
    return Math.round(num || 0).toLocaleString('en-IN');
  };

  // Generate recent 12 months for picker
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const shortMonth = d.toLocaleString('en-US', { month: 'short' });
    return {
      value: `${year}-${monthNum}`,
      year,
      month: shortMonth,
      label: `${year} ${shortMonth}`
    };
  });

  // Extract year and month name from current monthYear
  let currentYear = '2026';
  let currentMonthName = 'Nov';
  try {
    if (monthYear) {
      const [y, m] = monthYear.split('-');
      currentYear = y;
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      currentMonthName = dateObj.toLocaleString('en-US', { month: 'short' });
    }
  } catch (e) {
    // fallback
  }

  return (
    <header className="money-header-yellow">
      {/* Top row: Menu, Title, Calendar */}
      <div className="header-top-row">
        <button 
          onClick={onOpenMenu}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            color: '#111827'
          }}
          title="Menu"
        >
          <Menu size={26} strokeWidth={2.4} />
        </button>

        <div className="header-title-container">
          <span>Money Tracker</span>
          <span className="cat-emoji" role="img" aria-label="Lucky Cat">
            🐱
          </span>
        </div>

        <button 
          onClick={() => {
            setShowMonthDropdown(!showMonthDropdown);
            if (onOpenCalendar) onOpenCalendar();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            color: '#111827'
          }}
          title="Calendar Month Selector"
        >
          <CalendarDays size={24} strokeWidth={2.2} />
        </button>
      </div>

      {/* Financial Summary Grid (Month Picker, Expenses, Income, Balance) */}
      <div className="header-stats-grid" style={{ position: 'relative' }}>
        {/* Month Selector Pill */}
        <div 
          className="month-picker-pill"
          onClick={() => setShowMonthDropdown(!showMonthDropdown)}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', lineHeight: 1 }}>
            {currentYear}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 3 }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', lineHeight: 1 }}>
              {currentMonthName}
            </span>
            <ChevronDown size={14} color="#374151" strokeWidth={2.5} />
          </div>
        </div>

        {/* Expenses */}
        <div className="stat-item">
          <span className="stat-label">Expenses</span>
          <span className="stat-amount">{formatNumber(totalExpense)}</span>
        </div>

        {/* Income */}
        <div className="stat-item">
          <span className="stat-label">Income</span>
          <span className="stat-amount">{formatNumber(totalIncome)}</span>
        </div>

        {/* Balance */}
        <div className="stat-item">
          <span className="stat-label">Balance</span>
          <span className="stat-amount" style={{ color: balance < 0 ? '#dc2626' : '#111827' }}>
            {formatNumber(balance)}
          </span>
        </div>

        {/* Month Dropdown Popup */}
        {showMonthDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            zIndex: 60,
            background: '#ffffff',
            borderRadius: 14,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: 8,
            width: 170,
            maxHeight: 240,
            overflowY: 'auto'
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', padding: '4px 8px', textTransform: 'uppercase' }}>
              Select Month
            </p>
            {monthOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  setMonthYear(opt.value);
                  setShowMonthDropdown(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: monthYear === opt.value ? 700 : 500,
                  color: monthYear === opt.value ? '#111827' : '#4b5563',
                  background: monthYear === opt.value ? '#fef3c7' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <span>{opt.label}</span>
                {monthYear === opt.value && <Check size={14} color="#f59e0b" strokeWidth={2.5} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

