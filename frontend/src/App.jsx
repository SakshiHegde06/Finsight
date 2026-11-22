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
import { 
  CheckCircle, 
  AlertCircle, 
  PlusCircle, 
  CalendarDays, 
  ChevronDown, 
  Search, 
  FileText, 
  PieChart, 
  ScrollText, 
  User,
  CreditCard,
  Wallet,
  PiggyBank,
  Sparkles,
  Check
} from 'lucide-react';

const SAVINGS_TARGET_STORAGE_KEY = 'finsight_savings_target';
const TRANSACTIONS_STORAGE_KEY = 'finsight_transactions_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'charts' | 'reports' | 'profile'
  const [monthYear, setMonthYear] = useState('2026-11');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Savings Target State ("The amount of money you want to save option")
  const [savingsTarget, setSavingsTarget] = useState(() => {
    const saved = localStorage.getItem(SAVINGS_TARGET_STORAGE_KEY);
    return saved ? parseFloat(saved) : 2500;
  });

  // Transactions State: initial fallback is the screenshot demo dataset
  const [transactions, setTransactions] = useState(() => {
    const local = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
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

  // Filter transactions for currently selected monthYear
  const monthTransactions = useMemo(() => {
    if (!monthYear) return transactions;
    return transactions.filter(t => !t.date || t.date.startsWith(monthYear));
  }, [transactions, monthYear]);

  // Search and category filter
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter(t => {
      const matchSearch = !searchTerm || 
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.merchant && t.merchant.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = selectedCategory === 'all' || 
        (t.category && t.category.toLowerCase() === selectedCategory.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [monthTransactions, searchTerm, selectedCategory]);

  // Compute live metrics
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

  const formatNumber = (num) => Math.round(num || 0).toLocaleString('en-IN');

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
        // fallback
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
  };

  const handleResetData = () => {
    if (window.confirm('Clear all transaction records?')) {
      updateLocalTransactions([]);
      showToast('Transactions cleared', 'success');
    }
  };

  const monthOptions = [
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' }
  ];

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          padding: '10px 20px',
          borderRadius: 999,
          background: toastMessage.type === 'warning' 
            ? 'rgba(217, 119, 6, 0.96)' 
            : toastMessage.type === 'error' 
              ? 'rgba(220, 38, 38, 0.96)' 
              : 'rgba(17, 24, 39, 0.95)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.84rem',
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

      {/* ==========================================================================
          1. DESKTOP PC HEADER (Wide, Expansive, Sticky)
          ========================================================================== */}
      <header className="desktop-header-yellow">
        <div className="header-inner">
          {/* Brand */}
          <div className="brand-section">
            <div>
              <div className="brand-title">
                <span>Money Tracker</span>
                <span style={{ fontSize: '1.4rem' }}>🐱</span>
              </div>
              <p className="brand-subtitle">
                AI-Powered Expense &amp; Savings Target Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="desktop-nav-tabs">
            <button 
              className={`desktop-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <FileText size={16} />
              <span>Home</span>
            </button>
            <button 
              className={`desktop-tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              <PieChart size={16} />
              <span>Charts</span>
            </button>
            <button 
              className={`desktop-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <ScrollText size={16} />
              <span>Reports</span>
            </button>
            <button 
              className={`desktop-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} />
              <span>Profile</span>
            </button>
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Month Picker Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                className="btn-secondary"
                style={{ background: '#ffffff', borderColor: '#e2e8f0' }}
              >
                <CalendarDays size={15} color="#b45309" />
                <span>{monthOptions.find(o => o.value === monthYear)?.label || monthYear}</span>
                <ChevronDown size={14} />
              </button>

              {showMonthDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: 60,
                  width: 180,
                  padding: 6
                }}>
                  {monthOptions.map(m => (
                    <div
                      key={m.value}
                      onClick={() => { setMonthYear(m.value); setShowMonthDropdown(false); }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: '0.84rem',
                        fontWeight: monthYear === m.value ? 700 : 500,
                        background: monthYear === m.value ? '#fef3c7' : 'transparent',
                        color: monthYear === m.value ? '#92400e' : '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{m.label}</span>
                      {monthYear === m.value && <Check size={14} color="#f59e0b" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Transaction Button */}
            <button 
              className="btn-yellow"
              onClick={() => { setEditingTransaction(null); setIsAddModalOpen(true); }}
            >
              <PlusCircle size={17} />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================================================
          2. MOBILE HEADER (Only visible on screens <= 768px)
          ========================================================================== */}
      <div className="mobile-only-header">
        <MoneyTrackerHeader
          monthYear={monthYear}
          setMonthYear={setMonthYear}
          totalExpense={totalExpense}
          totalIncome={totalIncome}
          balance={balance}
          onOpenMenu={() => setActiveTab('profile')}
        />
      </div>

      {/* ==========================================================================
          3. DESKTOP METRICS BAR (4 Cards across screen)
          ========================================================================== */}
      <div className="desktop-metrics-bar">
        {/* Expenses */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Expenses</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#dc2626" />
            </div>
          </div>
          <div className="metric-value">₹{formatNumber(totalExpense)}</div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 4 }}>This month spending</p>
        </div>

        {/* Income */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Income</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color="#16a34a" />
            </div>
          </div>
          <div className="metric-value">₹{formatNumber(totalIncome)}</div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 4 }}>Total credits received</p>
        </div>

        {/* Balance */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Net Balance</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#d97706" />
            </div>
          </div>
          <div className="metric-value" style={{ color: balance < 0 ? '#dc2626' : '#0f172a' }}>
            ₹{formatNumber(balance)}
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 4 }}>Surplus remaining</p>
        </div>

        {/* The Amount of Money You Want to Save */}
        <div className="metric-card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', borderColor: '#fde68a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label" style={{ color: '#92400e' }}>Savings Target</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank size={18} color="#b45309" />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#78350f' }}>₹{formatNumber(savingsTarget)}</div>
          <p style={{ fontSize: '0.74rem', color: '#92400e', marginTop: 4, fontWeight: 600 }}>
            Saved: ₹{formatNumber(Math.max(0, balance))} ({Math.min(100, Math.round(Math.max(0, balance) / savingsTarget * 100))}%)
          </p>
        </div>
      </div>

      {/* ==========================================================================
          4. MAIN VIEW LOGIC
          ========================================================================== */}
      
      {/* --- TAB 1: HOME (On PC: 2 Columns with Ledger + Visualizer side-by-side) --- */}
      {activeTab === 'home' && (
        <main className="desktop-main-grid">
          {/* Left Column: Transaction Activity & Ledger */}
          <div className="desktop-panel">
            {/* Savings Target Banner on Mobile view */}
            <div className="mobile-only-header" style={{ marginBottom: 12 }}>
              <SavingsTargetCard
                savingsTarget={savingsTarget}
                onUpdateSavingsTarget={handleUpdateSavingsTarget}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                balance={balance}
              />
            </div>

            {/* Filter and Search Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Transaction Ledger
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Grouped by day with automatic category colors
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 200 }}>
                  <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 11 }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: 32, height: 36, fontSize: '0.82rem' }}
                  />
                </div>

                <select
                  className="input-field"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: 140, height: 36, fontSize: '0.82rem', padding: '6px 10px' }}
                >
                  <option value="all">All Categories</option>
                  <option value="housing">Housing</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food</option>
                  <option value="transportation">Transportation</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
            </div>

            {/* Day Grouped Transaction List */}
            <DayGroupedTransactionList
              transactions={filteredTransactions}
              onEdit={(tx) => { setEditingTransaction(tx); setIsAddModalOpen(true); }}
              onDelete={handleDeleteTransaction}
            />
          </div>

          {/* Right Column: Interactive Charts & Breakdown */}
          <div className="desktop-panel">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Spending Breakdown &amp; Charts
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 14 }}>
              Visual analytics with 3-slide carousel and category progress
            </p>

            <ChartsTab
              transactions={monthTransactions}
              monthYear={monthYear}
              setMonthYear={setMonthYear}
            />
          </div>
        </main>
      )}

      {/* --- TAB 2: CHARTS TAB (Full screen when clicked from nav) --- */}
      {activeTab === 'charts' && (
        <main style={{ maxWidth: 1000, width: '100%', margin: '24px auto', padding: '0 24px' }}>
          <div className="desktop-panel">
            <ChartsTab
              transactions={monthTransactions}
              monthYear={monthYear}
              setMonthYear={setMonthYear}
            />
          </div>
        </main>
      )}

      {/* --- TAB 3: REPORTS TAB --- */}
      {activeTab === 'reports' && (
        <main style={{ maxWidth: 1000, width: '100%', margin: '24px auto', padding: '0 24px' }}>
          <div className="desktop-panel">
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
          </div>
        </main>
      )}

      {/* --- TAB 4: PROFILE TAB --- */}
      {activeTab === 'profile' && (
        <main style={{ maxWidth: 800, width: '100%', margin: '24px auto', padding: '0 24px' }}>
          <div className="desktop-panel">
            <ProfileTab
              savingsTarget={savingsTarget}
              onUpdateSavingsTarget={handleUpdateSavingsTarget}
              onLoadScreenshotData={handleLoadScreenshotData}
              onResetData={handleResetData}
              transactionCount={transactions.length}
            />
          </div>
        </main>
      )}

      {/* ==========================================================================
          5. MOBILE BOTTOM NAVIGATION (Hidden on Desktop, Visible on Screens <= 768px)
          ========================================================================== */}
      <div className="mobile-only-nav">
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
    </div>
  );
}
