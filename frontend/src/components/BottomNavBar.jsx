import React from 'react';
import { FileText, PieChart, Plus, ScrollText, User } from 'lucide-react';

export default function BottomNavBar({ activeTab, onSelectTab, onOpenAddModal }) {
  return (
    <nav className="app-bottom-nav">
      {/* 1. Home */}
      <button 
        className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
      >
        <FileText size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span>Home</span>
      </button>

      {/* 2. Charts */}
      <button 
        className={`nav-tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
        onClick={() => onSelectTab('charts')}
      >
        <PieChart size={20} strokeWidth={activeTab === 'charts' ? 2.5 : 2} />
        <span>Charts</span>
      </button>

      {/* Center FAB: Add Transaction (+) */}
      <button 
        className="nav-fab-btn"
        onClick={onOpenAddModal}
        title="Add Expense or Income"
      >
        <Plus size={28} strokeWidth={2.8} />
      </button>

      {/* 3. Reports */}
      <button 
        className={`nav-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
        onClick={() => onSelectTab('reports')}
      >
        <ScrollText size={20} strokeWidth={activeTab === 'reports' ? 2.5 : 2} />
        <span>Reports</span>
      </button>

      {/* 4. Profile */}
      <button 
        className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onSelectTab('profile')}
      >
        <User size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
        <span>Profile</span>
      </button>
    </nav>
  );
}

