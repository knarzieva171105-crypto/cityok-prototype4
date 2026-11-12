import React from 'react';
import { UrbanCalculationResults, UrbanInputParams } from '../types';
import { calculateUrbanMetrics, PRESET_SCENARIOS } from '../utils/calculations';
import { GitCompare, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ScenarioCompareProps {
  currentParams: UrbanInputParams;
  currentResults: UrbanCalculationResults;
}

export const ScenarioCompare: React.FC<ScenarioCompareProps> = ({
  currentParams,
  currentResults,
}) => {
  const [compareScenarioId, setCompareScenarioId] = React.useState<string>('kazan_standard');

  const baselinePreset = PRESET_SCENARIOS.find((s) => s.id === compareScenarioId) || PRESET_SCENARIOS[1];
  const baselineResults = calculateUrbanMetrics(baselinePreset.params);

  const getDeltaBadge = (curr: number, base: number, inverse = false, unit = '') => {
    const diff = curr - base;
    if (diff === 0) return <span className="text-slate-400 font-mono text-xs">0 {unit}</span>;
    const isGood = inverse ? diff < 0 : diff > 0;
    return (
      <span
        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
          isGood
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}
      >
        {diff > 0 ? `+${diff.toLocaleString('ru-RU')}` : diff.toLocaleString('ru-RU')} {unit}
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-orange-400" />
            Сравнение двух градостроительных сценариев
          </h3>
          <p className="text-xs text-slate-400">
            Оценка влияния изменения этажности и параметров на дефицит социальной инфраструктуры
          </p>
        </div>

        {/* Preset selector for Scenario B */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Сравнить с:</span>
          <select
            value={compareScenarioId}
            onChange={(e) => setCompareScenarioId(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-orange-500"
          >
            {PRESET_SCENARIOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4 font-semibold">Показатель ТЭП</th>
              <th className="py-3 px-4 font-semibold text-orange-400">
                Текущий расчет ({currentParams.floors} эт., {currentParams.siteAreaHa} га)
              </th>
              <th className="py-3 px-4 font-semibold text-slate-300">
                {baselinePreset.name} ({baselinePreset.params.floors} эт., {baselinePreset.params.siteAreaHa} га)
              </th>
              <th className="py-3 px-4 font-semibold text-right">Разница (Дельта)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            
            {/* Housing Area */}
            <tr className="hover:bg-slate-800/20">
              <td className="py-3 px-4 text-slate-300 font-medium">Общая площадь жилья</td>
              <td className="py-3 px-4 font-mono font-bold text-white">
                {currentResults.totalHousingArea.toLocaleString('ru-RU')} м²
              </td>
              <td className="py-3 px-4 font-mono text-slate-300">
                {baselineResults.totalHousingArea.toLocaleString('ru-RU')} м²
              </td>
              <td className="py-3 px-4 text-right">
                {getDeltaBadge(currentResults.totalHousingArea, baselineResults.totalHousingArea, false, 'м²')}
              </td>
            </tr>

            {/* Building density */}
            <tr className="hover:bg-slate-800/20">
              <td className="py-3 px-4 text-slate-300 font-medium">
                Плотность застройки (Казань ≤12)
              </td>
              <td className="py-3 px-4 font-mono font-bold">
                <span className={currentResults.buildingDensityOk ? 'text-emerald-400' : 'text-rose-400'}>
                  {currentResults.buildingDensity} тыс. м²/га
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-slate-300">
                {baselineResults.buildingDensity} тыс. м²/га
              </td>
              <td className="py-3 px-4 text-right">
                {getDeltaBadge(currentResults.buildingDensity, baselineResults.buildingDensity, true, '')}
              </td>
            </tr>

            {/* Population */}
            <tr className="hover:bg-slate-800/20">
              <td className="py-3 px-4 text-slate-300 font-medium">Прогнозируемое население</td>
              <td className="py-3 px-4 font-mono font-bold text-white">
                {currentResults.population.toLocaleString('ru-RU')} чел.
              </td>
              <td className="py-3 px-4 font-mono text-slate-300">
                {baselineResults.population.toLocaleString('ru-RU')} чел.
              </td>
              <td className="py-3 px-4 text-right">
                {getDeltaBadge(currentResults.population, baselineResults.population, false, 'чел.')}
              </td>
            </tr>

            {/* Population density */}
            <tr className="hover:bg-slate-800/20">
              <td className="py-3 px-4 text-slate-300 font-medium">
                Плотность населения (Норма ≤210)
              </td>
              <td className="py-3 px-4 font-mono font-bold">
                <span className={currentResults.populationDensityOk ? 'text-emerald-400' : 'text-rose-400'}>
                  {currentResults.populationDensity} чел./га
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-slate-300">
                {baselineResults.populationDensity} чел./га
              </td>
              <td className="py-3 px-4 text-right">
                {getDeltaBadge(currentResults.populationDensity, baselineResults.populationDensity, true, '')}
              </td>
            </tr>

            {/* School deficit */}
            <tr className="hover:bg-slate-800/20 bg-slate-800/10">
              <td className="py-3 px-4 text-rose-300 font-bold">
                Дефицит мест в школах (95% охват)
              </td>
              <td className="py-3 px-4 font-mono font-bold">
                <span className={currentResults.deficitSchool > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {currentResults.deficitSchool > 0 ? `-${currentResults.deficitSchool}` : `+${Math.abs(currentResults.deficitSchool)}`} мест
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-slate-300">
                {baselineResults.deficitSchool > 0 ? `-${baselineResults.deficitSchool}` : `+${Math.abs(baselineResults.deficitSchool)}`} мест
              </td>
              <td className="py-3 px-4 text-right">
                {getDeltaBadge(currentResults.deficitSchool, baselineResults.deficitSchool, true, 'мест')}
              </td>
            </tr>

            {/* Kindergarten deficit */}
            <tr className="hover:bg-slate-800/20 bg-slate-800/10">
              <td className="py-3 px-4 text-rose-300 font-bold">
                Дефицит детских садов (85% охват)
              </td>
              <td className="py-3 px-4 font-mono font-bold">
                <span className={currentResults.deficitKindergarten > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {currentResults.deficitKindergarten > 0 ? `-${currentResults.deficitKindergarten}` : `+${Math.abs(currentResults.deficitKindergarten)}`} мест
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-slate-300">
                {baselineResults.deficitKindergarten > 0 ? `-${baselineResults.deficitKindergarten}` : `+${Math.abs(baselineResults.deficitKindergarten)}`} мест
              </td>
              <td className="py-3 px-4 text-right">
                {getDeltaBadge(currentResults.deficitKindergarten, baselineResults.deficitKindergarten, true, 'мест')}
              </td>
            </tr>

            {/* Parking deficit */}
            <tr className="hover:bg-slate-800/20">
              <td className="py-3 px-4 text-slate-300 font-medium">
                Дефицит постоянных парковок
              </td>
              <td className="py-3 px-4 font-mono font-bold">
                <span className={currentResults.deficitParking > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {currentResults.deficitParking > 0 ? `-${currentResults.deficitParking}` : `+${Math.abs(currentResults.deficitParking)}`} м/м
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-slate-300">
                {baselineResults.deficitParking > 0 ? `-${baselineResults.deficitParking}` : `+${Math.abs(baselineResults.deficitParking)}`} м/м
              </td>
              <td className="py-3 px-4 text-right">
                {getDeltaBadge(currentResults.deficitParking, baselineResults.deficitParking, true, 'м/м')}
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};
