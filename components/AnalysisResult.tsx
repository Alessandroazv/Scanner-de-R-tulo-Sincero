
import React from 'react';
import { AnalysisResultData, Verdict } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface AnalysisResultProps {
  result: AnalysisResultData;
}

const VerdictDisplay: React.FC<{ verdict: Verdict }> = ({ verdict }) => {
  switch (verdict) {
    case Verdict.Approved:
      return (
        <div className="flex items-center gap-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
          <CheckCircleIcon className="w-12 h-12 text-green-400 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-green-400">APROVADO</h2>
            <p className="text-green-200">Pode levar, mas sem exageros.</p>
          </div>
        </div>
      );
    case Verdict.Moderation:
      return (
        <div className="flex items-center gap-4 p-4 bg-amber-900/50 border border-amber-500 rounded-lg">
          <ExclamationTriangleIcon className="w-12 h-12 text-amber-400 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-amber-400">COM MODERAÇÃO</h2>
            <p className="text-amber-200">Consuma com consciência, não é pra todo dia.</p>
          </div>
        </div>
      );
    case Verdict.Trap:
      return (
        <div className="flex items-center gap-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <XCircleIcon className="w-12 h-12 text-red-400 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-red-400">É CILADA, BINO!</h2>
            <p className="text-red-200">Devolve pra prateleira agora!</p>
          </div>
        </div>
      );
    default:
      return null;
  }
};


const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  return (
    <div className="space-y-6 bg-slate-800/50 p-6 rounded-lg">
      <VerdictDisplay verdict={result.verdict} />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-cyan-400 mb-2">A Verdade Nua e Crua</h3>
          <p className="text-slate-300 text-lg leading-relaxed">{result.truth}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-cyan-400 mb-2">Os Detalhes Sórdidos</h3>
          <ul className="space-y-2 list-inside">
            {result.details.map((detail, index) => (
              <li key={index} className="flex items-start text-slate-300">
                <span className="mr-3 text-xl">{detail.trim().split(' ')[0]}</span>
                <span className="flex-1">{detail.trim().substring(detail.trim().indexOf(' ') + 1)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
           <h3 className="text-lg font-bold text-cyan-400 mb-2">Conclusão do Nutri</h3>
          <p className="text-slate-300 italic p-4 border-l-4 border-cyan-500 bg-slate-700/50 rounded-r-lg">{result.conclusion}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
