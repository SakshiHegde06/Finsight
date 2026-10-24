import React from 'react';
import { 
  CreditCard, 
  PiggyBank, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export default function StatCards({ summary, forecast, onFilterAnomalies }) {
  if (!summary) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const utilRate = summary.budgetUtilization || 0;
  const isOverBudget = utilRate >= 100;
  const isNearBudget = utilRate >= 85 && utilRate < 100;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 18,
      marginBottom: 28
    }}>
      {/* 1. Monthly Expense vs Budget */}
      <div className="glass-card glass-card-interactive" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Expenses
            </p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
              {formatCurrency(summary.totalExpense)}
            </h3>
          </div>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-cream-soft)',
            border: '1px solid var(--border-cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CreditCard size={20} color="var(--text-primary)" strokeWidth={1.8} />
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Budget: {formatCurrency(summary.totalBudget)}
            </span>
            <span style={{ 
              fontWeight: 700, 
              color: isOverBudget ? 'var(--accent-crimson)' : isNearBudget ? 'var(--accent-amber)' : 'var(--accent-forest)' 
            }}>
              {utilRate.toFixed(1)}% utilized
            </span>
          </div>
          <div style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            background: 'var(--bg-cream-inset)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, utilRate)}%`,
              height: '100%',
              borderRadius: 3,
              background: isOverBudget 
                ? 'var(--accent-crimson)' 
                : isNearBudget 
                  ? 'var(--accent-amber)' 
                  : 'var(--accent-forest)',
              transition: 'width 0.8s ease'
            }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            Remaining: <strong style={{ color: summary.remainingBudget > 0 ? 'var(--accent-forest)' : 'var(--accent-crimson)' }}>{formatCurrency(summary.remainingBudget)}</strong>
          </p>
        </div>
      </div>

      {/* 2. Net Savings & Savings Rate */}
      <div className="glass-card glass-card-interactive" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Savings
            </p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4, color: summary.netSavings >= 0 ? 'var(--accent-forest)' : 'var(--accent-crimson)' }}>
              {formatCurrency(summary.netSavings)}
            </h3>
          </div>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-forest-soft)',
            border: '1px solid rgba(22, 101, 52, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PiggyBank size={20} color="var(--accent-forest)" strokeWidth={1.8} />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`badge ${summary.savingsRate >= 20 ? 'badge-forest' : summary.savingsRate >= 10 ? 'badge-amber' : 'badge-crimson'}`}>
              {summary.savingsRate >= 20 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {summary.savingsRate.toFixed(1)}% Savings Rate
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>
            {summary.savingsRate >= 20 
              ? 'Exceeds 20% benchmark standard' 
              : 'Target: Channel surplus to hit 20% savings threshold'}
          </p>
        </div>
      </div>

      {/* 3. Daily Velocity & End-Of-Month Forecast */}
      <div className="glass-card glass-card-interactive" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Daily Burn Rate
            </p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
              {formatCurrency(summary.dailyBurnRate)}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/day</span>
            </h3>
          </div>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-amber-soft)',
            border: '1px solid rgba(180, 83, 9, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={20} color="var(--accent-amber)" strokeWidth={1.8} />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Projected Month-End Spend:
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <strong style={{ fontSize: '1rem', color: forecast?.is_overbudget_risk ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>
              {formatCurrency(forecast?.projected_end_of_month ?? summary?.totalExpense ?? 0)}
            </strong>
            {forecast?.is_overbudget_risk && (
              <span className="badge badge-crimson" style={{ fontSize: '0.7rem' }}>
                Risk: Overbudget
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. AI Spending Anomalies Flagged */}
      <div className="glass-card glass-card-interactive" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AI Anomaly Alerts
            </p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4, color: summary.anomalyCount > 0 ? 'var(--accent-crimson)' : 'var(--accent-forest)' }}>
              {summary.anomalyCount}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}> flagged</span>
            </h3>
          </div>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: summary.anomalyCount > 0 ? 'var(--accent-crimson-soft)' : 'var(--accent-forest-soft)',
            border: `1px solid ${summary.anomalyCount > 0 ? 'rgba(190, 18, 60, 0.25)' : 'rgba(22, 101, 52, 0.25)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={20} color={summary.anomalyCount > 0 ? 'var(--accent-crimson)' : 'var(--accent-forest)'} strokeWidth={1.8} />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          {summary.anomalyCount > 0 ? (
            <button 
              onClick={onFilterAnomalies}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-navy)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: 0
              }}
            >
              <span>View unusual spending spikes</span>
              <ArrowUpRight size={14} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-forest)', fontSize: '0.76rem', fontWeight: 600 }}>
              <CheckCircle2 size={14} />
              <span>All transactions match historical patterns</span>
            </div>
          )}
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Evaluated by IsolationForest and Z-score models
          </p>
        </div>
      </div>
    </div>
  );
}
