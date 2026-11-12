import React, { useState } from 'react';
import { ModelInputs, ModelOutputs, Scenario } from '../../types/model';
import { getPresetExplanations } from '../../explanations/explainer';
import { X, HelpCircle, ChevronRight, FileCode, Info } from 'lucide-react';

interface ExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: ModelInputs;
  outputs: ModelOutputs;
  compareScenario?: Scenario | null;
}

export const ExplanationDrawer: React.FC<ExplanationDrawerProps> = ({
  isOpen,
  onClose,
  inputs,
  outputs,
  compareScenario,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('q_population_origin');

  if (!isOpen) return null;

  const explanations = getPresetExplanations(inputs, outputs, compareScenario);
  const current = explanations.find((e) => e.questionId === selectedQuestionId) || explanations[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-5 flex flex-col justify-between shadow-2xl overflow-y-auto text-slate-100">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Объяснение расчёта СитиОК</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Question Selector List */}
          <div className="my-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Частые методические вопросы:
            </span>
            {explanations.map((exp) => {
              const isSelected = exp.questionId === selectedQuestionId;
              return (
                <button
                  key={exp.questionId}
                  onClick={() => setSelectedQuestionId(exp.questionId)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{exp.question}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Current Answer Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-sm text-white">{current.question}</h4>
            
            <p className="text-amber-300 font-medium leading-relaxed bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              {current.shortSummary}
            </p>

            {current.formulaBlock && (
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">
                <div className="flex items-center gap-1 text-slate-400 font-sans">
                  <FileCode className="w-3 h-3 text-amber-400" />
                  <span>Формула:</span>
                </div>
                <div className="text-amber-300 font-bold">{current.formulaBlock.formula}</div>
                <div className="text-slate-400">{current.formulaBlock.calculation}</div>
                <div className="text-white font-bold pt-1 border-t border-slate-800 text-xs">
                  = {current.formulaBlock.result}
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Подробное обоснование:
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                {current.details.map((det, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {det}
                  </li>
                ))}
              </ul>
            </div>

            {current.notes && (
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{current.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
          <span>Детерминированный расчёт</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 text-xs font-semibold"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
