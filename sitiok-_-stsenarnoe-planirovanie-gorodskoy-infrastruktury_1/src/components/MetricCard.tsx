import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  normText?: string;
  status?: 'ok' | 'danger' | 'warning' | 'neutral';
  tooltip?: string;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  normText,
  status = 'neutral',
  tooltip,
  highlight = false,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'ok':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ОК (в норме)
          </span>
        );
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Превышение
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Внимание
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-4 rounded-xl transition-all duration-200 border ${
        highlight
          ? 'bg-slate-900/90 border-orange-500/40 shadow-lg shadow-orange-500/5'
          : status === 'danger'
          ? 'bg-slate-900/70 border-rose-500/30'
          : status === 'ok'
          ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1" title={tooltip}>
          {label}
          {tooltip && <Info className="w-3 h-3 text-slate-500 hover:text-slate-300" />}
        </span>
        {getStatusBadge()}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums">
          {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-400 font-sans">
            {unit}
          </span>
        )}
      </div>

      {(subtext || normText) && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col gap-0.5 text-[11px]">
          {subtext && <span className="text-slate-400">{subtext}</span>}
          {normText && <span className="text-slate-500 font-medium">{normText}</span>}
        </div>
      )}
    </div>
  );
};
