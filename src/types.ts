export type ProductName = 'Laptop' | 'Mobile' | 'Keyboard' | 'Mouse' | 'Monitor';

export interface ProductForecast {
  id: string;
  name: ProductName;
  category: string;
  unitPrice: number;
  currentStock: number;
  predictedDemand: number; // Next month predicted units
  dailyRunRate: number; // units / day
  daysOfSupply: number; // currentStock / dailyRunRate
  safetyStock: number;
  reorderPoint: number;
  recommendedOrder: number;
  unitCost: number;
  stockoutRisk: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  historicalAvgMonthly: number;
  trendMoM: number; // Month-over-month growth %
  leadTimeDays: number;
}

export type ModelType = 'Ensemble' | 'ARIMA' | 'Prophet' | 'XGBoost' | 'Random Forest';

export interface ModelMetrics {
  name: ModelType;
  fullName: string;
  description: string;
  mae: number;
  rmse: number;
  mape: number; // %
  r2: number;
  trainingTimeMs: number;
  hyperparameters: Record<string, string | number>;
  strengths: string[];
}

export interface HistoricalSaleRecord {
  id: number;
  date: string;
  product_name: ProductName;
  category: string;
  units_sold: number;
  unit_price: number;
  revenue: number;
  promo_active: boolean | number;
  holiday_season: boolean | number;
  sales_channel: 'Online' | 'B2B' | 'Retail Store';
}

export interface TimeSeriesDataPoint {
  date: string;
  formattedDate: string;
  isHistorical: boolean;
  actual?: number;
  forecast?: number;
  lowerBound?: number;
  upperBound?: number;
  arima?: number;
  prophet?: number;
  xgboost?: number;
  rf?: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number; // 0 to 1
  category: 'Lag' | 'Rolling Window' | 'Calendar' | 'Promotion' | 'Economic';
  description: string;
}

export interface PurchaseOrder {
  id: string;
  createdAt: string;
  productName: ProductName;
  quantity: number;
  estimatedArrivalDays: number;
  supplier: string;
  totalCost: number;
  status: 'Draft' | 'Submitted' | 'In Transit' | 'Received';
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowCount: number;
  error?: string;
}
