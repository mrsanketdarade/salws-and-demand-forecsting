import { SqlQueryResult, ProductForecast, HistoricalSaleRecord, ModelMetrics } from '../types';

export class SqlEngine {
  private tables: Record<string, Record<string, any>[]> = {};

  constructor(
    historicalSales: HistoricalSaleRecord[],
    products: ProductForecast[],
    models: ModelMetrics[]
  ) {
    this.initTables(historicalSales, products, models);
  }

  public updateData(
    historicalSales: HistoricalSaleRecord[],
    products: ProductForecast[],
    models: ModelMetrics[]
  ) {
    this.initTables(historicalSales, products, models);
  }

  private initTables(
    historicalSales: HistoricalSaleRecord[],
    products: ProductForecast[],
    models: ModelMetrics[]
  ) {
    // 1. historical_sales table
    this.tables['historical_sales'] = historicalSales.map((r) => ({
      id: r.id,
      date: r.date,
      product_name: r.product_name,
      category: r.category,
      units_sold: r.units_sold,
      unit_price: r.unit_price,
      revenue: r.revenue,
      promo_active: r.promo_active ? 1 : 0,
      holiday_season: r.holiday_season ? 1 : 0,
      sales_channel: r.sales_channel,
    }));

    // 2. inventory_status table
    this.tables['inventory_status'] = products.map((p) => ({
      product_name: p.name,
      category: p.category,
      current_stock: p.currentStock,
      predicted_demand: p.predictedDemand,
      daily_run_rate: p.dailyRunRate,
      days_of_supply: p.daysOfSupply,
      safety_stock: p.safetyStock,
      reorder_point: p.reorderPoint,
      recommended_order: p.recommendedOrder,
      unit_price: p.unitPrice,
      unit_cost: p.unitCost,
      lead_time_days: p.leadTimeDays,
      stockout_risk: p.stockoutRisk,
    }));

    // 3. forecast_models table
    this.tables['forecast_models'] = models.map((m) => ({
      model_name: m.name,
      full_name: m.fullName,
      mae: m.mae,
      rmse: m.rmse,
      mape_pct: m.mape,
      r2_score: m.r2,
      training_time_ms: m.trainingTimeMs,
    }));
  }

  public getTableNames(): string[] {
    return Object.keys(this.tables);
  }

  public getTableSchema(tableName: string): { column: string; type: string }[] {
    const table = this.tables[tableName];
    if (!table || table.length === 0) return [];
    const firstRow = table[0];
    return Object.keys(firstRow).map((col) => {
      const val = firstRow[col];
      let type = 'TEXT';
      if (typeof val === 'number') {
        type = Number.isInteger(val) ? 'INTEGER' : 'REAL';
      } else if (typeof val === 'boolean') {
        type = 'BOOLEAN';
      }
      return { column: col, type };
    });
  }

  public execute(rawSql: string): SqlQueryResult {
    const startTime = performance.now();
    try {
      const cleaned = rawSql.trim().replace(/;$/, '');
      if (!cleaned.toUpperCase().startsWith('SELECT')) {
        return {
          columns: [],
          rows: [],
          executionTimeMs: Math.round((performance.now() - startTime) * 10) / 10,
          rowCount: 0,
          error: 'Only SELECT queries are permitted in the historical sales explorer.',
        };
      }

      // Regex matching basic SELECT ... FROM tableName ...
      const fromMatch = cleaned.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (!fromMatch) {
        return {
          columns: [],
          rows: [],
          executionTimeMs: Math.round((performance.now() - startTime) * 10) / 10,
          rowCount: 0,
          error: 'Missing or invalid FROM clause. Supported tables: historical_sales, inventory_status, forecast_models',
        };
      }

      const tableName = fromMatch[1].toLowerCase();
      const sourceData = this.tables[tableName];
      if (!sourceData) {
        return {
          columns: [],
          rows: [],
          executionTimeMs: Math.round((performance.now() - startTime) * 10) / 10,
          rowCount: 0,
          error: `Table '${tableName}' not found. Available tables: ${this.getTableNames().join(', ')}`,
        };
      }

      let data = [...sourceData];

      // Extract WHERE clause
      const whereMatch = cleaned.match(/WHERE\s+([\s\S]+?)(?=(GROUP\s+BY|ORDER\s+BY|LIMIT|$))/i);
      if (whereMatch) {
        const whereCond = whereMatch[1].trim();
        data = this.filterRows(data, whereCond);
      }

      // Extract GROUP BY
      const groupByMatch = cleaned.match(/GROUP\s+BY\s+([\s\S]+?)(?=(ORDER\s+BY|LIMIT|$))/i);
      let isGrouped = !!groupByMatch;
      let groupedKeys: string[] = [];
      if (groupByMatch) {
        groupedKeys = groupByMatch[1].split(',').map((k) => k.trim());
      }

      // Extract SELECT columns
      const selectPartMatch = cleaned.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
      const selectColumnsStr = selectPartMatch ? selectPartMatch[1].trim() : '*';

      let resultRows: Record<string, any>[] = [];

      if (isGrouped) {
        resultRows = this.processGroupBy(data, groupedKeys, selectColumnsStr);
      } else {
        resultRows = this.processSelect(data, selectColumnsStr);
      }

      // Extract ORDER BY
      const orderByMatch = cleaned.match(/ORDER\s+BY\s+([\s\S]+?)(?=(LIMIT|$))/i);
      if (orderByMatch) {
        const orderParts = orderByMatch[1].split(',').map((p) => p.trim());
        resultRows = this.sortRows(resultRows, orderParts);
      }

      // Extract LIMIT
      const limitMatch = cleaned.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1], 10);
        resultRows = resultRows.slice(0, limit);
      }

      const columns = resultRows.length > 0 ? Object.keys(resultRows[0]) : [];
      const executionTimeMs = Math.round((performance.now() - startTime) * 10) / 10;

      return {
        columns,
        rows: resultRows,
        executionTimeMs,
        rowCount: resultRows.length,
      };
    } catch (err: any) {
      return {
        columns: [],
        rows: [],
        executionTimeMs: Math.round((performance.now() - startTime) * 10) / 10,
        rowCount: 0,
        error: `Query error: ${err.message || String(err)}`,
      };
    }
  }

  private filterRows(rows: Record<string, any>[], conditionStr: string): Record<string, any>[] {
    // Basic evaluation for expressions like `days_of_supply <= 10` or `promo_active = 1` or `category = 'Electronics'`
    return rows.filter((row) => {
      try {
        // Replace known column identifiers with their row values
        let expr = conditionStr;

        // Support simple AND / OR
        const tokens = expr.split(/\s+(AND|OR)\s+/i);
        let result = true;
        let currentOp = 'AND';

        for (const token of tokens) {
          if (token.toUpperCase() === 'AND') {
            currentOp = 'AND';
            continue;
          }
          if (token.toUpperCase() === 'OR') {
            currentOp = 'OR';
            continue;
          }

          const evaluatedCond = this.evalSimpleComparison(row, token.trim());
          if (currentOp === 'AND') {
            result = result && evaluatedCond;
          } else {
            result = result || evaluatedCond;
          }
        }
        return result;
      } catch {
        return true;
      }
    });
  }

  private evalSimpleComparison(row: Record<string, any>, token: string): boolean {
    const operators = ['<=', '>=', '!=', '<>', '=', '<', '>', 'LIKE', 'IN'];
    let opFound = '';
    for (const op of operators) {
      if (token.includes(op)) {
        opFound = op;
        break;
      }
    }

    if (!opFound) return true;

    const parts = token.split(opFound);
    const colRaw = parts[0].trim();
    const valRaw = parts[1].trim();

    const rowVal = row[colRaw] !== undefined ? row[colRaw] : null;
    let targetVal: any = valRaw.replace(/^['"]|['"]$/g, '');

    if (!isNaN(Number(targetVal)) && typeof rowVal === 'number') {
      targetVal = Number(targetVal);
    }

    if (opFound === '=') return rowVal == targetVal;
    if (opFound === '!=' || opFound === '<>') return rowVal != targetVal;
    if (opFound === '<') return rowVal < targetVal;
    if (opFound === '<=') return rowVal <= targetVal;
    if (opFound === '>') return rowVal > targetVal;
    if (opFound === '>=') return rowVal >= targetVal;
    if (opFound === 'LIKE') {
      const regex = new RegExp('^' + targetVal.replace(/%/g, '.*') + '$', 'i');
      return regex.test(String(rowVal));
    }
    return true;
  }

  private processSelect(rows: Record<string, any>[], selectStr: string): Record<string, any>[] {
    if (selectStr === '*') return rows;

    const colDefs = this.parseSelectColumns(selectStr);

    return rows.map((row) => {
      const outputRow: Record<string, any> = {};
      colDefs.forEach((colDef) => {
        outputRow[colDef.alias] = this.evalRowValue(row, colDef.expr);
      });
      return outputRow;
    });
  }

  private processGroupBy(
    rows: Record<string, any>[],
    groupKeys: string[],
    selectStr: string
  ): Record<string, any>[] {
    const colDefs = this.parseSelectColumns(selectStr);

    // Partition rows into groups
    const groups: Map<string, Record<string, any>[]> = new Map();

    rows.forEach((row) => {
      const key = groupKeys.map((k) => String(row[k])).join('___');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    const result: Record<string, any>[] = [];

    groups.forEach((groupRows) => {
      const outputRow: Record<string, any> = {};
      const sampleRow = groupRows[0];

      colDefs.forEach((colDef) => {
        const expr = colDef.expr.trim();

        // Check for aggregate functions
        const aggMatch = expr.match(/(SUM|AVG|COUNT|MIN|MAX|ROUND)\s*\(([\s\S]+)\)/i);
        if (aggMatch) {
          const fn = aggMatch[1].toUpperCase();
          const inside = aggMatch[2].trim();

          if (fn === 'COUNT') {
            outputRow[colDef.alias] = groupRows.length;
          } else if (fn === 'SUM') {
            const sum = groupRows.reduce((acc, r) => acc + (Number(r[inside]) || 0), 0);
            outputRow[colDef.alias] = sum;
          } else if (fn === 'AVG') {
            const sum = groupRows.reduce((acc, r) => acc + (Number(r[inside]) || 0), 0);
            const avg = groupRows.length ? sum / groupRows.length : 0;
            outputRow[colDef.alias] = Math.round(avg * 100) / 100;
          } else if (fn === 'MIN') {
            const vals = groupRows.map((r) => Number(r[inside])).filter((v) => !isNaN(v));
            outputRow[colDef.alias] = vals.length ? Math.min(...vals) : 0;
          } else if (fn === 'MAX') {
            const vals = groupRows.map((r) => Number(r[inside])).filter((v) => !isNaN(v));
            outputRow[colDef.alias] = vals.length ? Math.max(...vals) : 0;
          } else if (fn === 'ROUND') {
            // Nested like ROUND(AVG(x), 1) or ROUND(predicted_demand / 30.0, 2)
            const nestedMatch = inside.match(/(AVG|SUM)\s*\(([^)]+)\)\s*(?:,\s*(\d+))?/i);
            if (nestedMatch) {
              const nestedFn = nestedMatch[1].toUpperCase();
              const col = nestedMatch[2].trim();
              const decimals = nestedMatch[3] ? parseInt(nestedMatch[3], 10) : 0;
              const sum = groupRows.reduce((acc, r) => acc + (Number(r[col]) || 0), 0);
              const val = nestedFn === 'SUM' ? sum : sum / groupRows.length;
              outputRow[colDef.alias] = Number(val.toFixed(decimals));
            } else {
              outputRow[colDef.alias] = sampleRow[inside] !== undefined ? sampleRow[inside] : inside;
            }
          }
        } else if (expr.toUpperCase().startsWith('SUBSTR(')) {
          // e.g. SUBSTR(date, 1, 7)
          const substrMatch = expr.match(/SUBSTR\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
          if (substrMatch) {
            const col = substrMatch[1];
            const start = parseInt(substrMatch[2], 10) - 1; // 1-indexed in SQL
            const len = parseInt(substrMatch[3], 10);
            const val = String(sampleRow[col] || '');
            outputRow[colDef.alias] = val.substring(start, start + len);
          } else {
            outputRow[colDef.alias] = sampleRow[expr];
          }
        } else if (sampleRow[expr] !== undefined) {
          outputRow[colDef.alias] = sampleRow[expr];
        } else {
          outputRow[colDef.alias] = expr.replace(/^['"]|['"]$/g, '');
        }
      });

      result.push(outputRow);
    });

    return result;
  }

  private parseSelectColumns(selectStr: string): { expr: string; alias: string }[] {
    const items: { expr: string; alias: string }[] = [];
    const tokens = this.splitRespectingParentheses(selectStr, ',');

    tokens.forEach((token) => {
      const t = token.trim();
      if (!t) return;
      const asMatch = t.match(/^([\s\S]+?)\s+AS\s+([a-zA-Z0-9_]+)$/i);
      if (asMatch) {
        items.push({ expr: asMatch[1].trim(), alias: asMatch[2].trim() });
      } else {
        const lastWord = t.split(/\s+/).pop() || t;
        const cleanAlias = lastWord.replace(/[^a-zA-Z0-9_]/g, '_');
        items.push({ expr: t, alias: cleanAlias });
      }
    });

    return items;
  }

  private splitRespectingParentheses(str: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let parenDepth = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;

      if (char === delimiter && parenDepth === 0) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) result.push(current);
    return result;
  }

  private evalRowValue(row: Record<string, any>, expr: string): any {
    const trimmed = expr.trim();
    if (row[trimmed] !== undefined) return row[trimmed];

    // ROUND math expression
    const roundMatch = trimmed.match(/ROUND\s*\(([\s\S]+?)(?:,\s*(\d+))?\)/i);
    if (roundMatch) {
      const mathExpr = roundMatch[1];
      const decimals = roundMatch[2] ? parseInt(roundMatch[2], 10) : 0;
      const val = this.evalArithmetic(row, mathExpr);
      return typeof val === 'number' ? Number(val.toFixed(decimals)) : val;
    }

    // Literal string check
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1);
    }

    return this.evalArithmetic(row, trimmed);
  }

  private evalArithmetic(row: Record<string, any>, expr: string): any {
    let replaced = expr;
    for (const key of Object.keys(row)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      if (typeof row[key] === 'number') {
        replaced = replaced.replace(regex, String(row[key]));
      }
    }
    try {
      // Safe math eval with only numbers, +, -, *, /, ., ( )
      if (/^[0-9+\-*/().\s]+$/.test(replaced)) {
        // eslint-disable-next-line no-new-func
        return Function(`'use strict'; return (${replaced})`)();
      }
    } catch {
      // fallback
    }
    return row[expr] !== undefined ? row[expr] : expr;
  }

  private sortRows(rows: Record<string, any>[], orderTokens: string[]): Record<string, any>[] {
    return [...rows].sort((a, b) => {
      for (const token of orderTokens) {
        const parts = token.trim().split(/\s+/);
        const col = parts[0];
        const isDesc = parts[1] && parts[1].toUpperCase() === 'DESC';

        const valA = a[col];
        const valB = b[col];

        if (valA === valB) continue;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return isDesc ? valB - valA : valA - valB;
        }

        const comp = String(valA).localeCompare(String(valB));
        return isDesc ? -comp : comp;
      }
      return 0;
    });
  }
}
