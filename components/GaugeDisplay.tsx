
import React, { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  color: 'red' | 'orange' | 'emerald' | 'blue';
  percentage: number;
}

const GaugeDisplay: React.FC<Props> = ({ label, value, unit, icon, color, percentage }) => {
  const colorMap = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500'
  };

  const ringColorMap = {
    red: 'border-red-500/30',
    orange: 'border-orange-500/30',
    emerald: 'border-emerald-500/30',
    blue: 'border-blue-500/30'
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-3 shadow-xl hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-mono font-bold text-white tracking-tighter">{value}</span>
        <span className="text-xs text-slate-500 font-medium">{unit}</span>
      </div>
      <div className={`w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border ${ringColorMap[color]}`}>
        <div 
          className={`h-full ${colorMap[color]} transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

export default GaugeDisplay;
