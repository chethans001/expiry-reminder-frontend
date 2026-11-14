import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import { generateItemsPdfReport } from '../utils/exportPdf';
import StatCard from '../components/common/StatCard';
import ExpiryBadge from '../components/common/ExpiryBadge';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Package,
  Clock,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await reportService.getReportData();
      if (res.success) setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setDownloadingCsv(true);
      await reportService.downloadCSV();
    } catch (err) {
      console.error('Error downloading CSV:', err);
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleExportPDF = () => {
    if (!report?.items) return;
    try {
      setDownloadingPdf(true);
      generateItemsPdfReport({
        user,
        items: report.items,
        summary: report.summary
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const summary = report?.summary || {};
  const items = report?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            <span>Personal Expiry Reports</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Summary metrics and exportable personal reports for your records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={downloadingCsv || items.length === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{downloadingCsv ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={downloadingPdf || items.length === 0}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200 dark:shadow-none transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>{downloadingPdf ? 'Generating...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Household Items"
          value={summary.total || 0}
          subtitle="Currently monitored"
          icon={Package}
          color="indigo"
        />
        <StatCard
          title="Safe Items"
          value={summary.safeCount || 0}
          subtitle="30+ days remaining"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Expiring This Week"
          value={summary.expiringThisWeekCount || 0}
          subtitle="0 to 7 days"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Already Expired"
          value={summary.expiredCount || 0}
          subtitle="Past expiry date"
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Breakdown Tables */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
          All Tracked Items Summary
        </h3>

        {items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No items added yet to generate a report.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Storage Location</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Days Remaining</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                      {item.brand && (
                        <span className="text-slate-400 block text-[11px] font-normal">
                          {item.brand}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {item.category?.name || 'General'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {item.storageLocation || 'Kitchen'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {item.quantity} {item.unit || 'pcs'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatDisplayDate(item.expiryDate)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </td>
                    <td className="px-4 py-3">
                      <ExpiryBadge
                        status={item.status}
                        label={item.status}
                        daysRemaining={item.daysRemaining}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
