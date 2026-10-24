import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import ExpenseCharts from './components/ExpenseCharts';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import BudgetModal from './components/BudgetModal';
import AiInsightsDrawer from './components/AiInsightsDrawer';
import { api } from './services/api';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function App() {
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
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
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterAnomalyOnly, setFilterAnomalyOnly] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

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

      if (sumData.status === 'fulfilled') setSummary(sumData.value);
      if (txsData.status === 'fulfilled') setTransactions(txsData.value);
      if (budgetsData.status === 'fulfilled') setBudgets(budgetsData.value);
      if (catsData.status === 'fulfilled') setCategories(catsData.value);
      if (trendsData.status === 'fulfilled') setTrends(trendsData.value);
      if (forecastData.status === 'fulfilled') setForecast(forecastData.value);
      if (insightsData.status === 'fulfilled') setInsights(insightsData.value);
      if (anomaliesData.status === 'fulfilled') setAnomalies(anomaliesData.value);

    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setIsLoading(false);
    }
  }, [monthYear]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Save Transaction
  const handleSaveTransaction = async (formData) => {
    try {
      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, formData);
        showToast('Transaction updated successfully', 'success');
      } else {
        const saved = await api.createTransaction(formData);
        if (saved.isAnomaly) {
          showToast(`Transaction saved! Note: Flagged as spending anomaly outlier.`, 'warning');
        } else {
          showToast('Transaction recorded & categorized by AI', 'success');
        }
      }
      setIsAddModalOpen(false);
      setEditingTransaction(null);
      loadAllData();
    } catch (err) {
      console.error('Save error', err);
      showToast('Error saving transaction. Check connection.', 'error');
    }
  };

  // Handle Delete
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await api.deleteTransaction(id);
      showToast('Transaction deleted', 'success');
      loadAllData();
    } catch (err) {
      console.error('Delete error', err);
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
      console.error('Budget error', err);
      showToast('Error updating budget', 'error');
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
      console.error('Reanalyze error', err);
      showToast('Error running AI anomaly analysis', 'error');
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
      console.error('Refresh insights error', err);
      showToast('Error refreshing insights', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 120,
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: toastMessage.type === 'warning' 
            ? 'rgba(245, 158, 11, 0.95)' 
            : toastMessage.type === 'error' 
              ? 'rgba(239, 68, 68, 0.95)' 
              : 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.85rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'slideUp 0.25s ease'
        }}>
          {toastMessage.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        monthYear={monthYear}
        setMonthYear={setMonthYear}
        summary={summary}
        onOpenAddModal={() => { setEditingTransaction(null); setIsAddModalOpen(true); }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onToggleInsights={() => setIsInsightsOpen(!isInsightsOpen)}
        insightsCount={insights.length}
        anomalyCount={anomalies.length}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '28px 24px' }}>
        {/* Hero Section Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>
              Financial Overview
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
              Tracking transactions, ML budget adherence, and intelligent spending recommendations
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

        {/* 1. Stat Cards */}
        <StatCards
          summary={summary}
          forecast={forecast}
          onFilterAnomalies={() => setFilterAnomalyOnly(true)}
        />

        {/* 2. Interactive Charts & Budget Meters */}
        <ExpenseCharts
          categories={categories}
          trends={trends}
          forecast={forecast}
          budgets={budgets}
        />

        {/* 3. Transaction Activity Ledger */}
        <TransactionList
          transactions={transactions}
          onDelete={handleDeleteTransaction}
          onEdit={(tx) => { setEditingTransaction(tx); setIsAddModalOpen(true); }}
          onReanalyze={handleReanalyzeAnomalies}
          isReanalyzing={isRefreshing}
          filterAnomalyOnly={filterAnomalyOnly}
          setFilterAnomalyOnly={setFilterAnomalyOnly}
        />
      </main>

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      {/* Budget Management Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgets={budgets}
        monthYear={monthYear}
        onSaveBudget={handleSaveBudget}
      />

      {/* AI Insights & Anomaly Drawer */}
      <AiInsightsDrawer
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        summary={summary}
        insights={insights}
        anomalies={anomalies}
        onRefreshInsights={handleRefreshInsights}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
