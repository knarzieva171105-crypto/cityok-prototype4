import { Scenario, ModelOutputs } from '../types/model';
import { MODEL_METADATA } from '../constants/modelConfig';

export function exportScenarioToJson(scenario: Scenario): void {
  const payload = {
    meta: {
      app: MODEL_METADATA.name,
      subtitle: MODEL_METADATA.subtitle,
      version: MODEL_METADATA.version,
      exportedAt: new Date().toISOString(),
      territory: MODEL_METADATA.testTerritory,
    },
    scenario,
  };

  const str = JSON.stringify(payload, null, 2);
  const blob = new Blob([str], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cityok_scenario_${scenario.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTepToCsv(scenario: Scenario, outputs: ModelOutputs): void {
  const rows = [
    ['Показатель', 'Значение', 'Единица', 'Ориентир', 'Расчётная формула'],
    ['Площадь участка', scenario.inputs.siteAreaHa, 'га', '—', 'Входной параметр'],
    ['Этажность', scenario.inputs.floors, 'эт.', '—', 'Входной параметр'],
    ['Коэффициент застройки', scenario.inputs.buildingCoverage, 'доля', '—', 'Входной параметр'],
    ['Площадь застройки', outputs.buildingFootprintHa, 'га', '—', 'Площадь участка × Коэф. застройки'],
    ['Общая площадь жилья', outputs.totalHousingAreaM2, 'м²', '—', 'Площадь застройки × Этажность × 10 000'],
    ['Плотность застройки', outputs.buildingDensityThousandM2PerHa, 'тыс. м²/га', '<= 12.0', 'Площадь жилья / Площадь участка / 1000'],
    ['Количество квартир', outputs.apartmentsCount, 'кв.', '—', 'ROUND(Площадь жилья / Ср. площадь квартиры, 0)'],
    ['Численность населения', outputs.population, 'чел.', '—', scenario.inputs.calculationMode === 'housing_provision' ? 'Площадь жилья / Жилищная обеспеченность' : 'ROUND(Квартиры × Семейственность, 0)'],
    ['Плотность населения', outputs.populationDensityPerHa, 'чел./га', '<= 210.0', 'Население / Площадь участка'],
    ['Площадь озеленения', outputs.greeningAreaM2, 'м²', '—', 'Площадь участка × 10 000 × 0.25'],
    ['Обеспеченность озеленением', outputs.greeningProvisionM2PerPerson, 'м²/чел.', '>= 6.0', 'Площадь озеленения / Население'],
    ['Требуемые места в детсадах', outputs.requiredKindergartenPlaces, 'мест', 'до 350 на здание', 'ROUND(Население × Доля детей 0-7 × 0.85, 0)'],
    ['Требуемые места в школах', outputs.requiredSchoolPlaces, 'мест', 'от 500 на здание', 'ROUND(Население × Доля детей 7-18 × 0.95, 0)'],
    ['Требуемые постоянные машиноместа', outputs.requiredParkingPermanent, 'м/м', '1 на 80 м²', 'ROUND(Площадь жилья / 80, 0)'],
    ['Требуемые временные машиноместа', outputs.requiredParkingTemporary, 'м/м', '1 на 560 м²', 'ROUND(Площадь жилья / 560, 0)'],
    ['Поликлиническое обслуживание', outputs.requiredClinicVisitsPerShift, 'посещений в смену', '6 на 10 000 м²', 'ROUND(Площадь жилья / 10 000 × 6, 0)'],
    ['Баланс мест в детсадах', outputs.rawBalanceKindergarten ?? 'нет данных', 'мест', '—', 'Спрос ДОО - Существующий резерв'],
    ['Баланс мест в школах', outputs.rawBalanceSchool ?? 'нет данных', 'мест', '—', 'Спрос СОШ - Существующий резерв'],
    ['Баланс постоянных парковок', outputs.rawBalanceParkingPermanent ?? 'нет данных', 'м/м', '—', 'Спрос парковок - Существующий резерв'],
  ];

  const csvContent =
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            if (str.includes(';') || str.includes('\n') || str.includes('"')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(';')
      )
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cityok_tep_${scenario.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
