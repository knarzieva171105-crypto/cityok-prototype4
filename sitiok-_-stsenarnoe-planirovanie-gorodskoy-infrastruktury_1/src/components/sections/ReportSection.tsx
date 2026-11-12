import React from 'react';
import { ModelInputs, ModelOutputs, Scenario, RecommendationItem } from '../../types/model';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  Download,
  Building2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import {
  MODEL_METADATA,
  TYPOLOGY_LABELS,
  HOUSING_CLASS_LABELS,
  LOCATION_CONTEXT_LABELS,
} from '../../constants/modelConfig';

interface ReportSectionProps {
  scenario: Scenario;
  inputs: ModelInputs;
  outputs: ModelOutputs;
  recommendations: RecommendationItem[];
  onExportExcel: () => void;
  onExportJson: () => void;
  onOpenWhyModal: (metricKey: string) => void;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  scenario,
  inputs,
  outputs,
  recommendations,
  onExportExcel,
  onExportJson,
  onOpenWhyModal,
}) => {
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      {/* Top Banner & Action Controls */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Раздел 6. Градостроительный паспорт и отчётность
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Сводная ведомость ТЭП, баланса социальной инфраструктуры и перечня компенсационных мероприятий
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Экспорт XLSX</span>
          </button>

          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Report Document Header */}
        <div className="flex justify-between items-start border-b border-slate-800 print:border-black pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-500 print:text-black" />
              <span className="text-xl font-black tracking-tight text-white print:text-black font-sans">
                СИТИ<span className="text-amber-500 print:text-black">ОК</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 print:bg-slate-200 text-slate-300 print:text-black font-mono">
                {MODEL_METADATA.version}
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              {MODEL_METADATA.subtitle}
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono">
            <div>Дата формирования: {currentDate}</div>
            <div>Территория: {MODEL_METADATA.testTerritory}</div>
            <div>Сценарий: «{scenario.name}»</div>
          </div>
        </div>

        {/* Mandatory Warning */}
        <div className="p-3 bg-amber-500/10 print:bg-slate-100 border border-amber-500/30 print:border-slate-400 rounded-lg text-xs text-amber-300 print:text-black">
          <strong>Внимание:</strong> {MODEL_METADATA.constantNotice}
        </div>

        {/* 1. Project Passport & Typology */}
        <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
          <div className="bg-slate-800/60 print:bg-slate-100 px-4 py-2 font-bold text-xs text-slate-200 print:text-black">
            1. Паспорт градостроительного проекта
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-800 print:divide-slate-300 text-xs">
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Типология застройки:</span>
              <span className="font-bold text-white print:text-black">{TYPOLOGY_LABELS[inputs.typology]?.label}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Класс жилья:</span>
              <span className="font-bold text-amber-400 print:text-black">{HOUSING_CLASS_LABELS[inputs.housingClass]?.label}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Контекст территории:</span>
              <span className="font-bold text-white print:text-black">{LOCATION_CONTEXT_LABELS[inputs.locationContext]?.label}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Площадь участка:</span>
              <span className="font-mono font-bold">{inputs.siteAreaHa} га</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Этажность:</span>
              <span className="font-mono font-bold">{inputs.floors} эт.</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Коэф. застройки:</span>
              <span className="font-mono font-bold">{inputs.buildingCoverage}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Ср. площадь квартиры:</span>
              <span className="font-mono font-bold">{inputs.averageApartmentAreaM2} м²</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Жил. обеспеченность:</span>
              <span className="font-mono font-bold">{inputs.housingProvisionM2PerPerson} м²/чел.</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Семейственность:</span>
              <span className="font-mono font-bold">{inputs.householdSize} чел./кв.</span>
            </div>
          </div>
        </div>

        {/* 2. Calculated TEP Table */}
        <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
          <div className="bg-slate-800/60 print:bg-slate-100 px-4 py-2 font-bold text-xs text-slate-200 print:text-black flex justify-between items-center">
            <span>2. Результаты расчёта технико-экономических показателей (ТЭП)</span>
            <span className="text-[10px] text-slate-400 font-normal print:hidden">Нажмите на показатель для формулы</span>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-850/40 print:bg-slate-50 text-[11px] text-slate-400 print:text-slate-700 border-b border-slate-800 print:border-slate-300">
              <tr>
                <th className="p-2.5">Показатель</th>
                <th className="p-2.5">Результат</th>
                <th className="p-2.5">Ориентир норматива</th>
                <th className="p-2.5">Статус соответствия</th>
                <th className="p-2.5 text-right">Расчётная формула</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200 font-mono">
              <tr className="hover:bg-slate-800/20 cursor-pointer print:cursor-auto" onClick={() => onOpenWhyModal('buildingFootprint')}>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Площадь застройки</td>
                <td className="p-2.5 font-bold text-white print:text-black">{outputs.buildingFootprintHa} га</td>
                <td className="p-2.5 text-slate-400">—</td>
                <td className="p-2.5 text-slate-400">В норме</td>
                <td className="p-2.5 text-right text-slate-400">Участок × Коэф. застройки</td>
              </tr>
              <tr className="hover:bg-slate-800/20 cursor-pointer print:cursor-auto" onClick={() => onOpenWhyModal('totalHousingArea')}>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Общая площадь жилья</td>
                <td className="p-2.5 font-bold text-white print:text-black">{outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м²</td>
                <td className="p-2.5 text-slate-400">—</td>
                <td className="p-2.5 text-slate-400">В норме</td>
                <td className="p-2.5 text-right text-slate-400">Застройка × Этажность × 10 000</td>
              </tr>
              <tr className="hover:bg-slate-800/20 cursor-pointer print:cursor-auto" onClick={() => onOpenWhyModal('buildingDensity')}>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Плотность застройки</td>
                <td className="p-2.5 font-bold text-white print:text-black">{outputs.buildingDensityThousandM2PerHa.toFixed(2)} тыс. м²/га</td>
                <td className="p-2.5 text-slate-400">≤ 12.0 тыс. м²/га</td>
                <td className={`p-2.5 font-bold ${outputs.benchmarks.buildingDensity.status === 'compliant' ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-700'}`}>
                  {outputs.benchmarks.buildingDensity.statusLabel}
                </td>
                <td className="p-2.5 text-right text-slate-400">Жилье / Участок / 1000</td>
              </tr>
              <tr className="hover:bg-slate-800/20 cursor-pointer print:cursor-auto" onClick={() => onOpenWhyModal('apartmentsCount')}>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Количество квартир</td>
                <td className="p-2.5 font-bold text-white print:text-black">{outputs.apartmentsCount.toLocaleString('ru-RU')} кв.</td>
                <td className="p-2.5 text-slate-400">—</td>
                <td className="p-2.5 text-slate-400">В норме</td>
                <td className="p-2.5 text-right text-slate-400">ROUND(Жилье / Ср. площадь, 0)</td>
              </tr>
              <tr className="hover:bg-slate-800/20 cursor-pointer print:cursor-auto" onClick={() => onOpenWhyModal('population')}>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Численность населения</td>
                <td className="p-2.5 font-bold text-white print:text-black">{Math.round(outputs.population).toLocaleString('ru-RU')} чел.</td>
                <td className="p-2.5 text-slate-400">—</td>
                <td className="p-2.5 text-slate-400">В норме</td>
                <td className="p-2.5 text-right text-slate-400">
                  {inputs.calculationMode === 'housing_provision' ? 'Жилье / Жил. обеспеченность' : 'ROUND(Квартиры × Семейственность, 0)'}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/20 cursor-pointer print:cursor-auto" onClick={() => onOpenWhyModal('populationDensity')}>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Плотность населения</td>
                <td className="p-2.5 font-bold text-white print:text-black">{outputs.populationDensityPerHa.toFixed(1)} чел./га</td>
                <td className="p-2.5 text-slate-400">≤ 210.0 чел./га</td>
                <td className={`p-2.5 font-bold ${outputs.benchmarks.populationDensity.status === 'compliant' ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-700'}`}>
                  {outputs.benchmarks.populationDensity.statusLabel}
                </td>
                <td className="p-2.5 text-right text-slate-400">Население / Участок</td>
              </tr>
              <tr className="hover:bg-slate-800/20 cursor-pointer print:cursor-auto" onClick={() => onOpenWhyModal('greeningProvision')}>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Озеленение на жителя</td>
                <td className="p-2.5 font-bold text-white print:text-black">{outputs.greeningProvisionM2PerPerson.toFixed(2)} м²/чел.</td>
                <td className="p-2.5 text-slate-400">≥ 6.0 м²/чел.</td>
                <td className="p-2.5 font-bold text-emerald-400 print:text-black">
                  {outputs.benchmarks.greeningProvision.statusLabel}
                </td>
                <td className="p-2.5 text-right text-slate-400">Озеленение / Население</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. Infrastructure Balance Table */}
        <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
          <div className="bg-slate-800/60 print:bg-slate-100 px-4 py-2 font-bold text-xs text-slate-200 print:text-black">
            3. Сопоставление потребности с подтверждённым резервом
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-850/40 print:bg-slate-50 text-[11px] text-slate-400 print:text-slate-700 border-b border-slate-800 print:border-slate-300">
              <tr>
                <th className="p-2.5">Объект инфраструктуры</th>
                <th className="p-2.5">Расчётная потребность</th>
                <th className="p-2.5">Учтённый резерв</th>
                <th className="p-2.5">Статус данных</th>
                <th className="p-2.5 text-right">Итог дефицита / резерва</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200 font-mono">
              <tr>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Школа (7–18 лет, 95% охват)</td>
                <td className="p-2.5 font-bold">{outputs.requiredSchoolPlaces} мест</td>
                <td className="p-2.5">{inputs.existingSchool.value !== null ? `${inputs.existingSchool.value} мест` : 'нет данных'}</td>
                <td className="p-2.5 font-sans text-slate-400">{inputs.existingSchool.qualityStatus === 'fact' ? 'Факт' : 'Оценка'}</td>
                <td className={`p-2.5 text-right font-bold ${outputs.unmetSchool && outputs.unmetSchool > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-black'}`}>
                  {outputs.unmetSchool !== null ? (outputs.unmetSchool > 0 ? `Дефицит -${outputs.unmetSchool} мест` : `Резерв +${outputs.remainingReserveSchool} мест`) : 'Не определён'}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Детсад (0–7 лет, 85% охват)</td>
                <td className="p-2.5 font-bold">{outputs.requiredKindergartenPlaces} мест</td>
                <td className="p-2.5">{inputs.existingKindergarten.value !== null ? `${inputs.existingKindergarten.value} мест` : 'нет данных'}</td>
                <td className="p-2.5 font-sans text-slate-400">{inputs.existingKindergarten.qualityStatus === 'fact' ? 'Факт' : 'Оценка'}</td>
                <td className={`p-2.5 text-right font-bold ${outputs.unmetKindergarten && outputs.unmetKindergarten > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-black'}`}>
                  {outputs.unmetKindergarten !== null ? (outputs.unmetKindergarten > 0 ? `Дефицит -${outputs.unmetKindergarten} мест` : `Резерв +${outputs.remainingReserveKindergarten} мест`) : 'Не определён'}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Постоянная парковка (1 на 80 м²)</td>
                <td className="p-2.5 font-bold">{outputs.requiredParkingPermanent} м/м</td>
                <td className="p-2.5">{inputs.existingParkingPermanent.value !== null ? `${inputs.existingParkingPermanent.value} м/м` : 'нет данных'}</td>
                <td className="p-2.5 font-sans text-slate-400">{inputs.existingParkingPermanent.qualityStatus === 'fact' ? 'Факт' : 'Оценка'}</td>
                <td className={`p-2.5 text-right font-bold ${outputs.unmetParkingPermanent && outputs.unmetParkingPermanent > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-black'}`}>
                  {outputs.unmetParkingPermanent !== null ? (outputs.unmetParkingPermanent > 0 ? `Дефицит -${outputs.unmetParkingPermanent} м/м` : `Резерв +${outputs.remainingReserveParkingPermanent} м/м`) : 'Не определён'}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">Поликлиническое обслуживание</td>
                <td className="p-2.5 font-bold">{outputs.requiredClinicVisitsPerShift} пос./смену</td>
                <td className="p-2.5 text-slate-400">—</td>
                <td className="p-2.5 font-sans text-slate-400">Норматив</td>
                <td className="p-2.5 text-right font-sans text-slate-400">Мощность обслуживания</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. Recommendations & Measures */}
        <div className="p-4 rounded-xl bg-slate-800/40 print:bg-slate-50 border border-slate-700 print:border-slate-300 space-y-2 text-xs">
          <span className="font-bold text-white print:text-black block text-sm">
            4. Первоочередные мероприятия градостроительного планирования
          </span>
          <div className="space-y-2 pt-1">
            {recommendations.map((r) => (
              <div key={r.id} className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 print:text-black">{r.action}</span>
                  <span className="text-[10px] font-mono text-amber-400 print:text-black uppercase font-bold">{r.recommendedStage}</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-700">{r.rationale}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-6 border-t border-slate-800 print:border-black flex justify-between items-end text-xs text-slate-400 print:text-black">
          <div>
            <p className="font-semibold text-slate-200 print:text-black">Аналитик-градостроитель:</p>
            <p className="mt-4 border-b border-slate-600 print:border-black w-48" />
            <p className="text-[10px] mt-0.5">подпись / расшифровка</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 border border-dashed border-amber-500/60 print:border-black rounded-full flex flex-col items-center justify-center text-[9px] uppercase font-bold text-amber-400 print:text-black">
              <span>СИТИОК</span>
              <span>ПАСПОРТ</span>
              <span>ПРОЕКТА</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
