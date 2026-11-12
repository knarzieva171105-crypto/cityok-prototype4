import React from 'react';
import { QualityProvenance, QualityStatus } from '../../types/model';
import { ShieldCheck, HelpCircle, AlertCircle, FileText } from 'lucide-react';

interface StatusBadgeProps {
  status?: QualityStatus;
  provenance?: QualityProvenance;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  provenance,
  showIcon = true,
}) => {
  if (status) {
    switch (status) {
      case 'fact':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 font-mono">
            {showIcon && <ShieldCheck className="w-3.5 h-3.5" />}
            Факт
          </span>
        );
      case 'estimate':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 font-mono">
            {showIcon && <HelpCircle className="w-3.5 h-3.5" />}
            Оценка
          </span>
        );
      case 'no_data':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 font-mono">
            {showIcon && <AlertCircle className="w-3.5 h-3.5" />}
            Нет данных
          </span>
        );
    }
  }

  if (provenance) {
    switch (provenance) {
      case 'fact':
        return <span className="text-[11px] text-emerald-400 font-medium">Факт</span>;
      case 'norm':
        return <span className="text-[11px] text-sky-400 font-medium">Норматив</span>;
      case 'assumption':
        return <span className="text-[11px] text-amber-400 font-medium">Допущение</span>;
    }
  }

  return null;
};
