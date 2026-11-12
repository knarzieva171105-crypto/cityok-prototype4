import React from 'react';
import { ModelInputs, ModelOutputs, Scenario, RecommendationItem } from '../../types/model';
import { MODEL_METADATA, TYPOLOGY_LABELS, HOUSING_CLASS_LABELS, LOCATION_CONTEXT_LABELS } from '../../constants/modelConfig';
import { X, Printer, Building2, FileText } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  inputs: ModelInputs;
  outputs: ModelOutputs;
  recommendations: RecommendationItem[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  inputs,
  outputs,
  recommendations,
}) => {
  if (!isOpen) return null;

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
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[92vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:bg-white print:text-black print:p-0">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Печатный паспорт градостроительного расчёта «СитиОК»
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Печать / Сохранить в PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 print:space-y-4 print:text-xs">
          
          {/* Header */}
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

          {/* Section 1: Inputs */}
          <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-800/60 print:bg-slate-100 px-4 py-2 font-bold text-xs text-slate-200 print:text-black">
              1. Исходные параметры сценария
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-800 print:divide-slate-300 text-xs">
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Типология:</span>
                <span className="font-bold">{TYPOLOGY_LABELS[inputs.typology]?.label}</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Класс жилья:</span>
                <span className="font-bold">{HOUSING_CLASS_LABELS[inputs.housingClass]?.label}</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Контекст:</span>
                <span className="font-bold">{LOCATION_CONTEXT_LABELS[inputs.locationContext]?.label}</span>
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
                <span className="text-slate-400 print:text-slate-600">Ср. площадь кв.:</span>
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
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Доля детей 0–7 лет:</span>
                <span className="font-mono font-bold">{(inputs.childSharePreschool * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Доля детей 7–18 лет:</span>
                <span className="font-mono font-bold">{(inputs.childShareSchool * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Метод расчёта населения:</span>
                <span className="font-mono font-bold">
                  {inputs.calculationMode === 'housing_provision' ? 'По жил. обеспеченности' : 'По семейственности'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Calculated TEP */}
          <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-800/60 print:bg-slate-100 px-4 py-2 font-bold text-xs text-slate-200 print:text-black">
              2. Результаты расчёта технико-экономических показателей (ТЭП)
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-850/40 print:bg-slate-50 text-[11px] text-slate-400 print:text-slate-700 border-b border-slate-800 print:border-slate-300">
                <tr>
                  <th className="p-2">Показатель</th>
                  <th className="p-2">Результат</th>
                  <th className="p-2">Ориентир</th>
                  <th className="p-2">Статус проверки</th>
                  <th className="p-2 text-right">Расчётная формула</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200 font-mono">
                <tr>
                  <td className="p-2 font-sans font-medium">Площадь застройки</td>
                  <td className="p-2 font-bold text-white print:text-black">{outputs.buildingFootprintHa} га</td>
                  <td className="p-2 text-slate-400">—</td>
                  <td className="p-2 text-slate-400">В норме</td>
                  <td className="p-2 text-right text-slate-400">Участок × Коэф. застройки</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Общая площадь жилья</td>
                  <td className="p-2 font-bold text-white print:text-black">{outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м²</td>
                  <td className="p-2 text-slate-400">—</td>
                  <td className="p-2 text-slate-400">В норме</td>
                  <td className="p-2 text-right text-slate-400">Застройка × Этажность × 10 000</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Плотность застройки</td>
                  <td className="p-2 font-bold text-white print:text-black">{outputs.buildingDensityThousandM2PerHa.toFixed(2)} тыс. м²/га</td>
                  <td className="p-2 text-slate-400">≤ 12.0</td>
                  <td className={`p-2 font-bold ${outputs.benchmarks.buildingDensity.status === 'compliant' ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-700'}`}>
                    {outputs.benchmarks.buildingDensity.statusLabel}
                  </td>
                  <td className="p-2 text-right text-slate-400">Жилье / Участок / 1000</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Количество квартир</td>
                  <td className="p-2 font-bold text-white print:text-black">{outputs.apartmentsCount.toLocaleString('ru-RU')} кв.</td>
                  <td className="p-2 text-slate-400">—</td>
                  <td className="p-2 text-slate-400">В норме</td>
                  <td className="p-2 text-right text-slate-400">ROUND(Жилье / Ср. площадь, 0)</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Численность населения</td>
                  <td className="p-2 font-bold text-white print:text-black">{Math.round(outputs.population).toLocaleString('ru-RU')} чел.</td>
                  <td className="p-2 text-slate-400">—</td>
                  <td className="p-2 text-slate-400">В норме</td>
                  <td className="p-2 text-right text-slate-400">
                    {inputs.calculationMode === 'housing_provision' ? 'Жилье / Жил. обеспеченность' : 'ROUND(Квартиры × Семейственность, 0)'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Плотность населения</td>
                  <td className="p-2 font-bold text-white print:text-black">{outputs.populationDensityPerHa.toFixed(1)} чел./га</td>
                  <td className="p-2 text-slate-400">≤ 210.0</td>
                  <td className={`p-2 font-bold ${outputs.benchmarks.populationDensity.status === 'compliant' ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-700'}`}>
                    {outputs.benchmarks.populationDensity.statusLabel}
                  </td>
                  <td className="p-2 text-right text-slate-400">Население / Участок</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Озеленение на жителя</td>
                  <td className="p-2 font-bold text-white print:text-black">{outputs.greeningProvisionM2PerPerson.toFixed(2)} м²/чел.</td>
                  <td className="p-2 text-slate-400">≥ 6.0</td>
                  <td className="p-2 font-bold text-emerald-400 print:text-black">
                    {outputs.benchmarks.greeningProvision.statusLabel}
                  </td>
                  <td className="p-2 text-right text-slate-400">Озеленение / Население</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Infrastructure Balance */}
          <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-800/60 print:bg-slate-100 px-4 py-2 font-bold text-xs text-slate-200 print:text-black">
              3. Сопоставление потребности с подтверждённым резервом
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-850/40 print:bg-slate-50 text-[11px] text-slate-400 print:text-slate-700 border-b border-slate-800 print:border-slate-300">
                <tr>
                  <th className="p-2">Объект</th>
                  <th className="p-2">Спрос</th>
                  <th className="p-2">Учтённый резерв</th>
                  <th className="p-2">Статус данных</th>
                  <th className="p-2 text-right">Итог дефицита / резерва</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200 font-mono">
                <tr>
                  <td className="p-2 font-sans font-medium text-slate-200 print:text-black">Школа (7–18 лет, 95%)</td>
                  <td className="p-2 font-bold">{outputs.requiredSchoolPlaces} мест</td>
                  <td className="p-2">{inputs.existingSchool.value ?? 'нет данных'} мест</td>
                  <td className="p-2 font-sans text-slate-400">{inputs.existingSchool.qualityStatus}</td>
                  <td className={`p-2 text-right font-bold ${outputs.unmetSchool && outputs.unmetSchool > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-black'}`}>
                    {outputs.unmetSchool !== null ? (outputs.unmetSchool > 0 ? `Дефицит -${outputs.unmetSchool} мест` : `Резерв +${outputs.remainingReserveSchool} мест`) : 'Не определён'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium text-slate-200 print:text-black">Детсад (0–7 лет, 85%)</td>
                  <td className="p-2 font-bold">{outputs.requiredKindergartenPlaces} мест</td>
                  <td className="p-2">{inputs.existingKindergarten.value ?? 'нет данных'} мест</td>
                  <td className="p-2 font-sans text-slate-400">{inputs.existingKindergarten.qualityStatus}</td>
                  <td className={`p-2 text-right font-bold ${outputs.unmetKindergarten && outputs.unmetKindergarten > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-black'}`}>
                    {outputs.unmetKindergarten !== null ? (outputs.unmetKindergarten > 0 ? `Дефицит -${outputs.unmetKindergarten} мест` : `Резерв +${outputs.remainingReserveKindergarten} мест`) : 'Не определён'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium text-slate-200 print:text-black">Постоянная парковка (1/80)</td>
                  <td className="p-2 font-bold">{outputs.requiredParkingPermanent} м/м</td>
                  <td className="p-2">{inputs.existingParkingPermanent.value ?? 'нет данных'} м/м</td>
                  <td className="p-2 font-sans text-slate-400">{inputs.existingParkingPermanent.qualityStatus}</td>
                  <td className={`p-2 text-right font-bold ${outputs.unmetParkingPermanent && outputs.unmetParkingPermanent > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-black'}`}>
                    {outputs.unmetParkingPermanent !== null ? (outputs.unmetParkingPermanent > 0 ? `Дефицит -${outputs.unmetParkingPermanent} м/м` : `Резерв +${outputs.remainingReserveParkingPermanent} м/м`) : 'Не определён'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Recommendations */}
          <div className="p-3 rounded-xl bg-slate-800/40 print:bg-slate-50 border border-slate-700 print:border-slate-300 space-y-2 text-xs">
            <span className="font-bold text-white print:text-black block">
              4. Первоочередные мероприятия градостроительного планирования
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-slate-800">
              {recommendations.slice(0, 4).map((r) => (
                <li key={r.id} className="leading-relaxed">
                  <strong>{r.action}</strong>: {r.rationale}
                </li>
              ))}
            </ul>
          </div>

          {/* Signatures and Stamp */}
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
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
