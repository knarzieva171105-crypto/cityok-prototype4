import * as XLSX from 'xlsx';
import { ModelInputs } from '../types/model';
import { DEFAULT_MODEL_INPUTS } from '../constants/modelConfig';
import { validateModelInputs } from '../validation/validator';

export interface FileImportPreview {
  sheetName: string;
  extractedValues: Record<string, { raw: any; value: number | null; label: string }>;
  validationIssues: string[];
  canImport: boolean;
  modelInputsCandidate: ModelInputs | null;
}

export async function parseExcelTemplateFile(file: File): Promise<FileImportPreview> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  // Use the first available sheet
  const sheetName = wb.SheetNames[0] || 'Лист1';
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    throw new Error('Книга не содержит доступных листов для чтения');
  }

  const getCellValue = (cellAddress: string): any => {
    const cell = ws[cellAddress];
    if (!cell) return undefined;
    return cell.v;
  };

  const toNumber = (val: any): number | null => {
    if (val === undefined || val === null || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  // Support reading standard positional cells or default fallback
  const rawSiteArea = getCellValue('C2') ?? getCellValue('B2');
  const rawFloors = getCellValue('C3') ?? getCellValue('B3');
  const rawCoverage = getCellValue('C4') ?? getCellValue('B4');
  const rawAvgArea = getCellValue('C5') ?? getCellValue('B5');
  const rawHousehold = getCellValue('C6') ?? getCellValue('B6');
  const rawGreening = getCellValue('C7') ?? getCellValue('B7');
  const rawProvision = getCellValue('C8') ?? getCellValue('B8');
  const rawKindergarten = getCellValue('C9') ?? getCellValue('B9');
  const rawSchool = getCellValue('C10') ?? getCellValue('B10');
  const rawParking = getCellValue('C11') ?? getCellValue('B11');
  const rawKids0to7 = getCellValue('E2') ?? getCellValue('B12');
  const rawKids7to18 = getCellValue('E3') ?? getCellValue('B13');

  const valSiteArea = toNumber(rawSiteArea);
  const valFloors = toNumber(rawFloors);
  const valCoverage = toNumber(rawCoverage);
  const valAvgArea = toNumber(rawAvgArea);
  const valHousehold = toNumber(rawHousehold);
  const valGreening = toNumber(rawGreening);
  const valProvision = toNumber(rawProvision);
  const valKindergarten = toNumber(rawKindergarten);
  const valSchool = toNumber(rawSchool);
  const valParking = toNumber(rawParking);
  const valKids0to7 = toNumber(rawKids0to7);
  const valKids7to18 = toNumber(rawKids7to18);

  const validationIssues: string[] = [];

  if (valSiteArea === null || valSiteArea <= 0) validationIssues.push('Площадь участка: требуется число > 0');
  if (valFloors === null || valFloors < 1) validationIssues.push('Этажность: требуется целое число ≥ 1');
  if (valCoverage === null || valCoverage <= 0 || valCoverage > 1) validationIssues.push('Коэффициент застройки: требуется число от 0 до 1');
  if (valAvgArea === null || valAvgArea <= 0) validationIssues.push('Средняя площадь квартиры: требуется число > 0');
  if (valHousehold === null || valHousehold <= 0) validationIssues.push('Семейственность: требуется число > 0');
  if (valProvision === null || valProvision <= 0) validationIssues.push('Жилищная обеспеченность: требуется число > 0');

  let candidate: ModelInputs | null = null;
  const canImport = validationIssues.length === 0;

  if (canImport) {
    candidate = {
      ...DEFAULT_MODEL_INPUTS,
      siteAreaHa: valSiteArea!,
      floors: Math.round(valFloors!),
      buildingCoverage: valCoverage!,
      averageApartmentAreaM2: valAvgArea!,
      householdSize: valHousehold!,
      greeningNorm: valGreening ?? DEFAULT_MODEL_INPUTS.greeningNorm,
      housingProvisionM2PerPerson: valProvision!,
      existingKindergarten: {
        value: valKindergarten ?? 0,
        qualityStatus: valKindergarten !== null ? 'estimate' : 'no_data',
        provenance: 'assumption',
        sourceNotes: 'Импортировано из таблицы данных',
      },
      existingSchool: {
        value: valSchool ?? 0,
        qualityStatus: valSchool !== null ? 'estimate' : 'no_data',
        provenance: 'assumption',
        sourceNotes: 'Импортировано из таблицы данных',
      },
      existingParkingPermanent: {
        value: valParking ?? 0,
        qualityStatus: valParking !== null ? 'estimate' : 'no_data',
        provenance: 'assumption',
        sourceNotes: 'Импортировано из таблицы данных',
      },
      childSharePreschool: valKids0to7 ?? DEFAULT_MODEL_INPUTS.childSharePreschool,
      childShareSchool: valKids7to18 ?? DEFAULT_MODEL_INPUTS.childShareSchool,
    };

    const inputVal = validateModelInputs(candidate);
    if (!inputVal.isValid) {
      inputVal.issues.forEach((iss) => validationIssues.push(`${iss.field}: ${iss.message}`));
    }
  }

  return {
    sheetName,
    extractedValues: {
      siteAreaHa: { raw: rawSiteArea, value: valSiteArea, label: 'Площадь участка, га' },
      floors: { raw: rawFloors, value: valFloors, label: 'Этажность' },
      buildingCoverage: { raw: rawCoverage, value: valCoverage, label: 'Коэффициент застройки' },
      averageApartmentAreaM2: { raw: rawAvgArea, value: valAvgArea, label: 'Средняя площадь квартиры, м²' },
      householdSize: { raw: rawHousehold, value: valHousehold, label: 'Семейственность' },
      greeningNorm: { raw: rawGreening, value: valGreening, label: 'Норматив озеленения' },
      housingProvisionM2PerPerson: { raw: rawProvision, value: valProvision, label: 'Жилищная обеспеченность' },
      existingKindergarten: { raw: rawKindergarten, value: valKindergarten, label: 'Места в детсаду' },
      existingSchool: { raw: rawSchool, value: valSchool, label: 'Места в школе' },
      existingParkingPermanent: { raw: rawParking, value: valParking, label: 'Постоянные машиноместа' },
      childSharePreschool: { raw: rawKids0to7, value: valKids0to7, label: 'Доля детей 0–7 лет' },
      childShareSchool: { raw: rawKids7to18, value: valKids7to18, label: 'Доля детей 7–18 лет' },
    },
    validationIssues,
    canImport: validationIssues.length === 0 && candidate !== null,
    modelInputsCandidate: candidate,
  };
}
