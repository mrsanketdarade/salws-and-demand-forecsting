import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Package,
} from 'lucide-react';
import { ModelType } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  criticalAlertCount: number;
  totalPredictedUnits: number;
  onOpenAiDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
  criticalAlertCount,
  totalPredictedUnits,
  onOpenAiDrawer,
}) => {
  const tabs = [
    { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory & Reorder', icon: Package, badge: criticalAlertCount > 0 ? `${criticalAlertCount} Risk` : undefined },
    { id: 'models', label: 'ML Models Lab', icon: Cpu },
    { id: 'features', label: 'Feature Engineering', icon: Layers },
    { id: 'sql', label: 'SQL Studio', icon: Database, badge: '52 Wks' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand & Purpose */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Sales & Demand Forecasting
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Data Science + Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Next-Month Predictive Demand Engine • Auto Reorder Optimization • SQL Historical Store
              </p>
            </div>
          </div>

          {/* Key Metrics & Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Predicted Month Demand Pill */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Next Month Demand:</span>
              <span className="text-sm font-bold text-slate-900">
                {totalPredictedUnits.toLocaleString()} units
              </span>
            </div>

            {/* Active Model Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <span className="text-xs text-slate-500 font-medium">Model:</span>
              <select
                aria-label="Select ML forecasting model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
              >
                <option value="Ensemble">Ensemble (Blended)</option>
                <option value="XGBoost">XGBoost Regressor</option>
                <option value="Prophet">Prophet (Additive)</option>
                <option value="Random Forest">Random Forest</option>
                <option value="ARIMA">ARIMA (2,1,1)</option>
              </select>
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiDrawer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      tab.id === 'inventory' && criticalAlertCount > 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
