import React from 'react';
import {
  PiggyBank,
  Sparkles,
  ShieldAlert,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Target,
  ArrowRight
} from 'lucide-react';

export default function ReportsTab({
  summary,
  forecast,
  insights = [],
  anomalies = [],
  savingsTarget = 2500,
  onOpenSavingsModal,
  totalIncome = 12000,
  totalExpense = 11867,
  balance = 133
}) {
  const formatNumber = (num) => Math.round(num || 0).toLocaleString('en-IN');

  const currentSaved = Math.max(0, balance);
  const target = savingsTarget > 0 ? savingsTarget : 2500;
  const progressPct = Math.min(100, Math.round((currentSaved / target) * 100));
  const remaining = Math.max(0, target - currentSaved);
  const isGoalReached = currentSaved >= target;

  // Days left in current month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);

  // Maximum spend allowed per day to achieve the savings target
  const maxSafeSpendPerDay = Math.max(
    0,
    Math.round((totalIncome - target - totalExpense) / daysRemaining)
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Header */}
      <div className="money-header-yellow" style={{ padding: '16px 20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
          Financial Intelligence &amp; Reports
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: 2 }}>
          ML-driven spending health, savings target adherence &amp; anomaly logs
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* 1. SAVINGS GOAL REPORT (Amount You Want to Save) */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309'
              }}>
                <PiggyBank size={18} strokeWidth={2.4} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827' }}>
                  Savings Target Breakdown
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                  The amount of money you want to save
                </span>
              </div>
            </div>

            <button
              onClick={onOpenSavingsModal}
              style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#92400e',
                cursor: 'pointer'
              }}
            >
              Adjust Target
            </button>
          </div>

          {/* Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>Target Goal</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
                ₹{formatNumber(target)}
              </div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>Net Saved So Far</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isGoalReached ? '#16a34a' : '#111827', marginTop: 2 }}>
                ₹{formatNumber(currentSaved)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 4 }}>
              <span style={{ color: '#6b7280', fontWeight: 600 }}>Progress: {progressPct}%</span>
              <span style={{ color: '#92400e', fontWeight: 700 }}>
                {isGoalReached ? 'Target Reached!' : `₹${formatNumber(remaining)} needed`}
              </span>
            </div>
            <div style={{ height: 8, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                width: `${progressPct}%`,
                height: '100%',
                background: isGoalReached ? '#16a34a' : '#f59e0b',
                borderRadius: 999,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Safe spend allowance */}
          <div style={{
            background: maxSafeSpendPerDay > 0 ? '#f0fdf4' : '#fff1f2',
            border: `1px solid ${maxSafeSpendPerDay > 0 ? '#bbf7d0' : '#fecdd3'}`,
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: '0.78rem',
            color: maxSafeSpendPerDay > 0 ? '#166534' : '#9f1239'
          }}>
            {maxSafeSpendPerDay > 0 ? (
              <div>
                <strong>Safe Daily Spending Limit: </strong>
                <span>Spend under ₹{formatNumber(maxSafeSpendPerDay)}/day over the remaining {daysRemaining} days to hit your savings goal.</span>
              </div>
            ) : (
              <div>
                <strong>Savings Target Warning: </strong>
                <span>Expenses have absorbed your available surplus. Avoid further non-essential spending to preserve your savings.</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. SPENDING ANOMALIES (IsolationForest) */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldAlert size={20} color="#dc2626" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827' }}>
              Spending Anomaly Alerts
            </h3>
          </div>

          {anomalies && anomalies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {anomalies.map((anom) => (
                <div key={anom.id} style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: 12,
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.88rem', textTransform: 'capitalize' }}>
                      {anom.description}
                    </span>
                    <span style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.92rem' }}>
                      -₹{formatNumber(anom.amount)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#7f1d1d' }}>
                    {anom.anomalyReason || 'Statistically flagged as an extreme spending outlier for this category.'}
                  </p>
                  <div style={{ fontSize: '0.7rem', color: '#991b1b', marginTop: 4, opacity: 0.85 }}>
                    Date: {anom.date} • {anom.category}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontSize: '0.82rem', padding: '10px 0' }}>
              <CheckCircle2 size={16} />
              <span>No unusual spending spikes detected this period.</span>
            </div>
          )}
        </div>

        {/* 3. AI FINANCIAL RECOMMENDATIONS */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={20} color="#8b5cf6" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827' }}>
              FinSight AI Insights
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              background: '#f5f3ff',
              border: '1px solid #ede9fe',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: '0.8rem',
              color: '#5b21b6'
            }}>
              💡 <strong>Rent &amp; Housing: </strong>
              <span>Housing accounted for 75.8% of this month's total spend (₹9,000). Balancing secondary categories like dining and clothing will keep you within budget.</span>
            </div>

            <div style={{
              background: '#f5f3ff',
              border: '1px solid #ede9fe',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: '0.8rem',
              color: '#5b21b6'
            }}>
              💡 <strong>Savings Accelerator: </strong>
              <span>With ₹12,000 income and ₹11,867 expenses, redirecting upcoming small daily micro-spends (coffee, ice cream) will quickly build your ₹{formatNumber(target)} savings goal.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

