import { Scenario, ModelInputs } from '../types/model';
import { PRESET_SCENARIOS, DEFAULT_MODEL_INPUTS } from '../constants/modelConfig';

const STORAGE_KEY = 'cityok_scenarios_v2';
const ACTIVE_SCENARIO_KEY = 'cityok_active_scenario_id_v2';

export function loadScenariosFromStorage(): Scenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveScenariosToStorage(PRESET_SCENARIOS);
      return PRESET_SCENARIOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].inputs?.typology) {
      return parsed;
    }
    // If older format, refresh to new preset scenarios with typology and class
    saveScenariosToStorage(PRESET_SCENARIOS);
    return PRESET_SCENARIOS;
  } catch (e) {
    console.error('Failed to load scenarios from storage:', e);
    return PRESET_SCENARIOS;
  }
}

export function saveScenariosToStorage(scenarios: Scenario[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch (e) {
    console.error('Failed to save scenarios to storage:', e);
  }
}

export function loadActiveScenarioId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_SCENARIO_KEY);
    if (id) return id;
    return PRESET_SCENARIOS[0].id;
  } catch {
    return PRESET_SCENARIOS[0].id;
  }
}

export function saveActiveScenarioId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SCENARIO_KEY, id);
  } catch (e) {
    console.error('Failed to save active scenario id:', e);
  }
}

export function createNewScenario(
  name: string,
  description: string,
  inputs: ModelInputs = DEFAULT_MODEL_INPUTS
): Scenario {
  const newId = `scen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  return {
    id: newId,
    name,
    description,
    isBaseline: false,
    createdAt: now,
    updatedAt: now,
    inputs: { ...inputs },
  };
}

export function duplicateScenario(source: Scenario): Scenario {
  const clone = createNewScenario(
    `Копия: ${source.name}`,
    `Создано на основе сценария «${source.name}»`,
    source.inputs
  );
  if (source.polygonGeoJson) {
    clone.polygonGeoJson = source.polygonGeoJson;
    clone.polygonAreaHa = source.polygonAreaHa;
  }
  return clone;
}
