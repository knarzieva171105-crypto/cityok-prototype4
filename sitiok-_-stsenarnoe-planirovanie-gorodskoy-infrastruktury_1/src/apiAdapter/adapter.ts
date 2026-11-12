import {
  ModelInputs,
  ApiCalculateResponseEnvelope,
} from '../types/model';
import { calculateModel } from '../calculationEngine/engine';
import { validateModelInputs } from '../validation/validator';
import { generateRecommendations } from '../recommendations/generator';
import { MODEL_METADATA } from '../constants/modelConfig';

/**
 * Local API Adapter interface
 * Simulates async server call with execution delay and strict envelope contract
 */
export async function executeCalculateApi(
  payload: ModelInputs,
  simulatedDelayMs: number = 80
): Promise<ApiCalculateResponseEnvelope> {
  const startTime = performance.now();

  // Async simulation
  if (simulatedDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, simulatedDelayMs));
  }

  const validation = validateModelInputs(payload);
  const durationMs = Math.round(performance.now() - startTime);

  if (!validation.isValid) {
    return {
      data: {
        inputs: payload,
        outputs: calculateModel(payload),
        recommendations: [],
      },
      meta: {
        modelVersion: MODEL_METADATA.version,
        calculationMode: payload.calculationMode,
        executionMode: 'local_adapter',
        timestamp: new Date().toISOString(),
        durationMs,
      },
      status: 'validation_error',
      sources: [
        {
          name: 'Градостроительные нормативы и правила планировки жилых зон',
          type: 'methodological_model',
          version: 'cityok-v2',
        },
      ],
      confidence: {
        type: 'deterministic',
        note: 'Точность вычисления не означает подтверждённость исходных данных',
      },
      validationErrors: validation.issues,
    };
  }

  const outputs = calculateModel(payload);
  const recommendations = generateRecommendations(payload, outputs);

  return {
    data: {
      inputs: payload,
      outputs,
      recommendations,
    },
    meta: {
      modelVersion: MODEL_METADATA.version,
      calculationMode: payload.calculationMode,
      executionMode: 'local_adapter',
      timestamp: new Date().toISOString(),
      durationMs,
    },
    status: 'ok',
    sources: [
      {
        name: 'Градостроительные нормативы и правила планировки жилых зон',
        type: 'methodological_model',
        version: 'cityok-v2',
      },
      {
        name: 'Нормативы градостроительного проектирования г. Казани (РНГП)',
        type: 'municipal_regulations',
        version: 'актуальная редакция',
      },
    ],
    confidence: {
      type: 'deterministic',
      note: 'Точность вычисления не означает подтверждённость исходных данных',
    },
  };
}

export interface PlannedApiEndpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  status: 'active_local' | 'designed_future';
  requestSample?: any;
  responseSample?: any;
}

export const PLANNED_API_ENDPOINTS: PlannedApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/v1/calculate',
    description: 'Расчёт ТЭП, баланса инфраструктуры и рекомендаций (реализован в локальном адаптере)',
    status: 'active_local',
  },
  {
    method: 'POST',
    path: '/api/v1/projects',
    description: 'Создание нового градостроительного проекта с географическими границами участка',
    status: 'designed_future',
  },
  {
    method: 'GET',
    path: '/api/v1/projects/{id}',
    description: 'Получение метаданных проекта, кадастрового номера и набора сценариев',
    status: 'designed_future',
  },
  {
    method: 'POST',
    path: '/api/v1/scenarios',
    description: 'Сохранение нового сценария застройки для проекта',
    status: 'designed_future',
  },
  {
    method: 'GET',
    path: '/api/v1/calculate/{job_id}',
    description: 'Асинхронное получение статуса долгосрочного пакетного расчёта градостроительных моделей',
    status: 'designed_future',
  },
  {
    method: 'GET',
    path: '/api/v1/infrastructure',
    description: 'Реестр верифицированных объектов образования, медицины и спорта с паспортами загрузки',
    status: 'designed_future',
  },
  {
    method: 'GET',
    path: '/api/v1/recommendations/{scenario_id}',
    description: 'Получение детализированного списка мероприятий КРТ и компенсационных мер',
    status: 'designed_future',
  },
  {
    method: 'GET',
    path: '/api/v1/report/{scenario_id}',
    description: 'Генерация официального PDF/XLSX градостроительного паспорта объекта',
    status: 'designed_future',
  },
];
