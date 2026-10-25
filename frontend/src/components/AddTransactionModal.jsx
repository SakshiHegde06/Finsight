import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';

export default function AddTransactionModal({ isOpen, onClose, onSave, editingTransaction }) {
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('shopping');
  const [date, setDate] = useState(todayStr);
  const [dateError, setDateError] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseCategories = [
    { id: 'food', label: 'Food & Dining' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'travel', label: 'Travel & Commute' },
    { id: 'emi', label: 'Loan & EMI' },
    { id: 'utilities', label: 'Utilities & Bills' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'investment', label: 'Investments' },
    { id: 'education', label: 'Education' },
    { id: 'other', label: 'Other Expense' }
  ];

  const incomeCategories = [
    { id: 'salary', label: 'Salary / Wages' },
    { id: 'freelance', label: 'Freelance & Consulting' },
    { id: 'investment', label: 'Investments & Dividends' },
    { id: 'business', label: 'Business Income' },
    { id: 'rental', label: 'Rental Income' },
    { id: 'bonus', label: 'Bonus & Grants' },
    { id: 'other', label: 'Other Income' }
  ];

  const activeCategories = type === 'INCOME' ? incomeCategories : expenseCategories;

  const paymentMethods = ['UPI', 'Credit Card', 'Net Banking', 'Debit Card', 'Cash'];

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'INCOME') {
      const isIncome = incomeCategories.some(c => c.id === category);
      if (!isIncome) setCategory('salary');
    } else {
      const isExpense = expenseCategories.some(c => c.id === category);
      if (!isExpense) setCategory('shopping');
    }
  };

  const handleDateChange = (val) => {
    if (val > todayStr) {
      setDate(todayStr);
      setDateError(`Transactions cannot be set in the future. Maximum date is today (${todayStr}).`);
    } else {
      setDate(val);
      setDateError('');
    }
  };

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description || '');
      setMerchant(editingTransaction.merchant || '');
      setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
      setCategory(editingTransaction.category || (editingTransaction.type === 'INCOME' ? 'salary' : 'shopping'));
      const editDate = editingTransaction.date || todayStr;
      setDate(editDate > todayStr ? todayStr : editDate);
      setType(editingTransaction.type || 'EXPENSE');
      setPaymentMethod(editingTransaction.paymentMethod || 'UPI');
      setAiPrediction(null);
      setDateError('');
    } else {
      setDescription('');
      setMerchant('');
      setAmount('');
      setCategory('shopping');
      setDate(todayStr);
      setType('EXPENSE');
      setPaymentMethod('UPI');
      setAiPrediction(null);
      setDateError('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || isSubmitting) return;

    if (date > todayStr) {
      setDateError(`Transactions cannot be set in the future. Maximum allowed date is today (${todayStr}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        description,
        merchant,
        amount: parseFloat(amount),
        category,
        date,
        type,
        paymentMethod
      });
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
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
              onClick={() => handleTypeChange('EXPENSE')}
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
              onClick={() => handleTypeChange('INCOME')}
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
              placeholder={type === 'INCOME' ? "e.g. Monthly Salary credit TCS, Freelance client transfer..." : "e.g. Uber ride to airport INR 650, Swiggy dinner..."}
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
              <label className="input-label">{type === 'INCOME' ? 'Source / Employer / Client' : 'Merchant / Payee'}</label>
              <input
                type="text"
                className="input-field"
                placeholder={type === 'INCOME' ? "e.g. Employer Name, Client, Google" : "e.g. Swiggy, Netflix, Uber"}
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
                {activeCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Date (Past or Today) *</label>
              <input
                type="date"
                className="input-field"
                value={date}
                max={todayStr}
                onChange={(e) => handleDateChange(e.target.value)}
                required
              />
              {dateError ? (
                <span style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: 4, display: 'block', fontWeight: 500 }}>
                  {dateError}
                </span>
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Max allowed: Today ({todayStr})
                </span>
              )}
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
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
              <Check size={16} />
              <span>{isSubmitting ? 'Recording...' : (editingTransaction ? 'Save Changes' : 'Record Transaction')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
