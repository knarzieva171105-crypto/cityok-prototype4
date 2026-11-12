import * as XLSX from 'xlsx';
import { ModelOutputs, Scenario } from '../types/model';
import {
  MODEL_METADATA,
  TYPOLOGY_LABELS,
  HOUSING_CLASS_LABELS,
  LOCATION_CONTEXT_LABELS,
} from '../constants/modelConfig';

export function exportScenarioToExcel(
  scenario: Scenario,
  outputs: ModelOutputs
): void {
  const wb = XLSX.utils.book_new();
  const inputs = scenario.inputs;

  // 1. Паспорт проекта и входные параметры
  const inputsData = [
    ['Параметр проекта', 'Значение', 'Единица', 'Качество данных', 'Методическое описание'],
    ['Название сценария', scenario.name, '—', 'пользовательский', scenario.description],
    ['Типология застройки', TYPOLOGY_LABELS[inputs.typology]?.label || inputs.typology, '—', 'проект', TYPOLOGY_LABELS[inputs.typology]?.desc || ''],
    ['Класс жилья', HOUSING_CLASS_LABELS[inputs.housingClass]?.label || inputs.housingClass, '—', 'проект', HOUSING_CLASS_LABELS[inputs.housingClass]?.desc || ''],
    ['Градостроительный контекст', LOCATION_CONTEXT_LABELS[inputs.locationContext]?.label || inputs.locationContext, '—', 'проект', LOCATION_CONTEXT_LABELS[inputs.locationContext]?.desc || ''],
    ['Площадь земельного участка', inputs.siteAreaHa, 'га', 'факт/проект', 'Базовая пространственная граница элемента планировочной структуры'],
    ['Этажность застройки', inputs.floors, 'эт.', 'проект', 'Средняя/расчётная этажность корпусов жилого комплекса'],
    ['Коэффициент застройки', inputs.buildingCoverage, 'доля', 'проект', 'Отношение площади застройки к площади земельного участка (0 < Kз <= 1)'],
    ['Средняя площадь квартиры', inputs.averageApartmentAreaM2, 'м²', 'проект', 'Средневзвешенная площадь жилой единицы проекта'],
    ['Жилищная обеспеченность', inputs.housingProvisionM2PerPerson, 'м²/чел.', 'норматив', 'Расчётная жилищная обеспеченность на одного жителя'],
    ['Коэффициент семейственности', inputs.householdSize, 'чел./кв.', 'демография', inputs.calculationMode === 'housing_provision' ? 'Аналитический показатель структуры домохозяйства' : 'Используется для расчёта населения (Квартиры × Семейственность)'],
    ['Норматив озеленения', inputs.greeningNorm, 'м²/чел.', 'норматив', 'Ориентир удельной площади озеленения общего пользования на жителя'],
    ['Доля детей 0–7 лет (дошкольники)', `${(inputs.childSharePreschool * 100).toFixed(1)}%`, 'доля', 'демография', 'Сценарная доля возрастной когорты ДОО'],
    ['Доля детей 7–18 лет (школьники)', `${(inputs.childShareSchool * 100).toFixed(1)}%`, 'доля', 'демография', 'Сценарная доля возрастной когорты СОШ'],
    ['Существующие места в ДОО', inputs.existingKindergarten.value ?? 'нет данных', 'мест', inputs.existingKindergarten.qualityStatus, inputs.existingKindergarten.sourceNotes ?? ''],
    ['Существующие места в СОШ', inputs.existingSchool.value ?? 'нет данных', 'мест', inputs.existingSchool.qualityStatus, inputs.existingSchool.sourceNotes ?? ''],
    ['Существующие постоянные машиноместа', inputs.existingParkingPermanent.value ?? 'нет данных', 'м/м', inputs.existingParkingPermanent.qualityStatus, inputs.existingParkingPermanent.sourceNotes ?? ''],
    ['Метод расчёта населения', inputs.calculationMode === 'housing_provision' ? 'По жилищной обеспеченности' : 'По семейственности домохозяйств', '—', 'настройка', ''],
  ];
  const wsInputs = XLSX.utils.aoa_to_sheet(inputsData);
  XLSX.utils.book_append_sheet(wb, wsInputs, 'Параметры_проекта');

  // 2. Результаты расчёта ТЭП
  const tepData = [
    ['Технико-экономический показатель', 'Значение', 'Единица', 'Ориентир норматива', 'Статус соответствия', 'Расчётная формула'],
    ['Площадь застройки', outputs.buildingFootprintHa, 'га', '—', '—', 'Площадь участка × Коэффициент застройки'],
    ['Общая площадь жилья', outputs.totalHousingAreaM2, 'м²', '—', '—', 'Площадь застройки × Этажность × 10 000'],
    ['Плотность застройки', outputs.buildingDensityThousandM2PerHa, 'тыс. м²/га', '<= 12.0', outputs.benchmarks.buildingDensity.statusLabel, 'Общая площадь жилья / Площадь участка / 1000'],
    ['Количество квартир', outputs.apartmentsCount, 'кв.', '—', '—', 'ROUND(Общая площадь жилья / Средняя площадь квартиры, 0)'],
    ['Численность населения', outputs.population, 'чел.', '—', '—', inputs.calculationMode === 'housing_provision' ? 'Общая площадь жилья / Жилищная обеспеченность' : 'ROUND(Количество квартир × Семейственность, 0)'],
    ['Плотность населения', outputs.populationDensityPerHa, 'чел./га', '<= 210.0', outputs.benchmarks.populationDensity.statusLabel, 'Численность населения / Площадь участка'],
    ['Площадь озеленения', outputs.greeningAreaM2, 'м²', '—', '—', 'Площадь участка × 10 000 × 0.25 (нормативная доля)'],
    ['Обеспеченность озеленением', outputs.greeningProvisionM2PerPerson, 'м²/чел.', '>= 6.0', outputs.benchmarks.greeningProvision.statusLabel, 'Площадь озеленения / Численность населения'],
    ['Потребность: места в детсадах', outputs.requiredKindergartenPlaces, 'мест', 'до 350 на здание', 'Охват 85%', 'ROUND(Население × Доля детей 0-7 × 0.85, 0)'],
    ['Потребность: места в школах', outputs.requiredSchoolPlaces, 'мест', 'от 500 на здание', 'Охват 95%', 'ROUND(Население × Доля детей 7-18 × 0.95, 0)'],
    ['Потребность: постоянные машиноместа', outputs.requiredParkingPermanent, 'м/м', '1 место на 80 м²', 'Хранение жителей', 'ROUND(Площадь жилья / 80, 0)'],
    ['Потребность: временные машиноместа', outputs.requiredParkingTemporary, 'м/м', '1 место на 560 м²', 'Гостевые стоянки', 'ROUND(Площадь жилья / 560, 0)'],
    ['Потребность: поликлиника (мощность)', outputs.requiredClinicVisitsPerShift, 'посещений в смену', '6 на 10 000 м²', 'Показатель мощности', 'ROUND(Площадь жилья / 10 000 × 6, 0)'],
    ['Баланс мест в детсадах', outputs.rawBalanceKindergarten ?? 'нет данных', 'мест', '—', outputs.unmetKindergarten && outputs.unmetKindergarten > 0 ? `Дефицит (-${outputs.unmetKindergarten})` : `Резерв (+${outputs.remainingReserveKindergarten ?? 0})`, 'Потребность в ДОО - Существующий резерв'],
    ['Баланс мест в школах', outputs.rawBalanceSchool ?? 'нет данных', 'мест', '—', outputs.unmetSchool && outputs.unmetSchool > 0 ? `Дефицит (-${outputs.unmetSchool})` : `Резерв (+${outputs.remainingReserveSchool ?? 0})`, 'Потребность в СОШ - Существующий резерв'],
    ['Баланс постоянных парковок', outputs.rawBalanceParkingPermanent ?? 'нет данных', 'м/м', '—', outputs.unmetParkingPermanent && outputs.unmetParkingPermanent > 0 ? `Дефицит (-${outputs.unmetParkingPermanent})` : `Резерв (+${outputs.remainingReserveParkingPermanent ?? 0})`, 'Потребность в парковках - Существующий резерв'],
    ['Альтернативная обеспеченность жильём', outputs.alternativeHousingProvision, 'м²/чел.', '—', 'Аналитический', 'Средняя площадь квартиры / Семейственность'],
  ];
  const wsTep = XLSX.utils.aoa_to_sheet(tepData);
  XLSX.utils.book_append_sheet(wb, wsTep, 'ТЭП_и_балансы');

  // 3. Методология и примечания
  const descData = [
    ['Раздел', 'Методическое описание модели СитиОК'],
    ['Продукт', `${MODEL_METADATA.name} — ${MODEL_METADATA.subtitle}`],
    ['Версия модели', MODEL_METADATA.version],
    ['Тестовая территория', MODEL_METADATA.testTerritory],
    ['Обязательное уведомление', MODEL_METADATA.constantNotice],
    ['Синтетические данные', MODEL_METADATA.syntheticDataNotice],
    ['Границы элемента планировочной структуры', MODEL_METADATA.areaDenominatorNotice],
    ['Демографический контингент', MODEL_METADATA.ageGroupMethodNotice],
    ['Отказ от ответственности', 'Расчёт предназначен для предварительной оценки градостроительного потенциала и не заменяет разработку проектной документации по ППТ.'],
  ];
  const wsDesc = XLSX.utils.aoa_to_sheet(descData);
  XLSX.utils.book_append_sheet(wb, wsDesc, 'Методика_и_нормативы');

  const safeName = scenario.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_');
  const filename = `cityok_${safeName}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
}
