import {
  ModelInputs,
  ModelOutputs,
  BenchmarkCheck,
  MetricExplanation,
} from '../types/model';
import { BENCHMARK_DEFINITIONS } from '../constants/modelConfig';

/**
 * Standard rounding function
 */
export function roundModel(val: number, decimals: number = 0): number {
  if (!isFinite(val) || isNaN(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * Pure calculation engine for CityOK
 * Calculates spatial density, population, social, medical and parking infrastructure demand
 */
export function calculateModel(inputs: ModelInputs): ModelOutputs {
  const {
    siteAreaHa,
    floors,
    buildingCoverage,
    averageApartmentAreaM2,
    householdSize,
    housingProvisionM2PerPerson,
    existingKindergarten,
    existingSchool,
    existingParkingPermanent,
    childSharePreschool,
    childShareSchool,
    calculationMode,
  } = inputs;

  // Zero and negative divisor protections
  const safeSiteArea = siteAreaHa > 0 ? siteAreaHa : 0.0001;
  const safeAvgAptArea = averageApartmentAreaM2 > 0 ? averageApartmentAreaM2 : 1;
  const safeHouseholdSize = householdSize > 0 ? householdSize : 1;
  const safeHousingProvision = housingProvisionM2PerPerson > 0 ? housingProvisionM2PerPerson : 1;

  // Альтернативная жил. обеспеченность домохозяйства = средняя площадь / семейственность
  const alternativeHousingProvision = roundModel(safeAvgAptArea / safeHouseholdSize, 2);

  // 1. Площадь застройки, га = площадь участка × коэффициент застройки
  const buildingFootprintHa = siteAreaHa * buildingCoverage;

  // 2. Общая площадь жилья, м² = площадь застройки × этажность × 10 000
  const totalHousingAreaM2 = buildingFootprintHa * floors * 10000;

  // 3. Плотность застройки, тыс. м²/га = общая площадь жилья / площадь участка / 1000
  const buildingDensityThousandM2PerHa =
    siteAreaHa > 0 ? totalHousingAreaM2 / safeSiteArea / 1000 : 0;

  // 4. Количество квартир = ROUND(общая площадь жилья / средняя площадь квартиры, 0)
  const apartmentsCount = roundModel(totalHousingAreaM2 / safeAvgAptArea, 0);

  // 5. Численность населения
  let populationRaw: number;
  let population: number;

  if (calculationMode === 'household_size') {
    // Режим "По семейственности": расчет от числа квартир и среднего размера семьи
    populationRaw = apartmentsCount * safeHouseholdSize;
    population = roundModel(populationRaw, 0);
  } else {
    // Режим "По жилищной обеспеченности": расчет от общей площади жилья и нормы обеспеченности
    populationRaw = totalHousingAreaM2 / safeHousingProvision;
    population = populationRaw;
  }

  // 6. Плотность населения, чел./га = численность населения / площадь участка
  const populationDensityPerHa = siteAreaHa > 0 ? population / safeSiteArea : 0;

  // 7. Площадь озеленения, м² = площадь участка × 10 000 × 0.25 (нормативная 25% доля благоустройства)
  const greeningAreaM2 = siteAreaHa * 10000 * 0.25;

  // 8. Обеспеченность озеленением, м²/чел. = площадь озеленения / численность населения
  const greeningProvisionM2PerPerson = population > 0 ? greeningAreaM2 / population : 0;

  // 9. Требуемые места в детсаду = ROUND(население × доля детей 0–7 лет × 0.85, 0)
  const requiredKindergartenPlaces = roundModel(population * childSharePreschool * 0.85, 0);

  // 10. Требуемые места в школе = ROUND(население × доля детей 7–18 лет × 0.95, 0)
  const requiredSchoolPlaces = roundModel(population * childShareSchool * 0.95, 0);

  // 11. Требуемые постоянные машиноместа = ROUND(общая площадь жилья / 80, 0)
  const requiredParkingPermanent = roundModel(totalHousingAreaM2 / 80, 0);

  // 12. Требуемые временные машиноместа = ROUND(общая площадь жилья / 560, 0)
  const requiredParkingTemporary = roundModel(totalHousingAreaM2 / 560, 0);

  // 13. Требуемая мощность поликлинического обслуживания = ROUND(общая площадь жилья / 10000 × 6, 0)
  const requiredClinicVisitsPerShift = roundModel((totalHousingAreaM2 / 10000) * 6, 0);

  // 14. Балансы потребности и существующего резерва
  let rawBalanceKindergarten: number | null = null;
  let unmetKindergarten: number | null = null;
  let remainingReserveKindergarten: number | null = null;

  if (existingKindergarten.qualityStatus !== 'no_data' && existingKindergarten.value !== null) {
    rawBalanceKindergarten = requiredKindergartenPlaces - existingKindergarten.value;
    unmetKindergarten = Math.max(0, rawBalanceKindergarten);
    remainingReserveKindergarten = Math.max(0, -rawBalanceKindergarten);
  }

  let rawBalanceSchool: number | null = null;
  let unmetSchool: number | null = null;
  let remainingReserveSchool: number | null = null;

  if (existingSchool.qualityStatus !== 'no_data' && existingSchool.value !== null) {
    rawBalanceSchool = requiredSchoolPlaces - existingSchool.value;
    unmetSchool = Math.max(0, rawBalanceSchool);
    remainingReserveSchool = Math.max(0, -rawBalanceSchool);
  }

  let rawBalanceParkingPermanent: number | null = null;
  let unmetParkingPermanent: number | null = null;
  let remainingReserveParkingPermanent: number | null = null;

  if (existingParkingPermanent.qualityStatus !== 'no_data' && existingParkingPermanent.value !== null) {
    rawBalanceParkingPermanent = requiredParkingPermanent - existingParkingPermanent.value;
    unmetParkingPermanent = Math.max(0, rawBalanceParkingPermanent);
    remainingReserveParkingPermanent = Math.max(0, -rawBalanceParkingPermanent);
  }

  // Проверки нормативных ориентиров
  const densityBenchDef = BENCHMARK_DEFINITIONS.buildingDensity;
  const buildingDensityBenchmark: BenchmarkCheck = {
    ...densityBenchDef,
    status:
      buildingDensityThousandM2PerHa <= densityBenchDef.targetValue
        ? 'compliant'
        : 'exceeded',
    statusLabel:
      buildingDensityThousandM2PerHa <= densityBenchDef.targetValue
        ? 'Соответствует ориентиру модели'
        : 'Превышает ориентир модели',
  };

  const popDensityBenchDef = BENCHMARK_DEFINITIONS.populationDensity;
  const populationDensityBenchmark: BenchmarkCheck = {
    ...popDensityBenchDef,
    status:
      populationDensityPerHa <= popDensityBenchDef.targetValue
        ? 'compliant'
        : 'exceeded',
    statusLabel:
      populationDensityPerHa <= popDensityBenchDef.targetValue
        ? 'Соответствует ориентиру модели'
        : 'Превышает ориентир модели',
  };

  const greeningBenchDef = BENCHMARK_DEFINITIONS.greeningProvision;
  const greeningProvisionBenchmark: BenchmarkCheck = {
    ...greeningBenchDef,
    status:
      greeningProvisionM2PerPerson >= greeningBenchDef.targetValue
        ? 'compliant'
        : 'below',
    statusLabel:
      greeningProvisionM2PerPerson >= greeningBenchDef.targetValue
        ? 'Соответствует ориентиру модели'
        : 'Ниже ориентира модели',
  };

  // Пояснения к показателям для кнопки «Как рассчитано?»
  const explanations: Record<string, MetricExplanation> = {
    buildingFootprint: {
      key: 'buildingFootprint',
      name: 'Площадь застройки',
      value: buildingFootprintHa,
      formattedValue: `${roundModel(buildingFootprintHa, 2).toLocaleString('ru-RU')} га`,
      unit: 'га',
      formula: 'Площадь участка × Коэффициент застройки',
      formulaWithValues: `${siteAreaHa} га × ${buildingCoverage}`,
      assumptions: ['Произведение площади земельного участка и нормативного коэффициента застройки'],
    },
    totalHousingArea: {
      key: 'totalHousingArea',
      name: 'Общая площадь жилья',
      value: totalHousingAreaM2,
      formattedValue: `${roundModel(totalHousingAreaM2, 0).toLocaleString('ru-RU')} м²`,
      unit: 'м²',
      formula: 'Площадь застройки (га) × Этажность × 10 000',
      formulaWithValues: `${buildingFootprintHa} га × ${floors} эт. × 10 000`,
      assumptions: [
        'Множитель 10 000 переводит гектары в квадратные метры',
        'Предполагается равномерная этажность по всей площади застройки',
      ],
    },
    buildingDensity: {
      key: 'buildingDensity',
      name: 'Плотность застройки',
      value: buildingDensityThousandM2PerHa,
      formattedValue: `${roundModel(buildingDensityThousandM2PerHa, 2).toLocaleString('ru-RU')} тыс. м²/га`,
      unit: 'тыс. м²/га',
      formula: 'Общая площадь жилья / Площадь участка / 1000',
      formulaWithValues: `${totalHousingAreaM2} м² / ${siteAreaHa} га / 1000`,
      assumptions: [
        'Делитель 1000 переводит м² в тысячи м²',
        'Знаменателем выступает общая территория земельного участка',
      ],
      benchmark: buildingDensityBenchmark,
    },
    apartmentsCount: {
      key: 'apartmentsCount',
      name: 'Количество квартир',
      value: apartmentsCount,
      formattedValue: `${apartmentsCount.toLocaleString('ru-RU')} кв.`,
      unit: 'кв.',
      formula: 'ROUND(Общая площадь жилья / Средняя площадь квартиры, 0)',
      formulaWithValues: `ROUND(${totalHousingAreaM2} м² / ${averageApartmentAreaM2} м², 0)`,
      assumptions: ['Округление до целого числа квартир'],
    },
    population: {
      key: 'population',
      name: 'Численность населения',
      value: population,
      formattedValue: `${roundModel(population, 0).toLocaleString('ru-RU')} чел.`,
      unit: 'чел.',
      formula:
        calculationMode === 'household_size'
          ? 'ROUND(Квартиры × Семейственность, 0)'
          : 'Общая площадь жилья / Жилищная обеспеченность',
      formulaWithValues:
        calculationMode === 'household_size'
          ? `ROUND(${apartmentsCount} кв. × ${householdSize} чел./кв., 0)`
          : `${totalHousingAreaM2} м² / ${housingProvisionM2PerPerson} м²/чел.`,
      assumptions:
        calculationMode === 'household_size'
          ? [
              'Режим оценки по семейственности: численность определена через средний размер домохозяйства',
            ]
          : [
              'Режим оценки по норме жил. обеспеченности: численность определена через норматив обеспеченности м²/чел.',
              'Коэффициент семейственности в данном режиме не меняет основную численность',
            ],
    },
    populationDensity: {
      key: 'populationDensity',
      name: 'Плотность населения',
      value: populationDensityPerHa,
      formattedValue: `${roundModel(populationDensityPerHa, 1).toLocaleString('ru-RU')} чел./га`,
      unit: 'чел./га',
      formula: 'Численность населения / Площадь участка',
      formulaWithValues: `${roundModel(population, 0)} чел. / ${siteAreaHa} га`,
      assumptions: ['Отношение расчетного числа жителей к общей территории участка'],
      benchmark: populationDensityBenchmark,
    },
    greeningArea: {
      key: 'greeningArea',
      name: 'Площадь озеленения',
      value: greeningAreaM2,
      formattedValue: `${roundModel(greeningAreaM2, 0).toLocaleString('ru-RU')} м²`,
      unit: 'м²',
      formula: 'Площадь участка × 10 000 × 0.25',
      formulaWithValues: `${siteAreaHa} га × 10 000 × 0.25`,
      assumptions: ['Нормативное выделение 25% территории участка под озеленение и рекреацию'],
    },
    greeningProvision: {
      key: 'greeningProvision',
      name: 'Обеспеченность озеленением',
      value: greeningProvisionM2PerPerson,
      formattedValue: `${roundModel(greeningProvisionM2PerPerson, 2).toLocaleString('ru-RU')} м²/чел.`,
      unit: 'м²/чел.',
      formula: 'Площадь озеленения / Численность населения',
      formulaWithValues: `${greeningAreaM2} м² / ${roundModel(population, 0)} чел.`,
      assumptions: ['Отношение благоустроенной площади к числу жителей'],
      benchmark: greeningProvisionBenchmark,
    },
    requiredKindergarten: {
      key: 'requiredKindergarten',
      name: 'Потребность в детсадах',
      value: requiredKindergartenPlaces,
      formattedValue: `${requiredKindergartenPlaces.toLocaleString('ru-RU')} мест`,
      unit: 'мест',
      formula: 'ROUND(Население × Доля детей 0–7 лет × 0.85, 0)',
      formulaWithValues: `ROUND(${roundModel(population, 0)} × ${childSharePreschool} × 0.85, 0)`,
      assumptions: [
        'Охват детей дошкольного возраста (0–7 лет) принят 85%',
        'Результат округляется до целых мест',
      ],
    },
    requiredSchool: {
      key: 'requiredSchool',
      name: 'Потребность в школах',
      value: requiredSchoolPlaces,
      formattedValue: `${requiredSchoolPlaces.toLocaleString('ru-RU')} мест`,
      unit: 'мест',
      formula: 'ROUND(Население × Доля детей 7–18 лет × 0.95, 0)',
      formulaWithValues: `ROUND(${roundModel(population, 0)} × ${childShareSchool} × 0.95, 0)`,
      assumptions: [
        'Норматив охвата принят 95% (95 мест на 100 детей 7–18 лет)',
        'Округляется до целых мест',
      ],
    },
    requiredParkingPermanent: {
      key: 'requiredParkingPermanent',
      name: 'Постоянные машиноместа',
      value: requiredParkingPermanent,
      formattedValue: `${requiredParkingPermanent.toLocaleString('ru-RU')} м/м`,
      unit: 'м/м',
      formula: 'ROUND(Общая площадь жилья / 80, 0)',
      formulaWithValues: `ROUND(${totalHousingAreaM2} м² / 80, 0)`,
      assumptions: ['Норматив постоянного хранения: 1 машиноместо на 80 м² жилья'],
    },
    requiredParkingTemporary: {
      key: 'requiredParkingTemporary',
      name: 'Временные (гостевые) машиноместа',
      value: requiredParkingTemporary,
      formattedValue: `${requiredParkingTemporary.toLocaleString('ru-RU')} м/м`,
      unit: 'м/м',
      formula: 'ROUND(Общая площадь жилья / 560, 0)',
      formulaWithValues: `ROUND(${totalHousingAreaM2} м² / 560, 0)`,
      assumptions: ['Норматив временного размещения: 1 гостевое место на 560 м² жилья'],
    },
    requiredClinic: {
      key: 'requiredClinic',
      name: 'Поликлиническое обслуживание (мощность)',
      value: requiredClinicVisitsPerShift,
      formattedValue: `${requiredClinicVisitsPerShift.toLocaleString('ru-RU')} пос./смену`,
      unit: 'посещений в смену',
      formula: 'ROUND(Общая площадь жилья / 10 000 × 6, 0)',
      formulaWithValues: `ROUND(${totalHousingAreaM2} / 10 000 × 6, 0)`,
      assumptions: [
        'Показатель мощности амбулаторно-поликлинического обслуживания (посещений в смену), а не количество медицинских зданий',
        'Норматив: 6 посещений в смену на каждые 10 000 м² жилья',
      ],
    },
    balanceKindergarten: {
      key: 'balanceKindergarten',
      name: 'Баланс мест в детсаду',
      value: rawBalanceKindergarten,
      formattedValue:
        rawBalanceKindergarten !== null
          ? `${rawBalanceKindergarten > 0 ? `Дефицит ${rawBalanceKindergarten}` : `Резерв ${Math.abs(rawBalanceKindergarten)}`} мест`
          : 'Данных нет',
      unit: 'мест',
      formula: 'Потребность в ДОО − Учтённый резерв',
      formulaWithValues:
        rawBalanceKindergarten !== null
          ? `${requiredKindergartenPlaces} − ${existingKindergarten.value ?? 0}`
          : 'Спрос рассчитан, но данные о резерве отсутствуют (no_data)',
      assumptions: [
        'Отрицательный баланс указывает на остаток подтверждённого резерва',
        existingKindergarten.qualityStatus === 'no_data'
          ? 'Данных о резерве нет (no_data): дефицит математически не определён'
          : 'Используется сценарный или подтверждённый резерв',
      ],
    },
    balanceSchool: {
      key: 'balanceSchool',
      name: 'Баланс мест в школе',
      value: rawBalanceSchool,
      formattedValue:
        rawBalanceSchool !== null
          ? `${rawBalanceSchool > 0 ? `Дефицит ${rawBalanceSchool}` : `Резерв ${Math.abs(rawBalanceSchool)}`} мест`
          : 'Данных нет',
      unit: 'мест',
      formula: 'Потребность в СОШ − Учтённый резерв',
      formulaWithValues:
        rawBalanceSchool !== null
          ? `${requiredSchoolPlaces} − ${existingSchool.value ?? 0}`
          : 'Спрос рассчитан, но данные о резерве отсутствуют (no_data)',
      assumptions: [
        'Отрицательный баланс указывает на остаток подтверждённого резерва',
        existingSchool.qualityStatus === 'no_data'
          ? 'Данных о резерве нет (no_data): дефицит математически не определён'
          : 'Используется сценарный или подтверждённый резерв',
      ],
    },
    balanceParkingPermanent: {
      key: 'balanceParkingPermanent',
      name: 'Баланс постоянных парковок',
      value: rawBalanceParkingPermanent,
      formattedValue:
        rawBalanceParkingPermanent !== null
          ? `${rawBalanceParkingPermanent > 0 ? `Дефицит ${rawBalanceParkingPermanent}` : `Резерв ${Math.abs(rawBalanceParkingPermanent)}`} м/м`
          : 'Данных нет',
      unit: 'м/м',
      formula: 'Потребность в парковках − Учтённый резерв',
      formulaWithValues:
        rawBalanceParkingPermanent !== null
          ? `${requiredParkingPermanent} − ${existingParkingPermanent.value ?? 0}`
          : 'Спрос рассчитан, но данные о резерве отсутствуют (no_data)',
      assumptions: [
        'Отрицательный баланс указывает на остаток подтверждённого резерва',
        existingParkingPermanent.qualityStatus === 'no_data'
          ? 'Данных о резерве нет (no_data): дефицит математически не определён'
          : 'Используется сценарный или подтверждённый резерв',
      ],
    },
    alternativeHousingProvision: {
      key: 'alternativeHousingProvision',
      name: 'Жилищная обеспеченность домохозяйства',
      value: alternativeHousingProvision,
      formattedValue: `${alternativeHousingProvision.toLocaleString('ru-RU')} м²/чел.`,
      unit: 'м²/чел.',
      formula: 'Средняя площадь квартиры / Семейственность',
      formulaWithValues: `${averageApartmentAreaM2} м² / ${householdSize} чел./кв.`,
      assumptions: [
        'Аналитический показатель, следующий из соотношения площади квартиры и числа проживающих',
        'При нормативном методе общая численность жителей определяется через градостроительный норматив обеспеченности',
      ],
    },
  };

  return {
    alternativeHousingProvision,
    buildingFootprintHa: roundModel(buildingFootprintHa, 4),
    totalHousingAreaM2: roundModel(totalHousingAreaM2, 2),
    buildingDensityThousandM2PerHa: roundModel(buildingDensityThousandM2PerHa, 4),
    apartmentsCount,
    population: roundModel(population, 2),
    populationRaw,
    populationDensityPerHa: roundModel(populationDensityPerHa, 2),
    greeningAreaM2: roundModel(greeningAreaM2, 2),
    greeningProvisionM2PerPerson: roundModel(greeningProvisionM2PerPerson, 4),
    requiredKindergartenPlaces,
    requiredSchoolPlaces,
    requiredParkingPermanent,
    requiredParkingTemporary,
    requiredClinicVisitsPerShift,
    rawBalanceKindergarten,
    rawBalanceSchool,
    rawBalanceParkingPermanent,
    unmetKindergarten,
    unmetSchool,
    unmetParkingPermanent,
    remainingReserveKindergarten,
    remainingReserveSchool,
    remainingReserveParkingPermanent,
    benchmarks: {
      buildingDensity: buildingDensityBenchmark,
      populationDensity: populationDensityBenchmark,
      greeningProvision: greeningProvisionBenchmark,
    },
    explanations,
  };
}
