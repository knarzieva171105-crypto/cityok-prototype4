import React, { useState } from 'react';
import { parseExcelTemplateFile, FileImportPreview } from '../../importExport/excelImport';
import { ModelInputs, Scenario } from '../../types/model';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyInputs: (inputs: ModelInputs, scenarioName?: string) => void;
  onImportFullScenario?: (scenario: Scenario) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onApplyInputs,
  onImportFullScenario,
}) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'json'>('excel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<FileImportPreview | null>(null);
  const [jsonText, setJsonText] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'excel') {
        const result = await parseExcelTemplateFile(file);
        setPreview(result);
      } else {
        const text = await file.text();
        setJsonText(text);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка чтения файла');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExcel = () => {
    if (preview && preview.modelInputsCandidate) {
      onApplyInputs(preview.modelInputsCandidate, `Импортированный сценарий (${preview.sheetName})`);
      onClose();
    }
  };

  const handleConfirmJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const scenario: Scenario = parsed.scenario || parsed;
      if (!scenario.inputs || typeof scenario.inputs.siteAreaHa !== 'number') {
        throw new Error('Некорректная структура JSON сценария');
      }
      if (onImportFullScenario) {
        onImportFullScenario(scenario);
      } else {
        onApplyInputs(scenario.inputs, scenario.name);
      }
      onClose();
    } catch (err: any) {
      setError(`Ошибка парсинга JSON: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Импорт данных в СитиОК</h3>
              <p className="text-xs text-slate-400">
                Загрузка параметров застройки из таблицы XLSX или JSON-сценария
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => { setActiveTab('excel'); setError(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'excel'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Таблица XLSX
          </button>
          <button
            onClick={() => { setActiveTab('json'); setError(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'json'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            JSON-сценарий
          </button>
        </div>

        {/* Tab 1: XLSX */}
        {activeTab === 'excel' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 text-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-amber-400 mx-auto" />
              <div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs transition-colors">
                  <span>Выбрать файл .xlsx</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Параметры застройки считываются автоматически. Все показатели ТЭП и балансы пересчитываются ядром СитиОК.
              </p>
            </div>

            {loading && <p className="text-amber-400 text-center">Чтение и валидация данных...</p>}

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Preview table */}
            {preview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    Распознанные параметры (лист: {preview.sheetName})
                  </span>
                  {preview.canImport ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Готово к импорту
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-semibold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Ошибки параметров
                    </span>
                  )}
                </div>

                {preview.validationIssues.length > 0 && (
                  <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg text-rose-300 space-y-1">
                    {preview.validationIssues.map((iss, i) => (
                      <div key={i}>• {iss}</div>
                    ))}
                  </div>
                )}

                <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-850 sticky top-0 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Параметр</th>
                        <th className="p-2">Исходное значение</th>
                        <th className="p-2 text-right">Распознано</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {Object.entries(preview.extractedValues).map(([key, item]) => (
                        <tr key={key} className="hover:bg-slate-800/30">
                          <td className="p-2 font-sans text-slate-300">{item.label}</td>
                          <td className="p-2 text-slate-400">{String(item.raw ?? '—')}</td>
                          <td className="p-2 text-right text-white font-bold">
                            {item.value !== null ? item.value : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleConfirmExcel}
                    disabled={!preview.canImport}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Применить в новый сценарий</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: JSON */}
        {activeTab === 'json' && (
          <div className="space-y-4 text-xs">
            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Вставьте JSON сценария СитиОК..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            />
            {error && <p className="text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmJson}
                disabled={!jsonText.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-colors"
              >
                Импортировать JSON
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
