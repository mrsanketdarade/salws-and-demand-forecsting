import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Layers,
  Sparkles,
  GitBranch,
  Calendar,
  Percent,
  Check,
  ToggleLeft,
  ToggleRight,
  Database,
  ArrowRight,
} from 'lucide-react';
import { FEATURE_IMPORTANCE_DATA } from '../data/mockData';
import { FeatureImportanceItem } from '../types';

export const FeatureEngineeringView: React.FC = () => {
  const [activeFeatures, setActiveFeatures] = useState<Record<string, boolean>>({
    Lag_7_Sales: true,
    Rolling_Mean_30d: true,
    Promo_Discount_Pct: true,
    Lag_1_Sales: true,
    Day_Of_Week: true,
    Holiday_Event_Flag: true,
    Rolling_Std_14d: true,
    Consumer_Sentiment_Index: true,
  });

  const toggleFeature = (name: string) => {
    setActiveFeatures((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredFeatures = FEATURE_IMPORTANCE_DATA.map((item) => ({
    ...item,
    importance: activeFeatures[item.feature] ? item.importance : 0,
  }));

  const categoryColors: Record<string, string> = {
    Lag: '#3b82f6',
    'Rolling Window': '#10b981',
    Promotion: '#f59e0b',
    Calendar: '#8b5cf6',
    Economic: '#ec4899',
  };

  // Sample feature engineering dataset preview table
  const sampleEngineeredRows = [
    {
      date: '2026-08-28',
      product: 'Mobile',
      actual_sales: 142,
      lag_1: 138,
      lag_7: 135,
      roll_mean_7d: 136.4,
      roll_std_14d: 8.2,
      promo: 1,
      holiday: 0,
      dow_sin: 0.78,
    },
    {
      date: '2026-08-29',
      product: 'Mobile',
      actual_sales: 154,
      lag_1: 142,
      lag_7: 140,
      roll_mean_7d: 139.1,
      roll_std_14d: 9.1,
      promo: 1,
      holiday: 0,
      dow_sin: 0.97,
    },
    {
      date: '2026-08-30',
      product: 'Mobile',
      actual_sales: 148,
      lag_1: 154,
      lag_7: 145,
      roll_mean_7d: 141.5,
      roll_std_14d: 8.9,
      promo: 1,
      holiday: 0,
      dow_sin: 0.43,
    },
    {
      date: '2026-08-31',
      product: 'Mobile',
      actual_sales: 139,
      lag_1: 148,
      lag_7: 136,
      roll_mean_7d: 140.2,
      roll_std_14d: 7.8,
      promo: 0,
      holiday: 0,
      dow_sin: -0.43,
    },
    {
      date: '2026-09-01 (Target)',
      product: 'Mobile',
      actual_sales: '580 (Month Fcst)',
      lag_1: 139,
      lag_7: 142,
      roll_mean_7d: 141.0,
      roll_std_14d: 8.4,
      promo: 1,
      holiday: 0,
      dow_sin: -0.97,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Feature Engineering & Signal Extraction Pipeline
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Transforming raw SQL sales rows into high-dimensional predictive feature tensors for Random Forest & XGBoost.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              {Object.values(activeFeatures).filter(Boolean).length} / {FEATURE_IMPORTANCE_DATA.length} Features Active
            </span>
          </div>
        </div>
      </div>

      {/* Feature Importance & Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Bar Chart of Feature Importance */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Feature Importance (Mean Decrease in Impurity / Gini)
              </h3>
              <p className="text-xs text-slate-500">
                Evaluated across 120 Random Forest decision trees & XGBoost gain splits.
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={filteredFeatures}
                margin={{ top: 10, right: 30, left: 90, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 0.35]}
                  tickFormatter={(val) => `${Math.round(val * 100)}%`}
                  fontSize={11}
                  stroke="#64748b"
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  fontSize={11}
                  stroke="#334155"
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Gain Weight']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {filteredFeatures.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[entry.category] || '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: color }} />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Switches & Definitions */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Engineered Feature Arsenal
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Toggle individual features to evaluate their contribution to forecast convergence.
          </p>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {FEATURE_IMPORTANCE_DATA.map((item) => {
              const isActive = activeFeatures[item.feature];
              return (
                <div
                  key={item.feature}
                  onClick={() => toggleFeature(item.feature)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-50/90 border-slate-300'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">
                        {item.feature}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.2 rounded font-medium text-white"
                        style={{ backgroundColor: categoryColors[item.category] }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-slate-700">
                    {isActive ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Transformation Matrix Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">
              Sample Feature Matrix Tensors (Input to Random Forest & XGBoost)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lagged values, rolling aggregations, promotional multipliers, and cyclical calendar vectors for Mobile SKU.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <th className="py-2.5 px-3">Date (t)</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Target Y(t)</th>
                <th className="py-2.5 px-3">Lag_1 (t-1)</th>
                <th className="py-2.5 px-3">Lag_7 (t-7)</th>
                <th className="py-2.5 px-3">Roll_Mean_7d</th>
                <th className="py-2.5 px-3">Roll_Std_14d</th>
                <th className="py-2.5 px-3">Promo_Flag</th>
                <th className="py-2.5 px-3">DOW_Sin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {sampleEngineeredRows.map((row, i) => (
                <tr
                  key={i}
                  className={`hover:bg-slate-50 ${
                    i === sampleEngineeredRows.length - 1 ? 'bg-indigo-50/50 font-bold' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-slate-900">{row.date}</td>
                  <td className="py-2 px-3 font-semibold">{row.product}</td>
                  <td className="py-2 px-3 text-emerald-700 font-bold">{row.actual_sales}</td>
                  <td className="py-2 px-3">{row.lag_1}</td>
                  <td className="py-2 px-3">{row.lag_7}</td>
                  <td className="py-2 px-3">{row.roll_mean_7d}</td>
                  <td className="py-2 px-3">{row.roll_std_14d}</td>
                  <td className="py-2 px-3">{row.promo}</td>
                  <td className="py-2 px-3">{row.dow_sin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
