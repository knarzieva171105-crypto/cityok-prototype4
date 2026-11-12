import React, { useState } from 'react';
import { UrbanInputParams } from '../types';
import { generateStreamlitPythonCode } from '../utils/calculations';
import { Copy, Check, Download, Terminal, PlayCircle } from 'lucide-react';

interface StreamlitCodeViewerProps {
  params: UrbanInputParams;
}

export const StreamlitCodeViewer: React.FC<StreamlitCodeViewerProps> = ({ params }) => {
  const [copied, setCopied] = useState(false);
  const pythonCode = generateStreamlitPythonCode(params);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cityok_streamlit_app.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Terminal className="w-5 h-5 text-orange-400" />
            Исходный код Python / Streamlit (MVP «СитиОК»)
          </h3>
          <p className="text-xs text-slate-400">
            Готовый исполняемый скрипт с st.metric, слайдерами и формулами из технического задания
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-orange-400" />}
            <span>{copied ? 'Скопировано!' : 'Копировать код'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Скачать app.py</span>
          </button>
        </div>
      </div>

      {/* Terminal run instructions */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <PlayCircle className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Быстрый запуск в локальном Python:</span>
        </div>
        <div className="bg-slate-900 px-3 py-1 rounded text-orange-300 border border-slate-800 selection:bg-orange-500">
          pip install streamlit pandas && streamlit run app.py
        </div>
      </div>

      {/* Code container */}
      <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
          <span>app.py (Streamlit Dashboard)</span>
          <span>Python 3.10+ · Streamlit</span>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-orange-500/30">
          <code>{pythonCode}</code>
        </pre>
      </div>
    </div>
  );
};
