import React from 'react';
import { UserProgress, Badge, WordItem } from '../../types';
import { Award, Trophy, Sparkles, Printer, CheckCircle2, RotateCcw, Heart, Flame, BookOpen, GraduationCap } from 'lucide-react';

interface Phase5ResultsProps {
  progress: UserProgress;
  badges: Badge[];
  wordBank: WordItem[];
  onOpenCertificate: () => void;
  onRestartClass: () => void;
}

export const Phase5Results: React.FC<Phase5ResultsProps> = ({
  progress,
  badges,
  wordBank,
  onOpenCertificate,
  onRestartClass,
}) => {
  const unlockedBadges = badges.filter((b) => progress.unlockedBadges.includes(b.id));

  // Determine words to reinforce (words with mistake counts or non-mastered words)
  const mistakeWordIds = Object.keys(progress.mistakesCount);
  const wordsToReinforce = wordBank.filter(
    (w) => mistakeWordIds.includes(w.id) || !progress.learningMasteredIds.includes(w.id)
  ).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 rounded-3xl p-8 text-white card-shadow text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 bg-white/20 text-sky-50 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/30 shadow-xs">
          <GraduationCap className="w-4 h-4 text-amber-300" /> Fase 5 de 5 • Cierre y Resultados (10 Min)
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
          ¡Felicitaciones, {progress.studentName || 'Estudiante MOVA'}! 🎉
        </h2>

        <p className="text-sky-100 text-sm sm:text-base max-w-xl mx-auto font-medium">
          Has completado con éxito la sesión de 120 minutos de <strong>Spelling Quest</strong> en la I.E. MOVA con el docente <strong>José Jorge Muñoz</strong>.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        
        <div className="bg-white p-5 rounded-3xl border border-sky-100 card-shadow space-y-1">
          <Sparkles className="w-6 h-6 text-amber-500 mx-auto" />
          <div className="text-3xl font-black text-sky-950">{progress.xp}</div>
          <div className="text-[11px] font-bold text-sky-600 uppercase">Puntos XP Totales</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 card-shadow space-y-1">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto" />
          <div className="text-3xl font-black text-amber-600">
            {unlockedBadges.length} / {badges.length}
          </div>
          <div className="text-[11px] font-bold text-sky-600 uppercase">Insignias Desbloqueadas</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 card-shadow space-y-1">
          <Flame className="w-6 h-6 text-orange-500 mx-auto" />
          <div className="text-3xl font-black text-orange-600">{progress.maxStreak}</div>
          <div className="text-[11px] font-bold text-sky-600 uppercase">Mejor Racha</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 card-shadow space-y-1">
          <BookOpen className="w-6 h-6 text-sky-500 mx-auto" />
          <div className="text-3xl font-black text-sky-600">
            {progress.learningMasteredIds.length}
          </div>
          <div className="text-[11px] font-bold text-sky-600 uppercase">Palabras Dominadas</div>
        </div>

      </div>

      {/* Motivational Message */}
      <div className="bg-amber-500/10 border border-amber-300/40 p-6 rounded-3xl text-sky-950 space-y-2 card-shadow">
        <h4 className="text-base font-extrabold text-amber-900 flex items-center gap-2">
          🌟 Mensaje Motivacional Personalizado:
        </h4>
        <p className="text-sm font-medium text-sky-900 leading-relaxed">
          "Demostraste una excelente dedicación y perseverancia para aprender el deletreo y la pronunciación en inglés. ¡Continúa practicando cada día en el colegio MOVA!"
        </p>
      </div>

      {/* Badges Grid */}
      <div className="bg-white p-6 rounded-3xl border border-sky-100 card-shadow space-y-4">
        <h3 className="text-base font-black text-sky-950 flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-600" /> Tus Insignias y Logros Obtenidos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((badge) => {
            const isUnlocked = progress.unlockedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-amber-50/70 border-amber-200 text-sky-950 shadow-xs'
                    : 'bg-sky-50/50 border-sky-100 text-sky-400 opacity-60'
                }`}
              >
                <div className="text-3xl shrink-0 p-2 bg-white rounded-xl shadow-xs border border-sky-100">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-sky-950 flex items-center gap-1">
                    <span>{badge.title}</span>
                    {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />}
                  </h4>
                  <p className="text-[11px] text-sky-800 mt-0.5 font-medium">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Words to Reinforce */}
      {wordsToReinforce.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-sky-100 card-shadow space-y-3">
          <h3 className="text-base font-black text-sky-950 flex items-center gap-2">
            📌 Palabras Recomendadas para Repasar:
          </h3>
          <p className="text-xs text-sky-700 font-medium">
            Estas son palabras que puedes continuar practicando en casa o en la siguiente clase de inglés:
          </p>

          <div className="flex flex-wrap gap-2">
            {wordsToReinforce.map((w) => (
              <div key={w.id} className="bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-900 flex items-center gap-2">
                <span className="text-sky-600">{w.word}</span>
                <span className="text-sky-700 font-normal">({w.translation})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Call-to-Action */}
      <div className="bg-sky-900 text-white p-8 rounded-3xl shadow-md border border-sky-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-2xl font-black text-white">¡Obtén tu Certificado Oficial MOVA!</h3>
          <p className="text-xs text-sky-200">
            Imprime o guarda en PDF tu diploma firmado digitalmente por el docente José Jorge Muñoz.
          </p>
        </div>

        <button
          onClick={onOpenCertificate}
          className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-base rounded-2xl shadow-md flex items-center gap-2 shrink-0 transition-all hover:scale-105 cursor-pointer"
        >
          <Printer className="w-5 h-5" />
          <span>Generar Certificado Impreso</span>
        </button>
      </div>

    </div>
  );
};
