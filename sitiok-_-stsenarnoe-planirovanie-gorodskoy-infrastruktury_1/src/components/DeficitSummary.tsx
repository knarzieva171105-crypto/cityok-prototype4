import React from 'react';
import { UrbanCalculationResults, UrbanInputParams } from '../types';
import { School, Baby, Car, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface DeficitSummaryProps {
  params: UrbanInputParams;
  results: UrbanCalculationResults;
  onUpdateExisting: (key: keyof UrbanInputParams, val: number) => void;
}

export const DeficitSummary: React.FC<DeficitSummaryProps> = ({
  params,
  results,
  onUpdateExisting,
}) => {
  return (
    <div className="space-y-4">
      {/* Header and key value banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              Дефицит инфраструктуры ЖК
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium border border-orange-500/30">
              Ядро «СитиОК»
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Баланс между требуемой градостроительной мощностью и существующей емкостью
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3">
          {results.deficitSchool > 0 || results.deficitKindergarten > 0 || results.deficitParking > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Обнаружен дефицит социальных мест</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Все социальные объекты обеспечены на 100%</span>
            </div>
          )}
        </div>
      </div>

      {/* 3 Main Deficit Cards (School, Kindergarten, Parking) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. ШКОЛА */}
        <div
          className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${
            results.deficitSchool > 0
              ? 'bg-gradient-to-b from-rose-950/40 to-slate-900 border-rose-500/40 shadow-xl shadow-rose-950/20'
              : 'bg-gradient-to-b from-emerald-950/30 to-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  results.deficitSchool > 0
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Школы</h3>
                <span className="text-[11px] text-slate-400">Дети 7–18 лет (охват 95%)</span>
              </div>
            </div>

            {results.deficitSchool > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white tracking-wide shadow-sm">
                Дефицит
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white tracking-wide shadow-sm">
                Профицит
              </span>
            )}
          </div>

          <div className="mt-4 mb-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums ${
                  results.deficitSchool > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {results.deficitSchool > 0
                  ? `-${results.deficitSchool.toLocaleString('ru-RU')}`
                  : `+${Math.abs(results.deficitSchool).toLocaleString('ru-RU')}`}
              </span>
              <span className="text-sm font-semibold text-slate-400">мест</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {results.deficitSchool > 0
                ? `Необходимо построить СОШ на ${results.deficitSchool} уч.`
                : 'Существующие мощности полностью покрывают потребность'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Обеспеченность</span>
              <span className="font-semibold text-slate-200 font-mono">
                {results.coverageSchoolPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  results.deficitSchool > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, results.coverageSchoolPercent)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>Требуется: <strong className="text-slate-200 font-mono">{results.requiredSchoolPlaces}</strong></span>
              <span>Существует: <strong className="text-slate-200 font-mono">{params.existingSchoolPlaces}</strong></span>
            </div>

            {/* Quick adjust inline */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Учесть места:</span>
              <div className="flex items-center gap-1">
                {[0, 250, 550, 800].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdateExisting('existingSchoolPlaces', num)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                      params.existingSchoolPlaces === num
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. ДЕТСКИЙ САД */}
        <div
          className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${
            results.deficitKindergarten > 0
              ? 'bg-gradient-to-b from-rose-950/40 to-slate-900 border-rose-500/40 shadow-xl shadow-rose-950/20'
              : 'bg-gradient-to-b from-emerald-950/30 to-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  results.deficitKindergarten > 0
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Детские сады</h3>
                <span className="text-[11px] text-slate-400">Дети 0–7 лет (охват 85%)</span>
              </div>
            </div>

            {results.deficitKindergarten > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white tracking-wide shadow-sm">
                Дефицит
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white tracking-wide shadow-sm">
                Профицит
              </span>
            )}
          </div>

          <div className="mt-4 mb-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums ${
                  results.deficitKindergarten > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {results.deficitKindergarten > 0
                  ? `-${results.deficitKindergarten.toLocaleString('ru-RU')}`
                  : `+${Math.abs(results.deficitKindergarten).toLocaleString('ru-RU')}`}
              </span>
              <span className="text-sm font-semibold text-slate-400">мест</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {results.deficitKindergarten > 0
                ? `Требуется запроектировать ДОО на ${results.deficitKindergarten} мест`
                : 'Потребность в дошкольных местах закрыта'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Обеспеченность</span>
              <span className="font-semibold text-slate-200 font-mono">
                {results.coverageKindergartenPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  results.deficitKindergarten > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, results.coverageKindergartenPercent)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>Требуется: <strong className="text-slate-200 font-mono">{results.requiredKindergartenPlaces}</strong></span>
              <span>Существует: <strong className="text-slate-200 font-mono">{params.existingKindergartenPlaces}</strong></span>
            </div>

            {/* Quick adjust inline */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Учесть места:</span>
              <div className="flex items-center gap-1">
                {[0, 100, 220, 350].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdateExisting('existingKindergartenPlaces', num)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                      params.existingKindergartenPlaces === num
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. ПАРКОВКИ */}
        <div
          className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${
            results.deficitParking > 0
              ? 'bg-gradient-to-b from-rose-950/40 to-slate-900 border-rose-500/40 shadow-xl shadow-rose-950/20'
              : 'bg-gradient-to-b from-emerald-950/30 to-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  results.deficitParking > 0
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Машиноместа</h3>
                <span className="text-[11px] text-slate-400">Постоянные (1 м/м на 80 м²)</span>
              </div>
            </div>

            {results.deficitParking > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white tracking-wide shadow-sm">
                Дефицит
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white tracking-wide shadow-sm">
                Профицит
              </span>
            )}
          </div>

          <div className="mt-4 mb-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums ${
                  results.deficitParking > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {results.deficitParking > 0
                  ? `-${results.deficitParking.toLocaleString('ru-RU')}`
                  : `+${Math.abs(results.deficitParking).toLocaleString('ru-RU')}`}
              </span>
              <span className="text-sm font-semibold text-slate-400">м/м</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {results.deficitParking > 0
                ? `Дефицит постоянных мест: ${results.deficitParking} м/м`
                : 'Постоянные машиноместа полностью обеспечены'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Обеспеченность</span>
              <span className="font-semibold text-slate-200 font-mono">
                {results.coverageParkingPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  results.deficitParking > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, results.coverageParkingPercent)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>Постоянных: <strong className="text-slate-200 font-mono">{results.requiredParkingPermanent}</strong></span>
              <span>Временных: <strong className="text-slate-200 font-mono">{results.requiredParkingTemporary}</strong></span>
              <span>Существует: <strong className="text-slate-200 font-mono">{params.existingParkingPlaces}</strong></span>
            </div>

            {/* Quick adjust inline */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Учесть парковки:</span>
              <div className="flex items-center gap-1">
                {[0, 500, 1000, 1500].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdateExisting('existingParkingPlaces', num)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                      params.existingParkingPlaces === num
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
