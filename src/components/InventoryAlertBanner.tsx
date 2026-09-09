import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  PackageCheck,
  ShieldAlert,
  ShoppingCart,
  TrendingDown,
} from 'lucide-react';
import { ProductForecast } from '../types';

interface InventoryAlertBannerProps {
  products: ProductForecast[];
  onOrderClick: (product: ProductForecast) => void;
  onNavigateToInventory: () => void;
}

export const InventoryAlertBanner: React.FC<InventoryAlertBannerProps> = ({
  products,
  onOrderClick,
  onNavigateToInventory,
}) => {
  // Find Mobile or any critical product
  const criticalProduct = products.find(
    (p) => p.name === 'Mobile' || p.stockoutRisk === 'CRITICAL'
  ) || products[0];

  const hasCriticalRisk = criticalProduct.daysOfSupply <= 10;

  return (
    <div className="mb-6">
      {hasCriticalRisk ? (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
          {/* Subtle accent bar on top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 animate-pulse" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Automated Inventory Recommendation
                  </span>
                  <span className="text-xs text-amber-800/80 font-medium">
                    Burn rate: {criticalProduct.dailyRunRate.toFixed(1)} units/day
                  </span>
                </div>

                {/* EXACT USER PROMPT TEXT */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center flex-wrap gap-2">
                  <span>⚠️ {criticalProduct.name} stock may run out in <span className="text-amber-900 underline decoration-amber-400 decoration-2 font-black">{criticalProduct.daysOfSupply} days</span>.</span>
                </h2>

                <p className="text-sm text-slate-700 mt-1">
                  Predicted monthly demand is <strong className="font-semibold text-slate-900">{criticalProduct.predictedDemand} units</strong> against current on-hand warehouse stock of <strong className="font-semibold text-slate-900">{criticalProduct.currentStock} units</strong>. Lead time to restock is {criticalProduct.leadTimeDays} days.
                </p>
              </div>
            </div>

            {/* Recommendation & Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-stretch lg:self-center shrink-0 border-t lg:border-t-0 border-amber-200/80 pt-3 lg:pt-0">
              <div className="bg-white/80 border border-amber-200 rounded-lg px-3.5 py-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Recommended Order
                </div>
                <div className="text-xl font-black text-slate-900 flex items-baseline gap-1">
                  {criticalProduct.recommendedOrder} <span className="text-xs font-medium text-slate-600">units</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onOrderClick(criticalProduct)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span>Place PO ({criticalProduct.recommendedOrder} units)</span>
                </button>

                <button
                  onClick={onNavigateToInventory}
                  title="View all 5 products inventory status"
                  className="hidden sm:inline-flex items-center justify-center p-2.5 rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-900">
              All 5 product inventories are operating above safety stock thresholds.
            </p>
          </div>
          <button
            onClick={onNavigateToInventory}
            className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
          >
            Review inventory buffer
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
