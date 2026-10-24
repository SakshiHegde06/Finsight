import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';

export default function BudgetModal({ isOpen, onClose, budgets, monthYear, onSaveBudget }) {
  const [budgetValues, setBudgetValues] = useState({});

  useEffect(() => {
    if (budgets) {
      const map = {};
      budgets.forEach(b => {
        map[b.category] = b.allocatedAmount;
      });
      setBudgetValues(map);
    }
  }, [budgets, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (cat, val) => {
    setBudgetValues(prev => ({
      ...prev,
      [cat]: parseFloat(val) || 0
    }));
  };

  const handleSave = (b) => {
    onSaveBudget({
      category: b.category,
      displayCategory: b.displayCategory,
      allocatedAmount: budgetValues[b.category] || b.allocatedAmount,
      monthYear: monthYear || '2026-10',
      color: b.color
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 620 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-cream)',
          background: 'var(--bg-cream-base)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={20} color="var(--accent-forest)" />
              <span>Monthly Budget Allocations</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Set category limits to track overruns and receive warning alerts
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {budgets && budgets.map(b => (
              <div key={b.category} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-cream-base)',
                border: '1px solid var(--border-cream)',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: b.color || '#475569'
                  }} />
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                      {b.displayCategory || b.category}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Current spend: ₹{(b.spentAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative', width: 140 }}>
                    <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)', fontSize: '0.85rem' }}>₹</span>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      className="input-field"
                      value={budgetValues[b.category] !== undefined ? budgetValues[b.category] : b.allocatedAmount}
                      onChange={(e) => handleInputChange(b.category, e.target.value)}
                      style={{ paddingLeft: 24, paddingRight: 8, height: 38 }}
                    />
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleSave(b)}
                    style={{ padding: '8px 12px', fontSize: '0.78rem' }}
                    title="Update category budget"
                  >
                    <Check size={14} />
                    <span>Update</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-cream)',
          background: 'var(--bg-cream-base)'
        }}>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
