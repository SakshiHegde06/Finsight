import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MoneyTrackerHeader from './components/MoneyTrackerHeader';
import SavingsTargetCard from './components/SavingsTargetCard';
import DayGroupedTransactionList from './components/DayGroupedTransactionList';
import ChartsTab from './components/ChartsTab';
import ReportsTab from './components/ReportsTab';
import ProfileTab from './components/ProfileTab';
import BottomNavBar from './components/BottomNavBar';
import AddTransactionModal from './components/AddTransactionModal';
import { SCREENSHOT_SAMPLE_TRANSACTIONS } from './data/screenshotDemoData';
import { api } from './services/api';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const SAVINGS_TARGET_STORAGE_KEY = 'finsight_savings_target';
const TRANSACTIONS_STORAGE_KEY = 'finsight_transactions_v2';

export default function App() {
  // Active Tab: 'home' | 'charts' | 'reports' | 'profile'
  const [activeTab, setActiveTab] = useState('home');

  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Savings Target State ("The amount of money you want to save option")
  const [savingsTarget, setSavingsTarget] = useState(() => {
    const saved = localStorage.getItem(SAVINGS_TARGET_STORAGE_KEY);
    return saved ? parseFloat(saved) : 2500;
  });

  // Transactions State: defaults to the screenshot dataset
  const [transactions, setTransactions] = useState(() => {
    const local = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // quiet ignore
      }
    }
    return SCREENSHOT_SAMPLE_TRANSACTIONS;
  });

  // Backend state
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [insights, setInsights] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateSavingsTarget = (newTarget) => {
    setSavingsTarget(newTarget);
    localStorage.setItem(SAVINGS_TARGET_STORAGE_KEY, String(newTarget));
    showToast(`Savings target updated to ₹${Math.round(newTarget).toLocaleString('en-IN')}`, 'success');
  };

  const updateLocalTransactions = (newTxs) => {
    setTransactions(newTxs);
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(newTxs));
  };

  // Load backend data if available, fallback smoothly to local
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sumRes, txsRes, forecastRes, insightsRes, anomRes] = await Promise.allSettled([
        api.getDashboardSummary(monthYear),
        api.getTransactions(),
        api.getSpendingForecast(monthYear),
        api.getInsights(monthYear),
        api.getAnomalies()
      ]);

      if (txsRes.status === 'fulfilled' && Array.isArray(txsRes.value) && txsRes.value.length > 0) {
        updateLocalTransactions(txsRes.value);
      }
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (forecastRes.status === 'fulfilled') setForecast(forecastRes.value);
      if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value);
      if (anomRes.status === 'fulfilled') setAnomalies(anomRes.value);
    } catch (err) {
      console.warn('Backend loading completed with local fallbacks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [monthYear]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Compute live metrics for selected month
  const monthTransactions = useMemo(() => {
    if (!monthYear) return transactions;
    return transactions.filter(t => !t.date || t.date.startsWith(monthYear));
  }, [transactions, monthYear]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter(t => t.type !== 'INCOME')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [monthTransactions]);

  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [monthTransactions]);

  const balance = totalIncome - totalExpense;

  // Add or Edit Transaction
  const handleSaveTransaction = async (formData) => {
    try {
      if (editingTransaction) {
        try {
          await api.updateTransaction(editingTransaction.id, formData);
        } catch (e) {
          // offline fallback
        }
        const updated = transactions.map(t => 
          t.id === editingTransaction.id ? { ...t, ...formData } : t
        );
        updateLocalTransactions(updated);
        showToast('Transaction updated successfully', 'success');
      } else {
        const newId = `tx-${Date.now()}`;
        const newTx = { ...formData, id: newId };
        try {
          const saved = await api.createTransaction(formData);
          if (saved && saved.id) newTx.id = saved.id;
          if (saved && saved.isAnomaly) {
            newTx.isAnomaly = true;
            newTx.anomalyReason = saved.anomalyReason;
            showToast('Flagged as spending anomaly outlier', 'warning');
          } else {
            showToast('Transaction recorded successfully', 'success');
          }
        } catch (e) {
          showToast('Transaction recorded', 'success');
        }
        updateLocalTransactions([newTx, ...transactions]);
      }
      setIsAddModalOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      showToast('Error saving transaction', 'error');
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Delete this transaction record?')) return;
    try {
      try {
        await api.deleteTransaction(id);
      } catch (e) {
        // offline fallback
      }
      const filtered = transactions.filter(t => t.id !== id);
      updateLocalTransactions(filtered);
      showToast('Transaction deleted', 'success');
    } catch (err) {
      showToast('Error deleting transaction', 'error');
    }
  };

  const handleLoadScreenshotData = () => {
    updateLocalTransactions(SCREENSHOT_SAMPLE_TRANSACTIONS);
    setMonthYear('2026-11');
    showToast('Loaded demo dataset (Expenses: 11,867 • Income: 12,000)', 'success');
    setActiveTab('home');
  };

  const handleResetData = () => {
    if (window.confirm('Clear all transaction records?')) {
      updateLocalTransactions([]);
      showToast('Transactions cleared', 'success');
    }
  };

  return (
    <div className="app-wrapper">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          padding: '10px 18px',
          borderRadius: 999,
          background: toastMessage.type === 'warning' 
            ? 'rgba(217, 119, 6, 0.96)' 
            : toastMessage.type === 'error' 
              ? 'rgba(220, 38, 38, 0.96)' 
              : 'rgba(17, 24, 39, 0.95)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.82rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'slideUp 0.2s ease',
          whiteSpace: 'nowrap'
        }}>
          {toastMessage.type === 'warning' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Main App Container matching screenshots */}
      <div className="mobile-app-shell">
        {/* ==================== TAB 1: HOME ==================== */}
        {activeTab === 'home' && (
          <div>
            {/* Top Yellow Header */}
            <MoneyTrackerHeader
              monthYear={monthYear}
              setMonthYear={setMonthYear}
              totalExpense={totalExpense}
              totalIncome={totalIncome}
              balance={balance}
              onOpenMenu={() => setIsMenuOpen(true)}
            />

            {/* "The amount of money you want to save" Option Card */}
            <SavingsTargetCard
              savingsTarget={savingsTarget}
              onUpdateSavingsTarget={handleUpdateSavingsTarget}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
            />

            {/* Day Grouped Transaction List */}
            <DayGroupedTransactionList
              transactions={monthTransactions}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
            />
          </div>
        )}

        {/* ==================== TAB 2: CHARTS ==================== */}
        {activeTab === 'charts' && (
          <ChartsTab
            transactions={monthTransactions}
            monthYear={monthYear}
            setMonthYear={setMonthYear}
          />
        )}

        {/* ==================== TAB 3: REPORTS ==================== */}
        {activeTab === 'reports' && (
          <ReportsTab
            summary={summary}
            forecast={forecast}
            insights={insights}
            anomalies={anomalies.length > 0 ? anomalies : monthTransactions.filter(t => t.isAnomaly)}
            savingsTarget={savingsTarget}
            onOpenSavingsModal={() => setIsAddModalOpen(true)}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
          />
        )}

        {/* ==================== TAB 4: PROFILE ==================== */}
        {activeTab === 'profile' && (
          <ProfileTab
            savingsTarget={savingsTarget}
            onUpdateSavingsTarget={handleUpdateSavingsTarget}
            onLoadScreenshotData={handleLoadScreenshotData}
            onResetData={handleResetData}
            transactionCount={transactions.length}
          />
        )}

        {/* Fixed Bottom Navigation with Center (+) Action Button */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
        />
      </div>

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <div className="modal-overlay" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 320, marginRight: 'auto', marginLeft: 16, padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>🐱</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>Money Tracker</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: activeTab === 'home' ? '#fef3c7' : 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                🏠 Home Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('charts'); setIsMenuOpen(false); }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: activeTab === 'charts' ? '#fef3c7' : 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                📊 Charts &amp; Trends
              </button>
              <button
                onClick={() => { setActiveTab('reports'); setIsMenuOpen(false); }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: activeTab === 'reports' ? '#fef3c7' : 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                📑 Savings &amp; Anomaly Reports
              </button>
              <button
                onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: activeTab === 'profile' ? '#fef3c7' : 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                ⚙️ Savings Target &amp; Settings
              </button>
              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #f3f4f6' }} />
              <button
                onClick={() => { handleLoadScreenshotData(); setIsMenuOpen(false); }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: '#f0fdf4', color: '#166534', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                ✨ Load Screenshot Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
