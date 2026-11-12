import React from 'react';
import { UrbanInputParams, ScenarioPreset } from '../types';
import { PRESET_SCENARIOS, DEFAULT_PARAMS } from '../utils/calculations';
import { Sliders, RotateCcw, Building, Users, Trees, Car, ChevronDown, ChevronUp } from 'lucide-react';

interface InputPanelProps {
  params: UrbanInputParams;
  setParams: React.Dispatch<React.SetStateAction<UrbanInputParams>>;
  activePresetId?: string;
  onSelectPreset: (preset: ScenarioPreset) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  params,
  setParams,
  activePresetId,
  onSelectPreset,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const updateParam = <K extends keyof UrbanInputParams>(key: K, value: UrbanInputParams[K]) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setParams({ ...DEFAULT_PARAMS });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-5">
      
      {/* Title & Reset */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
            Параметры сценария
          </h2>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-orange-400 transition-colors"
          title="Сбросить к значениям по умолчанию из ТЗ"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Сброс</span>
        </button>
      </div>

      {/* Preset Scenarios Selector */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Готовые градостроительные сценарии:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`text-left px-3 py-2 rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-orange-500/15 border-orange-500 text-white shadow-sm shadow-orange-500/10'
                    : 'bg-slate-850/60 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">{preset.tagline}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Interactive Sliders (Key controls for real-time scenario planning) */}
      <div className="space-y-4 pt-1">
        
        {/* Slider 1: Площадь участка */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-orange-400" />
              Площадь участка
            </span>
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              <span>{params.siteAreaHa}</span>
              <span className="text-[10px] font-sans font-normal text-slate-400">га</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            step="0.5"
            value={params.siteAreaHa}
            onChange={(e) => updateParam('siteAreaHa', parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1 га</span>
            <span>20 га</span>
            <span>40 га</span>
          </div>
        </div>

        {/* Slider 2: Этажность */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-orange-400" />
              Этажность застройки
            </span>
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              <span>{params.floors}</span>
              <span className="text-[10px] font-sans font-normal text-slate-400">эт.</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="32"
            step="1"
            value={params.floors}
            onChange={(e) => updateParam('floors', parseInt(e.target.value, 10))}
            className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1 эт.</span>
            <span>9 эт.</span>
            <span>18 эт.</span>
            <span>32 эт.</span>
          </div>
        </div>

        {/* Input: Коэффициент застройки */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Коэф. застройки (Кз)
            </span>
            <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              {params.buildingRatio.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.6"
            step="0.02"
            value={params.buildingRatio}
            onChange={(e) => updateParam('buildingRatio', parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.10 (разреж.)</span>
            <span>0.40 (норма ТЗ)</span>
            <span>0.60 (плотно)</span>
          </div>
        </div>

      </div>

      {/* Existing infrastructure section */}
      <div className="space-y-2.5 pt-1">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Существующие мощности (в шаговой доступности):
        </label>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-300">Места в детском саду:</span>
            <input
              type="number"
              min="0"
              max="5000"
              step="10"
              value={params.existingKindergartenPlaces}
              onChange={(e) => updateParam('existingKindergartenPlaces', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-24 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded-lg font-mono text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-300">Места в школе:</span>
            <input
              type="number"
              min="0"
              max="10000"
              step="10"
              value={params.existingSchoolPlaces}
              onChange={(e) => updateParam('existingSchoolPlaces', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-24 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded-lg font-mono text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-300">Существующие парковки:</span>
            <input
              type="number"
              min="0"
              max="10000"
              step="50"
              value={params.existingParkingPlaces}
              onChange={(e) => updateParam('existingParkingPlaces', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-24 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded-lg font-mono text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Advanced Demographic & Urban Planning Settings Accordion */}
      <div className="border-t border-slate-800 pt-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs font-medium text-slate-400 hover:text-slate-200 py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Демография и нормативы
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between gap-2">
              <span title="Средняя площадь квартиры в м²">Средняя площадь кв. (м²):</span>
              <input
                type="number"
                min="20"
                max="250"
                value={params.avgApartmentArea}
                onChange={(e) => updateParam('avgApartmentArea', parseFloat(e.target.value) || 55)}
                className="w-20 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded-lg font-mono text-white"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span title="Количество жителей на одну квартиру">Коэф. семейственности:</span>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={params.familyRatio}
                onChange={(e) => updateParam('familyRatio', parseFloat(e.target.value) || 2.5)}
                className="w-20 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded-lg font-mono text-white"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span title="Норматив озеленения в м² на человека">Норма озеленения (м²/чел):</span>
              <input
                type="number"
                step="0.5"
                min="1"
                max="30"
                value={params.greeningNorm}
                onChange={(e) => updateParam('greeningNorm', parseFloat(e.target.value) || 6)}
                className="w-20 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded-lg font-mono text-white"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span title="Жилищная обеспеченность (м² на человека)">Жил. обеспеченность:</span>
              <input
                type="number"
                step="1"
                min="15"
                max="80"
                value={params.housingProvision}
                onChange={(e) => updateParam('housingProvision', parseFloat(e.target.value) || 30)}
                className="w-20 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded-lg font-mono text-white"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span title="Доля детей дошкольного возраста (0-7 лет)">Доля детей 0-7 лет:</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.30"
                value={params.shareKidsPreschool}
                onChange={(e) => updateParam('shareKidsPreschool', parseFloat(e.target.value) || 0.07)}
                className="w-20 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded-lg font-mono text-white"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span title="Доля детей школьного возраста (7-18 лет)">Доля детей 7-18 лет:</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.40"
                value={params.shareKidsSchool}
                onChange={(e) => updateParam('shareKidsSchool', parseFloat(e.target.value) || 0.12)}
                className="w-20 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded-lg font-mono text-white"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
