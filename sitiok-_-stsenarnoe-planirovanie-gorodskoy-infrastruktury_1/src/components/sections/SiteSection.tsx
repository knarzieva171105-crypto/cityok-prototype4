import React from 'react';
import { ModelInputs, LocationContext } from '../../types/model';
import { MapComponent } from '../shared/MapComponent';
import {
  MapPin,
  Compass,
  Layers,
  AlertCircle,
  HelpCircle,
  Info,
  Maximize2,
  Check,
} from 'lucide-react';
import {
  MODEL_METADATA,
  LOCATION_CONTEXT_LABELS,
} from '../../constants/modelConfig';

interface SiteSectionProps {
  inputs: ModelInputs;
  baselineInputs: ModelInputs;
  onUpdateInput: <K extends keyof ModelInputs>(key: K, value: ModelInputs[K]) => void;
  onAdoptPolygonArea: (areaHa: number) => void;
  onOpenWhyModal: (metricKey: string) => void;
}

export const SiteSection: React.FC<SiteSectionProps> = ({
  inputs,
  baselineInputs,
  onUpdateInput,
  onAdoptPolygonArea,
  onOpenWhyModal,
}) => {
  const locationContextOptions: Array<{ id: LocationContext; label: string; desc: string }> = [
    {
      id: 'new_development',
      label: LOCATION_CONTEXT_LABELS.new_development.label,
      desc: LOCATION_CONTEXT_LABELS.new_development.desc,
    },
    {
      id: 'established',
      label: LOCATION_CONTEXT_LABELS.established.label,
      desc: LOCATION_CONTEXT_LABELS.established.desc,
    },
    {
      id: 'central',
      label: LOCATION_CONTEXT_LABELS.central.label,
      desc: LOCATION_CONTEXT_LABELS.central.desc,
    },
    {
      id: 'unspecified',
      label: LOCATION_CONTEXT_LABELS.unspecified.label,
      desc: LOCATION_CONTEXT_LABELS.unspecified.desc,
    },
  ];

  const diffArea = inputs.siteAreaHa - baselineInputs.siteAreaHa;

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      {/* Title & Territorial Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Раздел 2. Земельный участок и пространственные границы
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Определение базовых параметров территории, кадастрового контекста и границ планировочной структуры
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-300 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
              {MODEL_METADATA.testTerritory}
            </span>
          </div>
        </div>
      </div>

      {/* Main Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Site Area Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Площадь земельного участка</h3>
            </div>
            <button
              onClick={() => onOpenWhyModal('buildingFootprint')}
              className="text-slate-500 hover:text-amber-400 transition-colors"
              title="Как площадь участка влияет на расчёт"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Площадь участка, га
              </label>
              {Math.abs(diffArea) > 0.001 && (
                <span className="text-[11px] font-mono text-amber-400">
                  {diffArea > 0 ? `+${diffArea.toFixed(1)}` : diffArea.toFixed(1)} га от базового
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="40"
                step="0.5"
                value={inputs.siteAreaHa}
                onChange={(e) => onUpdateInput('siteAreaHa', parseFloat(e.target.value) || 0.1)}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={inputs.siteAreaHa}
                  onChange={(e) => onUpdateInput('siteAreaHa', parseFloat(e.target.value) || 0.1)}
                  className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-right font-mono text-white text-sm font-bold focus:border-amber-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-medium">га</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              В квадратных метрах: <strong className="text-white font-mono">{(inputs.siteAreaHa * 10000).toLocaleString('ru-RU')} м²</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-xs">
            <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Роль площади участка в расчётном ядре:
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Площадь участка является знаменателем при вычислении градостроительных плотностей (плотность застройки в тыс. м²/га и плотность населения в чел./га), а также базой для нормирования площади озеленения (25% территории).
            </p>
          </div>
        </div>

        {/* Location Context Selector Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Градостроительный контекст</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Условия окружения</span>
          </div>

          <div className="space-y-2">
            {locationContextOptions.map((opt) => {
              const isSelected = inputs.locationContext === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onUpdateInput('locationContext', opt.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {opt.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Geospatial Map Block */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Интерактивный контур земельного участка</h3>
          </div>
          <span className="text-xs text-slate-400">
            Векторный полигон и радиусы доступности
          </span>
        </div>

        <MapComponent
          siteAreaHa={inputs.siteAreaHa}
          onAdoptPolygonArea={onAdoptPolygonArea}
        />
      </div>

      {/* Territorial and Normative Limitations Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white text-xs">
            Методическое ограничение границ территории:
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {MODEL_METADATA.areaDenominatorNotice} В текущей модели территория участка не делится на зоны улично-дорожной сети (УДС) и зоны общего пользования; при детализации на стадии проекта планировки территории (ППТ) расчёт плотностей должен быть скорректирован с учётом красных линий.
          </p>
        </div>
      </div>

    </div>
  );
};
