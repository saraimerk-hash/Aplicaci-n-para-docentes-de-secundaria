import React from 'react';
import { UserProgress, Badge } from '../types';
import { Award, Printer, X, CheckCircle2, GraduationCap, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  badges: Badge[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  progress,
  badges,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const unlockedList = badges.filter((b) => progress.unlockedBadges.includes(b.id));

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print-bg">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden relative my-auto">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 text-white p-4 flex items-center justify-between no-print border-b border-sky-400/30">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-300" />
            <span className="font-extrabold text-sm text-white">Vista Previa de Certificado MOVA</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DIPLOMA AREA */}
        <div
          id="printable-certificate"
          className="p-8 sm:p-12 bg-sky-50/40 border-[12px] border-sky-900 m-4 sm:m-6 rounded-lg text-slate-900 relative shadow-inner font-serif"
        >
          {/* Decorative Corner Seals */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-sky-600"></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-sky-600"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-sky-600"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-sky-600"></div>

          {/* Certificate Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex items-center justify-center gap-2 text-sky-900">
              <GraduationCap className="w-10 h-10 text-sky-700" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-sky-950">
              INSTITUCIÓN EDUCATIVA MOVA
            </h3>
            <p className="text-xs sm:text-sm font-sans font-bold text-sky-800 uppercase tracking-wider">
              Medellín, Colombia • Área de Idiomas Extranjeros (Inglés)
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 via-sky-600 to-amber-400 mx-auto rounded-full my-3"></div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-amber-900 font-serif tracking-wide pt-2">
              CERTIFICADO DE EXCELENCIA EN SPELLING
            </h2>
          </div>

          {/* Body Content */}
          <div className="text-center space-y-6 my-8 max-w-2xl mx-auto">
            <p className="text-sm sm:text-base font-sans italic text-slate-700">
              El área de inglés de la I.E. MOVA otorga con orgullo el presente reconocimiento a:
            </p>

            <div className="py-2 border-b-2 border-indigo-950">
              <span className="text-3xl sm:text-5xl font-black text-indigo-950 font-serif tracking-wide block capitalize">
                {progress.studentName || 'Estudiante de Grado 6°'}
              </span>
            </div>

            <p className="text-sm sm:text-base font-sans text-slate-800 leading-relaxed">
              Por su destacada participación, esfuerzo y superación exitosa de los 5 niveles pedagógicos del programa
              <strong className="text-indigo-950"> "Spelling Quest"</strong> (120 minutos de inmersión en vocabulario,
              dictado y deletreo en inglés).
            </p>

            {/* Achievements Summary Box */}
            <div className="bg-white/80 border border-amber-300 rounded-xl p-4 font-sans grid grid-cols-2 sm:grid-cols-3 gap-3 text-center my-6 shadow-sm">
              <div>
                <div className="text-2xl font-black text-indigo-900">{progress.xp}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Puntos XP Obtenidos</div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-600">{unlockedList.length} / {badges.length}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Insignias Desbloqueadas</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-2xl font-black text-emerald-600">Grado 6°</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Nivel Alcanzado</div>
              </div>
            </div>

            {/* Badges Earned Icons */}
            {unlockedList.length > 0 && (
              <div className="font-sans">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Logros Reconocidos:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {unlockedList.map((b) => (
                    <span key={b.id} className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      <span>{b.icon}</span> {b.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Signatures & Footer */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 items-end text-center font-sans">
            
            {/* Teacher Signature */}
            <div className="space-y-1">
              <div className="h-12 flex items-end justify-center">
                <span className="font-serif italic text-lg text-indigo-950 border-b border-slate-900 px-6 pb-1">
                  José Jorge Muñoz
                </span>
              </div>
              <p className="text-xs font-extrabold text-slate-800 uppercase">José Jorge Muñoz</p>
              <p className="text-[11px] font-semibold text-slate-500">Docente de Inglés • I.E. MOVA</p>
            </div>

            {/* Date & Official Stamp */}
            <div className="space-y-1">
              <div className="flex justify-center mb-1">
                <ShieldCheck className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-xs font-bold text-slate-700">Medellín, {formattedDate}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                Validez Pedagógica Institucional
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
