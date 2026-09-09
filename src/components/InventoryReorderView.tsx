import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  Boxes,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { ProductForecast, PurchaseOrder } from '../types';
import { calculateStockoutMetrics } from '../utils/forecastEngine';

interface InventoryReorderViewProps {
  products: ProductForecast[];
  purchaseOrders: PurchaseOrder[];
  onOrderClick: (product: ProductForecast) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
}

export const InventoryReorderView: React.FC<InventoryReorderViewProps> = ({
  products,
  purchaseOrders,
  onOrderClick,
  onUpdateProductStock,
}) => {
  const [editingProduct, setEditingProduct] = useState<ProductForecast | null>(null);
  const [simulatedStock, setSimulatedStock] = useState<number>(155);
  const [simulatedDemand, setSimulatedDemand] = useState<number>(580);
  const [simulatedLeadTime, setSimulatedLeadTime] = useState<number>(5);

  const mobileProduct = products.find((p) => p.name === 'Mobile') || products[0];

  // Simulation calculations
  const simMetrics = calculateStockoutMetrics(
    simulatedStock,
    simulatedDemand,
    simulatedLeadTime,
    mobileProduct.safetyStock
  );

  return (
    <div className="space-y-6">
      {/* Critical Stockout Recommendation Highlight */}
      <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-700" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-950 mb-1.5 uppercase tracking-wider">
                Automated Inventory Depletion Trigger
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ⚠️ Mobile stock may run out in <span className="underline decoration-amber-500 decoration-3 text-amber-950">8 days</span>.
              </h2>
              <p className="text-sm text-slate-700 mt-1 max-w-2xl">
                Current warehouse stock is <strong>{mobileProduct.currentStock} units</strong>. With next month forecast at <strong>{mobileProduct.predictedDemand} units</strong> (~19.3 units/day) and a supplier lead time of {mobileProduct.leadTimeDays} days, replenishment must be triggered immediately to prevent inventory stockout.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-amber-200 p-4 shrink-0 flex flex-col items-center sm:items-end justify-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recommended Order
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              250 <span className="text-sm font-semibold text-slate-600">units</span>
            </div>
            <button
              onClick={() => onOrderClick(mobileProduct)}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Create Purchase Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Inventory Health Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Multi-Product Inventory Run-Rate & Reorder Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous monitoring of Days-of-Supply, Safety Stock, Reorder Points, and PO triggers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              &le; 10d: Critical
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-orange-800 border border-orange-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              11-16d: Warning
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              &gt; 16d: Healthy
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Predicted Demand</th>
                <th className="py-3 px-4">Daily Burn Rate</th>
                <th className="py-3 px-4">Days of Supply</th>
                <th className="py-3 px-4">Safety Stock</th>
                <th className="py-3 px-4">Reorder Point (ROP)</th>
                <th className="py-3 px-4">Recommended Order</th>
                <th className="py-3 px-4 text-right">Procurement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((prod) => {
                const isCritical = prod.stockoutRisk === 'CRITICAL';
                const isWarning = prod.stockoutRisk === 'WARNING';

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCritical ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{prod.name}</span>
                        {isCritical && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                            8-Day Runout
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {prod.currentStock} units
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {prod.predictedDemand} units
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {prod.dailyRunRate.toFixed(1)} / day
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          isCritical
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isWarning
                            ? 'bg-orange-100 text-orange-900 border border-orange-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {prod.daysOfSupply} days
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {prod.safetyStock} units
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {prod.reorderPoint} units
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {prod.recommendedOrder > 0 ? (
                        <span className="text-amber-800 font-black">
                          {prod.recommendedOrder} units
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Optimal</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOrderClick(prod)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isCritical
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Order {prod.recommendedOrder}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Inventory Stress-Test & Replenishment Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator controls */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Interactive Stockout & Reorder Simulator (Mobile SKU)
              </h4>
              <p className="text-xs text-slate-500">
                Adjust warehouse parameters to observe how daily run rate and lead time alter the 8-day stockout threshold.
              </p>
            </div>
            <button
              onClick={() => {
                setSimulatedStock(155);
                setSimulatedDemand(580);
                setSimulatedLeadTime(5);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Slider 1: Current Warehouse Stock */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Current Stock:</span>
                <span className="font-bold text-slate-900">{simulatedStock} units</span>
              </div>
              <input
                type="range"
                min="50"
                max="600"
                step="5"
                value={simulatedStock}
                onChange={(e) => setSimulatedStock(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Baseline: 155 units</span>
            </div>

            {/* Slider 2: Predicted Next Month Demand */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Predicted Demand:</span>
                <span className="font-bold text-slate-900">{simulatedDemand} units</span>
              </div>
              <input
                type="range"
                min="200"
                max="900"
                step="10"
                value={simulatedDemand}
                onChange={(e) => setSimulatedDemand(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Baseline: 580 units</span>
            </div>

            {/* Slider 3: Supplier Lead Time */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Supplier Lead Time:</span>
                <span className="font-bold text-slate-900">{simulatedLeadTime} days</span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                step="1"
                value={simulatedLeadTime}
                onChange={(e) => setSimulatedLeadTime(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Baseline: 5 days</span>
            </div>
          </div>

          {/* Simulation Output Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Daily Burn Rate
              </span>
              <div className="text-lg font-bold text-slate-900">
                {simMetrics.dailyRunRate} <span className="text-xs font-normal">u/day</span>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                simMetrics.stockoutRisk === 'CRITICAL'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-slate-50 border-transparent'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Days of Supply
              </span>
              <div
                className={`text-lg font-black ${
                  simMetrics.stockoutRisk === 'CRITICAL' ? 'text-amber-900' : 'text-slate-900'
                }`}
              >
                {simMetrics.daysOfSupply} days
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Reorder Point (ROP)
              </span>
              <div className="text-lg font-bold text-slate-900">
                {simMetrics.reorderPoint} units
              </div>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-lg">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                Recommended PO
              </span>
              <div className="text-lg font-black text-emerald-400">
                {simMetrics.recommendedOrder} units
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Orders Activity & In-Transit buffer */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-700" />
              Active Purchase Orders
            </h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {purchaseOrders.length} Open
            </span>
          </div>

          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors text-xs"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-900">{po.id}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {po.status}
                  </span>
                </div>
                <div className="text-slate-700 font-medium">
                  {po.quantity} units of <strong>{po.productName}</strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100">
                  <span>Supplier: {po.supplier}</span>
                  <span>ETA: ~{po.estimatedArrivalDays}d</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onOrderClick(mobileProduct)}
              className="w-full text-xs font-bold py-2 rounded-lg text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              + Create Custom Purchase Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
