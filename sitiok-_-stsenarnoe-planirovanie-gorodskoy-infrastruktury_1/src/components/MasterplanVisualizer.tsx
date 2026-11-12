import React from 'react';
import { UrbanCalculationResults, UrbanInputParams } from '../types';
import { Layers, Trees, Building2, School, Baby, Car, Maximize2 } from 'lucide-react';

interface MasterplanVisualizerProps {
  params: UrbanInputParams;
  results: UrbanCalculationResults;
}

export const MasterplanVisualizer: React.FC<MasterplanVisualizerProps> = ({
  params,
  results,
}) => {
  // Proportions of the site (total 100% of site)
  const footprintPercent = Math.min(60, Math.round(params.buildingRatio * 100));
  const greeningPercentOfSite = Math.min(
    60,
    Math.round((results.greeningArea / (params.siteAreaHa * 10000)) * 100)
  );
  const remainingPercent = Math.max(0, 100 - footprintPercent - greeningPercentOfSite);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400" />
            Интерактивный мастер-план участка (2D Схема)
          </h3>
          <p className="text-xs text-slate-400">
            Визуализация пространственного баланса территории: застройка, озеленение, социальные объекты
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <span>Участок: <strong className="text-white">{params.siteAreaHa} га</strong> ({ (params.siteAreaHa * 10000).toLocaleString('ru-RU') } м²)</span>
          <span>·</span>
          <span>Этажность: <strong className="text-orange-400">{params.floors} эт.</strong></span>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #64748b 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Masterplan Area Box */}
        <div className="relative w-full h-full max-w-4xl border-2 border-dashed border-slate-700 rounded-xl p-3 flex flex-col justify-between bg-slate-900/50">
          
          {/* Top Label: Site dimensions */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-1.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Границы земельного участка ({params.siteAreaHa} га)
            </span>
            <span>Кз: {params.buildingRatio.toFixed(2)} | Плотность: {results.buildingDensity} тыс. м²/га</span>
          </div>

          {/* Zones layout simulation */}
          <div className="grid grid-cols-12 gap-2 h-full py-2">
            
            {/* Zone A: Residential Quarter (Пятно застройки) */}
            <div
              className="col-span-5 sm:col-span-6 bg-slate-800/90 border border-orange-500/40 rounded-xl p-3 flex flex-col justify-between shadow-inner relative group hover:border-orange-500 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-orange-400" />
                    Жилая застройка ({params.floors} эт.)
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    Пятно: {results.buildingFootprintHa} га ({results.buildingFootprintM2.toLocaleString('ru-RU')} м²)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  {footprintPercent}% участка
                </span>
              </div>

              {/* Floor stacking visual dots/lines */}
              <div className="space-y-1 my-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(16, params.floors) }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-3 rounded-xs bg-gradient-to-t from-orange-600 to-amber-500 opacity-80"
                      title={`Этаж ${i + 1}`}
                    />
                  ))}
                  {params.floors > 16 && (
                    <span className="text-[10px] text-orange-400 font-mono font-bold">
                      +{params.floors - 16} эт.
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Жилье: {results.totalHousingArea.toLocaleString('ru-RU')} м²</span>
                  <span>{results.apartmentsCount.toLocaleString('ru-RU')} кв. ({results.population.toLocaleString('ru-RU')} чел.)</span>
                </div>
              </div>

              {/* Underground / Ground parking hint */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
                <span className="flex items-center gap-1">
                  <Car className="w-3 h-3 text-sky-400" />
                  Паркинг: {results.requiredParkingPermanent} пост. + {results.requiredParkingTemporary} врем.
                </span>
                <span className={results.deficitParking > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                  {results.deficitParking > 0 ? `Дефицит ${results.deficitParking}` : 'Норма'}
                </span>
              </div>
            </div>

            {/* Zone B: Green Park & Recreational */}
            <div
              className="col-span-4 sm:col-span-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between group hover:border-emerald-500 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Trees className="w-4 h-4 text-emerald-400" />
                    Озеленение
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {results.greeningArea.toLocaleString('ru-RU')} м²
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {results.greeningProvision} м²/чел
                </span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p className="text-[10px] text-emerald-300/80 leading-tight">
                  Скверы, дворовые эко-зоны и бульвары для жителей ЖК
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-emerald-500/20">
                  <span>Норматив:</span>
                  <span className="text-emerald-400 font-bold">≥ 6.0 м²/чел (ОК)</span>
                </div>
              </div>
            </div>

            {/* Zone C: Social Infrastructure Placement (School + Kindergarten) */}
            <div className="col-span-3 sm:col-span-3 flex flex-col gap-2">
              
              {/* School block */}
              <div
                className={`flex-1 p-2.5 rounded-xl border flex flex-col justify-between ${
                  results.deficitSchool > 0
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold flex items-center gap-1 text-white">
                    <School className="w-3.5 h-3.5 text-orange-400" />
                    Школа
                  </span>
                  <span className="text-[10px] font-mono font-bold">
                    {results.requiredSchoolPlaces} уч.
                  </span>
                </div>
                <div className="text-[10px] flex justify-between items-center">
                  <span className="text-slate-400">Сущ: {params.existingSchoolPlaces}</span>
                  <span className={results.deficitSchool > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {results.deficitSchool > 0 ? `-${results.deficitSchool}` : 'ОК'}
                  </span>
                </div>
              </div>

              {/* Kindergarten block */}
              <div
                className={`flex-1 p-2.5 rounded-xl border flex flex-col justify-between ${
                  results.deficitKindergarten > 0
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold flex items-center gap-1 text-white">
                    <Baby className="w-3.5 h-3.5 text-amber-400" />
                    Детский сад
                  </span>
                  <span className="text-[10px] font-mono font-bold">
                    {results.requiredKindergartenPlaces} мест
                  </span>
                </div>
                <div className="text-[10px] flex justify-between items-center">
                  <span className="text-slate-400">Сущ: {params.existingKindergartenPlaces}</span>
                  <span className={results.deficitKindergarten > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {results.deficitKindergarten > 0 ? `-${results.deficitKindergarten}` : 'ОК'}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom axis indicator */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
            <span>Кадастровый планировочный элемент: ЖК «СитиОК Резиденс»</span>
            <span>Градостроительный регламент Казани (РНГП)</span>
          </div>

        </div>

      </div>

      {/* Legend & Land-Use Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded bg-orange-500 shrink-0" />
            <span className="text-slate-300 font-medium">Пятно застройки:</span>
          </div>
          <span className="font-mono text-slate-200 font-bold text-sm block">
            {results.buildingFootprintHa} га ({footprintPercent}%)
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
            <span className="text-slate-300 font-medium">Озеленение двора:</span>
          </div>
          <span className="font-mono text-slate-200 font-bold text-sm block">
            {(results.greeningArea / 10000).toFixed(2)} га ({greeningPercentOfSite}%)
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded bg-sky-500 shrink-0" />
            <span className="text-slate-300 font-medium">Проезды и паркинг:</span>
          </div>
          <span className="font-mono text-slate-200 font-bold text-sm block">
            {results.requiredParkingTotal} м/мест
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
            <span className="text-slate-300 font-medium">Свободная площадь:</span>
          </div>
          <span className="font-mono text-slate-200 font-bold text-sm block">
            {(results.remainingPlotAreaM2 / 10000).toFixed(2)} га
          </span>
        </div>
      </div>
    </div>
  );
};
