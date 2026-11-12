import React, { useState } from 'react';
import { Scenario } from '../../types/model';
import { calculateModel } from '../../calculationEngine/engine';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  GitCompare,
  Copy,
  Trash2,
  Edit2,
  Star,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import {
  TYPOLOGY_LABELS,
  HOUSING_CLASS_LABELS,
  LOCATION_CONTEXT_LABELS,
} from '../../constants/modelConfig';

interface ScenarioCompareSectionProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onDuplicateScenario: (scenario: Scenario) => void;
  onRenameScenario: (id: string, newName: string) => void;
  onDeleteScenario: (id: string) => void;
  onMakeBaseline: (id: string) => void;
  onResetScenarios: () => void;
}

export const ScenarioCompareSection: React.FC<ScenarioCompareSectionProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onDuplicateScenario,
  onRenameScenario,
  onDeleteScenario,
  onMakeBaseline,
  onResetScenarios,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return scenarios.slice(0, 3).map((s) => s.id);
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const toggleSelectScenario = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[0], selectedIds[1], id]);
      }
    }
  };

  const selectedScenarios = scenarios.filter((s) => selectedIds.includes(s.id));
  const baselineScenario = scenarios.find((s) => s.isBaseline) || scenarios[0];
  const baselineOutputs = calculateModel(baselineScenario.inputs);

  const calculatedScenarios = selectedScenarios.map((scen) => ({
    scenario: scen,
    outputs: calculateModel(scen.inputs),
  }));

  const calcDelta = (currentVal: number, baseVal: number, unit = '', inverse = false) => {
    const absDiff = currentVal - baseVal;
    if (Math.abs(absDiff) < 0.0001) {
      return { text: `0 ${unit}`, pct: '0%', status: 'neutral' };
    }

    let pctText = '—';
    if (baseVal !== 0) {
      const pct = (absDiff / Math.abs(baseVal)) * 100;
      pctText = `${pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}`;
    } else {
      pctText = 'база = 0';
    }

    const isFavorable = inverse ? absDiff < 0 : absDiff > 0;
    return {
      text: `${absDiff > 0 ? `+${absDiff.toLocaleString('ru-RU')}` : absDiff.toLocaleString('ru-RU')} ${unit}`,
      pct: pctText,
      status: isFavorable ? 'favorable' : 'unfavorable',
    };
  };

  const compareChartData = calculatedScenarios.map(({ scenario, outputs }) => ({
    name: scenario.name,
    'Жилье (тыс. м²)': Math.round(outputs.totalHousingAreaM2 / 1000),
    'Население (чел.)': Math.round(outputs.population),
    'Дефицит школ (мест)': outputs.unmetSchool ?? 0,
    'Дефицит садов (мест)': outputs.unmetKindergarten ?? 0,
    'Дефицит парковок (м/м)': outputs.unmetParkingPermanent ?? 0,
  }));

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Раздел 5. Сравнение градостроительных сценариев (до 3 вариантов)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Анализ различий в типологии, классе, градостроительном контексте, объёмах жилья и дефиците инфраструктуры
              </p>
            </div>
          </div>

          <button
            onClick={onResetScenarios}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить к исходным сценариям</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Сценарии сохраняются локально в хранилище вашего браузера.</span>
          </div>
          <div className="italic text-slate-500">
            Каждый сценарий содержит полный снимок участка, застройки, типологии и инфраструктуры.
          </div>
        </div>
      </div>

      {/* Scenario Cards Selector Bar */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">
          Выберите варианты для одновременного анализа (выбрано: {selectedIds.length} из 3):
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {scenarios.map((scen) => {
            const isSelected = selectedIds.includes(scen.id);
            const isBase = scen.isBaseline;
            const isEditing = editingId === scen.id;

            return (
              <div
                key={scen.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/60 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectScenario(scen.id)}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => {
                          if (editingName.trim()) onRenameScenario(scen.id, editingName.trim());
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingName.trim()) onRenameScenario(scen.id, editingName.trim());
                            setEditingId(null);
                          }
                        }}
                        className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold text-white w-full"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs font-bold text-white truncate cursor-pointer" onClick={() => onSelectScenario(scen.id)}>
                        {scen.name}
                      </span>
                    )}
                  </div>

                  {isBase && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      Базовый
                    </span>
                  )}
                </div>

                <div className="space-y-1 mb-3 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Типология:</span>
                    <strong className="text-slate-200">{TYPOLOGY_LABELS[scen.inputs.typology]?.label || scen.inputs.typology}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Класс:</span>
                    <strong className="text-amber-300">{HOUSING_CLASS_LABELS[scen.inputs.housingClass]?.label || scen.inputs.housingClass}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Этажность:</span>
                    <strong className="text-slate-200">{scen.inputs.floors} эт. (Кз {scen.inputs.buildingCoverage})</strong>
                  </div>
                </div>

                {/* Scenario Tools */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDuplicateScenario(scen)}
                      title="Дублировать сценарий"
                      className="hover:text-amber-400 transition-colors p-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(scen.id);
                        setEditingName(scen.name);
                      }}
                      title="Переименовать"
                      className="hover:text-amber-400 transition-colors p-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!isBase && (
                      <button
                        onClick={() => onMakeBaseline(scen.id)}
                        title="Сделать базовым сценарием"
                        className="hover:text-amber-400 transition-colors text-[10px]"
                      >
                        Сделать базовым
                      </button>
                    )}
                  </div>

                  {!isBase && scenarios.length > 1 && (
                    <button
                      onClick={() => onDeleteScenario(scen.id)}
                      title="Удалить сценарий"
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white">
            График сопоставления выбранных вариантов
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {calculatedScenarios.length} варианта(-ов)
          </span>
        </div>

        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compareChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Жилье (тыс. м²)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Дефицит школ (мест)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Дефицит садов (мест)" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Дефицит парковок (м/м)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Side-by-Side Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">
            Матрица параметров и дельт относительно «{baselineScenario.name}»
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Параметр проекта</th>
                <th className="p-3 text-amber-400">Базовый: {baselineScenario.name}</th>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario }) => (
                    <th key={scenario.id} className="p-3 text-white">
                      {scenario.name}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              
              {/* Типология */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">Типология застройки</td>
                <td className="p-3 font-medium text-white">{TYPOLOGY_LABELS[baselineScenario.inputs.typology]?.label}</td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario }) => (
                    <td key={scenario.id} className="p-3 font-medium text-white">
                      {TYPOLOGY_LABELS[scenario.inputs.typology]?.label}
                    </td>
                  ))}
              </tr>

              {/* Класс жилья */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">Класс жилья</td>
                <td className="p-3 font-medium text-amber-400">{HOUSING_CLASS_LABELS[baselineScenario.inputs.housingClass]?.label}</td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario }) => (
                    <td key={scenario.id} className="p-3 font-medium text-amber-400">
                      {HOUSING_CLASS_LABELS[scenario.inputs.housingClass]?.label}
                    </td>
                  ))}
              </tr>

              {/* Градостроительный контекст */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">Градостроительный контекст</td>
                <td className="p-3 text-slate-300">{LOCATION_CONTEXT_LABELS[baselineScenario.inputs.locationContext]?.label}</td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario }) => (
                    <td key={scenario.id} className="p-3 text-slate-300">
                      {LOCATION_CONTEXT_LABELS[scenario.inputs.locationContext]?.label}
                    </td>
                  ))}
              </tr>

              {/* Площадь участка */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">Площадь участка</td>
                <td className="p-3 font-mono font-bold text-white">{baselineScenario.inputs.siteAreaHa} га</td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario }) => {
                    const delta = calcDelta(scenario.inputs.siteAreaHa, baselineScenario.inputs.siteAreaHa, 'га');
                    return (
                      <td key={scenario.id} className="p-3 font-mono">
                        <span className="font-bold text-white">{scenario.inputs.siteAreaHa} га</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{delta.text} ({delta.pct})</div>
                      </td>
                    );
                  })}
              </tr>

              {/* Этажность */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">Этажность</td>
                <td className="p-3 font-mono font-bold text-white">{baselineScenario.inputs.floors} эт.</td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario }) => {
                    const delta = calcDelta(scenario.inputs.floors, baselineScenario.inputs.floors, 'эт.');
                    return (
                      <td key={scenario.id} className="p-3 font-mono">
                        <span className="font-bold text-white">{scenario.inputs.floors} эт.</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{delta.text} ({delta.pct})</div>
                      </td>
                    );
                  })}
              </tr>

              {/* Площадь жилья */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">Общая площадь жилья</td>
                <td className="p-3 font-mono font-bold text-white">
                  {baselineOutputs.totalHousingAreaM2.toLocaleString('ru-RU')} м²
                </td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario, outputs }) => {
                    const delta = calcDelta(outputs.totalHousingAreaM2, baselineOutputs.totalHousingAreaM2, 'м²');
                    return (
                      <td key={scenario.id} className="p-3 font-mono">
                        <span className="font-bold text-white">{outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м²</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{delta.text} ({delta.pct})</div>
                      </td>
                    );
                  })}
              </tr>

              {/* Плотность застройки */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">Плотность застройки (≤12.0)</td>
                <td className="p-3 font-mono font-bold">
                  <span className={baselineOutputs.buildingDensityThousandM2PerHa <= 12 ? 'text-emerald-400' : 'text-rose-400'}>
                    {baselineOutputs.buildingDensityThousandM2PerHa.toFixed(2)} тыс. м²/га
                  </span>
                </td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario, outputs }) => {
                    const delta = calcDelta(outputs.buildingDensityThousandM2PerHa, baselineOutputs.buildingDensityThousandM2PerHa, '', true);
                    return (
                      <td key={scenario.id} className="p-3 font-mono">
                        <span className={outputs.buildingDensityThousandM2PerHa <= 12 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {outputs.buildingDensityThousandM2PerHa.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{delta.text} ({delta.pct})</div>
                      </td>
                    );
                  })}
              </tr>

              {/* Население */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">Расчётное население</td>
                <td className="p-3 font-mono font-bold text-white">
                  {Math.round(baselineOutputs.population).toLocaleString('ru-RU')} чел.
                </td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario, outputs }) => {
                    const delta = calcDelta(outputs.population, baselineOutputs.population, 'чел.');
                    return (
                      <td key={scenario.id} className="p-3 font-mono">
                        <span className="font-bold text-white">{Math.round(outputs.population).toLocaleString('ru-RU')} чел.</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{delta.text} ({delta.pct})</div>
                      </td>
                    );
                  })}
              </tr>

              {/* Дефицит школ */}
              <tr className="hover:bg-slate-800/30 bg-slate-950/40">
                <td className="p-3 font-bold text-rose-300">Дефицит мест в школах</td>
                <td className="p-3 font-mono font-bold">
                  {baselineOutputs.unmetSchool !== null ? `${baselineOutputs.unmetSchool} мест` : 'нет данных'}
                </td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario, outputs }) => {
                    const delta = calcDelta(outputs.unmetSchool ?? 0, baselineOutputs.unmetSchool ?? 0, 'мест', true);
                    return (
                      <td key={scenario.id} className="p-3 font-mono">
                        <span className="font-bold text-white">
                          {outputs.unmetSchool !== null ? `${outputs.unmetSchool} мест` : 'нет данных'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{delta.text} ({delta.pct})</div>
                      </td>
                    );
                  })}
              </tr>

              {/* Дефицит садиков */}
              <tr className="hover:bg-slate-800/30 bg-slate-950/40">
                <td className="p-3 font-bold text-rose-300">Дефицит мест в детсадах</td>
                <td className="p-3 font-mono font-bold">
                  {baselineOutputs.unmetKindergarten !== null ? `${baselineOutputs.unmetKindergarten} мест` : 'нет данных'}
                </td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario, outputs }) => {
                    const delta = calcDelta(outputs.unmetKindergarten ?? 0, baselineOutputs.unmetKindergarten ?? 0, 'мест', true);
                    return (
                      <td key={scenario.id} className="p-3 font-mono">
                        <span className="font-bold text-white">
                          {outputs.unmetKindergarten !== null ? `${outputs.unmetKindergarten} мест` : 'нет данных'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{delta.text} ({delta.pct})</div>
                      </td>
                    );
                  })}
              </tr>

              {/* Дефицит парковок */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">Дефицит постоянных парковок</td>
                <td className="p-3 font-mono font-bold">
                  {baselineOutputs.unmetParkingPermanent !== null ? `${baselineOutputs.unmetParkingPermanent} м/м` : 'нет данных'}
                </td>
                {calculatedScenarios
                  .filter((s) => s.scenario.id !== baselineScenario.id)
                  .map(({ scenario, outputs }) => {
                    const delta = calcDelta(outputs.unmetParkingPermanent ?? 0, baselineOutputs.unmetParkingPermanent ?? 0, 'м/м', true);
                    return (
                      <td key={scenario.id} className="p-3 font-mono">
                        <span className="font-bold text-white">
                          {outputs.unmetParkingPermanent !== null ? `${outputs.unmetParkingPermanent} м/м` : 'нет данных'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{delta.text} ({delta.pct})</div>
                      </td>
                    );
                  })}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
