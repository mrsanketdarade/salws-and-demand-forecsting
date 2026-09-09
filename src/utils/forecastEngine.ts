import {
  ProductName,
  ProductForecast,
  TimeSeriesDataPoint,
  ModelType,
} from '../types';

export function calculateStockoutMetrics(
  currentStock: number,
  predictedDemand: number,
  leadTimeDays: number,
  safetyStock: number
): {
  dailyRunRate: number;
  daysOfSupply: number;
  reorderPoint: number;
  recommendedOrder: number;
  stockoutRisk: 'CRITICAL' | 'WARNING' | 'HEALTHY';
} {
  const dailyRunRate = predictedDemand / 30.0;
  const daysOfSupply = Math.max(0, Math.round((currentStock / dailyRunRate) * 10) / 10);
  const reorderPoint = Math.round(dailyRunRate * leadTimeDays + safetyStock);

  // Recommended replenishment: brings inventory up to 30 days coverage + safety buffer
  const targetStock = Math.round(dailyRunRate * 30 + safetyStock);
  const recommendedOrder = Math.max(0, targetStock - currentStock);

  let stockoutRisk: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
  if (daysOfSupply <= 10) {
    stockoutRisk = 'CRITICAL';
  } else if (daysOfSupply <= 16) {
    stockoutRisk = 'WARNING';
  }

  return {
    dailyRunRate: Math.round(dailyRunRate * 100) / 100,
    daysOfSupply,
    reorderPoint,
    recommendedOrder,
    stockoutRisk,
  };
}

// Generates weekly time series curve with historical data (months Jan-Aug) and next month forecast (Sep 2026)
export function generateTimeSeriesChartData(
  selectedProduct: ProductName | 'ALL',
  products: ProductForecast[],
  selectedModel: ModelType = 'Ensemble'
): TimeSeriesDataPoint[] {
  const months = [
    { label: 'Jan 26', historicalMult: 0.91, noise: -0.04 },
    { label: 'Feb 26', historicalMult: 0.88, noise: 0.02 },
    { label: 'Mar 26', historicalMult: 0.94, noise: -0.01 },
    { label: 'Apr 26', historicalMult: 0.96, noise: 0.03 },
    { label: 'May 26', historicalMult: 0.98, noise: -0.02 },
    { label: 'Jun 26', historicalMult: 1.02, noise: 0.01 },
    { label: 'Jul 26', historicalMult: 1.05, noise: 0.04 },
    { label: 'Aug 26', historicalMult: 1.08, noise: -0.02 },
  ];

  // Base predicted next month target for the chosen SKU (or sum for ALL)
  let targetForecast = 0;
  if (selectedProduct === 'ALL') {
    targetForecast = products.reduce((acc, p) => acc + p.predictedDemand, 0); // 1,730
  } else {
    const prod = products.find((p) => p.name === selectedProduct);
    targetForecast = prod ? prod.predictedDemand : 240;
  }

  const historyPoints: TimeSeriesDataPoint[] = months.map((m, idx) => {
    // Generate organic historical actual curve leading smoothly up to forecast
    const baseline = targetForecast * (0.84 + (idx / 8) * 0.16);
    const actual = Math.round(baseline * m.historicalMult + targetForecast * m.noise);

    return {
      date: `2026-0${idx + 1}-01`,
      formattedDate: m.label,
      isHistorical: true,
      actual,
    };
  });

  // Next Month (Sep 2026) - The forecasted horizon
  // Model specific variances around targetForecast
  const modelVariances: Record<ModelType, number> = {
    Ensemble: 1.0, // Exact target: e.g. 580 for Mobile, 240 for Laptop, etc.
    XGBoost: 1.018,
    Prophet: 0.985,
    'Random Forest': 1.032,
    ARIMA: 0.965,
  };

  const arimaVal = Math.round(targetForecast * modelVariances.ARIMA);
  const prophetVal = Math.round(targetForecast * modelVariances.Prophet);
  const xgbVal = Math.round(targetForecast * modelVariances.XGBoost);
  const rfVal = Math.round(targetForecast * modelVariances['Random Forest']);
  const ensembleVal = targetForecast; // Ground truth target!

  // Active forecast based on user selected model
  const activeForecastVal =
    selectedModel === 'ARIMA'
      ? arimaVal
      : selectedModel === 'Prophet'
      ? prophetVal
      : selectedModel === 'XGBoost'
      ? xgbVal
      : selectedModel === 'Random Forest'
      ? rfVal
      : ensembleVal;

  const forecastPoint: TimeSeriesDataPoint = {
    date: '2026-09-01',
    formattedDate: 'Sep 26 (Forecast)',
    isHistorical: false,
    forecast: activeForecastVal,
    lowerBound: Math.round(activeForecastVal * 0.91),
    upperBound: Math.round(activeForecastVal * 1.09),
    arima: arimaVal,
    prophet: prophetVal,
    xgboost: xgbVal,
    rf: rfVal,
  };

  // Also include Oct & Nov 2026 projected horizons for forward projection view
  const octPoint: TimeSeriesDataPoint = {
    date: '2026-10-01',
    formattedDate: 'Oct 26 (Proj.)',
    isHistorical: false,
    forecast: Math.round(activeForecastVal * 1.06),
    lowerBound: Math.round(activeForecastVal * 1.06 * 0.88),
    upperBound: Math.round(activeForecastVal * 1.06 * 1.13),
    arima: Math.round(arimaVal * 1.04),
    prophet: Math.round(prophetVal * 1.05),
    xgboost: Math.round(xgbVal * 1.07),
    rf: Math.round(rfVal * 1.06),
  };

  const novPoint: TimeSeriesDataPoint = {
    date: '2026-11-01',
    formattedDate: 'Nov 26 (Holiday)',
    isHistorical: false,
    forecast: Math.round(activeForecastVal * 1.28), // Holiday peak
    lowerBound: Math.round(activeForecastVal * 1.28 * 0.85),
    upperBound: Math.round(activeForecastVal * 1.28 * 1.16),
    arima: Math.round(arimaVal * 1.22),
    prophet: Math.round(prophetVal * 1.31),
    xgboost: Math.round(xgbVal * 1.30),
    rf: Math.round(rfVal * 1.25),
  };

  return [...historyPoints, forecastPoint, octPoint, novPoint];
}

// Decomposition of time series components: Trend, Seasonality, Residuals
export interface DecompositionComponent {
  period: string;
  observed: number;
  trend: number;
  seasonal: number;
  residual: number;
}

export function generateDecompositionData(baseDemand: number): DecompositionComponent[] {
  const periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep (Fcst)'];
  return periods.map((period, idx) => {
    const trend = Math.round(baseDemand * (0.85 + (idx / periods.length) * 0.22));
    const seasonal = Math.round(baseDemand * (Math.sin((idx / 12) * Math.PI * 2) * 0.12));
    const residual = Math.round((Math.cos(idx * 2) * 0.04) * baseDemand);
    const observed = trend + seasonal + residual;

    return {
      period,
      observed,
      trend,
      seasonal,
      residual,
    };
  });
}
