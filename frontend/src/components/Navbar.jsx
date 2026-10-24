import React from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  Calendar,
  Activity
} from 'lucide-react';

export default function Navbar({ 
  monthYear, 
  setMonthYear, 
  summary, 
  onOpenAddModal, 
  onOpenBudgetModal, 
  onToggleInsights,
  insightsCount
}) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(250, 248, 245, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-cream)',
      padding: '14px 28px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#1C1917',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(28, 25, 23, 0.15)'
          }}>
            <TrendingUp size={20} color="#FAF8F5" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1.35rem', 
                fontWeight: 800, 
                letterSpacing: '-0.03em',
                color: '#1C1917'
              }}>
                FinSight
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-cream-soft)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-cream)'
              }}>
                Intelligence
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Expense Analyzer &amp; Anomaly Detection
            </p>
          </div>
        </div>

        {/* Center / Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Health Score Pill */}
          {summary && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-forest-soft)',
              border: '1px solid rgba(22, 101, 52, 0.2)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--accent-forest-text)'
            }}>
              <Activity size={14} color="var(--accent-forest)" />
              <span>Health Score:</span>
              <strong style={{ color: '#14532D', fontWeight: 800 }}>{summary.healthScore ?? 0}/100</strong>
              <span style={{ fontSize: '0.74rem', opacity: 0.85 }}>({summary.healthStatus || 'No Data'})</span>
            </div>
          )}

          {/* Month Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            background: '#FFFFFF',
            border: '1px solid var(--border-cream)',
            boxShadow: 'var(--shadow-subtle)',
            fontSize: '0.84rem'
          }}>
            <Calendar size={15} color="var(--text-secondary)" />
            <select 
              value={monthYear} 
              onChange={(e) => setMonthYear(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                return <option key={val} value={val}>{label}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            className="btn btn-secondary" 
            onClick={onOpenBudgetModal}
            title="Configure monthly budget targets"
          >
            <Sliders size={15} />
            <span>Budgets</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onToggleInsights}
            style={{ position: 'relative' }}
          >
            <Sparkles size={15} color="var(--accent-purple)" />
            <span>AI Insights</span>
            {insightsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#1C1917',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {insightsCount}
              </span>
            )}
          </button>

          <button 
            className="btn btn-primary" 
            onClick={onOpenAddModal}
          >
            <PlusCircle size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
}
