import React from 'react';
import { UserProgress } from '../types';
import { Sparkles, Heart, Flame, Settings, Volume2, VolumeX, GraduationCap, Award, PhoneCall } from 'lucide-react';

interface HeaderProps {
  progress: UserProgress;
  onUpdateFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  onOpenTeacherModal: () => void;
  onOpenCertificateModal: () => void;
  onOpenAICall: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onUpdateFontSize,
  onOpenTeacherModal,
  onOpenCertificateModal,
  onOpenAICall,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="bg-sky-900 text-white shadow-md border-b border-sky-800 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Institution & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-sky-500 to-blue-600 p-2.5 rounded-xl shadow-md border border-sky-300/30">
              <GraduationCap className="w-7 h-7 text-sky-50" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-sky-950/80 text-sky-200 font-bold px-2.5 py-0.5 rounded-md text-xs border border-sky-700 tracking-wider">
                  I.E. MOVA • Medellín
                </span>
                <span className="text-sky-300 text-xs flex items-center gap-1">
                  Docente: <strong className="text-white">José Jorge Muñoz</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-amber-300 to-amber-400">
                Spelling Quest 🔤
              </h1>
            </div>
          </div>

          {/* Player Stats & Controls */}
          <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 flex-wrap">
            
            {/* Student Name */}
            {progress.studentName && (
              <div className="bg-sky-800/90 px-3 py-1.5 rounded-xl border border-sky-700 flex items-center gap-2 shadow-inner">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center font-bold text-xs text-slate-950">
                  {progress.studentName.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-xs sm:text-sm text-sky-50 truncate max-w-[120px]">
                  {progress.studentName}
                </span>
              </div>
            )}

            {/* XP Badge */}
            <div className="bg-amber-500/20 border border-amber-400/40 text-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
              <span>{progress.xp} XP</span>
            </div>

            {/* Streak */}
            <div className="bg-orange-500/20 border border-orange-400/40 text-orange-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold text-sm shadow-sm">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>{progress.streak}</span>
            </div>

            {/* Hearts / Vidas */}
            <div className="bg-rose-500/20 border border-rose-400/40 text-rose-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold text-sm shadow-sm">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>{progress.hearts}</span>
            </div>

            {/* Font Size Toggle (DUA Accessibility) */}
            <div className="flex bg-sky-950/80 rounded-xl p-0.5 border border-sky-700 text-xs font-semibold">
              <button
                onClick={() => onUpdateFontSize('normal')}
                className={`px-2 py-1 rounded-lg transition-colors ${progress.fontSize === 'normal' ? 'bg-sky-500 text-white shadow-sm' : 'text-sky-300 hover:text-white'}`}
                title="Texto Normal"
              >
                A
              </button>
              <button
                onClick={() => onUpdateFontSize('large')}
                className={`px-2 py-1 rounded-lg text-sm transition-colors ${progress.fontSize === 'large' ? 'bg-sky-500 text-white shadow-sm' : 'text-sky-300 hover:text-white'}`}
                title="Texto Grande"
              >
                A+
              </button>
              <button
                onClick={() => onUpdateFontSize('xlarge')}
                className={`px-2 py-1 rounded-lg text-base transition-colors ${progress.fontSize === 'xlarge' ? 'bg-sky-500 text-white shadow-sm' : 'text-sky-300 hover:text-white'}`}
                title="Texto Extra Grande"
              >
                A++
              </button>
            </div>

            {/* AI Call Assistant Button */}
            <button
              onClick={onOpenAICall}
              className="p-2 sm:px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer animate-pulse"
              title="Llamada de Voz con Profe Virtual IA"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden sm:inline">Llamada IA</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-sky-800 hover:bg-sky-700 border border-sky-700 text-sky-200 transition-colors shadow-sm"
              title={soundEnabled ? 'Silenciar pronunciación' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-sky-400" />}
            </button>

            {/* Certificate Quick Button */}
            {progress.studentName && (
              <button
                onClick={onOpenCertificateModal}
                className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all flex items-center gap-1.5 text-xs font-black shadow-md hover:scale-105"
                title="Ver Certificado de la Sesión"
              >
                <Award className="w-4 h-4" />
                <span className="hidden lg:inline">Certificado</span>
              </button>
            )}

            {/* Teacher Settings Button */}
            <button
              onClick={onOpenTeacherModal}
              className="p-2 rounded-xl bg-sky-800 hover:bg-sky-700 border border-sky-700 text-sky-200 transition-colors shadow-sm"
              title="Ajustes Docente / Banco de Palabras"
            >
              <Settings className="w-4 h-4 text-sky-300" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
