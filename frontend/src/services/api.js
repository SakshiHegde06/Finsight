const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api')) {
      clean += '/api';
    }
    return clean;
  }
  // Automatic fallback to deployed Render backend in production
  if (import.meta.env.PROD) {
    return 'https://finsight-backend-gd6a.onrender.com/api';
  }
  return 'http://localhost:8080/api';
};

const BASE_URL = getBaseUrl();

export const api = {
  // Transactions
  getTransactions: async () => {
    const res = await fetch(`${BASE_URL}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  createTransaction: async (data) => {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },

  updateTransaction: async (id, data) => {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
  },

  deleteTransaction: async (id) => {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
    return true;
  },

  getAnomalies: async () => {
    const res = await fetch(`${BASE_URL}/transactions/anomalies`);
    if (!res.ok) throw new Error('Failed to fetch anomalies');
    return res.json();
  },

  reanalyzeAnomalies: async () => {
    const res = await fetch(`${BASE_URL}/transactions/anomalies/reanalyze`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reanalyze anomalies');
    return res.json();
  },

  previewCategorize: async (description, merchant, amount) => {
    const res = await fetch(`${BASE_URL}/transactions/categorize-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, merchant, amount }),
    });
    if (!res.ok) throw new Error('Failed to preview category');
    return res.json();
  },

  // Budgets
  getBudgets: async (monthYear) => {
    const url = monthYear ? `${BASE_URL}/budgets?monthYear=${monthYear}` : `${BASE_URL}/budgets`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  saveBudget: async (data) => {
    const res = await fetch(`${BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save budget');
    return res.json();
  },

  deleteBudget: async (id) => {
    const res = await fetch(`${BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete budget');
    return true;
  },

  // Analytics
  getDashboardSummary: async (monthYear) => {
    const url = monthYear ? `${BASE_URL}/analytics/summary?monthYear=${monthYear}` : `${BASE_URL}/analytics/summary`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  getCategoryBreakdown: async (monthYear) => {
    const url = monthYear ? `${BASE_URL}/analytics/categories?monthYear=${monthYear}` : `${BASE_URL}/analytics/categories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  getMonthlyTrends: async (months = 6) => {
    const res = await fetch(`${BASE_URL}/analytics/trends?months=${months}`);
    if (!res.ok) throw new Error('Failed to fetch trends');
    return res.json();
  },

  getSpendingForecast: async (monthYear) => {
    const url = monthYear ? `${BASE_URL}/analytics/forecast?monthYear=${monthYear}` : `${BASE_URL}/analytics/forecast`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },

  clearDemoData: async () => {
    const res = await fetch(`${BASE_URL}/transactions/demo-data`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear demo data');
    return res.json();
  },

  // Insights
  getInsights: async (monthYear) => {
    const url = monthYear ? `${BASE_URL}/insights?monthYear=${monthYear}` : `${BASE_URL}/insights`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json();
  },

  getLiveRecommendations: async (income = 0) => {
    const res = await fetch(`${BASE_URL}/insights/live-recommendations?income=${income}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  refreshInsights: async (monthYear) => {
    const url = monthYear ? `${BASE_URL}/insights/generate?monthYear=${monthYear}` : `${BASE_URL}/insights/generate`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to refresh insights');
    return res.json();
  }
};
