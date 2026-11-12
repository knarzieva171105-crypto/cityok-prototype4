import { ModelInputs, ModelOutputs, RecommendationItem } from '../types/model';

export function generateRecommendations(
  inputs: ModelInputs,
  outputs: ModelOutputs
): RecommendationItem[] {
  const list: RecommendationItem[] = [];

  // 1. Плотность населения
  if (outputs.populationDensityPerHa > 210) {
    list.push({
      id: 'rec_pop_density',
      problem: `Расчётная плотность населения (${outputs.populationDensityPerHa.toLocaleString('ru-RU')} чел./га) превышает нормативный ориентир (210 чел./га).`,
      action:
        'Рассмотреть снижение этажности, уменьшение коэффициента застройки либо уточнение границ расчётного градостроительного элемента.',
      priority: 'high',
      recommendedStage: 'Концепция / Мастер-план',
      rationale: `Превышение на ${(outputs.populationDensityPerHa - 210).toFixed(1)} чел./га при площади участка ${inputs.siteAreaHa} га.`,
      source: 'Ориентир РНГП жилого района',
      limitation:
        'Автоматическое увеличение площади участка недопустимо; требуется согласование границ планировочного квартала.',
    });
  }

  // 2. Плотность застройки
  if (outputs.buildingDensityThousandM2PerHa > 12) {
    list.push({
      id: 'rec_build_density',
      problem: `Плотность застройки (${outputs.buildingDensityThousandM2PerHa.toFixed(2)} тыс. м²/га) превышает градостроительный лимит Казани (12.0 тыс. м²/га).`,
      action:
        'Скорректировать ТЭП: снизить этажность или уменьшить пятно застройки для соответствия предельным градостроительным параметрам.',
      priority: 'high',
      recommendedStage: 'Стадия ППТ / Эскиз застройки',
      rationale: `Общая площадь жилья ${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м² на участке ${inputs.siteAreaHa} га.`,
      source: 'Градостроительный регламент г. Казани',
      limitation:
        'Не является предписанием; предельные параметры определяются территориальной зоной в ПЗЗ г. Казани.',
    });
  }

  // 3. Школьный спрос и дефицит
  if (inputs.existingSchool.qualityStatus === 'no_data') {
    list.push({
      id: 'rec_school_nodata',
      problem: 'Отсутствуют подтверждённые данные о свободной мощности и реальной загрузке школ в радиусе доступности.',
      action:
        'Запросить в органах управления образованием фактическую численность обучающихся (по сменам) и проектную вместимость прилегающих СОШ.',
      priority: 'high',
      recommendedStage: 'Сбор исходных данных (ИРД)',
      rationale: `Расчётная потребность планируемой застройки составляет ${outputs.requiredSchoolPlaces} мест. Баланс не определён (no_data).`,
      source: 'Методика оценки обеспеченности инфраструктурой',
      limitation:
        'Нельзя считать отсутствие сведений подтверждением нулевого резерва или невозможности приёма детей.',
    });
  } else if (outputs.unmetSchool !== null && outputs.unmetSchool > 0) {
    const isSingleFacilitySufficient = outputs.unmetSchool >= 500;
    list.push({
      id: 'rec_school_deficit',
      problem: `Неудовлетворённая потребность в школьных местах составляет ${outputs.unmetSchool} мест.`,
      action: isSingleFacilitySufficient
        ? `Размер дефицита (${outputs.unmetSchool} мест) позволяет проектировать отдельное здание СОШ (нормативный ориентир минимальной вместимости отдельной школы — от 500 мест).`
        : `Дефицит (${outputs.unmetSchool} мест) ниже минимальной вместимости отдельной школы (500 мест). Рекомендуется пристройка к существующей школе или межквартальный договор КРТ.`,
      priority: 'high',
      recommendedStage: 'Проект планировки территории (ППТ)',
      rationale: `Потребность ${outputs.requiredSchoolPlaces} мест за вычетом подтверждённого резерва ${inputs.existingSchool.value ?? 0} мест.`,
      source: 'Ориентир модели: 95% охвата школьников, минимальный модуль отдельной школы 500 мест',
      limitation:
        'Не гарантирует наличие земельного участка под школу внутри ЖК; свободная территория не признаётся автоматически пригодной под размещение объекта образования.',
    });
  }

  // 4. Дошкольные учреждения
  if (inputs.existingKindergarten.qualityStatus === 'no_data') {
    list.push({
      id: 'rec_kinder_nodata',
      problem: 'Нет сведений о загрузке и свободных местах в детских садах микрорайона.',
      action: 'Запросить данные о наполняемости ДОО в пешеходной доступности 300–500 м.',
      priority: 'high',
      recommendedStage: 'Сбор исходных данных (ИРД)',
      rationale: `Расчётный спрос застройки: ${outputs.requiredKindergartenPlaces} мест (охват 85% детей дошкольного возраста).`,
      source: 'Методика оценки обеспеченности ДОО',
      limitation: 'Без сведений о реальной загрузке расчет окончательного баланса невозможен.',
    });
  } else if (outputs.unmetKindergarten !== null && outputs.unmetKindergarten > 0) {
    list.push({
      id: 'rec_kinder_deficit',
      problem: `Неудовлетворённая потребность в детсадах: ${outputs.unmetKindergarten} мест.`,
      action:
        outputs.unmetKindergarten <= 150
          ? 'Рассмотреть встроенно-пристроенный детский сад на 1–2 этажах жилых секций с собственной изолированной площадкой.'
          : 'Предусмотреть отдельно стоящее дошкольное образовательное учреждение (ориентир вместимости одного ДОО — до 350 мест).',
      priority: 'medium',
      recommendedStage: 'Архитектурно-градостроительная концепция',
      rationale: `Спрос: ${outputs.requiredKindergartenPlaces} мест, учтённый резерв: ${inputs.existingKindergarten.value ?? 0} мест.`,
      source: 'Ориентир модели: 85% охвата дошкольников, до 350 мест на объект',
      limitation:
        'Встроенно-пристроенные ДОО требуют соблюдения санитарных разрывов и инсоляции групповых площадок.',
    });
  }

  // 5. Постоянные парковки
  if (inputs.existingParkingPermanent.qualityStatus === 'no_data') {
    list.push({
      id: 'rec_parking_nodata',
      problem: 'Нет данных о наличии свободных постоянных машиномест на прилегающей территории.',
      action: 'Провести инвентаризацию стоянок и гаражных комплексов в радиусе 800 м.',
      priority: 'medium',
      recommendedStage: 'Транспортный раздел концепции',
      rationale: `Потребность составляет ${outputs.requiredParkingPermanent} постоянных м/м (1 м/м на 80 м² жилья).`,
      source: 'Норматив постоянного хранения автотранспорта',
      limitation: 'Пешеходная доступность внеуличных стоянок ограничена 800 метрами.',
    });
  } else if (outputs.unmetParkingPermanent !== null && outputs.unmetParkingPermanent > 0) {
    list.push({
      id: 'rec_parking_deficit',
      problem: `Дефицит постоянных парковок составляет ${outputs.unmetParkingPermanent} машиномест.`,
      action:
        'Разработать проект многоуровневого или подземного паркинга, оценить возможность перехватывающих стоянок.',
      priority: 'high',
      recommendedStage: 'Схема планировочной организации земельного участка (СПОЗУ)',
      rationale: `Требуется ${outputs.requiredParkingPermanent} м/м, учтено ${inputs.existingParkingPermanent.value ?? 0} м/м.`,
      source: 'Норматив: 1 постоянное место на 80 м² жилья',
      limitation:
        'Открытые наземные плоскостные стоянки не должны сокращать нормативную площадь озеленения двора.',
    });
  }

  // 6. Озеленение
  if (outputs.greeningProvisionM2PerPerson < 6.0) {
    list.push({
      id: 'rec_greening_below',
      problem: `Обеспеченность озеленением (${outputs.greeningProvisionM2PerPerson.toFixed(2)} м²/чел.) ниже нормативного ориентира (6.0 м²/чел.).`,
      action: 'Увеличить долю благоустроенных озеленённых пространств или снизить плотность проживания.',
      priority: 'medium',
      recommendedStage: 'Благоустройство / Мастер-план',
      rationale: `Расчётная площадь озеленения ${outputs.greeningAreaM2.toLocaleString('ru-RU')} м² недостаточна для ${outputs.population.toLocaleString('ru-RU')} жителей.`,
      source: 'Норматив озеленения: ≥ 6.0 м²/чел.',
      limitation: 'Озеленение на кровле подземного паркинга требует соблюдения нормативного грунтового слоя.',
    });
  }

  return list;
}
