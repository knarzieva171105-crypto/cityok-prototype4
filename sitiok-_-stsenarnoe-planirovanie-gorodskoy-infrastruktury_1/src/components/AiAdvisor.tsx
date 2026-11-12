import React from 'react';
import { UrbanCalculationResults, UrbanInputParams } from '../types';
import { generateAiUrbanAnalysis, findOptimalFloorsForKazanNorm } from '../utils/calculations';
import { Bot, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';

interface AiAdvisorProps {
  params: UrbanInputParams;
  results: UrbanCalculationResults;
  onApplyOptimalFloors: (floors: number) => void;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({
  params,
  results,
  onApplyOptimalFloors,
}) => {
  const analysis = generateAiUrbanAnalysis(params, results);
  const optimalFloors = findOptimalFloorsForKazanNorm(params);
  const canOptimizeFloors = !results.buildingDensityOk && params.floors > optimalFloors;

  return (
    <div className="rounded-2xl p-5 border bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 shadow-xl relative overflow-hidden">
      {/* Decorative subtle ambient highlight */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-orange-500/5 blur-3xl pointer-events-none" />

      {/* Header zone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">
                ИИ-помощник градостроителя «СитиОК»
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Аналитическое заключение
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Автоматический экспресс-аудит соблюдения нормативов градостроительства г. Казань
            </p>
          </div>
        </div>

        {canOptimizeFloors && (
          <button
            onClick={() => onApplyOptimalFloors(optimalFloors)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-300 bg-orange-500/20 border border-orange-500/40 hover:bg-orange-500/30 transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Скорректировать этажность до {optimalFloors} эт.</span>
            <ArrowRight className="w-3 h-3 text-orange-400" />
          </button>
        )}
      </div>

      {/* Main Analysis Body */}
      <div className="mt-4 space-y-4">
        
        {/* Headline callout */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            analysis.statusSeverity === 'danger'
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
              : analysis.statusSeverity === 'warning'
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          }`}
        >
          {analysis.statusSeverity === 'danger' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : analysis.statusSeverity === 'warning' ? (
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">
              {analysis.headline}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {analysis.summary}
            </p>
          </div>
        </div>

        {/* Actionable recommendations list */}
        {analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Рекомендации СитиОК для проектной документации и КРТ:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {analysis.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300 flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-700/60 text-slate-300 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary breakdown row */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-800/30">
            <span className="text-slate-500 text-[10px] block">Школьный баланс</span>
            <span className="font-semibold text-slate-200 truncate block">
              {analysis.metricsBreakdown.schools}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/30">
            <span className="text-slate-500 text-[10px] block">Дошкольный баланс</span>
            <span className="font-semibold text-slate-200 truncate block">
              {analysis.metricsBreakdown.kindergartens}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/30">
            <span className="text-slate-500 text-[10px] block">Транспортный баланс</span>
            <span className="font-semibold text-slate-200 truncate block">
              {analysis.metricsBreakdown.parking}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/30">
            <span className="text-slate-500 text-[10px] block">Градостроительный статус</span>
            <span
              className={`font-semibold truncate block ${
                results.buildingDensityOk && results.populationDensityOk
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {analysis.metricsBreakdown.kazanCompliance}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
