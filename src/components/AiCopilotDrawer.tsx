import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Bot,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { ProductForecast, ModelType } from '../types';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductForecast[];
  selectedModel: ModelType;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  products,
  selectedModel,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [userQuery, setUserQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string>('');

  if (!isOpen) return null;

  const scenarios = [
    'Holiday Flash Sale: +30% spike on Mobile & Peripherals',
    'Supply Chain Disruption: Supplier lead times extend by +7 days',
    'Price Sensitivity: Laptop prices drop 10%, shifting demand +18%',
  ];

  const handleGenerateAnalysis = async (customQuery?: string, scenario?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          modelName: selectedModel,
          scenario: scenario || selectedScenario,
          query: customQuery || userQuery,
        }),
      });

      const data = await response.json();
      if (data && data.analysis) {
        setAnalysisText(data.analysis);
      } else {
        setAnalysisText('Unable to retrieve demand intelligence report.');
      }
    } catch (err: any) {
      console.error('Error fetching AI insights:', err);
      setAnalysisText('Server-side analysis error. Reviewing default algorithmic forecasts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Demand Intelligence</h3>
              <p className="text-[11px] text-slate-400">Gemini 3.8 Flash Supply Chain Copilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {/* Quick Scenario Buttons */}
          <div>
            <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Scenario Stress-Testing
            </span>
            <div className="space-y-1.5">
              {scenarios.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedScenario(sc);
                    handleGenerateAnalysis(undefined, sc);
                  }}
                  className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-xs font-medium text-slate-800"
                >
                  ⚡ {sc}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Trigger Button if empty */}
          {!analysisText && !loading && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <Bot className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Executive Briefing Ready
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Synthesizes the next month forecasts (1,730 total units), the critical 8-day Mobile stockout alert, and reorder priorities.
              </p>
              <button
                onClick={() => handleGenerateAnalysis()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Generate Intelligence Briefing</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Evaluating historical regression gradients & safety buffers...
              </p>
            </div>
          )}

          {/* Analysis Markdown Result Output */}
          {analysisText && !loading && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 leading-relaxed space-y-2 font-sans">
              <div className="whitespace-pre-wrap">{analysisText}</div>
            </div>
          )}
        </div>

        {/* Drawer Footer / Input Box */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!userQuery.trim()) return;
              handleGenerateAnalysis(userQuery);
              setUserQuery('');
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask Copilot (e.g. why is Mobile stockout in 8 days?)"
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-900"
            />
            <button
              type="submit"
              disabled={loading || !userQuery.trim()}
              className="p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
