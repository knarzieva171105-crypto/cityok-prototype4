export interface UrbanInputParams {
  siteAreaHa: number; // Площадь участка, га (по умолчанию 10)
  floors: number; // Этажность (по умолчанию 3)
  buildingRatio: number; // Коэффициент застройки (по умолчанию 0.4)
  avgApartmentArea: number; // Средняя площадь квартиры, м² (по умолчанию 55)
  familyRatio: number; // Коэф. семейственности, чел./кв. (по умолчанию 2.5)
  greeningNorm: number; // Норма озеленения, м²/чел. (по умолчанию 6)
  housingProvision: number; // Жилищная обеспеченность, м²/чел. (по умолчанию 30)
  shareKidsPreschool: number; // Доля детей 0-7 лет (по умолчанию 0.07)
  shareKidsSchool: number; // Доля детей 7-18 лет (по умолчанию 0.12)
  existingKindergartenPlaces: number; // Существующие места в садике (по умолчанию 0)
  existingSchoolPlaces: number; // Существующие места в школе (по умолчанию 0)
  existingParkingPlaces: number; // Существующие машиноместа (по умолчанию 0)
}

export interface UrbanCalculationResults {
  // 1. Площади и застройка
  buildingFootprintHa: number; // Площадь застройки (га) = Участок × Коэф. застройки
  buildingFootprintM2: number; // Площадь застройки (м²)
  totalHousingArea: number; // Общая площадь жилья (м²) = Площадь застройки × Этажность × 10000
  buildingDensity: number; // Плотность застройки (тыс. м²/га) = Общая площадь жилья / Участок / 1000
  buildingDensityOk: boolean; // Норматив Казань: <= 12 тыс. м²/га

  // 2. Население и квартиры
  apartmentsCount: number; // Количество квартир = Общая площадь / Средняя площадь квартиры
  population: number; // Численность населения = Количество квартир × Коэф. семейственности
  populationDensity: number; // Плотность населения (чел./га) = Население / Участок
  populationDensityOk: boolean; // Норматив: <= 210 чел./га

  // 3. Озеленение
  greeningArea: number; // Площадь озеленения (м²) = Население × Норма озеленения
  greeningProvision: number; // Обеспеченность озеленением (м²/чел.)
  greeningProvisionOk: boolean; // Норматив: >= 6 м²/чел.
  remainingPlotAreaM2: number; // Свободная территория участка под благоустройство (м²)

  // 4. Социальная инфраструктура
  requiredKindergartenPlaces: number; // Места в садике = Население × Доля 0-7 × 0.85 (85% охват)
  requiredSchoolPlaces: number; // Места в школе = Население × Доля 7-18 × 0.95 (95% охват)
  requiredParkingPermanent: number; // Машиноместа постоянные = Жилье / 80
  requiredParkingTemporary: number; // Машиноместа временные = Жилье / 560
  requiredParkingTotal: number; // Итого машиномест

  // 5. Дефицит инфраструктуры (Ключевая ценность СитиОК)
  deficitKindergarten: number; // Требуется - Существующее
  deficitSchool: number; // Требуется - Существующее
  deficitParking: number; // Постоянные требуемые - Существующие
  deficitParkingTotal: number; // Все требуемые - Существующие

  // Проценты покрытия
  coverageKindergartenPercent: number;
  coverageSchoolPercent: number;
  coverageParkingPercent: number;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  params: UrbanInputParams;
}
