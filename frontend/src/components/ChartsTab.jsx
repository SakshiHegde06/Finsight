import React, { useState, useMemo } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  CalendarDays, 
  Home, 
  Shirt, 
  Utensils, 
  Bus, 
  ShoppingCart, 
  Gamepad2, 
  Wallet, 
  Zap, 
  HeartPulse, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../data/screenshotDemoData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function ChartsTab({ 
  transactions = [], 
  monthYear = '2026-11',
  setMonthYear 
}) {
  const [viewType, setViewType] = useState('EXPENSE'); // 'EXPENSE' or 'INCOME'
  const [activePeriodTab, setActivePeriodTab] = useState('This Month');
  const [carouselSlide, setCarouselSlide] = useState(0); // 0: Line Chart, 1: Date Donut, 2: Category Donut

  const formatNumber = (num) => Math.round(num || 0).toLocaleString('en-IN');

  // Filter transactions by type (EXPENSE or INCOME)
  const currentTxs = useMemo(() => {
    return transactions.filter(t => (t.type || 'EXPENSE') === viewType);
  }, [transactions, viewType]);

  // Total amount
  const totalAmount = useMemo(() => {
    return currentTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [currentTxs]);

  // Average per day (assuming 30 days or active day count)
  const averagePerDay = useMemo(() => {
    const days = 30;
    return totalAmount > 0 ? (totalAmount / days).toFixed(2) : '0.00';
  }, [totalAmount]);

  // Group by category
  const categoryBreakdown = useMemo(() => {
    const map = {};
    currentTxs.forEach(t => {
      const cat = t.category?.toLowerCase() || 'other';
      if (!map[cat]) {
        map[cat] = {
          category: cat,
          display: t.displayCategory || cat.charAt(0).toUpperCase() + cat.slice(1),
          amount: 0,
          count: 0
        };
      }
      map[cat].amount += (t.amount || 0);
      map[cat].count += 1;
    });

    const list = Object.values(map);
    list.sort((a, b) => b.amount - a.amount);
    return list;
  }, [currentTxs]);

  // Group by Date for the Date Donut and Line Chart
  const dateBreakdown = useMemo(() => {
    const map = {};
    currentTxs.forEach(t => {
      const d = t.date || '2026-11-14';
      map[d] = (map[d] || 0) + (t.amount || 0);
    });

    const entries = Object.entries(map).map(([date, amount]) => {
      const parts = date.split('-');
      const day = parts[2] ? parseInt(parts[2], 10) : 1;
      const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, day);
      const label = `${day} ${dObj.toLocaleString('en-US', { month: 'short' })}`;
      return { date, day, label, amount };
    });

    entries.sort((a, b) => b.amount - a.amount);
    return entries;
  }, [currentTxs]);

  // --- CHART 1: Daily Line Chart with Multi-Colored Dots ---
  const lineChartData = useMemo(() => {
    // Generate days 1..30
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const dayLabels = days.map(d => (d === 1 ? 'Nov 1' : d === 15 ? '15' : d === 29 ? '29' : ''));
    
    // Map transactions into day buckets
    const spendByDay = {};
    currentTxs.forEach(t => {
      if (t.date) {
        const parts = t.date.split('-');
        const day = parseInt(parts[2], 10);
        spendByDay[day] = (spendByDay[day] || 0) + t.amount;
      }
    });

    const dataPoints = days.map(d => spendByDay[d] || 0);

    // Multi-colored dot palette for points
    const dotColors = [
      '#2ec4b6', '#ff6b8b', '#fb923c', '#8b5cf6', '#f59e0b', 
      '#3b82f6', '#ec4899', '#10b981', '#f43f5e', '#6366f1'
    ];
    const pointBackgroundColors = days.map((d, i) => dotColors[i % dotColors.length]);

    return {
      labels: dayLabels,
      datasets: [
        {
          label: 'Spend',
          data: dataPoints,
          borderColor: '#8b5cf6', // Soft purple/indigo line
          borderWidth: 2,
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: false
        }
      ]
    };
  }, [currentTxs]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => `Day ${items[0].dataIndex + 1}`,
          label: (item) => ` Spend: ₹${formatNumber(item.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11, family: 'Plus Jakarta Sans' } }
      },
      y: {
        min: 0,
        grid: { color: '#f3f4f6' },
        ticks: {
          color: '#6b7280',
          font: { size: 11, family: 'Plus Jakarta Sans' },
          callback: (val) => (val >= 1000 ? `${(val / 1000).toFixed(0)},000` : val)
        }
      }
    }
  };

  // --- CHART 2: Date Breakdown Donut Chart ---
  const dateDonutData = useMemo(() => {
    const topDates = dateBreakdown.slice(0, 4);
    const otherDates = dateBreakdown.slice(4);
    const otherSum = otherDates.reduce((sum, d) => sum + d.amount, 0);

    const labels = topDates.map(d => d.label);
    const values = topDates.map(d => d.amount);
    const colors = ['#fde047', '#67e8f9', '#f472b6', '#34d399']; // yellow, cyan, pink, mint

    if (otherSum > 0) {
      labels.push('Other');
      values.push(otherSum);
      colors.push('#a7f3d0');
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4
        }
      ]
    };
  }, [dateBreakdown]);

  // --- CHART 3: Category Breakdown Donut Chart ---
  const categoryDonutData = useMemo(() => {
    const topCats = categoryBreakdown.slice(0, 4);
    const otherCats = categoryBreakdown.slice(4);
    const otherSum = otherCats.reduce((sum, c) => sum + c.amount, 0);

    const labels = topCats.map(c => c.display);
    const values = topCats.map(c => c.amount);
    const colors = ['#fde047', '#67e8f9', '#f472b6', '#34d399'];

    if (otherSum > 0) {
      labels.push('Other');
      values.push(otherSum);
      colors.push('#a7f3d0');
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4
        }
      ]
    };
  }, [categoryBreakdown]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw || 0;
            const pct = totalAmount > 0 ? ((val / totalAmount) * 100).toFixed(2) : '0';
            return ` ${ctx.label}: ₹${formatNumber(val)} (${pct}%)`;
          }
        }
      }
    }
  };

  // Helper for category icons
  const renderCatIcon = (catName) => {
    switch (catName?.toLowerCase()) {
      case 'housing':
      case 'rent':
        return <Home size={18} strokeWidth={2} />;
      case 'clothing':
        return <Shirt size={18} strokeWidth={2} />;
      case 'food':
        return <Utensils size={18} strokeWidth={2} />;
      case 'transportation':
      case 'travel':
        return <Bus size={18} strokeWidth={2} />;
      case 'shopping':
        return <ShoppingCart size={18} strokeWidth={2} />;
      case 'entertainment':
        return <Gamepad2 size={18} strokeWidth={2} />;
      default:
        return <MoreHorizontal size={18} strokeWidth={2} />;
    }
  };

  const getCatColor = (catName) => {
    const c = CATEGORY_DEFINITIONS[catName?.toLowerCase()];
    return c ? c.color : '#94a3b8';
  };

  return (
    <div style={{ paddingBottom: 30 }}>
      {/* Top Header: Yellow with Expenses/Income toggle & Calendar */}
      <div className="money-header-yellow" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 28 }} />

          {/* Toggle pill: Expenses | Income */}
          <div className="charts-toggle-pill">
            <button
              className={`charts-toggle-btn ${viewType === 'EXPENSE' ? 'active' : 'inactive'}`}
              onClick={() => setViewType('EXPENSE')}
            >
              Expenses
            </button>
            <button
              className={`charts-toggle-btn ${viewType === 'INCOME' ? 'active' : 'inactive'}`}
              onClick={() => setViewType('INCOME')}
            >
              Income
            </button>
          </div>

          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#111827',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Calendar Period"
          >
            <CalendarDays size={24} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Horizontal Period Tabs */}
      <div className="period-tabs-bar">
        {['Aug 2026', 'Sept 2026', 'Last Month', 'This Month'].map((tab) => (
          <div
            key={tab}
            className={`period-tab-item ${activePeriodTab === tab ? 'active' : ''}`}
            onClick={() => setActivePeriodTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Summary Metrics (Total & Average) */}
      <div style={{ padding: '14px 18px 4px 18px', background: '#ffffff' }}>
        <div style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: 600 }}>
          Total: {formatNumber(totalAmount)}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 2 }}>
          Average: {averagePerDay}
        </div>
      </div>

      {/* Chart Carousel Container */}
      <div className="chart-carousel-card">
        <div style={{ position: 'relative', height: 180, width: '100%' }}>
          {carouselSlide === 0 && (
            /* Slide 1: Line Chart with multi-colored dots */
            <Line data={lineChartData} options={lineChartOptions} />
          )}

          {carouselSlide === 1 && (
            /* Slide 2: Date Breakdown Donut Chart */
            <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
                <Doughnut data={dateDonutData} options={donutOptions} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                    {formatNumber(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Legend on right */}
              <div style={{ flex: 1, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem' }}>
                {dateDonutData.labels.map((lbl, idx) => (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        backgroundColor: dateDonutData.datasets[0].backgroundColor[idx]
                      }} />
                      <span style={{ color: '#4b5563', fontWeight: 600 }}>{lbl}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#111827' }}>
                      {formatNumber(dateDonutData.datasets[0].data[idx])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {carouselSlide === 2 && (
            /* Slide 3: Category Breakdown Donut Chart */
            <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
                <Doughnut data={categoryDonutData} options={donutOptions} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                    {formatNumber(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Legend on right with percentages */}
              <div style={{ flex: 1, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem' }}>
                {categoryDonutData.labels.map((lbl, idx) => {
                  const val = categoryDonutData.datasets[0].data[idx];
                  const pct = totalAmount > 0 ? ((val / totalAmount) * 100).toFixed(2) : '0';
                  return (
                    <div key={lbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          backgroundColor: categoryDonutData.datasets[0].backgroundColor[idx]
                        }} />
                        <span style={{ color: '#4b5563', fontWeight: 600 }}>{lbl}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#111827' }}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3 Carousel Indicator Dots */}
        <div className="carousel-indicators">
          <div
            className={`carousel-dot ${carouselSlide === 0 ? 'active' : ''}`}
            onClick={() => setCarouselSlide(0)}
            title="Daily Spend Trajectory"
          />
          <div
            className={`carousel-dot ${carouselSlide === 1 ? 'active' : ''}`}
            onClick={() => setCarouselSlide(1)}
            title="Date Distribution"
          />
          <div
            className={`carousel-dot ${carouselSlide === 2 ? 'active' : ''}`}
            onClick={() => setCarouselSlide(2)}
            title="Category Share"
          />
        </div>
      </div>

      {/* Category Breakdown Progress List */}
      <div>
        {categoryBreakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '0.85rem' }}>
            No category entries for this period.
          </div>
        ) : (
          categoryBreakdown.map((cat) => {
            const pct = totalAmount > 0 ? ((cat.amount / totalAmount) * 100).toFixed(2) : '0';
            const catColor = getCatColor(cat.category);

            return (
              <div key={cat.category} className="cat-progress-row">
                {/* Category Icon */}
                <div
                  className="tx-category-icon-circle"
                  style={{ backgroundColor: catColor, marginRight: 0 }}
                >
                  {renderCatIcon(cat.category)}
                </div>

                {/* Progress Details */}
                <div className="cat-progress-info">
                  <div className="cat-progress-top">
                    <span className="cat-progress-name">{cat.display}</span>
                    <span className="cat-progress-amount">{formatNumber(cat.amount)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="cat-progress-track">
                    <div
                      className="cat-progress-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: catColor
                      }}
                    />
                  </div>

                  <div className="cat-progress-pct">
                    {pct}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

