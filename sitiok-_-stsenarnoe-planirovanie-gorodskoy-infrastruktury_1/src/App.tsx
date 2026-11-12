import React, { useState, useMemo, useEffect } from 'react';
import {
  Scenario,
  ModelInputs,
  ModelOutputs,
} from './types/model';
import {
  DEFAULT_MODEL_INPUTS,
  PRESET_SCENARIOS,
  MODEL_METADATA,
} from './constants/modelConfig';
import { calculateModel } from './calculationEngine/engine';
import { generateRecommendations } from './recommendations/generator';
import {
  loadScenariosFromStorage,
  saveScenariosToStorage,
  loadActiveScenarioId,
  saveActiveScenarioId,
  createNewScenario,
  duplicateScenario,
} from './scenarioStorage/storage';
import { exportScenarioToExcel } from './importExport/excelExport';
import { exportScenarioToJson } from './importExport/jsonExport';

// Layout & Components
import { Header } from './components/layout/Header';
import { Sidebar, NavSection } from './components/layout/Sidebar';
import { ExplanationDrawer } from './components/layout/ExplanationDrawer';
import { WhyModal } from './components/shared/WhyModal';
import { ImportModal } from './components/shared/ImportModal';
import { PrintReportModal } from './components/shared/PrintReportModal';

// 7 Clean Section Views
import { OverviewSection } from './components/sections/OverviewSection';
import { SiteSection } from './components/sections/SiteSection';
import { DevelopmentSection } from './components/sections/DevelopmentSection';
import { InfrastructureSection } from './components/sections/InfrastructureSection';
import { ScenarioCompareSection } from './components/sections/ScenarioCompareSection';
import { ReportSection } from './components/sections/ReportSection';
import { IntegrationsSection } from './components/sections/IntegrationsSection';

export default function App() {
  // Scenarios state loaded from localStorage
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadScenariosFromStorage());
  const [activeScenarioId, setActiveScenarioId] = useState<string>(() => loadActiveScenarioId());
  const [activeSection, setActiveSection] = useState<NavSection>('overview');

  // Modals & Drawers state
  const [whyMetricKey, setWhyMetricKey] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isExplanationDrawerOpen, setIsExplanationDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync scenarios to storage
  useEffect(() => {
    saveScenariosToStorage(scenarios);
  }, [scenarios]);

  // Sync active scenario ID
  useEffect(() => {
    saveActiveScenarioId(activeScenarioId);
  }, [activeScenarioId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Current active scenario
  const currentScenario = useMemo(() => {
    const found = scenarios.find((s) => s.id === activeScenarioId);
    return found || scenarios[0] || PRESET_SCENARIOS[0];
  }, [scenarios, activeScenarioId]);

  const baselineScenario = useMemo(() => {
    return scenarios.find((s) => s.isBaseline) || scenarios[0] || PRESET_SCENARIOS[0];
  }, [scenarios]);

  // Main Calculation Execution (Pure Engine)
  const outputs: ModelOutputs = useMemo(() => {
    return calculateModel(currentScenario.inputs);
  }, [currentScenario.inputs]);

  // Deterministic Recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(currentScenario.inputs, outputs);
  }, [currentScenario.inputs, outputs]);

  // Handler: Update inputs of active scenario
  const handleUpdateInput = <K extends keyof ModelInputs>(key: K, value: ModelInputs[K]) => {
    setScenarios((prev) =>
      prev.map((scen) => {
        if (scen.id !== currentScenario.id) return scen;
        return {
          ...scen,
          updatedAt: new Date().toISOString(),
          inputs: {
            ...scen.inputs,
            [key]: value,
          },
        };
      })
    );
  };

  // Handler: Adopt polygon area from map
  const handleAdoptPolygonArea = (areaHa: number) => {
    handleUpdateInput('siteAreaHa', areaHa);
    showToast(`Площадь участка обновлена до ${areaHa} га на основе геометрии контура`);
  };

  // Handler: Scenario Management
  const handleSelectScenario = (id: string) => {
    setActiveScenarioId(id);
    const scen = scenarios.find((s) => s.id === id);
    if (scen) {
      showToast(`Переключено на сценарий: «${scen.name}»`);
    }
  };

  const handleDuplicateScenario = (source: Scenario) => {
    const clone = duplicateScenario(source);
    setScenarios((prev) => [...prev, clone]);
    setActiveScenarioId(clone.id);
    showToast(`Создан сценарий: «${clone.name}»`);
  };

  const handleRenameScenario = (id: string, newName: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s))
    );
    showToast(`Сценарий переименован в: «${newName}»`);
  };

  const handleDeleteScenario = (id: string) => {
    if (scenarios.length <= 1) {
      showToast('Нельзя удалить единственный сценарий');
      return;
    }
    const remaining = scenarios.filter((s) => s.id !== id);
    setScenarios(remaining);
    if (activeScenarioId === id) {
      setActiveScenarioId(remaining[0].id);
    }
    showToast('Сценарий удалён');
  };

  const handleMakeBaseline = (id: string) => {
    setScenarios((prev) =>
      prev.map((s) => ({
        ...s,
        isBaseline: s.id === id,
      }))
    );
    showToast('Назначен новый базовый сценарий');
  };

  const handleResetScenarios = () => {
    setScenarios(PRESET_SCENARIOS);
    setActiveScenarioId(PRESET_SCENARIOS[0].id);
    showToast('Сценарии сброшены к стандартным');
  };

  const handleResetToBaseline = () => {
    setScenarios((prev) =>
      prev.map((scen) => {
        if (scen.id !== currentScenario.id) return scen;
        return {
          ...scen,
          updatedAt: new Date().toISOString(),
          inputs: { ...baselineScenario.inputs },
        };
      })
    );
    showToast(`Параметры сброшены к базовому сценарию («${baselineScenario.name}»)`);
  };

  const handleExportExcel = () => {
    exportScenarioToExcel(currentScenario, outputs);
    showToast('Таблица .xlsx сформирована и скачивается');
  };

  const handleExportJson = () => {
    exportScenarioToJson(currentScenario);
    showToast('Файл сценария .json сформирован и скачивается');
  };

  const handleApplyImportedInputs = (newInputs: ModelInputs, scenarioName?: string) => {
    const newScen = createNewScenario(
      scenarioName || `Импортированный (${new Date().toLocaleDateString('ru-RU')})`,
      'Создано на основе импорта параметров',
      newInputs
    );
    setScenarios((prev) => [...prev, newScen]);
    setActiveScenarioId(newScen.id);
    showToast('Параметры успешно импортированы в новый сценарий!');
  };

  const handleImportFullScenario = (importedScenario: Scenario) => {
    setScenarios((prev) => [...prev, importedScenario]);
    setActiveScenarioId(importedScenario.id);
    showToast(`Импортирован сценарий «${importedScenario.name}»`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-amber-400 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenPrintReport={() => setIsPrintReportOpen(true)}
      />

      {/* Workspace Area: Left Sidebar Navigation + Central Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Left Navigation Sidebar (7 Sections) */}
        <Sidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          onOpenExplanationsDrawer={() => setIsExplanationDrawerOpen(true)}
        />

        {/* Central Workspace Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          
          {/* Section 1: Обзор проекта */}
          {activeSection === 'overview' && (
            <OverviewSection
              scenario={currentScenario}
              inputs={currentScenario.inputs}
              outputs={outputs}
              recommendations={recommendations}
              onNavigateTo={setActiveSection}
              onResetToBaseline={handleResetToBaseline}
              onExportExcel={handleExportExcel}
              onOpenWhyModal={(key) => setWhyMetricKey(key)}
              onAdoptPolygonArea={handleAdoptPolygonArea}
            />
          )}

          {/* Section 2: Участок */}
          {activeSection === 'site' && (
            <SiteSection
              inputs={currentScenario.inputs}
              baselineInputs={baselineScenario.inputs}
              onUpdateInput={handleUpdateInput}
              onAdoptPolygonArea={handleAdoptPolygonArea}
              onOpenWhyModal={(key) => setWhyMetricKey(key)}
            />
          )}

          {/* Section 3: Застройка */}
          {activeSection === 'development' && (
            <DevelopmentSection
              inputs={currentScenario.inputs}
              baselineInputs={baselineScenario.inputs}
              outputs={outputs}
              onUpdateInput={handleUpdateInput}
              onOpenWhyModal={(key) => setWhyMetricKey(key)}
            />
          )}

          {/* Section 4: Инфраструктура */}
          {activeSection === 'infrastructure' && (
            <InfrastructureSection
              inputs={currentScenario.inputs}
              outputs={outputs}
              onUpdateInput={handleUpdateInput}
              onOpenWhyModal={(key) => setWhyMetricKey(key)}
            />
          )}

          {/* Section 5: Сравнение сценариев */}
          {activeSection === 'scenarios_compare' && (
            <ScenarioCompareSection
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSelectScenario={handleSelectScenario}
              onDuplicateScenario={handleDuplicateScenario}
              onRenameScenario={handleRenameScenario}
              onDeleteScenario={handleDeleteScenario}
              onMakeBaseline={handleMakeBaseline}
              onResetScenarios={handleResetScenarios}
            />
          )}

          {/* Section 6: Отчёт */}
          {activeSection === 'report' && (
            <ReportSection
              scenario={currentScenario}
              inputs={currentScenario.inputs}
              outputs={outputs}
              recommendations={recommendations}
              onExportExcel={handleExportExcel}
              onExportJson={handleExportJson}
              onOpenWhyModal={(key) => setWhyMetricKey(key)}
            />
          )}

          {/* Section 7: Интеграции */}
          {activeSection === 'integrations' && (
            <IntegrationsSection currentInputs={currentScenario.inputs} />
          )}

        </main>
      </div>

      {/* Modals and Drawers */}
      <WhyModal
        explanation={whyMetricKey ? outputs.explanations[whyMetricKey] || null : null}
        onClose={() => setWhyMetricKey(null)}
      />

      <ExplanationDrawer
        isOpen={isExplanationDrawerOpen}
        onClose={() => setIsExplanationDrawerOpen(false)}
        inputs={currentScenario.inputs}
        outputs={outputs}
        compareScenario={baselineScenario.id !== currentScenario.id ? baselineScenario : null}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApplyInputs={handleApplyImportedInputs}
        onImportFullScenario={handleImportFullScenario}
      />

      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        scenario={currentScenario}
        inputs={currentScenario.inputs}
        outputs={outputs}
        recommendations={recommendations}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <strong className="text-slate-300">СитиОК</strong> · Сценарное планирование городской инфраструктуры
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {MODEL_METADATA.constantNotice}
          </div>
        </div>
      </footer>

    </div>
  );
}
