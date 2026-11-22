import React, { useState } from 'react';
import { Menu, CalendarDays, ChevronDown, Check, RotateCcw, X, Calendar } from 'lucide-react';

export default function MoneyTrackerHeader({ 
  monthYear, 
  setMonthYear, 
  totalExpense = 0, 
  totalIncome = 0, 
  balance = 0,
  onOpenMenu,
  onResetData
}) {
  const [showMonthModal, setShowMonthModal] = useState(false);

  // Format currency
  const formatNumber = (num) => {
    return Math.round(num || 0).toLocaleString('en-IN');
  };

  // Recent 12 months list
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const shortMonth = d.toLocaleString('en-US', { month: 'short' });
    const fullMonth = d.toLocaleString('en-US', { month: 'long' });
    return {
      value: `${year}-${monthNum}`,
      year,
      month: shortMonth,
      label: `${fullMonth} ${year}`
    };
  });

  // Extract year and month name
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
      {/* Top row: Menu, Title, Action Buttons */}
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

        {/* Right Top Buttons: Reset Data & Calendar Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onResetData && (
            <button
              onClick={onResetData}
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 8,
                padding: '5px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#111827'
              }}
              title="Reset all data"
            >
              <RotateCcw size={13} color="#991b1b" strokeWidth={2.4} />
              <span>Reset</span>
            </button>
          )}

          <button 
            onClick={() => setShowMonthModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 8,
              padding: '5px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#111827'
            }}
            title="Select Month"
          >
            <CalendarDays size={14} strokeWidth={2.4} />
            <span>Month</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Grid (Month Picker, Expenses, Income, Balance) */}
      <div className="header-stats-grid">
        {/* Month Selector Pill */}
        <div 
          className="month-picker-pill"
          onClick={() => setShowMonthModal(true)}
          title="Click to select month"
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
      </div>

      {/* Select Month Modal / Dialog */}
      {showMonthModal && (
        <div className="modal-overlay" onClick={() => setShowMonthModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 360, padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color="#b45309" strokeWidth={2.4} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>
                  Select Month &amp; Year
                </h3>
              </div>
              <button 
                onClick={() => setShowMonthModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Custom Month Picker Input */}
            <div style={{ marginBottom: 16 }}>
              <label className="input-label">Pick Any Month</label>
              <input
                type="month"
                className="input-field"
                value={monthYear}
                onChange={(e) => {
                  if (e.target.value) {
                    setMonthYear(e.target.value);
                    setShowMonthModal(false);
                  }
                }}
                style={{ fontSize: '1rem', fontWeight: 700, padding: '10px 14px' }}
              />
            </div>

            {/* Quick Month Select List */}
            <div>
              <label className="input-label">Quick Select</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {monthOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setMonthYear(opt.value);
                      setShowMonthModal(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: monthYear === opt.value ? '#fef3c7' : '#f8fafc',
                      border: `1px solid ${monthYear === opt.value ? '#fde68a' : '#e2e8f0'}`,
                      fontSize: '0.85rem',
                      fontWeight: monthYear === opt.value ? 700 : 500,
                      color: monthYear === opt.value ? '#92400e' : '#334155',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{opt.label}</span>
                    {monthYear === opt.value && <Check size={16} color="#d97706" strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
