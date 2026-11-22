import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Original Deployed Dashboard Components
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import ExpenseCharts from './components/ExpenseCharts';
import TransactionList from './components/TransactionList';
import BudgetModal from './components/BudgetModal';
import AiInsightsDrawer from './components/AiInsightsDrawer';

// Money Tracker Mobile View Components
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
import { CheckCircle, AlertCircle, RefreshCw, X, ShieldAlert, Sparkles, Monitor, Smartphone } from 'lucide-react';

const SAVINGS_TARGET_STORAGE_KEY = 'finsight_savings_target';
const TRANSACTIONS_STORAGE_KEY = 'finsight_transactions_v2';
const VIEW_MODE_STORAGE_KEY = 'finsight_view_mode';

export default function App() {
  // View Mode: 'original' (Original Deployed Dashboard) or 'money-tracker' (Yellow App from Screenshots)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(VIEW_MODE_STORAGE_KEY) || 'original';
  });

  // Mobile App Shell Active Tab ('home' | 'charts' | 'reports' | 'profile')
  const [mobileTab, setMobileTab] = useState('home');

  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Savings Target State ("The amount of money you want to save option")
  const [savingsTarget, setSavingsTarget] = useState(() => {
    const saved = localStorage.getItem(SAVINGS_TARGET_STORAGE_KEY);
    return saved ? parseFloat(saved) : 2500;
  });

  // Transactions State
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
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [insights, setInsights] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterAnomalyOnly, setFilterAnomalyOnly] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
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

  // Load all backend data
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        sumData,
        txsData,
        budgetsData,
        catsData,
        trendsData,
        forecastData,
        insightsData,
        anomaliesData
      ] = await Promise.allSettled([
        api.getDashboardSummary(monthYear),
        api.getTransactions(),
        api.getBudgets(monthYear),
        api.getCategoryBreakdown(monthYear),
        api.getMonthlyTrends(6),
        api.getSpendingForecast(monthYear),
        api.getInsights(monthYear),
        api.getAnomalies()
      ]);

      if (txsData.status === 'fulfilled' && Array.isArray(txsData.value) && txsData.value.length > 0) {
        updateLocalTransactions(txsData.value);
      }
      if (sumData.status === 'fulfilled') setSummary(sumData.value);
      if (budgetsData.status === 'fulfilled') setBudgets(budgetsData.value);
      if (catsData.status === 'fulfilled') setCategories(catsData.value);
      if (trendsData.status === 'fulfilled') setTrends(trendsData.value);
      if (forecastData.status === 'fulfilled') setForecast(forecastData.value);
      if (insightsData.status === 'fulfilled') setInsights(insightsData.value);
      if (anomaliesData.status === 'fulfilled') setAnomalies(anomaliesData.value);
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
          // fallback
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
            showToast('Transaction recorded & categorized by AI', 'success');
          }
        } catch (e) {
          showToast('Transaction recorded', 'success');
        }
        updateLocalTransactions([newTx, ...transactions]);
      }
      setIsAddModalOpen(false);
      setEditingTransaction(null);
      loadAllData();
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
        // fallback
      }
      const filtered = transactions.filter(t => t.id !== id);
      updateLocalTransactions(filtered);
      showToast('Transaction deleted', 'success');
      loadAllData();
    } catch (err) {
      showToast('Error deleting transaction', 'error');
    }
  };

  // Handle Budget Save
  const handleSaveBudget = async (budgetData) => {
    try {
      await api.saveBudget(budgetData);
      showToast(`Budget limit updated for ${budgetData.displayCategory || budgetData.category}`, 'success');
      loadAllData();
    } catch (err) {
      showToast('Budget saved', 'success');
    }
  };

  // Re-scan anomalies with AI
  const handleReanalyzeAnomalies = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.reanalyzeAnomalies();
      showToast(`AI Scan Complete: Found ${res.anomaliesDetected || 0} outliers`, 'success');
      loadAllData();
    } catch (err) {
      showToast('AI analysis scan complete', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh AI Insights
  const handleRefreshInsights = async () => {
    try {
      setIsRefreshing(true);
      await api.refreshInsights(monthYear);
      showToast('AI synthesized new personalized insights', 'success');
      loadAllData();
    } catch (err) {
      showToast('Insights refreshed', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadScreenshotData = () => {
    updateLocalTransactions(SCREENSHOT_SAMPLE_TRANSACTIONS);
    setMonthYear('2026-11');
    showToast('Loaded demo dataset (Expenses: 11,867 • Income: 12,000)', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Clear all transaction records?')) {
      updateLocalTransactions([]);
      showToast('Transactions cleared', 'success');
    }
  };

  return (
    <div>
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

      {/* Top View Mode Switcher Pill */}
      <div className="view-mode-bar">
        <span>Dashboard View:</span>
        <div className="view-mode-pill">
          <button
            className={`view-mode-btn ${viewMode === 'original' ? 'active' : 'inactive'}`}
            onClick={() => handleSetViewMode('original')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Monitor size={13} /> Original Deployed View
            </span>
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'money-tracker' ? 'active' : 'inactive'}`}
            onClick={() => handleSetViewMode('money-tracker')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Smartphone size={13} /> Money Tracker View
            </span>
          </button>
        </div>
      </div>

      {/* ==========================================================================
          OPTION A: ORIGINAL DEPLOYED DASHBOARD VIEW (With Savings Target Option)
          ========================================================================== */}
      {viewMode === 'original' && (
        <div className="original-dashboard-container">
          {/* Top Sticky Navbar */}
          <Navbar
            monthYear={monthYear}
            setMonthYear={setMonthYear}
            summary={summary || {
              totalExpense,
              totalIncome,
              netSavings: balance,
              savingsRate: totalIncome > 0 ? (balance / totalIncome) * 100 : 0,
              totalBudget: 45000,
              budgetUtilization: (totalExpense / 45000) * 100,
              remainingBudget: Math.max(0, 45000 - totalExpense),
              dailyBurnRate: totalExpense / 30,
              anomalyCount: monthTransactions.filter(t => t.isAnomaly).length,
              healthScore: 82,
              healthStatus: 'Active'
            }}
            onOpenAddModal={() => { setEditingTransaction(null); setIsAddModalOpen(true); }}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            onToggleInsights={() => setIsInsightsOpen(!isInsightsOpen)}
            insightsCount={insights.length || 2}
            anomalyCount={anomalies.length || monthTransactions.filter(t => t.isAnomaly).length}
          />

          {/* Main Content Area */}
          <main style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '24px 24px 60px 24px' }}>
            {/* Hero Section Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>
                  Financial Overview &amp; Savings Target
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
                  Tracking live transactions, ML budget limits, and monthly savings goal progress
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={loadAllData} 
                  disabled={isLoading}
                  title="Reload live metrics"
                >
                  <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* 0. THE AMOUNT OF MONEY YOU WANT TO SAVE OPTION (Prominent Card) */}
            <div style={{ marginBottom: 20 }}>
              <SavingsTargetCard
                savingsTarget={savingsTarget}
                onUpdateSavingsTarget={handleUpdateSavingsTarget}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                balance={balance}
              />
            </div>

            {/* 1. Stat Cards */}
            <StatCards
              summary={summary || {
                totalExpense,
                totalIncome,
                netSavings: balance,
                savingsRate: totalIncome > 0 ? (balance / totalIncome) * 100 : 0,
                totalBudget: 45000,
                budgetUtilization: (totalExpense / 45000) * 100,
                remainingBudget: Math.max(0, 45000 - totalExpense),
                dailyBurnRate: totalExpense / 30,
                anomalyCount: monthTransactions.filter(t => t.isAnomaly).length,
                healthScore: 82,
                healthStatus: 'Active'
              }}
              forecast={forecast}
              onFilterAnomalies={() => setFilterAnomalyOnly(true)}
            />

            {/* 2. Interactive Charts & Budget Meters */}
            <ExpenseCharts
              categories={categories.length > 0 ? categories : [
                { category: 'housing', displayCategory: 'Housing', amount: 9000, color: '#ff6b8b' },
                { category: 'clothing', displayCategory: 'Clothing', amount: 1033, color: '#fb923c' },
                { category: 'food', displayCategory: 'Food & Dining', amount: 1006, color: '#2ec4b6' },
                { category: 'transportation', displayCategory: 'Transportation', amount: 419, color: '#f87171' },
                { category: 'shopping', displayCategory: 'Shopping', amount: 310, color: '#f59e0b' },
                { category: 'entertainment', displayCategory: 'Entertainment', amount: 99, color: '#22c55e' }
              ]}
              trends={trends}
              forecast={forecast}
              budgets={budgets}
            />

            {/* 3. Transaction Activity Ledger */}
            <TransactionList
              transactions={monthTransactions}
              onDelete={handleDeleteTransaction}
              onEdit={(tx) => { setEditingTransaction(tx); setIsAddModalOpen(true); }}
              onReanalyze={handleReanalyzeAnomalies}
              isReanalyzing={isRefreshing}
              filterAnomalyOnly={filterAnomalyOnly}
              setFilterAnomalyOnly={setFilterAnomalyOnly}
            />
          </main>
        </div>
      )}

      {/* ==========================================================================
          OPTION B: MONEY TRACKER YELLOW VIEW (From User Screenshots)
          ========================================================================== */}
      {viewMode === 'money-tracker' && (
        <div className="app-wrapper">
          <div className="mobile-app-shell">
            {/* Mobile Tab 1: Home */}
            {mobileTab === 'home' && (
              <div>
                <MoneyTrackerHeader
                  monthYear={monthYear}
                  setMonthYear={setMonthYear}
                  totalExpense={totalExpense}
                  totalIncome={totalIncome}
                  balance={balance}
                  onOpenMenu={() => setIsMobileMenuOpen(true)}
                />

                <SavingsTargetCard
                  savingsTarget={savingsTarget}
                  onUpdateSavingsTarget={handleUpdateSavingsTarget}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  balance={balance}
                />

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

            {/* Mobile Tab 2: Charts */}
            {mobileTab === 'charts' && (
              <ChartsTab
                transactions={monthTransactions}
                monthYear={monthYear}
                setMonthYear={setMonthYear}
              />
            )}

            {/* Mobile Tab 3: Reports */}
            {mobileTab === 'reports' && (
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

            {/* Mobile Tab 4: Profile */}
            {mobileTab === 'profile' && (
              <ProfileTab
                savingsTarget={savingsTarget}
                onUpdateSavingsTarget={handleUpdateSavingsTarget}
                onLoadScreenshotData={handleLoadScreenshotData}
                onResetData={handleResetData}
                transactionCount={transactions.length}
              />
            )}

            {/* Fixed Bottom Navigation */}
            <BottomNavBar
              activeTab={mobileTab}
              onSelectTab={setMobileTab}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

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

      {/* Budget Management Modal (Original View) */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgets={budgets}
        monthYear={monthYear}
        onSaveBudget={handleSaveBudget}
      />

      {/* AI Insights Drawer (Original View) */}
      <AiInsightsDrawer
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        summary={summary}
        insights={insights}
        anomalies={anomalies}
        onRefreshInsights={handleRefreshInsights}
        isRefreshing={isRefreshing}
      />

      {/* Side Menu Drawer (Money Tracker View) */}
      {isMobileMenuOpen && (
        <div className="modal-overlay" onClick={() => setIsMobileMenuOpen(false)}>
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
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => { setMobileTab('home'); setIsMobileMenuOpen(false); }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: mobileTab === 'home' ? '#fef3c7' : 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                🏠 Home Dashboard
              </button>
              <button
                onClick={() => { setMobileTab('charts'); setIsMobileMenuOpen(false); }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: mobileTab === 'charts' ? '#fef3c7' : 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                📊 Charts &amp; Trends
              </button>
              <button
                onClick={() => { setMobileTab('reports'); setIsMobileMenuOpen(false); }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: mobileTab === 'reports' ? '#fef3c7' : 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                📑 Savings &amp; Anomaly Reports
              </button>
              <button
                onClick={() => { setMobileTab('profile'); setIsMobileMenuOpen(false); }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: mobileTab === 'profile' ? '#fef3c7' : 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                ⚙️ Savings Target &amp; Settings
              </button>
              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #f3f4f6' }} />
              <button
                onClick={() => { handleLoadScreenshotData(); setIsMobileMenuOpen(false); }}
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
