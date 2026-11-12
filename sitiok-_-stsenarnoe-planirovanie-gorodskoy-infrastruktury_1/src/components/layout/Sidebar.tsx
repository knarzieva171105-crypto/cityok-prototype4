import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Building,
  School,
  GitCompare,
  FileText,
  Terminal,
  HelpCircle,
} from 'lucide-react';

export type NavSection =
  | 'overview'
  | 'site'
  | 'development'
  | 'infrastructure'
  | 'scenarios_compare'
  | 'report'
  | 'integrations';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenExplanationsDrawer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  onOpenExplanationsDrawer,
}) => {
  const navItems: Array<{ id: NavSection; label: string; icon: React.ReactNode; index: string }> = [
    { id: 'overview', label: 'Обзор проекта', icon: <LayoutDashboard className="w-4 h-4" />, index: '1' },
    { id: 'site', label: 'Участок', icon: <MapPin className="w-4 h-4" />, index: '2' },
    { id: 'development', label: 'Застройка', icon: <Building className="w-4 h-4" />, index: '3' },
    { id: 'infrastructure', label: 'Инфраструктура', icon: <School className="w-4 h-4" />, index: '4' },
    { id: 'scenarios_compare', label: 'Сравнение сценариев', icon: <GitCompare className="w-4 h-4" />, index: '5' },
    { id: 'report', label: 'Отчёт', icon: <FileText className="w-4 h-4" />, index: '6' },
    { id: 'integrations', label: 'Интеграции', icon: <Terminal className="w-4 h-4" />, index: '7' },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-3 flex flex-col justify-between shrink-0">
      
      {/* Navigation Links */}
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Разделы системы
        </div>

        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className={isActive ? 'text-amber-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 opacity-60">
                {item.index}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanations Helper Button at Bottom */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2 mt-4">
        <button
          onClick={onOpenExplanationsDrawer}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white transition-all text-xs font-semibold"
        >
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Пояснения к расчёту</span>
        </button>

        <div className="px-3 py-1.5 text-[10px] text-slate-500 leading-tight">
          Автономное аналитическое ядро сценарного моделирования нагрузки.
        </div>
      </div>

    </aside>
  );
};
