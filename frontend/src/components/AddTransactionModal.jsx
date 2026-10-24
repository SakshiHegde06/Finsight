import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';

export default function AddTransactionModal({ isOpen, onClose, onSave, editingTransaction }) {
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('shopping');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('EXPENSE');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const categories = [
    { id: 'food', label: 'Food & Dining' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'travel', label: 'Travel & Commute' },
    { id: 'emi', label: 'Loan & EMI' },
    { id: 'utilities', label: 'Utilities & Bills' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'investment', label: 'Investments' },
    { id: 'education', label: 'Education' }
  ];

  const paymentMethods = ['UPI', 'Credit Card', 'Net Banking', 'Debit Card', 'Cash'];

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description || '');
      setMerchant(editingTransaction.merchant || '');
      setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
      setCategory(editingTransaction.category || 'shopping');
      setDate(editingTransaction.date || new Date().toISOString().split('T')[0]);
      setType(editingTransaction.type || 'EXPENSE');
      setPaymentMethod(editingTransaction.paymentMethod || 'UPI');
      setAiPrediction(null);
    } else {
      setDescription('');
      setMerchant('');
      setAmount('');
      setCategory('shopping');
      setDate(new Date().toISOString().split('T')[0]);
      setType('EXPENSE');
      setPaymentMethod('UPI');
      setAiPrediction(null);
    }
  }, [editingTransaction, isOpen]);

  // Real-time AI preview debounced
  useEffect(() => {
    if (!description || description.trim().length < 3 || editingTransaction) return;

    const timer = setTimeout(async () => {
      try {
        setIsPredicting(true);
        const res = await api.previewCategorize(description, merchant, parseFloat(amount) || 0);
        if (res && res.category) {
          setAiPrediction(res);
          setCategory(res.category);
        }
      } catch (err) {
        console.warn('AI preview not available', err);
      } finally {
        setIsPredicting(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [description, merchant]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    onSave({
      description,
      merchant,
      amount: parseFloat(amount),
      category,
      date,
      type,
      paymentMethod
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-cream)',
          background: 'var(--bg-cream-base)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              {editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Automated classification and anomaly inspection
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Transaction Type Radio */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: 'var(--radius-md)',
                background: type === 'EXPENSE' ? 'var(--accent-crimson-soft)' : 'var(--bg-cream-soft)',
                border: `1px solid ${type === 'EXPENSE' ? 'var(--accent-crimson)' : 'var(--border-cream)'}`,
                color: type === 'EXPENSE' ? 'var(--accent-crimson-text)' : 'var(--text-secondary)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: 'var(--radius-md)',
                background: type === 'INCOME' ? 'var(--accent-forest-soft)' : 'var(--bg-cream-soft)',
                border: `1px solid ${type === 'INCOME' ? 'var(--accent-forest)' : 'var(--border-cream)'}`,
                color: type === 'INCOME' ? 'var(--accent-forest-text)' : 'var(--text-secondary)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Income (+)
            </button>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label className="input-label">Description / Transaction Text *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Uber ride to airport INR 650 TXN09..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            {/* AI Real-time Prediction Feedback */}
            {isPredicting ? (
              <p style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} /> Analyzing text keywords...
              </p>
            ) : aiPrediction ? (
              <div style={{
                marginTop: 6,
                padding: '6px 10px',
                borderRadius: 6,
                background: 'var(--accent-purple-soft)',
                border: '1px solid rgba(107, 33, 168, 0.2)',
                fontSize: '0.75rem',
                color: 'var(--accent-purple-text)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Sparkles size={13} color="var(--accent-purple)" />
                <span>AI Predicted: <strong>{aiPrediction.display_category || aiPrediction.category}</strong> ({(aiPrediction.confidence * 100).toFixed(0)}% confidence)</span>
              </div>
            ) : null}
          </div>

          {/* Amount and Merchant */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label className="input-label">Amount (INR) *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                className="input-field"
                placeholder="e.g. 4850"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label">Merchant / Payee</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Swiggy, Netflix, Uber"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>
          </div>

          {/* Category and Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Date</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: 24 }}>
            <label className="input-label">Payment Method</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {paymentMethods.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: paymentMethod === m ? '#1C1917' : 'var(--bg-cream-soft)',
                    border: `1px solid ${paymentMethod === m ? '#1C1917' : 'var(--border-cream)'}`,
                    color: paymentMethod === m ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{editingTransaction ? 'Save Changes' : 'Record Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
