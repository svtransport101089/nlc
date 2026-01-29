
import React from 'react';
import { QuarterlyUpdate, QUARTER_LABELS } from '../types';

interface QuarterlyMetricsProps {
  updates: QuarterlyUpdate[];
  onUpdate: (updates: QuarterlyUpdate[]) => void;
}

const QuarterlyMetrics: React.FC<QuarterlyMetricsProps> = ({ updates, onUpdate }) => {
  const handleCellChange = (category: string, q: keyof QuarterlyUpdate, value: string) => {
    const updated = updates.map(u => u.category === category ? { ...u, [q]: value } : u);
    onUpdate(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">Quarterly Metrics</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-4 py-3 w-40">Category</th>
              <th className="px-4 py-3">{QUARTER_LABELS.Q1}</th>
              <th className="px-4 py-3">{QUARTER_LABELS.Q2}</th>
              <th className="px-4 py-3">{QUARTER_LABELS.Q3}</th>
              <th className="px-4 py-3">{QUARTER_LABELS.Q4}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {updates.map((row) => (
              <tr key={row.category} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 font-bold text-slate-700 text-sm align-top leading-tight">
                  {row.category}
                </td>
                {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => (
                  <td key={q} className="px-4 py-4 align-top">
                    <textarea
                      value={row[q]}
                      onChange={(e) => handleCellChange(row.category, q, e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-100 rounded text-sm p-1 outline-none min-h-[60px] resize-none"
                      placeholder="Enter update..."
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuarterlyMetrics;
