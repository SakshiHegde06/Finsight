import React, { useState } from 'react';
import { PiggyBank, Edit3, Check, X, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function SavingsTargetCard({ 
  savingsTarget = 2500, 
  onUpdateSavingsTarget,
  totalIncome = 12000, 
  totalExpense = 11867,
  balance = 133
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempTarget, setTempTarget] = useState(savingsTarget);

  // Current savings is net balance (Income - Expense)
  const currentSaved = Math.max(0, balance);
  const target = savingsTarget > 0 ? savingsTarget : 2500;
  const progressPct = Math.min(100, Math.round((currentSaved / target) * 100));
  const remainingToSave = Math.max(0, target - currentSaved);
  const isGoalReached = currentSaved >= target;

  const formatNumber = (num) => Math.round(num || 0).toLocaleString('en-IN');

  const handleSaveModal = (e) => {
    e.preventDefault();
    const val = parseFloat(tempTarget);
    if (!isNaN(val) && val >= 0) {
      onUpdateSavingsTarget(val);
      setIsModalOpen(false);
    }
  };

  const handlePresetSelect = (presetVal) => {
    setTempTarget(presetVal);
  };

  return (
    <>
      <div className="savings-target-card">
        {/* Top row: Title and Edit button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#fef08a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#854d0e'
            }}>
              <PiggyBank size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#854d0e' }}>
              Amount You Want To Save
            </span>
          </div>

          <button
            onClick={() => {
              setTempTarget(savingsTarget);
              setIsModalOpen(true);
            }}
            style={{
              background: '#ffffff',
              border: '1px solid #fde68a',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#854d0e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}
          >
            <Edit3 size={12} />
            <span>Set Target</span>
          </button>
        </div>

        {/* Middle row: Goal Amount & Saved So Far */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Monthly Target
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
              ₹{formatNumber(target)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Saved So Far
            </span>
            <div style={{ 
              fontSize: '1.15rem', 
              fontWeight: 800, 
              color: isGoalReached ? '#15803d' : '#111827' 
            }}>
              ₹{formatNumber(currentSaved)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: 8,
          background: '#fef3c7',
          borderRadius: 9999,
          overflow: 'hidden',
          marginBottom: 8,
          border: '1px solid #fde68a'
        }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            background: isGoalReached 
              ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
              : 'linear-gradient(90deg, #f59e0b, #d97706)',
            borderRadius: 9999,
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>

        {/* Bottom row: Status and guidance */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
          <span style={{ fontWeight: 700, color: isGoalReached ? '#15803d' : '#b45309' }}>
            {isGoalReached 
              ? '🎉 100% Target Met! Great discipline!' 
              : `${progressPct}% achieved (${formatNumber(remainingToSave)} left to save)`}
          </span>

          <span style={{ color: '#78350f', fontSize: '0.72rem' }}>
            {totalIncome > 0 ? `Target: ${(target / totalIncome * 100).toFixed(0)}% of income` : ''}
          </span>
        </div>
      </div>

      {/* Modal: Set Amount You Want to Save */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #f3f4f6',
              background: '#fffbeb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PiggyBank size={20} color="#b45309" strokeWidth={2.4} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>
                  The Amount of Money You Want to Save
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.84rem', color: '#4b5563', marginBottom: 16 }}>
                Set your desired monthly savings target. FinSight will monitor your daily burn rate and guide you to achieve it.
              </p>

              {/* Target input */}
              <div style={{ marginBottom: 18 }}>
                <label className="input-label">How much do you want to save this month? (INR)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 14,
                    top: 12,
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#6b7280'
                  }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    className="input-field"
                    value={tempTarget}
                    onChange={(e) => setTempTarget(e.target.value)}
                    style={{ paddingLeft: 32, fontSize: '1.1rem', fontWeight: 700 }}
                    placeholder="e.g. 2500"
                    required
                  />
                </div>
              </div>

              {/* Quick Presets based on income */}
              <div style={{ marginBottom: 20 }}>
                <label className="input-label">Quick Smart Presets</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect(Math.round(totalIncome * 0.1) || 1200)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#374151',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>10% of Income</div>
                    <strong style={{ color: '#111827' }}>₹{formatNumber(Math.round(totalIncome * 0.1) || 1200)}</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetSelect(Math.round(totalIncome * 0.2) || 2400)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: '#fef3c7',
                      border: '1px solid #fde68a',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#92400e',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>20% Standard Rule</div>
                    <strong style={{ color: '#92400e' }}>₹{formatNumber(Math.round(totalIncome * 0.2) || 2400)}</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetSelect(Math.round(totalIncome * 0.3) || 3600)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#374151',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>30% Aggressive</div>
                    <strong style={{ color: '#111827' }}>₹{formatNumber(Math.round(totalIncome * 0.3) || 3600)}</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetSelect(5000)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#374151',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>Fixed Milestone</div>
                    <strong style={{ color: '#111827' }}>₹5,000</strong>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 10,
                    background: '#f3f4f6',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-yellow"
                  style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                >
                  <Check size={16} />
                  <span>Save Target</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

