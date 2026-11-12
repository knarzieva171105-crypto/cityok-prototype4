import { describe, it, expect } from 'vitest';
import { calculateModel, roundModel } from './engine';
import { DEFAULT_MODEL_INPUTS, PRESET_SCENARIOS, SYNTHETIC_DEMO_FACILITIES } from '../constants/modelConfig';
import { ModelInputs } from '../types/model';

describe('CityOK Calculation Engine — Verification of Mathematical Core', () => {
  it('1. Базовый сценарий точно совпадает с контрольными градостроительными значениями', () => {
    const res = calculateModel(DEFAULT_MODEL_INPUTS);

    expect(res.buildingFootprintHa).toBe(4);
    expect(res.totalHousingAreaM2).toBe(120000);
    expect(res.buildingDensityThousandM2PerHa).toBe(12);
    expect(res.apartmentsCount).toBe(2182);
    expect(res.population).toBe(4000);
    expect(res.populationDensityPerHa).toBe(400);
    expect(res.greeningAreaM2).toBe(25000);
    expect(res.greeningProvisionM2PerPerson).toBe(6.25);
    expect(res.requiredKindergartenPlaces).toBe(238);
    expect(res.requiredSchoolPlaces).toBe(456);
    expect(res.requiredParkingPermanent).toBe(1500);
    expect(res.requiredParkingTemporary).toBe(214);
    expect(res.requiredClinicVisitsPerShift).toBe(72);

    // Балансы при нулевом существующем резерве
    expect(res.rawBalanceKindergarten).toBe(238);
    expect(res.rawBalanceSchool).toBe(456);
    expect(res.rawBalanceParkingPermanent).toBe(1500);

    // UI-показатели
    expect(res.unmetKindergarten).toBe(238);
    expect(res.remainingReserveKindergarten).toBe(0);

    // Жилищная обеспеченность домохозяйства
    expect(res.alternativeHousingProvision).toBe(22);
  });

  it('2. Рост этажности с 3 до 5 увеличивает площадь жилья и население', () => {
    const base = calculateModel(DEFAULT_MODEL_INPUTS);
    const higherFloors = calculateModel({
      ...DEFAULT_MODEL_INPUTS,
      floors: 5,
    });

    expect(higherFloors.totalHousingAreaM2).toBe(200000);
    expect(higherFloors.totalHousingAreaM2).toBeGreaterThan(base.totalHousingAreaM2);
    expect(higherFloors.population).toBeGreaterThan(base.population);
    expect(higherFloors.requiredKindergartenPlaces).toBeGreaterThan(base.requiredKindergartenPlaces);
    expect(higherFloors.requiredSchoolPlaces).toBeGreaterThan(base.requiredSchoolPlaces);
  });

  it('3. Изменение семейственности НЕ меняет население в режиме жилищной обеспеченности', () => {
    const base = calculateModel(DEFAULT_MODEL_INPUTS);
    const changedHousehold = calculateModel({
      ...DEFAULT_MODEL_INPUTS,
      householdSize: 3.5, // было 2.5
      calculationMode: 'housing_provision',
    });

    // Население по формуле: 120000 / 30 = 4000
    expect(changedHousehold.population).toBe(base.population);
    expect(changedHousehold.population).toBe(4000);
    // Но альтернативная обеспеченность E6 меняется
    expect(changedHousehold.alternativeHousingProvision).toBe(roundModel(55 / 3.5, 2));
  });

  it('4. В режиме семейственности этот параметр влияет на население', () => {
    const householdMode2_5 = calculateModel({
      ...DEFAULT_MODEL_INPUTS,
      householdSize: 2.5,
      calculationMode: 'household_size',
    });
    // ROUND(2182 * 2.5, 0) = ROUND(5455, 0) = 5455
    expect(householdMode2_5.population).toBe(5455);

    const householdMode3_0 = calculateModel({
      ...DEFAULT_MODEL_INPUTS,
      householdSize: 3.0,
      calculationMode: 'household_size',
    });
    // ROUND(2182 * 3.0, 0) = 6546
    expect(householdMode3_0.population).toBe(6546);
    expect(householdMode3_0.population).toBeGreaterThan(householdMode2_5.population);
  });

  it('5. Изменение средней площади квартиры меняет количество квартир, но не население в режиме жил. обеспеченности', () => {
    const base = calculateModel(DEFAULT_MODEL_INPUTS);
    const largerApartments = calculateModel({
      ...DEFAULT_MODEL_INPUTS,
      averageApartmentAreaM2: 75, // было 55
      calculationMode: 'housing_provision',
    });

    // Квартиры уменьшились: 120000 / 75 = 1600
    expect(largerApartments.apartmentsCount).toBe(1600);
    expect(largerApartments.apartmentsCount).toBeLessThan(base.apartmentsCount);
    // Население осталось прежним: 120000 / 30 = 4000
    expect(largerApartments.population).toBe(4000);
  });

  it('6. Увеличение резерва снижает баланс потребности (сценарий с инфраструктурой)', () => {
    const scenarioInputs = PRESET_SCENARIOS.find((s) => s.id === 'scenario_with_infrastructure')!.inputs;
    const res = calculateModel(scenarioInputs);

    // В сценарии: резерв ДОО 150, СОШ 300, парковок 500
    // Баланс детсада = 238 - 150 = 88
    expect(res.rawBalanceKindergarten).toBe(88);
    expect(res.unmetKindergarten).toBe(88);

    // Баланс школы = 456 - 300 = 156
    expect(res.rawBalanceSchool).toBe(156);
    expect(res.unmetSchool).toBe(156);

    // Баланс парковок = 1500 - 500 = 1000
    expect(res.rawBalanceParkingPermanent).toBe(1000);
    expect(res.unmetParkingPermanent).toBe(1000);
  });

  it('7. Резерв выше спроса даёт отрицательный исходный баланс, нулевую неудовлетворённую потребность и положительный остаток резерва', () => {
    const surplusInputs: ModelInputs = {
      ...DEFAULT_MODEL_INPUTS,
      existingKindergarten: {
        value: 300, // Спрос 238
        qualityStatus: 'estimate',
        provenance: 'assumption',
      },
    };
    const res = calculateModel(surplusInputs);

    // Отрицательный исходный баланс не обрезается: 238 - 300 = -62
    expect(res.rawBalanceKindergarten).toBe(-62);
    // Неудовлетворенная потребность = 0
    expect(res.unmetKindergarten).toBe(0);
    // Остаток учтенного резерва = 62
    expect(res.remainingReserveKindergarten).toBe(62);
  });

  it('8. При no_data итоговый дефицит равен null, не нулю', () => {
    const noDataInputs: ModelInputs = {
      ...DEFAULT_MODEL_INPUTS,
      existingSchool: {
        value: null,
        qualityStatus: 'no_data',
        provenance: 'assumption',
      },
    };
    const res = calculateModel(noDataInputs);

    expect(res.requiredSchoolPlaces).toBe(456);
    expect(res.rawBalanceSchool).toBeNull();
    expect(res.unmetSchool).toBeNull();
    expect(res.remainingReserveSchool).toBeNull();
  });

  it('9. Мощность без загрузки не считается свободным резервом (availableReserve = null)', () => {
    const facilityWithUnknownLoad = SYNTHETIC_DEMO_FACILITIES.find(
      (f) => f.id === 'syn_sch_unknown'
    )!;

    expect(facilityWithUnknownLoad.totalCapacity).toBe(600);
    expect(facilityWithUnknownLoad.currentLoad).toBeNull();
    expect(facilityWithUnknownLoad.availableReserve).toBeNull();
    expect(facilityWithUnknownLoad.qualityStatus).toBe('no_data');
  });

  it('10. Нулевые знаменатели блокируются (без NaN и Infinity)', () => {
    const zeroDivisorInputs: ModelInputs = {
      ...DEFAULT_MODEL_INPUTS,
      siteAreaHa: 0,
      averageApartmentAreaM2: 0,
      householdSize: 0,
      housingProvisionM2PerPerson: 0,
    };
    const res = calculateModel(zeroDivisorInputs);

    expect(isNaN(res.buildingDensityThousandM2PerHa)).toBe(false);
    expect(isFinite(res.buildingDensityThousandM2PerHa)).toBe(true);
    expect(isNaN(res.apartmentsCount)).toBe(false);
    expect(isFinite(res.apartmentsCount)).toBe(true);
    expect(isNaN(res.population)).toBe(false);
    expect(isFinite(res.population)).toBe(true);
  });

  it('11. Сохранение и восстановление сценария через JSON не меняют результат', () => {
    const original = calculateModel(DEFAULT_MODEL_INPUTS);
    const serialized = JSON.stringify(DEFAULT_MODEL_INPUTS);
    const restoredInputs: ModelInputs = JSON.parse(serialized);
    const restored = calculateModel(restoredInputs);

    expect(restored.totalHousingAreaM2).toBe(original.totalHousingAreaM2);
    expect(restored.population).toBe(original.population);
    expect(restored.requiredSchoolPlaces).toBe(original.requiredSchoolPlaces);
    expect(restored.rawBalanceKindergarten).toBe(original.rawBalanceKindergarten);
  });

  it('12. Синтетические демонстрационные объекты не имеют статус fact', () => {
    SYNTHETIC_DEMO_FACILITIES.forEach((facility) => {
      expect(facility.qualityStatus).not.toBe('fact');
      expect(facility.provenance).toBe('assumption');
    });
  });

  it('13. Промежуточное экранное форматирование не меняет внутреннюю точность', () => {
    const inputsWithFraction: ModelInputs = {
      ...DEFAULT_MODEL_INPUTS,
      siteAreaHa: 10.333333,
      buildingCoverage: 0.385,
    };
    const res = calculateModel(inputsWithFraction);

    expect(res.buildingFootprintHa).toBeCloseTo(3.9783, 3);
    expect(res.explanations.buildingFootprint.value).toBeCloseTo(3.9783, 3);
  });
});
