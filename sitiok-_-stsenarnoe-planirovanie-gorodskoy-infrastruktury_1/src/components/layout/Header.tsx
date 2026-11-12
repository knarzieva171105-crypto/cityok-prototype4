import React from 'react';
import { Scenario } from '../../types/model';
import { MODEL_METADATA } from '../../constants/modelConfig';
import {
  Building2,
  AlertCircle,
  FileSpreadsheet,
  Upload,
  Printer,
} from 'lucide-react';

interface HeaderProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onOpenImportModal: () => void;
  onExportExcel: () => void;
  onOpenPrintReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onOpenImportModal,
  onExportExcel,
  onOpenPrintReport,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      
      {/* Top Banner: Mandatory Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center text-[11px] text-amber-300 font-medium flex items-center justify-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{MODEL_METADATA.constantNotice}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand & Project Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg shadow-sm">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  {MODEL_METADATA.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {MODEL_METADATA.version}
                </span>
                <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Демо-данные
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {MODEL_METADATA.subtitle} · <strong className="text-slate-300">{MODEL_METADATA.testTerritory}</strong>
              </p>
            </div>
          </div>

          {/* Scenario Selector & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Scenario dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
              <span className="text-slate-400">Сценарий:</span>
              <select
                value={activeScenarioId}
                onChange={(e) => onSelectScenario(e.target.value)}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Import Data */}
            <button
              onClick={onOpenImportModal}
              title="Загрузить параметры сценария из файла"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Импорт</span>
            </button>

            {/* Export XLSX */}
            <button
              onClick={onExportExcel}
              title="Выгрузить данные проекта в таблицу (.xlsx)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Экспорт XLSX</span>
            </button>

            {/* Print Report */}
            <button
              onClick={onOpenPrintReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печатный отчёт</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
