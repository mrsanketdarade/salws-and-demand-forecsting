import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  DollarSign,
  Package,
} from 'lucide-react';
import { ProductForecast, PurchaseOrder } from '../types';

interface OrderModalProps {
  product: ProductForecast | null;
  onClose: () => void;
  onSubmitOrder: (order: PurchaseOrder) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  onClose,
  onSubmitOrder,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState<number>(product.recommendedOrder || 250);
  const [supplier, setSupplier] = useState<string>(
    product.name === 'Mobile'
      ? 'Qualcomm & Foxconn Supply Link'
      : product.name === 'Laptop'
      ? 'Apex Tech Electronics Ltd.'
      : 'Global Component Logistics'
  );
  const [priority, setPriority] = useState<'Standard' | 'Expedited'>('Expedited');

  const unitCost = product.unitCost;
  const totalCost = quantity * unitCost;

  // New days of supply calculation
  const newDaysOfSupply = Math.round(
    ((product.currentStock + quantity) / product.dailyRunRate) * 10
  ) / 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPo: PurchaseOrder = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      productName: product.name,
      quantity,
      estimatedArrivalDays: priority === 'Expedited' ? Math.max(2, product.leadTimeDays - 2) : product.leadTimeDays,
      supplier,
      totalCost,
      status: 'Submitted',
    };
    onSubmitOrder(newPo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Purchase Order Authorization</h3>
              <p className="text-xs text-slate-400">Restock procurement order for {product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* Status Callout */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <strong>Stock Alert:</strong> Current supply lasts only{' '}
              <strong>{product.daysOfSupply} days</strong>. Placing this order of{' '}
              <strong>{quantity} units</strong> raises warehouse coverage to{' '}
              <strong className="text-emerald-700">{newDaysOfSupply} days</strong>.
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Order Quantity (Units)
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                step="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-bold text-slate-900"
              />
              <span className="text-[11px] text-slate-500">
                Recommended replenishment volume: {product.recommendedOrder} units
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shipping Speed
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                >
                  <option value="Expedited">Expedited (3-5 Days)</option>
                  <option value="Standard">Standard Freight (7-10 Days)</option>
                </select>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Unit Cost:</span>
                <span className="font-semibold text-slate-800">${unitCost} / unit</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Volume:</span>
                <span className="font-semibold text-slate-800">{quantity} units</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-200 text-sm">
                <span>Total Purchase Commitment:</span>
                <span className="text-emerald-700 font-black">${totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Authorize & Transmit PO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
