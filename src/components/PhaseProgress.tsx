import React from 'react';
import { PhaseId } from '../types';
import { CheckCircle2, Circle, Lock, Zap } from 'lucide-react';

interface PhaseProgressProps {
  currentPhase: PhaseId;
  onSelectPhase: (phaseId: PhaseId) => void;
  diagnosticCompleted: boolean;
  bossDefeated: boolean;
}

const PHASES = [
  { id: 1 as PhaseId, name: 'Fase 1: Diagnóstico', time: '10 min', desc: 'Calibración inicial' },
  { id: 2 as PhaseId, name: 'Fase 2: Vocabulario', time: '30 min', desc: 'Aprendizaje guiado' },
  { id: 3 as PhaseId, name: 'Fase 3: Práctica', time: '50 min', desc: '3 Mini-juegos' },
  { id: 4 as PhaseId, name: 'Fase 4: Boss Battle', time: '20 min', desc: 'Desafío final' },
  { id: 5 as PhaseId, name: 'Fase 5: Resultados', time: '10 min', desc: 'Insignias y certificado' },
];

export const PhaseProgress: React.FC<PhaseProgressProps> = ({
  currentPhase,
  onSelectPhase,
  diagnosticCompleted,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-sky-100 py-3 px-4 shadow-sm no-print">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Ruta Pedagógica de la Clase (120 Minutos)
          </span>
          <span className="text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200 shadow-xs">
            Fase Actual: {currentPhase} de 5
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PHASES.map((p) => {
            const isActive = currentPhase === p.id;
            const isCompleted = p.id < currentPhase || (p.id === 1 && diagnosticCompleted);
            const isLocked = p.id > 1 && !diagnosticCompleted && currentPhase < p.id;

            return (
              <button
                key={p.id}
                onClick={() => !isLocked && onSelectPhase(p.id)}
                disabled={isLocked}
                className={`step-node flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-md ring-2 ring-sky-300 ring-offset-1'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100/80 shadow-xs'
                    : isLocked
                    ? 'bg-sky-50/50 text-sky-300 border-sky-100 cursor-not-allowed opacity-60'
                    : 'bg-white text-sky-900 border-sky-100 hover:border-sky-300 hover:bg-sky-50/50 shadow-xs'
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-sky-300" />
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full bg-white text-sky-600 flex items-center justify-center font-black text-xs shadow-xs">
                      {p.id}
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-sky-300" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold truncate leading-tight">{p.name}</div>
                  <div className={`text-[10px] ${isActive ? 'text-sky-100' : 'text-sky-600'}`}>
                    ⏱️ {p.time} • {p.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
