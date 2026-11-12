/**
 * Data contracts and type definitions for CityOK Urban Planning Calculator
 * Independent scenario planning model for urban development and infrastructure load
 */

export type CalculationMode = 'housing_provision' | 'household_size';

export type QualityProvenance = 'fact' | 'norm' | 'assumption';
export type QualityStatus = 'fact' | 'estimate' | 'no_data';

export type BuildingTypology = 'quarter' | 'perimeter' | 'detached' | 'mixed';
export type HousingClass = 'basic' | 'comfort' | 'business' | 'elite';
export type LocationContext = 'unspecified' | 'central' | 'established' | 'new_development';
export type HeightCharacter = 'uniform' | 'variable' | 'dominant';
export type PublicFunctionsType = 'ground_floor' | 'stylobate' | 'none';
export type CourtyardType = 'car_free' | 'open' | 'stylobate_roof';

export interface ReserveInput {
  value: number | null; // null if no_data
  qualityStatus: QualityStatus; // fact, estimate, no_data
  provenance: QualityProvenance; // fact, norm, assumption
  sourceNotes?: string;
}

export interface ModelInputs {
  // Пространственные и градостроительные параметры
  siteAreaHa: number; // Площадь земельного участка, га
  floors: number; // Этажность
  buildingCoverage: number; // Коэффициент застройки (0 < Kз <= 1)
  averageApartmentAreaM2: number; // Средняя площадь квартиры, м²
  householdSize: number; // Коэффициент семейственности, чел./квартиру
  greeningNorm: number; // Норматив озеленения, м²/чел.
  housingProvisionM2PerPerson: number; // Жилищная обеспеченность, м²/чел.

  // Существующая емкость инфраструктуры (с подтверждением статуса)
  existingKindergarten: ReserveInput; // Места в детсаду
  existingSchool: ReserveInput; // Места в школе
  existingParkingPermanent: ReserveInput; // Постоянные машиноместа

  // Демографические доли возрастных групп
  childSharePreschool: number; // Доля детей 0–7 лет (доля, например 0.07)
  childShareSchool: number; // Доля детей 7–18 лет (доля, например 0.12)

  // Метод оценки численности населения
  calculationMode: CalculationMode;

  // Независимая типология и классификация застройки
  typology: BuildingTypology;
  housingClass: HousingClass;
  locationContext: LocationContext;

  // Уточняющие архитектурные характеристики
  heightCharacter: HeightCharacter;
  publicFunctions: PublicFunctionsType;
  courtyardType: CourtyardType;
}

export interface MetricExplanation {
  key: string;
  name: string;
  value: number | null;
  formattedValue: string;
  unit: string;
  formula: string;
  formulaWithValues: string;
  assumptions: string[];
  benchmark?: BenchmarkCheck;
}

export interface BenchmarkCheck {
  code: string;
  name: string;
  targetValue: number;
  operator: '<=' | '>=' | '==';
  unit: string;
  status: 'compliant' | 'exceeded' | 'below' | 'neutral';
  statusLabel: 'Соответствует ориентиру модели' | 'Превышает ориентир модели' | 'Ниже ориентира модели';
  source: string;
  legalStatus: 'Требует нормативной верификации';
  notes: string;
}

export interface ModelOutputs {
  // Альтернативная жилищная обеспеченность домохозяйства = ср. площадь / семейственность
  alternativeHousingProvision: number;

  // Площадь застройки, га = участок × коэф. застройки
  buildingFootprintHa: number;
  // Общая площадь жилья, м² = площадь застройки × этажность × 10 000
  totalHousingAreaM2: number;
  // Плотность застройки, тыс. м²/га = общая площадь жилья / участок / 1000
  buildingDensityThousandM2PerHa: number;
  // Количество квартир = ROUND(общая площадь жилья / средняя площадь квартиры, 0)
  apartmentsCount: number;
  // Численность населения:
  // по жил. обеспеченности: общая площадь жилья / норматив обеспеченности
  // по семейственности: ROUND(квартиры × семейственность, 0)
  population: number;
  populationRaw: number;
  // Плотность населения, чел./га = население / участок
  populationDensityPerHa: number;
  // Площадь озеленения, м² = участок × 10 000 × 0.25 (нормативная доля благоустройства)
  greeningAreaM2: number;
  // Обеспеченность озеленением, м²/чел. = площадь озеленения / население
  greeningProvisionM2PerPerson: number;

  // Потребность в социальной инфраструктуре
  requiredKindergartenPlaces: number; // ДОО: население × доля 0-7 × 0.85
  requiredSchoolPlaces: number; // СОШ: население × доля 7-18 × 0.95
  requiredParkingPermanent: number; // Постоянные машиноместа: жилье / 80
  requiredParkingTemporary: number; // Временные машиноместа: жилье / 560
  requiredClinicVisitsPerShift: number; // Поликлиника (мощность): жилье / 10 000 × 6

  // Условный баланс потребности и существующего резерва (может быть отрицательным при профиците)
  rawBalanceKindergarten: number | null;
  rawBalanceSchool: number | null;
  rawBalanceParkingPermanent: number | null;

  // Аналитические показатели дефицита/резерва:
  unmetKindergarten: number | null; // Неудовлетворенная потребность = max(balance, 0)
  unmetSchool: number | null;
  unmetParkingPermanent: number | null;

  remainingReserveKindergarten: number | null; // Остаток учтенного резерва = max(-balance, 0)
  remainingReserveSchool: number | null;
  remainingReserveParkingPermanent: number | null;

  // Проверки ориентиров
  benchmarks: {
    buildingDensity: BenchmarkCheck;
    populationDensity: BenchmarkCheck;
    greeningProvision: BenchmarkCheck;
  };

  // Пояснения для кнопки «Как рассчитано?»
  explanations: Record<string, MetricExplanation>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  isBaseline?: boolean;
  createdAt: string;
  updatedAt: string;
  inputs: ModelInputs;
  polygonGeoJson?: any;
  polygonAreaHa?: number | null;
}

export interface InfrastructureFacility {
  id: string;
  name: string;
  type: 'school' | 'kindergarten' | 'parking' | 'clinic';
  coordinates: [number, number]; // [lat, lng]
  totalCapacity: number; // Общая вместимость
  currentLoad: number | null; // Текущая загрузка (null если неизвестна)
  availableReserve: number | null; // max(capacity - load, 0) только если оба известны!
  qualityStatus: QualityStatus;
  provenance: QualityProvenance;
  source: string;
  sourceDate: string;
  isIncludedInScenario: boolean;
  notes?: string;
}

export interface ValidationIssue {
  field: keyof ModelInputs | string;
  message: string;
  severity: 'error' | 'warning';
}

export interface RecommendationItem {
  id: string;
  problem: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  recommendedStage: string;
  rationale: string;
  source: string;
  limitation: string;
}

export interface ApiCalculateResponseEnvelope {
  data: {
    inputs: ModelInputs;
    outputs: ModelOutputs;
    recommendations: RecommendationItem[];
  };
  meta: {
    modelVersion: string;
    calculationMode: CalculationMode;
    executionMode: 'local_adapter';
    timestamp: string;
    durationMs: number;
  };
  status: 'ok' | 'validation_error';
  sources: Array<{ name: string; type: string; version: string }>;
  confidence: {
    type: 'deterministic';
    note: 'Точность вычисления не означает подтверждённость исходных данных';
  };
  validationErrors?: ValidationIssue[];
}
