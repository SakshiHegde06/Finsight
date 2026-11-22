// Demo data matching the user's screenshots exactly
export const SCREENSHOT_SAMPLE_TRANSACTIONS = [
  {
    id: 'demo-1',
    description: 'coffee',
    amount: 75,
    category: 'food',
    displayCategory: 'Food',
    merchant: 'Cafe',
    date: '2026-11-14',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    isAnomaly: false
  },
  {
    id: 'demo-2',
    description: 'pg rent',
    amount: 9000,
    category: 'housing',
    displayCategory: 'Housing',
    merchant: 'PG Accommodation',
    date: '2026-11-14',
    type: 'EXPENSE',
    paymentMethod: 'Net Banking',
    isAnomaly: true,
    anomalyScore: 0.92,
    anomalyReason: 'Monthly PG rent payment - major scheduled expense outlier.'
  },
  {
    id: 'demo-3',
    description: 'ice cream and uta',
    amount: 90,
    category: 'food',
    displayCategory: 'Food',
    merchant: 'Restaurant',
    date: '2026-11-14',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    isAnomaly: false
  },
  {
    id: 'demo-4',
    description: 'chirantana clothing',
    amount: 349,
    category: 'clothing',
    displayCategory: 'Clothing',
    merchant: 'Chirantana Clothing',
    date: '2026-11-11',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    isAnomaly: false
  },
  {
    id: 'demo-5',
    description: 'dupatta',
    amount: 100,
    category: 'shopping',
    displayCategory: 'Shopping',
    merchant: 'Apparel Store',
    date: '2026-11-10',
    type: 'EXPENSE',
    paymentMethod: 'Cash',
    isAnomaly: false
  },
  {
    id: 'demo-6',
    description: 'travel',
    amount: 419,
    category: 'transportation',
    displayCategory: 'Transportation',
    merchant: 'BMTC / Bus',
    date: '2026-11-10',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    isAnomaly: false
  },
  {
    id: 'demo-7',
    description: 'Food',
    amount: 570,
    category: 'food',
    displayCategory: 'Food',
    merchant: 'Diner',
    date: '2026-11-10',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    isAnomaly: false
  },
  {
    id: 'demo-8',
    description: 'spotify',
    amount: 99,
    category: 'entertainment',
    displayCategory: 'Entertainment',
    merchant: 'Spotify India',
    date: '2026-11-08',
    type: 'EXPENSE',
    paymentMethod: 'Credit Card',
    isAnomaly: false
  },
  {
    id: 'demo-9',
    description: 'coffee and gobi',
    amount: 100,
    category: 'food',
    displayCategory: 'Food',
    merchant: 'Street Stall',
    date: '2026-11-08',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    isAnomaly: false
  },
  {
    id: 'demo-10',
    description: 'weekend shopping & outfit',
    amount: 684,
    category: 'clothing',
    displayCategory: 'Clothing',
    merchant: 'Boutique',
    date: '2026-11-07',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    isAnomaly: false
  },
  {
    id: 'demo-11',
    description: 'essentials & snacks',
    amount: 210,
    category: 'shopping',
    displayCategory: 'Shopping',
    merchant: 'Supermarket',
    date: '2026-11-07',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    isAnomaly: false
  },
  {
    id: 'demo-12',
    description: 'tea & quick bite',
    amount: 121,
    category: 'food',
    displayCategory: 'Food',
    merchant: 'Tea Point',
    date: '2026-11-07',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    isAnomaly: false
  },
  {
    id: 'demo-13',
    description: 'Monthly Salary Credit',
    amount: 12000,
    category: 'salary',
    displayCategory: 'Salary',
    merchant: 'Employer Direct Deposit',
    date: '2026-11-01',
    type: 'INCOME',
    paymentMethod: 'Net Banking',
    isAnomaly: false
  },
  {
    id: 'demo-14',
    description: 'daily milk & bakery',
    amount: 50,
    category: 'food',
    displayCategory: 'Food',
    merchant: 'Dairy Store',
    date: '2026-11-03',
    type: 'EXPENSE',
    paymentMethod: 'Cash',
    isAnomaly: false
  }
];

export const CATEGORY_DEFINITIONS = {
  housing: {
    label: 'Housing',
    color: '#ff6b8b', // Pink
    bg: '#fce7f3',
    textColor: '#be185d'
  },
  clothing: {
    label: 'Clothing',
    color: '#fb923c', // Peach / Orange
    bg: '#ffedd5',
    textColor: '#c2410c'
  },
  food: {
    label: 'Food',
    color: '#2ec4b6', // Teal / Mint
    bg: '#ccfbf1',
    textColor: '#0f766e'
  },
  transportation: {
    label: 'Transportation',
    color: '#f87171', // Dusty Rose / Coral
    bg: '#ffe4e6',
    textColor: '#be123c'
  },
  shopping: {
    label: 'Shopping',
    color: '#f59e0b', // Amber / Gold
    bg: '#fef3c7',
    textColor: '#b45309'
  },
  entertainment: {
    label: 'Entertainment',
    color: '#22c55e', // Bright Green
    bg: '#dcfce7',
    textColor: '#15803d'
  },
  utilities: {
    label: 'Utilities',
    color: '#38bdf8', // Sky Blue
    bg: '#e0f2fe',
    textColor: '#0369a1'
  },
  healthcare: {
    label: 'Healthcare',
    color: '#ef4444', // Red
    bg: '#fee2e2',
    textColor: '#b91c1c'
  },
  salary: {
    label: 'Salary',
    color: '#10b981', // Emerald
    bg: '#d1fae5',
    textColor: '#047857'
  },
  other: {
    label: 'Other',
    color: '#94a3b8', // Slate
    bg: '#f1f5f9',
    textColor: '#475569'
  }
};

