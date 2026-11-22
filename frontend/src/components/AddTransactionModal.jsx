import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Home, Shirt, Utensils, Bus, ShoppingCart, Gamepad2, Wallet, Zap, HeartPulse, MoreHorizontal } from 'lucide-react';
import { api } from '../services/api';
import { CATEGORY_DEFINITIONS } from '../data/screenshotDemoData';

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
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(todayStr);
  const [type, setType] = useState('EXPENSE');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseCategories = [
    { id: 'housing', label: 'Housing / Rent', icon: <Home size={16} />, color: '#ff6b8b' },
    { id: 'clothing', label: 'Clothing', icon: <Shirt size={16} />, color: '#fb923c' },
    { id: 'food', label: 'Food & Dining', icon: <Utensils size={16} />, color: '#2ec4b6' },
    { id: 'transportation', label: 'Transportation', icon: <Bus size={16} />, color: '#f87171' },
    { id: 'shopping', label: 'Shopping', icon: <ShoppingCart size={16} />, color: '#f59e0b' },
    { id: 'entertainment', label: 'Entertainment', icon: <Gamepad2 size={16} />, color: '#22c55e' },
    { id: 'utilities', label: 'Utilities & Bills', icon: <Zap size={16} />, color: '#38bdf8' },
    { id: 'healthcare', label: 'Healthcare', icon: <HeartPulse size={16} />, color: '#ef4444' },
    { id: 'other', label: 'Other Expense', icon: <MoreHorizontal size={16} />, color: '#94a3b8' }
  ];

  const incomeCategories = [
    { id: 'salary', label: 'Salary / Wages', icon: <Wallet size={16} />, color: '#10b981' },
    { id: 'freelance', label: 'Freelance & Consulting', icon: <Wallet size={16} />, color: '#06b6d4' },
    { id: 'bonus', label: 'Bonus / Extra', icon: <Wallet size={16} />, color: '#f59e0b' },
    { id: 'other', label: 'Other Income', icon: <MoreHorizontal size={16} />, color: '#94a3b8' }
  ];

  const activeCategories = type === 'INCOME' ? incomeCategories : expenseCategories;
  const paymentMethods = ['UPI', 'Cash', 'Credit Card', 'Net Banking', 'Debit Card'];

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'INCOME') {
      setCategory('salary');
    } else {
      setCategory('food');
    }
  };

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description || '');
      setMerchant(editingTransaction.merchant || '');
      setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
      setCategory(editingTransaction.category || (editingTransaction.type === 'INCOME' ? 'salary' : 'food'));
      setDate(editingTransaction.date || todayStr);
      setType(editingTransaction.type || 'EXPENSE');
      setPaymentMethod(editingTransaction.paymentMethod || 'UPI');
      setAiPrediction(null);
    } else {
      setDescription('');
      setMerchant('');
      setAmount('');
      setCategory('food');
      setDate(todayStr);
      setType('EXPENSE');
      setPaymentMethod('UPI');
      setAiPrediction(null);
    }
  }, [editingTransaction, isOpen]);

  // AI Real-time prediction debounced
  useEffect(() => {
    if (!description || description.trim().length < 3 || editingTransaction) return;

    const timer = setTimeout(async () => {
      try {
        setIsPredicting(true);
        const res = await api.previewCategorize(description, merchant, parseFloat(amount) || 0);
        if (res && res.category) {
          setAiPrediction(res);
          const mapped = res.category.toLowerCase();
          if (activeCategories.some(c => c.id === mapped)) {
            setCategory(mapped);
          }
        }
      } catch (err) {
        // quiet ignore
      } finally {
        setIsPredicting(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [description, merchant]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || isSubmitting) return;

    try {
      setIsSubmitting(true);
      onSave({
        description: description.trim(),
        merchant: merchant.trim(),
        amount: parseFloat(amount),
        category,
        displayCategory: activeCategories.find(c => c.id === category)?.label || category,
        date,
        type,
        paymentMethod
      });
      onClose();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--theme-yellow)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111827' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Expense / Income Toggle */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: 10,
                background: type === 'EXPENSE' ? '#111827' : '#f3f4f6',
                color: type === 'EXPENSE' ? 'var(--theme-yellow)' : '#4b5563',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
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
                borderRadius: 10,
                background: type === 'INCOME' ? '#16a34a' : '#f3f4f6',
                color: type === 'INCOME' ? '#ffffff' : '#4b5563',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Income (+)
            </button>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label className="input-label">Title / Description *</label>
            <input
              type="text"
              className="input-field"
              placeholder={type === 'EXPENSE' ? "e.g. coffee, pg rent, grocery..." : "e.g. Monthly salary, freelance..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              autoFocus
            />

            {/* AI Real-time keyword prediction */}
            {isPredicting ? (
              <span style={{ fontSize: '0.72rem', color: '#8b5cf6', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} /> AI analyzing text...
              </span>
            ) : aiPrediction ? (
              <div style={{
                marginTop: 6,
                padding: '5px 8px',
                borderRadius: 6,
                background: '#f5f3ff',
                fontSize: '0.72rem',
                color: '#6d28d9',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                <Sparkles size={12} />
                <span>AI Predicted: <strong>{aiPrediction.display_category || aiPrediction.category}</strong></span>
              </div>
            ) : null}
          </div>

          {/* Amount and Merchant */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label className="input-label">Amount (INR) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 12, fontWeight: 700, color: '#6b7280' }}>₹</span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  className="input-field"
                  placeholder="e.g. 75"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ paddingLeft: 28, fontWeight: 700 }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Merchant / Payee</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Cafe, Swiggy"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>
          </div>

          {/* Category Picker with Visual Color Badges */}
          <div style={{ marginBottom: 14 }}>
            <label className="input-label">Category</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              maxHeight: 140,
              overflowY: 'auto',
              padding: 2
            }}>
              {activeCategories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? c.color : '#e5e7eb'}`,
                      background: isSelected ? `${c.color}15` : '#ffffff',
                      color: isSelected ? '#111827' : '#4b5563',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <span style={{ color: c.color, display: 'flex' }}>
                      {c.icon}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
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

            <div>
              <label className="input-label">Payment Method</label>
              <select
                className="input-field"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {paymentMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                background: '#f3f4f6',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#4b5563',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-yellow"
              disabled={isSubmitting}
            >
              <Check size={16} />
              <span>{isSubmitting ? 'Saving...' : (editingTransaction ? 'Save Changes' : 'Record Transaction')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
