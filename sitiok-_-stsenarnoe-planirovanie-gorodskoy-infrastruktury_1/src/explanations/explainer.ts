import { ModelInputs, ModelOutputs, Scenario } from '../types/model';
import { TYPOLOGY_LABELS, HOUSING_CLASS_LABELS, LOCATION_CONTEXT_LABELS } from '../constants/modelConfig';

export interface ExplanationAnswer {
  questionId: string;
  question: string;
  shortSummary: string;
  details: string[];
  formulaBlock?: {
    formula: string;
    calculation: string;
    result: string;
  };
  notes?: string;
}

export function getPresetExplanations(
  inputs: ModelInputs,
  outputs: ModelOutputs,
  compareScenario?: Scenario | null
): ExplanationAnswer[] {
  return [
    // 1. Откуда взялось население?
    {
      questionId: 'q_population_origin',
      question: 'Откуда взялось население?',
      shortSummary:
        inputs.calculationMode === 'housing_provision'
          ? `Численность населения (${Math.round(outputs.population).toLocaleString('ru-RU')} чел.) рассчитана по нормативному методу: Общая площадь жилья / Жилищная обеспеченность.`
          : `Численность населения (${Math.round(outputs.population).toLocaleString('ru-RU')} чел.) рассчитана через демографическую модель: Количество квартир × Коэффициент семейственности.`,
      details: [
        `Общая площадь жилья: ${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м² (получена как площадь застройки ${outputs.buildingFootprintHa} га × этажность ${inputs.floors} эт. × 10 000).`,
        inputs.calculationMode === 'housing_provision'
          ? `Нормативная жилищная обеспеченность: ${inputs.housingProvisionM2PerPerson} м²/чел.`
          : `Количество квартир: ${outputs.apartmentsCount.toLocaleString('ru-RU')} шт., коэффициент семейственности: ${inputs.householdSize} чел./кв.`,
        inputs.calculationMode === 'housing_provision'
          ? `При нормативном методе семейственность (${inputs.householdSize} чел./кв.) не участвует в прямом расчёте жителей, а отображает расчётную жилищную обеспеченность домохозяйства: ${outputs.alternativeHousingProvision} м²/чел.`
          : `При демографическом методе численность рассчитывается непосредственно от квартирографии и среднего состава семьи.`,
      ],
      formulaBlock: {
        formula:
          inputs.calculationMode === 'housing_provision'
            ? 'Население = Общая площадь жилья / Жилищная обеспеченность'
            : 'Население = ROUND(Квартиры × Семейственность, 0)',
        calculation:
          inputs.calculationMode === 'housing_provision'
            ? `${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м² / ${inputs.housingProvisionM2PerPerson} м²/чел.`
            : `${outputs.apartmentsCount.toLocaleString('ru-RU')} кв. × ${inputs.householdSize} чел./кв.`,
        result: `${Math.round(outputs.population).toLocaleString('ru-RU')} чел.`,
      },
      notes: 'Переключение между методами доступно в параметрах застройки.',
    },

    // 2. Почему сформировался спрос на детсад?
    {
      questionId: 'q_kindergarten_demand',
      question: 'Почему сформировался спрос на детсад?',
      shortSummary: `Потребность в ДОО (${outputs.requiredKindergartenPlaces} мест) прямо пропорциональна расчётному населению (${Math.round(outputs.population).toLocaleString('ru-RU')} чел.) и доле детей дошкольного возраста.`,
      details: [
        `Численность населения: ${Math.round(outputs.population).toLocaleString('ru-RU')} чел.`,
        `Доля детей от 0 до 7 лет: ${(inputs.childSharePreschool * 100).toFixed(1)}%.`,
        `Норматив охвата дошкольным образованием: 85% (коэффициент 0.85).`,
        `Формула: ROUND(Население × Доля детей 0–7 лет × 0.85, 0).`,
      ],
      formulaBlock: {
        formula: 'Потребность ДОО = ROUND(Население × Доля детей 0–7 × 0.85, 0)',
        calculation: `ROUND(${Math.round(outputs.population).toLocaleString('ru-RU')} × ${inputs.childSharePreschool} × 0.85, 0)`,
        result: `${outputs.requiredKindergartenPlaces} мест`,
      },
      notes: 'Изменение этажности, площади участка или норматива обеспеченности пропорционально меняет спрос на социальные объекты.',
    },

    // 3. Почему семейственность не влияет при нормативном методе?
    {
      questionId: 'q_household_independence',
      question: 'Почему семейственность не влияет при расчёте по жилищной обеспеченности?',
      shortSummary:
        'При нормативном градостроительном методе количество жителей определяется градостроительной нормой квадратных метров на человека, а не средним составом семьи.',
      details: [
        'Коэффициент семейственности (по умолчанию 2.5 чел./кв.) отражает демографическую характеристику домохозяйства.',
        `Соотношение средней площади квартиры (${inputs.averageApartmentAreaM2} м²) и семейственности (${inputs.householdSize} чел.) даёт расчётную жилищную обеспеченность квартиры: ${outputs.alternativeHousingProvision} м²/чел.`,
        `В нормативном методе принят норматив жилищной обеспеченности: ${inputs.housingProvisionM2PerPerson} м²/чел.`,
        'Чтобы проверить влияние семейственности на демографию проекта, переключите метод расчёта на «По семейственности».',
      ],
      formulaBlock: {
        formula: 'Население = Площадь жилья / Норма обеспеченности',
        calculation: `${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м² / ${inputs.housingProvisionM2PerPerson} м²/чел.`,
        result: `${Math.round(outputs.population).toLocaleString('ru-RU')} чел.`,
      },
    },

    // 4. Почему нельзя определить дефицит?
    {
      questionId: 'q_no_data_reason',
      question: 'Почему нельзя определить дефицит, если статус данных «no_data»?',
      shortSummary:
        'Дефицит — это разница между подтверждённым доступным резервом и потребностью. Если данные о резерве отсутствуют, итоговый дефицит математически не определён (null).',
      details: [
        'Потребность нового жилья рассчитывается детерминированно из параметров застройки.',
        'Однако существующий доступный резерв в близлежащих школах или детсадах не может быть автоматически признан нулевым без подтверждённого обследования.',
        'Если известна номинальная вместимость учреждения, но неизвестна загрузка по сменам, свободный резерв равен null.',
        'В системе СитиОК при статусе «нет данных» выводится предупреждение «Дефицит не определён: нет данных о доступном резерве», исключая искажение градостроительных выводов.',
      ],
      notes: 'Для снятия неопределённости требуется запрос фактической загрузки в органах управления образования.',
    },

    // 5. Потребность vs Вместимость объекта
    {
      questionId: 'q_capacity_vs_demand',
      question: 'Чем отличаются совокупная потребность проекта и вместимость отдельного объекта?',
      shortSummary:
        `Спрос (${outputs.requiredSchoolPlaces} школьных мест) — это суммарная потребность жителей. Нормативная вместимость здания школы (от 500 мест) — строительный модуль объекта.`,
      details: [
        `Потребность ${outputs.requiredSchoolPlaces} мест означает суммарный расчётный контингент школьников из планируемых домов.`,
        'Градостроительный ориентир минимальной мощности отдельного нового здания СОШ — не менее 500 мест.',
        'Следовательно, расчётный спрос не обязывает строить здание меньшей вместимости в нарушение нормативов.',
        'Проектировщик рассматривает варианты: пристройка к существующей школе, строительство школы на 550 мест с учётом соседних кварталов либо соглашение КРТ.',
        'Для детских садов действует верхний ориентир вместимости одного здания — до 350 мест.',
      ],
    },

    // 6. Сравнение сценариев
    {
      questionId: 'q_scenario_diff',
      question: 'Какие параметры изменились между сценариями?',
      shortSummary: compareScenario
        ? `Сопоставление текущего расчёта со сценарием «${compareScenario.name}».`
        : 'Выберите сценарий в разделе сравнения для детального сопоставления характеристик.',
      details: compareScenario
        ? [
            `Типология: ${TYPOLOGY_LABELS[inputs.typology]?.label} против ${TYPOLOGY_LABELS[compareScenario.inputs.typology]?.label}`,
            `Класс жилья: ${HOUSING_CLASS_LABELS[inputs.housingClass]?.label} против ${HOUSING_CLASS_LABELS[compareScenario.inputs.housingClass]?.label}`,
            `Контекст: ${LOCATION_CONTEXT_LABELS[inputs.locationContext]?.label} против ${LOCATION_CONTEXT_LABELS[compareScenario.inputs.locationContext]?.label}`,
            `Этажность: ${inputs.floors} эт. против ${compareScenario.inputs.floors} эт. (разница: ${inputs.floors - compareScenario.inputs.floors} эт.)`,
            `Площадь жилья: ${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м² против ${(compareScenario.inputs.siteAreaHa * compareScenario.inputs.buildingCoverage * compareScenario.inputs.floors * 10000).toLocaleString('ru-RU')} м²`,
            `Резерв ДОО: ${inputs.existingKindergarten.value ?? 'нет данных'} против ${compareScenario.inputs.existingKindergarten.value ?? 'нет данных'}`,
            `Резерв СОШ: ${inputs.existingSchool.value ?? 'нет данных'} против ${compareScenario.inputs.existingSchool.value ?? 'нет данных'}`,
          ]
        : ['В разделе «Сравнение сценариев» доступно одновременное сопоставление до 3-х сценариев с абсолютными и процентными дельтами.'],
    },
  ];
}
