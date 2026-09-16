import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, ReportDataset } from '../../api/reports.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { FileBarChart, Download, Printer, Filter, Sparkles } from 'lucide-react';

export const ReportsHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('trips');
  const [dateRange, setDateRange] = useState('30d');

  const categories = reportsApi.getCategories();

  const { data: report, isLoading } = useQuery({
    queryKey: ['reportDataset', selectedCategory, dateRange],
    queryFn: () => reportsApi.generateReport(selectedCategory),
  });

  const handleExportCsv = () => {
    if (!report) return;
    const header = report.columns.join(',');
    const rows = report.rows.map((row) =>
      report.columns.map((col) => `"${row[col] || ''}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OmniCore_${selectedCategory}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Centralized Intelligence & Reporting Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-domain operational datasets, SLA audits, P&L exports, and regulatory compliance reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExportCsv}
            disabled={isLoading || !report}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Category Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 no-print">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none text-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/40 shadow-sm'
                  : 'border-slate-800 bg-[#0f172a]/70 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-white block">{cat.name}</span>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                <span>{cat.fields.length} metrics</span>
                {isSelected && <Badge variant="info" size="sm">Active</Badge>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Canvas */}
      {report && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-widest block">
                {report.category} Domain Ledger
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{report.title}</h2>
              <span className="text-xs text-slate-400">Generated: {report.generatedAt}</span>
            </div>

            <div className="flex items-center gap-3 no-print">
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-36 h-9 text-xs"
                options={[
                  { value: '7d', label: 'Past 7 Days' },
                  { value: '30d', label: 'Past 30 Days' },
                  { value: '90d', label: 'Past 90 Days' },
                  { value: 'ytd', label: 'Year to Date' },
                ]}
              />
            </div>
          </div>

          {/* Report Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {report.summary.map((sum) => (
              <div key={sum.label} className="p-3.5 rounded-lg border border-slate-800 bg-[#0f172a]/60">
                <span className="text-slate-400 text-xs block">{sum.label}</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">{sum.value}</span>
              </div>
            ))}
          </div>

          {/* Rendered Data Grid */}
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  {report.columns.map((col) => (
                    <th key={col} className="px-4 py-3 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {report.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    {report.columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-slate-200 whitespace-nowrap">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
