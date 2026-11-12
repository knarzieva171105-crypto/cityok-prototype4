import React from 'react';
import { ModelInputs, ModelOutputs, Scenario, RecommendationItem } from '../../types/model';
import { MapComponent } from '../shared/MapComponent';
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
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet,
  GitCompare,
  RotateCcw,
  Sparkles,
  Sliders,
} from 'lucide-react';
import {
  MODEL_METADATA,
  TYPOLOGY_LABELS,
  HOUSING_CLASS_LABELS,
  LOCATION_CONTEXT_LABELS,
} from '../../constants/modelConfig';

interface OverviewSectionProps {
  scenario: Scenario;
  inputs: ModelInputs;
  outputs: ModelOutputs;
  recommendations: RecommendationItem[];
  onNavigateTo: (section: any) => void;
  onResetToBaseline: () => void;
  onExportExcel: () => void;
  onOpenWhyModal: (metricKey: string) => void;
  onAdoptPolygonArea: (areaHa: number) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  scenario,
  inputs,
  outputs,
  recommendations,
  onNavigateTo,
  onResetToBaseline,
  onExportExcel,
  onOpenWhyModal,
  onAdoptPolygonArea,
}) => {
  // Chart data: Social infrastructure demand vs confirmed/assumed reserve vs unmet demand
  const chartData = [
    {
      category: 'Школы',
      unit: 'мест',
      Потребность: outputs.requiredSchoolPlaces,
      'Учтённый резерв': inputs.existingSchool.value ?? 0,
      'Неудовлетворённая потребность': outputs.unmetSchool ?? 0,
    },
    {
      category: 'Детские сады',
      unit: 'мест',
      Потребность: outputs.requiredKindergartenPlaces,
      'Учтённый резерв': inputs.existingKindergarten.value ?? 0,
      'Неудовлетворённая потребность': outputs.unmetKindergarten ?? 0,
    },
    {
      category: 'Парковки (пост.)',
      unit: 'м/м',
      Потребность: outputs.requiredParkingPermanent,
      'Учтённый резерв': inputs.existingParkingPermanent.value ?? 0,
      'Неудовлетворённая потребность': outputs.unmetParkingPermanent ?? 0,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Scenario Context Badge Strip */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-white text-sm">
            {scenario.name}
          </span>
          <span className="text-slate-600">|</span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
            Типология: {TYPOLOGY_LABELS[inputs.typology]?.label || inputs.typology}
          </span>
          <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-medium">
            Класс: {HOUSING_CLASS_LABELS[inputs.housingClass]?.label || inputs.housingClass}
          </span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
            Контекст: {LOCATION_CONTEXT_LABELS[inputs.locationContext]?.label || inputs.locationContext}
          </span>
        </div>

        <button
          onClick={() => onNavigateTo('development')}
          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Настроить застройку →</span>
        </button>
      </div>

      {/* 1. Main KPI Metrics Strip (8 core indicators) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Ключевые показатели застройки и потребности (ТЭП проекта)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Версия: {MODEL_METADATA.version}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Площадь участка */}
          <div
            onClick={() => onOpenWhyModal('buildingFootprint')}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start text-xs text-slate-400">
              <span>Площадь участка</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-white font-mono">{inputs.siteAreaHa}</span>
              <span className="text-xs text-slate-400 font-sans">га</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Застройка: {outputs.buildingFootprintHa} га (Кз {inputs.buildingCoverage})
            </div>
          </div>

          {/* Площадь жилья */}
          <div
            onClick={() => onOpenWhyModal('totalHousingArea')}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start text-xs text-slate-400">
              <span>Общая площадь жилья</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-white font-mono">
                {outputs.totalHousingAreaM2.toLocaleString('ru-RU')}
              </span>
              <span className="text-xs text-slate-400 font-sans">м²</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {inputs.floors} эт. · Плотность: {outputs.buildingDensityThousandM2PerHa.toFixed(1)} тыс. м²/га
            </div>
          </div>

          {/* Квартиры */}
          <div
            onClick={() => onOpenWhyModal('apartmentsCount')}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start text-xs text-slate-400">
              <span>Количество квартир</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-white font-mono">
                {outputs.apartmentsCount.toLocaleString('ru-RU')}
              </span>
              <span className="text-xs text-slate-400 font-sans">кв.</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Ср. площадь: {inputs.averageApartmentAreaM2} м²
            </div>
          </div>

          {/* Население */}
          <div
            onClick={() => onOpenWhyModal('population')}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start text-xs text-slate-400">
              <span>Расчётное население</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-white font-mono">
                {Math.round(outputs.population).toLocaleString('ru-RU')}
              </span>
              <span className="text-xs text-slate-400 font-sans">чел.</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {inputs.calculationMode === 'housing_provision' ? 'По жил. обеспеченности' : 'По семейственности'}
            </div>
          </div>

          {/* Детсады */}
          <div
            onClick={() => onOpenWhyModal('requiredKindergarten')}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start text-xs text-slate-400">
              <span>Спрос: Детсады</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-white font-mono">
                {outputs.requiredKindergartenPlaces}
              </span>
              <span className="text-xs text-slate-400 font-sans">мест</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {outputs.unmetKindergarten !== null
                ? outputs.unmetKindergarten > 0
                  ? `Дефицит: -${outputs.unmetKindergarten}`
                  : `Резерв: +${outputs.remainingReserveKindergarten}`
                : 'Дефицит: нет данных'}
            </div>
          </div>

          {/* Школы */}
          <div
            onClick={() => onOpenWhyModal('requiredSchool')}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start text-xs text-slate-400">
              <span>Спрос: Школы</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-white font-mono">
                {outputs.requiredSchoolPlaces}
              </span>
              <span className="text-xs text-slate-400 font-sans">мест</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {outputs.unmetSchool !== null
                ? outputs.unmetSchool > 0
                  ? `Дефицит: -${outputs.unmetSchool}`
                  : `Резерв: +${outputs.remainingReserveSchool}`
                : 'Дефицит: нет данных'}
            </div>
          </div>

          {/* Постоянные парковки */}
          <div
            onClick={() => onOpenWhyModal('requiredParkingPermanent')}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start text-xs text-slate-400">
              <span>Постоянные парковки</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-white font-mono">
                {outputs.requiredParkingPermanent}
              </span>
              <span className="text-xs text-slate-400 font-sans">м/м</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              1 на 80 м² · Временных: {outputs.requiredParkingTemporary}
            </div>
          </div>

          {/* Озеленение на человека */}
          <div
            onClick={() => onOpenWhyModal('greeningProvision')}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start text-xs text-slate-400">
              <span>Озеленение на жителя</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-white font-mono">
                {outputs.greeningProvisionM2PerPerson.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-sans">м²/чел.</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Ориентир: ≥ 6.0 ({outputs.benchmarks.greeningProvision.status === 'compliant' ? 'В норме' : 'Ниже нормы'})
            </div>
          </div>

        </div>
      </div>

      {/* 2. Interactive Map & Chart Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Map Component (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Геопространственный контекст
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Казань, Приволжский район
            </span>
          </div>

          <MapComponent
            siteAreaHa={inputs.siteAreaHa}
            onAdoptPolygonArea={onAdoptPolygonArea}
          />
        </div>

        {/* Right: Bar Chart "Потребность / Резерв / Неудовлетворенная потребность" (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                Баланс мест инфраструктуры
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Единицы: места и м/м</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Сопоставление расчетного спроса ЖК с подтверждённым или сценарным резервом.
            </p>
          </div>

          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(value: any, name: any, item: any) => [`${value} ${item.payload.unit}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Потребность" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Учтённый резерв" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Неудовлетворённая потребность" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
            * При наличии подтверждённого резерва дефицит снижается на величину свободной мощности.
          </div>
        </div>

      </div>

      {/* 3. Warnings Block & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Warnings Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              Контроль градостроительных ориентиров
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {/* Building density */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-200">Плотность застройки:</span>
                <p className="text-[11px] text-slate-400">
                  {outputs.buildingDensityThousandM2PerHa.toFixed(2)} тыс. м²/га (ориентир Казани: ≤ 12.0)
                </p>
              </div>
              <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${outputs.benchmarks.buildingDensity.status === 'compliant' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                {outputs.benchmarks.buildingDensity.status === 'compliant' ? 'В норме' : 'Превышение'}
              </span>
            </div>

            {/* Population density */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-200">Плотность населения:</span>
                <p className="text-[11px] text-slate-400">
                  {outputs.populationDensityPerHa.toFixed(1)} чел./га (ориентир РНГП: ≤ 210)
                </p>
              </div>
              <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${outputs.benchmarks.populationDensity.status === 'compliant' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                {outputs.benchmarks.populationDensity.status === 'compliant' ? 'В норме' : 'Превышение'}
              </span>
            </div>

            {/* Clinic power notice */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-200">Поликлиническое обслуживание:</span>
                <p className="text-[11px] text-slate-400">
                  {outputs.requiredClinicVisitsPerShift} посещений в смену (показатель мощности, не количество объектов)
                </p>
              </div>
              <span className="text-[11px] font-bold font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                Норматив
              </span>
            </div>
          </div>
        </div>

        {/* Priority Recommendations Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  Первоочередные мероприятия (СитиОК)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTo('report')}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Все мероприятия в отчёте →
              </button>
            </div>

            <div className="space-y-2 mt-2 text-xs">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate pr-2">{rec.action}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">{rec.recommendedStage}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{rec.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
            Рекомендации носят предварительный характер и не являются юридически согласованными актами.
          </div>
        </div>

      </div>

      {/* 4. Action Buttons Strip */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTo('development')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
          >
            Параметры застройки
          </button>

          <button
            onClick={() => onNavigateTo('scenarios_compare')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <GitCompare className="w-3.5 h-3.5 text-amber-400" />
            <span>Сравнить сценарии</span>
          </button>

          <button
            onClick={onExportExcel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Экспорт данных (.xlsx)</span>
          </button>
        </div>

        <button
          onClick={onResetToBaseline}
          className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Сбросить к базовому сценарию</span>
        </button>
      </div>

    </div>
  );
};
