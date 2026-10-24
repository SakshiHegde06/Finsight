import React from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  Lightbulb,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function AiInsightsDrawer({ 
  isOpen, 
  onClose, 
  summary, 
  insights, 
  anomalies, 
  onRefreshInsights, 
  isRefreshing 
}) {
  if (!isOpen) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const score = summary?.healthScore ?? 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 90,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(28, 25, 23, 0.45)',
      backdropFilter: 'blur(5px)',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        height: '100vh',
        background: '#FAF8F5',
        borderLeft: '1px solid var(--border-cream)',
        boxShadow: '-10px 0 35px rgba(28, 25, 23, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.22s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-cream)',
          background: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#1C1917',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <Sparkles size={18} color="#FAF8F5" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>FinSight Advisor</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Machine learning insights &amp; optimization</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              className="btn-icon" 
              onClick={onRefreshInsights} 
              disabled={isRefreshing}
              title="Re-run AI recommendation analysis"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Health Score Gauge Card */}
          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            background: '#FFFFFF',
            border: '1px solid var(--border-cream)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Financial Health Score
              </span>
              <span className={`badge ${score >= 80 ? 'badge-forest' : score >= 65 ? 'badge-navy' : score > 0 ? 'badge-amber' : 'badge-cream'}`}>
                {summary?.healthStatus || 'No Data'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {score}
              </span>
              <span style={{ fontSize: '1.15rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
            </div>

            {/* Score Track */}
            <div style={{
              width: '100%',
              height: 7,
              borderRadius: 3.5,
              background: 'var(--bg-cream-inset)',
              overflow: 'hidden',
              marginBottom: 12
            }}>
              <div style={{
                width: `${score}%`,
                height: '100%',
                background: score >= 80 
                  ? 'var(--accent-forest)' 
                  : score >= 65 
                    ? 'var(--accent-navy)' 
                    : 'var(--accent-amber)',
                borderRadius: 3.5
              }} />
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Calculated via multi-factor model factoring in <strong>{summary?.savingsRate != null ? `${summary.savingsRate.toFixed(1)}% savings rate` : '0% savings rate'}</strong>, 
              budget adherence, and low anomalous variance.
            </p>
          </div>

          {/* AI Personalized Recommendations */}
          <div>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Lightbulb size={16} color="var(--accent-amber)" />
              <span>Smart Recommendations</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(() => {
                const seen = new Set();
                const uniqueList = (insights || []).filter(i => {
                  const key = `${i.title || ''}-${i.message || ''}`.trim().toLowerCase();
                  if (!key || seen.has(key)) return false;
                  seen.add(key);
                  return true;
                });

                if (uniqueList.length === 0) {
                  return (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      No active warnings. Your financial metrics look strong.
                    </div>
                  );
                }

                return uniqueList.map(i => (
                  <div key={i.id || i.title} style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-cream)',
                    boxShadow: 'var(--shadow-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{i.title}</strong>
                      {i.potentialSavings > 0 && (
                        <span className="badge badge-forest" style={{ whiteSpace: 'nowrap' }}>
                          Save {formatCurrency(i.potentialSavings)}/mo
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {i.message}
                    </p>
                    {i.action && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-navy)', fontSize: '0.76rem', fontWeight: 600, marginTop: 4 }}>
                        <span>{i.action}</span>
                        <ArrowRight size={13} />
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Anomaly Outliers Panel */}
          <div>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <ShieldAlert size={16} color="var(--accent-crimson)" />
              <span>Spending Anomaly Outliers</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {anomalies && anomalies.length > 0 ? (
                anomalies.map(a => (
                  <div key={a.id} style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FFF1F2',
                    border: '1px solid #FECDD3',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#9F1239' }}>
                        {a.description}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-crimson)' }}>
                        {formatCurrency(a.amount)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: '#881337', lineHeight: 1.35 }}>
                      {a.anomalyReason || 'Transaction amount is significantly above your typical spending benchmark.'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9F1239', opacity: 0.85 }}>
                      <span>Category: {a.displayCategory || a.category}</span>
                      <span>Confidence: {((a.anomalyScore || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-forest-soft)', border: '1px solid rgba(22, 101, 52, 0.2)', color: 'var(--accent-forest-text)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} />
                  <span>Zero statistical spending outliers detected.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
