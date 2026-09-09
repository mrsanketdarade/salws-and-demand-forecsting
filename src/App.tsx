import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { InventoryAlertBanner } from './components/InventoryAlertBanner';
import { ForecastOverview } from './components/ForecastOverview';
import { InventoryReorderView } from './components/InventoryReorderView';
import { ModelComparisonLab } from './components/ModelComparisonLab';
import { FeatureEngineeringView } from './components/FeatureEngineeringView';
import { SqlStudio } from './components/SqlStudio';
import { OrderModal } from './components/OrderModal';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import {
  INITIAL_PRODUCTS,
  MODEL_METRICS_LIST,
  INITIAL_PURCHASE_ORDERS,
  generateHistoricalSales,
} from './data/mockData';
import { ProductForecast, ModelType, PurchaseOrder } from './types';
import { SqlEngine } from './utils/sqlEngine';
import { calculateStockoutMetrics } from './utils/forecastEngine';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<ProductForecast[]>(INITIAL_PRODUCTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [models] = useState(MODEL_METRICS_LIST);
  const [selectedModel, setSelectedModel] = useState<ModelType>('Ensemble');
  const [activeTab, setActiveTab] = useState<string>('forecast');
  const [orderModalProduct, setOrderModalProduct] = useState<ProductForecast | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize historical sales & SQL engine
  const historicalSales = useMemo(() => generateHistoricalSales(), []);
  const sqlEngine = useMemo(
    () => new SqlEngine(historicalSales, products, models),
    [historicalSales, products, models]
  );

  // Total predicted units across all 5 SKUs
  const totalPredictedUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + p.predictedDemand, 0); // 1,730
  }, [products]);

  // Count of products at critical stockout risk (<= 10 days)
  const criticalAlertCount = useMemo(() => {
    return products.filter((p) => p.stockoutRisk === 'CRITICAL').length;
  }, [products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenOrderModal = (product: ProductForecast) => {
    setOrderModalProduct(product);
  };

  const handleCloseOrderModal = () => {
    setOrderModalProduct(null);
  };

  const handleSubmitOrder = (order: PurchaseOrder) => {
    // Add PO to purchase orders list
    setPurchaseOrders((prev) => [order, ...prev]);

    // Update product inventory & stockout metrics
    setProducts((prev) =>
      prev.map((p) => {
        if (p.name === order.productName) {
          const updatedStock = p.currentStock + order.quantity;
          const recalculated = calculateStockoutMetrics(
            updatedStock,
            p.predictedDemand,
            p.leadTimeDays,
            p.safetyStock
          );
          return {
            ...p,
            currentStock: updatedStock,
            ...recalculated,
          };
        }
        return p;
      })
    );

    handleCloseOrderModal();
    showToast(`Purchase order ${order.id} for ${order.quantity} units of ${order.productName} authorized successfully!`);
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const recalculated = calculateStockoutMetrics(
            newStock,
            p.predictedDemand,
            p.leadTimeDays,
            p.safetyStock
          );
          return {
            ...p,
            currentStock: newStock,
            ...recalculated,
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        criticalAlertCount={criticalAlertCount}
        totalPredictedUnits={totalPredictedUnits}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Prominent Inventory Alert Banner (always visible or in forecast/inventory tab) */}
        {activeTab !== 'inventory' && (
          <InventoryAlertBanner
            products={products}
            onOrderClick={handleOpenOrderModal}
            onNavigateToInventory={() => setActiveTab('inventory')}
          />
        )}

        {/* Tab Content Panels */}
        {activeTab === 'forecast' && (
          <ForecastOverview
            products={products}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onOrderClick={handleOpenOrderModal}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryReorderView
            products={products}
            purchaseOrders={purchaseOrders}
            onOrderClick={handleOpenOrderModal}
            onUpdateProductStock={handleUpdateProductStock}
          />
        )}

        {activeTab === 'models' && (
          <ModelComparisonLab
            models={models}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        )}

        {activeTab === 'features' && <FeatureEngineeringView />}

        {activeTab === 'sql' && <SqlStudio sqlEngine={sqlEngine} />}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Sales & Demand Forecasting Engine • Data Science + Business Analytics System
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            ARIMA • Prophet • XGBoost • Random Forest • SQL Historical Store
          </p>
        </div>
      </footer>

      {/* Purchase Order Modal */}
      <OrderModal
        product={orderModalProduct}
        onClose={handleCloseOrderModal}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* AI Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        products={products}
        selectedModel={selectedModel}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
