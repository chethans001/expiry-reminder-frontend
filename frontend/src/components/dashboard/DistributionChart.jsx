import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

export default function DistributionChart({ distribution = [] }) {
  const data = distribution.filter((d) => d.count > 0);

  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center h-72 text-center">
        <p className="text-xs text-slate-400">No products added yet to show distribution.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.count / total) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
          <p className="text-slate-500 dark:text-slate-400">
            {item.count} items ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Expiry Distribution
          </h3>
          <p className="text-xs text-slate-400">Items grouped by shelf life</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {total} Total
        </span>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
        {distribution.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-slate-600 dark:text-slate-400 truncate">{d.name}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 ml-auto">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
