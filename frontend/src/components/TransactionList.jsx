import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

export default function TransactionList({ 
  transactions, 
  onDelete, 
  onEdit, 
  onReanalyze, 
  isReanalyzing,
  filterAnomalyOnly,
  setFilterAnomalyOnly 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTooltipId, setActiveTooltipId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const categoriesList = [
    { id: 'all', label: 'All Categories' },
    { id: 'salary', label: 'Salary / Wages' },
    { id: 'freelance', label: 'Freelance & Consulting' },
    { id: 'business', label: 'Business Income' },
    { id: 'bonus', label: 'Bonus & Grants' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'travel', label: 'Travel' },
    { id: 'emi', label: 'Loan & EMI' },
    { id: 'utilities', label: 'Utilities' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'investment', label: 'Investments' },
    { id: 'education', label: 'Education' }
  ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter(t => {
      const query = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || 
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.merchant && t.merchant.toLowerCase().includes(query)) ||
        (t.transactionRef && t.transactionRef.toLowerCase().includes(query));

      const matchCategory = selectedCategory === 'all' || 
        (t.category && t.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchAnomaly = !filterAnomalyOnly || Boolean(t.isAnomaly);

      return matchSearch && matchCategory && matchAnomaly;
    });
  }, [transactions, searchTerm, selectedCategory, filterAnomalyOnly]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getCategoryBadgeClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'salary': return 'badge-forest';
      case 'freelance': return 'badge-navy';
      case 'business': return 'badge-purple';
      case 'bonus': return 'badge-amber';
      case 'rental': return 'badge-forest';
      case 'food': return 'badge-amber';
      case 'travel': return 'badge-navy';
      case 'shopping': return 'badge-purple';
      case 'emi': return 'badge-cream';
      case 'utilities': return 'badge-amber';
      case 'entertainment': return 'badge-purple';
      case 'healthcare': return 'badge-crimson';
      case 'investment': return 'badge-forest';
      default: return 'badge-cream';
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 32 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Transactions &amp; Activity Log</span>
            <span style={{
              fontSize: '0.74rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-cream-soft)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-cream)'
            }}>
              {filteredTransactions.length} records
            </span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Categorized ledger with automated machine learning anomaly markers
          </p>
        </div>

        {/* Action button */}
        <button 
          className="btn btn-secondary"
          onClick={onReanalyze}
          disabled={isReanalyzing}
          style={{ fontSize: '0.8rem', padding: '8px 14px' }}
        >
          <Sparkles size={15} color="var(--accent-purple)" />
          <span>{isReanalyzing ? 'Scanning...' : 'Re-scan with AI'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-cream-base)',
        border: '1px solid var(--border-cream)'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input 
            type="text"
            className="input-field"
            placeholder="Search description, merchant, TXN ref..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: 38 }}
          />
        </div>

        {/* Category Dropdown */}
        <select 
          className="input-field"
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          style={{ flex: '0 1 180px' }}
        >
          {categoriesList.map(c => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Anomaly Only Filter Toggle */}
        <button
          onClick={() => { setFilterAnomalyOnly(!filterAnomalyOnly); setCurrentPage(1); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 14px',
            borderRadius: 'var(--radius-md)',
            background: filterAnomalyOnly ? 'var(--accent-crimson-soft)' : '#FFFFFF',
            border: `1px solid ${filterAnomalyOnly ? 'rgba(190, 18, 60, 0.3)' : 'var(--border-cream)'}`,
            color: filterAnomalyOnly ? 'var(--accent-crimson-text)' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ShieldAlert size={15} color={filterAnomalyOnly ? 'var(--accent-crimson)' : 'var(--text-muted)'} />
          <span>Anomalies Only</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-cream)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 14px' }}>Date</th>
              <th style={{ padding: '12px 14px' }}>Transaction Details</th>
              <th style={{ padding: '12px 14px' }}>Category</th>
              <th style={{ padding: '12px 14px' }}>Method</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>AI Detection</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                const isAnomaly = Boolean(tx.isAnomaly);

                return (
                  <tr 
                    key={tx.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isAnomaly ? 'rgba(254, 242, 242, 0.6)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isAnomaly ? 'rgba(254, 242, 242, 0.9)' : 'var(--bg-cream-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isAnomaly ? 'rgba(254, 242, 242, 0.6)' : 'transparent'}
                  >
                    {/* Date */}
                    <td style={{ padding: '14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {tx.date || 'Recent'}
                    </td>

                    {/* Description + Ref */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {tx.description}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {tx.merchant && <span>Merchant: <strong style={{ color: 'var(--text-secondary)' }}>{tx.merchant}</strong></span>}
                          {tx.transactionRef && <span className="mono" style={{ opacity: 0.85 }}>#{tx.transactionRef}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${getCategoryBadgeClass(tx.category)}`}>
                        {tx.displayCategory || tx.category}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'var(--bg-cream-soft)',
                        border: '1px solid var(--border-cream)',
                        color: 'var(--text-secondary)'
                      }}>
                        {tx.paymentMethod || 'UPI'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ 
                      padding: '14px', 
                      textAlign: 'right', 
                      fontWeight: 700, 
                      fontSize: '0.94rem',
                      color: isIncome ? 'var(--accent-forest)' : 'var(--text-primary)' 
                    }}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>

                    {/* AI Anomaly Marker */}
                    <td style={{ padding: '14px', textAlign: 'center', position: 'relative' }}>
                      {isAnomaly ? (
                        <div style={{ display: 'inline-block' }}>
                          <button
                            onClick={() => setActiveTooltipId(activeTooltipId === tx.id ? null : tx.id)}
                            className="badge badge-anomaly"
                            style={{ cursor: 'pointer' }}
                          >
                            <AlertTriangle size={13} color="var(--accent-crimson)" />
                            <span>Outlier Spike</span>
                          </button>

                          {/* Tooltip Popup */}
                          {activeTooltipId === tx.id && (
                            <div style={{
                              position: 'absolute',
                              right: 20,
                              top: 42,
                              zIndex: 40,
                              width: 280,
                              padding: '12px 14px',
                              borderRadius: 'var(--radius-md)',
                              background: '#FFFFFF',
                              border: '1px solid var(--border-cream)',
                              boxShadow: 'var(--shadow-modal)',
                              textAlign: 'left',
                              fontSize: '0.76rem',
                              color: 'var(--text-primary)',
                              animation: 'fadeIn 0.15s ease'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-crimson)', fontWeight: 700, marginBottom: 4 }}>
                                <ShieldAlert size={14} />
                                <span>IsolationForest Flag ({(tx.anomalyScore * 100).toFixed(0)}%)</span>
                              </div>
                              <p style={{ lineHeight: 1.45, color: 'var(--text-secondary)' }}>
                                {tx.anomalyReason || 'Transaction amount sharply exceeds your typical spending pattern.'}
                              </p>
                              <div style={{ marginTop: 8, textAlign: 'right' }}>
                                <button 
                                  onClick={() => setActiveTooltipId(null)}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Normal</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => onEdit(tx)} 
                          title="Edit transaction"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => onDelete(tx.id)} 
                          title="Delete transaction"
                          style={{ color: 'var(--accent-crimson)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No transactions match your current search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 18,
          paddingTop: 14,
          borderTop: '1px solid var(--border-cream)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} records
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 10px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 10px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
