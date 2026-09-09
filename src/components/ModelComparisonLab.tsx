import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Cpu,
  CheckCircle2,
  Sliders,
  Sparkles,
  TrendingUp,
  Activity,
  Award,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { ModelMetrics, ModelType } from '../types';
import { generateDecompositionData } from '../utils/forecastEngine';

interface ModelComparisonLabProps {
  models: ModelMetrics[];
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
}

export const ModelComparisonLab: React.FC<ModelComparisonLabProps> = ({
  models,
  selectedModel,
  setSelectedModel,
}) => {
  const [weights, setWeights] = useState({
    xgboost: 35,
    prophet: 25,
    rf: 25,
    arima: 15,
  });

  const decompositionData = generateDecompositionData(580); // Mobile baseline

  const activeModelDetails = models.find((m) => m.name === selectedModel) || models[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Advanced ML & Time-Series Laboratory
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Compare Random Forest, XGBoost, ARIMA, and Prophet architectures evaluated on 52-week sales history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Active Model:</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedModel}
            </span>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {models.map((model) => {
          const isSelected = selectedModel === model.name;
          const isBest = model.name === 'Ensemble';

          return (
            <div
              key={model.name}
              onClick={() => setSelectedModel(model.name)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative bg-white shadow-2xs hover:shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-600/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-slate-900 text-base">{model.name}</span>
                  {isBest && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Lowest Error
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 my-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">MAPE:</span>
                    <span className="font-bold text-slate-900">{model.mape}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RMSE:</span>
                    <span className="font-semibold text-slate-800">{model.rmse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">R² Score:</span>
                    <span className="font-bold text-slate-900">{model.r2}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedModel(model.name);
                  }}
                  className={`w-full py-1 px-2 rounded text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select Model'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Model Details & Hyperparameter Spec */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">
              {activeModelDetails.fullName}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Train latency: {activeModelDetails.trainingTimeMs}ms
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
            {activeModelDetails.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Hyperparameters */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Hyperparameters & Configuration
              </h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(activeModelDetails.hyperparameters).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-slate-700 font-mono">
                    <span className="text-slate-500">{key}:</span>
                    <span className="font-semibold text-slate-900">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Use-case */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Empirical Model Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeModelDetails.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Ensemble Blending Weights Controller */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-700" />
                Ensemble Loss Weight Optimizer
              </h4>
              <span className="text-xs font-bold text-indigo-700">100% Total</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Calibrated via rolling cross-validation inverse variance weights.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 font-medium">
                  <span>XGBoost Regressor:</span>
                  <span className="font-bold text-slate-900">{weights.xgboost}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weights.xgboost}
                  onChange={(e) => setWeights({ ...weights, xgboost: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-medium">
                  <span>Prophet (Seasonal Additive):</span>
                  <span className="font-bold text-slate-900">{weights.prophet}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weights.prophet}
                  onChange={(e) => setWeights({ ...weights, prophet: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-medium">
                  <span>Random Forest (Bagged):</span>
                  <span className="font-bold text-slate-900">{weights.rf}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weights.rf}
                  onChange={(e) => setWeights({ ...weights, rf: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-medium">
                  <span>ARIMA (2,1,1):</span>
                  <span className="font-bold text-slate-900">{weights.arima}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weights.arima}
                  onChange={(e) => setWeights({ ...weights, arima: Number(e.target.value) })}
                  className="w-full accent-pink-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => setSelectedModel('Ensemble')}
              className="w-full py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs"
            >
              Apply Blended Ensemble Model
            </button>
          </div>
        </div>
      </div>

      {/* Classical Time-Series Decomposition Component Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Time-Series Additive Decomposition: Y(t) = Trend(t) + Seasonal(t) + Residual(t)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Separates the underlying long-term baseline growth, cyclical weekly/holiday pulses, and white-noise residuals.
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={decompositionData}
              margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="observed"
                stroke="#0f172a"
                strokeWidth={2}
                name="Observed Demand"
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Long-Term Trend g(t)"
              />
              <Bar dataKey="seasonal" fill="#8b5cf6" fillOpacity={0.6} name="Seasonal Wave s(t)" />
              <Line
                type="monotone"
                dataKey="residual"
                stroke="#ef4444"
                strokeDasharray="2 2"
                name="Residual Noise ε(t)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
