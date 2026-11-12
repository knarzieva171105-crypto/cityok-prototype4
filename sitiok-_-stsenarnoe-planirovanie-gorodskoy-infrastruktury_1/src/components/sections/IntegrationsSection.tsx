import React, { useState } from 'react';
import { ModelInputs, ApiCalculateResponseEnvelope } from '../../types/model';
import { executeCalculateApi, PLANNED_API_ENDPOINTS } from '../../apiAdapter/adapter';
import {
  Terminal,
  Play,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Server,
  Network,
} from 'lucide-react';

interface IntegrationsSectionProps {
  currentInputs: ModelInputs;
}

export const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({ currentInputs }) => {
  const [requestJson, setRequestJson] = useState(() => JSON.stringify(currentInputs, null, 2));
  const [response, setResponse] = useState<ApiCalculateResponseEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExecute = async () => {
    setParseError(null);
    setLoading(true);

    try {
      const payload: ModelInputs = JSON.parse(requestJson);
      const res = await executeCalculateApi(payload, 120);
      setResponse(res);
    } catch (e: any) {
      setParseError(`Ошибка в синтаксисе JSON запроса: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetToCurrent = () => {
    setRequestJson(JSON.stringify(currentInputs, null, 2));
    setParseError(null);
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Раздел 7. Интеграции и API-first архитектура
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Интеграционный контракт СитиОК для ГИСОГД, муниципальных геопорталов и BIM/CAD-систем
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              Режим: Локальный адаптер API
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
          * Интерактивная консоль тестирует контракт расчётного ядра через локальный асинхронный адаптер <code className="text-amber-300">executeCalculateApi()</code>.
        </p>
      </div>

      {/* Main Request & Response Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        
        {/* Left: Request JSON Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                POST
              </span>
              <span className="text-xs font-mono font-bold text-white">/api/v1/calculate</span>
            </div>
            <button
              onClick={handleResetToCurrent}
              className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
            >
              Синхронизировать с текущим проектом
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1">
              Тело запроса (Request Payload JSON):
            </label>
            <textarea
              rows={14}
              value={requestJson}
              onChange={(e) => setRequestJson(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 leading-relaxed focus:border-amber-500 focus:outline-none"
            />
          </div>

          {parseError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {parseError}
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500">
              Строгая валидация типов данных
            </span>
            <button
              onClick={handleExecute}
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{loading ? 'Вычисление...' : 'Выполнить запрос'}</span>
            </button>
          </div>
        </div>

        {/* Right: Response JSON Viewer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Ответ API (Response Envelope)</span>
              {response && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  {response.status} · {response.meta.durationMs} мс
                </span>
              )}
            </div>

            {response && (
              <button
                onClick={handleCopyResponse}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </button>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1">
              Результат вызова (JSON-конверт):
            </label>
            <div className="w-full h-[360px] bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 overflow-y-auto leading-relaxed">
              {response ? (
                <pre>{JSON.stringify(response, null, 2)}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                  <Code2 className="w-8 h-8 mb-2 opacity-40" />
                  <p>Нажмите кнопку «Выполнить запрос», чтобы получить детерминированный ответ с полным набором ТЭП, балансов и рекомендаций.</p>
                </div>
              )}
            </div>
          </div>

          {response && (
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
              <span>{response.confidence.note}</span>
              <span className="font-mono">v: {response.meta.modelVersion}</span>
            </div>
          )}
        </div>

      </div>

      {/* Planned Endpoints Contract Documentation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-sm text-white">
              Спецификация проектируемого REST API платформы «СитиОК»
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            OpenAPI 3.1 Draft
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Контракты взаимодействия для интеграции расчётного ядра в контур региональных градостроительных систем (ГИСОГД).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Метод</th>
                <th className="p-2.5">Путь эндпоинта</th>
                <th className="p-2.5">Назначение</th>
                <th className="p-2.5 text-right">Статус реализации</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {PLANNED_API_ENDPOINTS.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ep.method === 'POST' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold text-slate-200">
                    {ep.path}
                  </td>
                  <td className="p-2.5 font-sans text-slate-400 text-[11px]">
                    {ep.description}
                  </td>
                  <td className="p-2.5 text-right font-sans">
                    {ep.status === 'active_local' ? (
                      <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Действует (локальный адаптер)
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">
                        Проектируемый
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
