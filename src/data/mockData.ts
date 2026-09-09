import {
  ProductForecast,
  ModelMetrics,
  HistoricalSaleRecord,
  FeatureImportanceItem,
  PurchaseOrder,
} from '../types';

export const INITIAL_PRODUCTS: ProductForecast[] = [
  {
    id: 'prod-mobile',
    name: 'Mobile',
    category: 'Electronics / Cellular',
    unitPrice: 799,
    unitCost: 480,
    currentStock: 155, // 155 units / (580/30 = 19.33/day) = 8.01 days!
    predictedDemand: 580, // EXACT PROMPT REQUIREMENT
    dailyRunRate: 19.33,
    daysOfSupply: 8, // EXACT PROMPT REQUIREMENT
    safetyStock: 120,
    reorderPoint: 215,
    recommendedOrder: 250, // EXACT PROMPT REQUIREMENT: "Recommended order: 250 units"
    stockoutRisk: 'CRITICAL',
    historicalAvgMonthly: 540,
    trendMoM: 7.4,
    leadTimeDays: 5,
  },
  {
    id: 'prod-laptop',
    name: 'Laptop',
    category: 'Computers / Workstations',
    unitPrice: 1299,
    unitCost: 820,
    currentStock: 190,
    predictedDemand: 240, // EXACT PROMPT REQUIREMENT
    dailyRunRate: 8.0,
    daysOfSupply: 24,
    safetyStock: 60,
    reorderPoint: 100,
    recommendedOrder: 110,
    stockoutRisk: 'HEALTHY',
    historicalAvgMonthly: 230,
    trendMoM: 4.3,
    leadTimeDays: 7,
  },
  {
    id: 'prod-keyboard',
    name: 'Keyboard',
    category: 'Peripherals / Input',
    unitPrice: 89,
    unitCost: 42,
    currentStock: 140,
    predictedDemand: 320, // EXACT PROMPT REQUIREMENT
    dailyRunRate: 10.67,
    daysOfSupply: 13,
    safetyStock: 80,
    reorderPoint: 135,
    recommendedOrder: 260,
    stockoutRisk: 'WARNING',
    historicalAvgMonthly: 305,
    trendMoM: 4.9,
    leadTimeDays: 4,
  },
  {
    id: 'prod-mouse',
    name: 'Mouse',
    category: 'Peripherals / Input',
    unitPrice: 49,
    unitCost: 21,
    currentStock: 350,
    predictedDemand: 410, // EXACT PROMPT REQUIREMENT
    dailyRunRate: 13.67,
    daysOfSupply: 26,
    safetyStock: 100,
    reorderPoint: 170,
    recommendedOrder: 160,
    stockoutRisk: 'HEALTHY',
    historicalAvgMonthly: 395,
    trendMoM: 3.8,
    leadTimeDays: 3,
  },
  {
    id: 'prod-monitor',
    name: 'Monitor',
    category: 'Displays / Visual',
    unitPrice: 349,
    unitCost: 195,
    currentStock: 120,
    predictedDemand: 180, // EXACT PROMPT REQUIREMENT
    dailyRunRate: 6.0,
    daysOfSupply: 20,
    safetyStock: 45,
    reorderPoint: 75,
    recommendedOrder: 105,
    stockoutRisk: 'HEALTHY',
    historicalAvgMonthly: 172,
    trendMoM: 4.6,
    leadTimeDays: 6,
  },
];

export const MODEL_METRICS_LIST: ModelMetrics[] = [
  {
    name: 'Ensemble',
    fullName: 'Weighted Multi-Model Ensemble (Optimized Blending)',
    description: 'Combines ARIMA, Prophet, Random Forest, and XGBoost using inverse variance loss weights to minimize generalisation error.',
    mae: 8.4,
    rmse: 11.2,
    mape: 3.2,
    r2: 0.962,
    trainingTimeMs: 420,
    hyperparameters: {
      'Weights': 'XGB (35%), Prophet (25%), RF (25%), ARIMA (15%)',
      'Loss Function': 'Huber Loss (delta=1.0)',
      'Cross-Validation': 'Time-Series Rolling 5-Fold',
    },
    strengths: [
      'Highest overall accuracy across all 5 SKU profiles',
      'Robust against single-model bias and localized demand shifts',
      'Smooths extreme trend outliers without lagging transitions',
    ],
  },
  {
    name: 'XGBoost',
    fullName: 'Extreme Gradient Boosting Regressor (Tree-based)',
    description: 'Gradient-boosted decision trees optimizing second-order Taylor expansion loss with L1/L2 regularization.',
    mae: 9.8,
    rmse: 13.1,
    mape: 3.8,
    r2: 0.948,
    trainingTimeMs: 180,
    hyperparameters: {
      'n_estimators': 250,
      'learning_rate': 0.05,
      'max_depth': 4,
      'subsample': 0.85,
      'colsample_bytree': 0.8,
    },
    strengths: [
      'Excels at non-linear interactions (e.g. promo discount × holiday weekend)',
      'High sample efficiency with fast inference',
      'Native handling of missing feature values and tabular structures',
    ],
  },
  {
    name: 'Prophet',
    fullName: 'Facebook Prophet (Decomposable Additive Model)',
    description: 'Bayesian curve fitting combining piecewise linear growth, weekly and yearly Fourier seasonality, and holiday regressors.',
    mae: 10.9,
    rmse: 14.6,
    mape: 4.2,
    r2: 0.935,
    trainingTimeMs: 290,
    hyperparameters: {
      'growth': 'linear',
      'changepoint_prior_scale': 0.05,
      'seasonality_mode': 'multiplicative',
      'fourier_order_weekly': 3,
      'fourier_order_yearly': 10,
    },
    strengths: [
      'Accurate handling of irregular calendar holidays and payday cycles',
      'Provides interpretable additive trend, seasonal, and holiday components',
      'Automatic changepoint detection for demand shifts',
    ],
  },
  {
    name: 'Random Forest',
    fullName: 'Random Forest Regressor (Bagged Decision Trees)',
    description: 'Ensemble of 120 randomized decision trees with bootstrap aggregation to reduce variance and capture feature splits.',
    mae: 12.2,
    rmse: 16.4,
    mape: 4.9,
    r2: 0.921,
    trainingTimeMs: 140,
    hyperparameters: {
      'n_estimators': 120,
      'max_features': 'sqrt',
      'min_samples_split': 5,
      'bootstrap': 'True',
    },
    strengths: [
      'Very stable predictions with low risk of catastrophic overfitting',
      'Outputs natural feature importance scores via Mean Decrease in Impurity',
      'Non-parametric flexibility without requiring stationarity transforms',
    ],
  },
  {
    name: 'ARIMA',
    fullName: 'AutoRegressive Integrated Moving Average (ARIMA 2,1,1)',
    description: 'Classical parametric time-series model utilizing differencing for stationarity, auto-regressive lags, and moving average errors.',
    mae: 15.6,
    rmse: 20.8,
    mape: 6.1,
    r2: 0.884,
    trainingTimeMs: 45,
    hyperparameters: {
      'order': '(p=2, d=1, q=1)',
      'seasonal_order': '(P=1, D=1, Q=1, s=12)',
      'aic': 312.4,
      'stationarity_test': 'ADF p-val < 0.001',
    },
    strengths: [
      'Highly theoretical foundation for purely univariate temporal autocorrelation',
      'Extremely fast compute with zero heavy tensor overhead',
      'Reliable baseline benchmark for time-series diagnostics',
    ],
  },
];

export const FEATURE_IMPORTANCE_DATA: FeatureImportanceItem[] = [
  {
    feature: 'Lag_7_Sales',
    importance: 0.28,
    category: 'Lag',
    description: 'Sales quantity exactly 7 days prior (captures weekly periodicity)',
  },
  {
    feature: 'Rolling_Mean_30d',
    importance: 0.21,
    category: 'Rolling Window',
    description: '30-day moving average demand (underlying baseline velocity)',
  },
  {
    feature: 'Promo_Discount_Pct',
    importance: 0.16,
    category: 'Promotion',
    description: 'Active discount percentage and marketing campaign status',
  },
  {
    feature: 'Lag_1_Sales',
    importance: 0.12,
    category: 'Lag',
    description: 'Prior day sales volume (short-term momentum)',
  },
  {
    feature: 'Day_Of_Week',
    importance: 0.09,
    category: 'Calendar',
    description: 'Day of week index (Monday to Sunday shopping patterns)',
  },
  {
    feature: 'Holiday_Event_Flag',
    importance: 0.07,
    category: 'Calendar',
    description: 'Binary flag for major retail holidays (Black Friday, Cyber Week, etc.)',
  },
  {
    feature: 'Rolling_Std_14d',
    importance: 0.04,
    category: 'Rolling Window',
    description: '14-day rolling demand volatility (risk spread)',
  },
  {
    feature: 'Consumer_Sentiment_Index',
    importance: 0.03,
    category: 'Economic',
    description: 'Macro-economic tech sector consumer spending confidence index',
  },
];

// Generate 12 months of historical sales records for SQL queries & time-series analysis
export function generateHistoricalSales(): HistoricalSaleRecord[] {
  const records: HistoricalSaleRecord[] = [];
  const products = [
    { name: 'Mobile' as const, category: 'Electronics', price: 799, baseMonthly: 540 },
    { name: 'Laptop' as const, category: 'Computers', price: 1299, baseMonthly: 230 },
    { name: 'Keyboard' as const, category: 'Peripherals', price: 89, baseMonthly: 305 },
    { name: 'Mouse' as const, category: 'Peripherals', price: 49, baseMonthly: 395 },
    { name: 'Monitor' as const, category: 'Displays', price: 349, baseMonthly: 172 },
  ];

  let idCounter = 1;
  const now = new Date('2026-09-01');

  // Generate 52 weekly records across the last 12 months
  for (let w = 52; w >= 1; w--) {
    const d = new Date(now);
    d.setDate(d.getDate() - w * 7);
    const dateStr = d.toISOString().split('T')[0];
    const month = d.getMonth();
    const isHolidaySeason = month === 10 || month === 11; // Nov, Dec

    products.forEach((prod) => {
      // Seasonal factor + growth trend
      const trendMultiplier = 1 + (52 - w) * 0.002;
      const seasonalMultiplier = isHolidaySeason ? 1.35 : (month === 7 || month === 8 ? 1.15 : 1.0);
      const isPromo = w % 6 === 0;
      const promoMultiplier = isPromo ? 1.25 : 1.0;
      const noise = 0.92 + Math.sin(w * 0.5 + prod.name.length) * 0.12;

      const weeklyBase = (prod.baseMonthly / 4.3);
      const units = Math.max(12, Math.round(weeklyBase * trendMultiplier * seasonalMultiplier * promoMultiplier * noise));
      const revenue = units * prod.price;

      records.push({
        id: idCounter++,
        date: dateStr,
        product_name: prod.name,
        category: prod.category,
        units_sold: units,
        unit_price: prod.price,
        revenue,
        promo_active: isPromo ? 1 : 0,
        holiday_season: isHolidaySeason ? 1 : 0,
        sales_channel: (w % 3 === 0 ? 'B2B' : (w % 2 === 0 ? 'Online' : 'Retail Store')),
      });
    });
  }

  return records;
}

export const PREBUILT_SQL_QUERIES = [
  {
    title: 'Historical Demand & Revenue by SKU',
    description: 'Aggregates total units sold, cumulative revenue, and average weekly velocity for all 5 products.',
    sql: `SELECT 
  product_name,
  category,
  SUM(units_sold) AS total_units_sold,
  SUM(revenue) AS total_revenue_usd,
  ROUND(AVG(units_sold), 1) AS avg_weekly_units,
  ROUND(AVG(unit_price), 2) AS avg_price
FROM historical_sales
GROUP BY product_name, category
ORDER BY total_revenue_usd DESC;`,
  },
  {
    title: 'Inventory Coverage & Stockout Days',
    description: 'Calculates daily burn rate and estimated days until inventory depletion based on current stock.',
    sql: `SELECT 
  product_name,
  current_stock,
  predicted_demand,
  ROUND(predicted_demand / 30.0, 2) AS daily_run_rate,
  ROUND(current_stock / (predicted_demand / 30.0), 1) AS days_of_supply,
  recommended_order,
  stockout_risk
FROM inventory_status
ORDER BY days_of_supply ASC;`,
  },
  {
    title: 'Promotional Uplift Analysis (Elasticity)',
    description: 'Compares average sales velocity during marketing campaigns versus standard baseline periods.',
    sql: `SELECT 
  product_name,
  promo_active,
  COUNT(*) AS weeks_count,
  ROUND(AVG(units_sold), 1) AS avg_units_per_week,
  SUM(revenue) AS period_revenue
FROM historical_sales
GROUP BY product_name, promo_active
ORDER BY product_name, promo_active DESC;`,
  },
  {
    title: 'Monthly Demand Progression & Seasonality',
    description: 'Aggregates sales by calendar month to inspect seasonal holiday surges and trajectory.',
    sql: `SELECT 
  SUBSTR(date, 1, 7) AS sales_month,
  SUM(units_sold) AS aggregate_units,
  SUM(revenue) AS monthly_revenue
FROM historical_sales
GROUP BY sales_month
ORDER BY sales_month ASC;`,
  },
  {
    title: 'High-Velocity Outage Alert (Mobile & Critical SKUs)',
    description: 'Identifies inventory lines where days of supply is lower than replenishment lead time plus safety margin.',
    sql: `SELECT 
  product_name,
  current_stock,
  days_of_supply,
  lead_time_days,
  recommended_order,
  'CRITICAL REORDER REQUIRED' AS procurement_action
FROM inventory_status
WHERE days_of_supply <= 10;`,
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-2026-0881',
    createdAt: '2026-09-02',
    productName: 'Laptop',
    quantity: 100,
    estimatedArrivalDays: 7,
    supplier: 'Apex Tech Electronics Ltd.',
    totalCost: 82000,
    status: 'In Transit',
  },
  {
    id: 'PO-2026-0842',
    createdAt: '2026-08-28',
    productName: 'Keyboard',
    quantity: 150,
    estimatedArrivalDays: 2,
    supplier: 'SwitchWorks Components',
    totalCost: 6300,
    status: 'In Transit',
  },
];
