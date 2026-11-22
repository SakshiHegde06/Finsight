import React, { useState } from 'react';
import { 
  Home, 
  Shirt, 
  Utensils, 
  Bus, 
  ShoppingCart, 
  Gamepad2, 
  Wallet, 
  Zap, 
  HeartPulse, 
  MoreHorizontal,
  AlertTriangle,
  Trash2,
  Edit3,
  X
} from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../data/screenshotDemoData';

export default function DayGroupedTransactionList({ 
  transactions = [], 
  onEdit, 
  onDelete 
}) {
  const [selectedTx, setSelectedTx] = useState(null);

  // Helper to render appropriate category icon
  const renderCategoryIcon = (category, type) => {
    const cat = category?.toLowerCase();
    const isIncome = type === 'INCOME';

    if (isIncome) {
      return <Wallet size={20} strokeWidth={2} />;
    }

    switch (cat) {
      case 'housing':
      case 'rent':
        return <Home size={20} strokeWidth={2} />;
      case 'clothing':
      case 'apparel':
        return <Shirt size={20} strokeWidth={2} />;
      case 'food':
      case 'dining':
        return <Utensils size={20} strokeWidth={2} />;
      case 'transportation':
      case 'travel':
      case 'commute':
        return <Bus size={20} strokeWidth={2} />;
      case 'shopping':
        return <ShoppingCart size={20} strokeWidth={2} />;
      case 'entertainment':
      case 'music':
      case 'gaming':
        return <Gamepad2 size={20} strokeWidth={2} />;
      case 'utilities':
        return <Zap size={20} strokeWidth={2} />;
      case 'healthcare':
      case 'medical':
        return <HeartPulse size={20} strokeWidth={2} />;
      default:
        return <MoreHorizontal size={20} strokeWidth={2} />;
    }
  };

  const getCategoryColor = (category, type) => {
    if (type === 'INCOME') return CATEGORY_DEFINITIONS.salary.color;
    const catDef = CATEGORY_DEFINITIONS[category?.toLowerCase()];
    return catDef ? catDef.color : '#94a3b8';
  };

  const formatAmount = (amount) => {
    return Math.round(amount || 0).toLocaleString('en-IN');
  };

  // Format date header like "14 Nov Saturday"
  const formatDateHeader = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const day = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' });
      const weekday = d.toLocaleString('en-US', { weekday: 'long' });
      return {
        formatted: `${day} ${month}  ${weekday}`,
        day,
        month,
        weekday
      };
    } catch (e) {
      return { formatted: dateStr, day: '', month: '', weekday: '' };
    }
  };

  // Group transactions by date string YYYY-MM-DD
  const groupedByDate = transactions.reduce((groups, tx) => {
    const d = tx.date || '2026-11-14';
    if (!groups[d]) {
      groups[d] = [];
    }
    groups[d].push(tx);
    return groups;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ paddingBottom: 24 }}>
      {sortedDates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>No transactions recorded for this period.</p>
          <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Tap the + button below to log an expense or income.</p>
        </div>
      ) : (
        sortedDates.map((dateStr) => {
          const txsForDay = groupedByDate[dateStr];
          const headerInfo = formatDateHeader(dateStr);

          // Calculate day expenses subtotal
          const dayExpenses = txsForDay
            .filter(t => t.type !== 'INCOME')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

          return (
            <div key={dateStr} style={{ marginBottom: 4 }}>
              {/* Day Header Row */}
              <div className="day-group-header">
                <span className="date-text">
                  <span style={{ fontWeight: 700, color: '#111827', marginRight: 6 }}>
                    {headerInfo.day} {headerInfo.month}
                  </span>
                  <span>{headerInfo.weekday}</span>
                </span>
                {dayExpenses > 0 && (
                  <span className="subtotal-text">
                    Expenses: {formatAmount(dayExpenses)}
                  </span>
                )}
              </div>

              {/* Transactions for this day */}
              <div>
                {txsForDay.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const catColor = getCategoryColor(tx.category, tx.type);

                  return (
                    <div 
                      key={tx.id} 
                      className="tx-row"
                      onClick={() => setSelectedTx(tx)}
                    >
                      {/* Left: Circle Icon */}
                      <div 
                        className="tx-category-icon-circle"
                        style={{ backgroundColor: catColor }}
                      >
                        {renderCategoryIcon(tx.category, tx.type)}
                      </div>

                      {/* Middle: Details */}
                      <div className="tx-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="tx-desc">{tx.description}</span>
                          {tx.isAnomaly && (
                            <span className="anomaly-tag" title={tx.anomalyReason || 'Spending Outlier'}>
                              <AlertTriangle size={10} /> Outlier
                            </span>
                          )}
                        </div>
                        {tx.merchant && (
                          <span className="tx-sub-info">
                            {tx.merchant} {tx.paymentMethod ? `• ${tx.paymentMethod}` : ''}
                          </span>
                        )}
                      </div>

                      {/* Right: Amount */}
                      <div className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? `+${formatAmount(tx.amount)}` : `-${formatAmount(tx.amount)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Transaction Action Modal / Sheet */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 360, padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div 
                  className="tx-category-icon-circle" 
                  style={{ 
                    backgroundColor: getCategoryColor(selectedTx.category, selectedTx.type),
                    width: 36,
                    height: 36,
                    marginRight: 0
                  }}
                >
                  {renderCategoryIcon(selectedTx.category, selectedTx.type)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>
                    {selectedTx.description}
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                    {selectedTx.date} • {selectedTx.displayCategory || selectedTx.category}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ 
              background: '#f9fafb', 
              borderRadius: 12, 
              padding: '12px 14px', 
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 600 }}>Amount:</span>
              <span style={{ 
                fontSize: '1.2rem', 
                fontWeight: 800, 
                color: selectedTx.type === 'INCOME' ? '#10b981' : '#111827' 
              }}>
                {selectedTx.type === 'INCOME' ? '+' : '-'}₹{formatAmount(selectedTx.amount)}
              </span>
            </div>

            {selectedTx.isAnomaly && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 16,
                fontSize: '0.76rem',
                color: '#b91c1c'
              }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <AlertTriangle size={13} />
                  <span>AI Outlier Detection Flag</span>
                </div>
                <p>{selectedTx.anomalyReason || 'This transaction amount exceeds regular historical frequency for this category.'}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => {
                  const tx = selectedTx;
                  setSelectedTx(null);
                  if (onEdit) onEdit(tx);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px',
                  borderRadius: 10,
                  background: '#f3f4f6',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#1f2937',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={15} />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  const id = selectedTx.id;
                  setSelectedTx(null);
                  if (onDelete) onDelete(id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px',
                  borderRadius: 10,
                  background: '#fee2e2',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#dc2626',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

