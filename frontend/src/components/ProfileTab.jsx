import React, { useState } from 'react';
import { 
  PiggyBank, 
  Check, 
  User, 
  ShieldCheck,
  BellRing,
  Wallet
} from 'lucide-react';

export default function ProfileTab({ 
  savingsTarget = 2500, 
  onUpdateSavingsTarget
}) {
  const [targetInput, setTargetInput] = useState(savingsTarget);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveTarget = (e) => {
    e.preventDefault();
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateSavingsTarget(val);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Header */}
      <div className="money-header-yellow" style={{ padding: '16px 20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
          Profile &amp; Settings
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: 2 }}>
          Customize your monthly savings target and preferences
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* User Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--theme-yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111827',
            fontWeight: 800,
            fontSize: '1.2rem'
          }}>
            <User size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>
              FinSight User
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>
              Personal Expense &amp; Savings Tracker
            </p>
          </div>
        </div>

        {/* 1. AMOUNT YOU WANT TO SAVE OPTION */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <PiggyBank size={20} color="#b45309" strokeWidth={2.4} />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827' }}>
              Amount You Want To Save
            </h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 14 }}>
            Set your target monthly savings goal. FinSight tracks this against your actual income and expenses to keep you financially disciplined.
          </p>

          <form onSubmit={handleSaveTarget}>
            <div style={{ marginBottom: 14 }}>
              <label className="input-label">Monthly Savings Target (INR)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 12, fontWeight: 700, color: '#6b7280' }}>₹</span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  className="input-field"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  style={{ paddingLeft: 30, fontSize: '1rem', fontWeight: 700 }}
                  placeholder="e.g. 2500"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {savedNotice ? (
                <span style={{ color: '#16a34a', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={14} /> Saved successfully!
                </span>
              ) : <div />}

              <button type="submit" className="btn-yellow" style={{ padding: '8px 18px', fontSize: '0.84rem' }}>
                <Check size={15} />
                <span>Update Target</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. PREFERENCES */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', marginBottom: 12 }}>
            Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Wallet size={18} color="#475569" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Currency</span>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>INR (₹)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BellRing size={18} color="#475569" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Spending Spike Alerts</span>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>Active</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={18} color="#475569" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Security &amp; Encryption</span>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
