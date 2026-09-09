import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  Play,
  Download,
  Copy,
  Check,
  RotateCcw,
  Table as TableIcon,
  Search,
  Clock,
  Terminal,
  FileSpreadsheet,
} from 'lucide-react';
import { SqlEngine } from '../utils/sqlEngine';
import { PREBUILT_SQL_QUERIES } from '../data/mockData';
import { SqlQueryResult } from '../types';

interface SqlStudioProps {
  sqlEngine: SqlEngine;
}

export const SqlStudio: React.FC<SqlStudioProps> = ({ sqlEngine }) => {
  const [query, setQuery] = useState<string>(PREBUILT_SQL_QUERIES[0].sql);
  const [result, setResult] = useState<SqlQueryResult | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('historical_sales');
  const [copied, setCopied] = useState(false);

  // Execute initial query on mount
  useEffect(() => {
    handleRunQuery(PREBUILT_SQL_QUERIES[0].sql);
  }, []);

  const handleRunQuery = (sqlToRun?: string) => {
    const targetSql = sqlToRun || query;
    const res = sqlEngine.execute(targetSql);
    setResult(res);
  };

  const handleSelectPrebuilt = (sql: string) => {
    setQuery(sql);
    handleRunQuery(sql);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!result || !result.rows.length) return;
    const headers = result.columns.join(',');
    const rows = result.rows.map((row) =>
      result.columns.map((col) => JSON.stringify(row[col] ?? '')).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sql_sales_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableNames = useMemo(() => sqlEngine.getTableNames(), [sqlEngine]);
  const tableSchema = useMemo(
    () => sqlEngine.getTableSchema(selectedTable),
    [sqlEngine, selectedTable]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                SQL Historical Sales Data Studio
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Query 52-week historical transactional logs, calculate elasticity metrics, and audit warehouse inventory coverage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Database: PostgreSQL / SQLite dialect (Connected)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Schema Browser (Left) + Query Editor & Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Table & Schema Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Table List & Schema */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-slate-600" />
              Relational Schema Explorer
            </h3>

            {/* Table Selector */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-3">
              {tableNames.map((tableName) => (
                <button
                  key={tableName}
                  onClick={() => setSelectedTable(tableName)}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all text-center truncate ${
                    selectedTable === tableName
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tableName}
                </button>
              ))}
            </div>

            {/* Column Schema Viewer */}
            <div className="space-y-1 text-xs max-h-52 overflow-y-auto pr-1">
              {tableSchema.map((col) => (
                <div
                  key={col.column}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 font-mono text-[11px]"
                >
                  <span className="text-slate-800 font-semibold">{col.column}</span>
                  <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Prebuilt Analytics Queries */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Curated Analytical Queries
            </h3>

            <div className="space-y-2">
              {PREBUILT_SQL_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPrebuilt(item.sql)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all text-xs group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: SQL Editor & Results */}
        <div className="lg:col-span-8 space-y-4">
          {/* SQL Editor Box */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>SQL Query Editor</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={6}
                className="w-full bg-transparent text-emerald-400 font-mono text-xs sm:text-sm focus:outline-hidden resize-none selection:bg-slate-700 leading-relaxed"
                placeholder="SELECT * FROM historical_sales WHERE..."
                spellCheck={false}
              />
            </div>

            <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                {result ? (
                  result.error ? (
                    <span className="text-red-400">Error in syntax</span>
                  ) : (
                    <span>
                      Returned <strong className="text-white">{result.rowCount} rows</strong> in{' '}
                      <strong className="text-white">{result.executionTimeMs} ms</strong>
                    </span>
                  )
                ) : (
                  <span>Ready to execute</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunQuery()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-900" />
                  <span>Execute SQL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Data Grid */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <TableIcon className="w-4 h-4 text-slate-600" />
                <span>Query Results Output</span>
              </div>

              {result && result.rows.length > 0 && (
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {/* Error Message display */}
            {result?.error && (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-mono border-b border-red-200">
                {result.error}
              </div>
            )}

            {/* Result Table */}
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              {result && result.rows.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr className="border-b border-slate-200 text-slate-700 uppercase text-[10px]">
                      {result.columns.map((col) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {result.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                        {result.columns.map((col) => (
                          <td key={col} className="py-2 px-3 whitespace-nowrap">
                            {row[col] !== null && row[col] !== undefined
                              ? String(row[col])
                              : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No records returned or query not yet executed.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
