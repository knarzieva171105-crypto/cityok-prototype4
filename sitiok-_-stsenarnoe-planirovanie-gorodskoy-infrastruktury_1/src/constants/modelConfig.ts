import {
  ModelInputs,
  Scenario,
  InfrastructureFacility,
  BuildingTypology,
  HousingClass,
  LocationContext,
  HeightCharacter,
  PublicFunctionsType,
  CourtyardType,
} from '../types/model';

export const MODEL_METADATA = {
  name: 'СитиОК',
  subtitle: 'Сценарное планирование городской инфраструктуры',
  version: 'cityok-model-v2',
  testTerritory: 'Приволжский район, г. Казань',
  constantNotice:
    'Предварительная сценарная оценка. Не является градостроительным заключением или статистическим прогнозом.',
  syntheticDataNotice:
    'Любые отображаемые точки инфраструктуры — синтетические демонстрационные данные, а не официальный реестр объектов капитального строительства.',
  ageGroupMethodNotice:
    'Возрастные доли 7% (дошкольники 0–7 лет) и 12% (школьники 7–18 лет) являются параметрами сценарного демографического профиля. Для официальных расчётов границы контингентов должны быть нормативно уточнены.',
  areaDenominatorNotice:
    'В модели общая площадь участка используется как знаменатель при расчёте градостроительных плотностей. Применимость региональных нормативов градостроительного проектирования (РНГП) к конкретной территории требует отдельного анализа границ элемента планировочной структуры.',
};

export const TYPOLOGY_LABELS: Record<BuildingTypology, { label: string; desc: string }> = {
  quarter: {
    label: 'Квартальная',
    desc: 'Четкое разделение публичных улиц и приватного внутриквартального пространства с замкнутым контуром',
  },
  perimeter: {
    label: 'Периметральная',
    desc: 'Размещение корпусов вдоль красных линий с формированием единого фасадного фронта',
  },
  detached: {
    label: 'Отдельно стоящие корпуса',
    desc: 'Башенные или секционные дома свободной ориентации в открытом ландшафтном пространстве',
  },
  mixed: {
    label: 'Смешанная',
    desc: 'Комбинация урбан-блоков, среднеэтажных секций и акцентных доминантных башен',
  },
};

export const HOUSING_CLASS_LABELS: Record<HousingClass, { label: string; desc: string }> = {
  basic: {
    label: 'Базовый',
    desc: 'Стандартный класс жилья с компактными планировками и базовыми требованиями к инфраструктуре',
  },
  comfort: {
    label: 'Комфорт',
    desc: 'Увеличенная площадь квартир, закрытый двор, повышенные требования к парковке и благоустройству',
  },
  business: {
    label: 'Бизнес',
    desc: 'Просторные квартиры, подземный паркинг, развитые встроенные сервисы на первых этажах',
  },
  elite: {
    label: 'Элитный',
    desc: 'Премиальный сегмент, низкая плотность, приватные дворы и клубная инфраструктура',
  },
};

export const LOCATION_CONTEXT_LABELS: Record<LocationContext, { label: string; desc: string }> = {
  unspecified: {
    label: 'Не задан',
    desc: 'Обобщенные базовые условия планирования без привязки к градостроительному окружению',
  },
  central: {
    label: 'Центральная территория',
    desc: 'Историческое ядро или деловой центр с высокой плотностью и дефицитом свободных площадей',
  },
  established: {
    label: 'Сложившаяся городская территория',
    desc: 'Районы сложившейся застройки с существующей сетью школ, детсадов и транспортных связей',
  },
  new_development: {
    label: 'Территория нового освоения',
    desc: 'Периферийные площадки и комплексное развитие территорий (КРТ), требующие создания всей инфраструктуры',
  },
};

export const HEIGHT_CHARACTER_LABELS: Record<HeightCharacter, string> = {
  uniform: 'Однородная этажность',
  variable: 'Переменная этажность',
  dominant: 'С акцентными доминантами',
};

export const PUBLIC_FUNCTIONS_LABELS: Record<PublicFunctionsType, string> = {
  ground_floor: 'Встроенные коммерческие функции на 1-м этаже',
  stylobate: 'Многофункциональный развитый стилобат',
  none: 'Только жилые функции (без встроенных)',
};

export const COURTYARD_TYPE_LABELS: Record<CourtyardType, string> = {
  car_free: 'Двор без машин (приватная территория)',
  open: 'Открытый совмещенный двор с гостевыми карманами',
  stylobate_roof: 'Двор на эксплуатируемой кровле стилобата',
};

export const DEFAULT_MODEL_INPUTS: ModelInputs = {
  siteAreaHa: 10,
  floors: 3,
  buildingCoverage: 0.4,
  averageApartmentAreaM2: 55,
  householdSize: 2.5,
  greeningNorm: 6,
  housingProvisionM2PerPerson: 30,
  existingKindergarten: {
    value: 0,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    sourceNotes: 'Сценарно принято отсутствие подтверждённого доступного резерва',
  },
  existingSchool: {
    value: 0,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    sourceNotes: 'Сценарно принято отсутствие подтверждённого доступного резерва',
  },
  existingParkingPermanent: {
    value: 0,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    sourceNotes: 'Сценарно принято отсутствие подтверждённого доступного резерва',
  },
  childSharePreschool: 0.07,
  childShareSchool: 0.12,
  calculationMode: 'housing_provision',
  typology: 'quarter',
  housingClass: 'basic',
  locationContext: 'new_development',
  heightCharacter: 'uniform',
  publicFunctions: 'ground_floor',
  courtyardType: 'car_free',
};

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'scenario_standard',
    name: 'Стандартная застройка',
    description: 'Малоэтажная квартальная застройка базового класса на территории нового освоения (10 га, 3 эт., коэф. застройки 0.40). Резерв принят нулевым.',
    isBaseline: true,
    createdAt: '2026-11-12T00:00:00.000Z',
    updatedAt: '2026-11-12T00:00:00.000Z',
    inputs: { ...DEFAULT_MODEL_INPUTS },
  },
  {
    id: 'scenario_comfort',
    name: 'Среднеэтажный комфорт-квартал',
    description: 'Периметральная застройка комфорт-класса в сложившемся районе (10 га, 5 эт., коэф. застройки 0.35, увеличенная средняя площадь квартир 65 м²).',
    isBaseline: false,
    createdAt: '2026-11-12T00:00:00.000Z',
    updatedAt: '2026-11-12T00:00:00.000Z',
    inputs: {
      ...DEFAULT_MODEL_INPUTS,
      floors: 5,
      buildingCoverage: 0.35,
      averageApartmentAreaM2: 65,
      typology: 'perimeter',
      housingClass: 'comfort',
      locationContext: 'established',
      heightCharacter: 'variable',
    },
  },
  {
    id: 'scenario_with_infrastructure',
    name: 'Квартал с подтверждённой инфраструктурой',
    description: 'Смешанная типология комфорт-класса с частичным использованием подтверждённого резерва соцобъектов (150 мест ДОО, 300 СОШ, 500 постоянных парковок).',
    isBaseline: false,
    createdAt: '2026-11-12T00:00:00.000Z',
    updatedAt: '2026-11-12T00:00:00.000Z',
    inputs: {
      ...DEFAULT_MODEL_INPUTS,
      typology: 'mixed',
      housingClass: 'comfort',
      locationContext: 'established',
      heightCharacter: 'variable',
      existingKindergarten: {
        value: 150,
        qualityStatus: 'fact',
        provenance: 'fact',
        sourceNotes: 'Подтверждённый доступный резерв ДОО по муниципальному паспорту',
      },
      existingSchool: {
        value: 300,
        qualityStatus: 'fact',
        provenance: 'fact',
        sourceNotes: 'Свободные места в СОШ в радиусе нормативной доступности',
      },
      existingParkingPermanent: {
        value: 500,
        qualityStatus: 'fact',
        provenance: 'fact',
        sourceNotes: 'Существующий капитальный паркинг с подтверждённой квотой машиномест',
      },
    },
  },
];

export const BENCHMARK_DEFINITIONS = {
  buildingDensity: {
    code: 'BUILDING_DENSITY_BENCHMARK',
    name: 'Предельная плотность застройки',
    targetValue: 12.0,
    operator: '<=' as const,
    unit: 'тыс. м²/га',
    source: 'Градостроительный регламент Казани',
    legalStatus: 'Требует нормативной верификации' as const,
    notes: 'Предельный коэффициент плотности застройки территории жилой зоны.',
  },
  populationDensity: {
    code: 'POPULATION_DENSITY_BENCHMARK',
    name: 'Предельная плотность населения',
    targetValue: 210.0,
    operator: '<=' as const,
    unit: 'чел./га',
    source: 'Региональные нормативы градостроительного проектирования (РНГП)',
    legalStatus: 'Требует нормативной верификации' as const,
    notes: 'Плотность населения жилого района. Превышение указывает на повышенную демографическую нагрузку.',
  },
  greeningProvision: {
    code: 'GREENING_PROVISION_BENCHMARK',
    name: 'Минимальная обеспеченность озеленением',
    targetValue: 6.0,
    operator: '>=' as const,
    unit: 'м²/чел.',
    source: 'Норматив благоустройства РНГП',
    legalStatus: 'Требует нормативной верификации' as const,
    notes: 'Площадь озеленённых территорий общего пользования микрорайона на одного жителя.',
  },
};

/**
 * Synthetic demonstration facilities in Privolzhsky District, Kazan
 */
export const SYNTHETIC_DEMO_FACILITIES: InfrastructureFacility[] = [
  {
    id: 'syn_sch_1',
    name: 'СОШ №138 (демо-объект)',
    type: 'school',
    coordinates: [55.7505, 49.1995],
    totalCapacity: 800,
    currentLoad: 720,
    availableReserve: 80,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-12',
    isIncludedInScenario: false,
    notes: 'Демонстрационная точка. Текущая загрузка 720 из 800, доступный резерв 80 мест.',
  },
  {
    id: 'syn_sch_2',
    name: 'Гимназия №19 (демо-объект)',
    type: 'school',
    coordinates: [55.7435, 49.1865],
    totalCapacity: 1100,
    currentLoad: 1150,
    availableReserve: 0,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-12',
    isIncludedInScenario: false,
    notes: 'Объект работает с перегрузкой (1150 при мощности 1100). Резерв равен 0.',
  },
  {
    id: 'syn_sch_unknown',
    name: 'Лицей Приволжский (неизвестная загрузка)',
    type: 'school',
    coordinates: [55.7540, 49.1920],
    totalCapacity: 600,
    currentLoad: null,
    availableReserve: null,
    qualityStatus: 'no_data',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-12',
    isIncludedInScenario: false,
    notes: 'Вместимость известна (600), но загрузка не зафиксирована. Резерв не определён (null).',
  },
  {
    id: 'syn_kinder_1',
    name: 'Детский сад №383 «Рябинушка» (демо-объект)',
    type: 'kindergarten',
    coordinates: [55.7472, 49.1910],
    totalCapacity: 220,
    currentLoad: 170,
    availableReserve: 50,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-12',
    isIncludedInScenario: false,
    notes: 'Свободный резерв 50 мест по данным синтетической оценки.',
  },
  {
    id: 'syn_kinder_2',
    name: 'Детский сад №150 (демо-объект)',
    type: 'kindergarten',
    coordinates: [55.7512, 49.2040],
    totalCapacity: 180,
    currentLoad: 180,
    availableReserve: 0,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-12',
    isIncludedInScenario: false,
    notes: 'Загружен на 100%. Свободных мест нет.',
  },
  {
    id: 'syn_park_1',
    name: 'Многоуровневый паркинг Дубравная (демо-объект)',
    type: 'parking',
    coordinates: [55.7460, 49.1980],
    totalCapacity: 600,
    currentLoad: 250,
    availableReserve: 350,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-12',
    isIncludedInScenario: false,
    notes: 'Резерв коммерческих постоянных машиномест: 350 м/м.',
  },
];
