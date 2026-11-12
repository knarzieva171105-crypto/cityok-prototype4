import React from 'react';
import {
  ModelInputs,
  ModelOutputs,
  BuildingTypology,
  HousingClass,
  HeightCharacter,
  PublicFunctionsType,
  CourtyardType,
} from '../../types/model';
import { validateModelInputs } from '../../validation/validator';
import {
  Building,
  Sliders,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  Trees,
  Users,
} from 'lucide-react';
import {
  TYPOLOGY_LABELS,
  HOUSING_CLASS_LABELS,
  HEIGHT_CHARACTER_LABELS,
  PUBLIC_FUNCTIONS_LABELS,
  COURTYARD_TYPE_LABELS,
} from '../../constants/modelConfig';

interface DevelopmentSectionProps {
  inputs: ModelInputs;
  baselineInputs: ModelInputs;
  outputs: ModelOutputs;
  onUpdateInput: <K extends keyof ModelInputs>(key: K, value: ModelInputs[K]) => void;
  onOpenWhyModal: (metricKey: string) => void;
}

export const DevelopmentSection: React.FC<DevelopmentSectionProps> = ({
  inputs,
  baselineInputs,
  outputs,
  onUpdateInput,
  onOpenWhyModal,
}) => {
  const validation = validateModelInputs(inputs);
  const errors = validation.errors;
  const warnings = validation.warnings;

  const typologies: Array<{ id: BuildingTypology; label: string; desc: string }> = [
    { id: 'quarter', label: TYPOLOGY_LABELS.quarter.label, desc: TYPOLOGY_LABELS.quarter.desc },
    { id: 'perimeter', label: TYPOLOGY_LABELS.perimeter.label, desc: TYPOLOGY_LABELS.perimeter.desc },
    { id: 'detached', label: TYPOLOGY_LABELS.detached.label, desc: TYPOLOGY_LABELS.detached.desc },
    { id: 'mixed', label: TYPOLOGY_LABELS.mixed.label, desc: TYPOLOGY_LABELS.mixed.desc },
  ];

  const housingClasses: Array<{ id: HousingClass; label: string; desc: string }> = [
    { id: 'basic', label: HOUSING_CLASS_LABELS.basic.label, desc: HOUSING_CLASS_LABELS.basic.desc },
    { id: 'comfort', label: HOUSING_CLASS_LABELS.comfort.label, desc: HOUSING_CLASS_LABELS.comfort.desc },
    { id: 'business', label: HOUSING_CLASS_LABELS.business.label, desc: HOUSING_CLASS_LABELS.business.desc },
    { id: 'elite', label: HOUSING_CLASS_LABELS.elite.label, desc: HOUSING_CLASS_LABELS.elite.desc },
  ];

  const renderDelta = (current: number, baseline: number, unit: string) => {
    const diff = current - baseline;
    if (Math.abs(diff) < 0.0001) return null;
    return (
      <span className="text-[10px] font-mono text-amber-400 ml-1.5">
        ({diff > 0 ? `+${diff}` : `${diff}`} {unit})
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      {/* Title */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Раздел 3. Параметры застройки, типология и класс жилья
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Независимая градостроительная классификация, архитектурные характеристики и расчёт объёмов жилого фонда
            </p>
          </div>
        </div>
      </div>

      {/* 1. Independent Typology & Housing Class Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Typology Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Типология застройки</h3>
            <span className="text-[10px] font-mono text-slate-500">Пространственная структура</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {typologies.map((t) => {
              const isSelected = inputs.typology === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => onUpdateInput('typology', t.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{t.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Housing Class Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Класс жилья</h3>
            <span className="text-[10px] font-mono text-slate-500">Ценовой сегмент</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {housingClasses.map((c) => {
              const isSelected = inputs.housingClass === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onUpdateInput('housingClass', c.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{c.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. Architectural Sub-Characteristics (Height, Public Functions, Courtyard) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white">Дополнительные архитектурные характеристики</h3>
          <span className="text-[10px] font-mono text-slate-500">Морфология застройки</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Характер этажности */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Характер этажности:</label>
            <select
              value={inputs.heightCharacter}
              onChange={(e) => onUpdateInput('heightCharacter', e.target.value as HeightCharacter)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
            >
              <option value="uniform">{HEIGHT_CHARACTER_LABELS.uniform}</option>
              <option value="variable">{HEIGHT_CHARACTER_LABELS.variable}</option>
              <option value="dominant">{HEIGHT_CHARACTER_LABELS.dominant}</option>
            </select>
          </div>

          {/* Общественные функции */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Общественные функции:</label>
            <select
              value={inputs.publicFunctions}
              onChange={(e) => onUpdateInput('publicFunctions', e.target.value as PublicFunctionsType)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
            >
              <option value="ground_floor">{PUBLIC_FUNCTIONS_LABELS.ground_floor}</option>
              <option value="stylobate">{PUBLIC_FUNCTIONS_LABELS.stylobate}</option>
              <option value="none">{PUBLIC_FUNCTIONS_LABELS.none}</option>
            </select>
          </div>

          {/* Тип двора */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Организация двора:</label>
            <select
              value={inputs.courtyardType}
              onChange={(e) => onUpdateInput('courtyardType', e.target.value as CourtyardType)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
            >
              <option value="car_free">{COURTYARD_TYPE_LABELS.car_free}</option>
              <option value="open">{COURTYARD_TYPE_LABELS.open}</option>
              <option value="stylobate_roof">{COURTYARD_TYPE_LABELS.stylobate_roof}</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. Numerical Form: Architectural Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Geometry & Footprint */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Этажность и пятно застройки</h3>
            <span className="text-[10px] font-mono text-slate-500">Параметры объёма</span>
          </div>

          {/* Этажность */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <span>Этажность</span>
                {renderDelta(inputs.floors, baselineInputs.floors, 'эт.')}
              </label>
              <span className="text-[11px] font-mono text-slate-400">базово: 3</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="32"
                step="1"
                value={inputs.floors}
                onChange={(e) => onUpdateInput('floors', parseInt(e.target.value, 10) || 1)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="50"
                step="1"
                value={inputs.floors}
                onChange={(e) => onUpdateInput('floors', parseInt(e.target.value, 10) || 1)}
                className="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-right font-mono text-white text-xs focus:border-amber-500"
              />
            </div>
            {errors.floors && <p className="text-[11px] text-rose-400">{errors.floors}</p>}
          </div>

          {/* Коэффициент застройки */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <span>Коэффициент застройки</span>
                {renderDelta(inputs.buildingCoverage, baselineInputs.buildingCoverage, '')}
              </label>
              <span className="text-[11px] font-mono text-slate-400">базово: 0.40</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.01"
                value={inputs.buildingCoverage}
                onChange={(e) => onUpdateInput('buildingCoverage', parseFloat(e.target.value) || 0.1)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="0.01"
                max="1"
                step="0.01"
                value={inputs.buildingCoverage}
                onChange={(e) => onUpdateInput('buildingCoverage', parseFloat(e.target.value) || 0.1)}
                className="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-right font-mono text-white text-xs focus:border-amber-500"
              />
            </div>
            {errors.buildingCoverage && <p className="text-[11px] text-rose-400">{errors.buildingCoverage}</p>}
            {warnings.buildingCoverage && <p className="text-[11px] text-amber-400">{warnings.buildingCoverage}</p>}
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-400">Площадь застройки (пятно):</span>
            <span className="font-mono font-bold text-white text-sm">
              {outputs.buildingFootprintHa} га
            </span>
          </div>
        </div>

        {/* Apartments & Household Demographics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Жилой фонд и население</h3>
            <span className="text-[10px] font-mono text-slate-500">Демографический расчёт</span>
          </div>

          {/* Средняя площадь квартиры */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Средняя площадь квартиры, м²
              </label>
              <span className="text-[11px] font-mono text-slate-400">базово: 55</span>
            </div>
            <input
              type="number"
              min="15"
              step="1"
              value={inputs.averageApartmentAreaM2}
              onChange={(e) => onUpdateInput('averageApartmentAreaM2', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white text-xs focus:border-amber-500"
            />
            {errors.averageApartmentAreaM2 && <p className="text-[11px] text-rose-400">{errors.averageApartmentAreaM2}</p>}
          </div>

          {/* Жилищная обеспеченность */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Жилищная обеспеченность, м²/чел.
              </label>
              <span className="text-[11px] font-mono text-slate-400">норматив: 30</span>
            </div>
            <input
              type="number"
              min="10"
              step="1"
              value={inputs.housingProvisionM2PerPerson}
              onChange={(e) => onUpdateInput('housingProvisionM2PerPerson', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white text-xs focus:border-amber-500"
            />
          </div>

          {/* Семейственность */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Коэффициент семейственности, чел./кв.
              </label>
              <span className="text-[11px] font-mono text-slate-400">базово: 2.5</span>
            </div>
            <input
              type="number"
              min="1"
              max="6"
              step="0.1"
              value={inputs.householdSize}
              onChange={(e) => onUpdateInput('householdSize', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white text-xs focus:border-amber-500"
            />
          </div>

          {/* Метод расчёта населения */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              Метод оценки численности населения:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onUpdateInput('calculationMode', 'housing_provision')}
                className={`p-2 rounded-lg text-left transition-all border ${
                  inputs.calculationMode === 'housing_provision'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                По жил. обеспеченности
                <span className="text-[10px] block opacity-75 mt-0.5">Жилье / Обеспеченность</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateInput('calculationMode', 'household_size')}
                className={`p-2 rounded-lg text-left transition-all border ${
                  inputs.calculationMode === 'household_size'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                По семейственности
                <span className="text-[10px] block opacity-75 mt-0.5">Квартиры × Семейственность</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Calculated Architectural TEP Summary Matrix with "Как рассчитано?" */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white">
              Архитектурно-градостроительные показатели сценария
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Результаты математического ядра модели с проверкой предельных ориентиров Казани и РНГП
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Детерминированный расчёт</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          
          {/* Общая площадь жилья */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Общая площадь жилья:</span>
              <button
                onClick={() => onOpenWhyModal('totalHousingArea')}
                className="text-slate-500 hover:text-amber-400 transition-colors"
                title="Как рассчитано?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м²
            </div>
            <div className="text-[11px] text-slate-500">
              Площадь застройки × {inputs.floors} эт. × 10 000
            </div>
          </div>

          {/* Плотность застройки */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Плотность застройки:</span>
              <button
                onClick={() => onOpenWhyModal('buildingDensity')}
                className="text-slate-500 hover:text-amber-400 transition-colors"
                title="Как рассчитано?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">
                {outputs.buildingDensityThousandM2PerHa.toFixed(2)}
              </span>
              <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${outputs.benchmarks.buildingDensity.status === 'compliant' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                {outputs.benchmarks.buildingDensity.status === 'compliant' ? '≤ 12.0 ОК' : 'Превышение'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              тыс. м²/га (ориентир Казани: ≤ 12.0)
            </div>
          </div>

          {/* Плотность населения */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Плотность населения:</span>
              <button
                onClick={() => onOpenWhyModal('populationDensity')}
                className="text-slate-500 hover:text-amber-400 transition-colors"
                title="Как рассчитано?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">
                {outputs.populationDensityPerHa.toFixed(1)}
              </span>
              <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${outputs.benchmarks.populationDensity.status === 'compliant' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                {outputs.benchmarks.populationDensity.status === 'compliant' ? '≤ 210 ОК' : 'Превышение'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              чел./га (норматив РНГП: ≤ 210)
            </div>
          </div>

          {/* Количество квартир */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Количество квартир:</span>
              <button
                onClick={() => onOpenWhyModal('apartmentsCount')}
                className="text-slate-500 hover:text-amber-400 transition-colors"
                title="Как рассчитано?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {outputs.apartmentsCount.toLocaleString('ru-RU')} кв.
            </div>
            <div className="text-[11px] text-slate-500">
              Общая площадь жилья / {inputs.averageApartmentAreaM2} м²
            </div>
          </div>

          {/* Численность населения */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Численность населения:</span>
              <button
                onClick={() => onOpenWhyModal('population')}
                className="text-slate-500 hover:text-amber-400 transition-colors"
                title="Как рассчитано?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {Math.round(outputs.population).toLocaleString('ru-RU')} чел.
            </div>
            <div className="text-[11px] text-slate-500">
              {inputs.calculationMode === 'housing_provision'
                ? `По жил. обеспеченности (${inputs.housingProvisionM2PerPerson} м²/чел.)`
                : `По семейственности (${inputs.householdSize} чел./кв.)`}
            </div>
          </div>

          {/* Обеспеченность озеленением */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Озеленение на жителя:</span>
              <button
                onClick={() => onOpenWhyModal('greeningProvision')}
                className="text-slate-500 hover:text-amber-400 transition-colors"
                title="Как рассчитано?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">
                {outputs.greeningProvisionM2PerPerson.toFixed(2)} м²/чел.
              </span>
              <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${outputs.benchmarks.greeningProvision.status === 'compliant' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                {outputs.benchmarks.greeningProvision.status === 'compliant' ? '≥ 6.0 ОК' : 'Ниже нормы'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Площадь озеленения: {outputs.greeningAreaM2.toLocaleString('ru-RU')} м² (25% участка)
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
