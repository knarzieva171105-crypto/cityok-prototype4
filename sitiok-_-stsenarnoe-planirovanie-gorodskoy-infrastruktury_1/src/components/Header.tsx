import React from 'react';
import { Building2, Sliders, Map, GitCompare, Code2, Printer, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'masterplan' | 'compare' | 'code';
  setActiveTab: (tab: 'dashboard' | 'masterplan' | 'compare' | 'code') => void;
  onOpenReport: () => void;
  onAutoOptimize: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onAutoOptimize,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Сити<span className="text-orange-500">ОК</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  MVP 1.0 · Казань
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Сценарное планирование инфраструктуры ЖК
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-orange-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Дашборд ТЭП</span>
            </button>

            <button
              onClick={() => setActiveTab('masterplan')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'masterplan'
                  ? 'bg-slate-800 text-orange-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Мастер-план 2D</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'compare'
                  ? 'bg-slate-800 text-orange-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>Сравнение</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-orange-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Python / Streamlit</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onAutoOptimize}
              title="Автоматически подобрать этажность под нормативы Казани"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Оптимизировать</span>
            </button>

            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-lg shadow-md shadow-orange-600/20 transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Градостроительный отчет</span>
              <span className="sm:hidden">Отчет</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
