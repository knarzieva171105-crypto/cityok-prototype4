import React, { useState } from 'react';
import { ModelInputs, ModelOutputs, QualityStatus, QualityProvenance, InfrastructureFacility } from '../../types/model';
import { SYNTHETIC_DEMO_FACILITIES, MODEL_METADATA } from '../../constants/modelConfig';
import { StatusBadge } from '../shared/StatusBadge';
import {
  School,
  Baby,
  Car,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Layers,
  Activity,
  Sliders,
} from 'lucide-react';

interface InfrastructureSectionProps {
  inputs: ModelInputs;
  outputs: ModelOutputs;
  onUpdateInput: <K extends keyof ModelInputs>(key: K, value: ModelInputs[K]) => void;
  onOpenWhyModal: (metricKey: string) => void;
}

export const InfrastructureSection: React.FC<InfrastructureSectionProps> = ({
  inputs,
  outputs,
  onUpdateInput,
  onOpenWhyModal,
}) => {
  const [facilities, setFacilities] = useState<InfrastructureFacility[]>(SYNTHETIC_DEMO_FACILITIES);

  // Toggle facility inclusion in scenario
  const handleToggleFacility = (id: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isIncludedInScenario: !f.isIncludedInScenario } : f))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Раздел 4. Социальная инфраструктура и подтверждённый резерв
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Расчёт нормативной потребности, сопоставление с подтверждённым резервом и выявление дефицита
            </p>
          </div>
        </div>
      </div>

      {/* Demographic Cohort Shares Sliders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Демографические доли возрастных групп</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Сценарный профиль</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Дошкольники 0-7 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-medium">Доля детей 0–7 лет (дошкольники):</label>
              <span className="font-mono text-amber-400 font-bold">
                {(inputs.childSharePreschool * 100).toFixed(1)}% (доля {inputs.childSharePreschool})
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.25"
              step="0.005"
              value={inputs.childSharePreschool}
              onChange={(e) => onUpdateInput('childSharePreschool', parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Коэффициент охвата ДОО: 85% (0.85). Предельная ёмкость одного объекта — до 350 мест.
            </p>
          </div>

          {/* Школьники 7-18 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-medium">Доля детей 7–18 лет (школьники):</label>
              <span className="font-mono text-amber-400 font-bold">
                {(inputs.childShareSchool * 100).toFixed(1)}% (доля {inputs.childShareSchool})
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.30"
              step="0.005"
              value={inputs.childShareSchool}
              onChange={(e) => onUpdateInput('childShareSchool', parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Коэффициент охвата СОШ: 95% (0.95). Вместимость отдельного нового здания СОШ — от 500 мест.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Main Social Facilities Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: ШКОЛЫ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  СОШ
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Школьное образование</h3>
                  <span className="text-[10px] text-slate-400">95% охват детей 7–18 лет</span>
                </div>
              </div>
              <button
                onClick={() => onOpenWhyModal('requiredSchool')}
                className="text-slate-500 hover:text-amber-400 transition-colors"
                title="Как рассчитано?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Demand vs Reserve vs Balance */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Потребность ЖК:</span>
                <strong className="text-white text-sm">{outputs.requiredSchoolPlaces} мест</strong>
              </div>
              
              {/* Existing Reserve Input */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center font-sans text-[11px]">
                  <span className="text-slate-300">Подтверждённый резерв:</span>
                  <StatusBadge status={inputs.existingSchool.qualityStatus} />
                </div>
                
                <select
                  value={inputs.existingSchool.qualityStatus}
                  onChange={(e) => {
                    const status = e.target.value as QualityStatus;
                    onUpdateInput('existingSchool', {
                      ...inputs.existingSchool,
                      qualityStatus: status,
                      value: status === 'no_data' ? null : (inputs.existingSchool.value ?? 0),
                      provenance: status === 'fact' ? 'fact' : 'assumption',
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-[11px] rounded-lg px-2 py-1 text-slate-200 font-sans"
                >
                  <option value="estimate">Сценарное предположение</option>
                  <option value="fact">Подтверждённый факт</option>
                  <option value="no_data">Нет данных (no_data)</option>
                </select>

                {inputs.existingSchool.qualityStatus !== 'no_data' ? (
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={inputs.existingSchool.value ?? 0}
                    onChange={(e) =>
                      onUpdateInput('existingSchool', {
                        ...inputs.existingSchool,
                        value: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono text-white text-xs"
                  />
                ) : (
                  <div className="p-1.5 bg-slate-900 rounded text-[10px] text-slate-400 font-sans italic text-center">
                    Данных о свободных местах нет
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-sans">
                <span className="text-slate-300 font-semibold">Баланс мощности:</span>
                <span className="text-sm font-bold text-white font-mono">
                  {outputs.rawBalanceSchool !== null ? `${outputs.rawBalanceSchool} мест` : 'Не определён'}
                </span>
              </div>
            </div>

            {/* Unmet vs Reserve note */}
            {inputs.existingSchool.qualityStatus === 'no_data' ? (
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Дефицит не определён: нет данных о резерве</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Спрос рассчитан детерминированно, но баланс сети требует подтверждения загрузки окрестных школ.
                </p>
              </div>
            ) : outputs.unmetSchool && outputs.unmetSchool > 0 ? (
              <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Неудовлетворённая потребность: {outputs.unmetSchool} мест</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ориентир вместимости отдельной новой СОШ — не менее 500 мест.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Остаток резерва: {outputs.remainingReserveSchool} мест</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Потребность закрывается существующим резервом по условиям сценария.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Происхождение: <strong className="text-slate-400 font-mono">{inputs.existingSchool.provenance}</strong>
          </div>
        </div>

        {/* Card 2: ДЕТСКИЕ САДЫ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold">
                  ДОО
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Дошкольное образование</h3>
                  <span className="text-[10px] text-slate-400">85% охват детей 0–7 лет</span>
                </div>
              </div>
              <button
                onClick={() => onOpenWhyModal('requiredKindergarten')}
                className="text-slate-500 hover:text-amber-400 transition-colors"
                title="Как рассчитано?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Demand vs Reserve vs Balance */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Потребность ЖК:</span>
                <strong className="text-white text-sm">{outputs.requiredKindergartenPlaces} мест</strong>
              </div>

              {/* Existing Reserve Input */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center font-sans text-[11px]">
                  <span className="text-slate-300">Подтверждённый резерв:</span>
                  <StatusBadge status={inputs.existingKindergarten.qualityStatus} />
                </div>

                <select
                  value={inputs.existingKindergarten.qualityStatus}
                  onChange={(e) => {
                    const status = e.target.value as QualityStatus;
                    onUpdateInput('existingKindergarten', {
                      ...inputs.existingKindergarten,
                      qualityStatus: status,
                      value: status === 'no_data' ? null : (inputs.existingKindergarten.value ?? 0),
                      provenance: status === 'fact' ? 'fact' : 'assumption',
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-[11px] rounded-lg px-2 py-1 text-slate-200 font-sans"
                >
                  <option value="estimate">Сценарное предположение</option>
                  <option value="fact">Подтверждённый факт</option>
                  <option value="no_data">Нет данных (no_data)</option>
                </select>

                {inputs.existingKindergarten.qualityStatus !== 'no_data' ? (
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={inputs.existingKindergarten.value ?? 0}
                    onChange={(e) =>
                      onUpdateInput('existingKindergarten', {
                        ...inputs.existingKindergarten,
                        value: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono text-white text-xs"
                  />
                ) : (
                  <div className="p-1.5 bg-slate-900 rounded text-[10px] text-slate-400 font-sans italic text-center">
                    Данных о свободных местах нет
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-sans">
                <span className="text-slate-300 font-semibold">Баланс мощности:</span>
                <span className="text-sm font-bold text-white font-mono">
                  {outputs.rawBalanceKindergarten !== null ? `${outputs.rawBalanceKindergarten} мест` : 'Не определён'}
                </span>
              </div>
            </div>

            {inputs.existingKindergarten.qualityStatus === 'no_data' ? (
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Дефицит не определён: нет данных о резерве</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Запросите мощность и текущую фактическую загрузку садиков района.
                </p>
              </div>
            ) : outputs.unmetKindergarten && outputs.unmetKindergarten > 0 ? (
              <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Неудовлетворённая потребность: {outputs.unmetKindergarten} мест</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Предельная вместимость одного отдельного здания ДОО — до 350 мест.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Остаток резерва: {outputs.remainingReserveKindergarten} мест</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Дошкольные места обеспечены учтённым резервом.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Происхождение: <strong className="text-slate-400 font-mono">{inputs.existingKindergarten.provenance}</strong>
          </div>
        </div>

        {/* Card 3: ПАРКОВКИ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  ПАРК
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Постоянные парковки</h3>
                  <span className="text-[10px] text-slate-400">1 место на 80 м² жилья</span>
                </div>
              </div>
              <button
                onClick={() => onOpenWhyModal('requiredParkingPermanent')}
                className="text-slate-500 hover:text-amber-400 transition-colors"
                title="Как рассчитано?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Demand vs Reserve vs Balance */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Потребность ЖК:</span>
                <strong className="text-white text-sm">{outputs.requiredParkingPermanent} м/м</strong>
              </div>

              {/* Existing Reserve Input */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center font-sans text-[11px]">
                  <span className="text-slate-300">Подтверждённый резерв:</span>
                  <StatusBadge status={inputs.existingParkingPermanent.qualityStatus} />
                </div>

                <select
                  value={inputs.existingParkingPermanent.qualityStatus}
                  onChange={(e) => {
                    const status = e.target.value as QualityStatus;
                    onUpdateInput('existingParkingPermanent', {
                      ...inputs.existingParkingPermanent,
                      qualityStatus: status,
                      value: status === 'no_data' ? null : (inputs.existingParkingPermanent.value ?? 0),
                      provenance: status === 'fact' ? 'fact' : 'assumption',
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-[11px] rounded-lg px-2 py-1 text-slate-200 font-sans"
                >
                  <option value="estimate">Сценарное предположение</option>
                  <option value="fact">Подтверждённый факт</option>
                  <option value="no_data">Нет данных (no_data)</option>
                </select>

                {inputs.existingParkingPermanent.qualityStatus !== 'no_data' ? (
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={inputs.existingParkingPermanent.value ?? 0}
                    onChange={(e) =>
                      onUpdateInput('existingParkingPermanent', {
                        ...inputs.existingParkingPermanent,
                        value: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono text-white text-xs"
                  />
                ) : (
                  <div className="p-1.5 bg-slate-900 rounded text-[10px] text-slate-400 font-sans italic text-center">
                    Данных о свободных машиноместах нет
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-sans">
                <span className="text-slate-300 font-semibold">Баланс мощности:</span>
                <span className="text-sm font-bold text-white font-mono">
                  {outputs.rawBalanceParkingPermanent !== null ? `${outputs.rawBalanceParkingPermanent} м/м` : 'Не определён'}
                </span>
              </div>
            </div>

            {inputs.existingParkingPermanent.qualityStatus === 'no_data' ? (
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Дефицит не определён: нет данных о резерве</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Требуется инвентаризация гаражей и стоянок в радиусе доступности.
                </p>
              </div>
            ) : outputs.unmetParkingPermanent && outputs.unmetParkingPermanent > 0 ? (
              <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Неудовлетворённая потребность: {outputs.unmetParkingPermanent} м/м</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Временные (гостевые) парковки ({outputs.requiredParkingTemporary} м/м) нормируются отдельно.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Остаток резерва: {outputs.remainingReserveParkingPermanent} м/м</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Постоянные машиноместа обеспечены учтённым резервом.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Происхождение: <strong className="text-slate-400 font-mono">{inputs.existingParkingPermanent.provenance}</strong>
          </div>
        </div>

      </div>

      {/* Additional Engineering & Clinic power card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">Поликлиническое обслуживание</span>
              <span className="font-mono text-amber-400 font-bold">{outputs.requiredClinicVisitsPerShift} пос./смену</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Норматив: 6 посещений в смену на 10 000 м² жилья (показатель мощности обслуживания, а не количество поликлиник!)
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenWhyModal('requiredClinic')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap"
        >
          Как рассчитано?
        </button>
      </div>

      {/* Synthetic Demonstration Facilities Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Реестр демонстрационных объектов инфраструктуры (Приволжский р-н Казани)</span>
            </h3>
            <p className="text-xs text-slate-400">
              {MODEL_METADATA.syntheticDataNotice}
            </p>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Синтетический набор
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Название объекта</th>
                <th className="p-2.5">Тип</th>
                <th className="p-2.5">Проектная мощность</th>
                <th className="p-2.5">Текущая загрузка</th>
                <th className="p-2.5">Доступный резерв</th>
                <th className="p-2.5">Качество</th>
                <th className="p-2.5">Статус данных</th>
                <th className="p-2.5 text-right">Учесть в сценарии</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {facilities.map((fac) => (
                <tr key={fac.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-2.5 font-semibold text-slate-200">
                    {fac.name}
                  </td>
                  <td className="p-2.5 text-slate-400">
                    {fac.type === 'school' ? 'Школа' : fac.type === 'kindergarten' ? 'Детсад' : 'Паркинг'}
                  </td>
                  <td className="p-2.5 font-mono text-white">
                    {fac.totalCapacity}
                  </td>
                  <td className="p-2.5 font-mono text-slate-300">
                    {fac.currentLoad !== null ? fac.currentLoad : <span className="text-slate-500">неизвестно</span>}
                  </td>
                  <td className="p-2.5 font-mono font-bold">
                    {fac.availableReserve !== null ? (
                      <span className={fac.availableReserve > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {fac.availableReserve} мест
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">не определён</span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <StatusBadge provenance={fac.provenance} />
                  </td>
                  <td className="p-2.5">
                    <StatusBadge status={fac.qualityStatus} />
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => handleToggleFacility(fac.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                        fac.isIncludedInScenario
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {fac.isIncludedInScenario ? 'Включён' : 'Выключен'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Резерв = max(capacity - load, 0) вычисляется строго при наличии обоих параметров.</span>
          <span>Один объект не может быть учтён дважды в одном расчёте.</span>
        </div>
      </div>

    </div>
  );
};
