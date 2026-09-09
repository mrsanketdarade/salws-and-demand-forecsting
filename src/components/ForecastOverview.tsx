import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Laptop,
  Smartphone,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  Monitor as MonitorIcon,
  TrendingUp,
  AlertTriangle,
  Layers,
  BarChart3,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { ProductForecast, ProductName, ModelType } from '../types';
import { generateTimeSeriesChartData } from '../utils/forecastEngine';

interface ForecastOverviewProps {
  products: ProductForecast[];
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  onOrderClick: (product: ProductForecast) => void;
}

export const ForecastOverview: React.FC<ForecastOverviewProps> = ({
  products,
  selectedModel,
  setSelectedModel,
  onOrderClick,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductName | 'ALL'>('ALL');
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [showModelBreakdown, setShowModelBreakdown] = useState<boolean>(false);

  // Time-series chart points
  const chartData = useMemo(() => {
    return generateTimeSeriesChartData(selectedProduct, products, selectedModel);
  }, [selectedProduct, products, selectedModel]);

  const totalForecast = products.reduce((acc, p) => acc + p.predictedDemand, 0); // 1,730
  const totalRevenue = products.reduce((acc, p) => acc + p.predictedDemand * p.unitPrice, 0);

  // Product Icon helper
  const getProductIcon = (name: ProductName) => {
    switch (name) {
      case 'Laptop':
        return <Laptop className="w-5 h-5" />;
      case 'Mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'Keyboard':
        return <KeyboardIcon className="w-5 h-5" />;
      case 'Mouse':
        return <MouseIcon className="w-5 h-5" />;
      case 'Monitor':
        return <MonitorIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Next Month Demand Predictions
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              September 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Trained on 52 weeks of historical sales across 5 core hardware product lines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Total Demand:</span>
          <span className="text-lg font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
            {totalForecast.toLocaleString()} units
          </span>
          <span className="text-xs text-slate-500 hidden md:inline">
            (~${(totalRevenue / 1000).toFixed(0)}k gross revenue)
          </span>
        </div>
      </div>

      {/* 5 Product Forecast Cards (Laptop 240, Mobile 580, Keyboard 320, Mouse 410, Monitor 180) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {products.map((prod) => {
          const isSelected = selectedProduct === prod.name;
          const isCritical = prod.stockoutRisk === 'CRITICAL';
          const isWarning = prod.stockoutRisk === 'WARNING';

          return (
            <div
              key={prod.id}
              onClick={() => setSelectedProduct(prod.name)}
              className={`group bg-white rounded-xl p-4 border transition-all cursor-pointer relative shadow-2xs hover:shadow-xs ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Product header & icon */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isCritical
                        ? 'bg-amber-100 text-amber-900'
                        : isWarning
                        ? 'bg-orange-50 text-orange-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {getProductIcon(prod.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{prod.name}</h3>
                    <span className="text-[11px] text-slate-500 font-normal">
                      ${prod.unitPrice} / unit
                    </span>
                  </div>
                </div>

                {/* Stockout Risk Indicator */}
                {isCritical ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    {prod.daysOfSupply}d stock
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500">
                    {prod.daysOfSupply}d stock
                  </span>
                )}
              </div>

              {/* Exact Predicted Units */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Next Month Demand
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                  {prod.predictedDemand}{' '}
                  <span className="text-xs font-medium text-slate-500">units</span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center">
                    +{prod.trendMoM}%
                  </span>
                </div>
              </div>

              {/* Inventory details */}
              <div className="pt-3 border-t border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Current Stock:</span>
                  <span className="font-semibold text-slate-900">{prod.currentStock}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Run-rate:</span>
                  <span className="font-medium text-slate-700">
                    {prod.dailyRunRate.toFixed(1)} / day
                  </span>
                </div>
                {isCritical && (
                  <div className="pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOrderClick(prod);
                      }}
                      className="w-full text-xs font-bold py-1.5 px-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      Reorder {prod.recommendedOrder} units
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time-Series Forecasting Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Time-Series Demand Trajectory & Forecast Horizon
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing 8 months historical actuals + Next Month Forecast ({selectedModel} model)
              with confidence interval bands.
            </p>
          </div>

          {/* Controls: Product Filter, Confidence Band, Model Comparison toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by SKU */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedProduct('ALL')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedProduct === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All SKUs
              </button>
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p.name)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedProduct === p.name
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Confidence Band Toggle */}
            <button
              onClick={() => setShowConfidenceBand(!showConfidenceBand)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                showConfidenceBand
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              80% CI Band
            </button>

            {/* Model Breakdown Toggle */}
            <button
              onClick={() => setShowModelBreakdown(!showModelBreakdown)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                showModelBreakdown
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Compare 4 Models
            </button>
          </div>
        </div>

        {/* Recharts Composed Chart */}
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{ color: '#e2e8f0' }}
                labelStyle={{ fontWeight: 'bold', color: '#f8fafc', marginBottom: '4px' }}
                formatter={(value: any, name: string) => {
                  const num = typeof value === 'number' ? value.toLocaleString() : value;
                  if (name === 'Actual Sales') return [`${num} units`, 'Historical Actual'];
                  if (name === 'Demand Forecast') return [`${num} units`, `${selectedModel} Prediction`];
                  return [`${num} units`, name];
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
              />

              {/* Confidence Band Area (Upper and Lower bounds) */}
              {showConfidenceBand && (
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="#94a3b8"
                  fillOpacity={0.18}
                  name="Uncertainty Interval (80% CI)"
                />
              )}

              {/* Historical Actual Line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0f172a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0f172a', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Actual Sales"
              />

              {/* Active Model Forecast Line */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#059669"
                strokeWidth={3}
                strokeDasharray="4 4"
                dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
                name="Demand Forecast"
              />

              {/* Model Comparison Breakdown Lines */}
              {showModelBreakdown && (
                <>
                  <Line
                    type="monotone"
                    dataKey="xgboost"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    name="XGBoost"
                  />
                  <Line
                    type="monotone"
                    dataKey="prophet"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Prophet"
                  />
                  <Line
                    type="monotone"
                    dataKey="rf"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Random Forest"
                  />
                  <Line
                    type="monotone"
                    dataKey="arima"
                    stroke="#ec4899"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    name="ARIMA"
                  />
                </>
              )}

              {/* Reference line marking historical vs forecast split */}
              <ReferenceLine
                x="Sep 26 (Forecast)"
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{
                  value: 'Forecast Origin (T+1)',
                  position: 'insideTopLeft',
                  fill: '#64748b',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Insight Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Forecast origin based on end-of-August close. Validated with 5-fold cross validation.
            </span>
          </div>
          <div className="flex items-center gap-3 font-medium">
            <span>Overall Model MAPE: <strong className="text-slate-800">3.2%</strong></span>
            <span>R² Score: <strong className="text-slate-800">0.962</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
