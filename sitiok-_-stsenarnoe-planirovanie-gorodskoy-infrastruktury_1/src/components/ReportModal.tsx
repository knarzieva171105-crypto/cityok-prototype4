import React from 'react';
import { UrbanCalculationResults, UrbanInputParams } from '../types';
import { generateAiUrbanAnalysis } from '../utils/calculations';
import { X, Printer, Building2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: UrbanInputParams;
  results: UrbanCalculationResults;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  params,
  results,
}) => {
  if (!isOpen) return null;

  const analysis = generateAiUrbanAnalysis(params, results);
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">
              Градостроительное заключение «СитиОК»
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Печать / Сохранить в PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Report Document */}
        <div className="space-y-6 print:space-y-4 print:text-xs">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 print:border-black pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-orange-500 print:text-black" />
                <span className="text-xl font-black tracking-tight text-white print:text-black font-sans">
                  СИТИ<span className="text-orange-500 print:text-black">ОК</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                Автоматизированная система сценарного планирования городской инфраструктуры
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono">
              <div>Дата: {currentDate}</div>
              <div>Генплан г. Казани / РНГП</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2">
            <h2 className="text-lg font-bold uppercase tracking-wide text-white print:text-black">
              ЗАКЛЮЧЕНИЕ ОБ ОБЕСПЕЧЕННОСТИ СОЦИАЛЬНОЙ ИНФРАСТРУКТУРОЙ
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              по планируемому объекту капитального строительства жилого назначения
            </p>
          </div>

          {/* Table: Basic Site Metrics */}
          <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-800/60 print:bg-slate-100 px-4 py-2 font-bold text-xs text-slate-200 print:text-black">
              1. Основные технико-экономические показатели (ТЭП)
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-800 print:divide-slate-300 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Площадь участка:</span>
                <span className="font-mono font-bold">{params.siteAreaHa} га</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Этажность:</span>
                <span className="font-mono font-bold">{params.floors} эт.</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Коэффициент застройки (Кз):</span>
                <span className="font-mono font-bold">{params.buildingRatio.toFixed(2)}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Пятно застройки:</span>
                <span className="font-mono font-bold">{results.buildingFootprintHa} га ({results.buildingFootprintM2.toLocaleString('ru-RU')} м²)</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Общая площадь жилья:</span>
                <span className="font-mono font-bold">{results.totalHousingArea.toLocaleString('ru-RU')} м²</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Плотность застройки (Казань ≤12):</span>
                <span className={`font-mono font-bold ${results.buildingDensityOk ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-700'}`}>
                  {results.buildingDensity} тыс. м²/га ({results.buildingDensityOk ? 'Соответствует' : 'Превышение'})
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Расчетное население:</span>
                <span className="font-mono font-bold">{results.population.toLocaleString('ru-RU')} чел. ({results.apartmentsCount.toLocaleString('ru-RU')} кв.)</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Плотность населения (≤210):</span>
                <span className={`font-mono font-bold ${results.populationDensityOk ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-700'}`}>
                  {results.populationDensity} чел./га
                </span>
              </div>
            </div>
          </div>

          {/* Table: Social Infrastructure Balance */}
          <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-800/60 print:bg-slate-100 px-4 py-2 font-bold text-xs text-slate-200 print:text-black">
              2. Баланс обеспеченности социальной и транспортной инфраструктурой
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 bg-slate-850/40 print:bg-slate-50 text-[11px] text-slate-400 print:text-slate-700">
                  <th className="p-2.5">Тип инфраструктуры</th>
                  <th className="p-2.5">Норматив охвата</th>
                  <th className="p-2.5">Требуется</th>
                  <th className="p-2.5">Существует</th>
                  <th className="p-2.5 text-right">Дефицит / Профицит</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200 font-mono">
                <tr>
                  <td className="p-2.5 font-sans font-medium">Школы общеобразовательные (7–18 лет)</td>
                  <td className="p-2.5 text-slate-400 print:text-slate-600 font-sans">95% охвата (95 на 100 детей)</td>
                  <td className="p-2.5 font-bold">{results.requiredSchoolPlaces} мест</td>
                  <td className="p-2.5">{params.existingSchoolPlaces} мест</td>
                  <td className={`p-2.5 text-right font-bold ${results.deficitSchool > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-black'}`}>
                    {results.deficitSchool > 0 ? `Дефицит: -${results.deficitSchool}` : `Резерв: +${Math.abs(results.deficitSchool)}`}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium">Детские сады (0–7 лет)</td>
                  <td className="p-2.5 text-slate-400 print:text-slate-600 font-sans">85% охвата</td>
                  <td className="p-2.5 font-bold">{results.requiredKindergartenPlaces} мест</td>
                  <td className="p-2.5">{params.existingKindergartenPlaces} мест</td>
                  <td className={`p-2.5 text-right font-bold ${results.deficitKindergarten > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-black'}`}>
                    {results.deficitKindergarten > 0 ? `Дефицит: -${results.deficitKindergarten}` : `Резерв: +${Math.abs(results.deficitKindergarten)}`}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium">Машиноместа (постоянные)</td>
                  <td className="p-2.5 text-slate-400 print:text-slate-600 font-sans">1 м/м на 80 м² жилья</td>
                  <td className="p-2.5 font-bold">{results.requiredParkingPermanent} м/м</td>
                  <td className="p-2.5">{params.existingParkingPlaces} м/м</td>
                  <td className={`p-2.5 text-right font-bold ${results.deficitParking > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-black'}`}>
                    {results.deficitParking > 0 ? `Дефицит: -${results.deficitParking}` : `Резерв: +${Math.abs(results.deficitParking)}`}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium">Озеленение территории</td>
                  <td className="p-2.5 text-slate-400 print:text-slate-600 font-sans">≥ 6.0 м²/чел</td>
                  <td className="p-2.5 font-bold">{results.greeningArea.toLocaleString('ru-RU')} м²</td>
                  <td className="p-2.5">{(results.remainingPlotAreaM2).toLocaleString('ru-RU')} м² (двор)</td>
                  <td className="p-2.5 text-right font-bold text-emerald-400 print:text-black">
                    Обеспечено ({results.greeningProvision} м²/чел)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI conclusion & urban recommendations */}
          <div className="p-4 rounded-xl bg-slate-800/40 print:bg-slate-100 border border-slate-700 print:border-slate-300 space-y-2 text-xs">
            <h4 className="font-bold text-slate-200 print:text-black flex items-center gap-1.5">
              <span>3. Аналитический вывод и рекомендации ИИ «СитиОК»</span>
            </h4>
            <p className="text-slate-300 print:text-slate-800 leading-relaxed">
              {analysis.summary}
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-slate-800 pt-1">
              {analysis.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Official Signatures Stamp Area */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-400 flex justify-between items-end text-xs text-slate-400 print:text-slate-700">
            <div>
              <p className="font-semibold text-slate-300 print:text-black">Аналитик градостроительного планирования:</p>
              <p className="mt-4 border-b border-slate-600 print:border-black w-48" />
              <p className="text-[10px] mt-1">подпись / расшифровка</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 border-2 border-orange-500/40 print:border-black rounded-full flex flex-col items-center justify-center text-[9px] uppercase font-bold text-orange-400 print:text-black mx-auto">
                <span>М.П.</span>
                <span>СИТИОК</span>
                <span>MVP КАЗАНЬ</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
