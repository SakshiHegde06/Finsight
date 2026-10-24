import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, PieChart as PieIcon, Target, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ExpenseCharts({ categories, trends, forecast, budgets }) {
  const [activeTab, setActiveTab] = useState('category');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Luxury Cream Harmonious Palette for Categories
  const categoryPalette = {
    food: '#D97706',          // Warm Amber
    shopping: '#8B5CF6',      // Elegant Violet
    travel: '#0284C7',        // Ocean Blue
    emi: '#475569',           // Slate Charcoal
    utilities: '#CA8A04',     // Muted Ochre
    entertainment: '#EC4899', // Berry Rose
    healthcare: '#E11D48',    // Crimson
    investment: '#15803D',    // Forest Green
    education: '#2563EB'      // Indigo
  };

  // 1. Doughnut Chart
  const doughnutLabels = categories?.map(c => c.displayCategory || c.category) || [];
  const doughnutDataValues = categories?.map(c => c.amount) || [];
  const doughnutColors = categories?.map(c => categoryPalette[c.category?.toLowerCase()] || c.color || '#475569') || [];

  const doughnutData = {
    labels: doughnutLabels,
    datasets: [
      {
        data: doughnutDataValues,
        backgroundColor: doughnutColors,
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#44403C',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1C1917',
        bodyColor: '#44403C',
        borderColor: '#E7E3D8',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw || 0;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${formatCurrency(val)} (${pct}%)`;
          }
        }
      }
    },
    cutout: '72%'
  };

  // 2. Line Chart Data
  let lineLabels = [];
  let lineDataActual = [];
  let lineDataForecast = [];

  if (forecast?.forecast_points && forecast.forecast_points.length > 0) {
    lineLabels = forecast.forecast_points.map(p => `Day ${p.day}`);
    const currentDay = Math.min(new Date().getDate(), 30);

    forecast.forecast_points.forEach(p => {
      if (p.day <= currentDay) {
        lineDataActual.push(p.cumulative_spend);
        lineDataForecast.push(p.day === currentDay ? p.cumulative_spend : null);
      } else {
        lineDataActual.push(null);
        lineDataForecast.push(p.cumulative_spend);
      }
    });
  } else {
    lineLabels = [];
    lineDataActual = [];
    lineDataForecast = [];
  }

  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Actual Spend (Cumulative)',
        data: lineDataActual,
        borderColor: '#1C1917',
        backgroundColor: 'rgba(28, 25, 23, 0.05)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#1C1917',
        pointRadius: 3.5,
        pointHoverRadius: 6
      },
      {
        label: 'AI Forecast Trajectory (Velocity Model)',
        data: lineDataForecast,
        borderColor: '#7C3AED',
        borderDash: [5, 5],
        backgroundColor: 'rgba(124, 58, 237, 0.04)',
        fill: true,
        tension: 0.2,
        borderWidth: 2,
        pointBackgroundColor: '#7C3AED',
        pointRadius: 3
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#44403C',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1C1917',
        bodyColor: '#44403C',
        borderColor: '#E7E3D8',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(28, 25, 23, 0.05)' },
        ticks: { color: '#78716C', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(28, 25, 23, 0.05)' },
        ticks: {
          color: '#78716C',
          font: { size: 11 },
          callback: (val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`
        }
      }
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
      gap: 20,
      marginBottom: 28
    }}>
      {/* Left Card: Visualizer */}
      <div className="glass-card" style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeTab === 'category' ? <PieIcon size={18} color="var(--text-primary)" /> : <TrendingUp size={18} color="#7C3AED" />}
              {activeTab === 'category' ? 'Category Spending Breakdown' : 'Spending Trajectory & Forecast'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {activeTab === 'category' 
                ? 'Expense distribution across categories' 
                : 'Projected monthly spend calculated via machine learning velocity'}
            </p>
          </div>

          {/* Toggle buttons */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-cream-soft)',
            padding: 3,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-cream)'
          }}>
            <button
              onClick={() => setActiveTab('category')}
              style={{
                background: activeTab === 'category' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'category' ? '#1C1917' : 'var(--text-secondary)',
                boxShadow: activeTab === 'category' ? 'var(--shadow-subtle)' : 'none',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 7,
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('trajectory')}
              style={{
                background: activeTab === 'trajectory' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'trajectory' ? '#7C3AED' : 'var(--text-secondary)',
                boxShadow: activeTab === 'trajectory' ? 'var(--shadow-subtle)' : 'none',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 7,
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Forecast Trajectory
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div style={{ position: 'relative', height: 320, width: '100%' }}>
          {activeTab === 'category' ? (
            categories && categories.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No category data available
              </div>
            )
          ) : (
            lineLabels.length > 0 ? (
              <Line data={lineData} options={lineOptions} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No spending trajectory data available for this cycle. Add expense transactions to visualize.
              </div>
            )
          )}
        </div>
      </div>

      {/* Right Card: Budget Utilization Meters */}
      <div className="glass-card" style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="var(--accent-forest)" />
              Budget Utilization
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Actual spend vs allocated category limits
            </p>
          </div>
        </div>

        {/* Budget Item List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxHeight: 330,
          overflowY: 'auto',
          paddingRight: 6
        }}>
          {budgets && budgets.length > 0 ? (
            budgets.map((b) => {
              const spent = b.spentAmount || 0;
              const allocated = b.allocatedAmount || 1;
              const pct = Math.round((spent / allocated) * 100);
              const isOver = pct >= 100;
              const isNear = pct >= 85 && pct < 100;
              const color = categoryPalette[b.category?.toLowerCase()] || b.color || '#475569';

              return (
                <div key={b.id || b.category} style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-cream-base)',
                  border: `1px solid ${isOver ? 'rgba(190, 18, 60, 0.25)' : 'var(--border-cream)'}`,
                  transition: 'all 0.15s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: color
                      }} />
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {b.displayCategory || b.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isOver && (
                        <span style={{ color: 'var(--accent-crimson)', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', fontWeight: 700 }}>
                          <AlertCircle size={12} /> Over Limit
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: isOver ? 'var(--accent-crimson)' : isNear ? 'var(--accent-amber)' : 'var(--accent-forest)'
                      }}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: 6,
                    borderRadius: 3,
                    background: 'var(--bg-cream-inset)',
                    overflow: 'hidden',
                    marginBottom: 6
                  }}>
                    <div style={{
                      width: `${Math.min(100, pct)}%`,
                      height: '100%',
                      background: isOver 
                        ? 'var(--accent-crimson)' 
                        : isNear 
                          ? 'var(--accent-amber)' 
                          : color,
                      transition: 'width 0.6s ease'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span>Spent: <strong style={{ color: 'var(--text-secondary)' }}>{formatCurrency(spent)}</strong></span>
                    <span>Target: {formatCurrency(allocated)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>No budgets configured for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
}
